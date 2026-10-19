'use client';

const MAX_VIDEO_SIZE = 500 * 1024 * 1024;
const HASH_BLOCK_SIZE = 2 * 1024 * 1024;

type ProgressCallback = (message: string) => void;

async function calculateVideoSha256(
  file: File,
  onProgress: ProgressCallback
): Promise<string> {
  const { createSHA256 } = await import('hash-wasm');
  const hasher = await createSHA256();

  hasher.init();

  for (let offset = 0; offset < file.size; offset += HASH_BLOCK_SIZE) {
    const buffer = await file.slice(
      offset,
      Math.min(offset + HASH_BLOCK_SIZE, file.size)
    ).arrayBuffer();

    hasher.update(new Uint8Array(buffer));

    const percent = Math.round(
      (Math.min(offset + HASH_BLOCK_SIZE, file.size) / file.size) * 100
    );

    onProgress(`動画の準備中 ${percent}%`);
  }

  return hasher.digest('hex');
}

export async function uploadClientVideo(
  file: File,
  clientId: string,
  sessionId: string,
  onProgress: ProgressCallback
): Promise<string> {
  if (!/\.(mov|mp4)$/i.test(file.name)) {
    throw new Error('動画はMOVまたはMP4形式にしてください');
  }

  if (file.size <= 0 || file.size > MAX_VIDEO_SIZE) {
    throw new Error('動画は500MB以下にしてください');
  }

  const fileSha256 = await calculateVideoSha256(file, onProgress);

  onProgress('NASへの動画送信を準備しています…');

  const startResponse = await fetch('/api/nas-client-video/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId,
      sessionId,
      fileName: file.name,
      fileSize: file.size,
      fileSha256,
    }),
  });

  const startResult = await startResponse.json();

  if (!startResponse.ok || !startResult.ok) {
    throw new Error(startResult.error || '動画送信を開始できません');
  }

  const uploadId: string = startResult.uploadId;
  const chunkSize: number = startResult.chunkSize;

  const uploadFailure = (message: string) =>
    new Error(
      `${message}（動画アップロードID: ${uploadId}）`
    );

  if (
    !Number.isSafeInteger(chunkSize) ||
    chunkSize <= 0 ||
    chunkSize > HASH_BLOCK_SIZE
  ) {
    throw new Error('動画の分割サイズが不正です');
  }

  try {
  for (let offset = 0; offset < file.size; offset += chunkSize) {
    const end = Math.min(offset + chunkSize, file.size);
    const chunk = file.slice(offset, end);

    const response = await fetch('/api/nas-client-video/chunk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'x-video-upload-id': uploadId,
        'x-video-offset': String(offset),
      },
      body: chunk,
    });

    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw uploadFailure(
        result.error ||
        '動画送信が中断されました。安全のため自動再送しません'
      );
    }

    const percent = Math.round((end / file.size) * 100);
    onProgress(`NASへ動画を送信中 ${percent}%`);
  }

  onProgress('NASの動画を検証・登録しています…');

  const finishResponse = await fetch('/api/nas-client-video/finish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uploadId }),
  });

  const finishResult = await finishResponse.json();

  if (!finishResponse.ok || !finishResult.ok) {
    throw uploadFailure(
      finishResult.error ||
      '動画の保存確認に失敗しました。自動再送せず管理者に確認してください'
    );
  }

  onProgress('動画の保存が完了しました');

  return finishResult.mediaId;
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : '動画の送信状況を確認できません';

    if (message.includes(`動画アップロードID: ${uploadId}`)) {
      throw error;
    }

    throw uploadFailure(
      `${message}。保存状態を確認するまで再送しないでください`
    );
  }
}
