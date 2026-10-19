import { NextResponse } from "next/server";
import { getVideoApiContext } from "@/lib/nas/video/auth";
import { connectVideoNas } from "@/lib/nas/video/client";
import { VIDEO_UUID_PATTERN } from "@/lib/nas/video/config";
import {
  validateVideoNasPath,
  toVideoStoragePath,
} from "@/lib/nas/video/path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { adminSupabase } = await getVideoApiContext();

    const body = await request.json().catch(() => null);
    const mediaId = body?.mediaId;
    const clientId = body?.clientId;

    if (
      typeof mediaId !== "string" ||
      typeof clientId !== "string" ||
      !VIDEO_UUID_PATTERN.test(mediaId) ||
      !VIDEO_UUID_PATTERN.test(clientId)
    ) {
      return NextResponse.json(
        { ok: false, error: "動画または顧客の指定が不正です" },
        { status: 400 }
      );
    }

    const { data: media, error: mediaError } = await adminSupabase
      .from("client_media")
      .select("id, client_id, storage_path, media_type")
      .eq("id", mediaId)
      .eq("client_id", clientId)
      .eq("media_type", "video")
      .maybeSingle();

    if (mediaError || !media) {
      return NextResponse.json(
        { ok: false, error: "対象の動画が見つかりません" },
        { status: 404 }
      );
    }

    const { data: upload, error: uploadError } = await adminSupabase
      .from("client_video_uploads")
      .select(
        "id, client_id, media_id, nas_path, status, lease_token"
      )
      .eq("media_id", mediaId)
      .eq("client_id", clientId)
      .eq("status", "completed")
      .maybeSingle();

    if (
      uploadError ||
      !upload ||
      upload.lease_token !== null ||
      upload.media_id !== mediaId ||
      !validateVideoNasPath(
        upload.nas_path,
        clientId,
        upload.id
      ) ||
      media.storage_path !==
        toVideoStoragePath(
          upload.nas_path,
          clientId,
          upload.id
        )
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "動画の保存情報を確認できないため、削除を中止しました",
        },
        { status: 409 }
      );
    }

    const nas = await connectVideoNas();

    if (!(await nas.exists(upload.nas_path))) {
      return NextResponse.json(
        {
          ok: false,
          error: "NASに動画が見つかりません。削除処理を中止しました",
        },
        { status: 409 }
      );
    }

    // 完全削除ではなくNASのゴミ箱へ移動する
    await nas.trash(upload.nas_path);

    // NAS移動成功後、DBの2テーブルを同一トランザクションで更新
    const { data: deleted, error: deleteError } =
      await adminSupabase.rpc(
        "delete_completed_client_video_registration",
        {
          p_media_id: mediaId,
          p_client_id: clientId,
          p_upload_id: upload.id,
        }
      );

    if (deleteError || deleted !== true) {
      console.error(
        "NAS video registration delete failed:",
        deleteError?.message || "unexpected RPC result",
        { mediaId, uploadId: upload.id }
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "NASのゴミ箱への移動は完了しましたが、カルテの更新に失敗しました。再操作せず管理者に確認してください",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
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

    console.error("NAS video delete failed:", message);

    return NextResponse.json(
      {
        ok: false,
        error:
          "動画の削除処理に失敗しました。再操作せず管理者に確認してください",
      },
      { status: 500 }
    );
  }
}
