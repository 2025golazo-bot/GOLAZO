// app/vendors/page.tsx
'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';

type VendorItem = {
  id: number;
  name: string;
  category: 'マシン・器具' | 'メンテナンス' | 'プロテイン・消耗品' | '広告・Web';
  contact: string;
  phone: string;
  memo: string;
};

export default function VendorsPage() {
  const [vendors, setVendors] = useState<VendorItem[]>([
    {
      id: 1,
      name: 'BOSUバランストレーナー正規代理店',
      category: 'マシン・器具',
      contact: '担当: 鈴木様',
      phone: '03-0000-0000',
      memo: '体幹トレーニング用機器の保守・追加購入窓口。',
    },
    {
      id: 2,
      name: 'Hypervolt 2 Pro サポート窓口',
      category: 'メンテナンス',
      contact: 'カスタマーサポート',
      phone: '0120-000-000',
      memo: 'ケア機器の点検・修理依頼用。',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newVendor, setNewVendor] = useState({
    name: '',
    category: 'マシン・器具' as const,
    contact: '',
    phone: '',
    memo: '',
  });

  const filteredVendors = vendors.filter((item) => {
    const matchesSearch = item.name.includes(searchTerm) || item.memo.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendor.name) return;

    const vendorToAdd: VendorItem = {
      id: Date.now(),
      name: newVendor.name,
      category: newVendor.category,
      contact: newVendor.contact,
      phone: newVendor.phone,
      memo: newVendor.memo,
    };

    setVendors([vendorToAdd, ...vendors]);
    setNewVendor({ name: '', category: 'マシン・器具', contact: '', phone: '', memo: '' });
    setIsModalOpen(false);
  };

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 font-sans pb-12">
      <Header />

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span>🏋️</span> マシン・業者一覧
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              ジムで使用しているマシン、メンテナンス業者、取引先を管理します。
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#5e9bc4] hover:bg-[#4d85ab] text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm flex items-center gap-2"
          >
            <span>＋</span> 業者・マシン追加
          </button>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="w-full md:w-96">
            <input
              type="text"
              placeholder="業者名やメモで検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]/50"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCategory === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              すべて
            </button>
            <button
              onClick={() => setSelectedCategory('マシン・器具')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCategory === 'マシン・器具' ? 'bg-[#5e9bc4] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              マシン・器具
            </button>
            <button
              onClick={() => setSelectedCategory('メンテナンス')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCategory === 'メンテナンス' ? 'bg-[#5e9bc4] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              メンテナンス
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVendors.length > 0 ? (
            filteredVendors.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-800 text-base">{item.name}</h3>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                    {item.category}
                  </span>
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <div>👤 担当: {item.contact || '未登録'}</div>
                  <div>📞 電話: {item.phone || '未登録'}</div>
                </div>
                <p className="text-xs bg-slate-50 p-2.5 rounded-xl text-slate-600">
                  {item.memo || 'メモなし'}
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-full p-8 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-200">
              該当する業者・マシンデータが見つかりませんでした。
            </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-800">業者・マシンの追加</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleAddVendor} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">名称・業者名 *</label>
                <input
                  type="text"
                  required
                  placeholder="例: 〇〇フィットネス機器"
                  value={newVendor.name}
                  onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">カテゴリ</label>
                  <select
                    value={newVendor.category}
                    onChange={(e: any) => setNewVendor({ ...newVendor, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                  >
                    <option value="マシン・器具">マシン・器具</option>
                    <option value="メンテナンス">メンテナンス</option>
                    <option value="プロテイン・消耗品">プロテイン・消耗品</option>
                    <option value="広告・Web">広告・Web</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">電話番号</label>
                  <input
                    type="text"
                    placeholder="03-0000-0000"
                    value={newVendor.phone}
                    onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">担当者名</label>
                <input
                  type="text"
                  placeholder="担当: 〇〇様"
                  value={newVendor.contact}
                  onChange={(e) => setNewVendor({ ...newVendor, contact: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">メモ</label>
                <textarea
                  rows={3}
                  placeholder="保守内容や特記事項..."
                  value={newVendor.memo}
                  onChange={(e) => setNewVendor({ ...newVendor, memo: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
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
