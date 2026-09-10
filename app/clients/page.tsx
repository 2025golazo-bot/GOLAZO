'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';

// --- 型定義 ---
interface Session {
  id: string;
  date: string; // YYYY-MM-DD
  staff: string; // TAKA or NANA
  content: string;
  homework: string;
  photo: string | null;
}

interface PhysicalData {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number;
  fat: number;
  muscle: number;
  note?: string;
  posturePhotos?: {
    front?: string | null;
    side?: string | null;
    back?: string | null;
  };
  testPhotos?: string[]; // ケガゼロ/フィジカルチェック等
}

interface TicketHistory {
  id: string;
  date: string;
  title: string;
  count: number;
  expire: string;
  squarePaymentId: string;
}

interface Parent {
  id: string;
  name: string;
  kana: string;
  phone: string;
  isTicketSystem: boolean;
  ticketRemaining: number;
  ticketsHistory: TicketHistory[];
}

interface Student {
  id: string;
  parentId: string;
  name: string;
  kana: string;
  age: number;
  birthdate: string;
  firstLessonDate: string;
  lastReservationDate: string;
  concern: string;
  target: string;
  memo: string;
  alert: string | null;
  physicalHistory: PhysicalData[];
  sessions: Session[];
}

export default function ClientsPage() {
  // 保護者データ
  const [parents, setParents] = useState<Parent[]>([
    {
      id: 'p-101',
      name: '藤田 奈々',
      kana: 'フジタ ナナ',
      phone: '090-1111-2222',
      isTicketSystem: true,
      ticketRemaining: 1,
      ticketsHistory: [
        { id: 'th-1', date: '2026-06-01', title: '10回券 (共通)', count: 10, expire: '2026-12-01', squarePaymentId: 'sq_pay_998811' }
      ]
    },
    {
      id: 'p-102',
      name: '山田 太郎',
      kana: 'ヤマダ タロウ',
      phone: '090-1234-5678',
      isTicketSystem: false,
      ticketRemaining: 0,
      ticketsHistory: [
        { id: 'th-2', date: '2026-08-01', title: '通常都度レッスン', count: 1, expire: '2027-02-01', squarePaymentId: 'sq_pay_772200' }
      ]
    }
  ]);

  // 受講生データ一覧
  const [students, setStudents] = useState<Student[]>([
    {
      id: 's-001',
      parentId: 'p-101',
      name: '藤田 陸',
      kana: 'フジタ リク',
      age: 11,
      birthdate: '2015-05-12',
      firstLessonDate: '2026-03-01',
      lastReservationDate: '2026-10-05',
      concern: 'サッカーでの体幹ブレ・走力向上',
      target: 'トレセン選出・ブレない軸作り',
      memo: '右足首捻挫の既往歴あり。兄。',
      alert: '⚠️ 3ヶ月測定の時期です',
      physicalHistory: [
        {
          id: 'm-1',
          date: '2026-06-01',
          weight: 37.5,
          fat: 16.0,
          muscle: 29.5,
          note: '初回3ヶ月測定',
          posturePhotos: { front: null, side: null, back: null },
          testPhotos: []
        },
        {
          id: 'm-2',
          date: '2026-09-01',
          weight: 38.7,
          fat: 15.2,
          muscle: 30.8,
          note: '2回目3ヶ月測定',
          posturePhotos: { front: null, side: null, back: null },
          testPhotos: []
        }
      ],
      sessions: [
        { id: 'ses-101', date: '2026-10-05', staff: 'TAKA', content: 'フィジカルテスト＆スプリントフォームチェック', homework: '体幹キープ 1分×3セット', photo: null },
        { id: 'ses-102', date: '2026-09-15', staff: 'NANA', content: 'KOBA式体幹トレーニング＆アジリティ', homework: '片足バランス 1分×2回', photo: null }
      ]
    },
    {
      id: 's-002',
      parentId: 'p-102',
      name: '山田 花子',
      kana: 'ヤマダ ハナコ',
      age: 9,
      birthdate: '2017-04-10',
      firstLessonDate: '2026-05-10',
      lastReservationDate: '2026-10-01',
      concern: '姿勢改善・柔軟性向上',
      target: 'バランス感覚UP',
      memo: '通常都度レッスン利用。',
      alert: null,
      physicalHistory: [
        {
          id: 'm-3',
          date: '2026-08-01',
          weight: 28.0,
          fat: 18.0,
          muscle: 20.0,
          note: '初回計測',
          posturePhotos: { front: null, side: null, back: null },
          testPhotos: []
        }
      ],
      sessions: [
        { id: 'ses-201', date: '2026-10-01', staff: 'NANA', content: 'ピラティス＆ストレッチ', homework: '長座体前屈ストレッチ', photo: null }
      ]
    }
  ]);

  // UI状態
  const [selectedStudentId, setSelectedStudentId] = useState<string>('s-001');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'carte' | 'tickets' | 'edit_info'>('carte');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingSession, setEditingSession] = useState<Session | null>(null);

  // 写真拡大プレビュー用ステート
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // 選択中の生徒と保護者
  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];
  const currentParent = parents.find(p => p.id === currentStudent.parentId) || parents[0];
  const siblingStudents = students.filter(s => s.parentId === currentParent.id);

  const physicalDates = currentStudent.physicalHistory.map(m => m.date);
  
  // 比較用の Before / After 選択状態
  const [beforeDate, setBeforeDate] = useState<string>(physicalDates[0] || '2026-06-01');
  const [afterDate, setAfterDate] = useState<string>(physicalDates[physicalDates.length - 1] || '2026-09-01');

  // 新規計測日追加用の入力ステート
  const [newMeasureDate, setNewMeasureDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // 選択された日付に対応する PhysicalData オブジェクトを特定
  const beforePhysical = currentStudent.physicalHistory.find(m => m.date === beforeDate) || currentStudent.physicalHistory[0];
  const afterPhysical = currentStudent.physicalHistory.find(m => m.date === afterDate) || currentStudent.physicalHistory[currentStudent.physicalHistory.length - 1];

  const [newSessionDate, setNewSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newSessionStaff, setNewSessionStaff] = useState<'TAKA' | 'NANA'>('TAKA');
  const [newSessionContent, setNewSessionContent] = useState<string>('');
  const [newSessionHomework, setNewSessionHomework] = useState<string>('');

  const [editForm, setEditForm] = useState({
    name: currentStudent.name,
    kana: currentStudent.kana,
    phone: currentParent.phone,
    concern: currentStudent.concern,
    target: currentStudent.target,
    memo: currentStudent.memo
  });

  const filteredStudents = students.filter(s => {
    const parent = parents.find(p => p.id === s.parentId);
    const query = searchKeyword.toLowerCase();
    return (
      s.name.toLowerCase().includes(query) ||
      s.kana.toLowerCase().includes(query) ||
      s.concern.toLowerCase().includes(query) ||
      s.memo.toLowerCase().includes(query) ||
      (parent && parent.name.toLowerCase().includes(query))
    );
  });

  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id);
    const target = students.find(s => s.id === id);
    if (target) {
      setEditForm({
        name: target.name,
        kana: target.kana,
        phone: parents.find(p => p.id === target.parentId)?.phone || '',
        concern: target.concern,
        target: target.target,
        memo: target.memo
      });
      if (target.physicalHistory.length > 0) {
        setBeforeDate(target.physicalHistory[0].date);
        setAfterDate(target.physicalHistory[target.physicalHistory.length - 1].date);
      } else {
        setBeforeDate('');
        setAfterDate('');
      }
    }
  };

  // 3ヶ月ごとの測定・写真データを新しい日付で追加する関数
  const handleAddNewMeasureDate = () => {
    if (!newMeasureDate) return;
    const exists = currentStudent.physicalHistory.some(m => m.date === newMeasureDate);
    if (exists) {
      alert('すでに登録されている計測日です。');
      return;
    }

    const newPh: PhysicalData = {
      id: `m-${Date.now()}`,
      date: newMeasureDate,
      weight: 0,
      fat: 0,
      muscle: 0,
      note: '定期計測',
      posturePhotos: { front: null, side: null, back: null },
      testPhotos: []
    };

    setStudents(prev =>
      prev.map(s => {
        if (s.id !== currentStudent.id) return s;
        const updated = [...s.physicalHistory, newPh].sort((a, b) => a.date.localeCompare(b.date));
        return { ...s, physicalHistory: updated };
      })
    );
    setAfterDate(newMeasureDate);
    alert(`新しい計測日 (${newMeasureDate}) のデータを追加しました！`);
  };

  const handleAddSession = () => {
    if (!newSessionContent) return;
    const newSession: Session = {
      id: `ses-${Date.now()}`,
      date: newSessionDate,
      staff: newSessionStaff,
      content: newSessionContent,
      homework: newSessionHomework,
      photo: null
    };

    setStudents(prev =>
      prev.map(s => (s.id === currentStudent.id ? { ...s, sessions: [newSession, ...s.sessions] } : s))
    );

    if (currentParent.isTicketSystem) {
      setParents(prev =>
        prev.map(p => (p.id === currentParent.id ? { ...p, ticketRemaining: Math.max(0, p.ticketRemaining - 1) } : p))
      );
    }

    setNewSessionContent('');
    setNewSessionHomework('');
    alert('セッションを登録しました！');
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm('本当にこの受講生データを削除しますか？')) {
      setStudents(prev => prev.filter(s => s.id !== id));
      const remaining = filteredStudents.filter(s => s.id !== id);
      if (remaining.length > 0) {
        setSelectedStudentId(remaining[0].id);
      }
    }
  };

  const handleSquareSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      alert('Squareの最新決済・チケットデータの同期が完了しました！');
    }, 1200);
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    targetDate: string,
    type: 'posture' | 'test',
    keyName?: 'front' | 'side' | 'back'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);

    setStudents(prev =>
      prev.map(s => {
        if (s.id !== currentStudent.id) return s;
        
        let updatedHistory = s.physicalHistory.map(m => {
          if (m.date !== targetDate) return m;

          if (type === 'posture' && keyName) {
            const currentPhotos = m.posturePhotos || { front: null, side: null, back: null };
            return {
              ...m,
              posturePhotos: {
                ...currentPhotos,
                [keyName]: url
              }
            };
          } else if (type === 'test') {
            return {
              ...m,
              testPhotos: [...(m.testPhotos || []), url]
            };
          }
          return m;
        });
        return { ...s, physicalHistory: updatedHistory };
      })
    );
    e.target.value = '';
  };

  const handleDeleteTestPhoto = (targetDate: string, photoIndex: number) => {
    if (!confirm('このテストシート写真を削除しますか？')) return;
    setStudents(prev =>
      prev.map(s => {
        if (s.id !== currentStudent.id) return s;
        const updatedHistory = s.physicalHistory.map(m => {
          if (m.date !== targetDate) return m;
          const newTestPhotos = (m.testPhotos || []).filter((_, idx) => idx !== photoIndex);
          return { ...m, testPhotos: newTestPhotos };
        });
        return { ...s, physicalHistory: updatedHistory };
      })
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
        {/* 左側：生徒リスト・検索 */}
        <div className="w-full md:w-80 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-4 shadow-lg">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg text-emerald-400 flex items-center gap-2">
              <span>👥</span> 受講生一覧
            </h2>
            <button
              onClick={handleSquareSync}
              disabled={isSyncing}
              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1.5 rounded-lg transition flex items-center gap-1 disabled:opacity-50"
            >
              {isSyncing ? '同期中...' : '🔄 Square同期'}
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="名前・保護者・お悩みで検索..."
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 max-h-[calc(100vh-280px)]">
            {filteredStudents.map(student => {
              const p = parents.find(parent => parent.id === student.parentId);
              const isSelected = student.id === selectedStudentId;
              return (
                <div
                  key={student.id}
                  onClick={() => handleSelectStudent(student.id)}
                  className={`p-3 rounded-lg cursor-pointer transition border ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500/80 shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-base text-white">{student.name}</span>
                      <span className="text-xs text-slate-400 ml-2">({student.age}歳)</span>
                    </div>
                    {student.alert && (
                      <span className="text-xs bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                        要確認
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">保護者: {p?.name || '未設定'}</div>
                  <div className="text-xs text-emerald-400/90 mt-1 truncate">🎯 {student.concern}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 右側：メインコンテンツ */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-6 shadow-lg">
          {/* 生徒ヘッダー情報 */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-white">{currentStudent.name}</h1>
                <span className="text-sm text-slate-400">({currentStudent.kana})</span>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-full">
                  {currentStudent.age}歳 ({currentStudent.birthdate}生)
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                <span>👤 保護者: <strong className="text-slate-200">{currentParent.name}</strong> ({currentParent.phone})</span>
                <span>🎟️ チケット残: <strong className="text-emerald-400 font-bold">{currentParent.ticketRemaining}回</strong></span>
                <span>📅 初回レッスン: {currentStudent.firstLessonDate}</span>
              </div>

              {/* 兄弟・家族リンク */}
              {siblingStudents.length > 1 && (
                <div className="flex items-center gap-2 mt-2 text-xs">
                  <span className="text-slate-500">ご家族:</span>
                  {siblingStudents.map(sib => (
                    <button
                      key={sib.id}
                      onClick={() => handleSelectStudent(sib.id)}
                      className={`px-2 py-0.5 rounded border transition ${
                        sib.id === currentStudent.id
                          ? 'bg-emerald-600 border-emerald-500 text-white font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {sib.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* タブ・削除ボタン */}
            <div className="flex items-center gap-2">
              <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setActiveTab('carte')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                    activeTab === 'carte' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  カルテ・比較
                </button>
                <button
                  onClick={() => setActiveTab('tickets')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                    activeTab === 'tickets' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  チケット履歴
                </button>
              </div>
              <button
                onClick={() => handleDeleteStudent(currentStudent.id)}
                className="text-xs text-rose-400 hover:text-rose-300 bg-rose-950/30 border border-rose-900/50 p-2 rounded-lg transition"
                title="受講生を削除"
              >
                🗑️
              </button>
            </div>
          </div>

          {/* カルテタブ内容 */}
          {activeTab === 'carte' && (
            <div className="flex flex-col gap-6">
              {currentStudent.alert && (
                <div className="bg-amber-950/40 border border-amber-500/50 rounded-lg p-3 text-amber-300 text-sm flex items-center gap-2">
                  <span>{currentStudent.alert}</span>
                </div>
              )}

              {/* 新規計測日追加セクション */}
              <div className="bg-slate-950/80 border border-emerald-500/30 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-emerald-400">＋ 新しい計測日・写真データを追加する</h4>
                  <p className="text-xs text-slate-400 mt-0.5">3ヶ月ごとの定期計測データを新しくリストへ蓄積します。</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <input
                    type="date"
                    value={newMeasureDate}
                    onChange={e => setNewMeasureDate(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={handleAddNewMeasureDate}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded transition whitespace-nowrap"
                  >
                    追加する
                  </button>
                </div>
              </div>

              {/* 📸 写真比較セクション */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <h3 className="font-bold text-base text-emerald-400 flex items-center gap-2">
                    <span>📊</span> 姿勢 ＆ フィジカルチェック写真 比較
                  </h3>
                  
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 font-bold">Before</span>
                      <select
                        value={beforeDate}
                        onChange={e => setBeforeDate(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-bold focus:outline-none focus:border-emerald-500"
                      >
                        {physicalDates.map(date => (
                          <option key={`before-${date}`} value={date}>{date}</option>
                        ))}
                      </select>
                    </div>
                    <span className="text-slate-500 font-bold">vs</span>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 font-bold">After</span>
                      <select
                        value={afterDate}
                        onChange={e => setAfterDate(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-bold focus:outline-none focus:border-emerald-500"
                      >
                        {physicalDates.map(date => (
                          <option key={`after-${date}`} value={date}>{date}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 姿勢写真 比較ビュー (正面・側面・背面) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['front', 'side', 'back'] as const).map(key => {
                    const labelMap = { front: '正面 (Front)', side: '側面 (Side)', back: '背面 (Back)' };
                    const beforeImg = beforePhysical?.posturePhotos?.[key];
                    const afterImg = afterPhysical?.posturePhotos?.[key];

                    return (
                      <div key={key} className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-col gap-2">
                        <div className="text-xs font-bold text-slate-300 text-center">{labelMap[key]}</div>
                        <div className="grid grid-cols-2 gap-2">
                          {/* Before側 */}
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] text-indigo-400 font-bold">Before ({beforeDate})</span>
                            <div className="w-full h-32 bg-slate-950 border border-slate-800 rounded flex items-center justify-center overflow-hidden relative group">
                              {beforeImg ? (
                                <img
                                  src={beforeImg}
                                  alt="Before"
                                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition"
                                  onClick={() => setPreviewImage(beforeImg)}
                                />
                              ) : (
                                <span className="text-[10px] text-slate-600">未登録</span>
                              )}
                              <label className="absolute bottom-1 right-1 bg-slate-800/80 hover:bg-emerald-600 text-[10px] text-white px-1.5 py-0.5 rounded cursor-pointer transition">
                                ＋
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={e => handleFileUpload(e, beforeDate, 'posture', key)}
                                />
                              </label>
                            </div>
                          </div>

                          {/* After側 */}
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] text-emerald-400 font-bold">After ({afterDate})</span>
                            <div className="w-full h-32 bg-slate-950 border border-slate-800 rounded flex items-center justify-center overflow-hidden relative group">
                              {afterImg ? (
                                <img
                                  src={afterImg}
                                  alt="After"
                                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition"
                                  onClick={() => setPreviewImage(afterImg)}
                                />
                              ) : (
                                <span className="text-[10px] text-slate-600">未登録</span>
                              )}
                              <label className="absolute bottom-1 right-1 bg-slate-800/80 hover:bg-emerald-600 text-[10px] text-white px-1.5 py-0.5 rounded cursor-pointer transition">
                                ＋
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={e => handleFileUpload(e, afterDate, 'posture', key)}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ケガゼロ・フィジカルチェック測定シート写真 比較ビュー */}
                <div className="mt-2 border-t border-slate-800 pt-3">
                  <div className="text-xs font-bold text-emerald-400 mb-2">
                    <span>📋 ケガゼロ・フィジカルチェック測定シート写真比較</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Before側テスト写真 */}
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-indigo-400">Before ({beforeDate}) のテスト写真</span>
                        <label className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded cursor-pointer transition">
                          + 写真追加
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => handleFileUpload(e, beforeDate, 'test')}
                          />
                        </label>
                      </div>
                      <div className="flex flex-wrap gap-2 min-h-[80px] items-center">
                        {beforePhysical?.testPhotos && beforePhysical.testPhotos.length > 0 ? (
                          beforePhysical.testPhotos.map((tPhoto, idx) => (
                            <div key={`b-test-${idx}`} className="relative w-20 h-20 bg-slate-950 border border-slate-800 rounded overflow-hidden group">
                              <img
                                src={tPhoto}
                                alt={`Before Test ${idx + 1}`}
                                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition"
                                onClick={() => setPreviewImage(tPhoto)}
                              />
                              <button
                                onClick={() => handleDeleteTestPhoto(beforeDate, idx)}
                                className="absolute top-0.5 right-0.5 bg-rose-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                title="削除"
                              >
                                ×
                              </button>
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500 italic w-full text-center py-2">テストシート写真なし</span>
                        )}
                      </div>
                    </div>

                    {/* After側テスト写真 */}
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-emerald-400">After ({afterDate}) のテスト写真</span>
                        <label className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded cursor-pointer transition">
                          + 写真追加
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => handleFileUpload(e, afterDate, 'test')}
                          />
                        </label>
                      </div>
                      <div className="flex flex-wrap gap-2 min-h-[80px] items-center">
                        {afterPhysical?.testPhotos && afterPhysical.testPhotos.length > 0 ? (
                          afterPhysical.testPhotos.map((tPhoto, idx) => (
                            <div key={`a-test-${idx}`} className="relative w-20 h-20 bg-slate-950 border border-slate-800 rounded overflow-hidden group">
                              <img
                                src={tPhoto}
                                alt={`After Test ${idx + 1}`}
                                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition"
                                onClick={() => setPreviewImage(tPhoto)}
                              />
                              <button
                                onClick={() => handleDeleteTestPhoto(afterDate, idx)}
                                className="absolute top-0.5 right-0.5 bg-rose-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                title="削除"
                              >
                                ×
                              </button>
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500 italic w-full text-center py-2">テストシート写真なし</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* チケット履歴タブ内容 */}
          {activeTab === 'tickets' && (
            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-base text-emerald-400">🎟️ チケット・決済履歴 ({currentParent.name}様)</h3>
              <div className="space-y-3">
                {currentParent.ticketsHistory.map(th => (
                  <div key={th.id} className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white text-sm">{th.title}</div>
                      <div className="text-xs text-slate-400 mt-1">購入日: {th.date} ／ 有効期限: {th.expire}</div>
                      <div className="text-[10px] text-indigo-400 mt-0.5">Square ID: {th.squarePaymentId}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-bold text-lg">{th.count}回</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 写真拡大モーダルプレビュー */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img src={previewImage} alt="Preview" className="max-w-full max-h-[85vh] object-contain rounded-lg border border-slate-700" />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 bg-slate-800 text-white px-3 py-1 rounded text-sm hover:bg-slate-700"
            >
              閉じる ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
