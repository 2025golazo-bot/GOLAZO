'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NeighborItem {
  id: string;
  category: 'sports' | 'medical' | 'food' | 'facility' | 'other';
  categoryLabel: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  url: string;
  mapUrl?: string;
  notes: { id: string; text: string; taskDate?: string; isDone?: boolean }[];
}

export default function NeighborsPage() {
  const pathname = usePathname();

  // --- ナビゲーションメニュー設定 (共通) ---
  const navItems = [
    { label: '売上管理', href: '/sales', icon: '📊' },
    { label: '顧客リスト', href: '/customers', icon: '📋' },
    { label: 'タスク・議事録', href: '/tasks', icon: '📝' },
    { label: '近隣情報', href: '/neighbors', icon: '📍' },
    { label: 'マシン・業者一覧', href: '/vendors', icon: '🏋️' },
  ];

  // --- カテゴリ定義 ---
  const categories = [
    { key: 'all', label: 'すべて' },
    { key: 'sports', label: 'スポーツ・グラウンド' },
    { key: 'medical', label: '医療・整体' },
    { key: 'food', label: '飲食店・栄養' },
    { key: 'facility', label: '周辺施設' },
    { key: 'other', label: 'その他' },
  ];

  // --- サンプルデータ & 状態管理 ---
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [neighbors, setNeighbors] = useState<NeighborItem[]>([
    {
      id: 'n-1',
      category: 'sports',
      categoryLabel: 'スポーツ・グラウンド',
      name: '赤羽スポーツの森公園競技場',
      description: 'ジュニアサッカースクールやトレーニングイベントの会場候補',
      address: '東京都北区赤羽西5-2-27',
      phone: '03-3906-4171',
      url: 'https://www.city.kita.tokyo.jp/shisetsu/sports/akabanesports.html',
      mapUrl: 'https://maps.google.com/?q=赤羽スポーツの森公園競技場',
      notes: [
        { id: 'nt-1', text: '10月のイベント予約抽選申し込み日を確認する', taskDate: '2026-09-15', isDone: false },
        { id: 'nt-2', text: '人工芝ピッチの使用ルールおよび設備利用料のヒアリング完了', isDone: true },
      ],
    },
    {
      id: 'n-2',
      category: 'medical',
      categoryLabel: '医療・整体',
      name: '赤羽整形外科整形リハビリクリニック',
      description: 'クライアントのケガ・スポーツ障害時の連携・紹介先候補',
      address: '東京都北区赤羽1-XX-X',
      phone: '03-1234-5678',
      url: 'https://example.com/clinic',
      mapUrl: 'https://maps.google.com/?q=赤羽整形外科',
      notes: [
        { id: 'nt-3', text: '提携・情報共有についての問い合わせメール送信', isDone: false },
      ],
    },
  ]);

  // 新規追加用フォーム状態
  const [formData, setFormData] = useState({
    category: 'sports' as NeighborItem['category'],
    name: '',
    description: '',
    address: '',
    phone: '',
    url: '',
    mapUrl: '',
  });

  // フィルタリング処理（カテゴリ ＆ 検索キーワード）
  const filteredNeighbors = neighbors.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.address.toLowerCase().includes(q) ||
      item.phone.includes(q);

    return matchesCategory && matchesSearch;
  });

  const handleAddNeighbor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const catObj = categories.find(c => c.key === formData.category);
    const newItem: NeighborItem = {
      id: `n-${Date.now()}`,
      category: formData.category,
      categoryLabel: catObj ? catObj.label : 'その他',
      ...formData,
      mapUrl: formData.mapUrl || (formData.address ? `https://maps.google.com/?q=${encodeURIComponent(formData.address)}` : ''),
      notes: [],
    };

    setNeighbors([newItem, ...neighbors]);
    setFormData({
      category: 'sports',
      name: '',
      description: '',
      address: '',
      phone: '',
      url: '',
      mapUrl: '',
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('この近隣情報を削除しますか？')) {
      setNeighbors(neighbors.filter(item => item.id !== id));
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800">
      {/* 統一ナビゲーションバー (#5e9bc4) */}
      <header className="bg-[#5e9bc4] text-white px-6 py-3 shadow border-b border-sky-600 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="bg-white text-[#5e9bc4] p-1.5 rounded-lg font-black text-sm shadow-sm">G</span>
            <h1 className="text-lg font-extrabold tracking-wider">パーソナルジム GOLAZO 管理システム</h1>
          </div>

          <nav className="flex items-center gap-1.5 bg-sky-800/40 p-1 rounded-lg border border-white/20">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all shadow-sm flex items-center gap-1 ${
                    isActive
                      ? 'bg-white text-[#5e9bc4]'
                      : 'text-sky-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>{item.icon}</span> {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* メインコンテンツエリア */}
      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* ページヘッダー ＆ 検索・フィルターバー */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <span>📍</span> 近隣情報・連携施設管理
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                ジム周辺のグラウンド、医療機関、提携店舗、イベント会場などの情報と連携メモを管理します。
              </p>
            </div>
            <span className="bg-sky-50 text-[#5e9bc4] px-3 py-1 rounded-full text-xs font-bold border border-sky-100">
              登録件数: {neighbors.length} 件
            </span>
          </div>

          {/* 検索入力 ＆ カテゴリタブ */}
          <div className="flex flex-col md:flex-row gap-3 pt-1">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 text-xs">
                🔍 検索:
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="施設名、住所、電話番号、概要から検索..."
                className="w-full pl-20 pr-4 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5e9bc4] text-slate-700 transition"
              />
            </div>

            {/* カテゴリフィルターボタン */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
              {categories.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition ${
                    selectedCategory === cat.key
                      ? 'bg-[#5e9bc4] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2カラムレイアウト: 左一覧 / 右フォーム */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* 左側: 近隣情報カード一覧 (2カラム分) */}
          <div className="lg:col-span-2 space-y-4">
            {filteredNeighbors.length > 0 ? (
              filteredNeighbors.map(item => (
                <div key={item.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4 hover:border-sky-200 transition">
                  {/* カード見出し */}
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-sky-50 text-[#5e9bc4] text-[10px] font-extrabold px-2 py-0.5 rounded border border-sky-100">
                          {item.categoryLabel}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-800">{item.name}</h3>
                      {item.description && (
                        <p className="text-xs text-slate-500 mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded font-bold transition">
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-xs px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded font-bold transition"
                      >
                        削除
                      </button>
                    </div>
                  </div>

                  {/* 住所・連絡先情報グリッド */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-1.5 col-span-1 md:col-span-2">
                      <span className="text-slate-400">📍 住所:</span>
                      <span className="font-medium text-slate-700">{item.address || '-'}</span>
                      {item.mapUrl && (
                        <a
                          href={item.mapUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-auto text-[11px] bg-white border border-slate-200 hover:bg-slate-100 text-[#5e9bc4] font-bold px-2 py-0.5 rounded flex items-center gap-0.5 shadow-sm"
                        >
                          🗺️ Googleマップで開く
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">📞 電話:</span>
                      <span className="font-bold text-slate-700">{item.phone || '-'}</span>
                    </div>
                    {item.url && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">🔗 公式Web:</span>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#5e9bc4] hover:underline font-medium truncate"
                        >
                          {item.url}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* メモ & タスク連携 */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-bold text-slate-500 block">📝 連携メモ & タスク</span>
                    {item.notes.length > 0 ? (
                      <div className="space-y-1.5">
                        {item.notes.map(note => (
                          <div
                            key={note.id}
                            className="flex justify-between items-center bg-white p-2.5 rounded border border-slate-200 text-xs"
                          >
                            <span className={note.isDone ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}>
                              ・ {note.text}
                            </span>
                            {note.taskDate && (
                              <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded">
                                📌 タスク化 ({note.taskDate} / {note.isDone ? '完了' : '未着手'})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 italic bg-slate-50/50 p-2 rounded border border-dashed border-slate-200">
                        メモ・関連タスクはまだ登録されていません。
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-12 text-center text-slate-400 rounded-lg border border-slate-200 text-xs">
                該当する近隣情報が見つかりません。
              </div>
            )}
          </div>

          {/* 右側: 新規情報の追加フォーム (1カラム分) */}
          <div>
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4 sticky top-20">
              <h3 className="font-extrabold text-sm text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <span>➕</span> 新規近隣情報の追加
              </h3>

              <form onSubmit={handleAddNeighbor} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">カテゴリ</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as NeighborItem['category'] })}
                    className="w-full border border-slate-300 rounded p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5e9bc4] bg-white"
                  >
                    <option value="sports">スポーツ・グラウンド</option>
                    <option value="medical">医療・整体</option>
                    <option value="food">飲食店・栄養</option>
                    <option value="facility">周辺施設</option>
                    <option value="other">その他</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    施設・店舗名 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="例: 赤羽スポーツの森公園"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">概要・用途</label>
                  <textarea
                    rows={2}
                    placeholder="例: サッカースクールのグラウンド利用候補"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">住所</label>
                  <input
                    type="text"
                    placeholder="東京都北区..."
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">電話番号</label>
                  <input
                    type="text"
                    placeholder="03-0000-0000"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">公式Webサイト URL</label>
                  <input
                    type="url"
                    placeholder="https://"
                    value={formData.url}
                    onChange={e => setFormData({ ...formData, url: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Googleマップ URL (任意)</label>
                  <input
                    type="url"
                    placeholder="https://maps.google.com/..."
                    value={formData.mapUrl}
                    onChange={e => setFormData({ ...formData, mapUrl: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#5e9bc4] hover:bg-sky-600 text-white font-extrabold py-2.5 rounded-lg shadow-sm transition text-xs mt-2"
                >
                  保存する
                </button>
              </form>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
