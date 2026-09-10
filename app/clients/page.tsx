'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { supabase } from '@/utils/supabase'; // ※プロジェクトのSupabaseクライアントパスに合わせて調整してください

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
  posturePhotos?: {
    front?: string | null;
    side?: string | null;
    back?: string | null;
  };
  testPhotos?: string[];
}

interface TicketHistory {
  id: string;
  date: string;
  title: string;
  count: number;
  expire: string;
  squarePaymentId: string;
  amount?: number;
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
  physicalHistory: PhysicalData[];
  sessions: Session[];
}

export default function ClientsPage() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // UI状態
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'carte' | 'tickets' | 'edit_info'>('carte');

  // Supabaseからのデータ読み込み
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // 顧客データの取得
        const { data: customerData, error: custError } = await supabase.from('customers').select('*');
        // 決済データの取得 (Square情報)
        const { data: paymentData, error: payError } = await supabase.from('payments').select('*');
        const { data: salesData, error: salesError } = await supabase.from('sales').select('*');

        if (custError) throw custError;

        if (customerData && customerData.length > 0) {
          // 取得したSupabaseデータをアプリのStudent構造にマッピング
          const mappedStudents: Student[] = customerData.map((row: any, index: number) => ({
            id: String(row.id || `s-${index + 1}`),
            parentId: row.parent_id || 'p-101',
            name: row.name || `${row.given_name || ''} ${row.family_name || ''}`.trim() || '未設定',
            kana: row.kana || '',
            age: row.age || 10,
            birthdate: row.birthdate || '2015-01-01',
            firstLessonDate: row.first_lesson_date || '2026-03-01',
            lastReservationDate: row.last_reservation_date || '2026-09-01',
            concern: row.concern || '未設定',
            target: row.target || '未設定',
            memo: row.memo || '',
            physicalHistory: row.physical_history || [
              { id: 'm-1', date: '2026-09-01', weight: 35.0, fat: 15.0, muscle: 28.0, note: '初期計測', posturePhotos: { front: null, side: null, back: null }, testPhotos: [] }
            ],
            sessions: row.sessions || []
          }));

          setStudents(mappedStudents);
          setSelectedStudentId(mappedStudents[0].id);

          // 決済情報（Square）をチケット履歴としてマッピング
          const tickets: TicketHistory[] = [];
          if (paymentData) {
            paymentData.forEach((pay: any, idx: number) => {
              tickets.push({
                id: pay.id || `th-${idx}`,
                date: pay.created_at ? pay.created_at.split('T')[0] : '2026-09-01',
                title: pay.item_name || 'Square通常決済',
                count: 10,
                expire: '2027-03-01',
                squarePaymentId: pay.id,
                amount: pay.amount
              });
            });
          }
          if (salesData) {
            salesData.forEach((sale: any, idx: number) => {
              tickets.push({
                id: sale.id || `sales-${idx}`,
                date: sale.created_at ? sale.created_at.split('T')[0] : '2026-09-01',
                title: `Square売上連携 (${sale.source || 'KOBA'})`,
                count: 5,
                expire: '2027-03-01',
                squarePaymentId: sale.square_payment_id || 'N/A',
                amount: sale.amount
              });
            });
          }

          setParents([
            {
              id: 'p-101',
              name: '保護者 (Square連動)',
              kana: 'ホゴシャ',
              phone: '090-0000-0000',
              ticketRemaining: tickets.length > 0 ? tickets.length * 5 : 5,
              ticketsHistory: tickets
            }
          ]);
        }
      } catch (err) {
        console.error('データ取得エラー:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-100 min-h-screen flex items-center justify-center">
        <p className="text-slate-500 font-bold">Supabaseからデータを読み込んでいます...</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="bg-slate-100 min-h-screen text-slate-800 font-sans pb-12">
        <Header />
        <main className="p-6 max-w-7xl mx-auto text-center py-20">
          <p className="text-slate-600 font-bold mb-2">生徒データが見つかりません。Supabaseの `customers` テーブルを確認してください。</p>
        </main>
      </div>
    );
  }

  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];
  const currentParent = parents.find(p => p.id === currentStudent.parentId) || parents[0];
  const siblingStudents = students.filter(s => s.parentId === currentParent.id);

  const physicalDates = currentStudent.physicalHistory.map(m => m.date);
  const [beforeDate, setBeforeDate] = useState<string>(physicalDates[0] || '2026-06-01');
  const [afterDate, setAfterDate] = useState<string>(physicalDates[physicalDates.length - 1] || '2026-09-01');
  const [newMeasureDate, setNewMeasureDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // セッションフィルター＆新規フォーム
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [newSessionDate, setNewSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newSessionStaff, setNewSessionStaff] = useState<'TAKA' | 'NANA'>('TAKA');
  const [newSessionContent, setNewSessionContent] = useState<string>('');
  const [newSessionHomework, setNewSessionHomework] = useState<string>('');
  const [useTicket, setUseTicket] = useState<boolean>(true);

  // 編集用ステート
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editSessionContent, setEditSessionContent] = useState<string>('');
  const [editSessionHomework, setEditSessionHomework] = useState<string>('');

  const [editForm, setEditForm] = useState({
    name: currentStudent.name,
    kana: currentStudent.kana,
    phone: currentParent.phone,
    concern: currentStudent.concern,
    target: currentStudent.target,
    memo: currentStudent.memo
  });

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

    if (parent.ticketRemaining <= 1) {
      alerts.push({ text: `🎫 回数券残り ${parent.ticketRemaining} 回`, type: 'danger' });
    }

    return alerts;
  };

  const currentAlerts = getAlertBadges(currentStudent, currentParent);

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
    alert(`計測日 (${newMeasureDate}) を追加しました！`);
  };

  const handleSaveInfo = async () => {
    setStudents(prev =>
      prev.map(s => (s.id === currentStudent.id ? { ...s, name: editForm.name, kana: editForm.kana, concern: editForm.concern, target: editForm.target, memo: editForm.memo } : s))
    );
    // Supabase上のデータも更新する場合
    await supabase.from('customers').update({
      name: editForm.name,
      kana: editForm.kana,
      concern: editForm.concern,
      target: editForm.target,
      memo: editForm.memo
    }).eq('id', currentStudent.id);

    alert('基本情報をSupabaseに保存しました！');
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

          {/* 左カラム：受講生選択 */}
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

          {/* 右カラム：メインコンテンツ */}
          <div className="md:col-span-3 space-y-5">
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
                      保護者: {currentParent.name} ({currentParent.phone})
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

              {/* タブ */}
              <div className="flex border-b border-slate-200 pt-2 gap-6 text-xs font-bold">
                <button onClick={() => setActiveTab('carte')} className={`pb-3 border-b-2 transition ${activeTab === 'carte' ? 'border-[#5e9bc4] text-[#5e9bc4]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                  📋 カルテ (セッション & 計測)
                </button>
                <button onClick={() => setActiveTab('tickets')} className={`pb-3 border-b-2 transition ${activeTab === 'tickets' ? 'border-[#5e9bc4] text-[#5e9bc4]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                  🎟️ チケット購入履歴 & Square連携
                </button>
                <button onClick={() => setActiveTab('edit_info')} className={`pb-3 border-b-2 transition ${activeTab === 'edit_info' ? 'border-[#5e9bc4] text-[#5e9bc4]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                  ✏️ 基本情報編集
                </button>
              </div>
            </div>

            {/* TAB 1: カルテ */}
            {activeTab === 'carte' && (
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b pb-3">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5"><span>✍️</span> 新規セッション記録の追加</h3>
                    <label className="flex items-center gap-1 font-semibold text-slate-600 text-xs cursor-pointer">
                      <input type="checkbox" checked={useTicket} onChange={e => setUseTicket(e.target.checked)} className="rounded text-[#5e9bc4]" />
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
                  <div className="flex justify-between items-center border-b pb-3">
                    <h3 className="font-bold text-slate-800 text-sm">📅 時系列セッション履歴</h3>
                  </div>
                  <div className="space-y-3">
                    {filteredSessions.length > 0 ? (
                      filteredSessions.map(session => (
                        <div key={session.id} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
                          <div className="flex justify-between items-center font-bold text-slate-700">
                            <span>{session.date} <span className="text-[#5e9bc4] ml-2 bg-sky-100 px-2 py-0.5 rounded">担当: {session.staff}</span></span>
                            <button onClick={() => handleDeleteSession(session.id)} className="text-xs text-rose-500 hover:underline">削除</button>
                          </div>
                          <p className="text-slate-800 font-medium">{session.content}</p>
                          {session.homework && <p className="text-amber-800 bg-amber-50 p-2 rounded border border-amber-100"><strong>宿題:</strong> {session.homework}</p>}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-6">セッション記録はありません</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: チケット購入履歴 & Square */}
            {activeTab === 'tickets' && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5"><span>🎟️</span> Square 決済・チケット購入履歴 (Supabase同期)</h3>
                <div className="space-y-3">
                  {currentParent.ticketsHistory && currentParent.ticketsHistory.length > 0 ? (
                    currentParent.ticketsHistory.map((t, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="font-bold text-slate-800 text-sm">{t.title}</p>
                          <p className="text-slate-500">決済日: {t.date} / 有効期限: {t.expire}</p>
                          <p className="text-slate-400 font-mono text-[10px]">Square ID: {t.squarePaymentId}</p>
                        </div>
                        <div className="text-right">
                          <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold text-xs">
                            {t.amount ? `¥${t.amount.toLocaleString()}` : '決済完了'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-6">Squareの決済履歴・チケット履歴はありません</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: 基本情報編集 */}
            {activeTab === 'edit_info' && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">✏️ 基本情報の編集 (Supabase同期)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">受講生氏名</label>
                    <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full border rounded p-2" />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">フリガナ</label>
                    <input type="text" value={editForm.kana} onChange={e => setEditForm({ ...editForm, kana: e.target.value })} className="w-full border rounded p-2" />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">保護者電話番号</label>
                    <input type="text" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="w-full border rounded p-2" />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">お悩み・課題</label>
                    <input type="text" value={editForm.concern} onChange={e => setEditForm({ ...editForm, concern: e.target.value })} className="w-full border rounded p-2" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-slate-500 font-semibold mb-1">目標</label>
                    <input type="text" value={editForm.target} onChange={e => setEditForm({ ...editForm, target: e.target.value })} className="w-full border rounded p-2" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-slate-500 font-semibold mb-1">メモ・特記事項</label>
                    <textarea value={editForm.memo} onChange={e => setEditForm({ ...editForm, memo: e.target.value })} className="w-full border rounded p-2 h-20" />
                  </div>
                </div>
                <button onClick={handleSaveInfo} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-lg text-xs transition shadow-sm">
                  Supabaseに保存する
                </button>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
