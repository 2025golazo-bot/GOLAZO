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
  ticketRemaining: number;
  ticketsHistory: TicketHistory[];
}

interface Student {
  id: string;
  parentId: string; // 1:N 構造（保護者ID）
  name: string;
  kana: string;
  age: number;
  birthdate: string;
  firstLessonDate: string;
  lastReservationDate: string; // 最終予約日（アラート判定用）
  concern: string;
  target: string;
  memo: string;
  // 要望対応：独立した3つのメモ欄
  customMemo1: string;
  customMemo2: string;
  customMemo3: string;
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
      ticketRemaining: 5,
      ticketsHistory: [
        { id: 'th-2', date: '2026-08-01', title: '5回券', count: 5, expire: '2027-02-01', squarePaymentId: 'sq_pay_772200' }
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
      lastReservationDate: '2026-08-20',
      concern: 'サッカーでの体幹ブレ・走力向上',
      target: 'トレセン選出・ブレない軸作り',
      memo: '右足首捻挫の既往歴あり。兄。',
      customMemo1: '【特記事項】アップ時に股関節周りの可動域チェックを念入りに行う。',
      customMemo2: '【食事面】練習後のプロテイン摂取と炭水化物の補給を意識させる。',
      customMemo3: '【自主練】週末のランニングフォーム動画をLINEで提出予定。',
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
        { id: 'ses-101', date: '2026-10-05', staff: 'TAKA', content: 'フィジカルテスト＆スプリントフォームチェック', homework: '体幹キープ 1分×3セット', photo: null }
      ]
    },
    {
      id: 's-002',
      parentId: 'p-101',
      name: '藤田 翔',
      kana: 'フジタ ショウ',
      age: 8,
      birthdate: '2018-09-20',
      firstLessonDate: '2026-04-10',
      lastReservationDate: '2026-09-01',
      concern: '運動神経向上・ボール感覚',
      target: 'アジリティUP',
      memo: '弟。リズムトレーニングを好む。',
      customMemo1: '【特記事項】集中力が切れやすいので、前半に楽しいリズム系を挟む。',
      customMemo2: '【食事面】好き嫌いが多く野菜を少しずつ克服中。',
      customMemo3: '【自主練】おうちでコーディネーショントレーニング5分。',
      physicalHistory: [
        {
          id: 'm-3',
          date: '2026-07-01',
          weight: 25.0,
          fat: 14.5,
          muscle: 18.0,
          note: '初回計測',
          posturePhotos: { front: null, side: null, back: null },
          testPhotos: []
        }
      ],
      sessions: [
        { id: 'ses-201', date: '2026-10-02', staff: 'NANA', content: 'ピラティス＆ストレッチ', homework: '長座体前屈', photo: null }
      ]
    }
  ]);

  // UI状態 (carte / tickets / edit_info の3つに整理)
  const [selectedStudentId, setSelectedStudentId] = useState<string>('s-001');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'carte' | 'tickets' | 'edit_info'>('carte');

  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];
  const currentParent = parents.find(p => p.id === currentStudent.parentId) || parents[0];
  const siblingStudents = students.filter(s => s.parentId === currentParent.id);

  // 新規セッション用ステート
  const [newSessionDate, setNewSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newSessionStaff, setNewSessionStaff] = useState<'TAKA' | 'NANA'>('TAKA');
  const [newSessionContent, setNewSessionContent] = useState<string>('');
  const [newSessionHomework, setNewSessionHomework] = useState<string>('');
  const [useTicket, setUseTicket] = useState<boolean>(true);

  // セッションフィルター用
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');

  // 編集用ステート
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editSessionContent, setEditSessionContent] = useState<string>('');
  const [editSessionHomework, setEditSessionHomework] = useState<string>('');

  // 3つのメモ欄編集用ステート
  const [editCustomMemo1, setEditCustomMemo1] = useState(currentStudent.customMemo1);
  const [editCustomMemo2, setEditCustomMemo2] = useState(currentStudent.customMemo2);
  const [editCustomMemo3, setEditCustomMemo3] = useState(currentStudent.customMemo3);

  const [editForm, setEditForm] = useState({
    name: currentStudent.name,
    kana: currentStudent.kana,
    phone: currentParent.phone,
    concern: currentStudent.concern,
    target: currentStudent.target,
    memo: currentStudent.memo
  });

  // 自動アラート判定
  const getAlertBadges = (student: Student, parent: Parent) => {
    const alerts: { text: string; type: 'warning' | 'danger' }[] = [];
    const today = new Date();

    if (student.lastReservationDate) {
      const lastRes = new Date(student.lastReservationDate);
      const diffDays = Math.floor((today.getTime() - lastRes.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 30) {
        alerts.push({ text: `🚨 1ヶ月未予約 (${diffDays}日前)`, type: 'danger' });
      } else if (diffDays >= 14) {
        alerts.push({ text: `⚠️ 最終予約から2週間未予約 (${diffDays}日前)`, type: 'warning' });
      }
    }

    if (student.firstLessonDate) {
      const firstDate = new Date(student.firstLessonDate);
      const diffMonths = (today.getFullYear() - firstDate.getFullYear()) * 12 + (today.getMonth() - firstDate.getMonth());
      if (diffMonths >= 0 && diffMonths % 3 === 0) {
        alerts.push({ text: `⚠️ 3ヶ月測定の時期です`, type: 'warning' });
      }
    }

    if (parent.ticketRemaining <= 1) {
      alerts.push({ text: `🎫 回数券残り ${parent.ticketRemaining} 回`, type: 'danger' });
    }

    return alerts;
  };

  const currentAlerts = getAlertBadges(currentStudent, currentParent);

  // ハンドラー類
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
      setEditCustomMemo1(target.customMemo1);
      setEditCustomMemo2(target.customMemo2);
      setEditCustomMemo3(target.customMemo3);
    }
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
      prev.map(s => (s.id === currentStudent.id ? { ...s, sessions: [newSession, ...s.sessions], lastReservationDate: newSessionDate } : s))
    );

    if (useTicket) {
      setParents(prev =>
        prev.map(p => (p.id === currentParent.id ? { ...p, ticketRemaining: Math.max(0, p.ticketRemaining - 1) } : p))
      );
    }

    setNewSessionContent('');
    setNewSessionHomework('');
    alert('セッションを登録しました！');
  };

  const handleSaveEditSession = (sessionId: string) => {
    setStudents(prev =>
      prev.map(s => {
        if (s.id !== currentStudent.id) return s;
        return {
          ...s,
          sessions: s.sessions.map(ses => (ses.id === sessionId ? { ...ses, content: editSessionContent, homework: editSessionHomework } : ses))
        };
      })
    );
    setEditingSessionId(null);
    alert('セッション記録を更新しました');
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

  const availableYears = Array.from(new Set(currentStudent.sessions.map(s => s.date.substring(0, 4)))).sort().reverse();
  const availableMonths = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

  const filteredSessions = currentStudent.sessions.filter(s => {
    const [y, m] = s.date.split('-');
    const matchYear = selectedYear === 'ALL' || y === selectedYear;
    const matchMonth = selectedMonth === 'ALL' || m === selectedMonth;
    return matchYear && matchMonth;
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

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 font-sans pb-12">
      <Header />

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          {/* 左カラム：受講生選択のみ */}
          <div className="md:col-span-1 space-y-6">
            <div className="space-y-4">
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

              <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider px-1">受講生一覧 ({filteredStudents.length}名)</h3>

              <div className="space-y-2.5">
                {filteredStudents.map(student => {
                  const parent = parents.find(p => p.id === student.parentId);
                  const isSelected = selectedStudentId === student.id;
                  const badges = getAlertBadges(student, parent || parents[0]);

                  return (
                    <div
                      key={student.id}
                      onClick={() => handleSelectStudent(student.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all shadow-sm ${
                        isSelected ? 'bg-sky-50/80 border-[#5e9bc4] ring-2 ring-[#5e9bc4]/20' : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`font-bold ${isSelected ? 'text-[#5e9bc4]' : 'text-slate-800'}`}>{student.name}</span>
                        <span className="text-xs font-semibold text-[#5e9bc4] bg-sky-100/60 px-2 py-0.5 rounded-full">{student.age}歳</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">保護者: {parent?.name}</p>
                      
                      {badges.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {badges.map((b, i) => (
                            <span key={i} className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${b.type === 'danger' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                              {b.text}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 右カラム：メインコンテンツ */}
          <div className="md:col-span-3 space-y-5">
            {/* 顧客基本情報ヘッダー */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="text-xs text-slate-400 font-semibold">{currentStudent.kana}</span>
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 mt-0.5">
                    {currentStudent.name}
                    <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">{currentStudent.age}歳</span>
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-semibold">
                      保護者: {currentParent.name} 様 ({currentParent.phone})
                    </span>
                    <span className="bg-sky-50 text-[#5e9bc4] border border-sky-200 font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <span>🎟️</span> 回数券 残数: <strong className="text-sm">{currentParent.ticketRemaining}</strong> 回
                    </span>
                  </div>
                </div>

                {currentAlerts.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    {currentAlerts.map((alt, idx) => (
                      <div key={idx} className={`text-xs font-bold px-3 py-1 rounded-lg border flex items-center gap-1.5 ${alt.type === 'danger' ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                        <span>{alt.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 兄弟リンク */}
              {siblingStudents.length > 1 && (
                <div className="bg-amber-50/80 border border-amber-200 p-3 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-amber-900 font-bold">👨‍👩‍👧‍👦 ご兄弟アカウント</span>
                  <div className="flex gap-1.5">
                    {siblingStudents.map(sib => (
                      <button
                        key={sib.id}
                        onClick={() => handleSelectStudent(sib.id)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-bold transition ${sib.id === currentStudent.id ? 'bg-amber-600 text-white shadow-sm' : 'bg-white text-amber-900 border border-amber-300 hover:bg-amber-100'}`}
                      >
                        {sib.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* タブ切り替え（3つのタブに整理） */}
              <div className="flex flex-wrap border-b border-slate-200 pt-2 gap-8 text-xs font-bold">
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
              <div className="space-y-6">
                {/* 新規セッション記録の追加 */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b pb-3">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5"><span>✍️</span> 新規セッション記録の追加</h3>
                    <label className="flex items-center gap-1 font-semibold text-slate-600 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={useTicket}
                        onChange={e => setUseTicket(e.target.checked)}
                        className="rounded text-[#5e9bc4]"
                      />
                      回数券を1回消化する
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-500 mb-1 font-semibold">日時</label>
                      <input type="date" value={newSessionDate} onChange={e => setNewSessionDate(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 outline-none" />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1 font-semibold">担当トレーナー</label>
                      <select value={newSessionStaff} onChange={e => setNewSessionStaff(e.target.value as 'TAKA' | 'NANA')} className="w-full border border-slate-300 rounded-lg p-2 font-bold text-[#5e9bc4] outline-none">
                        <option value="TAKA">TAKA (藤田 渉仁)</option>
                        <option value="NANA">NANA (藤田 奈々)</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-slate-500 mb-1 font-semibold">セッション内容</label>
                      <input type="text" placeholder="例: 体幹バランストレーニング" value={newSessionContent} onChange={e => setNewSessionContent(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 outline-none" />
                    </div>
                  </div>
                  <div className="text-xs">
                    <label className="block text-slate-500 mb-1 font-semibold">宿題・自主トレ指示</label>
                    <input type="text" placeholder="例: 片足ドローイン 1分×2" value={newSessionHomework} onChange={e => setNewSessionHomework(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 outline-none" />
                  </div>
                  <button onClick={handleAddSession} className="w-full bg-[#5e9bc4] hover:bg-sky-600 text-white font-bold py-2.5 rounded-lg text-xs transition shadow-sm">
                    セッションを登録する {useTicket ? '(回数券1回消化)' : ''}
                  </button>
                </div>

                {/* 時系列セッション履歴 */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5"><span>📅</span> 時系列セッション履歴</h3>
                    <div className="flex items-center gap-2 text-xs bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                      <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="border rounded p-1 font-bold text-[#5e9bc4]">
                        <option value="ALL">全年度</option>
                        {availableYears.map(y => <option key={y} value={y}>{y}年</option>)}
                      </select>
                      <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="border rounded p-1 font-bold text-[#5e9bc4]">
                        <option value="ALL">全月</option>
                        {availableMonths.map(m => <option key={m} value={m}>{parseInt(m, 10)}月</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {filteredSessions.length > 0 ? (
                      filteredSessions.map(session => (
                        <div key={session.id} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
                          <div className="flex justify-between items-center font-bold text-slate-700">
                            <span>{session.date} <span className="text-[#5e9bc4] ml-2 bg-sky-100 px-2 py-0.5 rounded">担当: {session.staff}</span></span>
                            <div className="flex gap-2">
                              <button onClick={() => { setEditingSessionId(session.id); setEditSessionContent(session.content); setEditSessionHomework(session.homework); }} className="text-xs text-sky-600 hover:underline">編集</button>
                              <button onClick={() => handleDeleteSession(session.id)} className="text-xs text-rose-500 hover:underline">削除</button>
                            </div>
                          </div>

                          {editingSessionId === session.id ? (
                            <div className="space-y-2 pt-2 border-t">
                              <input type="text" value={editSessionContent} onChange={e => setEditSessionContent(e.target.value)} className="w-full border rounded p-1 bg-white" placeholder="内容" />
                              <input type="text" value={editSessionHomework} onChange={e => setEditSessionHomework(e.target.value)} className="w-full border rounded p-1 bg-white" placeholder="宿題" />
                              <div className="flex gap-2 justify-end">
                                <button onClick={() => handleSaveEditSession(session.id)} className="bg-emerald-600 text-white px-3 py-1 rounded font-bold">保存</button>
                                <button onClick={() => setEditingSessionId(null)} className="bg-slate-300 px-3 py-1 rounded">キャンセル</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="text-slate-800 font-medium">{session.content}</p>
                              {session.homework && <p className="text-amber-800 bg-amber-50 p-2 rounded border border-amber-100"><strong>宿題:</strong> {session.homework}</p>}
                            </>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-6">セッション記録はありません</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: チケット・Square */}
            {activeTab === 'tickets' && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5"><span>🎟️</span> チケット・Square 履歴</h3>
                <div className="space-y-3">
                  {currentParent.ticketsHistory.map(th => (
                    <div key={th.id} className="p-3 bg-slate-50 border rounded-lg text-xs space-y-1">
                      <div className="flex justify-between font-bold">
                        <span>{th.title} (購入数: {th.count}回)</span>
                        <span className="text-[#5e9bc4]">有効期限: {th.expire}</span>
                      </div>
                      <p className="text-slate-500">購入日: {th.date} / Square決済ID: <span className="font-mono bg-slate-200 px-1 py-0.5 rounded">{th.squarePaymentId}</span></p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: 基本情報・3つのメモ */}
            {activeTab === 'edit_info' && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5"><span>✏️</span> 基本情報・3つのメモ編集</h3>
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-500 mb-1 font-semibold">特記事項メモ (メモ1)</label>
                    <textarea value={editCustomMemo1} onChange={e => setEditCustomMemo1(e.target.value)} rows={2} className="w-full border rounded-lg p-2 outline-none bg-slate-50" />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1 font-semibold">食事面メモ (メモ2)</label>
                    <textarea value={editCustomMemo2} onChange={e => setEditCustomMemo2(e.target.value)} rows={2} className="w-full border rounded-lg p-2 outline-none bg-slate-50" />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1 font-semibold">自主練メモ (メモ3)</label>
                    <textarea value={editCustomMemo3} onChange={e => setEditCustomMemo3(e.target.value)} rows={2} className="w-full border rounded-lg p-2 outline-none bg-slate-50" />
                  </div>
                  <button onClick={() => alert('基本情報・メモを保存しました！')} className="bg-[#5e9bc4] text-white font-bold px-4 py-2 rounded-lg">
                    変更を保存する
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      </main>
    </div>
  );
}
