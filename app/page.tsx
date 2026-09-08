'use client';

import { useState } from 'react';

// --- 型定義 ---
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

interface TaskItem {
  id: string;
  title: string;
  category: string;
  staff: 'TAKA' | 'NANA';
  dueDate: string;
  repeat: 'none' | 'weekly' | 'monthly';
  isImportant: boolean;
  completed: boolean;
}

interface MeetingNote {
  id: string;
  date: string;
  title: string;
  category: string;
  content: string;
}

interface LocalInfoItem {
  id: string;
  name: string; // 学校・チーム名
  district: '板橋区' | '北区' | 'その他';
  eventName: string;
  url: string;
  contactStaff: string;
  memo: string;
}

export default function IntegratedApp() {
  // メインタブ ('transactions' | 'clients' | 'tasks' | 'local' | 'transactions_list')
  const [activeTab, setActiveTab] = useState<'transactions' | 'clients' | 'tasks' | 'local' | 'transactions_list'>('transactions');

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

  // --- 1. 売上管理の状態 ---
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

  const [tickets] = useState<TicketProgress[]>([
    { id: '1', client: '鈴木 蓮', name: 'ジュニア体幹 4回券', total: 4, remaining: 1 },
    { id: '2', client: '山田 太郎', name: 'パーソナル 8回券', total: 8, remaining: 5 },
  ]);

  const [trials] = useState<TrialClient[]>([
    { id: '1', date: '2026-09-02', name: '高橋 一郎', age: 35, staff: 'TAKA', converted: true },
    { id: '2', date: '2026-09-06', name: '渡辺 美咲', age: 28, staff: 'NANA', converted: false },
  ]);

  // --- 2. 顧客カルテの状態 ---
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

  // 新規セッション・測定入力
  const [newSessionDate, setNewSessionDate] = useState('2026-09-08');
  const [newSessionContent, setNewSessionContent] = useState('');
  const [newSessionHomework, setNewSessionHomework] = useState('');
  const [newSessionImagePreview, setNewSessionImagePreview] = useState<string>('');

  const [newMeasDate, setNewMeasDate] = useState('2026-09-08');
  const [newWeight, setNewWeight] = useState<string>('');
  const [newBodyFat, setNewBodyFat] = useState<string>('');
  const [newMuscleMass, setNewMuscleMass] = useState<string>('');

  // --- 3. タスク・議事録の状態 ---
  const [taskSubTab, setTaskSubTab] = useState<'tasks' | 'notes'>('tasks');
  const [taskMonthFilter, setTaskMonthFilter] = useState<string>('2026-09');
  const [taskGlobalSearch, setTaskGlobalSearch] = useState<string>('');

  const [tasks, setTasks] = useState<TaskItem[]>([
    { id: '1', title: 'ジュニア体幹クリニックの告知Instagram投稿作成', category: 'SNS', staff: 'TAKA', dueDate: '2026-09-10', repeat: 'none', isImportant: true, completed: false },
    { id: '2', title: '3ヶ月定期計測の対象者への連絡', category: '顧客フォロー', staff: 'NANA', dueDate: '2026-09-12', repeat: 'monthly', isImportant: false, completed: false },
  ]);

  // タスク追加フォーム
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('SNS');
  const [customTaskCategory, setCustomTaskCategory] = useState('');
  const [newTaskStaff, setNewTaskStaff] = useState<'TAKA' | 'NANA'>('TAKA');
  const [newTaskDueDate, setNewTaskDueDate] = useState('2026-09-10');
  const [newTaskRepeat, setNewTaskRepeat] = useState<'none' | 'weekly' | 'monthly'>('none');
  const [newTaskImportant, setNewTaskImportant] = useState(false);

  // 議事録
  const [meetingNotes, setMeetingNotes] = useState<MeetingNote[]>([
    { id: '1', date: '2026-09-01', title: '9月秋の体幹体験キャンペーンMT', category: 'キャンペーン', content: 'ターゲット：近隣小学生。特典：体験料無料＆ボトルプレゼント。' }
  ]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState('キャンペーン');
  const [customNoteCategory, setCustomNoteCategory] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');

  // キャンペーンプリセットタスク
  const campaignPresetTasks = [
    'レジ設定', 'SNS告知準備', 'SNS投稿予約', 'チラシ準備', 'チラシ掲示', '報告書作成'
  ];

  // --- 4. 近隣情報の状態 ---
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

  // --- 計算関数 ---
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

  // 売上計算
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
      {/* 最上部：グローバル青ヘッダーナビゲーション */}
      <header className="bg-[#487399] text-white px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-8">
          <span className="font-bold text-lg tracking-wider">GYM MANAGER</span>
          <nav className="flex items-center gap-2 text-sm font-medium">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-3 py-1.5 rounded transition-all ${activeTab === 'transactions' ? 'bg-white text-[#487399] font-bold shadow-sm' : 'text-blue-100 hover:bg-white/10'}`}
            >
              売上管理
            </button>
            <button
              onClick={() => setActiveTab('clients')}
              className={`px-3 py-1.5 rounded transition-all ${activeTab === 'clients' ? 'bg-white text-[#487399] font-bold shadow-sm' : 'text-blue-100 hover:bg-white/10'}`}
            >
              顧客カルテ
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-3 py-1.5 rounded transition-all ${activeTab === 'tasks' ? 'bg-white text-[#487399] font-bold shadow-sm' : 'text-blue-100 hover:bg-white/10'}`}
            >
              タスク・議事録
            </button>
            <button
              onClick={() => setActiveTab('local')}
              className={`px-3 py-1.5 rounded transition-all ${activeTab === 'local' ? 'bg-white text-[#487399] font-bold shadow-sm' : 'text-blue-100 hover:bg-white/10'}`}
            >
              近隣情報
            </button>
            <button
              onClick={() => setActiveTab('transactions_list')}
              className={`px-3 py-1.5 rounded transition-all ${activeTab === 'transactions_list' ? 'bg-white text-[#487399] font-bold shadow-sm' : 'text-blue-100 hover:bg-white/10'}`}
            >
              取引一覧
            </button>
          </nav>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-8">
        {/* コンテンツエリア内ヘッダー：GYM MANAGER横タブを削除しSquare連携状態とボタンのみ配置 */}
        <div className="bg-white px-6 py-4 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="font-black text-gray-900 text-lg">GYM MANAGER</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 bg-blue-50 text-blue-700 font-bold rounded-lg text-xs border border-blue-100">
              {syncMessage}
            </span>
            <button
              onClick={handleSquareSync}
              disabled={isSyncing}
              className="px-3 py-1.5 bg-gray-900 text-white font-bold rounded-lg text-xs hover:bg-gray-800 transition-all shadow-sm"
            >
              {isSyncing ? '同期中...' : 'Squareデータ手動更新'}
            </button>
          </div>
        </div>

        {/* --- Tab 1: 売上管理画面 --- */}
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
                          className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px]"
                        >
                          保存
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsEditingTarget(true)}
                        className="text-blue-600 hover:underline"
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
                <p className="text-2xl font-black text-blue-600">¥{monthlySales.toLocaleString()}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
                <p className="text-xs font-bold text-gray-400">体験者数 / 回数券販売</p>
                <p className="text-xl font-bold text-gray-900">{filteredByMonth.filter(t => t.type === '体験').length}名 <span className="text-xs text-gray-400 font-normal">/</span> {filteredByMonth.filter(t => t.type === '回数券').length}件</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-gray-400">月間目標達成率</span>
                  <span className="text-blue-600">{achievementRate}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${achievementRate}%` }}></div>
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
                          <td className="p-3"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.staff === 'TAKA' ? 'bg-indigo-50 text-indigo-700' : 'bg-pink-50 text-pink-700'}`}>{t.staff}</span></td>
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
                    <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 flex justify-between items-center">
                      <span className="font-bold text-indigo-900">TAKA 担当</span>
                      <span className="font-black text-indigo-700 text-sm">¥{takaSales.toLocaleString()}</span>
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

        {/* --- Tab 2: 顧客カルテ画面 --- */}
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
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all text-xs space-y-1.5 ${isSelected ? 'border-blue-600 bg-blue-50/40 shadow-sm' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
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
                            <span className="text-blue-600 font-bold">残り {tk.remaining}回 / 全{tk.total}回</span>
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
                      className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
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
                        {s.homeworkContent && <p className="text-blue-600 bg-blue-50 p-1.5 rounded">宿題: {s.homeworkContent}</p>}
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
                        className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
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
                                {idx > 0 && <p className="text-[10px] text-blue-600 font-bold">初回比: +{(m.muscleMass - firstM.muscleMass).toFixed(1)}kg</p>}
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

        {/* --- Tab 3: タスク・議事録画面 --- */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-wrap justify-between items-center gap-4">
              <div className="flex gap-2 text-xs font-bold">
                <button
                  onClick={() => setTaskSubTab('tasks')}
                  className={`px-3 py-1.5 rounded-lg ${taskSubTab === 'tasks' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  タスク管理
                </button>
                <button
                  onClick={() => setTaskSubTab('notes')}
                  className={`px-3 py-1.5 rounded-lg ${taskSubTab === 'notes' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  議事録管理
                </button>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <input
                  type="month"
                  value={taskMonthFilter}
                  onChange={(e) => setTaskMonthFilter(e.target.value)}
                  className="p-1.5 border rounded-lg bg-gray-50"
                />
                <input
                  type="text"
                  placeholder="全体キーワード検索..."
                  value={taskGlobalSearch}
                  onChange={(e) => setTaskGlobalSearch(e.target.value)}
                  className="p-1.5 border rounded-lg bg-gray-50 w-48"
                />
              </div>
            </div>

            {taskSubTab === 'tasks' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 text-xs">
                  <h2 className="text-base font-bold text-gray-900">新規タスク登録</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-gray-500 mb-1 font-bold">タスク内容</label>
                      <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="タスク名を入力..."
                        className="w-full p-2 border rounded-xl bg-gray-50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-gray-500 mb-1 font-bold">担当者</label>
                        <select
                          value={newTaskStaff}
                          onChange={(e) => setNewTaskStaff(e.target.value as 'TAKA' | 'NANA')}
                          className="w-full p-2 border rounded-xl bg-gray-50"
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
                          className="w-full p-2 border rounded-xl bg-gray-50"
                        >
                          <option value="SNS">SNS</option>
                          <option value="顧客フォロー">顧客フォロー</option>
                          <option value="事務">事務</option>
                          <option value="その他">その他 (手入力)</option>
                        </select>
                      </div>
                    </div>
                    {newTaskCategory === 'その他' && (
                      <input
                        type="text"
                        placeholder="カテゴリーを手入力..."
                        value={customTaskCategory}
                        onChange={(e) => setCustomTaskCategory(e.target.value)}
                        className="w-full p-2 border rounded-xl bg-gray-50"
                      />
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-gray-500 mb-1 font-bold">期日</label>
                        <input
                          type="date"
                          value={newTaskDueDate}
                          onChange={(e) => setNewTaskDueDate(e.target.value)}
                          className="w-full p-2 border rounded-xl bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-500 mb-1 font-bold">繰り返し設定</label>
                        <select
                          value={newTaskRepeat}
                          onChange={(e) => setNewTaskRepeat(e.target.value as any)}
                          className="w-full p-2 border rounded-xl bg-gray-50"
                        >
                          <option value="none">単発</option>
                          <option value="weekly">毎週</option>
                          <option value="monthly">毎月</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="important"
                        checked={newTaskImportant}
                        onChange={(e) => setNewTaskImportant(e.target.checked)}
                        className="w-4 h-4 text-red-600 rounded"
                      />
                      <label htmlFor="important" className="font-bold text-red-600">重要フラグを設定する</label>
                    </div>
                    <button
                      onClick={() => {
                        if (!newTaskTitle) return;
                        const finalCat = newTaskCategory === 'その他' ? (customTaskCategory || 'その他') : newTaskCategory;
                        setTasks([...tasks, {
                          id: String(Date.now()),
                          title: newTaskTitle,
                          category: finalCat,
                          staff: newTaskStaff,
                          dueDate: newTaskDueDate,
                          repeat: newTaskRepeat,
                          isImportant: newTaskImportant,
                          completed: false
                        }]);
                        setNewTaskTitle('');
                      }}
                      className="w-full py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800"
                    >
                      タスクを追加
                    </button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 lg:col-span-2">
                  <h2 className="text-base font-bold text-gray-900">タスク一覧 (月別・キーワード絞り込み)</h2>
                  <div className="space-y-3">
                    {tasks
                      .filter(t => t.dueDate.startsWith(taskMonthFilter))
                      .filter(t => t.title.toLowerCase().includes(taskGlobalSearch.toLowerCase()) || t.category.toLowerCase().includes(taskGlobalSearch.toLowerCase()))
                      .map(t => (
                        <div
                          key={t.id}
                          className={`p-3.5 border rounded-xl flex items-center justify-between text-xs transition-all ${t.isImportant ? 'border-red-300 bg-red-50/30' : 'bg-gray-50 border-gray-200'}`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={t.completed}
                              onChange={() => setTasks(tasks.map(tk => tk.id === t.id ? { ...tk, completed: !tk.completed } : tk))}
                              className="w-4 h-4 rounded text-blue-600"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                {t.isImportant && <span className="px-1.5 py-0.5 bg-red-600 text-white font-black rounded text-[9px]">重要</span>}
                                <p className={`font-bold ${t.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>{t.title}</p>
                              </div>
                              <p className="text-[10px] text-gray-400 mt-0.5">期日: {t.dueDate} | 繰り返し: {t.repeat === 'weekly' ? '毎週' : t.repeat === 'monthly' ? '毎月' : 'なし'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.staff === 'TAKA' ? 'bg-indigo-100 text-indigo-800' : 'bg-pink-100 text-pink-800'}`}>
                              {t.staff}
                            </span>
                            <span className="px-2 py-0.5 bg-gray-200 text-gray-700 font-bold rounded text-[10px]">{t.category}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 text-xs">
                  <h2 className="text-base font-bold text-gray-900">議事録の新規作成</h2>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="議題・タイトル..."
                      value={newNoteTitle}
                      onChange={(e) => setNewNoteTitle(e.target.value)}
                      className="w-full p-2 border rounded-xl bg-gray-50"
                    />
                    <div>
                      <label className="block text-gray-500 mb-1 font-bold">カテゴリー</label>
                      <select
                        value={newNoteCategory}
                        onChange={(e) => setNewNoteCategory(e.target.value)}
                        className="w-full p-2 border rounded-xl bg-gray-50"
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
                        className="w-full p-2 border rounded-xl bg-gray-50"
                      />
                    )}
                    {newNoteCategory === 'キャンペーン' && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                        <p className="font-bold text-amber-900">キャンペーン定型タスクの自動展開</p>
                        <p className="text-[10px] text-amber-700">登録時に以下のタスクを一覧に自動追加します：</p>
                        <div className="flex flex-wrap gap-1">
                          {campaignPresetTasks.map((pt, i) => (
                            <span key={i} className="px-2 py-0.5 bg-white border text-[10px] rounded text-gray-700">{pt}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <textarea
                      rows={4}
                      placeholder="決定事項、メモ..."
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      className="w-full p-2 border rounded-xl bg-gray-50"
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
                          content: newNoteContent
                        };
                        setMeetingNotes([newNote, ...meetingNotes]);

                        if (newNoteCategory === 'キャンペーン') {
                          const generatedTasks: TaskItem[] = campaignPresetTasks.map((pt, idx) => ({
                            id: String(Date.now() + idx),
                            title: `[${newNoteTitle}] ${pt}`,
                            category: 'キャンペーン',
                            staff: 'TAKA',
                            dueDate: '2026-09-15',
                            repeat: 'none',
                            isImportant: false,
                            completed: false
                          }));
                          setTasks([...tasks, ...generatedTasks]);
                        }

                        setNewNoteTitle('');
                        setNewNoteContent('');
                      }}
                      className="w-full py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800"
                    >
                      議事録を保存する
                    </button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 lg:col-span-2">
                  <h2 className="text-base font-bold text-gray-900">議事録一覧</h2>
                  <div className="space-y-4">
                    {meetingNotes.map(note => (
                      <div key={note.id} className="p-4 border rounded-2xl bg-white space-y-2 text-xs shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-black text-sm text-gray-900">{note.title}</span>
                          <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold rounded text-[10px]">{note.category}</span>
                        </div>
                        <p className="text-gray-400 font-bold">{note.date}</p>
                        <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- Tab 4: 近隣情報画面 --- */}
        {activeTab === 'local' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 text-xs">
              <h2 className="text-base font-bold text-gray-900">近隣情報・イベントの新規追加</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-500 mb-1 font-bold">学校・スポーツチーム名</label>
                  <input
                    type="text"
                    placeholder="例: 板橋区立第一小学校"
                    value={newLocalName}
                    onChange={(e) => setNewLocalName(e.target.value)}
                    className="w-full p-2 border rounded-xl bg-gray-50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-500 mb-1 font-bold">対象区</label>
                    <select
                      value={newLocalDistrict}
                      onChange={(e) => setNewLocalDistrict(e.target.value as any)}
                      className="w-full p-2 border rounded-xl bg-gray-50"
                    >
                      <option value="板橋区">板橋区</option>
                      <option value="北区">北区</option>
                      <option value="その他">その他</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1 font-bold">担当者名</label>
                    <input
                      type="text"
                      value={newLocalStaff}
                      onChange={(e) => setNewLocalStaff(e.target.value)}
                      className="w-full p-2 border rounded-xl bg-gray-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-500 mb-1 font-bold">イベント名</label>
                  <input
                    type="text"
                    placeholder="例: 秋季運動会、体験会"
                    value={newLocalEvent}
                    onChange={(e) => setNewLocalEvent(e.target.value)}
                    className="w-full p-2 border rounded-xl bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1 font-bold">詳細URL (外部リンク)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newLocalUrl}
                    onChange={(e) => setNewLocalUrl(e.target.value)}
                    className="w-full p-2 border rounded-xl bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1 font-bold">メモ</label>
                  <textarea
                    rows={2}
                    placeholder="チラシ配布の可否や挨拶予定など..."
                    value={newLocalMemo}
                    onChange={(e) => setNewLocalMemo(e.target.value)}
                    className="w-full p-2 border rounded-xl bg-gray-50"
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
                  className="w-full py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800"
                >
                  情報を追加
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 lg:col-span-2">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <h2 className="text-base font-bold text-gray-900">近隣情報一覧</h2>
                <input
                  type="text"
                  placeholder="学校名、イベント名、メモで検索..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  className="p-2 border rounded-xl text-xs bg-gray-50 w-64"
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
                    <div key={info.id} className="p-4 border rounded-2xl bg-white space-y-2 text-xs shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-black text-sm text-gray-900">{info.name}</span>
                        <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded text-[10px]">{info.district}</span>
                      </div>
                      <div className="flex justify-between items-center text-gray-600">
                        <p className="font-bold">イベント: {info.eventName || '未設定'}</p>
                        <p className="text-gray-400">担当: {info.contactStaff}</p>
                      </div>
                      {info.url && (
                        <a href={info.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline block font-bold text-[11px]">
                          🔗 {info.url}
                        </a>
                      )}
                      {info.memo && <p className="text-gray-500 bg-gray-50 p-2 rounded-lg">{info.memo}</p>}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* --- Tab 5: 取引一覧画面 --- */}
        {activeTab === 'transactions_list' && (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900">全取引一覧</h2>
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
                  {transactions.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50/50">
                      <td className="p-3 text-gray-500">{t.date}</td>
                      <td className="p-3 font-bold text-gray-900">{t.client}</td>
                      <td className="p-3 text-gray-700">{t.item}</td>
                      <td className="p-3"><span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-600">{t.type}</span></td>
                      <td className="p-3"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.staff === 'TAKA' ? 'bg-indigo-50 text-indigo-700' : 'bg-pink-50 text-pink-700'}`}>{t.staff}</span></td>
                      <td className="p-3 text-right font-black text-gray-900">¥{t.amount.toLocaleString()}</td>
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
