'use client';

import React, { useState, useRef } from 'react';
import Header from '@/components/Header';

// --- 型定義 ---
interface MachineMaker {
  id: string;
  name: string; // メーカー名・業者名
  kana: string; // カナ
  url: string; // URL
  contactPhone: string; // 電話番号
  contactPerson: string; // 担当者名
  isImportant: boolean; // 🌟 重要アラームフラグ
  memo: string; // 総合メモ
  // 独立した3つのメモ欄
  customMemo1: string;
  customMemo2: string;
  customMemo3: string;
  // 名刺（2枚裏表：表・裏）
  businessCards: {
    front?: string | null;
    back?: string | null;
  };
}

export default function MachineMakersPage() {
  // マシン業者・メーカーデータ一覧
  const [makers, setMakers] = useState<MachineMaker[]>([
    {
      id: 'maker-001',
      name: 'ライフフィットネスジャパン',
      kana: 'ライフフィットネスジャパン',
      url: 'https://www.lifefitness.jp',
      contactPhone: '03-1234-5678',
      contactPerson: '鈴木 営業担当',
      isImportant: true, // 重要アラームON
      memo: '主力マシン（トレッドミル・ウェイト）のメインベンダー。',
      customMemo1: '【保守契約】年1回の定期点検が保守代金に含まれている。',
      customMemo2: '【値引き交渉】次回のオプション追加時は10%OFFの相談が可能。',
      customMemo3: '【連絡事項】担当者の直通メールはsuzuki@lifefitness.example',
      businessCards: {
        front: null,
        back: null,
      }
    },
    {
      id: 'maker-002',
      name: 'テクノジム ジャパン',
      kana: 'テクノジムジャパン',
      url: 'https://www.technogym.com/ja-JP/',
      contactPhone: '03-9876-5432',
      contactPerson: '佐藤 サポート',
      isImportant: false,
      memo: 'スタイリッシュなデザインのマシン、アプリ連携が得意。',
      customMemo1: '【導入実績】バイオストレングスシリーズの見積もりを依頼中。',
      customMemo2: '【ショールーム】六本木ショールームでいつでもデモ体験可能。',
      customMemo3: '【納期】輸入の関係で発注後約2ヶ月かかるため注意。',
      businessCards: {
        front: null,
        back: null,
      }
    }
  ]);

  // UI状態
  const [selectedMakerId, setSelectedMakerId] = useState<string>('maker-001');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'details' | 'cards' | 'edit'>('details');

  // 新規登録用フォームの状態
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newKana, setNewKana] = useState<string>('');
  const [newUrl, setNewUrl] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newPerson, setNewPerson] = useState<string>('');
  const [newIsImportant, setNewIsImportant] = useState<boolean>(false);
  const [newMemo, setNewMemo] = useState<string>('');

  // 選択中の業者データ
  const currentMaker = makers.find(m => m.id === selectedMakerId) || makers[0];

  // 編集用フォームの状態
  const [editName, setEditName] = useState(currentMaker.name);
  const [editKana, setEditKana] = useState(currentMaker.kana);
  const [editUrl, setEditUrl] = useState(currentMaker.url);
  const [editPhone, setEditPhone] = useState(currentMaker.contactPhone);
  const [editPerson, setEditPerson] = useState(currentMaker.contactPerson);
  const [editIsImportant, setEditIsImportant] = useState(currentMaker.isImportant);
  const [editMemo, setEditMemo] = useState(currentMaker.memo);
  const [editCustomMemo1, setEditCustomMemo1] = useState(currentMaker.customMemo1);
  const [editCustomMemo2, setEditCustomMemo2] = useState(currentMaker.customMemo2);
  const [editCustomMemo3, setEditCustomMemo3] = useState(currentMaker.customMemo3);

  // ファイルインプット用ref
  const frontCardInputRef = useRef<HTMLInputElement>(null);
  const backCardInputRef = useRef<HTMLInputElement>(null);

  // 業者切り替え時のハンドラー
  const handleSelectMaker = (id: string) => {
    setSelectedMakerId(id);
    setIsCreatingNew(false);
    const target = makers.find(m => m.id === id);
    if (target) {
      setEditName(target.name);
      setEditKana(target.kana);
      setEditUrl(target.url);
      setEditPhone(target.contactPhone);
      setEditPerson(target.contactPerson);
      setEditIsImportant(target.isImportant);
      setEditMemo(target.memo);
      setEditCustomMemo1(target.customMemo1);
      setEditCustomMemo2(target.customMemo2);
      setEditCustomMemo3(target.customMemo3);
    }
  };

  // 新規登録画面へ切り替え
  const handleOpenCreateForm = () => {
    setIsCreatingNew(true);
    setNewName('');
    setNewKana('');
    setNewUrl('');
    setNewPhone('');
    setNewPerson('');
    setNewIsImportant(false);
    setNewMemo('');
  };

  // 新規業者登録の保存
  const handleCreateMaker = () => {
    if (!newName.trim()) {
      alert('業者名・メーカー名を入力してください。');
      return;
    }
    const newMakerObj: MachineMaker = {
      id: `maker-${Date.now()}`,
      name: newName,
      kana: newKana || newName,
      url: newUrl,
      contactPhone: newPhone,
      contactPerson: newPerson,
      isImportant: newIsImportant,
      memo: newMemo,
      customMemo1: '',
      customMemo2: '',
      customMemo3: '',
      businessCards: { front: null, back: null }
    };

    setMakers([newMakerObj, ...makers]);
    setSelectedMakerId(newMakerObj.id);
    setIsCreatingNew(false);
    alert('新しいマシン業者を登録しました！');
  };

  // 編集内容の保存
  const handleSaveEdit = () => {
    setMakers(prev =>
      prev.map(m => {
        if (m.id !== currentMaker.id) return m;
        return {
          ...m,
          name: editName,
          kana: editKana,
          url: editUrl,
          contactPhone: editPhone,
          contactPerson: editPerson,
          isImportant: editIsImportant,
          memo: editMemo,
          customMemo1: editCustomMemo1,
          customMemo2: editCustomMemo2,
          customMemo3: editCustomMemo3,
        };
      })
    );
    alert('業者情報を更新しました！');
  };

  // 業者の削除
  const handleDeleteMaker = (id: string) => {
    if (makers.length <= 1) {
      alert('これ以上削除できません（最低1件の業者データが必要です）。');
      return;
    }
    if (!confirm('このマシン業者データを削除しますか？')) return;

    const remaining = makers.filter(m => m.id !== id);
    setMakers(remaining);
    setSelectedMakerId(remaining[0].id);
    setIsCreatingNew(false);
  };

  // 名刺画像のアップロード（取り込み直し）
  const handleCardImageUpload = (side: 'front' | 'back', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const resultString = reader.result as string;
      setMakers(prev =>
        prev.map(m => {
          if (m.id !== currentMaker.id) return m;
          return {
            ...m,
            businessCards: {
              ...m.businessCards,
              [side]: resultString
            }
          };
        })
      );
      alert(`名刺（${side === 'front' ? '表面' : '裏面'}）を取り込み直しました！`);
    };
    reader.readAsDataURL(file);
  };

  // 名刺画像の削除
  const handleDeleteCardImage = (side: 'front' | 'back') => {
    if (!confirm(`名刺（${side === 'front' ? '表面' : '裏面'}）を削除しますか？`)) return;
    setMakers(prev =>
      prev.map(m => {
        if (m.id !== currentMaker.id) return m;
        return {
          ...m,
          businessCards: {
            ...m.businessCards,
            [side]: null
          }
        };
      })
    );
  };

  // 検索フィルタリング
  const filteredMakers = makers.filter(m => {
    const query = searchKeyword.toLowerCase();
    return (
      m.name.toLowerCase().includes(query) ||
      m.kana.toLowerCase().includes(query) ||
      m.contactPerson.toLowerCase().includes(query) ||
      m.memo.toLowerCase().includes(query) ||
      m.customMemo1.toLowerCase().includes(query) ||
      m.customMemo2.toLowerCase().includes(query) ||
      m.customMemo3.toLowerCase().includes(query)
    );
  });

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 font-sans pb-12">
      <Header />

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          {/* 左カラム：業者選択 ＆ 検索 */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1"><span>🔍</span> キーワード検索</label>
              <input
                type="text"
                placeholder="業者名、担当者、メモで検索..."
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#5e9bc4] outline-none"
              />
            </div>

            <div className="flex justify-between items-center px-1">
              <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider">マシン業者一覧 ({filteredMakers.length}社)</h3>
              <button
                onClick={handleOpenCreateForm}
                className="bg-[#5e9bc4] hover:bg-sky-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg transition shadow-sm"
              >
                ＋ 新規登録
              </button>
            </div>

            <div className="space-y-2.5">
              {filteredMakers.map(maker => {
                const isSelected = !isCreatingNew && selectedMakerId === maker.id;

                return (
                  <div
                    key={maker.id}
                    onClick={() => handleSelectMaker(maker.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all shadow-sm ${
                      isSelected ? 'bg-sky-50/80 border-[#5e9bc4] ring-2 ring-[#5e9bc4]/20' : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`font-bold text-sm ${isSelected ? 'text-[#5e9bc4]' : 'text-slate-800'}`}>
                        {maker.name}
                      </span>
                      {maker.isImportant && (
                        <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                          ⭐ 重要
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">担当: {maker.contactPerson || '未設定'}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 右カラム：メインコンテンツ（詳細・名刺・編集・新規作成） */}
          <div className="md:col-span-3 space-y-5">

            {isCreatingNew ? (
              /* 新規登録画面 */
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
                <div className="border-b pb-3 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span>🏢</span> 新規マシン業者・メーカー登録
                  </h2>
                  <button onClick={() => setIsCreatingNew(false)} className="text-xs text-slate-400 hover:text-slate-600">キャンセル</button>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 mb-1 font-semibold">業者名・メーカー名 <span className="text-rose-500">*</span></label>
                      <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="例: ライテック" className="w-full border rounded-lg p-2 outline-none" />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1 font-semibold">カナ</label>
                      <input type="text" value={newKana} onChange={e => setNewKana(e.target.value)} placeholder="例: ライテック" className="w-full border rounded-lg p-2 outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-slate-500 mb-1 font-semibold">URL</label>
                      <input type="text" value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://example.com" className="w-full border rounded-lg p-2 outline-none" />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1 font-semibold">電話番号</label>
                      <input type="text" value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="03-0000-0000" className="w-full border rounded-lg p-2 outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 mb-1 font-semibold">担当者名</label>
                      <input type="text" value={newPerson} onChange={e => setNewPerson(e.target.value)} placeholder="例: 山田 太郎" className="w-full border rounded-lg p-2 outline-none" />
                    </div>
                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 font-bold text-rose-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newIsImportant}
                          onChange={e => setNewIsImportant(e.target.checked)}
                          className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                        />
                        ⭐ 重要アラームを設定する
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1 font-semibold">総合メモ</label>
                    <textarea value={newMemo} onChange={e => setNewMemo(e.target.value)} rows={3} placeholder="業者に関する概要など" className="w-full border rounded-lg p-2 outline-none" />
                  </div>

                  <button onClick={handleCreateMaker} className="w-full bg-[#5e9bc4] hover:bg-sky-600 text-white font-bold py-2.5 rounded-lg transition shadow-sm">
                    新規業者を登録する
                  </button>
                </div>
              </div>
            ) : (
              /* 通常表示・編集モード */
              <>
                {/* 企業ヘッダー */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <span className="text-xs text-slate-400 font-semibold">{currentMaker.kana}</span>
                      <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 mt-0.5">
                        {currentMaker.name}
                        {currentMaker.isImportant && (
                          <span className="text-xs bg-rose-100 text-rose-700 font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-rose-200 animate-pulse">
                            ⭐ 重要アラーム中
                          </span>
                        )}
                      </h2>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                        {currentMaker.url ? (
                          <a href={currentMaker.url} target="_blank" rel="noopener noreferrer" className="text-[#5e9bc4] hover:underline font-semibold bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200 flex items-center gap-1">
                            <span>🔗</span> {currentMaker.url}
                          </a>
                        ) : (
                          <span className="text-slate-400">URL未登録</span>
                        )}
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-semibold">
                          📞 {currentMaker.contactPhone || '電話番号未登録'}
                        </span>
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-semibold">
                          👤 担当: {currentMaker.contactPerson || '未設定'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeleteMaker(currentMaker.id)}
                        className="text-xs text-rose-500 hover:text-white hover:bg-rose-500 border border-rose-200 px-3 py-1.5 rounded-lg transition font-bold"
                      >
                        🗑️ この業者を削除
                      </button>
                    </div>
                  </div>

                  {/* タブ切り替え */}
                  <div className="flex flex-wrap border-b border-slate-200 pt-2 gap-6 text-xs font-bold">
                    <button onClick={() => setActiveTab('details')} className={`pb-3 border-b-2 transition ${activeTab === 'details' ? 'border-[#5e9bc4] text-[#5e9bc4]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                      📋 詳細・3つのメモ
                    </button>
                    <button onClick={() => setActiveTab('cards')} className={`pb-3 border-b-2 transition ${activeTab === 'cards' ? 'border-[#5e9bc4] text-[#5e9bc4]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                      💳 名刺画像 (表・裏)
                    </button>
                    <button onClick={() => setActiveTab('edit')} className={`pb-3 border-b-2 transition ${activeTab === 'edit' ? 'border-[#5e9bc4] text-[#5e9bc4]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                      ✏️ 基本情報・メモの編集
                    </button>
                  </div>
                </div>

                {/* TAB 1: 詳細・3つのメモ */}
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                      <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5"><span>📝</span> 総合メモ</h3>
                      <p className="text-xs text-slate-700 whitespace-pre-wrap bg-slate-50 p-3 rounded-lg border border-slate-200">
                        {currentMaker.memo || 'メモはありません'}
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                      <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5"><span>📌</span> 独立した3つのメモ欄</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-100 space-y-1.5">
                          <span className="font-bold text-[#5e9bc4] block">メモ欄 ①</span>
                          <p className="text-slate-700 whitespace-pre-wrap">{currentMaker.customMemo1 || '未入力'}</p>
                        </div>
                        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-1.5">
                          <span className="font-bold text-emerald-600 block">メモ欄 ②</span>
                          <p className="text-slate-700 whitespace-pre-wrap">{currentMaker.customMemo2 || '未入力'}</p>
                        </div>
                        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 space-y-1.5">
                          <span className="font-bold text-amber-600 block">メモ欄 ③</span>
                          <p className="text-slate-700 whitespace-pre-wrap">{currentMaker.customMemo3 || '未入力'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: 名刺画像 (2枚裏表・取り込み直し・削除) */}
                {activeTab === 'cards' && (
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                    <div className="border-b pb-3">
                      <h3 className="font-bold text-slate-800 text-sm">💳 名刺画像（2枚裏表）</h3>
                      <p className="text-xs text-slate-400 mt-0.5">名刺の表面・裏面の画像を取り込み直したり、削除することができます。</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* 表面 */}
                      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3 text-center">
                        <span className="font-bold text-xs text-slate-700 block">【名刺 表面】</span>
                        {currentMaker.businessCards.front ? (
                          <div className="space-y-3">
                            <img
                              src={currentMaker.businessCards.front}
                              alt="名刺 表面"
                              className="max-h-48 mx-auto object-contain rounded border bg-white shadow-sm"
                            />
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => frontCardInputRef.current?.click()}
                                className="bg-[#5e9bc4] hover:bg-sky-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition"
                              >
                                取り込み直し
                              </button>
                              <button
                                onClick={() => handleDeleteCardImage('front')}
                                className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition"
                              >
                                削除
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="py-8 space-y-3">
                            <p className="text-xs text-slate-400">画像が登録されていません</p>
                            <button
                              onClick={() => frontCardInputRef.current?.click()}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition"
                            >
                              ＋ 表面を取り込む
                            </button>
                          </div>
                        )}
                        <input
                          ref={frontCardInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => handleCardImageUpload('front', e)}
                        />
                      </div>

                      {/* 裏面 */}
                      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3 text-center">
                        <span className="font-bold text-xs text-slate-700 block">【名刺 裏面】</span>
                        {currentMaker.businessCards.back ? (
                          <div className="space-y-3">
                            <img
                              src={currentMaker.businessCards.back}
                              alt="名刺 裏面"
                              className="max-h-48 mx-auto object-contain rounded border bg-white shadow-sm"
                            />
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => backCardInputRef.current?.click()}
                                className="bg-[#5e9bc4] hover:bg-sky-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition"
                              >
                                取り込み直し
                              </button>
                              <button
                                onClick={() => handleDeleteCardImage('back')}
                                className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition"
                              >
                                削除
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="py-8 space-y-3">
                            <p className="text-xs text-slate-400">画像が登録されていません</p>
                            <button
                              onClick={() => backCardInputRef.current?.click()}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition"
                            >
                              ＋ 裏面を取り込む
                            </button>
                          </div>
                        )}
                        <input
                          ref={backCardInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => handleCardImageUpload('back', e)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: 基本情報・3つのメモの編集 */}
                {activeTab === 'edit' && (
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                    <div className="border-b pb-3">
                      <h3 className="font-bold text-slate-800 text-sm">✏️ 基本情報・3つのメモ欄の編集</h3>
                      <p className="text-xs text-slate-400 mt-0.5">業者情報および3つの独立したメモ欄を自由に変更できます。</p>
                    </div>

                    <div className="space-y-4 text-xs">
                      <h4 className="font-bold text-[#5e9bc4]">■ 基本情報</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-500 mb-1 font-semibold">業者名・メーカー名</label>
                          <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full border rounded-lg p-2 outline-none" />
                        </div>
                        <div>
                          <label className="block text-slate-500 mb-1 font-semibold">カナ</label>
                          <input type="text" value={editKana} onChange={e => setEditKana(e.target.value)} className="w-full border rounded-lg p-2 outline-none" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-slate-500 mb-1 font-semibold">URL</label>
                          <input type="text" value={editUrl} onChange={e => setEditUrl(e.target.value)} className="w-full border rounded-lg p-2 outline-none" />
                        </div>
                        <div>
                          <label className="block text-slate-500 mb-1 font-semibold">電話番号</label>
                          <input type="text" value={editPhone} onChange={e => setEditPhone(e.target.value)} className="w-full border rounded-lg p-2 outline-none" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-500 mb-1 font-semibold">担当者名</label>
                          <input type="text" value={editPerson} onChange={e => setEditPerson(e.target.value)} className="w-full border rounded-lg p-2 outline-none" />
                        </div>
                        <div className="flex items-center pt-5">
                          <label className="flex items-center gap-2 font-bold text-rose-600 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editIsImportant}
                              onChange={e => setEditIsImportant(e.target.checked)}
                              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                            />
                            ⭐ 重要アラームをかける
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-500 mb-1 font-semibold">総合メモ</label>
                        <textarea value={editMemo} onChange={e => setEditMemo(e.target.value)} rows={3} className="w-full border rounded-lg p-2 outline-none" />
                      </div>

                      <div className="pt-4 border-t space-y-3">
                        <h4 className="font-bold text-[#5e9bc4]">■ 3つのメモ欄</h4>
                        <div>
                          <label className="block text-slate-500 mb-1 font-semibold">メモ欄 ①</label>
                          <textarea value={editCustomMemo1} onChange={e => setEditCustomMemo1(e.target.value)} rows={2} className="w-full border rounded-lg p-2 outline-none" />
                        </div>
                        <div>
                          <label className="block text-slate-500 mb-1 font-semibold">メモ欄 ②</label>
                          <textarea value={editCustomMemo2} onChange={e => setEditCustomMemo2(e.target.value)} rows={2} className="w-full border rounded-lg p-2 outline-none" />
                        </div>
                        <div>
                          <label className="block text-slate-500 mb-1 font-semibold">メモ欄 ③</label>
                          <textarea value={editCustomMemo3} onChange={e => setEditCustomMemo3(e.target.value)} rows={2} className="w-full border rounded-lg p-2 outline-none" />
                        </div>
                      </div>

                      <button onClick={handleSaveEdit} className="w-full bg-[#5e9bc4] hover:bg-sky-600 text-white font-bold py-2.5 rounded-lg transition shadow-sm">
                        変更を保存する
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>

        </div>
      </main>
    </div>
  );
}
