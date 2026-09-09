'use client';

import React, { useState } from 'react';

export default function SquareIntegrationSection() {
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ▼【ここにAPIを呼び出すコードを組み込んでいます】
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      // 1. Next.jsのAPI Routes（サーバーレス側）にリクエストを送る
      const res = await fetch('/api/square/sync');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '同期に失敗しました');
      }

      // 2. 成功したら画面の状態を更新
      setLastSynced(data.syncedAt);
      alert(data.message);
      
      // ※ 必要に応じて、ここで取得した売上データ（data.paymentsなど）を
      // stateに保存して画面に一覧表示することも可能です。

    } catch (error: any) {
      alert(`エラーが発生しました: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // 連携解除のハンドラー
  const handleDisconnect = () => {
    if (confirm('Squareとの連携を解除してもよろしいですか？')) {
      setIsConnected(false);
      setLastSynced(null);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span>💳</span> Square 売上・決済連携
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Squareアカウントと連携して、決済情報や売上実績を自動で同期します。
          </p>
        </div>

        {/* 連携状態に応じたボタン表示 */}
        <div className="flex items-center gap-3">
          {isConnected ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                連携中
              </span>
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="bg-[#5e9bc4] hover:bg-[#4d85ab] text-white px-4 py-2 rounded-xl text-xs font-semibold transition shadow-sm disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSyncing ? '同期中...' : '🔄 今すぐ同期'}
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-semibold transition"
              >
                設定
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition shadow-sm flex items-center gap-2"
            >
              <span>🔗</span> Squareアカウントを連携する
            </button>
          )}
        </div>
      </div>

      {/* 最終同期日時の表示 */}
      {isConnected && lastSynced && (
        <div className="text-xs text-slate-400 pt-2 border-t border-slate-100 flex justify-between items-center">
          <span>最終同期日時: {lastSynced}</span>
          <span className="text-emerald-600 font-medium">ステータス: 正常</span>
        </div>
      )}

      {/* 連携・設定モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-800">Square連携の設定</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {!isConnected ? (
              <div className="space-y-4 text-sm text-slate-600">
                <p>
                  Squareアカウントを連携すると、店舗での決済データや売上状況を自動で取得・反映できるようになります。
                </p>
                <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1 text-slate-500">
                  <div>✓ 決済データの自動同期</div>
                  <div>✓ 売上実績の取得</div>
                </div>
                <button
                  onClick={() => {
                    setIsConnected(true);
                    setIsModalOpen(false);
                    setLastSynced(new Date().toLocaleString('ja-JP'));
                  }}
                  className="w-full py-2.5 bg-[#5e9bc4] hover:bg-[#4d85ab] text-white rounded-xl font-semibold transition shadow-sm text-center"
                >
                  Squareと連携する（接続状態にする）
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-sm text-slate-600">
                <p>現在、Squareアカウントと正常に連携されています。</p>
                <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                  <button
                    onClick={handleDisconnect}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 rounded-xl text-xs font-semibold transition"
                  >
                    連携を解除する
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
                  >
                    閉じる
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
