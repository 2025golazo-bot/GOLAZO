'use client';

import { useState, useEffect, useCallback } from 'react';

// 年間目標金額
const ANNUAL_TARGET = 12000000;

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // 集計データ用 State
  const [metrics, setMetrics] = useState({
    dailySales: 0,
    dailyCount: 0,
    monthlySales: 0,
    monthlyCount: 0,
    yearlySales: 0,
    yearlyCount: 0,
  });

  const handleSync = useCallback(async () => {
    setLoading(true);
    setMessage('Square データを同期・集計中...');

    try {
      const response = await fetch('/api/sync/square');
      const data = await response.json();

      if (data.success && Array.isArray(data.payments)) {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const currentYear = now.getFullYear();

        let daily = 0, dCount = 0;
        let monthly = 0, mCount = 0;
        let yearly = 0, yCount = 0;

        data.payments.forEach((p: any) => {
          const createdAt = p.created_at;
          if (!createdAt) return;

          const amount = p.amount_money?.amount ? Number(p.amount_money.amount) : 0;
          const dateStr = createdAt.split('T')[0];
          const yearMonth = dateStr.substring(0, 7);
          const year = Number(dateStr.substring(0, 4));

          // 日報集計
          if (dateStr === todayStr) {
            daily += amount;
            dCount++;
          }
          // 月報集計
          if (yearMonth === currentYearMonth) {
            monthly += amount;
            mCount++;
          }
          // 年度（年）集計
          if (year === currentYear) {
            yearly += amount;
            yCount++;
          }
        });

        setMetrics({
          dailySales: daily,
          dailyCount: dCount,
          monthlySales: monthly,
          monthlyCount: mCount,
          yearlySales: yearly,
          yearlyCount: yCount,
        });

        setMessage(
          `同期完了: 顧客 ${data.summary.fetchedCustomersCount} 件 / 決済 ${data.summary.fetchedPaymentsCount} 件`
        );
      } else {
        setMessage(`同期エラー: ${data.error || 'データ取得に失敗しました'}`);
      }
    } catch (error) {
      console.error(error);
      setMessage('通信エラーが発生しました。');
    } finally {
      setLoading(false);
    }
  }, []);

  // ページ読み込み時に自動でデータを取得
  useEffect(() => {
    handleSync();
  }, [handleSync]);

  // 目標達成率の計算
  const achievementRate = ANNUAL_TARGET > 0 
    ? Math.min(Math.round((metrics.yearlySales / ANNUAL_TARGET) * 100), 100) 
    : 0;

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-6">
      {/* ヘッダーエリア */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">GOLAZO Gym Management System</h1>
          <p className="text-sm text-gray-500">売上・ダッシュボード管理</p>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-1">
          <button
            onClick={handleSync}
            disabled={loading}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium text-sm transition-colors shadow-sm"
          >
            {loading ? '同期処理中...' : '手動更新'}
          </button>
          {message && <p className="text-xs text-gray-600">{message}</p>}
        </div>
      </div>

      {/* 指標カードグリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 日報カード */}
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">本日の売上（日報）</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-2">
            ¥{metrics.dailySales.toLocaleString()}
          </h3>
          <p className="text-xs text-gray-500 mt-1">件数: {metrics.dailyCount} 件</p>
        </div>

        {/* 月報カード */}
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">今月の売上（月報）</p>
          <h3 className="text-2xl font-bold text-blue-600 mt-2">
            ¥{metrics.monthlySales.toLocaleString()}
          </h3>
          <p className="text-xs text-gray-500 mt-1">件数: {metrics.monthlyCount} 件</p>
        </div>

        {/* 年度売上カード */}
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">今年度の累計売上</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-2">
            ¥{metrics.yearlySales.toLocaleString()}
          </h3>
          <p className="text-xs text-gray-500 mt-1">件数: {metrics.yearlyCount} 件</p>
        </div>

        {/* 目標達成率カード */}
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">年間目標達成率</p>
          <h3 className="text-2xl font-bold text-green-600 mt-2">
            {achievementRate}%
          </h3>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${achievementRate}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400 mt-1">目標: ¥{ANNUAL_TARGET.toLocaleString()}</p>
        </div>
      </div>
    </main>
  );
}
