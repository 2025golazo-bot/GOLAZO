'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';

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
  posturePhotos?: { front?: string | null; side?: string | null; back?: string | null };
  kegazeroPhotos?: string[];
  physicalCheckPhotos?: string[];
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
  const [parents, setParents] = useState<Parent[]>([
    {
      id: 'p-101',
      name: '藤田 奈々',
      kana: 'フジタ ナナ',
      phone: '090-1111-2222',
      isTicketSystem: true,
      ticketRemaining: 1,
      ticketsHistory: [
        { id: 'th-1', date: '2026-06-01', title: '10回券 (家族共有)', count: 10, expire: '2026-12-01', squarePaymentId: 'sq_pay_998811' }
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
          kegazeroPhotos: [],
          physicalCheckPhotos: []
        },
        {
          id: 'm-2',
          date: '2026-09-01',
          weight: 38.7,
          fat: 15.2,
          muscle: 30.8,
          note: '2回目3ヶ月測定',
          posturePhotos: { front: null, side: null, back: null },
          kegazeroPhotos: [],
          physicalCheckPhotos: []
        }
      ],
      sessions: [
        { id: 'ses-101', date: '2026-10-05', staff: 'TAKA', content: 'フィジカルテスト＆スプリントフォームチェック', homework: '体幹キープ 1分×3セット', photo: null }
      ]
    },
    {
      id: 's-003',
      parentId: 'p-101',
      name: '藤田 凛',
      kana: 'フジタ リン',
      age: 8,
      birthdate: '2018-09-20',
      firstLessonDate: '2026-06-15',
      lastReservationDate: '2026-10-02',
      concern: '姿勢改善・リズム感向上',
      target: '楽しく身体を動かす・柔軟性UP',
      memo: '藤田陸の妹。家族共有チケット適用対象。',
      alert: null,
      physicalHistory: [
        {
          id: 'm-rin-1',
          date: '2026-06-15',
          weight: 25.0,
          fat: 17.5,
          muscle: 18.0,
          note: '初回計測',
          posturePhotos: { front: null, side: null, back: null },
          kegazeroPhotos: [],
          physicalCheckPhotos: []
        }
      ],
      sessions: [
        { id: 'ses-301', date: '2026-10-02', staff: 'NANA', content: 'リズム体操＆コアバランス', homework: '片足立ち 30秒', photo: null }
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
          kegazeroPhotos: [],
          physicalCheckPhotos: []
        }
      ],
      sessions: [
        { id: 'ses-201', date: '2026-10-01', staff: 'NANA', content: 'ピラティス＆ストレッチ', homework: '長座体前屈ストレッチ', photo: null }
      ]
    }
  ]);

  const [selectedStudentId, setSelectedStudentId] = useState<string>('s-001');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'carte' | 'tickets' | 'edit_info'>('carte');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];
  const currentParent = parents.find(p => p.id === currentStudent.parentId) || parents[0];
  // 💡 同じ保護者IDを持つご兄弟を抽出
  const siblingStudents = students.filter(s => s.parentId === currentParent.id);

  const physicalDates = currentStudent.physicalHistory.map(m => m.date);
  
  const [beforeDate, setBeforeDate] = useState<string>(physicalDates[0] || '2026-06-01');
  const [afterDate, setAfterDate] = useState<string>(physicalDates[physicalDates.length - 1] || '2026-09-01');
  const [newMeasureDate, setNewMeasureDate] = useState<string>(new Date().toISOString().split('T')[0]);

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
      const parent = parents.find(p => p.id === target.parentId);
      setEditForm({
        name: target.name,
        kana: target.kana,
        phone: parent?.phone || '',
        concern: target.concern,
        target: target.target,
        memo: target.memo
      });
      if (target.physicalHistory.length > 0) {
        setBeforeDate(target.physicalHistory[0].date);
        setAfterDate(target.physicalHistory[target.physicalHistory.length - 1].date);
      }
    }
  };

  const handleAddNewMeasureDate = () => {
    if (!newMeasureDate) return;
    if (currentStudent.physicalHistory.some(m => m.date === newMeasureDate)) {
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
      kegazeroPhotos: [],
      physicalCheckPhotos: []
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
    if (!newSessionContent) {
      alert('レッスン内容を入力してください。');
      return;
    }
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

    setParents(prev =>
      prev.map(p => (p.id === currentParent.id ? { ...p, ticketRemaining: Math.max(0, p.ticketRemaining - 1) } : p))
    );

    setNewSessionContent('');
    setNewSessionHomework('');
    alert('セッションを登録し、回数券を1回消化しました！');
  };

  const handleUpdateSession = () => {
    if (!editingSession) return;
    setStudents(prev =>
      prev.map(s => {
        if (s.id !== currentStudent.id) return s;
        return {
          ...s,
          sessions: s.sessions.map(ses => (ses.id === editingSession.id ? editingSession : ses))
        };
      })
    );
    setEditingSession(null);
    alert('セッション記録を更新しました！');
  };

  const handleDeleteSession = (sessionId: string) => {
    if (!confirm('このセッション記録を削除しますか？')) return;
    setStudents(prev =>
      prev.map(s => {
        if (s.id !== currentStudent.id) return s;
        return { ...s, sessions: s.sessions.filter(ses => ses.id !== sessionId) };
      })
    );
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm('本当にこの受講生データを削除しますか？')) {
      const remaining = students.filter(s => s.id !== id);
      setStudents(remaining);
      if (remaining.length > 0) setSelectedStudentId(remaining[0].id);
    }
  };

  const handleSquareSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      alert('Squareの最新決済・家族共有チケットデータの同期が完了しました！');
    }, 1200);
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    targetDate: string,
    type: 'posture',
    keyName?: 'front' | 'side' | 'back'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);

    setStudents(prev =>
      prev.map(s => {
        if (s.id !== currentStudent.id) return s;
        const updatedHistory = s.physicalHistory.map(m => {
          if (m.date !== targetDate) return m;
          if (type === 'posture' && keyName) {
            return {
              ...m,
              posturePhotos: { ...(m.posturePhotos || { front: null, side: null, back: null }), [keyName]: url }
            };
          }
          return m;
        });
        return { ...s, physicalHistory: updatedHistory };
      })
    );
    e.target.value = '';
  };

  const handleSaveEditStudent = () => {
    setStudents(prev =>
      prev.map(s => {
        if (s.id !== currentStudent.id) return s;
        return { ...s, name: editForm.name, kana: editForm.kana, concern: editForm.concern, target: editForm.target, memo: editForm.memo };
      })
    );
    setParents(prev =>
      prev.map(p => (p.id === currentParent.id ? { ...p, phone: editForm.phone } : p))
    );
    setActiveTab('carte');
    alert('生徒情報を正常に更新しました！');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
        {/* 左側：生徒リスト */}
        <div className="w-full md:w-80 bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-4 shadow-sm">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <span>👥</span> 受講生一覧
            </h2>
            <button
              onClick={handleSquareSync}
              disabled={isSyncing}
              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 font-medium"
            >
              {isSyncing ? '同期中...' : '🔄 Square同期'}
            </button>
          </div>

          <input
            type="text"
            placeholder="名前・保護者・お悩みで検索..."
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
          />

          <div className="flex-1 overflow-y-auto space-y-2 max-h-[calc(100vh-280px)]">
            {filteredStudents.map(student => {
              const p = parents.find(parent => parent.id === student.parentId);
              const isSelected = student.id === selectedStudentId;
              return (
                <div
                  key={student.id}
                  onClick={() => handleSelectStudent(student.id)}
                  className={`p-3 rounded-lg cursor-pointer transition border ${
                    isSelected ? 'bg-indigo-50/80 border-indigo-500 shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-sm text-slate-900">{student.name}</span>
                      <span className="text-xs text-slate-500 ml-2">({student.age}歳)</span>
                    </div>
                    {student.alert && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-300 font-medium">
                        要確認
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">保護者: {p?.name || '未設定'}</div>
                  <div className="text-xs text-indigo-600 mt-1 truncate font-medium">🎯 {student.concern}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 右側：メインコンテンツ */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-6 shadow-sm">
          {/* 生徒ヘッダー */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900">{currentStudent.name}</h1>
                <span className="text-xs text-slate-500">({currentStudent.kana})</span>
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-medium">
                  {currentStudent.age}歳 ({currentStudent.birthdate}生)
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-2">
                <span>👤 保護者: <strong className="text-slate-900">{currentParent.name}</strong> ({currentParent.phone})</span>
                <span>🎟️ チケット残: <strong className="text-indigo-600 font-bold">{currentParent.ticketRemaining}回</strong></span>
                <span>📅 初回レッスン: {currentStudent.firstLessonDate}</span>
              </div>

              {/* 💡 兄弟・家族共有グループ切り替えボタンを復活 */}
              {siblingStudents.length > 1 && (
                <div className="flex items-center gap-2 mt-2.5 text-xs bg-indigo-50/60 p-2 rounded-lg border border-indigo-100">
                  <span className="text-slate-500 font-bold">family 家族共有グループ:</span>
                  {siblingStudents.map(sib => (
                    <button
                      key={sib.id}
                      onClick={() => handleSelectStudent(sib.id)}
                      className={`px-2.5 py-1 rounded-md border transition text-xs font-bold ${
                        sib.id === currentStudent.id
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-indigo-100/50'
                      }`}
                    >
                      {sib.name} ({sib.age}歳)
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  onClick={() => setActiveTab('carte')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${activeTab === 'carte' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600'}`}
                >
                  カルテ・比較
                </button>
                <button
                  onClick={() => setActiveTab('tickets')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${activeTab === 'tickets' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600'}`}
                >
                  チケット履歴
                </button>
                <button
                  onClick={() => {
                    setEditForm({
                      name: currentStudent.name,
                      kana: currentStudent.kana,
                      phone: currentParent.phone,
                      concern: currentStudent.concern,
                      target: currentStudent.target,
                      memo: currentStudent.memo
                    });
                    setActiveTab('edit_info');
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${activeTab === 'edit_info' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600'}`}
                >
                  基本情報編集
                </button>
              </div>

              <button
                onClick={() => handleDeleteStudent(currentStudent.id)}
                className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-lg transition"
                title="受講生を削除"
              >
                🗑️
              </button>
            </div>
          </div>

          {/* カルテタブ */}
          {activeTab === 'carte' && (
            <div className="flex flex-col gap-6">
              {currentStudent.alert && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-xs font-medium">
                  {currentStudent.alert}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[11px] text-slate-500 block font-bold mb-1">🎯 お悩み・課題</span>
                  <p className="text-xs text-slate-800 font-medium">{currentStudent.concern}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block font-bold mb-1">⭐ 目標</span>
                  <p className="text-xs text-slate-800 font-medium">{currentStudent.target}</p>
                </div>
              </div>

              {/* 新規セッション追加フォーム */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-4">
                <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <span>📝</span> 新規セッション・レッスン記録の追加 (チケット1回消化)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">実施日</label>
                    <input
                      type="date"
                      value={newSessionDate}
                      onChange={e => setNewSessionDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">担当トレーナー</label>
                    <select
                      value={newSessionStaff}
                      onChange={e => setNewSessionStaff(e.target.value as 'TAKA' | 'NANA')}
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800"
                    >
                      <option value="TAKA">TAKA</option>
                      <option value="NANA">NANA</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">宿題・自主トレ</label>
                    <input
                      type="text"
                      placeholder="例: 体幹キープ 1分×3セット"
                      value={newSessionHomework}
                      onChange={e => setNewSessionHomework(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">レッスン内容・フィジカルメモ</label>
                  <textarea
                    rows={2}
                    placeholder="本日の指導内容や気づきを記入..."
                    value={newSessionContent}
                    onChange={e => setNewSessionContent(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleAddSession}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition shadow-sm"
                  >
                    セッション記録を登録する
                  </button>
                </div>

                {/* 過去のセッション履歴 */}
                <div className="mt-2 border-t border-slate-200 pt-3">
                  <h4 className="font-bold text-xs text-slate-700 mb-2">📜 過去のセッション履歴</h4>
                  <div className="space-y-2">
                    {currentStudent.sessions.map(ses => (
                      <div key={ses.id} className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-indigo-600">{ses.date}</span>
                            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">担当: {ses.staff}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setEditingSession(ses)} className="text-slate-400 hover:text-slate-700 text-xs">✏️ 編集</button>
                            <button onClick={() => handleDeleteSession(ses.id)} className="text-rose-500 hover:text-rose-600 text-xs">🗑️ 削除</button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-800 whitespace-pre-wrap">{ses.content}</p>
                        {ses.homework && (
                          <div className="text-[11px] bg-slate-50 border border-slate-200 p-1.5 rounded text-indigo-700 font-medium">
                            📌 宿題・自主トレ: {ses.homework}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* チケット履歴タブ */}
          {activeTab === 'tickets' && (
            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-sm text-slate-900">🎟️ 回数券・購入履歴</h3>
              <div className="space-y-2">
                {currentParent.ticketsHistory.map(th => (
                  <div key={th.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{th.title}</div>
                      <div className="text-[11px] text-slate-500">購入日: {th.date} / 有効期限: {th.expire}</div>
                    </div>
                    <span className="text-[11px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200 font-bold">
                      +{th.count}回付与
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 基本情報編集タブ */}
          {activeTab === 'edit_info' && (
            <div className="flex flex-col gap-4 max-w-lg">
              <h3 className="font-bold text-sm text-slate-900">✏️ 生徒・保護者基本情報の編集</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1">受講生のお名前</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1">保護者連絡先 (電話番号)</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1">お悩み・課題</label>
                  <input
                    type="text"
                    value={editForm.concern}
                    onChange={e => setEditForm({ ...editForm, concern: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1">目標</label>
                  <input
                    type="text"
                    value={editForm.target}
                    onChange={e => setEditForm({ ...editForm, target: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setActiveTab('carte')} className="bg-slate-200 text-slate-700 text-xs font-bold px-4 py-1.5 rounded-lg">キャンセル</button>
                  <button onClick={handleSaveEditStudent} className="bg-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-lg shadow-sm">変更を保存する</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
