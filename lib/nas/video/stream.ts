import "server-only";
import { UgosClient } from "ug-file";

type NasDownloadInternal = {
  getUrls(): Promise<{
    downloadLink(url: string): string;
  }>;
  requireSession(): unknown;
  authHeaders(session: unknown): Record<string, string>;
  getDownloadToken(
    paths: string[],
    session: unknown
  ): Promise<{ dl_url: string }>;
  fetchImpl(
    input: string,
    init?: RequestInit
  ): Promise<Response>;
};

export async function openNasVideoStream(
  client: UgosClient,
  nasPath: string,
  range?: string
): Promise<Response> {
  const nas = client as unknown as NasDownloadInternal;

  const urls = await nas.getUrls();
  const session = nas.requireSession();

  const token = await nas.getDownloadToken(
    [nasPath],
    session
  );

  const url = urls.downloadLink(token.dl_url);

  const headers = {
    ...nas.authHeaders(session),
    Referer: url,
    Pragma: "no-cache",
    "Upgrade-Insecure-Requests": "1",
    ...(range ? { Range: range } : {}),
  };

  const response = await nas.fetchImpl(url, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(
      `NAS動画の読み込みに失敗しました: HTTP ${response.status}`
    );
  }

  return response;
}
