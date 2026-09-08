'use client';

import React, { useState, useMemo } from 'react';

// セッションの型定義（photo に string | null を許容）
interface Session {
  id: string;
  date: string;
  staff: string;
  content: string;
  homework: string;
  photo: string | null;
}

function calculateAge(birthdateStr: string) {
  if (!birthdateStr) return '';
  const birth = new Date(birthdateStr);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();

  if (months < 0 || (months === 0 && now.getDate() < birth.getDate())) {
    years--;
    months += 12;
  }
  if (now.getDate() < birth.getDate()) {
    months--;
  }
  return `${years}歳${months < 0 ? months + 12 : months}ヶ月`;
}

export default function StudentDetail() {
  const [activeTab, setActiveTab] = useState<'session' | 'measurement' | 'search'>('session');

  const parentData = {
    id: 'p-101',
    name: '藤田 奈々',
    ticketRemaining: 1,
    ticketsHistory: [
      { id: 't-1', date: '2026-06-01', title: '回数券 10回分', count: 10, expire: '2026-12-01' }
    ]
  };

  const [student, setStudent] = useState({
    id: 's-001',
    name: '藤田 陸',
    kana: 'フジタ リク',
    birthdate: '2015-05-12',
    firstLessonDate: '2026-03-01',
    lastReservationDate: '2026-08-10',
    concern: 'サッカーでの体幹ブレ、走力向上',
    target: 'トレセン選出・怪我予防',
    memo: '右足首捻挫の既往歴あり'
  });

  // Session[] 型を明示指定
  const [sessions, setSessions] = useState<Session[]>([
    { id: 'ses-1', date: '2026-08-10', staff: '藤田 渉仁', content: 'KOBA式体幹トレーニング・リアクションアジリティ', homework: '片足バランス1分×2', photo: null }
  ]);

  const [newStaff, setNewStaff] = useState('藤田 渉仁');
  const [newContent, setNewContent] = useState('');
  const [newHomework, setNewHomework] = useState('');
  const [homeworkPhotoPreview, setHomeworkPhotoPreview] = useState<string | null>(null);

  const ageStr = calculateAge(student.birthdate);
  const ticketAlert = parentData.ticketRemaining <= 1;

  const daysSinceLastResv = Math.floor(
    (new Date().getTime() - new Date(student.lastReservationDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  const alert2Weeks = daysSinceLastResv >= 14 && daysSinceLastResv < 30;
  const alert1Month = daysSinceLastResv >= 30;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setHomeworkPhotoPreview(url);
    }
  };

  const handleAddSession = () => {
    if (!newContent) return;
    const newEntry: Session = {
      id: `ses-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      staff: newStaff,
      content: newContent,
      homework: newHomework,
      photo: homeworkPhotoPreview
    };
    setSessions([newEntry, ...sessions]);
    setNewContent('');
    setNewHomework('');
    setHomeworkPhotoPreview(null);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs text-slate-400 font-bold">{student.kana}</span>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              {student.name}
              <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                生年月日: {student.birthdate}（{ageStr}）
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              保護者: <span className="font-semibold text-slate-700">{parentData.name}</span> | 共有回数券残数: <span className="font-bold text-[#5e9bc4]">{parentData.ticketRemaining}回</span>
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">初回レッスン日</span>
            <span className="text-sm font-semibold text-slate-700">{student.firstLessonDate}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {alert2Weeks && (
            <span className="bg-amber-100 text-amber-800 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
              ⚠️ 最終予約から2週間未予約
            </span>
          )}
          {alert1Month && (
            <span className="bg-rose-100 text-rose-800 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
              🚨 1ヶ月未予約
            </span>
          )}
          {ticketAlert && (
            <span className="bg-amber-100 text-amber-900 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
              🎟️ 回数券残り1回
            </span>
          )}
          <span className="bg-sky-100 text-sky-800 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
            📊 3ヶ月測定対象月アラート（次回測定予定月）
          </span>
        </div>
      </div>

      <div className="flex border-b border-slate-200 mb-6 bg-white rounded-t-lg px-2 pt-2">
        <button
          onClick={() => setActiveTab('session')}
          className={`px-5 py-2.5 text-sm font-bold border-b-2 transition ${
            activeTab === 'session' ? 'border-[#5e9bc4] text-[#5e9bc4]' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          セッション記録
        </button>
        <button
          onClick={() => setActiveTab('measurement')}
          className={`px-5 py-2.5 text-sm font-bold border-b-2 transition ${
            activeTab === 'measurement' ? 'border-[#5e9bc4] text-[#5e9bc4]' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          3ヶ月測定詳細
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`px-5 py-2.5 text-sm font-bold border-b-2 transition ${
            activeTab === 'search' ? 'border-[#5e9bc4] text-[#5e9bc4]' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          検索・カルテ情報編集
        </button>
      </div>

      {activeTab === 'session' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">新規セッション入力</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">担当者</label>
                <input
                  type="text"
                  value={newStaff}
                  onChange={(e) => setNewStaff(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-[#5e9bc4] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">トレーニング内容</label>
                <textarea
                  rows={3}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-[#5e9bc4] focus:outline-none"
                  placeholder="実施メニューや状態を入力"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">宿題内容</label>
                <input
                  type="text"
                  value={newHomework}
                  onChange={(e) => setNewHomework(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-[#5e9bc4] focus:outline-none"
                  placeholder="自宅でのトレーニング等"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">宿題写真アップロード</label>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="text-xs" />
                {homeworkPhotoPreview && (
                  <img src={homeworkPhotoPreview} alt="宿題プレビュー" className="mt-2 w-full h-32 object-cover rounded border" />
                )}
              </div>
              <button
                onClick={handleAddSession}
                className="w-full bg-[#5e9bc4] hover:bg-sky-600 text-white font-bold py-2 rounded text-sm transition"
              >
                セッション記録を保存
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-slate-800">時系列セッション履歴</h3>
            {sessions.map((s) => (
              <div key={s.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-2 text-xs text-slate-500">
                  <span className="font-bold text-slate-700">{s.date}</span>
                  <span>担当: {s.staff}</span>
                </div>
                <p className="text-sm text-slate-800 mb-2">{s.content}</p>
                {s.homework && (
                  <div className="bg-amber-50 border border-amber-200 p-2 rounded text-xs text-amber-900 mb-2">
                    <span className="font-bold">宿題:</span> {s.homework}
                  </div>
                )}
                {s.photo && (
                  <img src={s.photo} alt="宿題" className="w-24 h-24 object-cover rounded border" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'measurement' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-6">
          <div className="bg-[#FFE8AB] text-amber-900 p-4 rounded-lg flex justify-between items-center">
            <div>
              <p className="font-bold text-sm">初回レッスン起算: {student.firstLessonDate}</p>
              <p className="text-xs mt-0.5">次回3ヶ月測定予定月: 2026年9月（測定対象期）</p>
            </div>
            <span className="bg-amber-800 text-white text-xs px-3 py-1 rounded-full font-bold">当月ハイライト対象</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded border border-slate-200 bg-slate-50">
              <p className="text-xs text-slate-500">体重（現在）</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">38.5 kg</p>
              <p className="text-xs font-semibold text-emerald-600 mt-1">前回比: +1.2 kg</p>
            </div>
            <div className="p-4 rounded border border-slate-200 bg-slate-50">
              <p className="text-xs text-slate-500">体脂肪率</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">15.2 %</p>
              <p className="text-xs font-semibold text-sky-600 mt-1">初回比: -0.5 %</p>
            </div>
            <div className="p-4 rounded border border-slate-200 bg-slate-50">
              <p className="text-xs text-slate-500">フィジカルスコア</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">82 / 100</p>
              <p className="text-xs font-semibold text-emerald-600 mt-1">前回比: +5 pt</p>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-700 mb-2">姿勢写真・各種テスト画像ストレージ</h4>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center text-slate-400 bg-slate-50 hover:bg-slate-100 transition cursor-pointer">
              姿勢写真3枚（正面・側面・背面）およびケガゼロ/フィジカルチェック結果をドラッグ＆ドロップして保存
            </div>
          </div>
        </div>
      )}

      {activeTab === 'search' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-bold text-slate-800 border-b pb-2">基本情報・お悩み手動編集</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">お悩み</label>
              <textarea
                value={student.concern}
                onChange={(e) => setStudent({ ...student, concern: e.target.value })}
                className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-[#5e9bc4] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">目標</label>
              <textarea
                value={student.target}
                onChange={(e) => setStudent({ ...student, target: e.target.value })}
                className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-[#5e9bc4] focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-600 block mb-1">メモ欄</label>
              <textarea
                value={student.memo}
                onChange={(e) => setStudent({ ...student, memo: e.target.value })}
                className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-[#5e9bc4] focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
