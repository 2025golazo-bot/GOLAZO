'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { createClient } from '@supabase/supabase-js';

// --- Supabaseクライアント初期化 ---
// 環境変数からURLとANON_KEYを取得します
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- 型定義 ---
interface Session {
  id: string;
  date: string;
  staff: string;
  content: string;
  homework: string;
  photo: string | null;
}

interface PhysicalData {
  id: string;
  date: string;
  weight: number;
  fat: number;
  muscle: number;
  note?: string;
}

interface Customer {
  id: string;
  name: string;
  kana: string;
  phone: string;
  age: number;
  birthdate: string;
  first_lesson_date: string;
  last_reservation_date: string;
  concern: string;
  target: string;
  memo: string;
  // 要望対応：独立した3つのメモ欄（Supabaseのカラム名に合わせてスネークケースまたはキャメルケース）
  custom_memo_1: string;
  custom_memo_2: string;
  custom_memo_3: string;
  ticket_remaining: number;
  physical_history: PhysicalData[];
  sessions: Session[];
}

export default function SupabaseClientsPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'carte' | 'tickets' | 'edit_info'>('carte');

  // 編集用ステート
  const [editForm, setEditForm] = useState({
    name: '',
    kana: '',
    phone: '',
    concern: '',
    target: '',
    memo: ''
  });
  const [editCustomMemo1, setEditCustomMemo1] = useState('');
  const [editCustomMemo2, setEditCustomMemo2] = useState('');
  const [editCustomMemo3, setEditCustomMemo3] = useState('');

  // データの取得 (SupabaseからSELECT)
  const fetchCustomers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('customers').select('*');
    if (error) {
      console.error('データ取得エラー:', error.message);
    } else if (data && data.length > 0) {
      setCustomers(data);
      if (!selectedCustomerId) {
        setSelectedCustomerId(data[0].id);
        initEditForm(data[0]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const currentCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];

  const initEditForm = (cust: Customer) => {
    setEditForm({
      name: cust.name || '',
      kana: cust.kana || '',
      phone: cust.phone || '',
      concern: cust.concern || '',
      target: cust.target || '',
      memo: cust.memo || ''
    });
    setEditCustomMemo1(cust.custom_memo_1 || '');
    setEditCustomMemo2(cust.custom_memo_2 || '');
    setEditCustomMemo3(cust.custom_memo_3 || '');
  };

  const handleSelectCustomer = (id: string) => {
    setSelectedCustomerId(id);
    const target = customers.find(c => c.id === id);
    if (target) {
      initEditForm(target);
    }
  };

  // 基本情報の保存 (SupabaseへUPDATE)
  const handleSaveInfo = async () => {
    if (!currentCustomer) return;
    const { error } = await supabase
      .from('customers')
      .update({
        name: editForm.name,
        kana: editForm.kana,
        phone: editForm.phone,
        concern: editForm.concern,
        target: editForm.target,
        memo: editForm.memo
      })
      .eq('id', currentCustomer.id);

    if (error) {
      alert('保存に失敗しました: ' + error.message);
    } else {
      alert('基本情報を更新しました！');
      fetchCustomers();
    }
  };

  // 3つのメモ欄の保存 (SupabaseへUPDATE)
  const handleSaveCustomMemos = async () => {
    if (!currentCustomer) return;
    const { error } = await supabase
      .from('customers')
      .update({
        custom_memo_1: editCustomMemo1,
        custom_memo_2: editCustomMemo2,
        custom_memo_3: editCustomMemo3
      })
      .eq('id', currentCustomer.id);

    if (error) {
      alert('メモの保存に失敗しました: ' + error.message);
    } else {
      alert('3つのメモ欄を更新しました！');
      fetchCustomers();
    }
  };

  const filteredCustomers = customers.filter(c => {
    const query = searchKeyword.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(query)) ||
      (c.kana && c.kana.toLowerCase().includes(query)) ||
      (c.concern && c.concern.toLowerCase().includes(query)) ||
      (c.memo && c.memo.toLowerCase().includes(query))
    );
  });

  if (loading) {
    return (
      <div className="bg-slate-100 min-h-screen text-slate-800 font-sans">
        <Header />
        <div className="p-12 text-center text-slate-500 font-bold">データを読み込み中...</div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="bg-slate-100 min-h-screen text-slate-800 font-sans">
        <Header />
        <div className="p-12 text-center space-y-4">
          <p className="text-slate-600 font-bold text-base">生徒データが見つかりません。Supabaseの `customers` テーブルにデータを追加してください。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 font-sans pb-12">
      <Header />

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          {/* 左カラム：受講生一覧 */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1"><span>🔍</span> キーワード検索</label>
              <input
                type="text"
                placeholder="名前、悩み、メモで検索..."
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#5e9bc4] outline-none"
              />
            </div>

            <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider px-1">受講生一覧 ({filteredCustomers.length}名)</h3>

            <div className="space-y-2.5">
              {filteredCustomers.map(cust => {
                const isSelected = selectedCustomerId === cust.id;
                return (
                  <div
                    key={cust.id}
                    onClick={() => handleSelectCustomer(cust.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all shadow-sm ${
                      isSelected ? 'bg-sky-50/80 border-[#5e9bc4] ring-2 ring-[#5e9bc4]/20' : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`font-bold ${isSelected ? 'text-[#5e9bc4]' : 'text-slate-800'}`}>{cust.name}</span>
                      <span className="text-xs font-semibold text-[#5e9bc4] bg-sky-100/60 px-2 py-0.5 rounded-full">{cust.age}歳</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">連絡先: {cust.phone || '未設定'}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 右カラム：メインコンテンツ */}
          <div className="md:col-span-3 space-y-5">
            {currentCustomer && (
              <>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs text-slate-400 font-semibold">{currentCustomer.kana}</span>
                      <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 mt-0.5">
                        {currentCustomer.name}
                        <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">{currentCustomer.age}歳</span>
                      </h2>
                    </div>
                    <span className="bg-sky-50 text-[#5e9bc4] border border-sky-200 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1">
                      <span>🎟️</span> 回数券 残数: <strong className="text-sm">{currentCustomer.ticket_remaining ?? 0}</strong> 回
                    </span>
                  </div>

                  {/* タブ切り替え */}
                  <div className="flex border-b border-slate-200 pt-2 gap-6 text-xs font-bold">
                    <button onClick={() => setActiveTab('carte')} className={`pb-3 border-b-2 transition ${activeTab === 'carte' ? 'border-[#5e9bc4] text-[#5e9bc4]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                      📋 カルテ (セッション & 計測)
                    </button>
                    <button onClick={() => setActiveTab('tickets')} className={`pb-3 border-b-2 transition ${activeTab === 'tickets' ? 'border-[#5e9bc4] text-[#5e9bc4]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                      🎟️ チケット・Square
                    </button>
                    <button onClick={() => setActiveTab('edit_info')} className={`pb-3 border-b-2 transition ${activeTab === 'edit_info' ? 'border-[#5e9bc4] text-[#5e9bc4]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                      ✏️ 基本情報・3つのメモ
                    </button>
                  </div>
                </div>

                {/* TAB 1: カルテ */}
                {activeTab === 'carte' && (
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-bold text-slate-800 text-sm">📋 セッション履歴・身体測定</h3>
                    <p className="text-xs text-slate-400">お悩み: {currentCustomer.concern || '未設定'}</p>
                    <p className="text-xs text-slate-400">目標: {currentCustomer.target || '未設定'}</p>
                  </div>
                )}

                {/* TAB 2: チケット */}
                {activeTab === 'tickets' && (
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-bold text-slate-800 text-sm">🎟️ チケット・決済履歴</h3>
                    <p className="text-xs text-slate-500">現在の残り回数: {currentCustomer.ticket_remaining ?? 0}回</p>
                  </div>
                )}

                {/* TAB 3: 基本情報編集 ＆ メモ欄3つ */}
                {activeTab === 'edit_info' && (
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                    <div className="border-b pb-3">
                      <h3 className="font-bold text-slate-800 text-sm">✏️ 基本情報・3つのメモ欄の編集 (Supabase同期)</h3>
                      <p className="text-xs text-slate-400 mt-0.5">変更した内容はSupabaseデータベースに即時保存されます。</p>
                    </div>

                    {/* 基本情報フォーム */}
                    <div className="space-y-4 text-xs">
                      <h4 className="font-bold text-[#5e9bc4]">■ 基本プロフィール</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-500 mb-1 font-semibold">氏名</label>
                          <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 outline-none" />
                        </div>
                        <div>
                          <label className="block text-slate-500 mb-1 font-semibold">フリガナ</label>
                          <input type="text" value={editForm.kana} onChange={e => setEditForm({...editForm, kana: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 outline-none" />
                        </div>
                        <div>
                          <label className="block text-slate-500 mb-1 font-semibold">電話番号</label>
                          <input type="text" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 outline-none" />
                        </div>
                        <div>
                          <label className="block text-slate-500 mb-1 font-semibold">お悩み・課題</label>
                          <input type="text" value={editForm.concern} onChange={e => setEditForm({...editForm, concern: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 outline-none" />
                        </div>
                        <div>
                          <label className="block text-slate-500 mb-1 font-semibold">目標</label>
                          <input type="text" value={editForm.target} onChange={e => setEditForm({...editForm, target: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 outline-none" />
                        </div>
                        <div>
                          <label className="block text-slate-500 mb-1 font-semibold">全体メモ・既往歴</label>
                          <input type="text" value={editForm.memo} onChange={e => setEditForm({...editForm, memo: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 outline-none" />
                        </div>
                      </div>
                      <button onClick={handleSaveInfo} className="bg-[#5e9bc4] hover:bg-sky-600 text-white font-bold px-4 py-2 rounded-lg transition shadow-sm">
                        基本情報をSupabaseに保存する
                      </button>
                    </div>

                    <hr className="border-slate-200" />

                    {/* 独立した3つのメモ欄編集 */}
                    <div className="space-y-4 text-xs">
                      <h4 className="font-bold text-[#5e9bc4]">■ 独立した3つのメモ欄 (特記事項・食事・自主練など)</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-slate-500 mb-1 font-semibold">カスタムメモ1 (例: 特記事項)</label>
                          <textarea rows={2} value={editCustomMemo1} onChange={e => setEditCustomMemo1(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#5e9bc4]" />
                        </div>
                        <div>
                          <label className="block text-slate-500 mb-1 font-semibold">カスタムメモ2 (例: 食事面)</label>
                          <textarea rows={2} value={editCustomMemo2} onChange={e => setEditCustomMemo2(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#5e9bc4]" />
                        </div>
                        <div>
                          <label className="block text-slate-500 mb-1 font-semibold">カスタムメモ3 (例: 自主練・宿題進捗)</label>
                          <textarea rows={2} value={editCustomMemo3} onChange={e => setEditCustomMemo3(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#5e9bc4]" />
                        </div>
                      </div>
                      <button onClick={handleSaveCustomMemos} className="bg-[#5e9bc4] hover:bg-sky-600 text-white font-bold px-4 py-2 rounded-lg transition shadow-sm">
                        3つのメモ欄をSupabaseに保存する
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
