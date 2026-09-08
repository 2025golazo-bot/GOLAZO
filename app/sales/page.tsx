'use client';

import React, { useState, useMemo } from 'react';

interface Transaction {
  id: string;
  date: string;
  parentName: string;
  studentName: string;
  itemName: string;
  amount: number;
  paymentType: 'クレジットカード' | '現金' | '口座振替';
}

const mockTransactions: Transaction[] = [
  { id: 'tx-001', date: '2026-09-01', parentName: '藤田 奈々', studentName: '藤田 陸', itemName: '回数券 10回分', amount: 33000, paymentType: 'クレジットカード' },
  { id: 'tx-002', date: '2026-09-03', parentName: '佐藤 花子', studentName: '佐藤 翔', itemName: '単発セッション', amount: 4400, paymentType: '現金' },
  { id: 'tx-003', date: '2026-08-25', parentName: '鈴木 一郎', studentName: '鈴木 蓮', itemName: '回数券 5回分', amount: 18000, paymentType: 'クレジットカード' },
];

export default function SalesPage() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);

  const filteredTransactions = useMemo(() => {
    return mockTransactions.filter((item) => {
      return item.date >= startDate && item.date <= endDate;
    });
  }, [startDate, endDate]);

  const totalSales = useMemo(() => {
    return filteredTransactions.reduce((sum, item) => sum + item.amount, 0);
  }, [filteredTransactions]);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">売上管理</h1>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-6">
        <h2 className="text-sm font-semibold text-slate-600 mb-3">期日指定フィルター</h2>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]"
          />
          <span className="text-slate-500">〜</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]"
          />
          <button
            onClick={() => { setStartDate(firstDay); setEndDate(lastDay); }}
            className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs px-3 py-2 rounded font-medium transition"
          >
            今月にリセット
          </button>
        </div>
      </div>

      <div className="bg-[#5e9bc4] text-white p-6 rounded-lg shadow border border-sky-600 mb-6 flex justify-between items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-sky-100">期間内 売上合計</p>
          <p className="text-3xl font-bold mt-1">¥{totalSales.toLocaleString()}</p>
        </div>
        <div className="bg-[#FFE8AB] text-amber-900 px-4 py-2 rounded-full font-bold text-sm">
          件数: {filteredTransactions.length} 件
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-bold text-slate-700">販売商品・決済明細一覧</h2>
        </div>
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-600">
              <th className="p-3">日付</th>
              <th className="p-3">保護者名</th>
              <th className="p-3">受講生名</th>
              <th className="p-3">商品名</th>
              <th className="p-3">金額</th>
              <th className="p-3">決済方法</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => (
                <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3">{tx.date}</td>
                  <td className="p-3 font-medium">{tx.parentName}</td>
                  <td className="p-3 text-slate-600">{tx.studentName}</td>
                  <td className="p-3">{tx.itemName}</td>
                  <td className="p-3 font-semibold text-slate-800">¥{tx.amount.toLocaleString()}</td>
                  <td className="p-3">
                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs">
                      {tx.paymentType}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-400">
                  該当する期間の売上データはありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
