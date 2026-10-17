import { NextRequest, NextResponse } from "next/server";
import { getVideoApiContext } from "@/lib/nas/video/auth";
import { validateVideoNasPath } from "@/lib/nas/video/path";
import { connectVideoNas } from "@/lib/nas/video/client";
import { openNasVideoStream } from "@/lib/nas/video/stream";
import { VIDEO_UUID_PATTERN } from "@/lib/nas/video/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { adminSupabase } = await getVideoApiContext();

    const mediaId = request.nextUrl.searchParams.get("mediaId");

    if (!mediaId || !VIDEO_UUID_PATTERN.test(mediaId)) {
      return NextResponse.json(
        { error: "動画IDが不正です" },
        { status: 400 }
      );
    }

    const { data: media, error: mediaError } = await adminSupabase
      .from("client_media")
      .select("id, client_id, storage_path, media_type")
      .eq("id", mediaId)
      .eq("media_type", "video")
      .maybeSingle();

    if (mediaError || !media) {
      return NextResponse.json(
        { error: "登録された動画が見つかりません" },
        { status: 404 }
      );
    }

    const { data: upload, error: uploadError } = await adminSupabase
      .from("client_video_uploads")
      .select("id, client_id, nas_path, status, media_id")
      .eq("media_id", media.id)
      .eq("client_id", media.client_id)
      .eq("status", "completed")
      .maybeSingle();

    if (
      uploadError ||
      !upload ||
      !validateVideoNasPath(
        upload.nas_path,
        upload.client_id,
        upload.id
      ) ||
      media.storage_path !==
        `nas:${upload.nas_path.slice(
          "/volume1/GOLAZO(アプリ)/files/golazo-photos/golazo-client-media/".length
        )}`
    ) {
      return NextResponse.json(
        { error: "動画の保存先を確認できません" },
        { status: 404 }
      );
    }

    const range = request.headers.get("range");

    if (
      range &&
      !/^bytes=\d+-\d*$/.test(range)
    ) {
      return NextResponse.json(
        { error: "動画の再生範囲が不正です" },
        { status: 400 }
      );
    }

    const nas = await connectVideoNas();

    const upstream = await openNasVideoStream(
      nas,
      upload.nas_path,
      range || undefined
    );

    if (range && upstream.status !== 206) {
      await upstream.body?.cancel();
      return NextResponse.json(
        { error: "NASが動画の部分読み込みに対応できませんでした" },
        { status: 502 }
      );
    }

    if (!upstream.body) {
      return NextResponse.json(
        { error: "動画データを取得できません" },
        { status: 502 }
      );
    }

    const extension = upload.nas_path.toLowerCase().endsWith(".mov")
      ? "mov"
      : "mp4";

    const headers = new Headers({
      "Content-Type":
        extension === "mov" ? "video/quicktime" : "video/mp4",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Accept-Ranges": "bytes",
    });

    for (const name of [
      "content-range",
      "content-length",
    ]) {
      const value = upstream.headers.get(name);
      if (value) headers.set(name, value);
    }

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 }
      );
    }

    if (message === "FORBIDDEN") {
      return NextResponse.json(
        { error: "アクセス権限がありません" },
        { status: 403 }
      );
    }

    console.error("NAS video view failed:", message);

    return NextResponse.json(
      { error: "動画の読み込みに失敗しました" },
      { status: 500 }
    );
  }
}
