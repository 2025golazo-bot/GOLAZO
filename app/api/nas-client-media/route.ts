import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { UgosClient } from "ug-file";
import { createHash, randomUUID } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NAS_FOLDER =
  "/volume1/GOLAZO(アプリ)/files/golazo-photos/golazo-client-media";

const MAX_FILE_SIZE = 4 * 1024 * 1024;

const safeFetch: typeof fetch = (input, init = {}) => {
  const headers = new Headers(init.headers);
  headers.delete("Keep-Alive");
  headers.delete("Connection");
  return fetch(input, { ...init, headers });
};

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

    const lengthHeader = request.headers.get("content-length");
    const contentLength = Number(lengthHeader);

    if (
      !lengthHeader ||
      !Number.isFinite(contentLength) ||
      contentLength <= 0 ||
      contentLength > MAX_FILE_SIZE + 1024 * 1024
    ) {
      return NextResponse.json(
        { ok: false, error: "ファイルサイズを確認してください" },
        { status: 413 }
      );
    }

    const form = await request.formData();
    const clientId = form.get("clientId");
    const file = form.get("file");

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (typeof clientId !== "string" || !uuidPattern.test(clientId)) {
      return NextResponse.json(
        { ok: false, error: "顧客IDが不正です" },
        { status: 400 }
      );
    }

    if (!(file instanceof File) || !file.type.startsWith("image/")) {
      return NextResponse.json(
        { ok: false, error: "写真ファイルのみ登録できます" },
        { status: 400 }
      );
    }

    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { ok: false, error: "写真は4MB以下にしてください" },
        { status: 413 }
      );
    }

    const sessionId = form.get("sessionId");
    const takenDate = form.get("takenDate");
    const categoryInput = form.get("category");
    const category =
      categoryInput === null ? "session" : categoryInput;
    const photoTypeInput = form.get("photoType");

    const allowedPhotoTypes: Record<string, string[]> = {
      session: [],
      posture: ["front", "side", "back"],
      ear: ["beforeRight", "afterRight", "beforeLeft", "afterLeft"],
      measurement: ["physicalCheck", "injuryZero"],
    };

    const photoType =
      category === "session" ? null : photoTypeInput;

    if (
      typeof category !== "string" ||
      !["session", "posture", "ear", "measurement"].includes(category) ||
      (category !== "session" &&
        (typeof photoType !== "string" ||
          !allowedPhotoTypes[category]?.includes(photoType))) ||
      typeof takenDate !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(takenDate) ||
      (category === "session" &&
        (typeof sessionId !== "string" || !sessionId.trim()))
    ) {
      return NextResponse.json(
        { ok: false, error: "写真の登録情報が不正です" },
        { status: 400 }
      );
    }

    const uglinkid = process.env.NAS_UGLINK_ID;
    const username = process.env.NAS_USERNAME;
    const password = process.env.NAS_PASSWORD;

    if (!uglinkid || !username || !password) {
      return NextResponse.json(
        { ok: false, error: "NAS接続設定が不足しています" },
        { status: 503 }
      );
    }

    const client = new UgosClient({ uglinkid, fetch: safeFetch });
    const login = await client.login({ username, password });

    if (!login.success) {
      throw new Error("NASログイン失敗");
    }

    const extension =
      file.type === "image/jpeg" ? ".jpg" :
      file.type === "image/png" ? ".png" :
      file.type === "image/webp" ? ".webp" :
      file.type === "image/heic" ? ".heic" :
      null;

    if (!extension) {
      return NextResponse.json(
        { ok: false, error: "対応していない画像形式です" },
        { status: 400 }
      );
    }

    const filename = `${clientId}-${randomUUID()}${extension}`;
    const path = `${NAS_FOLDER}/${filename}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await client.upload(path, buffer);

    if (!(await client.exists(path))) {
      throw new Error("NASへの保存を確認できませんでした");
    }

    const saved = await client.readFile(path);
    const savedBuffer = Buffer.isBuffer(saved)
      ? saved
      : Buffer.from(saved);

    const hash = (data: Buffer) =>
      createHash("sha256").update(data).digest("hex");

    if (hash(buffer) !== hash(savedBuffer)) {
      throw new Error("NAS保存後の内容確認に失敗しました");
    }

    const storagePath = `nas:${filename}`;

    const { data: record, error: dbError } = await supabase
      .from("client_media")
      .insert({
        client_id: clientId,
        storage_path: storagePath,
        file_name: file.name,
        media_type: "image",
        category,
        photo_type: photoType,
        session_id:
          category === "session" ? sessionId : null,
        taken_date: takenDate,
      })
      .select("id")
      .single();

    if (dbError || !record) {
      // DB登録に失敗した場合は、今回保存したNAS写真だけをゴミ箱へ移動
      try {
        await client.trash(path);
      } catch (cleanupError) {
        console.error(
          "NAS upload cleanup failed:",
          cleanupError instanceof Error ? cleanupError.message : "unknown"
        );
        throw new Error(
          "写真のDB登録とNAS後片付けに失敗しました。管理者に確認してください"
        );
      }

      throw new Error("写真のデータベース登録に失敗しました");
    }

    return NextResponse.json({
      ok: true,
      storage: "nas",
      storagePath,
      id: record.id,
      fileName: file.name,
      mediaType: "image",
    });
  } catch (error) {
    console.error(
      "NAS media upload failed:",
      error instanceof Error ? error.message : "unknown"
    );

    return NextResponse.json(
      { ok: false, error: "NASへの写真保存に失敗しました" },
      { status: 500 }
    );
  }
}
