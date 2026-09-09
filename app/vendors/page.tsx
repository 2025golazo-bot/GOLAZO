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
      name: 'BOSUバランストレーナー公式',
      category: 'マシン・器具',
      contact: '佐藤 担当',
      phone: '03-0000-0000',
      memo: '体幹トレーニングおよびファンクショナルエリアで使用',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
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
    return matchesSearch;
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
      {/* 共通ヘッダーコンポーネントのみを配置（独自の古いヘッダーは完全に削除済み） */}
      <Header />

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span>🏋️</span> マシン・業者一覧
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              ジムで使用しているマシンや取引業者の詳細、担当者、タスク連携メモを管理します。
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#5e9bc4] hover:bg-[#4d85ab] text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm flex items-center gap-2"
          >
            <span>＋</span> 新規情報の追加
          </button>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <input
            type="text"
            placeholder="キーワード検索: 名前、使用詳細、担当者、メール、電話番号、メモで検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]/50"
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredVendors.length > 0 ? (
            filteredVendors.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-800 text-base">{item.name}</h3>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div>👤 担当: {item.contact || '未登録'}</div>
                  <div>📞 電話: {item.phone || '未登録'}</div>
                </div>
                <p className="text-xs bg-slate-50 p-2.5 rounded-xl text-slate-600">
                  {item.memo || 'メモなし'}
                </p>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-200">
              該当する業者・マシンデータが見つかりませんでした。
            </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-800">新規情報の追加</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleAddVendor} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">名称・業者名 *</label>
                <input
                  type="text"
                  required
                  placeholder="例: BOSUバランストレーナー"
                  value={newVendor.name}
                  onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">担当者名</label>
                <input
                  type="text"
                  placeholder="佐藤 担当"
                  value={newVendor.contact}
                  onChange={(e) => setNewVendor({ ...newVendor, contact: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
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
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">メモ</label>
                <textarea
                  rows={3}
                  placeholder="メモやタスク連携..."
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
                  保存する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
