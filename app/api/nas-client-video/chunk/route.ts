import { NextResponse } from "next/server";
import { getVideoApiContext } from "@/lib/nas/video/auth";
import { connectVideoNas } from "@/lib/nas/video/client";
import { getNasVideoProgress } from "@/lib/nas/video/progress";
import { validateVideoNasPath } from "@/lib/nas/video/path";
import { ensureVideoNasFolder } from "@/lib/nas/video/folder";
import {
  prepareVideoNasUpload,
  sendVideoNasChunk,
  verifyVideoNasChunk,
} from "@/lib/nas/video/transfer";
import {
  VIDEO_CHUNK_SIZE,
  VIDEO_UUID_PATTERN,
} from "@/lib/nas/video/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { userId, adminSupabase } = await getVideoApiContext();

    const uploadId = request.headers.get("x-video-upload-id");
    const offsetText = request.headers.get("x-video-offset");
    const contentLengthText = request.headers.get("content-length");

    if (!uploadId || !VIDEO_UUID_PATTERN.test(uploadId)) {
      return NextResponse.json(
        { ok: false, error: "アップロードIDが不正です" },
        { status: 400 }
      );
    }

    const offset = Number(offsetText);
    const contentLength = Number(contentLengthText);

    if (
      offsetText === null ||
      !Number.isSafeInteger(offset) ||
      offset < 0 ||
      contentLengthText === null ||
      !Number.isSafeInteger(contentLength) ||
      contentLength <= 0 ||
      contentLength > VIDEO_CHUNK_SIZE
    ) {
      return NextResponse.json(
        { ok: false, error: "動画の送信位置または容量が不正です" },
        { status: 413 }
      );
    }

    const { data: upload, error: dbError } = await adminSupabase
      .from("client_video_uploads")
      .select("id, user_id, client_id, nas_path, upload_uuid, file_size, uploaded_bytes, status, expires_at, created_at")
      .eq("id", uploadId)
      .eq("user_id", userId)
      .maybeSingle();

    if (dbError || !upload) {
      return NextResponse.json(
        { ok: false, error: "アップロード情報が見つかりません" },
        { status: 404 }
      );
    }

    if (
      new Date(upload.expires_at).getTime() <= Date.now() ||
      !["pending", "uploading"].includes(upload.status)
    ) {
      return NextResponse.json(
        { ok: false, error: "このアップロードは現在処理できません" },
        { status: 409 }
      );
    }

    if (
      offset !== upload.uploaded_bytes ||
      offset + contentLength > upload.file_size
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "動画の送信位置が一致しません",
          uploadedBytes: upload.uploaded_bytes,
        },
        { status: 409 }
      );
    }

    if (
      !validateVideoNasPath(
        upload.nas_path,
        upload.client_id,
        upload.id
      )
    ) {
      return NextResponse.json(
        { ok: false, error: "NASの動画保存先が不正です" },
        { status: 400 }
      );
    }

    const { data: claimed, error: claimError } = await adminSupabase
      .rpc("claim_client_video_chunk", {
        p_upload_id: uploadId,
        p_expected_offset: offset,
        p_user_id: userId,
      });

    if (claimError || !claimed?.[0]?.claimed || !claimed[0].token) {
      return NextResponse.json(
        {
          ok: false,
          error: "動画が処理中、または送信位置が変更されています。自動再送せず停止してください",
        },
        { status: 409 }
      );
    }

    const leaseToken = claimed[0].token;

    try {
      const bytes = new Uint8Array(await request.arrayBuffer());

      if (bytes.length !== contentLength) {
        throw new Error("実際の送信容量が一致しません");
      }

      const changeTime = Math.floor(
        new Date(upload.created_at).getTime() / 1000
      );

      if (!Number.isSafeInteger(changeTime) || changeTime <= 0) {
        throw new Error("動画の作成日時が不正です");
      }

      const nasLoginStart = Date.now();
      const nas = await connectVideoNas();

      console.info(
        "[VIDEO_TIMING] NAS login:",
        Date.now() - nasLoginStart,
        "ms",
        "offset:",
        offset
      );

      const folder = await ensureVideoNasFolder(
        nas,
        upload.nas_path,
        upload.client_id,
        upload.id
      );

      const filename = upload.nas_path.slice(
        upload.nas_path.lastIndexOf("/") + 1
      );

      if (offset === 0) {
        if (await nas.exists(upload.nas_path)) {
          throw new Error(
            "同名のNASファイルが既に存在します。上書きせず送信を中止します"
          );
        }

        const beforePrepare = await getNasVideoProgress(
          nas,
          folder,
          upload.upload_uuid,
          filename,
          upload.file_size
        );

        if (beforePrepare !== -1) {
          throw new Error(
            "NASに既存の一時アップロード情報があります。上書きせず停止します"
          );
        }

        await prepareVideoNasUpload(
          nas,
          folder,
          filename,
          upload.upload_uuid,
          upload.file_size,
          changeTime
        );
      }

      const nasBytes = await getNasVideoProgress(
        nas,
        folder,
        upload.upload_uuid,
        filename,
        upload.file_size
      );

      if (nasBytes !== offset) {
        throw new Error(
          "NASとSupabaseの送信済み容量が一致しません。管理者の確認が必要です"
        );
      }

      const nasSendStart = Date.now();

      await sendVideoNasChunk(
        nas,
        folder,
        filename,
        upload.upload_uuid,
        upload.file_size,
        offset,
        bytes,
        changeTime
      );

      console.info(
        "[VIDEO_TIMING] NAS chunk send:",
        Date.now() - nasSendStart,
        "ms",
        "offset:",
        offset
      );

      const nasVerifyStart = Date.now();

      if (offset + bytes.length === upload.file_size) {
        // 最終チャンクではNASの一時アップロード情報が
        // 削除される場合があるため、完成ファイルを確認する。
        if (!(await nas.exists(upload.nas_path))) {
          throw new Error(
            "NASに完成した動画ファイルを確認できません"
          );
        }

        const savedFile = await nas.stat(upload.nas_path);

        if (
          !savedFile ||
          Number(savedFile.size) !== upload.file_size
        ) {
          throw new Error(
            "NASに保存された動画の容量が一致しません"
          );
        }
      } else {
        await verifyVideoNasChunk(
          nas,
          folder,
          filename,
          upload.upload_uuid,
          upload.file_size,
          offset + bytes.length
        );
      }

      console.info(
        "[VIDEO_TIMING] NAS chunk verify:",
        Date.now() - nasVerifyStart,
        "ms",
        "offset:",
        offset
      );

      const { data: completed, error: completeError } =
        await adminSupabase.rpc("complete_client_video_chunk", {
          p_upload_id: uploadId,
          p_token: leaseToken,
          p_expected_offset: offset,
          p_chunk_size: bytes.length,
          p_user_id: userId,
        });

      if (completeError || !completed?.[0]?.completed) {
        throw new Error(
          "NASへの送信後に進行状況の更新が失敗しました。管理者の確認が必要です"
        );
      }

      return NextResponse.json({
        ok: true,
        uploadedBytes: completed[0].uploaded_bytes,
        totalBytes: upload.file_size,
      });
    } catch (sendError) {
      console.error(
        "Video chunk transfer stopped:",
        sendError instanceof Error ? sendError.message : "unknown"
      );

      return NextResponse.json(
        {
          ok: false,
          error: "動画送信を安全のため停止しました。自動再送はせず、管理者に確認してください",
        },
        { status: 409 }
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (message === "UNAUTHORIZED") {
      return NextResponse.json(
        { ok: false, error: "ログインが必要です" },
        { status: 401 }
      );
    }

    if (message === "FORBIDDEN") {
      return NextResponse.json(
        { ok: false, error: "アクセス権限がありません" },
        { status: 403 }
      );
    }

    console.error("Video chunk validation failed:", message);

    return NextResponse.json(
      { ok: false, error: "動画の送信準備に失敗しました" },
      { status: 500 }
    );
  }
}
