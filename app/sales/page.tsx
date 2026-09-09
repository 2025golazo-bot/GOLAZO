// app/sales/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
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
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newSale, setNewSale] = useState({
    date: new Date().toISOString().split('T')[0],
    clientName: '',
    category: '月謝・コース' as const,
    amount: 0,
    paymentMethod: 'Square決済' as const,
    memo: '',
  });

  // ページを開いたときに自動でSquareデータを同期し、売上データを取得する
  useEffect(() => {
    async function fetchDataAndSync() {
      try {
        setSyncing(true);
        // 1. Squareとの同期APIを自動バックグラウンド実行
        await fetch('/api/sync/square');
      } catch (err) {
        console.error('Square自動同期エラー:', err);
      } finally {
        setSyncing(false);
        setLoading(false);
      }
    }

    fetchDataAndSync();
  }, []);

  const filteredSales = sales.filter((item) => {
    const matchesSearch = item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.memo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalAmount = filteredSales.reduce((sum, item) => sum + item.amount, 0);

  const handleAddSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSale.clientName || newSale.amount <= 0) return;

    const item: SaleItem = {
      id: Date.now(),
      ...newSale,
    };

    setSales([item, ...sales]);
    setIsModalOpen(false);
    setNewSale({
      date: new Date().toISOString().split('T')[0],
      clientName: '',
      category: '月謝・コース',
      amount: 0,
      paymentMethod: 'Square決済',
      memo: '',
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-12">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">売上管理</h1>
            <p className="text-sm text-slate-500">
              {syncing ? '🔄 Squareと自動同期中...' : 'Square決済および売上データの管理'}
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#5e9bc4] hover:bg-[#4a83ab] text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition"
          >
            + 売上を手動追加
          </button>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-xs font-medium text-slate-500">表示中の売上合計</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">¥{totalAmount.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-xs font-medium text-slate-500">件数</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{filteredSales.length} 件</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-xs font-medium text-slate-500">同期ステータス</p>
            <p className="text-sm font-semibold text-emerald-600 mt-2">
              {syncing ? '同期処理を実行中...' : '✅ 自動同期システム稼働中'}
            </p>
          </div>
        </div>

        {/* 検索・フィルター */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="顧客名やメモで検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]"
          >
            <option value="all">すべてのカテゴリ</option>
            <option value="月謝・コース">月謝・コース</option>
            <option value="回数券">回数券</option>
            <option value="物販・プロテイン">物販・プロテイン</option>
            <option value="体験料">体験料</option>
          </select>
        </div>

        {/* テーブル表示 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3 font-semibold">日付</th>
                  <th className="px-6 py-3 font-semibold">顧客名</th>
                  <th className="px-6 py-3 font-semibold">カテゴリ</th>
                  <th className="px-6 py-3 font-semibold">金額</th>
                  <th className="px-6 py-3 font-semibold">支払方法</th>
                  <th className="px-6 py-3 font-semibold">メモ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      データを読み込んでいます...
                    </td>
                  </tr>
                ) : filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      売上データがありません（Squareからの自動取り込みを待機中、またはデータがありません）
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 text-slate-600">{item.date}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{item.clientName}</td>
                      <td className="px-6 py-4 text-slate-600">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">¥{item.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-slate-600">{item.paymentMethod}</td>
                      <td className="px-6 py-4 text-slate-500 text-xs">{item.memo}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-800 mb-4">売上手動追加</h3>
            <form onSubmit={handleAddSale} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">日付</label>
                <input
                  type="date"
                  value={newSale.date}
                  onChange={(e) => setNewSale({ ...newSale, date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">顧客名</label>
                <input
                  type="text"
                  placeholder="例: 山田 太郎 様"
                  value={newSale.clientName}
                  onChange={(e) => setNewSale({ ...newSale, clientName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">カテゴリ</label>
                <select
                  value={newSale.category}
                  onChange={(e) => setNewSale({ ...newSale, category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                >
                  <option value="月謝・コース">月謝・コース</option>
                  <option value="回数券">回数券</option>
                  <option value="物販・プロテイン">物販・プロテイン</option>
                  <option value="体験料">体験料</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">金額（円）</label>
                <input
                  type="number"
                  value={newSale.amount || ''}
                  onChange={(e) => setNewSale({ ...newSale, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">支払方法</label>
                <select
                  value={newSale.paymentMethod}
                  onChange={(e) => setNewSale({ ...newSale, paymentMethod: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                >
                  <option value="Square決済">Square決済</option>
                  <option value="現金">現金</option>
                  <option value="銀行振込">銀行振込</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">メモ</label>
                <input
                  type="text"
                  placeholder="例: 10回券など"
                  value={newSale.memo}
                  onChange={(e) => setNewSale({ ...newSale, memo: e.target.value })}
                  className="w-full plur-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#5e9bc4] text-white rounded-xl text-sm font-semibold hover:bg-[#4a83ab]"
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
