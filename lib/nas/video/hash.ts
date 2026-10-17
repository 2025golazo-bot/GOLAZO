import "server-only";

import { createHash } from "node:crypto";
import { UgosClient } from "ug-file";

export async function verifyNasVideoSha256(
  client: UgosClient,
  nasPath: string,
  expectedSize: number,
  expectedSha256: string
): Promise<void> {
  const response = await client.download(nasPath);

  if (!response.ok || response.status !== 200 || !response.body) {
    throw new Error("NASの動画データを読み込めません");
  }

  const reader = response.body.getReader();
  const hash = createHash("sha256");
  let totalBytes = 0;
  const deadline = Date.now() + 240000;

  try {
    while (true) {
      if (Date.now() >= deadline) {
        void reader.cancel().catch(() => {});
        throw new Error("動画検証の制限時間を超えました");
      }

      const remainingMs = deadline - Date.now();
      let timer: ReturnType<typeof setTimeout> | undefined;

      let result: ReadableStreamReadResult<Uint8Array>;
      try {
        result = await Promise.race([
          reader.read(),
          new Promise<never>((_, reject) => {
            timer = setTimeout(
              () => reject(new Error("NAS動画の読み込みが制限時間を超えました")),
              Math.max(1, remainingMs)
            );
          }),
        ]);
      } catch (readError) {
        void reader.cancel().catch(() => {});
        throw readError;
      } finally {
        if (timer !== undefined) clearTimeout(timer);
      }

      const { done, value } = result;

      if (Date.now() >= deadline) {
        void reader.cancel().catch(() => {});
        throw new Error("動画検証の制限時間を超えました");
      }

      if (done) break;

      totalBytes += value.byteLength;

      if (totalBytes > expectedSize) {
        throw new Error("NAS動画の容量が予定サイズを超えています");
      }

      hash.update(value);
    }
  } finally {
    reader.releaseLock();
  }

  if (totalBytes !== expectedSize) {
    throw new Error("NAS動画の容量が元ファイルと一致しません");
  }

  const actualSha256 = hash.digest("hex");

  if (actualSha256 !== expectedSha256) {
    throw new Error("NAS動画のSHA-256が元ファイルと一致しません");
  }
}
