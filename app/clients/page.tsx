'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
  const pathname = usePathname();

  // --- 不要な共通ヘッダー（一番上の黒い文字のバー等）を非表示にするハック処理 ---
  useEffect(() => {
    const globalNavs = document.querySelectorAll('header:not(main header), nav:not(main nav)');
    globalNavs.forEach((el) => {
      if (!el.classList.contains('golazo-custom-header')) {
        (el as HTMLElement).style.display = 'none';
      }
    });
  }, []);

  // --- ナビゲーションメニュー設定（他のページと完全統一） ---
  const navItems = [
    { label: '売上管理', href: '/sales', icon: '📊' },
    { label: '顧客リスト', href: '/clients', icon: '📋' },
    { label: 'タスク・議事録', href: '/task-manager', icon: '📝' },
    { label: '近隣情報', href: '/local-info', icon: '📍' },
    { label: 'マシン・業者一覧', href: '/vendors', icon: '🏋️' },
  ];

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
  const [newSessionDate, setNewSessionDate] = useState<string>('2026-10-06');
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

  // セッションの絞り込みフィルター処理
  const filteredSessions = currentStudent.sessions.filter(s => {
    const [y, m] = s.date.split('-');
    const matchYear = selectedYear === 'ALL' || y === selectedYear;
    const matchMonth = selectedMonth === 'ALL' || m === selectedMonth;
    return matchYear && matchMonth;
  });

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 font-sans pb-12">
      {/* 水色のヘッダー帯：タスク管理画面と完全に同じレイアウト（ロゴ＆名称＋ナビゲーション） */}
      <header className="golazo-custom-header bg-[#5e9bc4] text-white px-6 py-3 flex flex-wrap justify-between items-center shadow-md sticky top-0 z-50 gap-3">
        <div className="flex items-center gap-2.5">
          <span className="bg-white text-[#5e9bc4] px-2 py-1 rounded font-black text-xs">G</span>
          <h1 className="text-sm font-bold tracking-wider">パーソナルジム GOLAZO</h1>
        </div>
        <nav className="flex flex-wrap gap-1.5 text-xs font-semibold">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white text-[#5e9bc4] font-bold shadow-sm'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/30'
                }`}
              >
                <span>{item.icon}</span> {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-6">
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
                    onClick={() => handleSelectStudent(student.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all shadow-sm ${
                      isSelected
                        ? 'bg-sky-50/80 border-[#5e9bc4] ring-2 ring-[#5e9bc4]/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`font-bold ${isSelected ? 'text-[#5e9bc4]' : 'text-slate-800'}`}>
                        {student.name}
                      </span>
                      <span className="text-xs font-semibold text-[#5e9bc4] bg-sky-100/60 px-2 py-0.5 rounded-full">
                        {student.age}歳
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">保護者: {parent?.name}</p>
                    {student.alert && (
                      <span className="inline-block mt-2 text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md">
                        ⚠️ 要確認アラートあり
                      </span>
                    )}
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

                {/* 1. 上部：新規セッション記録の追加 */}
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
                        <option value="TAKA">TAKA</option>
                        <option value="NANA">NANA</option>
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

                {/* 2. 時系列セッション履歴（年度・月度選択フィルター付き） */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        <span>📅</span> 時系列セッション履歴
                      </h3>
                      <p className="text-[11px] text-slate-400">過去の指導内容と宿題の履歴</p>
                    </div>

                    {/* 年度 & 月度 選択ドロップダウン */}
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

                {/* 3. 3ヶ月定期計測・身体データ */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-6">
                  <div className="border-b pb-3">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                      <span>📊</span> 3ヶ月定期計測・身体データ & 姿勢・測定シート比較
                    </h3>
                    <p className="text-[11px] text-slate-400">選択した2つの年月での数値変化を確認できます</p>
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

                  {beforePhysical && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-3">
                      <span className="font-bold text-slate-700 block border-b pb-1">計測データ編集 ({beforePhysical.date})</span>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-slate-500 block text-[11px] mb-1">体重 (kg)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={beforePhysical.weight}
                            onChange={e => handleUpdatePhysicalValue(beforeDate, 'weight', parseFloat(e.target.value))}
                            className="w-full border border-slate-300 rounded-md p-1.5 font-bold bg-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-slate-500 block text-[11px] mb-1">体脂肪率 (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={beforePhysical.fat}
                            onChange={e => handleUpdatePhysicalValue(beforeDate, 'fat', parseFloat(e.target.value))}
                            className="w-full border border-slate-300 rounded-md p-1.5 font-bold bg-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-slate-500 block text-[11px] mb-1">筋肉量 (kg)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={beforePhysical.muscle}
                            onChange={e => handleUpdatePhysicalValue(beforeDate, 'muscle', parseFloat(e.target.value))}
                            className="w-full border border-slate-300 rounded-md p-1.5 font-bold bg-white outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB 2: チケット購入履歴 */}
            {activeTab === 'tickets' && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
                <h3 className="font-bold text-slate-800 text-sm border-b pb-3">🎟️ チケット購入履歴 & Square連携詳細</h3>
                <p className="text-slate-600">保護者氏名: <strong>{currentParent.name}</strong> 様</p>
                <p className="text-slate-600">家族共通回数券 残数: <strong className="text-sm text-[#5e9bc4]">{currentParent.ticketRemaining} 回</strong></p>
                
                <div className="border-t pt-3 space-y-2">
                  <h4 className="font-bold text-slate-700">決済履歴一覧</h4>
                  {currentParent.ticketsHistory.map(th => (
                    <div key={th.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-800">{th.title} ({th.count}回分)</p>
                        <p className="text-slate-400 text-[11px]">購入日: {th.date} / 有効期限: {th.expire}</p>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded text-[10px]">
                        Square決済ID: {th.squarePaymentId}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: 基本情報・手動編集 */}
            {activeTab === 'edit_info' && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
                <h3 className="font-bold text-slate-800 text-sm border-b pb-3">✏️ 受講生・保護者 基本情報の編集</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">受講生 氏名</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">受講生 フリガナ</label>
                    <input
                      type="text"
                      value={editForm.kana}
                      onChange={e => setEditForm({ ...editForm, kana: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">保護者 電話番号</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">お悩み・課題</label>
                    <textarea
                      rows={2}
                      value={editForm.concern}
                      onChange={e => setEditForm({ ...editForm, concern: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2 outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">目標</label>
                    <input
                      type="text"
                      value={editForm.target}
                      onChange={e => setEditForm({ ...editForm, target: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">特記事項・メモ</label>
                    <textarea
                      rows={2}
                      value={editForm.memo}
                      onChange={e => setEditForm({ ...editForm, memo: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2 outline-none resize-none"
                    />
                  </div>

                  <button
                    onClick={handleSaveInfo}
                    className="w-full bg-[#5e9bc4] hover:bg-sky-600 text-white font-bold py-2.5 rounded-lg transition shadow-sm"
                  >
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
