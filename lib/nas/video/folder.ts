import "server-only";
import { UgosClient } from "ug-file";
import { validateVideoNasPath } from "./path";

export async function ensureVideoNasFolder(
  client: UgosClient,
  nasPath: string,
  clientId: string,
  uploadId: string
) {
  if (!validateVideoNasPath(nasPath, clientId, uploadId)) {
    throw new Error("動画保存先が不正です");
  }

  const folder = nasPath.slice(0, nasPath.lastIndexOf("/"));

  let exists = false;

  try {
    exists = await client.exists(folder);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);

    if (!/Path does not exist/i.test(message)) {
      throw error;
    }
  }

  if (!exists) {
    await client.mkdir(folder, true);
  }

  if (!(await client.exists(folder))) {
    throw new Error("NASの動画保存先フォルダを確認できません");
  }

  return folder;
}
