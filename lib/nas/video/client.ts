import "server-only";
import { UgosClient } from "ug-file";

const safeFetch: typeof fetch = (input, init = {}) => {
  const headers = new Headers(init.headers);
  headers.delete("Keep-Alive");
  headers.delete("Connection");
  return fetch(input, { ...init, headers });
};

let cachedNas: UgosClient | null = null;
let cachedAt = 0;
let pendingConnection: Promise<UgosClient> | null = null;
const NAS_CACHE_MS = 60_000;

export async function connectVideoNas(
  reuseSession = false
): Promise<UgosClient> {
  if (!reuseSession) {
    return loginVideoNas();
  }

  if (pendingConnection) {
    return pendingConnection;
  }

  const connection = (async (): Promise<UgosClient> => {
    const candidate = cachedNas;

    if (candidate && Date.now() - cachedAt < NAS_CACHE_MS) {
      try {
        if (await candidate.checkLogin()) {
          console.info("[VIDEO_TIMING] NAS session reused");
          return candidate;
        }
      } catch {
        // 認証確認に失敗した場合は通常ログインへ戻す
      }
    }

    if (cachedNas === candidate) {
      cachedNas = null;
      cachedAt = 0;
    }

    const client = await loginVideoNas();
    cachedNas = client;
    cachedAt = Date.now();
    return client;
  })();

  pendingConnection = connection;

  try {
    return await connection;
  } finally {
    if (pendingConnection === connection) {
      pendingConnection = null;
    }
  }
}

async function loginVideoNas(): Promise<UgosClient> {
  const uglinkid = process.env.NAS_UGLINK_ID;
  const username = process.env.NAS_USERNAME;
  const password = process.env.NAS_PASSWORD;

  if (!uglinkid || !username || !password) {
    throw new Error("NAS接続設定が不足しています");
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const client = new UgosClient({ uglinkid, fetch: safeFetch });
      const login = await client.login({ username, password });

      if (!login.success) {
        throw new Error("NASログイン認証に失敗しました");
      }

      return client;
    } catch (error) {
      const code = (error as { cause?: { code?: string } }).cause?.code;

      if (
        attempt === 3 ||
        !["UND_ERR_CONNECT_TIMEOUT", "ETIMEDOUT", "ECONNRESET"].includes(code ?? "")
      ) {
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  throw new Error("NASに接続できませんでした");
}
