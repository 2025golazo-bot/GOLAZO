import { NextRequest, NextResponse } from "next/server";
import { getVideoApiContext } from "@/lib/nas/video/auth";
import { VIDEO_UUID_PATTERN } from "@/lib/nas/video/config";
import { validateVideoNasPath } from "@/lib/nas/video/path";
import { connectVideoNas } from "@/lib/nas/video/client";
import { getNasVideoProgress } from "@/lib/nas/video/progress";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { userId, adminSupabase } = await getVideoApiContext();

    const uploadId = request.nextUrl.searchParams.get("uploadId");

    if (!uploadId || !VIDEO_UUID_PATTERN.test(uploadId)) {
      return NextResponse.json(
        { ok: false, error: "アップロードIDが不正です" },
        { status: 400 }
      );
    }

    const { data: upload, error } = await adminSupabase
      .from("client_video_uploads")
      .select("id, client_id, nas_path, upload_uuid, file_size, uploaded_bytes, status, media_id, lease_token, updated_at")
      .eq("id", uploadId)
      .eq("user_id", userId)
      .maybeSingle();

    if (
      error ||
      !upload ||
      !validateVideoNasPath(upload.nas_path, upload.client_id, upload.id)
    ) {
      return NextResponse.json(
        { ok: false, error: "動画のアップロード情報を確認できません" },
        { status: 404 }
      );
    }

    let nasUploadedBytes: number | null = null;
    let nasCheckError = false;
    let nasNotStarted = false;

    if (
      upload.status !== "completed" &&
      upload.uploaded_bytes < upload.file_size
    ) {
      try {
        const nas = await connectVideoNas();
        const slash = upload.nas_path.lastIndexOf("/");
        const folder = upload.nas_path.slice(0, slash);
        const filename = upload.nas_path.slice(slash + 1);

        const progress = await getNasVideoProgress(
          nas,
          folder,
          upload.upload_uuid,
          filename,
          upload.file_size
        );

        nasNotStarted = progress === -1;
        nasUploadedBytes = nasNotStarted ? null : progress;
      } catch (error) {
        nasCheckError = true;
        console.error(
          "Video NAS progress check failed:",
          error instanceof Error ? error.message : "unknown"
        );
      }
    }

    return NextResponse.json({
      ok: true,
      status: upload.status,
      uploadedBytes: upload.uploaded_bytes,
      nasUploadedBytes,
      nasNotStarted,
      nasCheckError,
      totalBytes: upload.file_size,
      completed: upload.status === "completed",
      locked: upload.lease_token !== null,
      mediaId: upload.media_id,
      updatedAt: upload.updated_at,
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

    console.error("Video status failed:", message);

    return NextResponse.json(
      { ok: false, error: "動画の状態確認に失敗しました" },
      { status: 500 }
    );
  }
}
