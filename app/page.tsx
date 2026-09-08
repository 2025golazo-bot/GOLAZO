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
  customer_name?: string;
  item_names?: string;
}

interface ProductSummary {
  name: string;
  count: number;
  totalSales: number;
}

// 体験者管理データ型
interface TrialCustomer {
  id: string;
  name: string;
  age: string;
  trialDate: string;
  purchasedTicket: boolean; // 回数券購入の有無
  ticketType?: string;
}

// キャンペーン実績データ型
interface Campaign {
  id: string;
  title: string;
  period: string;
  count: number;
  sales: number;
}

// 回数券消化進捗データ型
interface TicketProgress {
  id: string;
  customerName: string;
  ticketName: string;
  totalCount: number;
  usedCount: number;
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);

  // 期間選択 State
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);

  // 目標金額 State
  const [annualTarget, setAnnualTarget] = useState<number>(12000000);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [inputTarget, setInputTarget] = useState<string>('12000000');

  // 集計指標 State
  const [metrics, setMetrics] = useState({
    dailySales: 0,
    dailyCount: 0,
    monthlySales: 0,
    monthlyCount: 0,
    yearlySales: 0,
    yearlyCount: 0,
  });

  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [monthlyProducts, setMonthlyProducts] = useState<ProductSummary[]>([]);

  // 体験者管理 State (サンプル初期値付き)
  const [trialCustomers, setTrialCustomers] = useState<TrialCustomer[]>([
    { id: '1', name: '佐藤 陸', age: '11歳 (小5)', trialDate: '2026-09-02', purchasedTicket: true, ticketType: 'ジュニアコース4回券' },
    { id: '2', name: '田中 健太', age: '14歳 (中2)', trialDate: '2026-09-05', purchasedTicket: false },
  ]);
  const [newTrial, setNewTrial] = useState({ name: '', age: '', trialDate: '', purchasedTicket: false, ticketType: '' });

  // キャンペーン管理 State
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    { id: '1', title: '秋の体幹強化体験キャンペーン', period: '2026/09/01 - 09/30', count: 5, sales: 22000 },
    { id: '2', title: 'ご紹介割引特典', period: '通年', count: 3, sales: 36000 },
  ]);

  // 回数券消化進捗 State
  const [tickets, setTickets] = useState<TicketProgress[]>([
    { id: '1', customerName: '山田 太郎', ticketName: 'パーソナルトレーニング 8回券', totalCount: 8, usedCount: 5 },
    { id: '2', customerName: '佐藤 陸', ticketName: 'ジュニア4回券', totalCount: 4, usedCount: 2 },
  ]);

  // 目標金額の読み込み
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

  // Square データ同期
  const handleSync = useCallback(async () => {
    setLoading(true);
    setMessage('Square 売上データを同期中...');

    try {
      const response = await fetch('/api/sync/square');
      const data = await response.json();

      if (data.success && Array.isArray(data.payments)) {
        const sortedPayments = [...data.payments].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setAllPayments(sortedPayments);
        setMessage(
          `自動反映完了: 顧客 ${data.summary.fetchedCustomersCount} 件 / 決済 ${data.summary.fetchedPaymentsCount} 件`
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

  // 選択年月による動的集計
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

    const productsList: ProductSummary[] = Object.keys(productMap).map((name) => ({
      name,
      count: productMap[name].count,
      totalSales: productMap[name].totalSales,
    })).sort((a, b) => b.totalSales - a.totalSales);

    setMonthlyProducts(productsList);
  }, [allPayments, selectedYear, selectedMonth]);

  // 体験者の追加
  const handleAddTrial = () => {
    if (!newTrial.name || !newTrial.trialDate) {
      alert('名前と体験日を入力してください。');
      return;
    }
    setTrialCustomers([
      ...trialCustomers,
      {
        id: Date.now().toString(),
        name: newTrial.name,
        age: newTrial.age || '未設定',
        trialDate: newTrial.trialDate,
        purchasedTicket: newTrial.purchasedTicket,
        ticketType: newTrial.ticketType,
      },
    ]);
    setNewTrial({ name: '', age: '', trialDate: '', purchasedTicket: false, ticketType: '' });
  };

  // 回数券使用（消化）
  const handleUseTicket = (id: string) => {
    setTickets(
      tickets.map((t) => {
        if (t.id === id && t.usedCount < t.totalCount) {
          return { ...t, usedCount: t.usedCount + 1 };
        }
        return t;
      })
    );
  };

  const achievementRate = annualTarget > 0 
    ? Math.min(Math.round((metrics.yearlySales / annualTarget) * 100), 100) 
    : 0;

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-8">
      {/* ヘッダーエリア */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">売上・目標・体験者統合管理</h1>
          <p className="text-sm text-gray-500">Square 自動連携 ＆ プログラム進捗ダッシュボード</p>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-1">
          <button
            onClick={handleSync}
            disabled={loading}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium text-sm transition-colors shadow-sm"
          >
            {loading ? 'Square同期中...' : 'Squareから売上を再同期'}
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

      {/* 売上指標カード（日報・今月・年度目標） */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">本日の売上（日報）</p>
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

      {/* 2カラムレイアウト: 体験者管理 ＆ 回数券消化進捗 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 体験者管理 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h2 className="text-lg font-bold text-gray-900">体験者管理</h2>
            <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-semibold">
              全 {trialCustomers.length} 名
            </span>
          </div>

          {/* 新規体験者登録フォーム */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
            <p className="text-xs font-bold text-gray-700">新規体験者の追加</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                placeholder="お名前"
                value={newTrial.name}
                onChange={(e) => setNewTrial({ ...newTrial, name: e.target.value })}
                className="p-2 border rounded border-gray-300 bg-white"
              />
              <input
                type="text"
                placeholder="年齢・学年 (例: 10歳/小4)"
                value={newTrial.age}
                onChange={(e) => setNewTrial({ ...newTrial, age: e.target.value })}
                className="p-2 border rounded border-gray-300 bg-white"
              />
              <input
                type="date"
                value={newTrial.trialDate}
                onChange={(e) => setNewTrial({ ...newTrial, trialDate: e.target.value })}
                className="p-2 border rounded border-gray-300 bg-white"
              />
              <select
                value={newTrial.purchasedTicket ? 'true' : 'false'}
                onChange={(e) => setNewTrial({ ...newTrial, purchasedTicket: e.target.value === 'true' })}
                className="p-2 border rounded border-gray-300 bg-white"
              >
                <option value="false">回数券未購入</option>
                <option value="true">回数券購入済み</option>
              </select>
            </div>
            <button
              onClick={handleAddTrial}
              className="w-full py-1.5 bg-gray-800 text-white rounded text-xs font-semibold hover:bg-gray-900"
            >
              体験者を登録
            </button>
          </div>

          {/* 体験者一覧テーブル */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-100 uppercase text-gray-500 font-semibold">
                <tr>
                  <th className="p-2.5">名前</th>
                  <th className="p-2.5">年齢 / 学年</th>
                  <th className="p-2.5">体験日</th>
                  <th className="p-2.5">回数券購入</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {trialCustomers.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="p-2.5 font-bold text-gray-900">{t.name}</td>
                    <td className="p-2.5">{t.age}</td>
                    <td className="p-2.5">{t.trialDate}</td>
                    <td className="p-2.5">
                      {t.purchasedTicket ? (
                        <span className="px-2 py-0.5 text-xs font-bold bg-green-100 text-green-800 rounded-full">
                          購入済み
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                          未購入
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 回数券の消化進捗 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h2 className="text-lg font-bold text-gray-900">回数券の消化進捗</h2>
            <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-semibold">
              進行中 {tickets.length} 件
            </span>
          </div>

          <div className="space-y-4">
            {tickets.map((t) => {
              const percentage = Math.round((t.usedCount / t.totalCount) * 100);
              const isFinished = t.usedCount >= t.totalCount;

              return (
                <div key={t.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{t.customerName}</p>
                      <p className="text-xs text-gray-500">{t.ticketName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-gray-800">
                        {t.usedCount} / {t.totalCount} 回
                      </p>
                      <span className="text-xs text-gray-400">({percentage}%)</span>
                    </div>
                  </div>

                  {/* 消化プログレスバー */}
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${
                        isFinished ? 'bg-red-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    {isFinished ? (
                      <span className="text-xs text-red-600 font-bold">消化完了（次回更新のご案内）</span>
                    ) : (
                      <span className="text-xs text-gray-500">残り {t.totalCount - t.usedCount} 回</span>
                    )}
                    <button
                      onClick={() => handleUseTicket(t.id)}
                      disabled={isFinished}
                      className="px-2.5 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:bg-gray-300"
                    >
                      1回分消化
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* キャンペーンの内容と実績 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-lg font-bold text-gray-900">キャンペーンの内容と実績</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((c) => (
            <div key={c.id} className="p-4 border rounded-xl bg-gradient-to-r from-blue-50/50 to-white space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-900">{c.title}</h3>
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded font-medium">
                  {c.period}
                </span>
              </div>
              <div className="flex justify-between items-end pt-2">
                <div>
                  <p className="text-xs text-gray-500">適用・成約件数</p>
                  <p className="text-lg font-bold text-gray-800">{c.count} 件</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">売上貢献額</p>
                  <p className="text-lg font-bold text-blue-600">¥{c.sales.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 今月販売された商品内訳 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">{selectedYear}年{selectedMonth}月に販売された商品内訳 (Square連動)</h2>
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

      {/* Square取引明細 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{selectedYear}年{selectedMonth}月の決済明細 (Square自動同期)</h2>
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
