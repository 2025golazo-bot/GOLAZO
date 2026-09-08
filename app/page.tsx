　'use client';

import { useState } from 'react';

interface TransactionItem {
  id: string;
  date: string;
  client: string;
  item: string;
  amount: number;
  staff: 'TAKA' | 'NANA';
  type: '回数券' | '物販' | '体験';
  campaign?: string;
}

interface TicketProgress {
  id: string;
  client: string;
  name: string;
  total: number;
  remaining: number;
}

interface TrialClient {
  id: string;
  date: string;
  name: string;
  age: number;
  staff: 'TAKA' | 'NANA';
  converted: boolean;
}

export default function TransactionsPage() {
  const [transactions] = useState<TransactionItem[]>([
    { id: '1', date: '2026-09-08', client: '鈴木 蓮', item: 'ジュニア体幹 4回券', amount: 16000, staff: 'TAKA', type: '回数券', campaign: '夏休みキャンペーン' },
    { id: '2', date: '2026-09-07', client: '山田 太郎', item: 'パーソナル 8回券', amount: 64000, staff: 'NANA', type: '回数券' },
    { id: '3', date: '2026-09-05', client: '佐藤 花子', item: 'プロテイン', amount: 4500, staff: 'TAKA', type: '物販' },
    { id: '4', date: '2026-09-02', client: '高橋 一郎', item: '体験トレーニング', amount: 3000, staff: 'TAKA', type: '体験', campaign: 'SNS初回特典' },
  ]);

  const [tickets] = useState<TicketProgress[]>([
    { id: '1', client: '鈴木 蓮', name: 'ジュニア体幹 4回券', total: 4, remaining: 1 },
    { id: '2', client: '山田 太郎', name: 'パーソナル 8回券', total: 8, remaining: 5 },
  ]);

  const [trials] = useState<TrialClient[]>([
    { id: '1', date: '2026-09-02', name: '高橋 一郎', age: 35, staff: 'TAKA', converted: true },
    { id: '2', date: '2026-09-06', name: '渡辺 美咲', age: 28, staff: 'NANA', converted: false },
  ]);

  const monthlyTarget = 500000;
  const todayStr = '2026-09-08';
  const todaySales = transactions.filter(t => t.date === todayStr).reduce((sum, t) => sum + t.amount, 0);
  const monthlySales = transactions.reduce((sum, t) => sum + t.amount, 0);
  const achievementRate = Math.min(Math.round((monthlySales / monthlyTarget) * 100), 100);

  const trialCount = transactions.filter(t => t.type === '体験').length;
  const ticketCount = transactions.filter(t => t.type === '回数券').length;
  const productCount = transactions.filter(t => t.type === '物販').length;

  const takaSales = transactions.filter(t => t.staff === 'TAKA').reduce((sum, t) => sum + t.amount, 0);
  const nanaSales = transactions.filter(t => t.staff === 'NANA').reduce((sum, t) => sum + t.amount, 0);

  const campaignStats = [
    { name: '夏休みキャンペーン', count: transactions.filter(t => t.campaign === '夏休みキャンペーン').length, revenue: transactions.filter(t => t.campaign === '夏休みキャンペーン').reduce((sum, t) => sum + t.amount, 0) },
    { name: 'SNS初回特典', count: transactions.filter(t => t.campaign === 'SNS初回特典').length, revenue: transactions.filter(t => t.campaign === 'SNS初回特典').reduce((sum, t) => sum + t.amount, 0) },
  ];

  const totalTrialsCount = trials.length;
  const convertedTrialsCount = trials.filter(t => t.converted).length;
  const cvrRate = totalTrialsCount > 0 ? Math.round((convertedTrialsCount / totalTrialsCount) * 100) : 0;

  return (
    <main className="p-6 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen font-sans">
      {/* ヘッダータブ風ナビゲーション */}
      <div className="bg-white px-6 py-4 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-6">
          <span className="font-black text-gray-900 text-lg">GYM MANAGER</span>
          <div className="flex gap-2 text-xs font-bold">
            <span className="px-3 py-1.5 bg-blue-600 text-white rounded-lg shadow-sm">売上管理</span>
            <span className="px-3 py-1.5 text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer">顧客カルテ</span>
            <span className="px-3 py-1.5 text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer">タスク・議事録</span>
          </div>
        </div>
        <span className="px-3 py-1.5 bg-blue-50 text-blue-700 font-bold rounded-lg text-xs border border-blue-100">Squareデータ連携中</span>
      </div>

      {/* 1. 売上集計・指標表示 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <p className="text-xs font-bold text-gray-400">本日の売上</p>
          <p className="text-2xl font-black text-gray-900">¥{todaySales.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <p className="text-xs font-bold text-gray-400">今月の売上</p>
          <p className="text-2xl font-black text-blue-600">¥{monthlySales.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <p className="text-xs font-bold text-gray-400">体験者数 / 回数券販売</p>
          <p className="text-xl font-bold text-gray-900">{trialCount}名 <span className="text-xs text-gray-400 font-normal">/</span> {ticketCount}件 <span className="text-xs text-gray-400 font-normal">(物販:{productCount})</span></p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-gray-400">目標達成率 (目標: ¥{monthlyTarget.toLocaleString()})</span>
            <span className="text-blue-600">{achievementRate}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${achievementRate}%` }}></div>
          </div>
        </div>
      </div>

      {/* 2. データ連携 & 担当者別内訳 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 lg:col-span-2">
          <h2 className="text-base font-bold text-gray-900">直近の購入・売上トランザクション</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b text-gray-400 font-bold bg-gray-50">
                  <th className="p-3">日付</th>
                  <th className="p-3">顧客名</th>
                  <th className="p-3">購入内容</th>
                  <th className="p-3">種別</th>
                  <th className="p-3">担当</th>
                  <th className="p-3 text-right">金額</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {transactions.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50/50">
                    <td className="p-3 text-gray-500">{t.date}</td>
                    <td className="p-3 font-bold text-gray-900">{t.client}</td>
                    <td className="p-3 text-gray-700">{t.item}</td>
                    <td className="p-3"><span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-600">{t.type}</span></td>
                    <td className="p-3"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.staff === 'TAKA' ? 'bg-indigo-50 text-indigo-700' : 'bg-pink-50 text-pink-700'}`}>{t.staff}</span></td>
                    <td className="p-3 text-right font-black text-gray-900">¥{t.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900">担当者別売上比率</h2>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 flex justify-between items-center">
                <span className="font-bold text-indigo-900">TAKA 担当</span>
                <span className="font-black text-indigo-700 text-sm">¥{takaSales.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-xl bg-pink-50/50 border border-pink-100 flex justify-between items-center">
                <span className="font-bold text-pink-900">NANA 担当</span>
                <span className="font-black text-pink-700 text-sm">¥{nanaSales.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* 3. キャンペーン分析 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900">キャンペーン貢献度分析</h2>
            <div className="space-y-3">
              {campaignStats.map((c, i) => (
                <div key={i} className="p-3 border rounded-xl bg-gray-50 space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>{c.name}</span>
                    <span className="text-blue-600">¥{c.revenue.toLocaleString()}</span>
                  </div>
                  <p className="text-[11px] text-gray-400">適用件数: {c.count}件</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. 回数券消化 & 体験者管理 (CVR) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 回数券消化進捗 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900">回数券消化進捗</h2>
          <div className="space-y-4">
            {tickets.map((tk) => {
              const percent = Math.round(((tk.total - tk.remaining) / tk.total) * 100);
              return (
                <div key={tk.id} className="p-3.5 border rounded-xl bg-gray-50 space-y-2 text-xs">
                  <div className="flex justify-between font-bold">
                    <span className="text-gray-900">{tk.client} <span className="text-gray-400 font-normal">({tk.name})</span></span>
                    <span className="text-blue-600">残り {tk.remaining}回 / 全{tk.total}回</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 体験者トラッキング & CVR */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-gray-900">体験者トラッキング (CVR)</h2>
            <span className="px-2.5 py-1 bg-green-50 text-green-700 font-bold rounded-lg text-xs border border-green-100">
              成約率 (CVR): {cvrRate}% ({convertedTrialsCount}/{totalTrialsCount}名)
            </span>
          </div>
          <div className="space-y-2">
            {trials.map(tr => (
              <div key={tr.id} className="p-3 border rounded-xl flex items-center justify-between text-xs bg-white">
                <div>
                  <p className="font-bold text-gray-900">{tr.name} <span className="text-gray-400 font-normal">({tr.age}歳)</span></p>
                  <p className="text-[11px] text-gray-400 mt-0.5">体験日: {tr.date} / 担当: {tr.staff}</p>
                </div>
                <div>
                  {tr.converted ? (
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg text-[10px]">回数券購入 (CV)</span>
                  ) : (
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-500 font-bold rounded-lg text-[10px]">検討中・未購入</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
