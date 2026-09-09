// app/sales/page.tsx
'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';

type SaleItem = {
  id: number;
  date: string;
  clientName: string;
  category: '月謝・コース' | '回数券' | '物販・プロテイン' | '体験料';
  amount: number;
  paymentMethod: 'Square決済' | '現金' | '銀行振込';
  memo: string;
};

export default function SalesPage() {
  const [sales, setSales] = useState<SaleItem[]>([
    {
      id: 1,
      date: '2026-10-05',
      clientName: '藤田 奈々 様',
      category: '月謝・コース',
      amount: 60000,
      paymentMethod: 'Square決済',
      memo: '10回券（共通）',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newSale, setNewSale] = useState({
    date: new Date().toISOString().split('T')[0],
    clientName: '',
    category: '月謝・コース' as const,
    amount: '',
    paymentMethod: 'Square決済' as const,
    memo: '',
  });

  const filteredSales = sales.filter((item) => {
    const matchesSearch = item.clientName.includes(searchTerm) || item.memo.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalAmount = filteredSales.reduce((sum, item) => sum + item.amount, 0);

  const handleAddSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSale.clientName || !newSale.amount) return;

    const saleToAdd: SaleItem = {
      id: Date.now(),
      date: newSale.date,
      clientName: newSale.clientName,
      category: newSale.category,
      amount: Number(newSale.amount),
      paymentMethod: newSale.paymentMethod,
      memo: newSale.memo,
    };

    setSales([saleToAdd, ...sales]);
    setNewSale({
      date: new Date().toISOString().split('T')[0],
      clientName: '',
      category: '月謝・コース',
      amount: '',
      paymentMethod: 'Square決済',
      memo: '',
    });
    setIsModalOpen(false);
  };

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 font-sans pb-12">
      {/* 共通ヘッダーのみを配置 */}
      <Header />

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span>📊</span> 売上管理・Square連携
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              ジムの売上データや決済履歴を確認・集計します。
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#5e9bc4] hover:bg-[#4d85ab] text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm flex items-center gap-2"
          >
            <span>＋</span> 売上手動追加
          </button>
        </div>

        {/* 集計サマリーカード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-1">
            <span className="text-xs font-semibold text-slate-400">表示中合計売上</span>
            <div className="text-2xl font-bold text-slate-800">¥{totalAmount.toLocaleString()}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-1">
            <span className="text-xs font-semibold text-slate-400">件数</span>
            <div className="text-2xl font-bold text-[#5e9bc4]">{filteredSales.length} 件</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-1">
            <span className="text-xs font-semibold text-slate-400">決済連携状況</span>
            <div className="text-sm font-semibold text-emerald-600 flex items-center gap-1.5 pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Square API 接続正常
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="w-full md:w-96">
            <input
              type="text"
              placeholder="顧客名やメモで検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]/50"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">日付</th>
                  <th className="p-4">顧客名</th>
                  <th className="p-4">カテゴリ</th>
                  <th className="p-4">金額</th>
                  <th className="p-4">決済方法</th>
                  <th className="p-4">メモ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredSales.length > 0 ? (
                  filteredSales.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 text-slate-600 text-xs">{item.date}</td>
                      <td className="p-4 font-bold text-slate-800">{item.clientName}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-800">¥{item.amount.toLocaleString()}</td>
                      <td className="p-4 text-xs text-slate-600">{item.paymentMethod}</td>
                      <td className="p-4 text-xs text-slate-500">{item.memo || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 text-sm">
                      該当する売上データが見つかりませんでした。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-800">売上データの追加</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleAddSale} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">日付</label>
                  <input
                    type="date"
                    required
                    value={newSale.date}
                    onChange={(e) => setNewSale({ ...newSale, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">顧客名 *</label>
                  <input
                    type="text"
                    required
                    placeholder="山田 太郎"
                    value={newSale.clientName}
                    onChange={(e) => setNewSale({ ...newSale, clientName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">カテゴリ</label>
                  <select
                    value={newSale.category}
                    onChange={(e: any) => setNewSale({ ...newSale, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                  >
                    <option value="月謝・コース">月謝・コース</option>
                    <option value="回数券">回数券</option>
                    <option value="物販・プロテイン">物販・プロテイン</option>
                    <option value="体験料">体験料</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">金額 (円) *</label>
                  <input
                    type="number"
                    required
                    placeholder="10000"
                    value={newSale.amount}
                    onChange={(e) => setNewSale({ ...newSale, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-semibold"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#5e9bc4] hover:bg-[#4d85ab] text-white rounded-xl text-sm font-semibold"
                >
                  追加する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
