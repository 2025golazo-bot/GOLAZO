'use client';

import { useState } from 'react';

export default function SalesPage() {
  // 売上管理の本来のコード
  const [salesData] = useState([
    { id: '1', date: '2026-09-01', client: '山田 太郎', course: 'パーソナルトレーニング 60分', amount: 8800, payment: 'Square決済' },
    { id: '2', date: '2026-09-02', client: '鈴木 花子', course: '回数券（4回分）', amount: 32000, payment: 'Square決済' },
    { id: '3', date: '2026-09-05', client: '佐藤 健太', course: '体験トレーニング', amount: 5000, payment: '現金' },
  ]);

  const totalSales = salesData.reduce((acc, cur) => acc + cur.amount, 0);

  return (
    <main className="p-6 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">売上管理</h1>
          <p className="text-xs text-gray-500 mt-1">パーソナルジムGOLAZOの売上実績・決済データの確認</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-500">今月総売上</p>
          <p className="text-3xl font-black text-blue-600 mt-2">¥{totalSales.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-500">今月来店件数</p>
          <p className="text-3xl font-black text-gray-900 mt-2">{salesData.length} <span className="text-xs font-normal text-gray-400">件</span></p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-500">目標達成率 (50万円目標)</p>
          <p className="text-3xl font-black text-green-600 mt-2">{Math.round((totalSales / 500000) * 100)}%</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900">最近の取引・売上履歴</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-500">
                <th className="p-3 font-bold">日付</th>
                <th className="p-3 font-bold">顧客名</th>
                <th className="p-3 font-bold">コース・内容</th>
                <th className="p-3 font-bold">金額</th>
                <th className="p-3 font-bold">決済方法</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {salesData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-600">{item.date}</td>
                  <td className="p-3 font-bold text-gray-900">{item.client}</td>
                  <td className="p-3 text-gray-700">{item.course}</td>
                  <td className="p-3 font-bold text-blue-600">¥{item.amount.toLocaleString()}</td>
                  <td className="p-3 text-gray-500">{item.payment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
