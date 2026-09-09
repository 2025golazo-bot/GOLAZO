'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface VendorItem {
  id: string;
  name: string;
  usageDetail: string;
  contactPerson: string;
  phone: string;
  email: string;
  url: string;
  notes: { id: string; text: string; taskDate?: string; isDone?: boolean }[];
}

export default function VendorsPage() {
  const pathname = usePathname();

  // --- ナビゲーションメニュー設定 (共通) ---
  const navItems = [
    { label: '売上管理', href: '/sales', icon: '📊' },
    { label: '顧客リスト', href: '/customers', icon: '📋' },
    { label: 'タスク・議事録', href: '/tasks', icon: '📝' },
    { label: '近隣情報', href: '/neighbors', icon: '📍' },
    { label: 'マシン・業者一覧', href: '/vendors', icon: '🏋️' },
  ];

  // --- サンプルデータ & 状態管理 ---
  const [searchQuery, setSearchQuery] = useState('');
  const [vendors, setVendors] = useState<VendorItem[]>([
    {
      id: 'v-1',
      name: 'BOSU バランストレーナー公式',
      usageDetail: '体幹トレーニングおよびファンクショナルエリアで使用',
      contactPerson: '佐藤 担当',
      phone: '03-0000-0000',
      email: 'support@example.com',
      url: 'https://example.com/bosu',
      notes: [
        { id: 'n-1', text: 'メンテナンス時期について来月確認する', taskDate: '2026-09-20', isDone: false },
        { id: 'n-2', text: '予備パーツのカタログ受取済み', isDone: true },
      ],
    },
  ]);

  // 新規追加用フォーム入力状態
  const [formData, setFormData] = useState({
    name: '',
    usageDetail: '',
    contactPerson: '',
    phone: '',
    email: '',
    url: '',
  });

  // 検索フィルター
  const filteredVendors = vendors.filter(v => {
    const q = searchQuery.toLowerCase();
    return (
      v.name.toLowerCase().includes(q) ||
      v.usageDetail.toLowerCase().includes(q) ||
      v.contactPerson.toLowerCase().includes(q) ||
      v.phone.includes(q) ||
      v.email.toLowerCase().includes(q)
    );
  });

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    const newItem: VendorItem = {
      id: `v-${Date.now()}`,
      ...formData,
      notes: [],
    };
    setVendors([newItem, ...vendors]);
    setFormData({ name: '', usageDetail: '', contactPerson: '', phone: '', email: '', url: '' });
  };

  const handleDelete = (id: string) => {
    if (confirm('この業者・マシン情報を削除しますか？')) {
      setVendors(vendors.filter(v => v.id !== id));
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

        {/* ページヘッダー ＆ 検索バー */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <span>⚙️</span> 使用マシン・業者情報管理
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                ジムで使用しているマシンや取引業者の詳細、担当者、タスク連携メモを管理します。
              </p>
            </div>
            <span className="bg-sky-50 text-[#5e9bc4] px-3 py-1 rounded-full text-xs font-bold border border-sky-100">
              登録件数: {vendors.length} 件
            </span>
          </div>

          {/* 検索入力欄 */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 text-xs">
              🔍 キーワード検索:
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="名前、使用詳細、担当者、メール、電話番号、メモで検索..."
              className="w-full pl-32 pr-4 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5e9bc4] text-slate-700 transition"
            />
          </div>
        </div>

        {/* 2カラムレイアウト: 左一覧 / 右フォーム */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* 左側: マシン・業者カード一覧 (2カラム分) */}
          <div className="lg:col-span-2 space-y-4">
            {filteredVendors.length > 0 ? (
              filteredVendors.map(vendor => (
                <div key={vendor.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4 hover:border-sky-200 transition">
                  {/* カード見出し */}
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-800">{vendor.name}</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        <span className="font-semibold text-slate-400">使用詳細:</span> {vendor.usageDetail}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded font-bold transition">
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(vendor.id)}
                        className="text-xs px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded font-bold transition"
                      >
                        削除
                      </button>
                    </div>
                  </div>

                  {/* 連絡先情報グリッド */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">👤 担当者:</span>
                      <span className="font-bold text-slate-700">{vendor.contactPerson || '-'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">📞 連絡先:</span>
                      <span className="font-bold text-slate-700">{vendor.phone || '-'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-1 md:col-span-2">
                      <span className="text-slate-400">✉️ メール:</span>
                      <span className="font-mono text-slate-700">{vendor.email || '-'}</span>
                    </div>
                    {vendor.url && (
                      <div className="flex items-center gap-1.5 col-span-1 md:col-span-2 pt-1 border-t border-slate-200/60">
                        <span className="text-slate-400">🔗 URL:</span>
                        <a
                          href={vendor.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#5e9bc4] hover:underline font-medium truncate"
                        >
                          {vendor.url}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* メモ & タスク連携 */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-bold text-slate-500 block">📝 メモ & タスク連携</span>
                    <div className="space-y-1.5">
                      {vendor.notes.map(note => (
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
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-12 text-center text-slate-400 rounded-lg border border-slate-200 text-xs">
                該当するマシン・業者情報が見つかりません。
              </div>
            )}
          </div>

          {/* 右側: 新規情報の追加フォーム (1カラム分) */}
          <div>
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4 sticky top-20">
              <h3 className="font-extrabold text-sm text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <span>➕</span> 新規情報の追加
              </h3>

              <form onSubmit={handleAddVendor} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    名前 (マシン名 / 業者名) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="例: BOSUバランストレーナー"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">使用詳細</label>
                  <textarea
                    rows={2}
                    placeholder="例: スタジオのバランス運動で使用"
                    value={formData.usageDetail}
                    onChange={e => setFormData({ ...formData, usageDetail: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">担当者名</label>
                    <input
                      type="text"
                      placeholder="例: 佐藤 担当"
                      value={formData.contactPerson}
                      onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="w-full border border-slate-300 rounded p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">連絡先 (電話)</label>
                    <input
                      type="text"
                      placeholder="03-0000-0000"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full border border-slate-300 rounded p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">メールアドレス</label>
                  <input
                    type="email"
                    placeholder="support@example.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">URL</label>
                  <input
                    type="url"
                    placeholder="https://"
                    value={formData.url}
                    onChange={e => setFormData({ ...formData, url: e.target.value })}
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
