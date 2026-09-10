'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { supabase } from '@/utils/supabase';

interface Session {
  id: string;
  date: string;
  staff: string;
  content: string;
  homework: string;
  photo: string | null;
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
  sessions: Session[];
}

export default function ClientsPage() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'carte' | 'tickets' | 'edit_info'>('carte');

  const [newSessionDate, setNewSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newSessionStaff, setNewSessionStaff] = useState<'TAKA' | 'NANA'>('TAKA');
  const [newSessionContent, setNewSessionContent] = useState<string>('');
  const [newSessionHomework, setNewSessionHomework] = useState<string>('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data: customerData } = await supabase.from('customers').select('*');
        const { data: paymentData } = await supabase.from('payments').select('*');
        const { data: salesData } = await supabase.from('sales').select('*');

        if (customerData && customerData.length > 0) {
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
            sessions: row.sessions || []
          }));

          setStudents(mappedStudents);
          setSelectedStudentId(mappedStudents[0].id);

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
        <p className="text-slate-500 font-bold">データを読み込んでいます...</p>
      </div>
    );
  }

  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];
  const currentParent = parents.find(p => p.id === currentStudent?.parentId) || parents[0];

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

    setNewSessionContent('');
    setNewSessionHomework('');
    alert('セッションを登録しました！');
  };

  const filteredStudents = students.filter(s => {
    const query = searchKeyword.toLowerCase();
    return s.name.toLowerCase().includes(query) || s.kana.toLowerCase().includes(query) || s.concern.toLowerCase().includes(query);
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
                placeholder="名前、悩みで検索..."
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs outline-none"
              />
            </div>

            <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider px-1">受講生一覧 ({filteredStudents.length}名)</h3>

            <div className="space-y-2.5">
              {filteredStudents.map(student => {
                const isSelected = selectedStudentId === student.id;
                return (
                  <div
                    key={student.id}
                    onClick={() => setSelectedStudentId(student.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all shadow-sm ${
                      isSelected ? 'bg-sky-50/80 border-[#5e9bc4] ring-2 ring-[#5e9bc4]/20' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`font-bold ${isSelected ? 'text-[#5e9bc4]' : 'text-slate-800'}`}>{student.name}</span>
                      <span className="text-xs font-semibold text-[#5e9bc4] bg-sky-100/60 px-2 py-0.5 rounded-full">{student.age}歳</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 右カラム：メイン */}
          <div className="md:col-span-3 space-y-5">
            {currentStudent && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                    {currentStudent.name}
                    <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">{currentStudent.age}歳</span>
                  </h2>
                </div>

                {/* タブ切り替え */}
                <div className="flex border-b border-slate-200 pt-2 gap-6 text-xs font-bold">
                  <button onClick={() => setActiveTab('carte')} className={`pb-3 border-b-2 transition ${activeTab === 'carte' ? 'border-[#5e9bc4] text-[#5e9bc4]' : 'border-transparent text-slate-400'}`}>
                    📋 カルテ (セッション)
                  </button>
                  <button onClick={() => setActiveTab('tickets')} className={`pb-3 border-b-2 transition ${activeTab === 'tickets' ? 'border-[#5e9bc4] text-[#5e9bc4]' : 'border-transparent text-slate-400'}`}>
                    🎟️ チケット・Square連携
                  </button>
                  <button onClick={() => setActiveTab('edit_info')} className={`pb-3 border-b-2 transition ${activeTab === 'edit_info' ? 'border-[#5e9bc4] text-[#5e9bc4]' : 'border-transparent text-slate-400'}`}>
                    ✏️ 基本情報編集
                  </button>
                </div>
              </div>
            )}

            {/* TAB 1: カルテ */}
            {activeTab === 'carte' && currentStudent && (
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm">✍️ 新規セッション記録の追加</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-500 mb-1">日時</label>
                      <input type="date" value={newSessionDate} onChange={e => setNewSessionDate(e.target.value)} className="w-full border rounded p-2" />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1">担当トレーナー</label>
                      <select value={newSessionStaff} onChange={e => setNewSessionStaff(e.target.value as 'TAKA' | 'NANA')} className="w-full border rounded p-2 text-[#5e9bc4] font-bold">
                        <option value="TAKA">TAKA</option>
                        <option value="NANA">NANA</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-slate-500 mb-1">セッション内容</label>
                      <input type="text" placeholder="例: 体幹バランストレーニング" value={newSessionContent} onChange={e => setNewSessionContent(e.target.value)} className="w-full border rounded p-2" />
                    </div>
                  </div>
                  <button onClick={handleAddSession} className="w-full bg-[#5e9bc4] hover:bg-sky-600 text-white font-bold py-2.5 rounded-lg text-xs transition">
                    セッションを登録する
                  </button>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <h3 className="font-bold text-slate-800 text-sm">📅 セッション履歴</h3>
                  {currentStudent.sessions?.length > 0 ? (
                    currentStudent.sessions.map((s, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded border text-xs space-y-1">
                        <p className="font-bold text-slate-700">{s.date} (担当: {s.staff})</p>
                        <p>{s.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4">履歴はありません</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: チケット・Square */}
            {activeTab === 'tickets' && currentParent && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">🎟️ Square 決済履歴</h3>
                <div className="space-y-3">
                  {currentParent.ticketsHistory?.length > 0 ? (
                    currentParent.ticketsHistory.map((t, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-lg border text-xs flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{t.title}</p>
                          <p className="text-slate-500">決済日: {t.date}</p>
                        </div>
                        <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold">
                          {t.amount ? `¥${t.amount.toLocaleString()}` : '完了'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-6">Squareの決済履歴はありません</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: 基本情報編集 */}
            {activeTab === 'edit_info' && currentStudent && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">✏️ 基本情報</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-500 mb-1">氏名</label>
                    <input type="text" defaultValue={currentStudent.name} className="w-full border rounded p-2" />
                  </div>
                  <button onClick={() => alert('保存しました')} className="bg-emerald-600 text-white font-bold px-4 py-2 rounded text-xs">
                    保存する
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
