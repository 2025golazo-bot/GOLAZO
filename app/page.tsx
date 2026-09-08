'use client';

import { useState } from 'react';

// ==========================================
// --- 型定義 ---
// ==========================================

// 1. 売上・カルテ用型定義 (既存維持)
interface TransactionItem {
  id: string;
  date: string;
  client: string;
  item: string;
  amount: number;
  staff: 'TAKA' | 'NANA';
  type: '回数券' | '物販' | '体験';
  campaign?: string;
}

interface TicketProgress {
  id: string;
  client: string;
  name: string;
  total: number;
  remaining: number;
}

interface TrialClient {
  id: string;
  date: string;
  name: string;
  age: number;
  staff: 'TAKA' | 'NANA';
  converted: boolean;
}

interface SessionRecord {
  id: string;
  date: string;
  content: string;
  homeworkContent: string;
  homeworkImage?: string;
}

interface MeasurementRecord {
  id: string;
  date: string;
  weight: number;
  bodyFat: number;
  muscleMass: number;
  postureImages: string[];
}

interface ClientProfile {
  id: string;
  parentName: string;
  childName: string;
  kana: string;
  birthDate: string;
  firstLessonDate: string;
  lastBookingDate: string;
  concerns: string;
  goal: string;
  memo: string;
  tickets: { name: string; total: number; remaining: number }[];
  sessions: SessionRecord[];
  measurements: MeasurementRecord[];
}

// 2. 新規機能用型定義
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
  category: string;
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

interface VendorItem {
  id: string;
  name: string;
  usageDetail: string;
  contactStaff: string;
  url: string;
  memo: string;
}

export default function IntegratedApp() {
  // メインタブ ('transactions' | 'clients' | 'tasks' | 'local' | 'vendors')
  const [activeTab, setActiveTab] = useState<'transactions' | 'clients' | 'tasks' | 'local' | 'vendors'>('transactions');

  // --- 共通: Squareデータ手動同期 ---
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string>('Squareデータ連携中');

  const handleSquareSync = () => {
    setIsSyncing(true);
    setSyncMessage('Squareから同期中...');
    setTimeout(() => {
      setIsSyncing(false);
      setSyncMessage('同期完了 (最新)');
    }, 1000);
  };

  // ==========================================
  // --- 1. 売上管理の状態 (既存維持) ---
  // ==========================================
  const [monthlyTarget, setMonthlyTarget] = useState<number>(500000);
  const [isEditingTarget, setIsEditingTarget] = useState<boolean>(false);
  const [tempTarget, setTempTarget] = useState<string>(monthlyTarget.toString());
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');
  const [selectedYear, setSelectedYear] = useState<string>('2026');

  const [transactions] = useState<TransactionItem[]>([
    { id: '1', date: '2026-09-08', client: '鈴木 蓮', item: 'ジュニア体幹 4回券', amount: 16000, staff: 'TAKA', type: '回数券', campaign: '夏休みキャンペーン' },
    { id: '2', date: '2026-09-07', client: '山田 太郎', item: 'パーソナル 8回券', amount: 64000, staff: 'NANA', type: '回数券' },
    { id: '3', date: '2026-09-05', client: '佐藤 花子', item: 'プロテイン', amount: 4500, staff: 'TAKA', type: '物販' },
    { id: '4', date: '2026-04-02', client: '高橋 一郎', item: '体験トレーニング', amount: 3000, staff: 'TAKA', type: '体験', campaign: 'SNS初回特典' },
  ]);

  // ==========================================
  // --- 2. 顧客カルテの状態 (既存維持) ---
  // ==========================================
  const [clients, setClients] = useState<ClientProfile[]>([
    {
      id: 'c1',
      parentName: '鈴木 健一',
      childName: '鈴木 蓮',
      kana: 'スズキ レン',
      birthDate: '2014-05-15',
      firstLessonDate: '2026-03-10',
      lastBookingDate: '2026-09-01',
      concerns: '姿勢の猫背、走る時のバランス',
      goal: 'サッカーで当たり負けない体幹をつける',
      memo: '毎週火曜日がお気に入り。宿題の体幹トレーニングも真面目に実施中。',
      tickets: [{ name: 'ジュニア体幹 4回券', total: 4, remaining: 1 }],
      sessions: [
        { id: 's1', date: '2026-09-01', content: 'コアバランス調整 & リアクションアジリティ', homeworkContent: 'フロントプランク 30秒×3セット', homeworkImage: '' }
      ],
      measurements: [
        { id: 'm1', date: '2026-03-10', weight: 32.5, bodyFat: 18.2, muscleMass: 25.1, postureImages: [] },
        { id: 'm2', date: '2026-06-10', weight: 33.8, bodyFat: 17.5, muscleMass: 26.3, postureImages: [] }
      ]
    },
    {
      id: 'c2',
      parentName: '山田 美香',
      childName: '山田 太郎',
      kana: 'ヤマダ タロウ',
      birthDate: '2012-11-20',
      firstLessonDate: '2026-01-15',
      lastBookingDate: '2026-08-08',
      concerns: '柔軟性の向上、股関節の硬さ',
      goal: 'レギュラー定着とケガ予防',
      memo: '少し恥ずかしがり屋だが集中力は高い。',
      tickets: [{ name: 'パーソナル 8回券', total: 8, remaining: 5 }],
      sessions: [
        { id: 's2', date: '2026-08-08', content: '股関節モビリティと下半身安定トレーニング', homeworkContent: '股関節ストレッチ毎日10分', homeworkImage: '' }
      ],
      measurements: [
        { id: 'm3', date: '2026-01-15', weight: 40.0, bodyFat: 20.0, muscleMass: 30.0, postureImages: [] }
      ]
    }
  ]);

  const [selectedClientId, setSelectedClientId] = useState<string>('c1');
  const [clientSubTab, setClientSubTab] = useState<'info' | 'sessions' | 'measurements'>('info');
  const [clientSearchQuery, setClientSearchQuery] = useState<string>('');

  const [newSessionDate, setNewSessionDate] = useState('2026-09-08');
  const [newSessionContent, setNewSessionContent] = useState('');
  const [newSessionHomework, setNewSessionHomework] = useState('');
  const [newSessionImagePreview, setNewSessionImagePreview] = useState<string>('');

  const [newMeasDate, setNewMeasDate] = useState('2026-09-08');
  const [newWeight, setNewWeight] = useState<string>('');
  const [newBodyFat, setNewBodyFat] = useState<string>('');
  const [newMuscleMass, setNewMuscleMass] = useState<string>('');

  // ==========================================
  // --- 3. タスク・議事録の状態 ---
  // ==========================================
  const [taskSubTab, setTaskSubTab] = useState<'tasks' | 'notes'>('tasks');
  const [taskMonthFilter, setTaskMonthFilter] = useState<string>('2026-09');
  const [taskGlobalSearch, setTaskGlobalSearch] = useState<string>('');
  const [taskViewMode, setTaskViewMode] = useState<'list' | 'calendar'>('list');

  const [tasks, setTasks] = useState<TaskItem[]>([
    { id: '1', title: 'ジュニア体幹クリニックの告知Instagram投稿作成', category: 'SNS', staff: 'TAKA', dueDate: '2026-09-10', repeat: 'none', isImportant: true, status: '進行中' },
    { id: '2', title: '3ヶ月定期計測の対象者への連絡', category: '顧客フォロー', staff: 'NANA', dueDate: '2026-09-12', repeat: 'monthly', isImportant: false, status: '未着手' },
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('SNS');
  const [customTaskCategory, setCustomTaskCategory] = useState('');
  const [newTaskStaff, setNewTaskStaff] = useState<'TAKA' | 'NANA'>('TAKA');
  const [newTaskDueDate, setNewTaskDueDate] = useState('2026-09-10');
  const [newTaskRepeat, setNewTaskRepeat] = useState<'none' | 'weekly' | 'monthly'>('none');
  const [newTaskImportant, setNewTaskImportant] = useState(false);

  // 議事録
  const [meetingNotes, setMeetingNotes] = useState<MeetingNote[]>([
    {
      id: '1',
      date: '2026-09-01',
      title: '9月秋の体幹体験キャンペーンMT',
      category: 'キャンペーン',
      content: 'ターゲット：近隣小学生。特典：体験料無料＆ボトルプレゼント。',
      checklist: [
        { id: 'chk1', text: 'レジ設定', completed: true },
        { id: 'chk2', text: 'SNS告知準備', completed: false },
        { id: 'chk3', text: 'チラシ準備', completed: false }
      ]
    }
  ]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState('キャンペーン');
  const [customNoteCategory, setCustomNoteCategory] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');

  const campaignPresetTasks = [
    'レジ設定', 'SNS告知準備', 'SNS投稿予約', 'チラシ準備', 'チラシ掲示', '報告書作成'
  ];

  // ==========================================
  // --- 4. 近隣情報の状態 ---
  // ==========================================
  const [localInfos, setLocalInfos] = useState<LocalInfoItem[]>([
    { id: 'l1', name: '板橋第一小学校', district: '板橋区', eventName: '秋季運動会', url: 'https://example.com/itabashi1', contactStaff: 'TAKA', memo: '保護者へのチラシ配布可否要確認' },
    { id: 'l2', name: '赤羽FCジュニア', district: '北区', eventName: '市民大会予選', url: 'https://example.com/akabane-fc', contactStaff: 'NANA', memo: 'コーチへ挨拶訪問予定' }
  ]);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [newLocalName, setNewLocalName] = useState('');
  const [newLocalDistrict, setNewLocalDistrict] = useState<'板橋区' | '北区' | 'その他'>('板橋区');
  const [newLocalEvent, setNewLocalEvent] = useState('');
  const [newLocalUrl, setNewLocalUrl] = useState('');
  const [newLocalStaff, setNewLocalStaff] = useState('TAKA');
  const [newLocalMemo, setNewLocalMemo] = useState('');

  // ==========================================
  // --- 5. 取引一覧（業者・設備）の状態 ---
  // ==========================================
  const [vendors, setVendors] = useState<VendorItem[]>([
    { id: 'v1', name: '株式会社フィットネス機器', usageDetail: '体幹測定マシン・保守メンテ', contactStaff: '山田太郎', url: 'https://example.com/vendor1', memo: '年1回の定期点検契約中（10月実施予定）' },
    { id: 'v2', name: 'Square決済サービス', usageDetail: 'キャッシュレス決済・POSシステム', contactStaff: 'カスタマーサポート', url: 'https://squareup.com', memo: 'カード決済手数料 3.25%' }
  ]);
  const [vendorSearchQuery, setVendorSearchQuery] = useState('');
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorUsage, setNewVendorUsage] = useState('');
  const [newVendorStaff, setNewVendorStaff] = useState('');
  const [newVendorUrl, setNewVendorUrl] = useState('');
  const [newVendorMemo, setNewVendorMemo] = useState('');

  // ==========================================
  // --- ロジック・計算関数 (既存維持) ---
  // ==========================================
  const calculateAge = (birthDateStr: string) => {
    if (!birthDateStr) return 0;
    const today = new Date('2026-09-08');
    const birth = new Date(birthDateStr);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const getAlertStatus = (lastBookingDateStr: string) => {
    if (!lastBookingDateStr) return null;
    const today = new Date('2026-09-08');
    const lastDate = new Date(lastBookingDateStr);
    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= 30) return { type: 'danger', text: '🚨 1ヶ月未予約' };
    if (diffDays >= 14) return { type: 'warning', text: '⚠️ 最終予約から2週間未予約' };
    return null;
  };

  const getNextMeasurementInfo = (firstDateStr: string) => {
    if (!firstDateStr) return { targetMonthsText: '未設定', isTargetMonthNow: false };
    const firstMonth = new Date(firstDateStr).getMonth() + 1;
    const targetMonths = [firstMonth, (firstMonth + 2) % 12 || 12, (firstMonth + 5) % 12 || 12, (firstMonth + 8) % 12 || 12].sort((a, b) => a - b);
    return {
      targetMonthsText: targetMonths.map(m => `${m}月`).join(' / '),
      isTargetMonthNow: targetMonths.includes(9)
    };
  };

  const filteredByMonth = transactions.filter(t => t.date.startsWith(selectedMonth));
  const filteredByYear = transactions.filter(t => t.date.startsWith(selectedYear));
  const monthlySales = filteredByMonth.reduce((sum, t) => sum + t.amount, 0);
  const yearlySales = filteredByYear.reduce((sum, t) => sum + t.amount, 0);
  const achievementRate = monthlyTarget > 0 ? Math.min(Math.round((monthlySales / monthlyTarget) * 100), 100) : 0;
  const todaySales = transactions.filter(t => t.date === '2026-09-08').reduce((sum, t) => sum + t.amount, 0);
  const takaSales = filteredByMonth.filter(t => t.staff === 'TAKA').reduce((sum, t) => sum + t.amount, 0);
  const nanaSales = filteredByMonth.filter(t => t.staff === 'NANA').reduce((sum, t) => sum + t.amount, 0);

  const currentClient = clients.find(c => c.id === selectedClientId) || clients[0];
  const searchedClients = clients.filter(c =>
    c.childName.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
    c.parentName.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
    c.kana.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
    c.concerns.toLowerCase().includes(clientSearchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* 最上部：グローバルナビゲーションバー（ブランドカラー #5e9bc4） */}
      <header className="bg-[#5e9bc4] text-white px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-8">
          <span className="font-bold text-lg tracking-wider border-r border-white/20 pr-6">GYM MANAGER</span>
          <nav className="flex items-center gap-2 text-sm font-medium">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${activeTab === 'transactions' ? 'bg-[#FFE8AB] text-[#335570] font-bold shadow-sm' : 'text-blue-50 hover:bg-white/10'}`}
            >
              売上管理
            </button>
            <button
              onClick={() => setActiveTab('clients')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${activeTab === 'clients' ? 'bg-[#FFE8AB] text-[#335570] font-bold shadow-sm' : 'text-blue-50 hover:bg-white/10'}`}
            >
              顧客カルテ
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${activeTab === 'tasks' ? 'bg-[#FFE8AB] text-[#335570] font-bold shadow-sm' : 'text-blue-50 hover:bg-white/10'}`}
            >
              タスク・議事録
            </button>
            <button
              onClick={() => setActiveTab('local')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${activeTab === 'local' ? 'bg-[#FFE8AB] text-[#335570] font-bold shadow-sm' : 'text-blue-50 hover:bg-white/10'}`}
            >
              近隣情報
            </button>
            <button
              onClick={() => setActiveTab('vendors')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${activeTab === 'vendors' ? 'bg-[#FFE8AB] text-[#335570] font-bold shadow-sm' : 'text-blue-50 hover:bg-white/10'}`}
            >
              取引一覧
            </button>
          </nav>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-8">
        {/* コンテンツエリア内サブヘッダー */}
        <div className="bg-white px-6 py-4 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="font-black text-gray-900 text-lg">GYM MANAGER</span>
            <span className="text-xs font-bold text-[#5e9bc4] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              {activeTab === 'transactions' && '売上管理'}
              {activeTab === 'clients' && '顧客カルテ'}
              {activeTab === 'tasks' && 'タスク・議事録管理'}
              {activeTab === 'local' && '近隣地域情報情報'}
              {activeTab === 'vendors' && '取引先・設備業者管理'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 bg-blue-50 text-[#5e9bc4] font-bold rounded-lg text-xs border border-blue-100">
              {syncMessage}
            </span>
            <button
              onClick={handleSquareSync}
              disabled={isSyncing}
              className="px-3.5 py-1.5 bg-gray-900 text-white font-bold rounded-lg text-xs hover:bg-gray-800 transition-all shadow-sm"
            >
              {isSyncing ? '同期中...' : 'Squareデータ手動更新'}
            </button>
          </div>
        </div>

        {/* ==========================================
            PAGE 1: 売上管理画面 (既存維持)
           ========================================== */}
        {activeTab === 'transactions' && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-4 text-xs font-bold">
                <div>
                  <label className="text-gray-400 block mb-1">表示月選択</label>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="p-2 border rounded-xl bg-gray-50 text-gray-800"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">表示年度選択</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="p-2 border rounded-xl bg-gray-50 text-gray-800"
                  >
                    <option value="2026">2026年度</option>
                    <option value="2025">2025年度</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-400">年間売上 ({selectedYear}年)</p>
                  <p className="text-xl font-black text-gray-900">¥{yearlySales.toLocaleString()}</p>
                </div>
                <div className="h-8 w-px bg-gray-200"></div>
                <div>
                  <div className="flex justify-between items-center text-xs font-bold gap-4">
                    <span className="text-gray-400">今月目標設定</span>
                    {isEditingTarget ? (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={tempTarget}
                          onChange={(e) => setTempTarget(e.target.value)}
                          className="w-24 p-1 border rounded text-right text-xs"
                        />
                        <button
                          onClick={() => {
                            setMonthlyTarget(Number(tempTarget) || 0);
                            setIsEditingTarget(false);
                          }}
                          className="px-2 py-0.5 bg-[#5e9bc4] text-white rounded text-[10px]"
                        >
                          保存
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsEditingTarget(true)}
                        className="text-[#5e9bc4] hover:underline"
                      >
                        ¥{monthlyTarget.toLocaleString()} (変更)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
                <p className="text-xs font-bold text-gray-400">本日の売上</p>
                <p className="text-2xl font-black text-gray-900">¥{todaySales.toLocaleString()}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
                <p className="text-xs font-bold text-gray-400">今月の売上 ({selectedMonth})</p>
                <p className="text-2xl font-black text-[#5e9bc4]">¥{monthlySales.toLocaleString()}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
                <p className="text-xs font-bold text-gray-400">体験者数 / 回数券販売</p>
                <p className="text-xl font-bold text-gray-900">{filteredByMonth.filter(t => t.type === '体験').length}名 <span className="text-xs text-gray-400 font-normal">/</span> {filteredByMonth.filter(t => t.type === '回数券').length}件</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-gray-400">月間目標達成率</span>
                  <span className="text-[#5e9bc4]">{achievementRate}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="bg-[#5e9bc4] h-2.5 rounded-full transition-all duration-500" style={{ width: `${achievementRate}%` }}></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 lg:col-span-2">
                <h2 className="text-base font-bold text-gray-900">購入・売上トランザクション明細</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b text-gray-400 font-bold bg-gray-50">
                        <th className="p-3">日付</th>
                        <th className="p-3">顧客名</th>
                        <th className="p-3">購入内容</th>
                        <th className="p-3">種別</th>
                        <th className="p-3">担当</th>
                        <th className="p-3 text-right">金額</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredByMonth.map(t => (
                        <tr key={t.id} className="hover:bg-gray-50/50">
                          <td className="p-3 text-gray-500">{t.date}</td>
                          <td className="p-3 font-bold text-gray-900">{t.client}</td>
                          <td className="p-3 text-gray-700">{t.item}</td>
                          <td className="p-3"><span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-600">{t.type}</span></td>
                          <td className="p-3"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.staff === 'TAKA' ? 'bg-[#5e9bc4]/20 text-[#2c5370]' : 'bg-pink-100 text-pink-700'}`}>{t.staff}</span></td>
                          <td className="p-3 text-right font-black text-gray-900">¥{t.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                  <h2 className="text-base font-bold text-gray-900">担当者別売上比率</h2>
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 flex justify-between items-center">
                      <span className="font-bold text-[#2c5370]">TAKA 担当</span>
                      <span className="font-black text-[#5e9bc4] text-sm">¥{takaSales.toLocaleString()}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-pink-50/50 border border-pink-100 flex justify-between items-center">
                      <span className="font-bold text-pink-900">NANA 担当</span>
                      <span className="font-black text-pink-700 text-sm">¥{nanaSales.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            PAGE 2: 顧客カルテ画面 (既存維持)
           ========================================== */}
        {activeTab === 'clients' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-gray-900">顧客一覧・検索</h2>
              <input
                type="text"
                placeholder="受講生名、保護者名、悩みで検索..."
                value={clientSearchQuery}
                onChange={(e) => setClientSearchQuery(e.target.value)}
                className="w-full p-2.5 border rounded-xl text-xs bg-gray-50"
              />
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {searchedClients.map(c => {
                  const alert = getAlertStatus(c.lastBookingDate);
                  const isSelected = c.id === selectedClientId;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedClientId(c.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all text-xs space-y-1.5 ${isSelected ? 'border-[#5e9bc4] bg-blue-50/40 shadow-sm' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900 text-sm">{c.childName} <span className="text-[11px] text-gray-500 font-normal">({calculateAge(c.birthDate)}歳)</span></span>
                        {alert && (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${alert.type === 'danger' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}>
                            {alert.text}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500">保護者: {c.parentName}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 lg:col-span-2">
              <div className="flex flex-wrap justify-between items-center gap-4 border-b pb-4">
                <div>
                  <h2 className="text-lg font-black text-gray-900">{currentClient.childName} のカルテ</h2>
                  <p className="text-xs text-gray-400">保護者: {currentClient.parentName} | フリガナ: {currentClient.kana}</p>
                </div>
                <div className="flex gap-1.5 text-xs font-bold">
                  <button
                    onClick={() => setClientSubTab('info')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${clientSubTab === 'info' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    基本情報・編集
                  </button>
                  <button
                    onClick={() => setClientSubTab('sessions')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${clientSubTab === 'sessions' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    セッション記録
                  </button>
                  <button
                    onClick={() => setClientSubTab('measurements')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${clientSubTab === 'measurements' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    3ヶ月測定詳細
                  </button>
                </div>
              </div>

              {clientSubTab === 'info' && (
                <div className="space-y-6 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-xl bg-gray-50 space-y-2">
                      <p className="font-bold text-gray-400">Square連携データ</p>
                      <div>
                        <label className="block text-gray-500 mb-1">保護者名</label>
                        <input
                          type="text"
                          value={currentClient.parentName}
                          onChange={(e) => setClients(clients.map(c => c.id === currentClient.id ? { ...c, parentName: e.target.value } : c))}
                          className="w-full p-2 border rounded-lg bg-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-500 mb-1">受講生（子供名）</label>
                        <input
                          type="text"
                          value={currentClient.childName}
                          onChange={(e) => setClients(clients.map(c => c.id === currentClient.id ? { ...c, childName: e.target.value } : c))}
                          className="w-full p-2 border rounded-lg bg-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-500 mb-1">フリガナ</label>
                        <input
                          type="text"
                          value={currentClient.kana}
                          onChange={(e) => setClients(clients.map(c => c.id === currentClient.id ? { ...c, kana: e.target.value } : c))}
                          className="w-full p-2 border rounded-lg bg-white"
                        />
                      </div>
                    </div>

                    <div className="p-4 border rounded-xl bg-gray-50 space-y-2">
                      <p className="font-bold text-gray-400">年齢・日程・チケット</p>
                      <div className="p-2 bg-white rounded border flex justify-between">
                        <span className="text-gray-500">生年月日 / 年齢</span>
                        <span className="font-bold">{currentClient.birthDate} ({calculateAge(currentClient.birthDate)}歳)</span>
                      </div>
                      <div className="p-2 bg-white rounded border flex justify-between">
                        <span className="text-gray-500">初回レッスン日</span>
                        <span className="font-bold">{currentClient.firstLessonDate}</span>
                      </div>
                      <div>
                        <label className="block text-gray-500 mb-1">チケット購入履歴</label>
                        {currentClient.tickets.map((tk, idx) => (
                          <div key={idx} className="p-2 bg-white rounded border flex justify-between">
                            <span className="font-bold">{tk.name}</span>
                            <span className="text-[#5e9bc4] font-bold">残り {tk.remaining}回 / 全{tk.total}回</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-xl bg-gray-50 space-y-3">
                    <p className="font-bold text-gray-400">手動編集項目</p>
                    <div>
                      <label className="block text-gray-500 mb-1">お悩み</label>
                      <input
                        type="text"
                        value={currentClient.concerns}
                        onChange={(e) => setClients(clients.map(c => c.id === currentClient.id ? { ...c, concerns: e.target.value } : c))}
                        className="w-full p-2 border rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">目標</label>
                      <input
                        type="text"
                        value={currentClient.goal}
                        onChange={(e) => setClients(clients.map(c => c.id === currentClient.id ? { ...c, goal: e.target.value } : c))}
                        className="w-full p-2 border rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">メモ</label>
                      <textarea
                        rows={2}
                        value={currentClient.memo}
                        onChange={(e) => setClients(clients.map(c => c.id === currentClient.id ? { ...c, memo: e.target.value } : c))}
                        className="w-full p-2 border rounded-lg bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {clientSubTab === 'sessions' && (
                <div className="space-y-6 text-xs">
                  <div className="p-4 border rounded-xl bg-gray-50 space-y-3">
                    <p className="font-bold text-gray-900">新規セッション追加</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="date"
                        value={newSessionDate}
                        onChange={(e) => setNewSessionDate(e.target.value)}
                        className="p-2 border rounded-lg bg-white"
                      />
                      <input
                        type="text"
                        placeholder="宿題内容"
                        value={newSessionHomework}
                        onChange={(e) => setNewSessionHomework(e.target.value)}
                        className="p-2 border rounded-lg bg-white"
                      />
                    </div>
                    <textarea
                      rows={2}
                      placeholder="トレーニング内容..."
                      value={newSessionContent}
                      onChange={(e) => setNewSessionContent(e.target.value)}
                      className="w-full p-2 border rounded-lg bg-white"
                    />
                    <div>
                      <label className="block text-gray-500 mb-1">宿題写真アップロード＆プレビュー</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const reader = new FileReader();
                            reader.onload = (ev) => setNewSessionImagePreview(ev.target?.result as string);
                            reader.readAsDataURL(e.target.files[0]);
                          }
                        }}
                        className="text-[10px]"
                      />
                      {newSessionImagePreview && (
                        <img src={newSessionImagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg border mt-2" />
                      )}
                    </div>
                    <button
                      onClick={() => {
                        if (!newSessionContent) return;
                        const newS: SessionRecord = {
                          id: String(Date.now()),
                          date: newSessionDate,
                          content: newSessionContent,
                          homeworkContent: newSessionHomework,
                          homeworkImage: newSessionImagePreview
                        };
                        setClients(clients.map(c => c.id === currentClient.id ? { ...c, sessions: [newS, ...c.sessions] } : c));
                        setNewSessionContent('');
                        setNewSessionHomework('');
                        setNewSessionImagePreview('');
                      }}
                      className="px-4 py-2 bg-[#5e9bc4] text-white font-bold rounded-lg hover:bg-[#4a83ab]"
                    >
                      保存する
                    </button>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-bold text-gray-900">セッション履歴</h3>
                    {currentClient.sessions.map((s) => (
                      <div key={s.id} className="p-3 border rounded-xl bg-white space-y-1">
                        <p className="text-gray-400 font-bold">{s.date}</p>
                        <p className="font-bold text-gray-900">{s.content}</p>
                        {s.homeworkContent && <p className="text-[#5e9bc4] bg-blue-50 p-1.5 rounded">宿題: {s.homeworkContent}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {clientSubTab === 'measurements' && (() => {
                const measInfo = getNextMeasurementInfo(currentClient.firstLessonDate);
                return (
                  <div className="space-y-6 text-xs">
                    <div className={`p-4 rounded-xl border flex justify-between items-center ${measInfo.isTargetMonthNow ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-blue-50 border-blue-100 text-blue-900'}`}>
                      <div>
                        <p className="font-black text-sm">次回測定月ハイライト</p>
                        <p className="text-[11px]">対象月: <span className="font-bold">{measInfo.targetMonthsText}</span></p>
                      </div>
                      {measInfo.isTargetMonthNow && <span className="px-2 py-1 bg-amber-500 text-white font-bold rounded text-[10px]">今月測定月です</span>}
                    </div>

                    <div className="p-4 border rounded-xl bg-gray-50 space-y-3">
                      <p className="font-bold text-gray-900">測定データ追加</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <input type="date" value={newMeasDate} onChange={(e) => setNewMeasDate(e.target.value)} className="p-2 border rounded bg-white" />
                        <input type="number" placeholder="体重(kg)" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} className="p-2 border rounded bg-white" />
                        <input type="number" placeholder="体脂肪(%)" value={newBodyFat} onChange={(e) => setNewBodyFat(e.target.value)} className="p-2 border rounded bg-white" />
                        <input type="number" placeholder="筋肉量(kg)" value={newMuscleMass} onChange={(e) => setNewMuscleMass(e.target.value)} className="p-2 border rounded bg-white" />
                      </div>
                      <button
                        onClick={() => {
                          if (!newWeight) return;
                          const newM: MeasurementRecord = {
                            id: String(Date.now()),
                            date: newMeasDate,
                            weight: Number(newWeight),
                            bodyFat: Number(newBodyFat) || 0,
                            muscleMass: Number(newMuscleMass) || 0,
                            postureImages: []
                          };
                          setClients(clients.map(c => c.id === currentClient.id ? { ...c, measurements: [...c.measurements, newM] } : c));
                          setNewWeight('');
                        }}
                        className="px-4 py-2 bg-[#5e9bc4] text-white font-bold rounded-lg hover:bg-[#4a83ab]"
                      >
                        追加する
                      </button>
                    </div>

                    <div className="space-y-3">
                      {currentClient.measurements.map((m, idx) => {
                        const firstM = currentClient.measurements[0];
                        return (
                          <div key={m.id} className="p-4 border rounded-xl bg-white space-y-2">
                            <p className="font-bold text-gray-900">{m.date}</p>
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div className="p-2 bg-gray-50 rounded">
                                <p className="text-gray-400">体重</p>
                                <p className="font-black">{m.weight} kg</p>
                              </div>
                              <div className="p-2 bg-gray-50 rounded">
                                <p className="text-gray-400">体脂肪率</p>
                                <p className="font-black">{m.bodyFat} %</p>
                              </div>
                              <div className="p-2 bg-gray-50 rounded">
                                <p className="text-gray-400">筋肉量</p>
                                <p className="font-black">{m.muscleMass} kg</p>
                                {idx > 0 && <p className="text-[10px] text-[#5e9bc4] font-bold">初回比: +{(m.muscleMass - firstM.muscleMass).toFixed(1)}kg</p>}
                              </div>
                            </div>
                            <div className="p-3 border-2 border-dashed rounded bg-gray-50 text-center text-gray-400">
                              姿勢写真3枚・ケガゼロ/フィジカルテスト結果画像のドラッグ＆ドロップ保存
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ==========================================
            新規ページ 1: タスク・議事録画面 (/tasks 相当)
           ========================================== */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            {/* 上部フィルター ＆ 検索バー */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setTaskSubTab('tasks')}
                    className={`px-4 py-2 rounded-lg transition-all ${taskSubTab === 'tasks' ? 'bg-[#5e9bc4] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    タスク管理
                  </button>
                  <button
                    onClick={() => setTaskSubTab('notes')}
                    className={`px-4 py-2 rounded-lg transition-all ${taskSubTab === 'notes' ? 'bg-[#5e9bc4] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    議事録管理
                  </button>
                </div>

                {taskSubTab === 'tasks' && (
                  <div className="flex gap-1 bg-gray-100 p-1 rounded-xl text-xs font-bold">
                    <button
                      onClick={() => setTaskViewMode('list')}
                      className={`px-3 py-1.5 rounded-lg ${taskViewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                    >
                      リスト表示
                    </button>
                    <button
                      onClick={() => setTaskViewMode('calendar')}
                      className={`px-3 py-1.5 rounded-lg ${taskViewMode === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                    >
                      カレンダー表示
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div>
                  <input
                    type="month"
                    value={taskMonthFilter}
                    onChange={(e) => setTaskMonthFilter(e.target.value)}
                    className="p-2 border rounded-xl bg-gray-50 font-bold"
                  />
                </div>
                {/* リアルタイム全体検索バー */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="タスク・議事録の全体検索..."
                    value={taskGlobalSearch}
                    onChange={(e) => setTaskGlobalSearch(e.target.value)}
                    className="p-2 pl-8 border rounded-xl bg-gray-50 w-64 focus:bg-white focus:ring-2 focus:ring-[#5e9bc4] transition-all"
                  />
                  <span className="absolute left-2.5 top-2.5 text-gray-400">🔍</span>
                </div>
              </div>
            </div>

            {/* SubTab 1: タスク管理 */}
            {taskSubTab === 'tasks' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 新規タスク作成フォーム */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 text-xs">
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#5e9bc4]"></span>
                    新規タスク追加
                  </h2>
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-gray-500 mb-1 font-bold">タスク内容</label>
                      <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="例: チラシの印刷・配布準備"
                        className="w-full p-2.5 border rounded-xl bg-gray-50 focus:bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-gray-500 mb-1 font-bold">担当者選択</label>
                        <select
                          value={newTaskStaff}
                          onChange={(e) => setNewTaskStaff(e.target.value as 'TAKA' | 'NANA')}
                          className="w-full p-2.5 border rounded-xl bg-gray-50 font-bold"
                        >
                          <option value="TAKA">TAKA (インディゴ)</option>
                          <option value="NANA">NANA (ピンク)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-500 mb-1 font-bold">カテゴリー</label>
                        <select
                          value={newTaskCategory}
                          onChange={(e) => setNewTaskCategory(e.target.value)}
                          className="w-full p-2.5 border rounded-xl bg-gray-50"
                        >
                          <option value="SNS">SNS</option>
                          <option value="顧客フォロー">顧客フォロー</option>
                          <option value="事務">事務</option>
                          <option value="その他">その他 (手入力)</option>
                        </select>
                      </div>
                    </div>

                    {newTaskCategory === 'その他' && (
                      <div>
                        <input
                          type="text"
                          placeholder="カテゴリーを手入力..."
                          value={customTaskCategory}
                          onChange={(e) => setCustomTaskCategory(e.target.value)}
                          className="w-full p-2.5 border rounded-xl bg-gray-50"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-gray-500 mb-1 font-bold">期日</label>
                        <input
                          type="date"
                          value={newTaskDueDate}
                          onChange={(e) => setNewTaskDueDate(e.target.value)}
                          className="w-full p-2.5 border rounded-xl bg-gray-50"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-500 mb-1 font-bold">繰り返し設定</label>
                        <select
                          value={newTaskRepeat}
                          onChange={(e) => setNewTaskRepeat(e.target.value as any)}
                          className="w-full p-2.5 border rounded-xl bg-gray-50"
                        >
                          <option value="none">なし (単発)</option>
                          <option value="weekly">毎週自動登録</option>
                          <option value="monthly">毎月自動登録</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-3 bg-red-50/50 border border-red-100 rounded-xl flex items-center justify-between">
                      <label htmlFor="important" className="font-bold text-red-700 cursor-pointer">
                        🚨 重要フラグ（赤色強調）
                      </label>
                      <input
                        type="checkbox"
                        id="important"
                        checked={newTaskImportant}
                        onChange={(e) => setNewTaskImportant(e.target.checked)}
                        className="w-4 h-4 text-red-600 rounded cursor-pointer"
                      />
                    </div>

                    <button
                      onClick={() => {
                        if (!newTaskTitle) return;
                        const finalCat = newTaskCategory === 'その他' ? (customTaskCategory || 'その他') : newTaskCategory;
                        const newT: TaskItem = {
                          id: String(Date.now()),
                          title: newTaskTitle,
                          category: finalCat,
                          staff: newTaskStaff,
                          dueDate: newTaskDueDate,
                          repeat: newTaskRepeat,
                          isImportant: newTaskImportant,
                          status: '未着手'
                        };
                        setTasks([...tasks, newT]);
                        setNewTaskTitle('');
                      }}
                      className="w-full py-3 bg-[#5e9bc4] text-white font-bold rounded-xl hover:bg-[#4a83ab] transition-all shadow-sm"
                    >
                      タスクを登録する
                    </button>
                  </div>
                </div>

                {/* タスク一覧表示 */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 lg:col-span-2">
                  <div className="flex justify-between items-center">
                    <h2 className="text-base font-bold text-gray-900">
                      タスク一覧 ({taskMonthFilter})
                    </h2>
                    <span className="text-xs text-gray-400 font-bold">
                      全 {tasks.filter(t => t.dueDate.startsWith(taskMonthFilter)).length} 件
                    </span>
                  </div>

                  {taskViewMode === 'list' ? (
                    <div className="space-y-3">
                      {tasks
                        .filter(t => t.dueDate.startsWith(taskMonthFilter))
                        .filter(t =>
                          t.title.toLowerCase().includes(taskGlobalSearch.toLowerCase()) ||
                          t.category.toLowerCase().includes(taskGlobalSearch.toLowerCase()) ||
                          t.staff.toLowerCase().includes(taskGlobalSearch.toLowerCase())
                        )
                        .map(t => (
                          <div
                            key={t.id}
                            className={`p-4 border rounded-2xl transition-all flex flex-wrap md:flex-nowrap items-center justify-between gap-3 text-xs ${
                              t.isImportant ? 'border-red-300 bg-red-50/40' : 'bg-gray-50 border-gray-200 hover:bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {/* スタッフバッジ */}
                              <span className={`px-2.5 py-1 rounded-lg font-black text-[11px] ${
                                t.staff === 'TAKA' ? 'bg-[#5e9bc4] text-white' : 'bg-pink-500 text-white'
                              }`}>
                                {t.staff}
                              </span>

                              <div>
                                <div className="flex items-center gap-2">
                                  {t.isImportant && (
                                    <span className="px-1.5 py-0.5 bg-red-600 text-white font-black rounded text-[9px]">
                                      重要
                                    </span>
                                  )}
                                  <p className={`font-bold ${t.status === '完了' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                                    {t.title}
                                  </p>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">
                                  期日: {t.dueDate} {t.repeat !== 'none' && `(${t.repeat === 'weekly' ? '毎週' : '毎月'})`} | カテゴリー: {t.category}
                                </p>
                              </div>
                            </div>

                            {/* ステータス切替 */}
                            <div className="flex items-center gap-2">
                              <select
                                value={t.status}
                                onChange={(e) => setTasks(tasks.map(tk => tk.id === t.id ? { ...tk, status: e.target.value as TaskStatus } : tk))}
                                className={`p-1.5 border rounded-lg font-bold text-[11px] ${
                                  t.status === '完了' ? 'bg-green-100 text-green-800' : t.status === '進行中' ? 'bg-amber-100 text-amber-800' : 'bg-white text-gray-700'
                                }`}
                              >
                                <option value="未着手">未着手</option>
                                <option value="進行中">進行中</option>
                                <option value="完了">完了</option>
                              </select>
                              <button
                                onClick={() => setTasks(tasks.filter(tk => tk.id !== t.id))}
                                className="text-gray-400 hover:text-red-500 text-xs px-1"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    /* カレンダービュー */
                    <div className="p-4 border rounded-2xl bg-gray-50 text-center space-y-3">
                      <p className="font-bold text-gray-600 text-xs">📅 月間カレンダー表示 ({taskMonthFilter})</p>
                      <div className="grid grid-cols-7 gap-1 text-[11px]">
                        {['日', '月', '火', '水', '木', '金', '土'].map((d, i) => (
                          <div key={i} className="p-1 bg-gray-200 font-bold text-gray-600 rounded">{d}</div>
                        ))}
                        {Array.from({ length: 30 }).map((_, i) => {
                          const dayNum = String(i + 1).padStart(2, '0');
                          const dateStr = `${taskMonthFilter}-${dayNum}`;
                          const dayTasks = tasks.filter(t => t.dueDate === dateStr);
                          return (
                            <div key={i} className="min-h-[50px] p-1 bg-white border rounded text-left flex flex-col justify-between">
                              <span className="font-bold text-gray-400">{i + 1}</span>
                              {dayTasks.map(dt => (
                                <span key={dt.id} className={`text-[9px] p-0.5 rounded truncate font-bold ${dt.staff === 'TAKA' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>
                                  {dt.title}
                                </span>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* SubTab 2: 議事録管理 */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 text-xs">
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFE8AB]"></span>
                    議事録の新規作成
                  </h2>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="議題・ミーティング名..."
                      value={newNoteTitle}
                      onChange={(e) => setNewNoteTitle(e.target.value)}
                      className="w-full p-2.5 border rounded-xl bg-gray-50 font-bold"
                    />

                    <div>
                      <label className="block text-gray-500 mb-1 font-bold">カテゴリー</label>
                      <select
                        value={newNoteCategory}
                        onChange={(e) => setNewNoteCategory(e.target.value)}
                        className="w-full p-2.5 border rounded-xl bg-gray-50 font-bold"
                      >
                        <option value="キャンペーン">キャンペーン</option>
                        <option value="週MT">週MT</option>
                        <option value="月MT">月MT</option>
                        <option value="その他">その他 (手入力)</option>
                      </select>
                    </div>

                    {newNoteCategory === 'その他' && (
                      <input
                        type="text"
                        placeholder="カテゴリーを手入力..."
                        value={customNoteCategory}
                        onChange={(e) => setCustomNoteCategory(e.target.value)}
                        className="w-full p-2.5 border rounded-xl bg-gray-50"
                      />
                    )}

                    {newNoteCategory === 'キャンペーン' && (
                      <div className="p-3 bg-[#FFE8AB]/30 border border-amber-200 rounded-xl space-y-1.5">
                        <p className="font-bold text-amber-900">✨ キャンペーン用プリセットチェックリスト自動展開</p>
                        <p className="text-[10px] text-amber-700">保存時に以下の関連タスクが初期設定として組み込まれます：</p>
                        <div className="flex flex-wrap gap-1">
                          {campaignPresetTasks.map((pt, i) => (
                            <span key={i} className="px-2 py-0.5 bg-white border text-[10px] rounded font-bold text-gray-700">{pt}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <textarea
                      rows={5}
                      placeholder="会議の決定事項、メモ..."
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      className="w-full p-2.5 border rounded-xl bg-gray-50"
                    />

                    <button
                      onClick={() => {
                        if (!newNoteTitle) return;
                        const finalCat = newNoteCategory === 'その他' ? (customNoteCategory || 'その他') : newNoteCategory;
                        const newNote: MeetingNote = {
                          id: String(Date.now()),
                          date: '2026-09-08',
                          title: newNoteTitle,
                          category: finalCat,
                          content: newNoteContent,
                          checklist: newNoteCategory === 'キャンペーン' ? campaignPresetTasks.map((pt, idx) => ({ id: `chk_${idx}`, text: pt, completed: false })) : []
                        };
                        setMeetingNotes([newNote, ...meetingNotes]);
                        setNewNoteTitle('');
                        setNewNoteContent('');
                      }}
                      className="w-full py-3 bg-[#5e9bc4] text-white font-bold rounded-xl hover:bg-[#4a83ab] transition-all shadow-sm"
                    >
                      議事録を保存する
                    </button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 lg:col-span-2">
                  <h2 className="text-base font-bold text-gray-900">議事録一覧</h2>
                  <div className="space-y-4">
                    {meetingNotes
                      .filter(n =>
                        n.title.toLowerCase().includes(taskGlobalSearch.toLowerCase()) ||
                        n.content.toLowerCase().includes(taskGlobalSearch.toLowerCase()) ||
                        n.category.toLowerCase().includes(taskGlobalSearch.toLowerCase())
                      )
                      .map(note => (
                        <div key={note.id} className="p-5 border rounded-2xl bg-white space-y-3 text-xs shadow-sm">
                          <div className="flex justify-between items-center border-b pb-2">
                            <span className="font-black text-sm text-gray-900">{note.title}</span>
                            <span className="px-2.5 py-0.5 bg-[#FFE8AB] text-[#553c00] font-bold rounded-full text-[10px]">{note.category}</span>
                          </div>
                          <p className="text-gray-400 font-bold">{note.date}</p>
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{note.content}</p>

                          {/* 関連タスク自動展開リスト */}
                          {note.checklist && note.checklist.length > 0 && (
                            <div className="p-3 bg-gray-50 border rounded-xl space-y-2 mt-2">
                              <p className="font-bold text-gray-700">📋 デフォルトチェックリスト・タスク連動</p>
                              <div className="grid grid-cols-2 gap-2">
                                {note.checklist.map(item => (
                                  <div key={item.id} className="flex items-center gap-2 bg-white p-2 rounded border">
                                    <input
                                      type="checkbox"
                                      checked={item.completed}
                                      onChange={() => {
                                        setMeetingNotes(meetingNotes.map(mn => {
                                          if (mn.id === note.id && mn.checklist) {
                                            return {
                                              ...mn,
                                              checklist: mn.checklist.map(c => c.id === item.id ? { ...c, completed: !c.completed } : c)
                                            };
                                          }
                                          return mn;
                                        }));
                                      }}
                                    />
                                    <span className={item.completed ? 'line-through text-gray-400' : 'font-bold'}>{item.text}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* タスクへ反映ボタン */}
                          <div className="pt-2 flex justify-end">
                            <button
                              onClick={() => {
                                const newT: TaskItem = {
                                  id: String(Date.now()),
                                  title: `[議事録連携] ${note.title}`,
                                  category: note.category,
                                  staff: 'TAKA',
                                  dueDate: '2026-09-15',
                                  repeat: 'none',
                                  isImportant: false,
                                  status: '未着手'
                                };
                                setTasks([...tasks, newT]);
                                alert('タスク管理へ連携タスクを登録しました！');
                              }}
                              className="px-3 py-1.5 bg-[#5e9bc4] text-white font-bold rounded-lg hover:bg-[#4a83ab] transition-all shadow-sm text-[11px]"
                            >
                              ＋ タスク管理へ反映
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            新規ページ 2: 近隣情報画面 (/local-info 相当)
           ========================================== */}
        {activeTab === 'local' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 text-xs">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5e9bc4]"></span>
                近隣校・チームの追加
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-500 mb-1 font-bold">学校・スポーツチーム名</label>
                  <input
                    type="text"
                    placeholder="例: 板橋区立第一小学校, 赤羽FC"
                    value={newLocalName}
                    onChange={(e) => setNewLocalName(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-gray-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-500 mb-1 font-bold">対象区</label>
                    <select
                      value={newLocalDistrict}
                      onChange={(e) => setNewLocalDistrict(e.target.value as any)}
                      className="w-full p-2.5 border rounded-xl bg-gray-50 font-bold"
                    >
                      <option value="板橋区">板橋区</option>
                      <option value="北区">北区</option>
                      <option value="その他">その他</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-500 mb-1 font-bold">担当関係者</label>
                    <input
                      type="text"
                      value={newLocalStaff}
                      onChange={(e) => setNewLocalStaff(e.target.value)}
                      placeholder="担当者名..."
                      className="w-full p-2.5 border rounded-xl bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-500 mb-1 font-bold">イベント名</label>
                  <input
                    type="text"
                    placeholder="例: 秋季運動会, 体験大会"
                    value={newLocalEvent}
                    onChange={(e) => setNewLocalEvent(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-gray-500 mb-1 font-bold">詳細URL (外部リンク)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newLocalUrl}
                    onChange={(e) => setNewLocalUrl(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-gray-500 mb-1 font-bold">メモ (自由記述)</label>
                  <textarea
                    rows={3}
                    placeholder="チラシ配布の許可状況や挨拶のメモ..."
                    value={newLocalMemo}
                    onChange={(e) => setNewLocalMemo(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-gray-50"
                  />
                </div>

                <button
                  onClick={() => {
                    if (!newLocalName) return;
                    setLocalInfos([...localInfos, {
                      id: String(Date.now()),
                      name: newLocalName,
                      district: newLocalDistrict,
                      eventName: newLocalEvent,
                      url: newLocalUrl,
                      contactStaff: newLocalStaff,
                      memo: newLocalMemo
                    }]);
                    setNewLocalName('');
                    setNewLocalEvent('');
                    setNewLocalUrl('');
                    setNewLocalMemo('');
                  }}
                  className="w-full py-3 bg-[#5e9bc4] text-white font-bold rounded-xl hover:bg-[#4a83ab] transition-all shadow-sm"
                >
                  近隣情報を登録
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 lg:col-span-2">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <h2 className="text-base font-bold text-gray-900">地域校・スポーツチーム情報一覧</h2>
                <input
                  type="text"
                  placeholder="学校名・イベント名・メモでリアルタイム検索..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  className="p-2 border rounded-xl text-xs bg-gray-50 w-72 focus:bg-white"
                />
              </div>

              <div className="space-y-3">
                {localInfos
                  .filter(info =>
                    info.name.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
                    info.eventName.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
                    info.memo.toLowerCase().includes(localSearchQuery.toLowerCase())
                  )
                  .map(info => (
                    <div key={info.id} className="p-4 border rounded-2xl bg-white space-y-2 text-xs shadow-sm hover:border-[#5e9bc4] transition-all">
                      <div className="flex justify-between items-center">
                        <span className="font-black text-sm text-gray-900">{info.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-blue-50 text-[#5e9bc4] font-bold rounded-full text-[10px] border border-blue-100">
                            {info.district}
                          </span>
                          <button
                            onClick={() => setLocalInfos(localInfos.filter(l => l.id !== info.id))}
                            className="text-gray-400 hover:text-red-500 font-bold px-1"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-gray-600">
                        <p className="font-bold">イベント: {info.eventName || '未設定'}</p>
                        <p className="text-gray-400">担当: {info.contactStaff}</p>
                      </div>

                      {info.url && (
                        <a
                          href={info.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#5e9bc4] hover:underline block font-bold text-[11px]"
                        >
                          🔗 {info.url} (別タブで開く)
                        </a>
                      )}

                      {info.memo && <p className="text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">{info.memo}</p>}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            新規ページ 3: 取引一覧画面 (/vendors 相当)
           ========================================== */}
        {activeTab === 'vendors' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 text-xs">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5e9bc4]"></span>
                業者・設備の追加
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-500 mb-1 font-bold">名前（業者名・機器名）</label>
                  <input
                    type="text"
                    placeholder="例: 株式会社○○, 決済端末"
                    value={newVendorName}
                    onChange={(e) => setNewVendorName(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-gray-500 mb-1 font-bold">使用詳細</label>
                  <input
                    type="text"
                    placeholder="例: 体幹計測器のリース・保守"
                    value={newVendorUsage}
                    onChange={(e) => setNewVendorUsage(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-gray-500 mb-1 font-bold">業者担当者名</label>
                  <input
                    type="text"
                    placeholder="例: 担当 鈴木様"
                    value={newVendorStaff}
                    onChange={(e) => setNewVendorStaff(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-gray-500 mb-1 font-bold">URL (外部リンク)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newVendorUrl}
                    onChange={(e) => setNewVendorUrl(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-gray-500 mb-1 font-bold">メモ (自由記述)</label>
                  <textarea
                    rows={3}
                    placeholder="契約更新時期や問い合わせ用メモ..."
                    value={newVendorMemo}
                    onChange={(e) => setNewVendorMemo(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-gray-50"
                  />
                </div>

                <button
                  onClick={() => {
                    if (!newVendorName) return;
                    setVendors([...vendors, {
                      id: String(Date.now()),
                      name: newVendorName,
                      usageDetail: newVendorUsage,
                      contactStaff: newVendorStaff,
                      url: newVendorUrl,
                      memo: newVendorMemo
                    }]);
                    setNewVendorName('');
                    setNewVendorUsage('');
                    setNewVendorStaff('');
                    setNewVendorUrl('');
                    setNewVendorMemo('');
                  }}
                  className="w-full py-3 bg-[#5e9bc4] text-white font-bold rounded-xl hover:bg-[#4a83ab] transition-all shadow-sm"
                >
                  取引先・設備を登録
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 lg:col-span-2">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <h2 className="text-base font-bold text-gray-900">取引業者・設備情報一覧</h2>
                <input
                  type="text"
                  placeholder="業者名・詳細・担当者でリアルタイム検索..."
                  value={vendorSearchQuery}
                  onChange={(e) => setVendorSearchQuery(e.target.value)}
                  className="p-2 border rounded-xl text-xs bg-gray-50 w-72 focus:bg-white"
                />
              </div>

              <div className="space-y-3">
                {vendors
                  .filter(v =>
                    v.name.toLowerCase().includes(vendorSearchQuery.toLowerCase()) ||
                    v.usageDetail.toLowerCase().includes(vendorSearchQuery.toLowerCase()) ||
                    v.contactStaff.toLowerCase().includes(vendorSearchQuery.toLowerCase()) ||
                    v.memo.toLowerCase().includes(vendorSearchQuery.toLowerCase())
                  )
                  .map(v => (
                    <div key={v.id} className="p-4 border rounded-2xl bg-white space-y-2 text-xs shadow-sm hover:border-[#5e9bc4] transition-all">
                      <div className="flex justify-between items-center">
                        <span className="font-black text-sm text-gray-900">{v.name}</span>
                        <button
                          onClick={() => setVendors(vendors.filter(item => item.id !== v.id))}
                          className="text-gray-400 hover:text-red-500 font-bold px-1"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-gray-600">
                        <p className="font-bold">用途: {v.usageDetail || '未設定'}</p>
                        <p className="text-gray-500">担当者: {v.contactStaff || '未設定'}</p>
                      </div>

                      {v.url && (
                        <a
                          href={v.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#5e9bc4] hover:underline block font-bold text-[11px]"
                        >
                          🔗 {v.url} (別タブで開く)
                        </a>
                      )}

                      {v.memo && <p className="text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">{v.memo}</p>}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
