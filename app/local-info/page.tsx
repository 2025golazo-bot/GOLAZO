'use client';

import React, { useState, useMemo } from 'react';

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

  const [items, setItems] = useState<LocalInfo[]>([
    {
      id: 'info-1',
      schoolOrTeamName: '板橋第十小学校',
      district: '板橋区',
      eventName: '秋季運動会',
      url: 'https://example.com/itabashi10',
      contactPerson: '山田 体育主任',
      memo1: 'グラウンド使用可否要確認',
      memo2: '体験会チラシ持参',
      memo3: '雨天順延時は翌日'
    },
    {
      id: 'info-2',
      schoolOrTeamName: '赤羽FCジュニア',
      district: '北区',
      eventName: '地域少年サッカー大会',
      url: 'https://example.com/akabane-fc',
      contactPerson: '佐藤 コーチ',
      memo1: '体幹測定イベントの相談',
      memo2: 'ブース設営スペースあり',
      memo3: '参加者50名程度'
    }
  ]);

  const [schoolOrTeamName, setSchoolOrTeamName] = useState('');
  const [district, setDistrict] = useState<'板橋区' | '北区' | 'その他'>('板橋区');
  const [eventName, setEventName] = useState('');
  const [url, setUrl] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [memo1, setMemo1] = useState('');
  const [memo2, setMemo2] = useState('');
  const [memo3, setMemo3] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchKeyword.trim()) return items;
    const kw = searchKeyword.toLowerCase();
    return items.filter((item) =>
      item.schoolOrTeamName.toLowerCase().includes(kw) ||
      item.eventName.toLowerCase().includes(kw) ||
      item.memo1.toLowerCase().includes(kw) ||
      item.memo2.toLowerCase().includes(kw) ||
      item.memo3.toLowerCase().includes(kw)
    );
  }, [items, searchKeyword]);

  const handleAddInfo = () => {
    if (!schoolOrTeamName || !eventName) return;
    const newItem: LocalInfo = {
      id: `info-${Date.now()}`,
      schoolOrTeamName,
      district,
      eventName,
      url,
      contactPerson,
      memo1,
      memo2,
      memo3
    };
    setItems([newItem, ...items]);
    setSchoolOrTeamName('');
    setEventName('');
    setUrl('');
    setContactPerson('');
    setMemo1('');
    setMemo2('');
    setMemo3('');
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">近隣学校・チーム イベント情報</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
          <h2 className="font-bold text-slate-700 mb-3 border-b pb-2">イベント情報の新規登録</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">学校・チーム名</label>
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
              <label className="text-xs font-semibold text-slate-600 block mb-1">イベント名</label>
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
              イベント情報を追加
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
            {filteredItems.map((item) => (
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
                  <div><span className="font-bold text-slate-500">メモ1:</span> {item.memo1 || '-'}</div>
                  <div><span className="font-bold text-slate-500">メモ2:</span> {item.memo2 || '-'}</div>
                  <div><span className="font-bold text-slate-500">メモ3:</span> {item.memo3 || '-'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
