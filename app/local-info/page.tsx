'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- Supabase クライアント初期化 ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface LocalInfo {
  id: string;
  schoolOrTeamName: string;
  district: '板橋区' | '北区' | 'その他';
  eventName: string;
  url: string;
  contactPerson: string;
  memo1: string;
  memo2: string;
  memo3: string;
}

export default function LocalInfoPage() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [items, setItems] = useState<LocalInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // フォームの状態
  const [schoolOrTeamName, setSchoolOrTeamName] = useState('');
  const [district, setDistrict] = useState<'板橋区' | '北区' | 'その他'>('板橋区');
  const [eventName, setEventName] = useState('');
  const [url, setUrl] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [memo1, setMemo1] = useState('');
  const [memo2, setMemo2] = useState('');
  const [memo3, setMemo3] = useState('');

  // 初回読み込み（Supabaseからデータ取得）
  useEffect(() => {
    fetchLocalInfo();
  }, []);

  const fetchLocalInfo = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('customers').select('*');
      if (error) throw error;

      if (data) {
        // SupabaseのフィールドをLocalInfoの型に整形
        const formatted: LocalInfo[] = data.map((item: any) => ({
          id: item.id,
          schoolOrTeamName: item.name || '名称未設定',
          district: (item.grade as '板橋区' | '北区' | 'その他') || 'その他',
          eventName: item.goal || 'イベント未設定',
          url: item.square_id || '',
          contactPerson: item.square_customer_id || '',
          memo1: item.source || '',
          memo2: item.notes || '',
          memo3: ''
        }));
        setItems(formatted);
      }
    } catch (err) {
      console.error('Supabaseからのデータ取得に失敗しました:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    if (!searchKeyword.trim()) return items;
    const kw = searchKeyword.toLowerCase();
    return items.filter(
      (item) =>
        item.schoolOrTeamName.toLowerCase().includes(kw) ||
        item.eventName.toLowerCase().includes(kw) ||
        item.memo1.toLowerCase().includes(kw) ||
        item.memo2.toLowerCase().includes(kw) ||
        item.memo3.toLowerCase().includes(kw)
    );
  }, [items, searchKeyword]);

  // 新規イベント情報の追加（SupabaseへINSERT）
  const handleAddInfo = async () => {
    if (!schoolOrTeamName || !eventName) {
      alert('学校・チーム名とイベント名は必須項目です。');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([
          {
            name: schoolOrTeamName,
            grade: district,
            goal: eventName,
            square_id: url || null,
            square_customer_id: contactPerson || null,
            source: memo1 || null,
            notes: memo2 || null
          }
        ])
        .select();

      if (error) {
        alert('保存に失敗しました: ' + error.message);
        return;
      }

      alert('正常にSupabaseへ保存されました！');

      // フォームリセット & データ再取得
      setSchoolOrTeamName('');
      setEventName('');
      setUrl('');
      setContactPerson('');
      setMemo1('');
      setMemo2('');
      setMemo3('');
      fetchLocalInfo();
    } catch (err) {
      console.error('保存中にエラーが発生しました:', err);
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">近隣学校・チーム イベント情報</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
          <h2 className="font-bold text-slate-700 mb-3 border-b pb-2">イベント情報の新規登録</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">学校・チーム名 *</label>
              <input
                type="text"
                value={schoolOrTeamName}
                onChange={(e) => setSchoolOrTeamName(e.target.value)}
                className="w-full border border-slate-300 rounded p-1.5 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">対象区</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value as any)}
                className="w-full border border-slate-300 rounded p-1.5 text-sm bg-white"
              >
                <option value="板橋区">板橋区</option>
                <option value="北区">北区</option>
                <option value="その他">その他</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">イベント名 *</label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full border border-slate-300 rounded p-1.5 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">詳細URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full border border-slate-300 rounded p-1.5 text-sm"
                placeholder="https://"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">関係者・担当者名</label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full border border-slate-300 rounded p-1.5 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">メモ1</label>
              <input
                type="text"
                value={memo1}
                onChange={(e) => setMemo1(e.target.value)}
                className="w-full border border-slate-300 rounded p-1.5 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">メモ2</label>
              <input
                type="text"
                value={memo2}
                onChange={(e) => setMemo2(e.target.value)}
                className="w-full border border-slate-300 rounded p-1.5 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">メモ3</label>
              <input
                type="text"
                value={memo3}
                onChange={(e) => setMemo3(e.target.value)}
                className="w-full border border-slate-300 rounded p-1.5 text-sm"
              />
            </div>
            <button
              onClick={handleAddInfo}
              className="w-full bg-[#5e9bc4] hover:bg-sky-600 text-white font-bold py-2 rounded text-sm transition mt-2"
            >
              イベント情報をSupabaseに保存
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center gap-3">
            <span className="text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="学校名・イベント名・メモのキーワードで横断検索..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full focus:outline-none text-sm"
            />
          </div>

          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-slate-500 p-4">Supabaseからデータを読み込み中...</p>
            ) : filteredItems.length === 0 ? (
              <p className="text-sm text-slate-500 p-4">該当するイベント情報がありません。</p>
            ) : (
              filteredItems.map((item) => (
                <div key={item.id} className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold mr-2">
                        {item.district}
                      </span>
                      <h3 className="text-lg font-bold text-slate-800 inline">{item.schoolOrTeamName}</h3>
                    </div>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#5e9bc4] underline font-semibold hover:text-sky-700"
                      >
                        外部リンク ↗
                      </a>
                    )}
                  </div>

                  <p className="font-semibold text-slate-700 mb-2">イベント: {item.eventName}</p>
                  <p className="text-xs text-slate-500 mb-3">担当者: {item.contactPerson || 'なし'}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded text-xs border border-slate-100">
                    <div>
                      <span className="font-bold text-slate-500">メモ1:</span> {item.memo1 || '-'}
                    </div>
                    <div>
                      <span className="font-bold text-slate-500">メモ2:</span> {item.memo2 || '-'}
                    </div>
                    <div>
                      <span className="font-bold text-slate-500">メモ3:</span> {item.memo3 || '-'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
