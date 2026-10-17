import "server-only";
import { UgosClient } from "ug-file";

export async function getNasVideoProgress(
  client: UgosClient,
  folder: string,
  uuid: string,
  filename: string,
  totalSize: number
): Promise<number> {
  type NasResponse = {
    body: {
      data?: { completed_size?: number };
    };
  };

  type NasInternal = {
    getUrls(): Promise<{
      updateTmpInfo(
        dir: string,
        uuid: string,
        filename: string,
        size: number
      ): string;
    }>;
    requireSession(): unknown;
    authHeaders(session: unknown): Record<string, string>;
    fetchJson(
      url: string,
      options: RequestInit
    ): Promise<NasResponse>;
    assertSuccess(body: unknown, message: string): unknown;
  };

  const nas = client as unknown as NasInternal;
  const urls = await nas.getUrls();
  const session = nas.requireSession();

  const response = await nas.fetchJson(
    urls.updateTmpInfo(folder, uuid, filename, totalSize),
    {
      method: "GET",
      headers: nas.authHeaders(session),
    }
  );

  nas.assertSuccess(response.body, "NASの送信状況を取得できません");

  const completedSize = response.body?.data?.completed_size;

  if (
    typeof completedSize !== "number" ||
    !Number.isSafeInteger(completedSize) ||
    completedSize < -1 ||
    completedSize > totalSize
  ) {
    throw new Error(
      "NASの送信済み容量を確認できません。安全のため送信を中止します"
    );
  }

  return completedSize;
}
