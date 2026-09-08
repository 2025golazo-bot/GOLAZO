'use client';

import { useState, useEffect, useCallback } from 'react';

interface Payment {
  id: string;
  created_at: string;
  amount_money?: {
    amount: number;
    currency: string;
  };
  status: string;
  customer_id?: string;
  note?: string;
  item_names?: string;
}

interface ProductSummary {
  name: string;
  count: number;
  totalSales: number;
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);

  // 日付選択 State
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);

  // 目標金額 State
  const [annualTarget, setAnnualTarget] = useState<number>(12000000);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [inputTarget, setInputTarget] = useState<string>('12000000');

  // 集計データ State
  const [metrics, setMetrics] = useState({
    dailySales: 0,
    dailyCount: 0,
    monthlySales: 0,
    monthlyCount: 0,
    yearlySales: 0,
    yearlyCount: 0,
  });

  // 選択月の取引一覧＆商品別集計
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [monthlyProducts, setMonthlyProducts] = useState<ProductSummary[]>([]);

  useEffect(() => {
    const savedTarget = localStorage.getItem('GOLAZO_ANNUAL_TARGET');
    if (savedTarget) {
      const parsed = Number(savedTarget);
      if (!isNaN(parsed) && parsed > 0) {
        setAnnualTarget(parsed);
        setInputTarget(savedTarget);
      }
    }
  }, []);

  const handleSaveTarget = () => {
    const newTarget = Number(inputTarget);
    if (!isNaN(newTarget) && newTarget > 0) {
      setAnnualTarget(newTarget);
      localStorage.setItem('GOLAZO_ANNUAL_TARGET', newTarget.toString());
      setIsEditingTarget(false);
    } else {
      alert('有効な数値を入力してください。');
    }
  };

  const handleSync = useCallback(async () => {
    setLoading(true);
    setMessage('Square データを同期・集計中...');

    try {
      const response = await fetch('/api/sync/square');
      const data = await response.json();

      if (data.success && Array.isArray(data.payments)) {
        const sortedPayments = [...data.payments].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setAllPayments(sortedPayments);
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

  useEffect(() => {
    handleSync();
  }, [handleSync]);

  useEffect(() => {
    if (allPayments.length === 0) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const targetYearMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

    let daily = 0, dCount = 0;
    let monthly = 0, mCount = 0;
    let yearly = 0, yCount = 0;

    const monthlyList: Payment[] = [];
    const productMap: { [key: string]: { count: number; totalSales: number } } = {};

    allPayments.forEach((p) => {
      const createdAt = p.created_at;
      if (!createdAt) return;

      const amount = p.amount_money?.amount ? Number(p.amount_money.amount) : 0;
      const dateStr = createdAt.split('T')[0];
      const yearMonth = dateStr.substring(0, 7);
      const year = Number(dateStr.substring(0, 4));

      if (dateStr === todayStr) {
        daily += amount;
        dCount++;
      }
      if (yearMonth === targetYearMonth) {
        monthly += amount;
        mCount++;
        monthlyList.push(p);

        // 商品別集計
        const itemName = p.item_names || '店頭決済・その他';
        if (!productMap[itemName]) {
          productMap[itemName] = { count: 0, totalSales: 0 };
        }
        productMap[itemName].count += 1;
        productMap[itemName].totalSales += amount;
      }
      if (year === selectedYear) {
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

    setFilteredPayments(monthlyList);

    // 商品集計配列化・売上順ソート
    const productsList: ProductSummary[] = Object.keys(productMap).map((name) => ({
      name,
      count: productMap[name].count,
      totalSales: productMap[name].totalSales,
    })).sort((a, b) => b.totalSales - a.totalSales);

    setMonthlyProducts(productsList);
  }, [allPayments, selectedYear, selectedMonth]);

  const achievementRate = annualTarget > 0 
    ? Math.min(Math.round((metrics.yearlySales / annualTarget) * 100), 100) 
    : 0;

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-8">
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

      {/* 期間選択フィルター */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <span className="text-sm font-semibold text-gray-700">表示対象期間:</span>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:border-blue-500"
        >
          {[2024, 2025, 2026, 2027].map((y) => (
            <option key={y} value={y}>{y} 年</option>
          ))}
        </select>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:border-blue-500"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>{m} 月</option>
          ))}
        </select>
      </div>

      {/* 指標カードグリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">本日の売上（今日）</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-2">¥{metrics.dailySales.toLocaleString()}</h3>
          <p className="text-xs text-gray-500 mt-1">件数: {metrics.dailyCount} 件</p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">{selectedYear}年{selectedMonth}月の売上</p>
          <h3 className="text-2xl font-bold text-blue-600 mt-2">¥{metrics.monthlySales.toLocaleString()}</h3>
          <p className="text-xs text-gray-500 mt-1">件数: {metrics.monthlyCount} 件</p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">{selectedYear}年度 累計売上</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-2">¥{metrics.yearlySales.toLocaleString()}</h3>
          <p className="text-xs text-gray-500 mt-1">件数: {metrics.yearlyCount} 件</p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">{selectedYear}年 目標達成率</p>
            {!isEditingTarget && (
              <button onClick={() => setIsEditingTarget(true)} className="text-xs text-blue-600 hover:underline">
                目標を変更
              </button>
            )}
          </div>
          <h3 className="text-2xl font-bold text-green-600 mt-2">{achievementRate}%</h3>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${achievementRate}%` }}></div>
          </div>
          <div className="mt-3 text-xs">
            {isEditingTarget ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  value={inputTarget}
                  onChange={(e) => setInputTarget(e.target.value)}
                  className="w-28 px-2 py-1 text-xs border rounded border-gray-300"
                />
                <button onClick={handleSaveTarget} className="px-2 py-1 text-white bg-green-600 rounded text-xs">保存</button>
                <button onClick={() => setIsEditingTarget(false)} className="px-2 py-1 text-gray-600 bg-gray-100 rounded text-xs">キャンセル</button>
              </div>
            ) : (
              <p className="text-gray-400">目標: ¥{annualTarget.toLocaleString()}</p>
            )}
          </div>
        </div>
      </div>

      {/* 今月販売した商品一覧（商品別内訳） */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">{selectedYear}年{selectedMonth}月に販売された商品内訳</h2>
        {monthlyProducts.length === 0 ? (
          <p className="text-sm text-gray-400">この月に販売された商品はありません。</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {monthlyProducts.map((prod, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{prod.name}</p>
                  <p className="text-xs text-gray-500">{prod.count} 件販売</p>
                </div>
                <p className="font-bold text-blue-600 text-sm">¥{prod.totalSales.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 取引一覧テーブル（商品名表記付き） */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{selectedYear}年{selectedMonth}月の取引明細</h2>
          <span className="text-xs text-gray-500">{filteredPayments.length} 件</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 font-semibold">決済日時</th>
                <th className="px-6 py-3 font-semibold">商品名 / メモ</th>
                <th className="px-6 py-3 font-semibold">金額</th>
                <th className="px-6 py-3 font-semibold">ステータス</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                    {loading ? 'データ読み込み中...' : '該当する取引データがありません。'}
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => {
                  const dateFormatted = new Date(payment.created_at).toLocaleString('ja-JP', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const amount = payment.amount_money?.amount || 0;

                  return (
                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">{dateFormatted}</td>
                      <td className="px-6 py-4 text-gray-900 font-medium">
                        {payment.item_names || '店頭決済・その他'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">
                        ¥{amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 text-xs font-semibold text-green-700 bg-green-50 rounded-full border border-green-200">
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
