// app/local-info/page.tsx
'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';

type LocalInfoItem = {
  id: number;
  title: string;
  category: 'restaurant' | 'parking' | 'shop' | 'facility';
  address: string;
  distance: string;
  memo: string;
};

export default function LocalInfoPage() {
  const [items, setItems] = useState<LocalInfoItem[]>([
    {
      id: 1,
      title: 'パーキングGOLAZO横',
      category: 'parking',
      address: '東京都北区...',
      distance: '30',
      memo: '30分200円、最大料金あり。お客様案内用。',
    },
    {
      id: 2,
      title: 'セブンイレブン 赤羽店',
      category: 'shop',
      address: '東京都北区...',
      distance: '120',
      memo: 'プロテインや水のエージェント購入に便利。',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newItem, setNewItem] = useState({
    title: '',
    category: 'parking' as const,
    address: '',
    distance: '',
    memo: '',
  });

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.title.includes(searchTerm) || item.address.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title) return;

    const itemToAdd: LocalInfoItem = {
      id: Date.now(),
      title: newItem.title,
      category: newItem.category,
      address: newItem.address,
      distance: newItem.distance,
      memo: newItem.memo,
    };

    setItems([itemToAdd, ...items]);
    setNewItem({ title: '', category: 'parking', address: '', distance: '', memo: '' });
    setIsModalOpen(false);
  };

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 font-sans pb-12">
      <Header />

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span>📍</span> 近隣情報・周辺スポット
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              ジム周辺の駐車場、おすすめ店舗、施設情報を管理します。
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#5e9bc4] hover:bg-[#4d85ab] text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm flex items-center gap-2"
          >
            <span>＋</span> スポット追加
          </button>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="w-full md:w-96">
            <input
              type="text"
              placeholder="スポット名や住所で検索..."
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
              onClick={() => setSelectedCategory('parking')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCategory === 'parking' ? 'bg-[#5e9bc4] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              駐車場
            </button>
            <button
              onClick={() => setSelectedCategory('shop')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCategory === 'shop' ? 'bg-[#5e9bc4] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              店舗・買い物
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-800 text-base">{item.title}</h3>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                    {item.category === 'parking' ? '駐車場' : item.category === 'shop' ? '店舗' : 'その他'}
                  </span>
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <div>📍 住所: {item.address || '未登録'}</div>
                  <div>🚶 徒歩約: {item.distance}分</div>
                </div>
                <p className="text-xs bg-slate-50 p-2.5 rounded-xl text-slate-600">
                  {item.memo || 'メモなし'}
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-full p-8 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-200">
              該当する近隣情報が見つかりませんでした。
            </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-800">近隣スポットの追加</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">スポット名 *</label>
                <input
                  type="text"
                  required
                  placeholder="例: コインパーキング〇〇"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">カテゴリ</label>
                  <select
                    value={newItem.category}
                    onChange={(e: any) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                  >
                    <option value="parking">駐車場</option>
                    <option value="shop">店舗・買い物</option>
                    <option value="restaurant">飲食店</option>
                    <option value="facility">周辺施設</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">徒歩分数 (分)</label>
                  <input
                    type="text"
                    placeholder="3"
                    value={newItem.distance}
                    onChange={(e) => setNewItem({ ...newItem, distance: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">住所</label>
                <input
                  type="text"
                  placeholder="東京都北区..."
                  value={newItem.address}
                  onChange={(e) => setNewItem({ ...newItem, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">メモ</label>
                <textarea
                  rows={3}
                  placeholder="料金体系や特徴など..."
                  value={newItem.memo}
                  onChange={(e) => setNewItem({ ...newItem, memo: e.target.value })}
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
