import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { UgosClient } from "ug-file";
import { parseNasClientMediaPath, safeNasClientName } from "@/lib/nas/client-media-path";
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

    // 写真更新時に限り、古い写真のIDを受け取る。
    // この段階では古い写真の削除は実行しない。
    const previousMediaIdInput = form.get("previousMediaId");
    const previousMediaId =
      previousMediaIdInput === null ? null : previousMediaIdInput;

    const allowedPhotoTypes: Record<string, string[]> = {
      session: [],
      posture: ["front", "side", "back"],
      ear: ["beforeRight", "afterRight", "beforeLeft", "afterLeft"],
      measurement: ["physicalCheck", "injuryZero"],
    };

    const photoType =
      category === "session" ? null : photoTypeInput;

    const mediaIdPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (
      previousMediaId !== null &&
      (typeof previousMediaId !== "string" ||
        !mediaIdPattern.test(previousMediaId) ||
        category === "session")
    ) {
      return NextResponse.json(
        { ok: false, error: "更新前の写真IDが不正です" },
        { status: 400 }
      );
    }

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

    // 更新前の写真をサーバー側で照合する。
    // この段階では削除は行わない。
    if (typeof previousMediaId === "string") {
      const { data: previousMedia, error: previousError } = await supabase
        .from("client_media")
        .select("id, client_id, category, photo_type, taken_date, storage_path")
        .eq("id", previousMediaId)
        .eq("client_id", clientId)
        .maybeSingle();

      if (
        previousError ||
        !previousMedia ||
        previousMedia.category !== category ||
        previousMedia.photo_type !== photoType ||
        previousMedia.taken_date !== takenDate ||
        !(
          typeof previousMedia.storage_path === "string" &&
          parseNasClientMediaPath(previousMedia.storage_path)?.clientId ===
            clientId.toLowerCase()
        )
      ) {
        return NextResponse.json(
          {
            ok: false,
            error: "更新前の写真情報が一致しません。更新を中止しました",
          },
          { status: 409 }
        );
      }
    }

    const clientNameInput = form.get("clientName");

    if (
      typeof clientNameInput !== "string" ||
      !clientNameInput.trim() ||
      clientNameInput.length > 100
    ) {
      return NextResponse.json(
        { ok: false, error: "顧客名を確認できません。写真の登録を中止しました" },
        { status: 400 }
      );
    }

    const nasCustomerFolder =
      `${safeNasClientName(clientNameInput)}_${clientId.toLowerCase()}`;

    const uglinkid = process.env.NAS_UGLINK_ID;
    const username = process.env.NAS_USERNAME;
    const password = process.env.NAS_PASSWORD;

    if (!uglinkid || !username || !password) {
      return NextResponse.json(
        { ok: false, error: "NAS接続設定が不足しています" },
        { status: 503 }
      );
    }

    const perfStart = Date.now();
    const client = new UgosClient({ uglinkid, fetch: safeFetch });
    const login = await client.login({ username, password });

    if (!login.success) {
      throw new Error("NASログイン失敗");
    }

    const perfLogin = Date.now();

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

    const filename = `${clientId.toLowerCase()}-${randomUUID()}${extension}`;
    const relativeFolder = `${nasCustomerFolder}/${category}`;
    const folderPath = `${NAS_FOLDER}/${relativeFolder}`;
    const relativePath = `${relativeFolder}/${filename}`;
    const path = `${NAS_FOLDER}/${relativePath}`;
    const parsedNewPhoto = parseNasClientMediaPath(`nas:${relativePath}`);

    if (
      !parsedNewPhoto ||
      parsedNewPhoto.clientId !== clientId.toLowerCase() ||
      parsedNewPhoto.absolutePath !== path
    ) {
      throw new Error("写真の新しい保存先を安全に確認できませんでした");
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (!(await client.exists(folderPath))) {
      await client.mkdir(folderPath, true);
    }

    let perfUpload = perfLogin;
    let perfExists = perfLogin;
    let perfRead = perfLogin;

    try {
      await client.upload(path, buffer);
      perfUpload = Date.now();

      const fileExists = await client.exists(path);
      perfExists = Date.now();
      if (!fileExists) {
        throw new Error("NASへの保存を確認できませんでした");
      }

      const saved = await client.readFile(path);
      perfRead = Date.now();
      const savedBuffer = Buffer.isBuffer(saved)
        ? saved
        : Buffer.from(saved);

      const hash = (data: Buffer) =>
        createHash("sha256").update(data).digest("hex");

      if (hash(buffer) !== hash(savedBuffer)) {
        throw new Error("NAS保存後の内容確認に失敗しました");
      }
    } catch (saveError) {
      try {
        if (await client.exists(path)) {
          await client.trash(path);
        }
      } catch (cleanupError) {
        console.error(
          "NAS new-photo cleanup failed:",
          cleanupError instanceof Error ? cleanupError.message : "unknown"
        );
        throw new Error(
          "写真の保存確認と後片付けに失敗しました。管理者に確認してください"
        );
      }

      throw saveError;
    }

    const storagePath = `nas:${relativePath}`;

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

    // 新しい写真の保存・照合・DB登録が成功した後だけ実行。
    let previousPhotoDeleted = false;
    let previousPhotoDeleteWarning = false;

    if (typeof previousMediaId === "string") {
      try {
        // 削除直前にも同じ顧客・日付・写真種類か再確認する。
        const { data: previous, error: previousError } = await supabase
          .from("client_media")
          .select("id, client_id, category, photo_type, taken_date, storage_path")
          .eq("id", previousMediaId)
          .eq("client_id", clientId)
          .maybeSingle();

        const parsedPrevious =
          typeof previous?.storage_path === "string"
            ? parseNasClientMediaPath(previous.storage_path)
            : null;

        if (
          previousError ||
          !previous ||
          !parsedPrevious ||
          parsedPrevious.clientId !== clientId.toLowerCase() ||
          previous.category !== category ||
          previous.photo_type !== photoType ||
          previous.taken_date !== takenDate ||
          previous.id === record.id
        ) {
          previousPhotoDeleteWarning = true;
        } else {
          const oldPath = parsedPrevious.absolutePath;

          // 新しい写真とは別ファイルであることを確認。
          if (oldPath === path) {
            previousPhotoDeleteWarning = true;
          } else {
            if (!(await client.exists(oldPath))) {
              // NASに古い写真がなければ、DBの削除も行わない。
              previousPhotoDeleteWarning = true;
            } else {
              await client.trash(oldPath);

              const { data: deleted, error: deleteError } = await supabase
                .from("client_media")
                .delete()
                .eq("id", previous.id)
                .eq("client_id", clientId)
                .eq("storage_path", previous.storage_path)
                .select("id");

              if (deleteError || !deleted?.length) {
                previousPhotoDeleteWarning = true;
              } else {
                previousPhotoDeleted = true;
              }
            }
          }
        }
      } catch (deleteError) {
        console.error(
          "Old NAS photo cleanup failed:",
          deleteError instanceof Error ? deleteError.message : "unknown"
        );
        previousPhotoDeleteWarning = true;
      }
    }

    console.info("[NAS_UPLOAD_TIMING]", JSON.stringify({
      loginMs: perfLogin - perfStart,
      uploadMs: perfUpload - perfLogin,
      existsMs: perfExists - perfUpload,
      readMs: perfRead - perfExists,
      dbMs: Date.now() - perfRead,
      totalMs: Date.now() - perfStart,
    }));

    return NextResponse.json({
      ok: true,
      storage: "nas",
      storagePath,
      id: record.id,
      fileName: file.name,
      mediaType: "image",
      previousPhotoDeleted,
      previousPhotoDeleteWarning,
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
