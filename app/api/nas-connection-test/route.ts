import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { UgosClient } from "ug-file";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET() {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // この読み取り専用テストではCookieを変更しない
        },
      },
    }
  );

  const { data: { user }, error: authError } =
    await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
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
      { ok: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  const uglinkid = process.env.NAS_UGLINK_ID;
  const username = process.env.NAS_USERNAME;
  const password = process.env.NAS_PASSWORD;

  if (!uglinkid || !username || !password) {
    return NextResponse.json(
      { ok: false, error: "NAS configuration missing" },
      { status: 500 }
    );
  }

  const safeFetch: typeof fetch = (input, init = {}) => {
    const headers = new Headers(init.headers);
    headers.delete("Keep-Alive");
    headers.delete("Connection");

    return fetch(input, { ...init, headers });
  };

  try {
    const client = new UgosClient({
      uglinkid,
      fetch: safeFetch,
    });

    const login = await client.login({ username, password });

    if (!login.success) {
      return NextResponse.json(
        { ok: false, error: "NAS login failed" },
        { status: 502 }
      );
    }

    const folder =
      "/volume1/GOLAZO(アプリ)/files/golazo-photos/golazo-sdk-test-20261014";

    await client.list(folder);

    return NextResponse.json({
      ok: true,
      message: "VercelからNASへの接続成功",
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "NAS connection failed" },
      { status: 502 }
    );
  }
}
