import "server-only";

export const VIDEO_NAS_ROOT =
  "/volume1/GOLAZO(アプリ)/files/golazo-photos/golazo-client-media";

export const VIDEO_CHUNK_SIZE = 2 * 1024 * 1024;

export const VIDEO_MAX_SIZE = 500 * 1024 * 1024;

export const VIDEO_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const VIDEO_SHA256_PATTERN = /^[0-9a-f]{64}$/;
