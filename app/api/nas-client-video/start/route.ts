import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { safeNasClientName } from "@/lib/nas/client-media-path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NAS_FOLDER =
  "/volume1/GOLAZO(アプリ)/files/golazo-photos/golazo-client-media";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const SHA256_PATTERN = /^[0-9a-f]{64}$/;

const MAX_VIDEO_SIZE = 500 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: "ログインが必要です" },
        { status: 401 }
      );
    }

    const { data: staff, error: staffError } = await supabase
      .from("golazo_media_staff")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (staffError || !staff) {
      return NextResponse.json(
        { ok: false, error: "アクセス権限がありません" },
        { status: 403 }
      );
    }

    const contentLength = Number(request.headers.get("content-length"));

    if (
      !Number.isFinite(contentLength) ||
      contentLength <= 0 ||
      contentLength > 16 * 1024
    ) {
      return NextResponse.json(
        { ok: false, error: "開始リクエストが大きすぎます" },
        { status: 413 }
      );
    }

    const body = await request.json();

    const {
      clientId,
      sessionId,
      fileName,
      fileSize,
      fileSha256,
    } = body ?? {};

    if (
      typeof clientId !== "string" ||
      !UUID_PATTERN.test(clientId) ||
      typeof sessionId !== "string" ||
      !/^ses-\d{10,17}$/.test(sessionId) ||
      typeof fileName !== "string" ||
      fileName.length < 1 ||
      fileName.length > 255 ||
      /[/\\\u0000-\u001f]/.test(fileName) ||
      !Number.isSafeInteger(fileSize) ||
      fileSize <= 0 ||
      fileSize > MAX_VIDEO_SIZE ||
      typeof fileSha256 !== "string" ||
      !SHA256_PATTERN.test(fileSha256)
    ) {
      return NextResponse.json(
        { ok: false, error: "動画の登録情報が不正です" },
        { status: 400 }
      );
    }

    const extension = fileName.toLowerCase().endsWith(".mov")
      ? "mov"
      : fileName.toLowerCase().endsWith(".mp4")
      ? "mp4"
      : null;

    if (!extension) {
      return NextResponse.json(
        { ok: false, error: "MOV・MP4動画のみ登録できます" },
        { status: 400 }
      );
    }

    const { data: customer, error: customerError } = await supabase
      .from("clients")
      .select("id, child_name")
      .eq("id", clientId)
      .maybeSingle();

    if (customerError || !customer) {
      return NextResponse.json(
        { ok: false, error: "顧客情報が見つかりません" },
        { status: 404 }
      );
    }

    const { data: session, error: sessionError } = await supabase
      .from("session_logs")
      .select("client_id, local_session_id, session_date")
      .eq("client_id", clientId)
      .eq("local_session_id", sessionId)
      .maybeSingle();

    if (sessionError || !session) {
      return NextResponse.json(
        { ok: false, error: "対象顧客のセッションが見つかりません" },
        { status: 404 }
      );
    }

    const uploadId = randomUUID();
    const nasUuid = randomUUID();

    const customerFolder =
      `${safeNasClientName(customer.child_name)}_${clientId.toLowerCase()}`;

    const relativePath =
      `${customerFolder}/session/${clientId.toLowerCase()}-${uploadId}.${extension}`;

    const nasPath = `${NAS_FOLDER}/${relativePath}`;

    const secretKey = process.env.SUPABASE_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json(
        { ok: false, error: "動画保存のサーバー設定が不足しています" },
        { status: 503 }
      );
    }

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      secretKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data: upload, error: insertError } = await adminSupabase
      .from("client_video_uploads")
      .insert({
        id: uploadId,
        user_id: user.id,
        client_id: clientId,
        session_id: sessionId,
        taken_date: session.session_date,
        client_name: customer.child_name,
        file_name: fileName,
        file_size: fileSize,
        file_sha256: fileSha256,
        uploaded_bytes: 0,
        nas_path: nasPath,
        upload_uuid: nasUuid,
        status: "pending",
      })
      .select("id, uploaded_bytes, status")
      .single();

    if (insertError || !upload) {
      console.error("Video upload start DB error:", insertError?.code);
      return NextResponse.json(
        { ok: false, error: "動画アップロードの開始に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      uploadId: upload.id,
      uploadedBytes: upload.uploaded_bytes,
      status: upload.status,
      chunkSize: 2 * 1024 * 1024,
    });
  } catch (error) {
    console.error(
      "Video upload start error:",
      error instanceof Error ? error.message : "unknown"
    );

    return NextResponse.json(
      { ok: false, error: "動画アップロードの開始に失敗しました" },
      { status: 500 }
    );
  }
}
