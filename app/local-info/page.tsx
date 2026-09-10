'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';

interface NearbyInfo {
  id: string;
  title: string;
  category: '大会・イベント' | '近隣施設' | 'その他';
  date: string;
  location: string;
  description: string;
}

export default function LocalInfoPage() {
  const [nearbyInfos, setNearbyInfos] = useState<NearbyInfo[]>([
    {
      id: 'nb-1',
      title: '練馬区ジュニアサッカー大会 予選リーグ',
      category: '大会・イベント',
      date: '2026-10-15',
      location: '区立総合運動場グラウンド',
      description: '初戦突破を目標に、アジリティ系メニューを強化中。'
    },
    {
      id: 'nb-2',
      title: '光が丘体育館 サブアリーナ開放日',
      category: '近隣施設',
      date: '2026-09-25',
      location: '光が丘体育館',
      description: '自主トレでのスペース利用に活用可能。'
    }
  ]);

  const [newNearbyTitle, setNewNearbyTitle] = useState('');
  const [newNearbyCategory, setNewNearbyCategory] = useState<'大会・イベント' | '近隣施設' | 'その他'>('大会・イベント');
  const [newNearbyDate, setNewNearbyDate] = useState(new Date().toISOString().split('T')[0]);
  const [newNearbyLocation, setNewNearbyLocation] = useState('');
  const [newNearbyDesc, setNewNearbyDesc] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  const handleAddNearby = () => {
    if (!newNearbyTitle || !newNearbyLocation) {
      alert('タイトルと場所を入力してください。');
      return;
    }
    const newItem: NearbyInfo = {
      id: `nb-${Date.now()}`,
      title: newNearbyTitle,
      category: newNearbyCategory,
      date: newNearbyDate,
      location: newNearbyLocation,
      description: newNearbyDesc
    };
    setNearbyInfos([newItem, ...nearbyInfos]);
    setNewNearbyTitle('');
    setNewNearbyLocation('');
    setNewNearbyDesc('');
    alert('近隣情報・イベントを追加しました！');
  };

  const handleDeleteNearby = (id: string) => {
    if (!confirm('この近隣情報を削除しますか？')) return;
    setNearbyInfos(prev => prev.filter(item => item.id !== id));
  };

  const filteredInfos = nearbyInfos.filter(
    item =>
      item.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.location.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.description.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 font-sans pb-12">
      <Header />

      <main className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">📍 近隣情報・イベント管理</h1>
            <p className="text-xs text-slate-500 mt-1">周辺の競技場、大会スケジュール、施設情報を一元管理します。</p>
          </div>
          <div className="w-full md:w-auto">
            <input
              type="text"
              placeholder="キーワードで検索..."
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              className="w-full md:w-64 border border-slate-300 rounded-lg p-2 text-xs bg-white outline-none focus:ring-2 focus:ring-[#5e9bc4]"
            />
          </div>
        </div>

        {/* 新規登録フォーム */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">＋ 新規イベント・情報の追加</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 mb-1 font-semibold">タイトル</label>
              <input
                type="text"
                placeholder="例: 区民サッカー大会"
                value={newNearbyTitle}
                onChange={e => setNewNearbyTitle(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1 font-semibold">カテゴリ</label>
              <select
                value={newNearbyCategory}
                onChange={e => setNewNearbyCategory(e.target.value as any)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-white outline-none font-bold text-[#5e9bc4]"
              >
                <option value="大会・イベント">大会・イベント</option>
                <option value="近隣施設">近隣施設</option>
                <option value="その他">その他</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-500 mb-1 font-semibold">日付</label>
              <input
                type="date"
                value={newNearbyDate}
                onChange={e => setNewNearbyDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-white outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 mb-1 font-semibold">場所</label>
              <input
                type="text"
                placeholder="例: 練馬区総合グラウンド"
                value={newNearbyLocation}
                onChange={e => setNewNearbyLocation(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1 font-semibold">詳細メモ・説明</label>
              <input
                type="text"
                placeholder="備考など"
                value={newNearbyDesc}
                onChange={e => setNewNearbyDesc(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-white outline-none"
              />
            </div>
          </div>
          <button
            onClick={handleAddNearby}
            className="bg-[#5e9bc4] hover:bg-sky-600 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition shadow-sm"
          >
            情報を登録する
          </button>
        </div>

        {/* 一覧表示 */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">登録済み一覧 ({filteredInfos.length}件)</h2>
          {filteredInfos.length > 0 ? (
            filteredInfos.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-sky-100 text-[#5e9bc4] font-bold px-2.5 py-0.5 rounded-full">{item.category}</span>
                    <span className="text-slate-500 font-semibold">📅 {item.date}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800">{item.title}</h3>
                  <p className="text-slate-600 flex items-center gap-1 font-medium"><span>📍</span> {item.location}</p>
                  {item.description && <p className="text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1">{item.description}</p>}
                </div>
                <div>
                  <button
                    onClick={() => handleDeleteNearby(item.id)}
                    className="text-rose-500 hover:text-rose-700 font-bold px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 transition"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
              該当する近隣情報はありません
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
