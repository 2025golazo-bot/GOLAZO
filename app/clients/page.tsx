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
  kegazeroPhotos?: string[]; // ケガゼロ測定シート写真
  physicalCheckPhotos?: string[]; // フィジカルチェック測定シート写真
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
          kegazeroPhotos: [],
          physicalCheckPhotos: []
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
        return {
          ...s,
          sessions: s.sessions.filter(ses => ses.id !== sessionId)
        };
      })
    );
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm('本当にこの受講生データを削除しますか？')) {
      setStudents(prev => prev.filter(s => s.id !== id));
      if (selectedStudentId === id) {
        const remaining = filteredStudents.filter(s => s.id !== id);
        if (remaining.length > 0) {
          setSelectedStudentId(remaining[0].id);
          handleSelectStudent(remaining[0].id);
        } else {
          const allStudents = students.filter(s => s.id !== id);
          if (allStudents.length > 0) {
            setSelectedStudentId(allStudents[0].id);
            handleSelectStudent(allStudents[0].id);
          }
        }
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
    type: 'posture' | 'kegazero' | 'physicalCheck',
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
          } else if (type === 'kegazero') {
            return {
              ...m,
              kegazeroPhotos: [...(m.kegazeroPhotos || []), url]
            };
          } else if (type === 'physicalCheck') {
            return {
              ...m,
              physicalCheckPhotos: [...(m.physicalCheckPhotos || []), url]
            };
          }
          return m;
        });
        return { ...s, physicalHistory: updatedHistory };
      })
    );
    e.target.value = '';
  };

  const handleDeletePhotoItem = (targetDate: string, type: 'kegazero' | 'physicalCheck', photoIndex: number) => {
    const label = type === 'kegazero' ? 'ケガゼロ測定シート写真' : 'フィジカルチェック写真';
    if (!confirm(`この${label}を削除しますか？`)) return;
    setStudents(prev =>
      prev.map(s => {
        if (s.id !== currentStudent.id) return s;
        const updatedHistory = s.physicalHistory.map(m => {
          if (m.date !== targetDate) return m;
          if (type === 'kegazero') {
            const newPhotos = (m.kegazeroPhotos || []).filter((_, idx) => idx !== photoIndex);
            return { ...m, kegazeroPhotos: newPhotos };
          } else {
            const newPhotos = (m.physicalCheckPhotos || []).filter((_, idx) => idx !== photoIndex);
            return { ...m, physicalCheckPhotos: newPhotos };
          }
        });
        return { ...s, physicalHistory: updatedHistory };
      })
    );
  };

  const handleSaveEditStudent = () => {
    setStudents(prev =>
      prev.map(s => {
        if (s.id !== currentStudent.id) return s;
        return {
          ...s,
          name: editForm.name,
          kana: editForm.kana,
          concern: editForm.concern,
          target: editForm.target,
          memo: editForm.memo
        };
      })
    );
    setParents(prev =>
      prev.map(p => {
        if (p.id !== currentParent.id) return p;
        return { ...p, phone: editForm.phone };
      })
    );
    setEditingStudent(null);
    alert('生徒情報を更新しました！');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
        {/* 左側：生徒リスト・検索 */}
        <div className="w-full md:w-80 bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-4 shadow-sm">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <span>👥</span> 受講生一覧
            </h2>
            <button
              onClick={handleSquareSync}
              disabled={isSyncing}
              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 disabled:opacity-50 font-medium"
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
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
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
                      ? 'bg-indigo-50/80 border-indigo-500 shadow-sm'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
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
            {filteredStudents.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-xs">該当する受講生がいません</div>
            )}
          </div>
        </div>

        {/* 右側：メインコンテンツ (カルテ・チケット・編集) */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-6 shadow-sm">
          {/* 生徒ヘッダー情報 */}
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

              {/* 兄弟・家族リンク */}
              {siblingStudents.length > 1 && (
                <div className="flex items-center gap-2 mt-2 text-xs">
                  <span className="text-slate-400">ご家族:</span>
                  {siblingStudents.map(sib => (
                    <button
                      key={sib.id}
                      onClick={() => handleSelectStudent(sib.id)}
                      className={`px-2 py-0.5 rounded border transition ${
                        sib.id === currentStudent.id
                          ? 'bg-indigo-600 border-indigo-600 text-white font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {sib.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* タブ切り替え ＆ 編集ボタン */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  onClick={() => setActiveTab('carte')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                    activeTab === 'carte' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  カルテ・比較
                </button>
                <button
                  onClick={() => setActiveTab('tickets')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                    activeTab === 'tickets' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  チケット履歴
                </button>
                <button
                  onClick={() => {
                    setEditingStudent(currentStudent);
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
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                    activeTab === 'edit_info' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  基本情報編集
                </button>
              </div>

              <button
                onClick={() => handleDeleteStudent(currentStudent.id)}
                className="text-xs text-rose-600 hover:text-rose-700 bg-rose-50 border border-rose-200 p-2 rounded-lg transition"
                title="受講生を削除"
              >
                🗑️
              </button>
            </div>
          </div>

          {/* タブ 1: カルテ・比較・セッション記録 */}
          {activeTab === 'carte' && (
            <div className="flex flex-col gap-6">
              {/* アラート表示 */}
              {currentStudent.alert && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-xs font-medium flex items-center gap-2">
                  <span>{currentStudent.alert}</span>
                </div>
              )}

              {/* 目標・お悩みカード */}
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

              {/* ---------------------------------------------------- */}
              {/* 【上部配置】セッション・レッスン記録 ＆ 履歴 */}
              {/* ---------------------------------------------------- */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-4">
                <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <span>📝</span> 新規セッション・レッスン記録の追加
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">実施日</label>
                    <input
                      type="date"
                      value={newSessionDate}
                      onChange={e => setNewSessionDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">担当トレーナー</label>
                    <select
                      value={newSessionStaff}
                      onChange={e => setNewSessionStaff(e.target.value as 'TAKA' | 'NANA')}
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
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
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
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
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
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

                {/* 過去のセッション記録一覧 */}
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
                            <button
                              onClick={() => setEditingSession(ses)}
                              className="text-slate-400 hover:text-slate-700 text-xs transition"
                            >
                              ✏️ 編集
                            </button>
                            <button
                              onClick={() => handleDeleteSession(ses.id)}
                              className="text-rose-500 hover:text-rose-600 text-xs transition"
                            >
                              🗑️ 削除
                            </button>
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
                    {currentStudent.sessions.length === 0 && (
                      <div className="text-center py-4 text-slate-400 text-xs">セッション記録はまだありません</div>
                    )}
                  </div>
                </div>
              </div>

              {/* ---------------------------------------------------- */}
              {/* 【下部配置】写真や測定結果・比較セクション */}
              {/* ---------------------------------------------------- */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-4 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-200 pb-3">
                  <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <span>📊</span> 姿勢 ＆ 測定シート写真 比較
                  </h3>
                  
                  {/* 比較する日付の選択ボックス */}
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500 font-bold">Before</span>
                      <select
                        value={beforeDate}
                        onChange={e => setBeforeDate(e.target.value)}
                        className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800 font-bold focus:outline-none focus:border-indigo-500 text-xs"
                      >
                        {physicalDates.map(date => (
                          <option key={`before-${date}`} value={date}>{date}</option>
                        ))}
                      </select>
                    </div>

                    <span className="text-slate-400 font-bold">vs</span>

                    <div className="flex items-center gap-1">
                      <span className="text-slate-500 font-bold">After</span>
                      <select
                        value={afterDate}
                        onChange={e => setAfterDate(e.target.value)}
                        className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800 font-bold focus:outline-none focus:border-indigo-500 text-xs"
                      >
                        {physicalDates.map(date => (
                          <option key={`after-${date}`} value={date}>{date}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 1. 姿勢写真 比較ビュー (正面・側面・背面) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(['front', 'side', 'back'] as const).map(key => {
                    const labelMap = { front: '正面 (Front)', side: '側面 (Side)', back: '背面 (Back)' };
                    const beforeImg = beforePhysical?.posturePhotos?.[key];
                    const afterImg = afterPhysical?.posturePhotos?.[key];

                    return (
                      <div key={key} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex flex-col gap-2">
                        <div className="text-[11px] font-bold text-slate-700 text-center">{labelMap[key]}</div>
                        <div className="grid grid-cols-2 gap-2">
                          {/* Before側の姿勢写真 */}
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] text-indigo-600 font-bold">Before ({beforeDate})</span>
                            <div className="w-full h-28 bg-white border border-slate-300 rounded flex items-center justify-center overflow-hidden relative group">
                              {beforeImg ? (
                                <img
                                  src={beforeImg}
                                  alt="Before"
                                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition"
                                  onClick={() => setPreviewImage(beforeImg)}
                                />
                              ) : (
                                <span className="text-[10px] text-slate-400">未登録</span>
                              )}
                              <label className="absolute bottom-1 right-1 bg-slate-800/80 hover:bg-indigo-600 text-[10px] text-white px-1.5 py-0.5 rounded cursor-pointer transition">
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

                          {/* After側の姿勢写真 */}
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] text-emerald-600 font-bold">After ({afterDate})</span>
                            <div className="w-full h-28 bg-white border border-slate-300 rounded flex items-center justify-center overflow-hidden relative group">
                              {afterImg ? (
                                <img
                                  src={afterImg}
                                  alt="After"
                                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition"
                                  onClick={() => setPreviewImage(afterImg)}
                                />
                              ) : (
                                <span className="text-[10px] text-slate-400">未登録</span>
                              )}
                              <label className="absolute bottom-1 right-1 bg-slate-800/80 hover:bg-indigo-600 text-[10px] text-white px-1.5 py-0.5 rounded cursor-pointer transition">
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

                {/* 2. ケガゼロ測定シート写真 比較ビュー */}
                <div className="mt-2 border-t border-slate-200 pt-3">
                  <div className="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
                    <span>🛡️ ケガゼロ測定シート写真比較</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Before側 */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-indigo-600">Before ({beforeDate})</span>
                        <label className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded cursor-pointer transition">
                          + 写真追加
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => handleFileUpload(e, beforeDate, 'kegazero')}
                          />
                        </label>
                      </div>
                      <div className="flex flex-wrap gap-2 min-h-[70px] items-center">
                        {beforePhysical?.kegazeroPhotos && beforePhysical.kegazeroPhotos.length > 0 ? (
                          beforePhysical.kegazeroPhotos.map((photo, idx) => (
                            <div key={`b-kegazero-${idx}`} className="relative w-16 h-16 bg-white border border-slate-300 rounded overflow-hidden group">
                              <img
                                src={photo}
                                alt={`Before Kegazero ${idx + 1}`}
                                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition"
                                onClick={() => setPreviewImage(photo)}
                              />
                              <button
                                onClick={() => handleDeletePhotoItem(beforeDate, 'kegazero', idx)}
                                className="absolute top-0.5 right-0.5 bg-rose-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                title="削除"
                              >
                                ×
                              </button>
                            </div>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400 italic w-full text-center py-2">写真なし</span>
                        )}
                      </div>
                    </div>

                    {/* After側 */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-emerald-600">After ({afterDate})</span>
                        <label className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded cursor-pointer transition">
                          + 写真追加
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => handleFileUpload(e, afterDate, 'kegazero')}
                          />
                        </label>
                      </div>
                      <div className="flex flex-wrap gap-2 min-h-[70px] items-center">
                        {afterPhysical?.kegazeroPhotos && afterPhysical.kegazeroPhotos.length > 0 ? (
                          afterPhysical.kegazeroPhotos.map((photo, idx) => (
                            <div key={`a-kegazero-${idx}`} className="relative w-16 h-16 bg-white border border-slate-300 rounded overflow-hidden group">
                              <img
                                src={photo}
                                alt={`After Kegazero ${idx + 1}`}
                                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition"
                                onClick={() => setPreviewImage(photo)}
                              />
                              <button
                                onClick={() => handleDeletePhotoItem(afterDate, 'kegazero', idx)}
                                className="absolute top-0.5 right-0.5 bg-rose-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                title="削除"
                              >
                                ×
                              </button>
                            </div>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400 italic w-full text-center py-2">写真なし</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. フィジカルチェック測定シート写真 比較ビュー */}
                <div className="mt-2 border-t border-slate-200 pt-3">
                  <div className="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
                    <span>📋 フィジカルチェック測定シート写真比較</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Before側 */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-indigo-600">Before ({beforeDate})</span>
                        <label className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded cursor-pointer transition">
                          + 写真追加
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => handleFileUpload(e, beforeDate, 'physicalCheck')}
                          />
                        </label>
                      </div>
                      <div className="flex flex-wrap gap-2 min-h-[70px] items-center">
                        {beforePhysical?.physicalCheckPhotos && beforePhysical.physicalCheckPhotos.length > 0 ? (
                          beforePhysical.physicalCheckPhotos.map((photo, idx) => (
                            <div key={`b-pcheck-${idx}`} className="relative w-16 h-16 bg-white border border-slate-300 rounded overflow-hidden group">
                              <img
                                src={photo}
                                alt={`Before PhysicalCheck ${idx + 1}`}
                                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition"
                                onClick={() => setPreviewImage(photo)}
                              />
                              <button
                                onClick={() => handleDeletePhotoItem(beforeDate, 'physicalCheck', idx)}
                                className="absolute top-0.5 right-0.5 bg-rose-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                title="削除"
                              >
                                ×
                              </button>
                            </div>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400 italic w-full text-center py-2">写真なし</span>
                        )}
                      </div>
                    </div>

                    {/* After側 */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-emerald-600">After ({afterDate})</span>
                        <label className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded cursor-pointer transition">
                          + 写真追加
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => handleFileUpload(e, afterDate, 'physicalCheck')}
                          />
                        </label>
                      </div>
                      <div className="flex flex-wrap gap-2 min-h-[70px] items-center">
                        {afterPhysical?.physicalCheckPhotos && afterPhysical.physicalCheckPhotos.length > 0 ? (
                          afterPhysical.physicalCheckPhotos.map((photo, idx) => (
                            <div key={`a-pcheck-${idx}`} className="relative w-16 h-16 bg-white border border-slate-300 rounded overflow-hidden group">
                              <img
                                src={photo}
                                alt={`After PhysicalCheck ${idx + 1}`}
                                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition"
                                onClick={() => setPreviewImage(photo)}
                              />
                              <button
                                onClick={() => handleDeletePhotoItem(afterDate, 'physicalCheck', idx)}
                                className="absolute top-0.5 right-0.5 bg-rose-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                title="削除"
                              >
                                ×
                              </button>
                            </div>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400 italic w-full text-center py-2">写真なし</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 新規測定日追加フォーム */}
                <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col md:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-xs font-bold text-slate-700 whitespace-nowrap">📅 新規測定日を追加:</span>
                    <input
                      type="date"
                      value={newMeasureDate}
                      onChange={e => setNewMeasureDate(e.target.value)}
                      className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button
                    onClick={handleAddNewMeasureDate}
                    className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition shadow-sm"
                  >
                    ＋ この日付の計測データ・写真枠を追加
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* タブ 2: チケット履歴 */}
          {activeTab === 'tickets' && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm text-slate-900">🎟️ チケット・購入履歴</h3>
                <div className="text-xs text-slate-600">
                  現在保有残高: <strong className="text-indigo-600 text-sm font-bold">{currentParent.ticketRemaining}回</strong>
                </div>
              </div>

              <div className="space-y-2">
                {currentParent.ticketsHistory.map(th => (
                  <div key={th.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{th.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">購入日: {th.date} / 有効期限: {th.expire}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200 font-bold">
                        +{th.count}回付与
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">ID: {th.squarePaymentId}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* タブ 3: 基本情報編集 */}
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
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1">フリガナ</label>
                  <input
                    type="text"
                    value={editForm.kana}
                    onChange={e => setEditForm({ ...editForm, kana: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1">保護者連絡先 (電話番号)</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1">お悩み・課題</label>
                  <input
                    type="text"
                    value={editForm.concern}
                    onChange={e => setEditForm({ ...editForm, concern: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1">目標</label>
                  <input
                    type="text"
                    value={editForm.target}
                    onChange={e => setEditForm({ ...editForm, target: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1">メモ・既往歴等</label>
                  <textarea
                    rows={3}
                    value={editForm.memo}
                    onChange={e => setEditForm({ ...editForm, memo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setActiveTab('carte')}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-4 py-1.5 rounded-lg transition"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleSaveEditStudent}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition shadow-sm"
                  >
                    変更を保存する
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* セッション編集モーダル */}
      {editingSession && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-md w-full flex flex-col gap-4 shadow-xl">
            <h3 className="font-bold text-sm text-slate-900">✏️ セッション記録の編集</h3>
            <div>
              <label className="text-[11px] text-slate-600 block mb-1">実施日</label>
              <input
                type="date"
                value={editingSession.date}
                onChange={e => setEditingSession({ ...editingSession, date: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-600 block mb-1">担当</label>
              <select
                value={editingSession.staff}
                onChange={e => setEditingSession({ ...editingSession, staff: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="TAKA">TAKA</option>
                <option value="NANA">NANA</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-600 block mb-1">内容</label>
              <textarea
                rows={3}
                value={editingSession.content}
                onChange={e => setEditingSession({ ...editingSession, content: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-600 block mb-1">宿題</label>
              <input
                type="text"
                value={editingSession.homework}
                onChange={e => setEditingSession({ ...editingSession, homework: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingSession(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-4 py-1.5 rounded-lg transition"
              >
                キャンセル
              </button>
              <button
                onClick={handleUpdateSession}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition"
              >
                更新する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 写真拡大プレビューモーダル */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-lg border border-slate-300 shadow-2xl"
            />
            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2.5 py-1 rounded-full">
              ✕ 閉じる (クリック)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
