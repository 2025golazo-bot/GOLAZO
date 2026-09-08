'use client';

import { useState } from 'react';

// ==========================================
// --- 型定義 ---
// ==========================================

// 1. 売上・カルテ用型定義
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
  // --- 1. 売上管理の状態 ---
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
  // --- 2. 顧客カルテの状態 ---
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

  const [newMeasDate, setNewMeasDate] = useState('2026-09-08');
  const [newWeight, setNewWeight] = useState<string>('');
  const [newBodyFat, setNewBodyFat] = useState<string>('');
  const [newMuscleMass, setNewMuscleMass] = useState<string>('');

  // ==========================================
  // --- 3. タスク・議事録の状態 ---
  // ==========================================
  const [taskSubTab, setTaskSubTab] = useState<'tasks' | 'notes'>('tasks');
  const [taskMonthFilter, setTaskMonthFilter] = useState<string>('2026-09');
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
  const [newTaskRepeat] = useState<'none' | 'weekly' | 'monthly'>('none');
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
  const [newNoteCategory] = useState('キャンペーン');
  const [newNoteContent, setNewNoteContent] = useState('');

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
  const [newLocalStaff] = useState('TAKA');
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
  // --- ロジック・計算関数 ---
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
      <main className="p-6 max-w-7xl mx-auto space-y-8">
        {/* 単一ヘッダー（ナビゲーションバー） */}
        <div className="bg-white px-6 py-4 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-6">
            <span className="font-black text-gray-900 text-xl tracking-wide">
              パーソナルジム GOLAZO
            </span>
            <nav className="flex items-center gap-1 text-xs font-bold bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('transactions')}
                className={`px-3.5 py-2 rounded-lg transition-all ${
                  activeTab === 'transactions'
                    ? 'bg-[#5e9bc4] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                }`}
              >
                売上管理
              </button>
              <button
                onClick={() => setActiveTab('clients')}
                className={`px-3.5 py-2 rounded-lg transition-all ${
                  activeTab === 'clients'
                    ? 'bg-[#5e9bc4] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                }`}
              >
                顧客カルテ
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-3.5 py-2 rounded-lg transition-all ${
                  activeTab === 'tasks'
                    ? 'bg-[#5e9bc4] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                }`}
              >
                タスク・議事録
              </button>
              <button
                onClick={() => setActiveTab('local')}
                className={`px-3.5 py-2 rounded-lg transition-all ${
                  activeTab === 'local'
                    ? 'bg-[#5e9bc4] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                }`}
              >
                近隣情報
              </button>
              <button
                onClick={() => setActiveTab('vendors')}
                className={`px-3.5 py-2 rounded-lg transition-all ${
                  activeTab === 'vendors'
                    ? 'bg-[#5e9bc4] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                }`}
              >
                取引一覧
              </button>
            </nav>
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
            PAGE 1: 売上管理画面
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
            PAGE 2: 顧客カルテ画面
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
                      <label className="block text-gray-500 mb-1">カルテメモ</label>
                      <textarea
                        rows={3}
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
                  <div className="p-4 border rounded-xl bg-blue-50/30 space-y-3">
                    <p className="font-bold text-gray-900">新規セッション記録の追加</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="date"
                        value={newSessionDate}
                        onChange={(e) => setNewSessionDate(e.target.value)}
                        className="p-2 border rounded-lg bg-white"
                      />
                      <input
                        type="text"
                        placeholder="トレーニング指導内容"
                        value={newSessionContent}
                        onChange={(e) => setNewSessionContent(e.target.value)}
                        className="p-2 border rounded-lg bg-white"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="宿題指導内容"
                      value={newSessionHomework}
                      onChange={(e) => setNewSessionHomework(e.target.value)}
                      className="w-full p-2 border rounded-lg bg-white"
                    />
                    <button
                      onClick={() => {
                        if (!newSessionContent) return;
                        const newS: SessionRecord = {
                          id: Date.now().toString(),
                          date: newSessionDate,
                          content: newSessionContent,
                          homeworkContent: newSessionHomework,
                        };
                        setClients(clients.map(c => c.id === currentClient.id ? { ...c, sessions: [newS, ...c.sessions] } : c));
                        setNewSessionContent('');
                        setNewSessionHomework('');
                      }}
                      className="px-4 py-2 bg-[#5e9bc4] text-white font-bold rounded-lg shadow-sm hover:bg-[#4a84a8]"
                    >
                      記録を追加
                    </button>
                  </div>

                  <div className="space-y-3">
                    <p className="font-bold text-gray-900">過去のセッション履歴</p>
                    {currentClient.sessions.map((s) => (
                      <div key={s.id} className="p-3 border rounded-xl bg-white space-y-1">
                        <div className="flex justify-between font-bold text-gray-500 text-[11px]">
                          <span>{s.date}</span>
                        </div>
                        <p className="font-bold text-gray-900">{s.content}</p>
                        {s.homeworkContent && (
                          <p className="text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                            宿題: {s.homeworkContent}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {clientSubTab === 'measurements' && (
                <div className="space-y-6 text-xs">
                  <div className="p-4 border rounded-xl bg-blue-50/30 space-y-3">
                    <p className="font-bold text-gray-900">新規測定データの記録</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <input
                        type="date"
                        value={newMeasDate}
                        onChange={(e) => setNewMeasDate(e.target.value)}
                        className="p-2 border rounded-lg bg-white"
                      />
                      <input
                        type="number"
                        placeholder="体重 (kg)"
                        value={newWeight}
                        onChange={(e) => setNewWeight(e.target.value)}
                        className="p-2 border rounded-lg bg-white"
                      />
                      <input
                        type="number"
                        placeholder="体脂肪率 (%)"
                        value={newBodyFat}
                        onChange={(e) => setNewBodyFat(e.target.value)}
                        className="p-2 border rounded-lg bg-white"
                      />
                      <input
                        type="number"
                        placeholder="筋肉量 (kg)"
                        value={newMuscleMass}
                        onChange={(e) => setNewMuscleMass(e.target.value)}
                        className="p-2 border rounded-lg bg-white"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (!newWeight) return;
                        const newM: MeasurementRecord = {
                          id: Date.now().toString(),
                          date: newMeasDate,
                          weight: Number(newWeight),
                          bodyFat: Number(newBodyFat),
                          muscleMass: Number(newMuscleMass),
                          postureImages: []
                        };
                        setClients(clients.map(c => c.id === currentClient.id ? { ...c, measurements: [newM, ...c.measurements] } : c));
                        setNewWeight('');
                        setNewBodyFat('');
                        setNewMuscleMass('');
                      }}
                      className="px-4 py-2 bg-[#5e9bc4] text-white font-bold rounded-lg shadow-sm hover:bg-[#4a84a8]"
                    >
                      測定を追加
                    </button>
                  </div>

                  <div className="space-y-3">
                    <p className="font-bold text-gray-900">3ヶ月測定推移履歴</p>
                    <table className="w-full text-xs text-left border">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="p-2">測定日</th>
                          <th className="p-2">体重 (kg)</th>
                          <th className="p-2">体脂肪率 (%)</th>
                          <th className="p-2">筋肉量 (kg)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {currentClient.measurements.map((m) => (
                          <tr key={m.id}>
                            <td className="p-2 font-bold">{m.date}</td>
                            <td className="p-2">{m.weight} kg</td>
                            <td className="p-2">{m.bodyFat} %</td>
                            <td className="p-2">{m.muscleMass} kg</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==========================================
            PAGE 3: タスク・議事録画面
           ========================================== */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex gap-2">
                <button
                  onClick={() => setTaskSubTab('tasks')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${taskSubTab === 'tasks' ? 'bg-[#5e9bc4] text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  タスク管理
                </button>
                <button
                  onClick={() => setTaskSubTab('notes')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${taskSubTab === 'notes' ? 'bg-[#5e9bc4] text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  ミーティング議事録
                </button>
              </div>

              {taskSubTab === 'tasks' && (
                <div className="flex items-center gap-3 text-xs font-bold">
                  <input
                    type="month"
                    value={taskMonthFilter}
                    onChange={(e) => setTaskMonthFilter(e.target.value)}
                    className="p-1.5 border rounded-lg bg-gray-50"
                  />
                  <div className="flex border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setTaskViewMode('list')}
                      className={`px-3 py-1.5 ${taskViewMode === 'list' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600'}`}
                    >
                      リスト
                    </button>
                    <button
                      onClick={() => setTaskViewMode('calendar')}
                      className={`px-3 py-1.5 ${taskViewMode === 'calendar' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600'}`}
                    >
                      カレンダー
                    </button>
                  </div>
                </div>
              )}
            </div>

            {taskSubTab === 'tasks' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 text-xs">
                  <h3 className="font-bold text-gray-900 text-sm">新規タスク登録</h3>
                  <div>
                    <label className="block text-gray-500 mb-1">タスク名</label>
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full p-2 border rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1">カテゴリ</label>
                    <select
                      value={newTaskCategory}
                      onChange={(e) => setNewTaskCategory(e.target.value)}
                      className="w-full p-2 border rounded-lg bg-gray-50 mb-1"
                    >
                      <option value="SNS">SNS</option>
                      <option value="顧客フォロー">顧客フォロー</option>
                      <option value="キャンペーン">キャンペーン</option>
                      <option value="その他">その他</option>
                    </select>
                    {newTaskCategory === 'その他' && (
                      <input
                        type="text"
                        placeholder="新規カテゴリ入力"
                        value={customTaskCategory}
                        onChange={(e) => setCustomTaskCategory(e.target.value)}
                        className="w-full p-2 border rounded-lg bg-gray-50"
                      />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-gray-500 mb-1">担当</label>
                      <select
                        value={newTaskStaff}
                        onChange={(e) => setNewTaskStaff(e.target.value as 'TAKA' | 'NANA')}
                        className="w-full p-2 border rounded-lg bg-gray-50"
                      >
                        <option value="TAKA">TAKA</option>
                        <option value="NANA">NANA</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">期限日</label>
                      <input
                        type="date"
                        value={newTaskDueDate}
                        onChange={(e) => setNewTaskDueDate(e.target.value)}
                        className="w-full p-2 border rounded-lg bg-gray-50"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newTaskImportant}
                        onChange={(e) => setNewTaskImportant(e.target.checked)}
                      />
                      <span>重要タスク</span>
                    </label>
                  </div>
                  <button
                    onClick={() => {
                      if (!newTaskTitle) return;
                      const newTask: TaskItem = {
                        id: Date.now().toString(),
                        title: newTaskTitle,
                        category: newTaskCategory === 'その他' ? customTaskCategory : newTaskCategory,
                        staff: newTaskStaff,
                        dueDate: newTaskDueDate,
                        repeat: newTaskRepeat,
                        isImportant: newTaskImportant,
                        status: '未着手'
                      };
                      setTasks([...tasks, newTask]);
                      setNewTaskTitle('');
                    }}
                    className="w-full py-2 bg-[#5e9bc4] text-white font-bold rounded-lg shadow-sm hover:bg-[#4a84a8]"
                  >
                    タスクを追加
                  </button>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 lg:col-span-2 text-xs">
                  <h3 className="font-bold text-gray-900 text-sm">タスク一覧</h3>
                  <div className="space-y-2">
                    {tasks.map(t => (
                      <div key={t.id} className="p-3 border rounded-xl flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={t.status === '完了'}
                            onChange={(e) => {
                              const updatedStatus = e.target.checked ? '完了' : '未着手';
                              setTasks(tasks.map(tk => tk.id === t.id ? { ...tk, status: updatedStatus } : tk));
                            }}
                          />
                          <div>
                            <p className={`font-bold ${t.status === '完了' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                              {t.isImportant && <span className="text-red-500 mr-1">★</span>}
                              {t.title}
                            </p>
                            <span className="text-[10px] text-gray-400">{t.category} | 担当: {t.staff} | 期限: {t.dueDate}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${t.status === '完了' ? 'bg-gray-100 text-gray-500' : t.status === '進行中' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-gray-900 text-sm">新規議事録作成</h3>
                  <div>
                    <label className="block text-gray-500 mb-1">タイトル</label>
                    <input
                      type="text"
                      value={newNoteTitle}
                      onChange={(e) => setNewNoteTitle(e.target.value)}
                      className="w-full p-2 border rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1">議事録内容</label>
                    <textarea
                      rows={4}
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      className="w-full p-2 border rounded-lg bg-gray-50"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (!newNoteTitle) return;
                      const newN: MeetingNote = {
                        id: Date.now().toString(),
                        date: '2026-09-08',
                        title: newNoteTitle,
                        category: newNoteCategory,
                        content: newNoteContent,
                      };
                      setMeetingNotes([newN, ...meetingNotes]);
                      setNewNoteTitle('');
                      setNewNoteContent('');
                    }}
                    className="w-full py-2 bg-[#5e9bc4] text-white font-bold rounded-lg shadow-sm hover:bg-[#4a84a8]"
                  >
                    議事録を保存
                  </button>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 lg:col-span-2">
                  <h3 className="font-bold text-gray-900 text-sm">議事録アーカイブ</h3>
                  <div className="space-y-4">
                    {meetingNotes.map(n => (
                      <div key={n.id} className="p-4 border rounded-xl space-y-2 bg-gray-50/50">
                        <div className="flex justify-between items-center font-bold">
                          <span className="text-gray-900 text-sm">{n.title}</span>
                          <span className="text-gray-400 text-[10px]">{n.date}</span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{n.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            PAGE 4: 近隣情報画面
           ========================================== */}
        {activeTab === 'local' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 text-sm">新規近隣情報追加</h3>
              <div>
                <label className="block text-gray-500 mb-1">施設・団体・学校名</label>
                <input
                  type="text"
                  value={newLocalName}
                  onChange={(e) => setNewLocalName(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-gray-500 mb-1">地域区分</label>
                <select
                  value={newLocalDistrict}
                  onChange={(e) => setNewLocalDistrict(e.target.value as '板橋区' | '北区' | 'その他')}
                  className="w-full p-2 border rounded-lg bg-gray-50"
                >
                  <option value="板橋区">板橋区</option>
                  <option value="北区">北区</option>
                  <option value="その他">その他</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-500 mb-1">イベント名 / 連携事項</label>
                <input
                  type="text"
                  value={newLocalEvent}
                  onChange={(e) => setNewLocalEvent(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-gray-500 mb-1">URL</label>
                <input
                  type="text"
                  value={newLocalUrl}
                  onChange={(e) => setNewLocalUrl(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-gray-500 mb-1">メモ</label>
                <textarea
                  rows={2}
                  value={newLocalMemo}
                  onChange={(e) => setNewLocalMemo(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-gray-50"
                />
              </div>
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
                className="w-full py-2 bg-[#5e9bc4] text-white font-bold rounded-lg shadow-sm hover:bg-[#4a84a8]"
              >
                情報を追加
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 lg:col-span-2">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-900 text-sm">地域・施設・イベントリスト</h3>
                <input
                  type="text"
                  placeholder="検索..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  className="p-2 border rounded-lg bg-gray-50 w-48 text-xs"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border">
                  <thead>
                    <tr className="bg-gray-50 border-b font-bold text-gray-500">
                      <th className="p-2">区分</th>
                      <th className="p-2">施設・団体名</th>
                      <th className="p-2">イベント・概要</th>
                      <th className="p-2">URL</th>
                      <th className="p-2">メモ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {localInfos.filter(i => i.name.includes(localSearchQuery) || i.eventName.includes(localSearchQuery)).map(item => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="p-2"><span className="px-2 py-0.5 bg-blue-50 text-[#5e9bc4] font-bold rounded">{item.district}</span></td>
                        <td className="p-2 font-bold">{item.name}</td>
                        <td className="p-2">{item.eventName}</td>
                        <td className="p-2">
                          {item.url && <a href={item.url} target="_blank" rel="noreferrer" className="text-blue-500 underline">リンク</a>}
                        </td>
                        <td className="p-2 text-gray-500">{item.memo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            PAGE 5: 取引一覧画面（業者・設備）
           ========================================== */}
        {activeTab === 'vendors' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 text-sm">新規取引業者・設備登録</h3>
              <div>
                <label className="block text-gray-500 mb-1">業者・サービス名</label>
                <input
                  type="text"
                  value={newVendorName}
                  onChange={(e) => setNewVendorName(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-gray-500 mb-1">利用用途・機器詳細</label>
                <input
                  type="text"
                  value={newVendorUsage}
                  onChange={(e) => setNewVendorUsage(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-gray-500 mb-1">担当窓口 / 担当者名</label>
                <input
                  type="text"
                  value={newVendorStaff}
                  onChange={(e) => setNewVendorStaff(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-gray-500 mb-1">契約・サービスURL</label>
                <input
                  type="text"
                  value={newVendorUrl}
                  onChange={(e) => setNewVendorUrl(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-gray-500 mb-1">メモ</label>
                <textarea
                  rows={2}
                  value={newVendorMemo}
                  onChange={(e) => setNewVendorMemo(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-gray-50"
                />
              </div>
              <button
                onClick={() => {
                  if (!newVendorName) return;
                  const newV: VendorItem = {
                    id: Date.now().toString(),
                    name: newVendorName,
                    usageDetail: newVendorUsage,
                    contactStaff: newVendorStaff,
                    url: newVendorUrl,
                    memo: newVendorMemo
                  };
                  setVendors([...vendors, newV]);
                  setNewVendorName('');
                  setNewVendorUsage('');
                  setNewVendorStaff('');
                  setNewVendorUrl('');
                  setNewVendorMemo('');
                }}
                className="w-full py-2 bg-[#5e9bc4] text-white font-bold rounded-lg shadow-sm hover:bg-[#4a84a8]"
              >
                業者を追加
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 lg:col-span-2">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-900 text-sm">取引先・契約サービス一覧</h3>
                <input
                  type="text"
                  placeholder="検索..."
                  value={vendorSearchQuery}
                  onChange={(e) => setVendorSearchQuery(e.target.value)}
                  className="p-2 border rounded-lg bg-gray-50 w-48 text-xs"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border">
                  <thead>
                    <tr className="bg-gray-50 border-b font-bold text-gray-500">
                      <th className="p-2">業者・サービス名</th>
                      <th className="p-2">用途・内容</th>
                      <th className="p-2">担当窓口</th>
                      <th className="p-2">URL</th>
                      <th className="p-2">メモ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {vendors.filter(v => v.name.includes(vendorSearchQuery) || v.usageDetail.includes(vendorSearchQuery)).map(v => (
                      <tr key={v.id} className="hover:bg-gray-50">
                        <td className="p-2 font-bold">{v.name}</td>
                        <td className="p-2">{v.usageDetail}</td>
                        <td className="p-2">{v.contactStaff}</td>
                        <td className="p-2">
                          {v.url && <a href={v.url} target="_blank" rel="noreferrer" className="text-blue-500 underline">リンク</a>}
                        </td>
                        <td className="p-2 text-gray-500">{v.memo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
