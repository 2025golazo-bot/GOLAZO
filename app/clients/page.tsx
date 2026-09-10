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
  lastReservationDate: string;
  concern: string;
  target: string;
  memo: string;
  alert: string | null;
  physicalHistory: PhysicalData[];
  sessions: Session[];
}

export default function ClientsPage() {
  // 保護者データ (Square連携・チケット管理)
  const [parents, setParents] = useState<Parent[]>([
    {
      id: 'p-101',
      name: '藤田 奈々',
      kana: 'フジタ ナナ',
      phone: '090-1111-2222',
      ticketRemaining: 8,
      ticketsHistory: [
        { id: 'th-1', date: '2026-06-01', title: '10回券 (共通)', count: 10, expire: '2026-12-01', squarePaymentId: 'sq_pay_998811' }
      ]
    },
    {
      id: 'p-102',
      name: '山田 太郎',
      kana: 'ヤマダ タロウ',
      phone: '090-1234-5678',
      ticketRemaining: 3,
      ticketsHistory: [
        { id: 'th-2', date: '2026-08-01', title: '5回券', count: 5, expire: '2027-02-01', squarePaymentId: 'sq_pay_772200' }
      ]
    }
  ]);

  // 受講生（子供）データ一覧
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
      alert: null,
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
        { id: 'ses-102', date: '2026-09-15', staff: 'NANA', content: 'KOBA式体幹トレーニング＆アジリティ', homework: '片足バランス 1分×2回', photo: null },
        { id: 'ses-103', date: '2026-09-01', staff: 'TAKA', content: 'フットアライメント評価・軸足強化', homework: '足指じゃんけん100回', photo: null }
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
      lastReservationDate: '2026-10-02',
      concern: '運動神経向上・ボール感覚',
      target: 'アジリティUP',
      memo: '弟。リズムトレーニングを好む。',
      alert: null,
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
        { id: 'ses-201', date: '2026-10-02', staff: 'NANA', content: 'スポーツリズムステップ・コーディネーション', homework: 'ケンケンパ練習', photo: null },
        { id: 'ses-202', date: '2026-09-20', staff: 'TAKA', content: 'リアクションアジリティ＆体幹基礎', homework: 'もも上げ20回×3セット', photo: null }
      ]
    }
  ]);

  // UI状態
  const [selectedStudentId, setSelectedStudentId] = useState<string>('s-001');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'carte' | 'tickets' | 'edit_info'>('carte');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // 選択中の生徒と保護者
  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];
  const currentParent = parents.find(p => p.id === currentStudent.parentId) || parents[0];
  const siblingStudents = students.filter(s => s.parentId === currentParent.id);

  // 姿勢写真 & 測定シート 比較用（Before / After）年月選択
  const physicalDates = currentStudent.physicalHistory.map(m => m.date);
  const [beforeDate, setBeforeDate] = useState<string>(physicalDates[0] || '2026-06-01');
  const [afterDate, setAfterDate] = useState<string>(physicalDates[physicalDates.length - 1] || '2026-09-01');

  const beforePhysical = currentStudent.physicalHistory.find(m => m.date === beforeDate) || currentStudent.physicalHistory[0];
  const afterPhysical = currentStudent.physicalHistory.find(m => m.date === afterDate) || currentStudent.physicalHistory[currentStudent.physicalHistory.length - 1];

  // セッション表示 フィルター（年度・月度）
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');

  // 新規セッションフォーム
  const [newSessionDate, setNewSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newSessionStaff, setNewSessionStaff] = useState<'TAKA' | 'NANA'>('TAKA');
  const [newSessionContent, setNewSessionContent] = useState<string>('');
  const [newSessionHomework, setNewSessionHomework] = useState<string>('');

  // 基本情報手動編集フォーム
  const [editForm, setEditForm] = useState({
    name: currentStudent.name,
    kana: currentStudent.kana,
    phone: currentParent.phone,
    concern: currentStudent.concern,
    target: currentStudent.target,
    memo: currentStudent.memo
  });

  // 検索処理
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
      }
    }
  };

  // セッション追加（チケット自動減算）
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

    setParents(prev =>
      prev.map(p => (p.id === currentParent.id ? { ...p, ticketRemaining: Math.max(0, p.ticketRemaining - 1) } : p))
    );

    setNewSessionContent('');
    setNewSessionHomework('');
  };

  // 削除ハンドラー
  const handleDeleteStudent = (id: number | string) => {
    if (confirm('本当にこの受講生データを削除しますか？')) {
      setStudents(prev => prev.filter(s => s.id !== id));
      if (selectedStudentId === id) {
        const remaining = students.filter(s => s.id !== id);
        if (remaining.length > 0) {
          setSelectedStudentId(remaining[0].id);
        }
      }
    }
  };

  // Square手動同期シミュレーション
  const handleSquareSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      alert('Squareの最新決済・チケットデータの同期が完了しました！');
    }, 1200);
  };

  // 身体データ更新
  const handleUpdatePhysicalValue = (targetDate: string, field: keyof PhysicalData, val: any) => {
    setStudents(prev =>
      prev.map(s => {
        if (s.id !== currentStudent.id) return s;
        const updated: PhysicalData[] = s.physicalHistory.map(m => {
          if (m.date === targetDate) {
            return { ...m, [field]: val };
          }
          return m;
        });
        return { ...s, physicalHistory: updated };
      })
    );
  };

  // 基本情報保存
  const handleSaveInfo = () => {
    setStudents(prev =>
      prev.map(s => (s.id === currentStudent.id ? { ...s, name: editForm.name, kana: editForm.kana, concern: editForm.concern, target: editForm.target, memo: editForm.memo } : s))
    );
    setParents(prev =>
      prev.map(p => (p.id === currentParent.id ? { ...p, phone: editForm.phone } : p))
    );
    alert('基本情報を更新しました');
  };

  // 年度・月度の動的取得
  const availableYears = Array.from(new Set(currentStudent.sessions.map(s => s.date.substring(0, 4)))).sort().reverse();
  const availableMonths = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

  const filteredSessions = currentStudent.sessions.filter(s => {
    const [y, m] = s.date.split('-');
    const matchYear = selectedYear === 'ALL' || y === selectedYear;
    const matchMonth = selectedMonth === 'ALL' || m === selectedMonth;
    return matchYear && matchMonth;
  });

  // 数値変化計算ヘルパー
  const calcDiff = (afterVal: number, beforeVal: number, unit: string, isImprovementWhenIncrease: boolean = true) => {
    if (afterVal === undefined || beforeVal === undefined) return null;
    const diff = Number((afterVal - beforeVal).toFixed(1));
    if (diff === 0) return <span className="text-slate-400 font-normal">±0{unit}</span>;

    const formattedStr = diff > 0 ? `+${diff}${unit}` : `${diff}${unit}`;
    let colorClass = 'bg-slate-100 text-slate-700';
    if (isImprovementWhenIncrease) {
      colorClass = diff > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800';
    } else {
      colorClass = diff < 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800';
    }

    return (
      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${colorClass}`}>
        {formattedStr}
      </span>
    );
  };

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 font-sans pb-12">
      <Header />

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* 上部アクションバー（Square手動同期ボタン追加） */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span>📋</span> 受講生・カルテ管理システム
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              会員情報、セッション記録、3ヶ月定期計測、Square回数券連携を一元管理します。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSquareSync}
              disabled={isSyncing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              <span>{isSyncing ? '⏳' : '🔄'}</span>
              {isSyncing ? '同期中...' : 'Square手動同期'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          {/* 左カラム：受講生選択・検索 */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <span>🔍</span> キーワード検索
              </label>
              <input
                type="text"
                placeholder="名前、悩み、メモで検索..."
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#5e9bc4] focus:border-[#5e9bc4] outline-none transition"
              />
            </div>

            <div className="flex justify-between items-center px-1">
              <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider">
                受講生一覧 ({filteredStudents.length}名)
              </h3>
            </div>

            <div className="space-y-2.5">
              {filteredStudents.map(student => {
                const parent = parents.find(p => p.id === student.parentId);
                const isSelected = selectedStudentId === student.id;
                return (
                  <div
                    key={student.id}
                    className={`p-4 rounded-xl border transition-all shadow-sm relative group ${
                      isSelected
                        ? 'bg-sky-50/85 border-[#5e9bc4] ring-2 ring-[#5e9bc4]/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow'
                    }`}
                  >
                    <div onClick={() => handleSelectStudent(student.id)} className="cursor-pointer">
                      <div className="flex justify-between items-start">
                        <span className={`font-bold ${isSelected ? 'text-[#5e9bc4]' : 'text-slate-800'}`}>
                          {student.name}
                        </span>
                        <span className="text-xs font-semibold text-[#5e9bc4] bg-sky-100/60 px-2 py-0.5 rounded-full">
                          {student.age}歳
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">保護者: {parent?.name}</p>
                    </div>

                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
                      {student.alert ? (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">⚠️ アラート</span>
                      ) : <span />}
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingStudent(student)}
                          className="px-2 py-1 bg-slate-100 hover:bg-amber-500 hover:text-white rounded text-[10px] font-semibold transition text-slate-700"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="px-2 py-1 bg-slate-100 hover:bg-rose-500 hover:text-white rounded text-[10px] font-semibold transition text-slate-700"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 右カラム：メインコンテンツ */}
          <div className="md:col-span-3 space-y-5">
            {/* 顧客基本ヘッダーカード */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="text-xs text-slate-400 font-semibold tracking-wide">{currentStudent.kana}</span>
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 mt-0.5">
                    {currentStudent.name}
                    <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {currentStudent.age}歳
                    </span>
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-semibold">
                      保護者 (Square連携): {currentParent.name} 様 ({currentParent.phone})
                    </span>
                    <span className="bg-sky-50 text-[#5e9bc4] border border-sky-200 font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <span>🎟️</span> 家族共通回数券 残数: <strong className="text-sm">{currentParent.ticketRemaining}</strong> 回
                    </span>
                  </div>
                </div>

                {siblingStudents.length > 1 && (
                  <div className="bg-amber-50/80 border border-amber-200 p-3 rounded-xl text-right self-stretch md:self-auto">
                    <span className="text-[10px] text-amber-800 font-bold block mb-1.5">👨‍👩‍👧‍👦 ご兄弟でのご利用</span>
                    <div className="flex gap-1.5 justify-end">
                      {siblingStudents.map(sib => (
                        <button
                          key={sib.id}
                          onClick={() => handleSelectStudent(sib.id)}
                          className={`text-xs px-2.5 py-1 rounded-lg font-bold transition ${
                            sib.id === currentStudent.id
                              ? 'bg-amber-600 text-white shadow-sm'
                              : 'bg-white text-amber-900 border border-amber-300 hover:bg-amber-100'
                          }`}
                        >
                          {sib.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* サブタブナビゲーション */}
              <div className="flex border-b border-slate-200 pt-2 gap-6 text-xs font-bold">
                <button
                  onClick={() => setActiveTab('carte')}
                  className={`pb-3 border-b-2 transition flex items-center gap-1.5 ${
                    activeTab === 'carte'
                      ? 'border-[#5e9bc4] text-[#5e9bc4]'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <span>📋</span> カルテ (セッション & 3ヶ月計測・写真比較)
                </button>
                <button
                  onClick={() => setActiveTab('tickets')}
                  className={`pb-3 border-b-2 transition flex items-center gap-1.5 ${
                    activeTab === 'tickets'
                      ? 'border-[#5e9bc4] text-[#5e9bc4]'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <span>🎟️</span> チケット購入履歴 & Square連携
                </button>
                <button
                  onClick={() => setActiveTab('edit_info')}
                  className={`pb-3 border-b-2 transition flex items-center gap-1.5 ${
                    activeTab === 'edit_info'
                      ? 'border-[#5e9bc4] text-[#5e9bc4]'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <span>✏️</span> 基本情報・手動編集
                </button>
              </div>
            </div>

            {/* TAB 1: カルテ */}
            {activeTab === 'carte' && (
              <div className="space-y-6">

                {/* 1. 新規セッション記録の追加 */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b pb-3">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                      <span>✍️</span> 新規セッション記録の追加
                    </h3>
                    <span className="text-[11px] text-[#5e9bc4] bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100 font-bold">
                      💡 登録すると回数券残数（現在 {currentParent.ticketRemaining} 回）が1回自動消費されます
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-500 mb-1 font-semibold">日時</label>
                      <input
                        type="date"
                        value={newSessionDate}
                        onChange={e => setNewSessionDate(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#5e9bc4] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1 font-semibold">担当トレーナー</label>
                      <select
                        value={newSessionStaff}
                        onChange={e => setNewSessionStaff(e.target.value as 'TAKA' | 'NANA')}
                        className="w-full border border-slate-300 rounded-lg p-2 font-bold text-[#5e9bc4] focus:ring-2 focus:ring-[#5e9bc4] outline-none"
                      >
                        <option value="TAKA">TAKA (藤田 渉仁)</option>
                        <option value="NANA">NANA (藤田 奈々)</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-slate-500 mb-1 font-semibold">セッション内容</label>
                      <input
                        type="text"
                        placeholder="例: KOBA式体幹バランストレーニング & スプリントフォーム"
                        value={newSessionContent}
                        onChange={e => setNewSessionContent(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#5e9bc4] outline-none"
                      />
                    </div>
                  </div>
                  <div className="text-xs">
                    <label className="block text-slate-500 mb-1 font-semibold">宿題・自主トレ指示</label>
                    <input
                      type="text"
                      placeholder="例: 片足ドローイン 1分×2"
                      value={newSessionHomework}
                      onChange={e => setNewSessionHomework(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#5e9bc4] outline-none"
                    />
                  </div>
                  <button
                    onClick={handleAddSession}
                    className="w-full bg-[#5e9bc4] hover:bg-sky-600 text-white font-bold py-2.5 rounded-lg text-xs transition shadow-sm"
                  >
                    セッションを登録する（回数券を1回減算）
                  </button>
                </div>

                {/* 2. 時系列セッション履歴（年度・月度フィルター付き） */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        <span>📅</span> 時系列セッション履歴
                      </h3>
                      <p className="text-[11px] text-slate-400">過去の指導内容と宿題の履歴</p>
                    </div>

                    <div className="flex items-center gap-2 text-xs bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-slate-600">年度:</span>
                        <select
                          value={selectedYear}
                          onChange={e => setSelectedYear(e.target.value)}
                          className="border border-slate-300 rounded-md p-1 font-bold text-[#5e9bc4] bg-white outline-none"
                        >
                          <option value="ALL">すべて</option>
                          {availableYears.map(y => (
                            <option key={y} value={y}>{y}年</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="font-bold text-slate-600">月度:</span>
                        <select
                          value={selectedMonth}
                          onChange={e => setSelectedMonth(e.target.value)}
                          className="border border-slate-300 rounded-md p-1 font-bold text-[#5e9bc4] bg-white outline-none"
                        >
                          <option value="ALL">すべて</option>
                          {availableMonths.map(m => (
                            <option key={m} value={m}>{parseInt(m, 10)}月</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {filteredSessions.length > 0 ? (
                      filteredSessions.map(session => (
                        <div key={session.id} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                          <div className="flex justify-between font-bold text-slate-700">
                            <span>{session.date}</span>
                            <span className="text-[#5e9bc4] bg-sky-100/50 px-2 py-0.5 rounded">担当: {session.staff}</span>
                          </div>
                          <p className="text-slate-800 font-medium">{session.content}</p>
                          {session.homework && (
                            <p className="text-amber-800 bg-amber-50 p-2 rounded-md border border-amber-100">
                              <span className="font-bold">宿題:</span> {session.homework}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-6">該当する年度・月度のセッション記録はありません</p>
                    )}
                  </div>
                </div>

                {/* 3. 3ヶ月定期計測・身体データ推移 */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-6">
                  <div className="border-b pb-3">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                      <span>📊</span> 3ヶ月定期計測・身体データ & 差分自動計算
                    </h3>
                    <p className="text-[11px] text-slate-400">選択した2つの年月での数値変化を自動計算します</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-sky-50/50 p-3.5 rounded-xl border border-sky-100 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-600 bg-slate-200 px-2.5 py-1 rounded-md">Before</span>
                      <select
                        value={beforeDate}
                        onChange={e => setBeforeDate(e.target.value)}
                        className="border border-slate-300 rounded-lg p-1.5 font-bold text-[#5e9bc4] bg-white flex-1 outline-none"
                      >
                        {physicalDates.map(d => (
                          <option key={d} value={d}>{d} 計測データ</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white bg-[#5e9bc4] px-2.5 py-1 rounded-md">After</span>
                      <select
                        value={afterDate}
                        onChange={e => setAfterDate(e.target.value)}
                        className="border border-slate-300 rounded-lg p-1.5 font-bold text-[#5e9bc4] bg-white flex-1 outline-none"
                      >
                        {physicalDates.map(d => (
                          <option key={d} value={d}>{d} 計測データ</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {beforePhysical && afterPhysical && (
                    <div className="grid grid-cols-3 gap-3 text-center text-xs">
                      <div className="bg-slate-50 p-3 rounded-xl border">
                        <span className="text-slate-400 block text-[10px]">体重差</span>
                        <div className="font-bold text-base mt-1">{afterPhysical.weight}kg</div>
                        <div className="mt-1">{calcDiff(afterPhysical.weight, beforePhysical.weight, 'kg', false)}</div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border">
                        <span className="text-slate-400 block text-[10px]">体脂肪率差</span>
                        <div className="font-bold text-base mt-1">{afterPhysical.fat}%</div>
                        <div className="mt-1">{calcDiff(afterPhysical.fat, beforePhysical.fat, '%', false)}</div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border">
                        <span className="text-slate-400 block text-[10px]">筋肉量差</span>
                        <div className="font-bold text-base mt-1">{afterPhysical.muscle}kg</div>
                        <div className="mt-1">{calcDiff(afterPhysical.muscle, beforePhysical.muscle, 'kg', true)}</div>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB 2: チケット履歴 & Square連携 */}
            {activeTab === 'tickets' && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <span>🎟️</span> Square連携・チケット購入履歴
                  </h3>
                  <span className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full font-bold border border-emerald-200">
                    Square連動中（保護者ID: {currentParent.id}）
                  </span>
                </div>
                <div className="space-y-3">
                  {currentParent.ticketsHistory.map(th => (
                    <div key={th.id} className="p-4 bg-slate-50 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                      <div>
                        <div className="font-bold text-slate-800 text-sm">{th.title} （購入枚数: {th.count}回）</div>
                        <div className="text-slate-500 mt-0.5">購入日: {th.date} / 有効期限: {th.expire}</div>
                        <div className="text-[11px] text-slate-400 mt-1">Square決済ID: <code className="bg-slate-200 px-1 py-0.5 rounded">{th.squarePaymentId}</code></div>
                      </div>
                      <span className="bg-sky-100 text-[#5e9bc4] font-bold px-3 py-1.5 rounded-lg">
                        残数: {currentParent.ticketRemaining}回
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: 基本情報・手動編集 */}
            {activeTab === 'edit_info' && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
                <h3 className="font-bold text-slate-800 text-sm border-b pb-3">✏️ 受講生カルテ・基本情報の編集</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 mb-1 font-semibold">お名前</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full border p-2 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1 font-semibold">フリガナ</label>
                    <input
                      type="text"
                      value={editForm.kana}
                      onChange={e => setEditForm({ ...editForm, kana: e.target.value })}
                      className="w-full border p-2 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">保護者連絡先 (TEL)</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full border p-2 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 mb-1 font-semibold">お悩み・課題</label>
                    <input
                      type="text"
                      value={editForm.concern}
                      onChange={e => setEditForm({ ...editForm, concern: e.target.value })}
                      className="w-full border p-2 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1 font-semibold">目標</label>
                    <input
                      type="text"
                      value={editForm.target}
                      onChange={e => setEditForm({ ...editForm, target: e.target.value })}
                      className="w-full border p-2 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">特記事項・メモ</label>
                  <textarea
                    rows={3}
                    value={editForm.memo}
                    onChange={e => setEditForm({ ...editForm, memo: e.target.value })}
                    className="w-full border p-2 rounded-lg"
                  />
                </div>
                <button
                  onClick={handleSaveInfo}
                  className="bg-[#5e9bc4] hover:bg-sky-600 text-white font-bold px-4 py-2 rounded-lg transition"
                >
                  変更を保存する
                </button>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* 受講生情報 編集モーダル */}
      {editingStudent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg text-slate-800">受講生情報の編集</h3>
              <button onClick={() => setEditingStudent(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">お名前</label>
                <input
                  type="text"
                  value={editingStudent.name}
                  onChange={e => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full border p-2 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">フリガナ</label>
                <input
                  type="text"
                  value={editingStudent.kana}
                  onChange={e => setEditingStudent({ ...editingStudent, kana: e.target.value })}
                  className="w-full border p-2 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">お悩み・課題</label>
                <input
                  type="text"
                  value={editingStudent.concern}
                  onChange={e => setEditingStudent({ ...editingStudent, concern: e.target.value })}
                  className="w-full border p-2 rounded-lg"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingStudent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  setStudents(prev => prev.map(s => s.id === editingStudent.id ? editingStudent : s));
                  setEditingStudent(null);
                  alert('受講生情報を更新しました');
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-sm"
              >
                更新する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
