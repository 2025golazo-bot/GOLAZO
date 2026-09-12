'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { createClient } from '@/lib/supabase/client';

interface TeamInfo {
  id: string;
  title: string;
  category: '大会・イベント' | 'チーム・団体' | 'その他';
  sport: string; // 競技（手動入力）
  date: string;
  location: string;
  url: string;
  contactName: string;
  contactEmail: string;
  businessCardFront: string; // 名刺表面（DataURL等）
  businessCardBack: string;  // 名刺裏面（DataURL等）
  memo1: string;
  memo2: string;
  memo3: string;
}

export default function LocalInfoPage() {
  const [teamInfos, setTeamInfos] = useState<TeamInfo[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const loadTeamInfos = async () => {
      const { data, error } = await supabase
        .from('local_info')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('local_info の読み込みに失敗しました:', error);
        return;
      }

      const items: TeamInfo[] = (data ?? []).map((row) => ({
        id: row.id,
        title: row.event_name ?? '',
        category: row.category ?? '大会・イベント',
        sport: row.sport ?? '',
        date: row.event_date ?? '',
        location: row.location ?? '',
        url: row.url ?? '',
        contactName: row.contact_name ?? '',
        contactEmail: row.contact_email ?? '',
        businessCardFront: row.business_card_front ?? '',
        businessCardBack: row.business_card_back ?? '',
        memo1: row.memo1 ?? row.memo ?? '',
        memo2: row.memo2 ?? '',
        memo3: row.memo3 ?? '',
      }));

      setTeamInfos(items);
    };

    loadTeamInfos();
  }, []);

  // 新規登録用ステート
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'大会・イベント' | 'チーム・団体' | 'その他'>('大会・イベント');
  const [newSport, setNewSport] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newLocation, setNewLocation] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');
  const [newMemo1, setNewMemo1] = useState('');
  const [newMemo2, setNewMemo2] = useState('');
  const [newMemo3, setNewMemo3] = useState('');
  
  const [searchKeyword, setSearchKeyword] = useState('');

  // 編集用の状態管理
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<'大会・イベント' | 'チーム・団体' | 'その他'>('大会・イベント');
  const [editSport, setEditSport] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editContactName, setEditContactName] = useState('');
  const [editContactEmail, setEditContactEmail] = useState('');
  const [editCardFront, setEditCardFront] = useState('');
  const [editCardBack, setEditCardBack] = useState('');
  const [editMemo1, setEditMemo1] = useState('');
  const [editMemo2, setEditMemo2] = useState('');
  const [editMemo3, setEditMemo3] = useState('');

  // 画像をBase64に変換するヘルパー
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

const handleAdd = async () => {
  if (!newTitle || !newLocation) {
    alert('タイトルと場所を入力してください。');
    return;
  }

  const { data, error } = await supabase
    .from('local_info')
    .insert({
      school_or_team_name: newTitle,
      district: 'その他',
      event_name: newTitle,
      url: newUrl || null,
      staff_name: newContactName || null,
      memo: newMemo1 || null,
      category: newCategory,
      sport: newSport,
      event_date: newDate || null,
      location: newLocation,
      contact_name: newContactName,
      contact_email: newContactEmail,
      business_card_front: newCardFront,
      business_card_back: newCardBack,
      memo1: newMemo1,
      memo2: newMemo2,
      memo3: newMemo3
    })
    .select('*')
    .single();

  if (error) {
    console.error(error);
    alert(`Supabaseへの保存に失敗しました。\n${error.message}`);
    return;
  }

  const newItem: TeamInfo = {
    id: data.id,
    title: data.event_name,
    category: data.category,
    sport: data.sport,
    date: data.event_date || '',
    location: data.location,
    url: data.url || '',
    contactName: data.contact_name || '',
    contactEmail: data.contact_email || '',
    businessCardFront: data.business_card_front || '',
    businessCardBack: data.business_card_back || '',
    memo1: data.memo1 || '',
    memo2: data.memo2 || '',
    memo3: data.memo3 || ''
  };

  setTeamInfos([newItem, ...teamInfos]);

  setNewTitle('');
  setNewSport('');
  setNewLocation('');
  setNewUrl('');
  setNewContactName('');
  setNewContactEmail('');
  setNewCardFront('');
  setNewCardBack('');
  setNewMemo1('');
  setNewMemo2('');
  setNewMemo3('');

  alert('チーム・イベント情報を追加しました！');
};

  const handleDelete = (id: string) => {
    if (!confirm('この情報を削除しますか？')) return;
    setTeamInfos(prev => prev.filter(item => item.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const handleStartEdit = (item: TeamInfo) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditCategory(item.category);
    setEditSport(item.sport);
    setEditDate(item.date);
    setEditLocation(item.location);
    setEditUrl(item.url);
    setEditContactName(item.contactName);
    setEditContactEmail(item.contactEmail);
    setEditCardFront(item.businessCardFront);
    setEditCardBack(item.businessCardBack);
    setEditMemo1(item.memo1);
    setEditMemo2(item.memo2);
    setEditMemo3(item.memo3);
  };

  const handleSaveEdit = (id: string) => {
    if (!editTitle || !editLocation) {
      alert('タイトルと場所を入力してください。');
      return;
    }
    setTeamInfos(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              title: editTitle,
              category: editCategory,
              sport: editSport,
              date: editDate,
              location: editLocation,
              url: editUrl,
              contactName: editContactName,
              contactEmail: editContactEmail,
              businessCardFront: editCardFront,
              businessCardBack: editCardBack,
              memo1: editMemo1,
              memo2: editMemo2,
              memo3: editMemo3
            }
          : item
      )
    );
    setEditingId(null);
    alert('情報を更新しました！');
  };

  const filteredInfos = teamInfos.filter(
    item =>
      item.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.location.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.sport.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.contactName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.memo1.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.memo2.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.memo3.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 font-sans pb-12">
      <Header />

      <main className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">👥 チーム・イベント情報管理</h1>
            <p className="text-xs text-slate-500 mt-1">周辺のチーム、競技大会、関連連絡先を一元管理します。</p>
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
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">＋ 新規チーム・情報の追加</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 mb-1 font-semibold">タイトル</label>
              <input
                type="text"
                placeholder="例: 区民サッカー大会"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1 font-semibold">カテゴリ</label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as any)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-white outline-none font-bold text-[#5e9bc4]"
              >
                <option value="大会・イベント">大会・イベント</option>
                <option value="チーム・団体">チーム・団体</option>
                <option value="その他">その他</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-500 mb-1 font-semibold">競技（手動入力）</label>
              <input
                type="text"
                placeholder="例: サッカー, バスケットボール"
                value={newSport}
                onChange={e => setNewSport(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1 font-semibold">日付</label>
              <input
                type="date"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 mb-1 font-semibold">場所</label>
              <input
                type="text"
                placeholder="例: 練馬区総合グラウンド"
                value={newLocation}
                onChange={e => setNewLocation(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1 font-semibold">URL</label>
              <input
                type="url"
                placeholder="https://example.com"
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1 font-semibold">担当者名</label>
              <input
                type="text"
                placeholder="例: 山田 太郎"
                value={newContactName}
                onChange={e => setNewContactName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 mb-1 font-semibold">メールアドレス</label>
              <input
                type="email"
                placeholder="example@email.com"
                value={newContactEmail}
                onChange={e => setNewContactEmail(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1 font-semibold">名刺（表面）</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => handleImageUpload(e, setNewCardFront)}
                className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
              />
              {newCardFront && <span className="text-emerald-600 text-[10px] mt-0.5 block">表面画像セット済み</span>}
            </div>
            <div>
              <label className="block text-slate-500 mb-1 font-semibold">名刺（裏面）</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => handleImageUpload(e, setNewCardBack)}
                className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
              />
              {newCardBack && <span className="text-emerald-600 text-[10px] mt-0.5 block">裏面画像セット済み</span>}
            </div>
          </div>

          {/* メモ3つ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 mb-1 font-semibold">メモ1</label>
              <input
                type="text"
                placeholder="メモ内容1"
                value={newMemo1}
                onChange={e => setNewMemo1(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1 font-semibold">メモ2</label>
              <input
                type="text"
                placeholder="メモ内容2"
                value={newMemo2}
                onChange={e => setNewMemo2(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-white outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1 font-semibold">メモ3</label>
              <input
                type="text"
                placeholder="メモ内容3"
                value={newMemo3}
                onChange={e => setNewMemo3(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-white outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleAdd}
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
              <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs">
                {editingId === item.id ? (
                  /* 編集モード時のフォーム */
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-slate-500 mb-1 font-semibold">タイトル</label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 bg-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1 font-semibold">カテゴリ</label>
                        <select
                          value={editCategory}
                          onChange={e => setEditCategory(e.target.value as any)}
                          className="w-full border border-slate-300 rounded-lg p-2 bg-white outline-none font-bold text-[#5e9bc4]"
                        >
                          <option value="大会・イベント">大会・イベント</option>
                          <option value="チーム・団体">チーム・団体</option>
                          <option value="その他">その他</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1 font-semibold">競技</label>
                        <input
                          type="text"
                          value={editSport}
                          onChange={e => setEditSport(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 bg-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1 font-semibold">日付</label>
                        <input
                          type="date"
                          value={editDate}
                          onChange={e => setEditDate(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 bg-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-500 mb-1 font-semibold">場所</label>
                        <input
                          type="text"
                          value={editLocation}
                          onChange={e => setEditLocation(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 bg-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1 font-semibold">URL</label>
                        <input
                          type="url"
                          value={editUrl}
                          onChange={e => setEditUrl(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 bg-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1 font-semibold">担当者名</label>
                        <input
                          type="text"
                          value={editContactName}
                          onChange={e => setEditContactName(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 bg-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-500 mb-1 font-semibold">メールアドレス</label>
                        <input
                          type="email"
                          value={editContactEmail}
                          onChange={e => setEditContactEmail(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 bg-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1 font-semibold">名刺（表面）修正</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={e => handleImageUpload(e, setEditCardFront)}
                            className="w-full text-xs text-slate-500"
                          />
                          {editCardFront && (
                            <button
                              type="button"
                              onClick={() => setEditCardFront('')}
                              className="text-rose-600 text-[10px] border border-rose-200 px-2 py-1 rounded"
                            >
                              削除
                            </button>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1 font-semibold">名刺（裏面）修正</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={e => handleImageUpload(e, setEditCardBack)}
                            className="w-full text-xs text-slate-500"
                          />
                          {editCardBack && (
                            <button
                              type="button"
                              onClick={() => setEditCardBack('')}
                              className="text-rose-600 text-[10px] border border-rose-200 px-2 py-1 rounded"
                            >
                              削除
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 編集用メモ3つ */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-500 mb-1 font-semibold">メモ1</label>
                        <input
                          type="text"
                          value={editMemo1}
                          onChange={e => setEditMemo1(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 bg-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1 font-semibold">メモ2</label>
                        <input
                          type="text"
                          value={editMemo2}
                          onChange={e => setEditMemo2(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 bg-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1 font-semibold">メモ3</label>
                        <input
                          type="text"
                          value={editMemo3}
                          onChange={e => setEditMemo3(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 bg-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => handleSaveEdit(item.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-1.5 rounded-lg transition"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-slate-300 hover:bg-slate-400 text-slate-700 font-bold px-4 py-1.5 rounded-lg transition"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : (
                  /* 通常表示モード */
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-sky-100 text-[#5e9bc4] font-bold px-2.5 py-0.5 rounded-full">{item.category}</span>
                        {item.sport && <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full">競技: {item.sport}</span>}
                        <span className="text-slate-500 font-semibold">📅 {item.date}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-800">{item.title}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-600 font-medium">
                        <p className="flex items-center gap-1"><span>📍</span> 場所: {item.location}</p>
                        {item.url && (
                          <p className="flex items-center gap-1">
                            <span>🔗</span> URL: <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sky-600 underline truncate max-w-xs">{item.url}</a>
                          </p>
                        )}
                        {item.contactName && <p className="flex items-center gap-1"><span>👤</span> 担当: {item.contactName}</p>}
                        {item.contactEmail && <p className="flex items-center gap-1"><span>✉️</span> アドレス: <a href={`mailto:${item.contactEmail}`} className="text-sky-600 underline">{item.contactEmail}</a></p>}
                      </div>

                      {/* 名刺表示エリア */}
                      {(item.businessCardFront || item.businessCardBack) && (
                        <div className="flex gap-4 pt-1">
                          {item.businessCardFront && (
                            <div>
                              <span className="text-[10px] text-slate-400 block mb-0.5">名刺（表面）</span>
                              <img src={item.businessCardFront} alt="名刺表面" className="w-24 h-16 object-cover rounded border border-slate-200 shadow-sm" />
                            </div>
                          )}
                          {item.businessCardBack && (
                            <div>
                              <span className="text-[10px] text-slate-400 block mb-0.5">名刺（裏面）</span>
                              <img src={item.businessCardBack} alt="名刺裏面" className="w-24 h-16 object-cover rounded border border-slate-200 shadow-sm" />
                            </div>
                          )}
                        </div>
                      )}

                      {/* 3つのメモ */}
                      <div className="space-y-1 pt-1">
                        {item.memo1 && <p className="text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">💡 メモ1: {item.memo1}</p>}
                        {item.memo2 && <p className="text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">💡 メモ2: {item.memo2}</p>}
                        {item.memo3 && <p className="text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">💡 メモ3: {item.memo3}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="px-3.5 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 rounded-lg font-bold transition"
                      >
                        修正
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-3.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-lg font-bold transition"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
              該当するチーム・イベント情報はありません
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
