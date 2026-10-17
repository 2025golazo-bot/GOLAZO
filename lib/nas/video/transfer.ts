import "server-only";
import { UgosClient } from "ug-file";
import { VIDEO_CHUNK_SIZE } from "./config";

type NasReply = { body: unknown };

type NasTransferMethods = {
  getUrls(): Promise<{
    uploadFile(): string;
    updateTmpInfo(dir: string, uuid: string, filename: string, size: number): string;
    uploadFileV2(): string;
  }>;
  requireSession(): unknown;
  authHeaders(session: unknown): Record<string, string>;
  fetchJson(url: string, options: RequestInit): Promise<NasReply>;
  assertSuccess(body: unknown, message: string): unknown;
};

export async function prepareVideoNasUpload(
  client: UgosClient,
  folder: string,
  filename: string,
  uploadUuid: string,
  totalSize: number,
  changeTime: number
) {
  const nas = client as unknown as NasTransferMethods;
  const urls = await nas.getUrls();
  const session = nas.requireSession();

  const form = new FormData();
  for (const [key, value] of Object.entries({
    uuid: uploadUuid,
    dir: folder,
    action_type: "0",
    size: String(totalSize),
    begin_size: "0",
    current_size: "0",
    change_time: String(changeTime),
    filename,
    resume: "true",
    first_request: "true",
  })) {
    form.set(key, value);
  }
  form.set("file", new Blob([]), filename);

  const response = await nas.fetchJson(urls.uploadFile(), {
    method: "POST",
    headers: nas.authHeaders(session),
    body: form,
  });
  nas.assertSuccess(response.body, "NASアップロード準備に失敗しました");

  return true;
}

export async function sendVideoNasChunk(
  client: UgosClient,
  folder: string,
  filename: string,
  uploadUuid: string,
  totalSize: number,
  offset: number,
  chunk: Uint8Array,
  changeTime: number
) {
  if (
    !Number.isSafeInteger(offset) ||
    offset < 0 ||
    chunk.length === 0 ||
    chunk.length > VIDEO_CHUNK_SIZE ||
    offset + chunk.length > totalSize
  ) {
    throw new Error("動画分割データの容量または位置が不正です");
  }

  const nas = client as unknown as NasTransferMethods;
  const urls = await nas.getUrls();
  const session = nas.requireSession();

  const response = await nas.fetchJson(urls.uploadFileV2(), {
    method: "POST",
    headers: {
      ...nas.authHeaders(session),
      "ug-param": JSON.stringify({
        uuid: uploadUuid,
        file_name: encodeURIComponent(filename),
        action_type: 0,
        size: totalSize,
        current_size: chunk.length,
        resume: true,
        dir: encodeURIComponent(folder),
        change_time: changeTime,
        is_live_photo: false,
        first_request: false,
        begin_size: offset,
      }),
    },
    body: new Uint8Array(chunk),
  });

  nas.assertSuccess(response.body, "NASへの動画分割送信に失敗しました");
}

export async function verifyVideoNasChunk(
  client: UgosClient,
  folder: string,
  filename: string,
  uploadUuid: string,
  totalSize: number,
  expectedBytes: number
) {
  const { getNasVideoProgress } = await import("./progress");

  const actualBytes = await getNasVideoProgress(
    client,
    folder,
    uploadUuid,
    filename,
    totalSize
  );

  if (actualBytes !== expectedBytes) {
    throw new Error(
      `NAS送信容量が一致しません。期待値:${expectedBytes} / 実際:${actualBytes}`
    );
  }

  return actualBytes;
}
