'use client';

import React, { useState, useEffect } from 'react';

// ==========================================
// --- 型定義 ---
// ==========================================

interface TransactionItem {
  id: string;
  date: string;
  parentId: string;
  parentName: string;
  studentId?: string;
  studentName?: string;
  item: string;
  amount: number;
  staff: 'TAKA' | 'NANA';
  type: '回数券' | '物販' | '体験';
  campaignId?: string;
}

interface MeasurementRecord {
  id: string;
  date: string;
  weight: number;
  bodyFat: number;
  muscleMass: number;
  postureImages: string[];
  testResultImages: string[];
}

interface SessionRecord {
  id: string;
  date: string;
  content: string;
  homeworkContent: string;
  homeworkImage?: string;
}

interface TicketInfo {
  id: string;
  name: string;
  total: number;
  remaining: number;
}

interface StudentProfile {
  id: string;
  parentId: string;
  childName: string;
  kana: string;
  birthDate: string;
  firstLessonDate: string;
  lastBookingDate: string;
  concerns: string;
  goal: string;
  memo: string;
  sessions: SessionRecord[];
  measurements: MeasurementRecord[];
}

interface ParentProfile {
  id: string;
  parentName: string;
  tel: string;
  tickets: TicketInfo[];
}

type TaskStatus = '未着手' | '進行中' | '完了';

interface TaskItem {
  id: string;
  title: string;
  category: string;
  staff: 'TAKA' | 'NANA';
  dueDate: string;
  repeat: 'none' | 'weekly' | 'monthly';
  isImportant: boolean;
  status: TaskStatus;
}

interface MeetingNote {
  id: string;
  date: string;
  title: string;
  category: 'キャンペーン' | '週MT' | '月MT' | string;
  content: string;
  checklist?: { id: string; text: string; completed: boolean }[];
}

interface LocalInfoItem {
  id: string;
  name: string;
  district: '板橋区' | '北区' | 'その他';
  eventName: string;
  url: string;
  contactStaff: string;
  memo: string;
}

// プリセットタスクマスタ
const CAMPAIGN_PRESET_TASKS = [
  'レジ設定',
  'SNS告知準備',
  'SNS投稿予約',
  'チラシ準備',
  'チラシ掲示',
  '報告書作成'
];

export default function IntegratedApp() {
  const [activeTab, setActiveTab] = useState<'sales' | 'clients' | 'tasks' | 'local'>('sales');

  // 1. 売上・Square連携データ
  const [monthlyTarget, setMonthlyTarget] = useState<number>(500000);
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('2026-09-08 19:00');

  const [transactions, setTransactions] = useState<TransactionItem[]>([
    { id: '1', date: '2026-09-08', parentId: 'p1', parentName: '鈴木 花子', studentId: 's1', studentName: '鈴木 蓮', item: 'ジュニア体幹 4回券', amount: 16000, staff: 'TAKA', type: '回数券', campaignId: 'c1' },
    { id: '2', date: '2026-09-07', parentId: 'p2', parentName: '山田 太郎', studentId: 's2', studentName: '山田 太郎', item: 'パーソナル 8回券', amount: 64000, staff: 'NANA', type: '回数券' },
    { id: '3', date: '2026-09-05', parentId: 'p3', parentName: '佐藤 健', studentId: 's3', studentName: '佐藤 翔', item: '体験トレーニング', amount: 3000, staff: 'TAKA', type: '体験', campaignId: 'c1' },
  ]);

  // 2. 顧客カルテ（保護者＆受講生分離構造）
  const [parents, setParents] = useState<ParentProfile[]>([
    { id: 'p1', parentName: '鈴木 花子', tel: '080-9876-5432', tickets: [{ id: 't1', name: 'ジュニア体幹 4回券', total: 4, remaining: 2 }] },
    { id: 'p2', parentName: '山田 太郎', tel: '090-1234-5678', tickets: [{ id: 't2', name: 'パーソナル 8回券', total: 8, remaining: 5 }] },
    { id: 'p3', parentName: '佐藤 健', tel: '090-8888-9999', tickets: [] },
  ]);

  const [students, setStudents] = useState<StudentProfile[]>([
    {
      id: 's1',
      parentId: 'p1',
      childName: '鈴木 蓮',
      kana: 'スズキ レン',
      birthDate: '2013-05-15',
      firstLessonDate: '2026-01-10',
      lastBookingDate: '2026-08-20',
      concerns: 'サッカーの俊敏性向上・体幹ブレの改善',
      goal: '当たり負けない体幹をつける',
      memo: '長男。毎週火曜日参加。',
      sessions: [
        { id: 'se1', date: '2026-09-01', content: 'コアバランス調整 & リアクションアジリティ', homeworkContent: 'フロントプランク 30秒×3セット' }
      ],
      measurements: [
        { id: 'm1', date: '2026-01-10', weight: 41.0, bodyFat: 17.0, muscleMass: 32.0, postureImages: [], testResultImages: [] },
        { id: 'm2', date: '2026-04-10', weight: 42.0, bodyFat: 16.5, muscleMass: 33.0, postureImages: [], testResultImages: [] },
        { id: 'm3', date: '2026-07-10', weight: 43.2, bodyFat: 15.8, muscleMass: 34.1, postureImages: [], testResultImages: [] }
      ]
    },
    {
      id: 's1-2',
      parentId: 'p1',
      childName: '鈴木 陸',
      kana: 'スズキ リク',
      birthDate: '2016-08-20',
      firstLessonDate: '2026-04-01',
      lastBookingDate: '2026-09-01',
      concerns: '走歩行フォームの改善・リズム感強化',
      goal: '楽しく運動能力を上げる',
      memo: '次男。兄（蓮）のチケットを共用。',
      sessions: [],
      measurements: [
        { id: 'm4', date: '2026-04-01', weight: 28.0, bodyFat: 15.0, muscleMass: 21.0, postureImages: [], testResultImages: [] }
      ]
    }
  ]);

  const [selectedStudentId, setSelectedStudentId] = useState<string>('s1');
  const [clientSubTab, setClientSubTab] = useState<'info' | 'sessions' | 'measurements'>('info');
  const [clientSearchQuery, setClientSearchQuery] = useState<string>('');

  // 3. タスク・議事録
  const [taskSubTab, setTaskSubTab] = useState<'tasks' | 'notes'>('tasks');
  const [taskFilterMonth, setTaskFilterMonth] = useState<string>('2026-09');
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  const [tasks, setTasks] = useState<TaskItem[]>([
    { id: 'tk1', title: '秋の体幹クリニックSNS告知作成', category: 'SNS', staff: 'TAKA', dueDate: '2026-09-10', repeat: 'none', isImportant: true, status: '進行中' },
    { id: 'tk2', title: '3ヶ月測定対象者へのリマインド送付', category: '顧客フォロー', staff: 'NANA', dueDate: '2026-09-15', repeat: 'monthly', isImportant: false, status: '未着手' },
  ]);

  const [meetingNotes, setMeetingNotes] = useState<MeetingNote[]>([
    {
      id: 'c1',
      date: '2026-09-01',
      title: '秋の体験体幹キャンペーン',
      category: 'キャンペーン',
      content: '体幹測定の無料体験キャンペーン企画。SNSとチラシで集客を行う。',
      checklist: CAMPAIGN_PRESET_TASKS.map((t, idx) => ({ id: `chk_${idx}`, text: t, completed: idx === 0 }))
    }
  ]);

  // フォーム状態
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('SNS');
  const [customTaskCategory, setCustomTaskCategory] = useState('');
  const [newTaskStaff, setNewTaskStaff] = useState<'TAKA' | 'NANA'>('TAKA');
  const [newTaskDueDate, setNewTaskDueDate] = useState('2026-09-15');
  const [newTaskRepeat, setNewTaskRepeat] = useState<'none' | 'weekly' | 'monthly'>('none');
  const [newTaskImportant, setNewTaskImportant] = useState(false);

  // 議事録新規作成
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState<string>('キャンペーン');
  const [newNoteContent, setNewNoteContent] = useState('');

  // 4. 近隣情報
  const [localInfos, setLocalInfos] = useState<LocalInfoItem[]>([
    { id: 'l1', name: '板橋第一小学校', district: '板橋区', eventName: '秋季運動会', url: 'https://example.com/itabashi1', contactStaff: 'TAKA', memo: '保護者へのチラシ配布可否要確認' },
    { id: 'l2', name: '赤羽FCジュニア', district: '北区', eventName: '市民大会予選', url: 'https://example.com/akabane-fc', contactStaff: 'NANA', memo: 'コーチへ挨拶訪問予定' }
  ]);
  const [newLocalName, setNewLocalName] = useState('');
  const [newLocalDistrict, setNewLocalDistrict] = useState<'板橋区' | '北区' | 'その他'>('板橋区');
  const [newLocalEvent, setNewLocalEvent] = useState('');
  const [newLocalUrl, setNewLocalUrl] = useState('');
  const [newLocalStaff, setNewLocalStaff] = useState('TAKA');
  const [newLocalMemo, setNewLocalMemo] = useState('');

  // フォーム用（セッション＆計測）
  const [newSessionDate, setNewSessionDate] = useState('2026-09-08');
  const [newSessionContent, setNewSessionContent] = useState('');
  const [newSessionHomework, setNewSessionHomework] = useState('');
  const [newHomeworkImg, setNewHomeworkImg] = useState<string | undefined>(undefined);

  const [newMeasDate, setNewMeasDate] = useState('2026-09-08');
  const [newWeight, setNewWeight] = useState('');
  const [newBodyFat, setNewBodyFat] = useState('');
  const [newMuscleMass, setNewMuscleMass] = useState('');
  const [newPostureImgs, setNewPostureImgs] = useState<string[]>([]);
  const [newTestResultImgs, setNewTestResultImgs] = useState<string[]>([]);

  // LocalStorage 自動読み込み・保存
  useEffect(() => {
    const saved = localStorage.getItem('GOLAZO_APP_DATA_V2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.transactions) setTransactions(parsed.transactions);
        if (parsed.parents) setParents(parsed.parents);
        if (parsed.students) setStudents(parsed.students);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.meetingNotes) setMeetingNotes(parsed.meetingNotes);
        if (parsed.localInfos) setLocalInfos(parsed.localInfos);
        if (parsed.monthlyTarget) setMonthlyTarget(parsed.monthlyTarget);
      } catch (e) {
        console.error('Data load error', e);
      }
    }
  }, []);

  useEffect(() => {
    const dataToSave = {
      transactions,
      parents,
      students,
      tasks,
      meetingNotes,
      localInfos,
      monthlyTarget,
    };
    localStorage.setItem('GOLAZO_APP_DATA_V2', JSON.stringify(dataToSave));
  }, [transactions, parents, students, tasks, meetingNotes, localInfos, monthlyTarget]);

  // --- Square自動・手動同期シミュレーション ---
  const triggerSquareSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      const now = new Date();
      setLastSyncTime(`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`);
      alert('Square連携データを更新しました。最新の決済情報を反映しました。');
    }, 1200);
  };

  // --- 計算補助ロジック ---
  const calculateAge = (birthDateStr: string) => {
    if (!birthDateStr) return 0;
    const today = new Date('2026-09-08');
    const birth = new Date(birthDateStr);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const getBookingAlert = (lastBookingDateStr: string) => {
    if (!lastBookingDateStr) return null;
    const today = new Date('2026-09-08');
    const lastDate = new Date(lastBookingDateStr);
    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= 30) return { type: 'danger', text: '🚨 1ヶ月未予約' };
    if (diffDays >= 14) return { type: 'warning', text: '⚠️ 最終予約から2週間未予約' };
    return null;
  };

  const isNextMeasurementMonth = (firstLessonDateStr: string) => {
    if (!firstLessonDateStr) return false;
    const firstMonth = new Date(firstLessonDateStr).getMonth() + 1; // 1〜12
    const currentMonth = 9; // 2026-09
    const monthsDiff = (currentMonth - firstMonth + 12) % 12;
    return monthsDiff % 3 === 0;
  };

  // 顧客データ計算
  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];
  const currentParent = parents.find(p => p.id === currentStudent?.parentId);

  // 売上計算
  const filteredTxMonth = transactions.filter(t => t.date.startsWith(selectedMonth));
  const filteredTxYear = transactions.filter(t => t.date.startsWith(selectedYear));
  const todaySales = transactions.filter(t => t.date === '2026-09-08').reduce((sum, t) => sum + t.amount, 0);
  const monthlySales = filteredTxMonth.reduce((sum, t) => sum + t.amount, 0);
  const yearlySales = filteredTxYear.reduce((sum, t) => sum + t.amount, 0);
  const achievementRate = monthlyTarget > 0 ? Math.min(Math.round((monthlySales / monthlyTarget) * 100), 100) : 0;

  const takaSales = filteredTxMonth.filter(t => t.staff === 'TAKA').reduce((sum, t) => sum + t.amount, 0);
  const nanaSales = filteredTxMonth.filter(t => t.staff === 'NANA').reduce((sum, t) => sum + t.amount, 0);

  // 体験者数・コンバージョン率
  const trialTxList = filteredTxMonth.filter(t => t.type === '体験');
  const trialCount = trialTxList.length;
  const trialToTicketCount = trialTxList.filter(t => {
    return transactions.some(t2 => t2.parentId === t.parentId && t2.type === '回数券' && t2.date >= t.date);
  }).length;
  const cvRate = trialCount > 0 ? Math.round((trialToTicketCount / trialCount) * 100) : 0;

  // 画像アップロード用ヘルパー
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans p-4 md:p-6 text-slate-800">
      <main className="max-w-7xl mx-auto space-y-6">
        {/* 全体上部ナビゲーションバー */}
        <div className="bg-[#356586] px-6 py-4 rounded-2xl shadow-lg flex justify-between items-center flex-wrap gap-4 text-white">
          <div className="flex items-center gap-8">
            <span className="font-extrabold text-2xl tracking-wider uppercase">
              GYM MANAGER
            </span>
            <nav className="flex items-center gap-2 text-sm font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('sales')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  activeTab === 'sales' ? 'bg-white text-[#356586] shadow font-black' : 'text-white/80 hover:bg-white/10'
                }`}
              >
                売上管理
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('clients')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  activeTab === 'clients' ? 'bg-white text-[#356586] shadow font-black' : 'text-white/80 hover:bg-white/10'
                }`}
              >
                顧客カルテ
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('tasks')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  activeTab === 'tasks' ? 'bg-white text-[#356586] shadow font-black' : 'text-white/80 hover:bg-white/10'
                }`}
              >
                タスク・議事録
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('local')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  activeTab === 'local' ? 'bg-white text-[#356586] shadow font-black' : 'text-white/80 hover:bg-white/10'
                }`}
              >
                近隣情報
              </button>
            </nav>
          </div>

          {/* Square連携 状態 ＆ 手動更新ボタン */}
          <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl border border-white/20 text-xs">
            <div>
              <p className="text-white/70">Square連携状態: <span className="text-green-300 font-bold">自動同期中</span></p>
              <p className="text-[10px] text-white/50">最終連携: {lastSyncTime}</p>
            </div>
            <button
              onClick={triggerSquareSync}
              disabled={isSyncing}
              className="px-3 py-1.5 bg-white text-[#356586] font-extrabold rounded-lg hover:bg-slate-100 transition shadow text-xs"
            >
              {isSyncing ? '同期中...' : '手動更新'}
            </button>
          </div>
        </div>

        {/* ==========================================
            TAB 1: 売上管理画面
           ========================================== */}
        {activeTab === 'sales' && (
          <div className="space-y-6">
            {/* 売上コントロールパネル */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-4 text-xs font-bold">
                <div>
                  <label className="text-slate-400 block mb-1">表示月選択</label>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="p-2 border rounded-xl bg-slate-50 text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">表示年度選択</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="p-2 border rounded-xl bg-slate-50 text-slate-800"
                  >
                    <option value="2026">2026年度</option>
                    <option value="2025">2025年度</option>
                  </select>
                </div>
              </div>

              {/* 手動目標売上変更 */}
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-500">今月目標設定:</span>
                <input
                  type="number"
                  value={monthlyTarget}
                  onChange={(e) => setMonthlyTarget(Number(e.target.value))}
                  className="w-28 p-1 text-right font-black border rounded bg-white text-slate-800 text-sm"
                />
                <span className="text-xs font-bold text-slate-600">円</span>
              </div>
            </div>

            {/* 売上指標カード */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <p className="text-xs font-bold text-slate-400">本日の売上</p>
                <p className="text-2xl font-black text-slate-900">¥{todaySales.toLocaleString()}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <p className="text-xs font-bold text-slate-400">今月の売上 ({selectedMonth})</p>
                <p className="text-2xl font-black text-[#356586]">¥{monthlySales.toLocaleString()}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <p className="text-xs font-bold text-slate-400">年度累計売上 ({selectedYear}年)</p>
                <p className="text-2xl font-black text-slate-900">¥{yearlySales.toLocaleString()}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">目標達成率 ({achievementRate}%)</span>
                  <span className="text-[#356586]">¥{monthlySales.toLocaleString()} / ¥{monthlyTarget.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div className="bg-[#356586] h-3 rounded-full transition-all duration-500" style={{ width: `${achievementRate}%` }}></div>
                </div>
              </div>
            </div>

            {/* 担当者別・コンバージョン・体験者数 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-slate-800">担当者別売上（当月）</h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 flex justify-between items-center">
                    <span className="font-bold text-blue-900">TAKA 担当</span>
                    <span className="font-black text-[#356586] text-base">¥{takaSales.toLocaleString()}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-pink-50 border border-pink-100 flex justify-between items-center">
                    <span className="font-bold text-pink-900">NANA 担当</span>
                    <span className="font-black text-pink-700 text-base">¥{nanaSales.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-slate-800">体験者数 & 成約コンバージョン</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 bg-slate-50 rounded">
                    <span>当月体験者数:</span>
                    <span className="font-bold text-slate-900">{trialCount} 名</span>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-50 rounded">
                    <span>回数券購入（成約）:</span>
                    <span className="font-bold text-slate-900">{trialToTicketCount} 件</span>
                  </div>
                  <div className="flex justify-between p-2 bg-green-50 text-green-900 rounded font-bold">
                    <span>成約率 (CBR):</span>
                    <span>{cvRate} %</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-slate-800">キャンペーン効果と売上貢献</h3>
                {meetingNotes.filter(n => n.category === 'キャンペーン').map(camp => {
                  const campTx = filteredTxMonth.filter(t => t.campaignId === camp.id);
                  const campSales = campTx.reduce((s, t) => s + t.amount, 0);
                  return (
                    <div key={camp.id} className="p-3 bg-slate-50 border rounded-xl space-y-1 text-xs">
                      <p className="font-bold text-slate-900">{camp.title}</p>
                      <p className="text-slate-500">適用件数: {campTx.length}件</p>
                      <p className="font-black text-[#356586]">売上貢献額: ¥{campSales.toLocaleString()}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 購入明細テーブル */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">購入日・商品・保護者/受講者 明細一覧</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b font-bold">
                      <th className="p-3">購入日</th>
                      <th className="p-3">保護者名 (Square)</th>
                      <th className="p-3">受講者 (子供名)</th>
                      <th className="p-3">購入商品</th>
                      <th className="p-3">種別</th>
                      <th className="p-3">担当</th>
                      <th className="p-3 text-right">金額</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredTxMonth.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-medium text-slate-600">{t.date}</td>
                        <td className="p-3 font-bold text-slate-900">{t.parentName}</td>
                        <td className="p-3 text-slate-700">{t.studentName || '—'}</td>
                        <td className="p-3 font-semibold text-slate-800">{t.item}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-600">{t.type}</span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.staff === 'TAKA' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>
                            {t.staff}
                          </span>
                        </td>
                        <td className="p-3 text-right font-black text-slate-900">¥{t.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 2: 顧客カルテ画面
           ========================================== */}
        {activeTab === 'clients' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center flex-wrap gap-4">
              <div className="w-full md:w-auto">
                <input
                  type="text"
                  placeholder="キーワードで顧客・保護者・悩みを検索..."
                  value={clientSearchQuery}
                  onChange={(e) => setClientSearchQuery(e.target.value)}
                  className="w-full md:w-80 p-2.5 border rounded-xl text-xs bg-slate-50"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setClientSubTab('info')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold ${clientSubTab === 'info' ? 'bg-[#356586] text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  基本情報・チケット
                </button>
                <button
                  onClick={() => setClientSubTab('sessions')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold ${clientSubTab === 'sessions' ? 'bg-[#356586] text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  セッション・宿題記録
                </button>
                <button
                  onClick={() => setClientSubTab('measurements')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold ${clientSubTab === 'measurements' ? 'bg-[#356586] text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  3ヶ月定期測定詳細
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 受講生・子供リスト */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-slate-900">受講生一覧（兄弟個別管理）</h3>
                <div className="space-y-3">
                  {students
                    .filter(s =>
                      s.childName.includes(clientSearchQuery) ||
                      s.kana.includes(clientSearchQuery) ||
                      s.concerns.includes(clientSearchQuery)
                    )
                    .map(s => {
                      const parent = parents.find(p => p.id === s.parentId);
                      const alert = getBookingAlert(s.lastBookingDate);
                      const isSelected = s.id === selectedStudentId;

                      return (
                        <div
                          key={s.id}
                          onClick={() => setSelectedStudentId(s.id)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all space-y-1 ${
                            isSelected ? 'border-blue-500 bg-blue-50/40' : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-slate-900">{s.childName}</span>
                            <span className="text-xs font-bold text-[#356586]">{calculateAge(s.birthDate)} 歳</span>
                          </div>
                          <p className="text-xs text-slate-500">保護者: {parent?.parentName || '未登録'}</p>
                          {alert && (
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              alert.type === 'danger' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {alert.text}
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* 右側詳細エリア */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 lg:col-span-2">
                {/* ヘッダー情報 */}
                <div className="flex justify-between items-start border-b pb-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">
                      {currentStudent.childName} <span className="text-sm text-slate-400 font-medium">({currentStudent.kana})</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      保護者名 (Square連携): <span className="font-bold text-slate-800">{currentParent?.parentName}</span> / TEL: {currentParent?.tel}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="px-3 py-1 bg-blue-100 text-[#356586] text-xs font-bold rounded-full inline-block">
                      初回レッスン日: {currentStudent.firstLessonDate}
                    </span>
                    <p className="text-[10px] text-slate-400">最新自動計算年齢: {calculateAge(currentStudent.birthDate)}歳</p>
                  </div>
                </div>

                {/* 1. 基本情報・チケット共有管理 */}
                {clientSubTab === 'info' && (
                  <div className="space-y-6 text-xs">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                      <h4 className="font-bold text-slate-900 text-sm">保護者保有 回数券チケット進捗（兄弟共用）</h4>
                      {currentParent?.tickets.length ? (
                        currentParent.tickets.map(t => (
                          <div key={t.id} className="p-3 bg-white rounded-lg border space-y-1">
                            <div className="flex justify-between font-bold">
                              <span>{t.name}</span>
                              <span className="text-[#356586]">残り {t.remaining} / {t.total} 回</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full">
                              <div className="bg-[#356586] h-2 rounded-full" style={{ width: `${(t.remaining/t.total)*100}%` }}></div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-400">有効な回数券はありません</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-900 text-sm">手動編集可能な基本カルテメモ</h4>
                      <div className="space-y-2">
                        <label className="block text-slate-500">悩み・課題</label>
                        <textarea
                          value={currentStudent.concerns}
                          onChange={(e) => {
                            const val = e.target.value;
                            setStudents(students.map(s => s.id === currentStudent.id ? { ...s, concerns: val } : s));
                          }}
                          className="w-full p-2 border rounded-xl bg-slate-50 text-xs"
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-slate-500">目標</label>
                        <textarea
                          value={currentStudent.goal}
                          onChange={(e) => {
                            const val = e.target.value;
                            setStudents(students.map(s => s.id === currentStudent.id ? { ...s, goal: val } : s));
                          }}
                          className="w-full p-2 border rounded-xl bg-slate-50 text-xs"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. セッション記録＆宿題アップロード */}
                {clientSubTab === 'sessions' && (
                  <div className="space-y-6 text-xs">
                    {/* 新規セッション入力 */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <h4 className="font-bold text-slate-900 text-sm">新規セッションの記録</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-500 mb-1">実施日</label>
                          <input type="date" value={newSessionDate} onChange={(e) => setNewSessionDate(e.target.value)} className="w-full p-2 border rounded-lg bg-white" />
                        </div>
                        <div>
                          <label className="block text-slate-500 mb-1">トレーニング内容</label>
                          <input type="text" value={newSessionContent} onChange={(e) => setNewSessionContent(e.target.value)} placeholder="例: アジリティ & 体幹強化" className="w-full p-2 border rounded-lg bg-white" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1">宿題内容</label>
                        <input type="text" value={newSessionHomework} onChange={(e) => setNewSessionHomework(e.target.value)} placeholder="例: プランク 30秒×3セット" className="w-full p-2 border rounded-lg bg-white" />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1">宿題画像アップロード</label>
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setNewHomeworkImg)} className="w-full text-slate-500" />
                        {newHomeworkImg && (
                          <img src={newHomeworkImg} alt="Preview" className="h-20 mt-2 rounded border object-cover" />
                        )}
                      </div>
                      <button
                        onClick={() => {
                          if (!newSessionContent) return;
                          const newSess: SessionRecord = {
                            id: Date.now().toString(),
                            date: newSessionDate,
                            content: newSessionContent,
                            homeworkContent: newSessionHomework,
                            homeworkImage: newHomeworkImg
                          };
                          setStudents(students.map(s => s.id === currentStudent.id ? { ...s, sessions: [newSess, ...s.sessions] } : s));
                          setNewSessionContent('');
                          setNewSessionHomework('');
                          setNewHomeworkImg(undefined);
                        }}
                        className="px-4 py-2 bg-[#356586] text-white font-bold rounded-lg shadow-sm"
                      >
                        セッション記録を保存
                      </button>
                    </div>

                    {/* セッション履歴 */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-900 text-sm">時系列セッション履歴</h4>
                      {currentStudent.sessions.map(s => (
                        <div key={s.id} className="p-3 border rounded-xl space-y-1 bg-white">
                          <div className="flex justify-between font-bold text-slate-700">
                            <span>{s.date}</span>
                          </div>
                          <p className="text-slate-900 font-semibold">{s.content}</p>
                          {s.homeworkContent && <p className="text-slate-500">宿題: {s.homeworkContent}</p>}
                          {s.homeworkImage && <img src={s.homeworkImage} alt="Homework" className="h-24 rounded border mt-2 object-cover" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. 3ヶ月測定詳細タブ */}
                {clientSubTab === 'measurements' && (
                  <div className="space-y-6 text-xs">
                    {/* 3ヶ月通知ハイライト */}
                    {isNextMeasurementMonth(currentStudent.firstLessonDate) && (
                      <div className="p-3 bg-purple-100 border border-purple-300 text-purple-900 font-bold rounded-xl flex items-center gap-2">
                        <span>🎯 今月は3ヶ月測定の対象月です！定期測定を実施してください。</span>
                      </div>
                    )}

                    {/* 測定履歴・変化量自動算出 */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-900 text-sm">数値変化の自動算出 & 比較推移</h4>
                      <table className="w-full text-left border">
                        <thead>
                          <tr className="bg-slate-50 border-b font-bold text-slate-500">
                            <th className="p-2">計測日</th>
                            <th className="p-2">体重 (kg)</th>
                            <th className="p-2">体脂肪率 (%)</th>
                            <th className="p-2">筋肉量 (kg)</th>
                            <th className="p-2">初回からの増減</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {currentStudent.measurements.map((m, idx) => {
                            const first = currentStudent.measurements[0];
                            const diffWeight = (m.weight - first.weight).toFixed(1);
                            const diffFat = (m.bodyFat - first.bodyFat).toFixed(1);

                            return (
                              <tr key={m.id}>
                                <td className="p-2 font-bold text-slate-900">{m.date}</td>
                                <td className="p-2 font-black text-[#356586]">{m.weight} kg</td>
                                <td className="p-2">{m.bodyFat} %</td>
                                <td className="p-2">{m.muscleMass} kg</td>
                                <td className="p-2">
                                  <span className={`font-bold ${Number(diffWeight) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    体重 {Number(diffWeight) >= 0 ? `+${diffWeight}` : diffWeight}kg
                                  </span>
                                  {' / '}
                                  <span className={`font-bold ${Number(diffFat) <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    体脂肪 {Number(diffFat) >= 0 ? `+${diffFat}` : diffFat}%
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 3: タスク・議事録画面
           ========================================== */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex gap-2">
                <button
                  onClick={() => setTaskSubTab('tasks')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold ${taskSubTab === 'tasks' ? 'bg-[#356586] text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  タスク管理
                </button>
                <button
                  onClick={() => setTaskSubTab('notes')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold ${taskSubTab === 'notes' ? 'bg-[#356586] text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  ミーティング議事録（プリセット自動展開）
                </button>
              </div>
              <input
                type="text"
                placeholder="全体キーワード検索..."
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                className="p-2 border rounded-xl text-xs bg-slate-50 w-64"
              />
            </div>

            {taskSubTab === 'tasks' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
                {/* タスク追加フォーム */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h3 className="font-bold text-slate-900 text-sm">新規タスク登録</h3>
                  <div>
                    <label className="block text-slate-500 mb-1">内容</label>
                    <input type="text" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50" />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">担当者</label>
                    <select value={newTaskStaff} onChange={(e) => setNewTaskStaff(e.target.value as any)} className="w-full p-2 border rounded-lg bg-slate-50">
                      <option value="TAKA">TAKA (青)</option>
                      <option value="NANA">NANA (ピンク)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">期日</label>
                    <input type="date" value={newTaskDueDate} onChange={(e) => setNewTaskDueDate(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50" />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">繰り返し</label>
                    <select value={newTaskRepeat} onChange={(e) => setNewTaskRepeat(e.target.value as any)} className="w-full p-2 border rounded-lg bg-slate-50">
                      <option value="none">なし</option>
                      <option value="weekly">毎週</option>
                      <option value="monthly">毎月</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <input type="checkbox" id="imp" checked={newTaskImportant} onChange={(e) => setNewTaskImportant(e.target.checked)} />
                    <label htmlFor="imp" className="font-bold text-red-600">🚨 重要フラグを設定する</label>
                  </div>
                  <button
                    onClick={() => {
                      if (!newTaskTitle) return;
                      const newT: TaskItem = {
                        id: Date.now().toString(),
                        title: newTaskTitle,
                        category: newTaskCategory === 'その他' ? customTaskCategory : newTaskCategory,
                        staff: newTaskStaff,
                        dueDate: newTaskDueDate,
                        repeat: newTaskRepeat,
                        isImportant: newTaskImportant,
                        status: '未着手'
                      };
                      setTasks([...tasks, newT]);
                      setNewTaskTitle('');
                    }}
                    className="w-full py-2.5 bg-[#356586] text-white font-bold rounded-xl shadow-sm mt-2"
                  >
                    タスクを登録
                  </button>
                </div>

                {/* タスク一覧 */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 lg:col-span-2">
                  <h3 className="font-bold text-slate-900 text-sm">タスク一覧 & 進捗管理</h3>
                  <div className="space-y-2">
                    {tasks
                      .filter(t => t.title.includes(globalSearchQuery))
                      .map(t => (
                        <div
                          key={t.id}
                          className={`p-3 border rounded-xl flex items-center justify-between ${
                            t.isImportant ? 'bg-red-50 border-red-200' : 'bg-white'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.staff === 'TAKA' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>
                                {t.staff}
                              </span>
                              {t.isImportant && <span className="text-red-600 font-bold text-[10px]">🚨 重要</span>}
                              <span className="font-bold text-slate-900 text-sm">{t.title}</span>
                            </div>
                            <p className="text-[10px] text-slate-400">期日: {t.dueDate} / カテゴリ: {t.category}</p>
                          </div>
                          <select
                            value={t.status}
                            onChange={(e) => {
                              const st = e.target.value as TaskStatus;
                              setTasks(tasks.map(tk => tk.id === t.id ? { ...tk, status: st } : tk));
                            }}
                            className="p-1 border rounded font-bold text-xs bg-slate-50"
                          >
                            <option value="未着手">未着手</option>
                            <option value="進行中">進行中</option>
                            <option value="完了">完了</option>
                          </select>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              /* 議事録・プリセット自動タスク展開 */
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-xs">
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-sm">新規議事録の作成（定型タスク自動展開）</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="タイトル" value={newNoteTitle} onChange={(e) => setNewNoteTitle(e.target.value)} className="p-2 border rounded-lg bg-white" />
                    <select value={newNoteCategory} onChange={(e) => setNewNoteCategory(e.target.value)} className="p-2 border rounded-lg bg-white">
                      <option value="キャンペーン">キャンペーン（定型タスク展開）</option>
                      <option value="週MT">週MT</option>
                      <option value="月MT">月MT</option>
                      <option value="その他">その他</option>
                    </select>
                  </div>
                  <textarea placeholder="内容・決定事項" value={newNoteContent} onChange={(e) => setNewNoteContent(e.target.value)} className="w-full p-2 border rounded-lg bg-white" rows={2} />
                  <button
                    onClick={() => {
                      if (!newNoteTitle) return;
                      const newN: MeetingNote = {
                        id: Date.now().toString(),
                        date: '2026-09-08',
                        title: newNoteTitle,
                        category: newNoteCategory,
                        content: newNoteContent,
                        checklist: newNoteCategory === 'キャンペーン' ? CAMPAIGN_PRESET_TASKS.map((t, idx) => ({ id: `c_${idx}`, text: t, completed: false })) : []
                      };
                      setMeetingNotes([newN, ...meetingNotes]);
                      setNewNoteTitle('');
                      setNewNoteContent('');
                    }}
                    className="px-4 py-2 bg-[#356586] text-white font-bold rounded-lg"
                  >
                    議事録を保存 & 定型タスクを展開
                  </button>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm">議事録一覧</h3>
                  {meetingNotes.map(n => (
                    <div key={n.id} className="p-4 border rounded-xl space-y-2 bg-white">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-slate-900 text-sm">{n.title}</span>
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-[10px]">{n.category}</span>
                      </div>
                      <p className="text-slate-600">{n.content}</p>
                      {n.checklist && n.checklist.length > 0 && (
                        <div className="mt-2 pt-2 border-t space-y-1">
                          <p className="font-bold text-slate-500 text-[10px]">自動展開チェックリスト:</p>
                          {n.checklist.map(chk => (
                            <div key={chk.id} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={chk.completed}
                                onChange={(e) => {
                                  const updated = meetingNotes.map(note => {
                                    if (note.id === n.id) {
                                      const newChk = note.checklist?.map(c => c.id === chk.id ? { ...c, completed: e.target.checked } : c);
                                      return { ...note, checklist: newChk };
                                    }
                                    return note;
                                  });
                                  setMeetingNotes(updated);
                                }}
                              />
                              <span className={chk.completed ? 'line-through text-slate-400' : 'text-slate-800'}>{chk.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            TAB 4: 近隣情報画面
           ========================================== */}
        {activeTab === 'local' && (
          <div className="space-y-6 text-xs">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">近隣学校・スポーツチーム・イベント情報追加</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <input type="text" placeholder="学校・チーム名" value={newLocalName} onChange={(e) => setNewLocalName(e.target.value)} className="p-2 border rounded-lg bg-slate-50" />
                <select value={newLocalDistrict} onChange={(e) => setNewLocalDistrict(e.target.value as any)} className="p-2 border rounded-lg bg-slate-50">
                  <option value="板橋区">板橋区</option>
                  <option value="北区">北区</option>
                  <option value="その他">その他</option>
                </select>
                <input type="text" placeholder="イベント名" value={newLocalEvent} onChange={(e) => setNewLocalEvent(e.target.value)} className="p-2 border rounded-lg bg-slate-50" />
                <input type="text" placeholder="詳細URL" value={newLocalUrl} onChange={(e) => setNewLocalUrl(e.target.value)} className="p-2 border rounded-lg bg-slate-50" />
              </div>
              <textarea placeholder="メモ" value={newLocalMemo} onChange={(e) => setNewLocalMemo(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50" rows={2} />
              <button
                onClick={() => {
                  if (!newLocalName) return;
                  const newL: LocalInfoItem = {
                    id: Date.now().toString(),
                    name: newLocalName,
                    district: newLocalDistrict,
                    eventName: newLocalEvent,
                    url: newLocalUrl,
                    contactStaff: newLocalStaff,
                    memo: newLocalMemo
                  };
                  setLocalInfos([...localInfos, newL]);
                  setNewLocalName('');
                  setNewLocalEvent('');
                  setNewLocalUrl('');
                  setNewLocalMemo('');
                }}
                className="px-4 py-2 bg-[#356586] text-white font-bold rounded-lg shadow-sm"
              >
                情報を追加
              </button>
            </div>

            {/* 近隣情報一覧 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">集約情報リスト</h3>
              <table className="w-full text-left border border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b font-bold text-slate-500">
                    <th className="p-3">区分</th>
                    <th className="p-3">施設・チーム名</th>
                    <th className="p-3">イベント・概要</th>
                    <th className="p-3">担当</th>
                    <th className="p-3">URL</th>
                    <th className="p-3">メモ</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {localInfos.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="p-3"><span className="px-2 py-0.5 bg-blue-100 text-[#356586] font-bold rounded">{item.district}</span></td>
                      <td className="p-3 font-bold text-slate-900">{item.name}</td>
                      <td className="p-3 text-slate-700">{item.eventName}</td>
                      <td className="p-3"><span className="font-bold text-slate-600">{item.contactStaff}</span></td>
                      <td className="p-3">
                        {item.url && <a href={item.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">リンク</a>}
                      </td>
                      <td className="p-3 text-slate-500">{item.memo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
