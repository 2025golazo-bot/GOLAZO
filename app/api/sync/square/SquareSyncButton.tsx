'use client';

import { useState } from 'react';

export default function SquareSyncButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSync = async () => {
    setLoading(true);
    setMessage('Square データを同期中...');

    try {
      const response = await fetch('/api/sync/square');
      const data = await response.json();

      if (data.success) {
        setMessage(
          `同期完了: 顧客 ${data.summary.fetchedCustomersCount} 件 / 決済 ${data.summary.fetchedPaymentsCount} 件`
        );
        // 必要に応じて画面データの再取得処理（router.refresh() や State更新）を実行
      } else {
        setMessage(`同期エラー: ${data.error || '失敗しました'}`);
      }
    } catch (error) {
      console.error(error);
      setMessage('通信エラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2 my-4">
      <button
        onClick={handleSync}
        disabled={loading}
        className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium text-sm transition-colors"
      >
        {loading ? '同期処理中...' : 'Square データ手動同期'}
      </button>
      {message && <p className="text-xs text-gray-600">{message}</p>}
    </div>
  );
}
