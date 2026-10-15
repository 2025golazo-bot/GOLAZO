import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { UgosClient } from "ug-file";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NAS_FOLDER =
  "/volume1/GOLAZO(アプリ)/files/golazo-photos/golazo-client-media";

const safeFetch: typeof fetch = (input, init = {}) => {
  const headers = new Headers(init.headers);
  headers.delete("Keep-Alive");
  headers.delete("Connection");
  return fetch(input, { ...init, headers });
};

export async function GET(request: NextRequest) {
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
        { error: "ログインが必要です" },
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
        { error: "アクセス権限がありません" },
        { status: 403 }
      );
    }

    const storagePath = request.nextUrl.searchParams.get("path");

    const match = storagePath?.match(
      /^nas:([0-9a-f-]{36}-[0-9a-f-]{36}\.(jpg|png|webp|heic))$/i
    );

    if (!match) {
      return NextResponse.json(
        { error: "ファイル指定が不正です" },
        { status: 400 }
      );
    }

    const filename = match[1];
    const extension = match[2].toLowerCase();

    // NASに存在するだけでは閲覧を許可しない。
    // 顧客カルテに登録済みの写真だけを取得する。
    const { data: media, error: mediaError } = await supabase
      .from("client_media")
      .select("id, client_id")
      .eq("storage_path", storagePath!)
      .maybeSingle();

    if (mediaError || !media) {
      return NextResponse.json(
        { error: "登録された写真が見つかりません" },
        { status: 404 }
      );
    }

    const uglinkid = process.env.NAS_UGLINK_ID;
    const username = process.env.NAS_USERNAME;
    const password = process.env.NAS_PASSWORD;

    if (!uglinkid || !username || !password) {
      return NextResponse.json(
        { error: "NAS接続設定が不足しています" },
        { status: 503 }
      );
    }

    const client = new UgosClient({ uglinkid, fetch: safeFetch });
    const login = await client.login({ username, password });

    if (!login.success) {
      throw new Error("NASログイン失敗");
    }

    const path = `${NAS_FOLDER}/${filename}`;

    if (!(await client.exists(path))) {
      return NextResponse.json(
        { error: "写真が見つかりません" },
        { status: 404 }
      );
    }

    const data = await client.readFile(path);
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);

    const contentType =
      extension === "jpg" ? "image/jpeg" :
      extension === "png" ? "image/png" :
      extension === "webp" ? "image/webp" :
      "image/heic";

    const body = new Uint8Array(buffer).buffer;

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error(
      "NAS media view failed:",
      error instanceof Error ? error.message : "unknown"
    );

    return NextResponse.json(
      { error: "NAS写真の読み込みに失敗しました" },
      { status: 500 }
    );
  }
}
