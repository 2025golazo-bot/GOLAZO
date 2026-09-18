import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export async function POST() {
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
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // Server Component contextではCookie設定ができない場合があるため無視
            }
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const baseDir = process.env.GOLAZO_NAS_PHOTO_DIR;

    if (!baseDir) {
      return NextResponse.json(
        { error: "GOLAZO_NAS_PHOTO_DIR is not configured" },
        { status: 500 }
      );
    }

    await mkdir(baseDir, { recursive: true });

    const fileName = `nas-test-${Date.now()}.txt`;
    const filePath = path.join(baseDir, fileName);

    await writeFile(
      filePath,
      `GOLAZO NAS test ${new Date().toISOString()}\n`,
      "utf8"
    );

    return NextResponse.json({
      success: true,
      fileName,
      filePath,
    });
  } catch (error) {
    console.error("NAS upload test error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
