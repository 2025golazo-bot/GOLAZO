import "server-only";
import { VIDEO_NAS_ROOT, VIDEO_UUID_PATTERN } from "./config";

export function validateVideoNasPath(
  nasPath: string,
  clientId: string,
  uploadId: string
) {
  if (
    !VIDEO_UUID_PATTERN.test(clientId) ||
    !VIDEO_UUID_PATTERN.test(uploadId) ||
    typeof nasPath !== "string"
  ) {
    return false;
  }

  const prefix = `${VIDEO_NAS_ROOT}/`;
  if (!nasPath.startsWith(prefix)) return false;

  const relative = nasPath.slice(prefix.length);
  const parts = relative.split("/");

  if (parts.length !== 3) return false;

  const [customerFolder, category, filename] = parts;
  const customerId = clientId.toLowerCase();
  const videoId = uploadId.toLowerCase();

  if (
    category !== "session" ||
    !customerFolder.endsWith(`_${customerId}`) ||
    !/^[^/\\]+$/.test(customerFolder) ||
    customerFolder === `_${customerId}`
  ) {
    return false;
  }

  return (
    filename === `${customerId}-${videoId}.mov` ||
    filename === `${customerId}-${videoId}.mp4`
  );
}

export function toVideoStoragePath(
  nasPath: string,
  clientId: string,
  uploadId: string
): string {
  if (!validateVideoNasPath(nasPath, clientId, uploadId)) {
    throw new Error("動画のNAS保存先が不正です");
  }

  const relativePath = nasPath.slice(VIDEO_NAS_ROOT.length + 1);

  return `nas:${relativePath}`;
}
