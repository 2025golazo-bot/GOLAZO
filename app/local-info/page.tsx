'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface EventItem {
  id: string;
  category: 'school' | 'tournament' | 'festival' | 'other';
  categoryLabel: string;
  title: string;          // イベント名
  organizer: string;      // 学校・チーム・主催者名
  targetArea: string;     // 対象区・地域
  eventDate: string;      // 開催日
  description: string;    // 詳細・メモ
  url: string;            // 詳細URL
  notes: { id: string; text: string; taskDate?: string; isDone?: boolean }[];
}

export default function LocalEventsPage() {
  const pathname = usePathname();

  // --- ナビゲーションメニュー設定 ---
  const navItems = [
    { label: '売上管理', href: '/sales', icon: '📊' },
    { label: '顧客リスト', href: '/customers', icon: '📋' },
    { label: 'タスク・議事録', href: '/tasks', icon: '📝' },
    { label: '近隣情報', href: '/local-info', icon: '📍' },
    { label: 'マシン・業者一覧', href: '/vendors', icon: '🏋️' },
  ];

  // --- カテゴリ定義 ---
  const categories = [
    { key: 'all', label: 'すべて' },
    { key: 'school', label: '学校行事（運動会等）' },
    { key: 'tournament', label: '大会・マッチ' },
    { key: 'festival', label: '地域イベント・祭り' },
    { key: 'other', label: 'その他' },
  ];

  // --- サンプルデータ & 状態管理 ---
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [events, setEvents] = useState<EventItem[]>([
    {
      id: 'e-1',
      category: 'school',
      categoryLabel: '学校行事（運動会等）',
      title: '秋季大運動会',
      organizer: '浮間小学校',
      targetArea: '北区',
      eventDate: '2026-10-10',
      description: '体験レッスンチラシの配布タイミング要検討。前週に集客アプローチを実施する。',
      url: '',
      notes: [
        { id: 'nt-1', text: '校門前チラシ配布の許可申請確認', taskDate: '2026-09-25', isDone: false },
      ],
    },
    {
      id: 'e-2',
      category: 'tournament',
      categoryLabel: '大会・マッチ',
      title: '北区ジュニアサッカー秋季大会',
      organizer: '北区サッカー協会',
      targetArea: '北区',
      eventDate: '2026-10-18',
      description: '赤羽スポーツの森公園で開催。ブース出展および協賛の打診を行う。',
      url: 'https://example.com/tournament',
      notes: [
        { id: 'nt-2', text: '主催者へ協賛案のメール送信', isDone: true },
      ],
    },
  ]);

  // 新規追加用フォーム状態
  const [formData, setFormData] = useState({
    category: 'school' as EventItem['category'],
    title: '',
    organizer: '',
    targetArea: '北区',
    eventDate: '',
    description: '',
    url: '',
  });

  // フィルタリング処理（カテゴリ ＆ 検索キーワード）
  const filteredEvents = events.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(q) ||
      item.organizer.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.targetArea.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  // 保存（追加）処理
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.organizer) return;

    const catObj = categories.find(c => c.key === formData.category);
    const newItem: EventItem = {
      ...formData,
      id: `e-${Date.now()}`,
      categoryLabel: catObj ? catObj.label : 'その他',
      notes: [],
    };

    setEvents([newItem, ...events]);
    setFormData({
      category: 'school',
      title: '',
      organizer: '',
      targetArea: '北区',
      eventDate: '',
      description: '',
      url: '',
    });
  };

  // 削除処理
  const handleDelete = (id: string) => {
    if (confirm('このイベント情報を削除しますか？')) {
      setEvents(events.filter(item => item.id !== id));
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
                <span>🏆</span> 近隣学校・チーム・イベント情報
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                周辺学校の運動会や地域のスポーツ大会・イベント日程を管理し、集客施策や販促活動に活用します。
              </p>
            </div>
            <span className="bg-sky-50 text-[#5e9bc4] px-3 py-1 rounded-full text-xs font-bold border border-sky-100">
              登録件数: {events.length} 件
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
                placeholder="イベント名、学校・団体名、メモなどから検索..."
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

          {/* 左側: イベントカード一覧 (2カラム分) */}
          <div className="lg:col-span-2 space-y-4">
            {filteredEvents.length > 0 ? (
              filteredEvents.map(item => (
                <div key={item.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4 hover:border-sky-200 transition">
                  {/* カード見出し */}
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-sky-50 text-[#5e9bc4] text-[10px] font-extrabold px-2 py-0.5 rounded border border-sky-100">
                          {item.categoryLabel}
                        </span>
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">
                          対象: {item.targetArea}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-800">{item.title}</h3>
                      <p className="text-xs font-bold text-sky-700 mt-0.5">
                        🏫 学校・主催: {item.organizer}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-xs px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded font-bold transition"
                      >
                        削除
                      </button>
                    </div>
                  </div>

                  {/* 開催日・詳細グリッド */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">📅 開催日:</span>
                      <span className="font-extrabold text-slate-800">{item.eventDate || '未定'}</span>
                    </div>
                    {item.url && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">🔗 詳細URL:</span>
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
                    {item.description && (
                      <div className="col-span-1 md:col-span-2 pt-1 text-slate-600">
                        <span className="text-slate-400 block mb-0.5">💬 イベント詳細・メモ:</span>
                        <p className="bg-white p-2 rounded border border-slate-200 text-xs">
                          {item.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 連携タスク */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-bold text-slate-500 block">📝 アプローチ・タスク</span>
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
                                📌 期限: {note.taskDate} ({note.isDone ? '完了' : '未完了'})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 italic bg-slate-50/50 p-2 rounded border border-dashed border-slate-200">
                        関連タスクはまだ登録されていません。
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-12 text-center text-slate-400 rounded-lg border border-slate-200 text-xs">
                該当するイベント情報が見つかりません。
              </div>
            )}
          </div>

          {/* 右側: 新規イベント情報の登録フォーム (1カラム分) */}
          <div>
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4 sticky top-20">
              <h3 className="font-extrabold text-sm text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <span>➕</span> 新規イベント情報の登録
              </h3>

              <form onSubmit={handleAddEvent} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">種別</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as EventItem['category'] })}
                    className="w-full border border-slate-300 rounded p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5e9bc4] bg-white"
                  >
                    <option value="school">学校行事（運動会等）</option>
                    <option value="tournament">大会・マッチ</option>
                    <option value="festival">地域イベント・祭り</option>
                    <option value="other">その他</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    学校・チーム名 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="例: 浮間小学校、赤羽FC"
                    value={formData.organizer}
                    onChange={e => setFormData({ ...formData, organizer: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    イベント名 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="例: 運動会、秋季ジュニア大会"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">対象区・地域</label>
                  <select
                    value={formData.targetArea}
                    onChange={e => setFormData({ ...formData, targetArea: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5e9bc4] bg-white"
                  >
                    <option value="北区">北区</option>
                    <option value="板橋区">板橋区</option>
                    <option value="足立区">足立区</option>
                    <option value="川口市">川口市</option>
                    <option value="その他">その他</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">開催日</label>
                  <input
                    type="date"
                    value={formData.eventDate}
                    onChange={e => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">詳細URL (任意)</label>
                  <input
                    type="url"
                    placeholder="https://"
                    value={formData.url}
                    onChange={e => setFormData({ ...formData, url: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">メモ・施策メモ</label>
                  <textarea
                    rows={3}
                    placeholder="例: チラシ配布のタイミング、協賛打診など"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#5e9bc4] hover:bg-sky-600 text-white font-extrabold py-2.5 rounded-lg shadow-sm transition text-xs mt-2 cursor-pointer"
                >
                  イベント情報を追加する
                </button>
              </form>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
