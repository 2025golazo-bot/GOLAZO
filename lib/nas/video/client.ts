import "server-only";
import { UgosClient } from "ug-file";

const safeFetch: typeof fetch = (input, init = {}) => {
  const headers = new Headers(init.headers);
  headers.delete("Keep-Alive");
  headers.delete("Connection");
  return fetch(input, { ...init, headers });
};

export async function connectVideoNas() {
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
