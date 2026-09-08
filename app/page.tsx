'use client';

import { useState } from 'react';

export default function SalesPage() {
  // 表示期間の切り替え用 (daily / monthly / yearly)
  const [viewMode, setViewMode] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [selectedDate, setSelectedDate] = useState('2026-09-08');
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [selectedYear, setSelectedYear] = useState('2026');

  // サンプルデータ：Square自動連携を想定した売上・取引データ
  const [salesData] = useState([
    { id: '1', date: '2026-09-08', client: '山田 太郎', course: 'パーソナルトレーニング 60分', category: '通常セッション', amount: 8800, payment: 'Square決済' },
    { id: '2', date: '2026-09-08', client: '鈴木 蓮 (保護者: 鈴木 花子)', course: 'ジュニア体幹 4回券', category: '回数券', amount: 32000, payment: 'Square決済' },
    { id: '3', date: '2026-09-05', client: '佐藤 健太', course: '体験トレーニング', category: '体験', amount: 5000, payment: '現金' },
    { id: '4', date: '2026-08-20', client: '高橋 美咲', course: 'パーソナルトレーニング 90分', category: '通常セッション', amount: 12000, payment: 'Square決済' },
  ]);

  // 体験者管理データ
  const [trialClients, setTrialClients] = useState([
    { id: '1', name: '佐藤 健太', age: '14歳 (中2)', trialDate: '2026-09-05', status: '成約 (回数券購入)' },
    { id: '2', name: '田中 陽翔', age: '10歳 (小4)', trialDate: '2026-09-07', status: '検討中' },
  ]);

  // キャンペーン実績データ
  const [campaigns] = useState([
    { id: '1', name: '夏季体幹強化キャンペーン', period: '2026/7/1〜8/31', count: 12, contribution: 384000 },
    { id: '2', name: 'お友達紹介特典', period: '通年', count: 5, contribution: 44000 },
  ]);

  // 回数券の消化進捗データ
  const [ticketProgress] = useState([
    { id: '1', client: '鈴木 蓮', ticketName: 'ジュニア体幹 4回券', total: 4, remaining: 1 },
    { id: '2', client: '山田 太郎', ticketName: 'パーソナル 8回券', total: 8, remaining: 5 },
  ]);

  // フィルタリング
  const filteredSales = salesData.filter((item) => {
    if (viewMode === 'daily') return item.date === selectedDate;
    if (viewMode === 'monthly') return item.date.startsWith(selectedMonth);
    if (viewMode === 'yearly') return item.date.startsWith(selectedYear);
    return true;
  });

  const totalSales = filteredSales.reduce((acc, cur) => acc + cur.amount, 0);
  const targetSales = 500000; // 月間目標50万円
  const achievementRate = Math.round((totalSales / targetSales) * 100);

  return (
    <main className="p-6 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen">
      {/* ヘッダー＆期間切り替え */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">売上管理 ＆ ダッシュボード</h1>
          <p className="text-xs text-gray-500 mt-1">Square自動連携・日報・月報・年報・キャンペーン実績</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setViewMode('daily')}
            className={`px-3 py-1.5 rounded-lg transition ${viewMode === 'daily' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}
          >
            本日の売上 (日報)
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-3 py-1.5 rounded-lg transition ${viewMode === 'monthly' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}
          >
            今月の売上 (月報)
          </button>
          <button
            onClick={() => setViewMode('yearly')}
            className={`px-3 py-1.5 rounded-lg transition ${viewMode === 'yearly' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}
          >
            年度累計
          </button>
        </div>
      </div>

      {/* 絞り込みセレクター */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-3 text-xs">
        <span className="font-bold text-gray-700">表示対象の選択:</span>
        {viewMode === 'daily' && (
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="p-2 border rounded-lg font-medium" />
        )}
        {viewMode === 'monthly' && (
          <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="p-2 border rounded-lg font-medium" />
        )}
        {viewMode === 'yearly' && (
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="p-2 border rounded-lg font-medium">
            <option value="2026">2026年度</option>
            <option value="2025">2025年度</option>
          </select>
        )}
      </div>

      {/* 基本売上指標 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-500">
            {viewMode === 'daily' ? '本日' : viewMode === 'monthly' ? '今月' : '年度'}の売上総額 (Square連携)
          </p>
          <p className="text-3xl font-black text-blue-600 mt-2">¥{totalSales.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-500">該当期間の取引・来店件数</p>
          <p className="text-3xl font-black text-gray-900 mt-2">{filteredSales.length} <span className="text-xs font-normal text-gray-400">件</span></p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-500">月間目標達成率 (目標: ¥500,000)</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-green-600">{achievementRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-green-600 h-2 rounded-full" style={{ width: `${Math.min(achievementRate, 100)}%` }}></div>
          </div>
        </div>
      </div>

      {/* 取引履歴 ＆ 購入商品内訳 */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900">売上・購入商品内訳一覧</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-500">
                <th className="p-3 font-bold">日付</th>
                <th className="p-3 font-bold">顧客名 (お子様/保護者)</th>
                <th className="p-3 font-bold">購入商品・コース</th>
                <th className="p-3 font-bold">カテゴリ</th>
                <th className="p-3 font-bold">金額</th>
                <th className="p-3 font-bold">決済方法</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredSales.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-3 text-gray-600">{item.date}</td>
                  <td className="p-3 font-bold text-gray-900">{item.client}</td>
                  <td className="p-3 text-gray-800 font-medium">{item.course}</td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold">{item.category}</span></td>
                  <td className="p-3 font-black text-blue-600">¥{item.amount.toLocaleString()}</td>
                  <td className="p-3 text-gray-500">{item.payment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2カラム：体験者管理 ＆ 回数券消化進捗 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 体験者管理 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900">体験者管理セクション</h2>
          <div className="space-y-3">
            {trialClients.map((t) => (
              <div key={t.id} className="p-3 border rounded-xl bg-gray-50 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-gray-900">{t.name} <span className="text-gray-500 font-normal">({t.age})</span></p>
                  <p className="text-[11px] text-gray-400 mt-0.5">体験日: {t.trialDate}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-lg font-bold text-[10px] ${t.status.includes('成約') ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 回数券消化進捗 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900">回数券の消化進捗</h2>
          <div className="space-y-4">
            {ticketProgress.map((tp) => {
              const消化率 = Math.round(((tp.total - tp.remaining) / tp.total) * 100);
              return (
                <div key={tp.id} className="p-3 border rounded-xl bg-gray-50 space-y-2 text-xs">
                  <div className="flex justify-between font-bold">
                    <span className="text-gray-900">{tp.client} <span className="text-gray-500 font-normal">({tp.ticketName})</span></span>
                    <span className="text-blue-600">残り {tp.remaining}回 / 全{tp.total}回</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${消化率}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* キャンペーン実績セクション */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900">キャンペーン内容と実績</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((c) => (
            <div key={c.id} className="p-4 border rounded-xl bg-gray-50 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="font-bold text-gray-900 text-sm">{c.name}</span>
                <span className="text-gray-500">{c.period}</span>
              </div>
              <p className="text-gray-600">適用・成約件数: <span className="font-bold text-gray-900">{c.count}件</span></p>
              <p className="text-gray-600">売上貢献額: <span className="font-black text-blue-600">¥{c.contribution.toLocaleString()}</span></p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
