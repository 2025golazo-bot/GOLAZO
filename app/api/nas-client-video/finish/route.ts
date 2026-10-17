import { NextResponse } from "next/server";
import { getVideoApiContext } from "@/lib/nas/video/auth";
import { VIDEO_UUID_PATTERN } from "@/lib/nas/video/config";
import { toVideoStoragePath } from "@/lib/nas/video/path";
import { connectVideoNas } from "@/lib/nas/video/client";
import { verifyNasVideoSha256 } from "@/lib/nas/video/hash";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { userId, adminSupabase } = await getVideoApiContext();

    const body = await request.json();
    const uploadId = body?.uploadId;

    if (
      typeof uploadId !== "string" ||
      !VIDEO_UUID_PATTERN.test(uploadId)
    ) {
      return NextResponse.json(
        { ok: false, error: "アップロードIDが不正です" },
        { status: 400 }
      );
    }

    const { data: upload, error } = await adminSupabase
      .from("client_video_uploads")
      .select("*")
      .eq("id", uploadId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !upload) {
      return NextResponse.json(
        { ok: false, error: "動画のアップロード情報が見つかりません" },
        { status: 404 }
      );
    }

    if (
      upload.status !== "uploading" ||
      upload.lease_token !== null ||
      upload.uploaded_bytes !== upload.file_size
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "動画の送信が完了していないか、処理中です",
        },
        { status: 409 }
      );
    }

    const storagePath = toVideoStoragePath(
      upload.nas_path,
      upload.client_id,
      upload.id
    );

    const { data: leaseToken, error: claimError } =
      await adminSupabase.rpc("claim_client_video_finish_token", {
        p_upload_id: uploadId,
        p_user_id: userId,
      });

    if (claimError || !leaseToken) {
      return NextResponse.json(
        {
          ok: false,
          error: "動画の保存完了処理を開始できません。処理中または確認が必要な状態です",
        },
        { status: 409 }
      );
    }

    const nas = await connectVideoNas();

    if (!(await nas.exists(upload.nas_path))) {
      return NextResponse.json(
        { ok: false, error: "NASに完成した動画が見つかりません" },
        { status: 409 }
      );
    }

    await verifyNasVideoSha256(
      nas,
      upload.nas_path,
      upload.file_size,
      upload.file_sha256
    );

    const { data: mediaId, error: completeError } =
      await adminSupabase.rpc("complete_client_video_upload", {
        p_upload_id: uploadId,
        p_user_id: userId,
        p_lease_token: leaseToken,
        p_storage_path: storagePath,
      });

    if (completeError || !mediaId) {
      console.error(
        "Video media registration failed:",
        completeError?.message || "missing media ID"
      );

      return NextResponse.json(
        {
          ok: false,
          error: "動画の検証は完了しましたが、顧客カルテへの登録に失敗しました。自動再送せず管理者に確認してください",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      ok: true,
      mediaId,
      storagePath,
    });
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

    console.error("Video finish failed:", message);

    return NextResponse.json(
      { ok: false, error: "動画の保存完了確認に失敗しました" },
      { status: 500 }
    );
  }
}
