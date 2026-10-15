export const NAS_CLIENT_MEDIA_FOLDER =
  "/volume1/GOLAZO(アプリ)/files/golazo-photos/golazo-client-media";

export type NasMediaCategory =
  | "session"
  | "posture"
  | "ear"
  | "measurement";

const UUID =
  "[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}";

const FILE = new RegExp(
  `^(${UUID})-(${UUID})\\.(jpg|png|webp|heic)$`,
  "i"
);

const CATEGORIES = new Set<NasMediaCategory>([
  "session",
  "posture",
  "ear",
  "measurement",
]);

export function safeNasClientName(name: string): string {
  return name
    .normalize("NFKC")
    .trim()
    .replace(/[\/\\:*?"<>|\x00-\x1f]/g, "_")
    .replace(/^\.+|\.+$/g, "")
    .slice(0, 50) || "顧客";
}

export function parseNasClientMediaPath(storagePath: string) {
  if (!storagePath.startsWith("nas:")) return null;

  const relativePath = storagePath.slice(4);
  const parts = relativePath.split("/");

  if (parts.length !== 1 && parts.length !== 3) return null;

  const filename = parts[parts.length - 1];
  const fileMatch = FILE.exec(filename);

  if (!fileMatch) return null;

  const clientId = fileMatch[1].toLowerCase();
  const extension = fileMatch[3].toLowerCase();

  if (parts.length === 3) {
    const [folder, category] = parts;
    const suffix = `_${clientId}`;

    if (
      !folder.endsWith(suffix) ||
      folder.length <= suffix.length ||
      !/^[^\/\\:*?"<>|\x00-\x1f]+$/.test(folder) ||
      !CATEGORIES.has(category as NasMediaCategory)
    ) {
      return null;
    }
  }

  return {
    clientId,
    filename,
    extension,
    relativePath,
    absolutePath: `${NAS_CLIENT_MEDIA_FOLDER}/${relativePath}`,
  };
}
