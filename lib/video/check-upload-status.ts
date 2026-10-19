'use client';

const UPLOAD_ID_PATTERN =
  /動画アップロードID:\s*([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;

export function extractVideoUploadId(message: string): string | null {
  return UPLOAD_ID_PATTERN.exec(message)?.[1] ?? null;
}

export async function checkVideoUploadStatus(
  uploadId: string
): Promise<string> {
  const response = await fetch(
    `/api/nas-client-video/status?uploadId=${encodeURIComponent(uploadId)}`,
    { cache: 'no-store' }
  );

  const result = await response.json();

  if (!response.ok || !result.ok) {
    throw new Error(result.error || '保存状態を確認できませんでした');
  }

  switch (result.status) {
    case 'completed':
      return result.mediaId
        ? '保存完了：動画はカルテに登録されています。一覧を再読み込みして確認してください。'
        : '保存完了の記録がありますが、カルテとの紐づけを確認してください。';

    case 'uploading':
      return `送信途中：${result.uploadedBytes}/${result.totalBytes} バイト記録済み。自動再送せず管理者に確認してください。`;

    case 'processing':
      return '保存処理中の可能性があります。再送せず、時間をおいて状態を再確認してください。';

    case 'pending':
      return '送信開始待ちの状態です。再送せず管理者に確認してください。';

    case 'failed':
      return '保存失敗の記録があります。再送せず管理者に確認してください。';

    default:
      return '保存状態を判定できません。再送せず管理者に確認してください。';
  }
}
