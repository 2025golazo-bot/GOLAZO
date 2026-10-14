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

export async function POST(request: NextRequest) {
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

    const body = await request.json().catch(() => null);
    const mediaId = body?.mediaId;
    const clientId = body?.clientId;

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (
      typeof mediaId !== "string" ||
      typeof clientId !== "string" ||
      !uuidPattern.test(mediaId) ||
      !uuidPattern.test(clientId)
    ) {
      return NextResponse.json(
        { error: "写真または顧客の指定が不正です" },
        { status: 400 }
      );
    }

    const { data: media, error: mediaError } = await supabase
      .from("client_media")
      .select("id, client_id, storage_path")
      .eq("id", mediaId)
      .eq("client_id", clientId)
      .maybeSingle();

    if (mediaError || !media) {
      return NextResponse.json(
        { error: "対象の写真が見つかりません" },
        { status: 404 }
      );
    }

    const match = media.storage_path.match(
      /^nas:([0-9a-f-]{36}-[0-9a-f-]{36}\.(jpg|png|webp|heic))$/i
    );

    if (!match) {
      return NextResponse.json(
        { error: "NAS写真以外は削除できません" },
        { status: 400 }
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

    const perfStart = Date.now();
    const client = new UgosClient({ uglinkid, fetch: safeFetch });
    await client.login({ username, password });
    const perfLogin = Date.now();

    const nasPath = `${NAS_FOLDER}/${match[1]}`;

    const fileExists = await client.exists(nasPath);
    const perfExists = Date.now();
    if (fileExists) {
      await client.trash(nasPath);
    }
    const perfTrash = Date.now();

    const { data: deleted, error: deleteError } = await supabase
      .from("client_media")
      .delete()
      .eq("id", mediaId)
      .eq("client_id", clientId)
      .eq("storage_path", media.storage_path)
      .select("id");

    if (deleteError || !deleted?.length) {
      return NextResponse.json(
        {
          error:
            "NASの処理後、カルテ登録の削除に失敗しました。管理者に確認してください",
        },
        { status: 500 }
      );
    }

    console.info("[NAS_DELETE_TIMING]", JSON.stringify({
      loginMs: perfLogin - perfStart,
      existsMs: perfExists - perfLogin,
      trashMs: perfTrash - perfExists,
      dbMs: Date.now() - perfTrash,
      totalMs: Date.now() - perfStart,
    }));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(
      "NAS media delete failed:",
      error instanceof Error ? error.message : "unknown error"
    );
    return NextResponse.json(
      { error: "NAS写真の削除に失敗しました" },
      { status: 500 }
    );
  }
}
