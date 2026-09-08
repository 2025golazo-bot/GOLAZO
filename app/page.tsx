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

interface TaskItem {
  id: string;
  title: string;
  category: string;
  dueDate: string;
  completed: boolean;
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
  parentName: string; // Square連携データ（保護者名）
  childName: string;  // 受講生（子供名）
  kana: string;
  birthDate: string;  // 'YYYY-MM-DD'
  firstLessonDate: string; // 初回レッスン日
  lastBookingDate: string; // 最終予約日
  concerns: string;   // 悩み
  goal: string;       // 目標
  memo: string;       // メモ
  tickets: { name: string; total: number; remaining: number }[];
  sessions: SessionRecord[];
  measurements: MeasurementRecord[];
}

export default function IntegratedApp() {
  // タブ切り替えステート ('transactions' | 'clients' | 'tasks')
  const [activeTab, setActiveTab] = useState<'transactions' | 'clients' | 'tasks'>('transactions');

  // --- 売上管理の状態 ---
  const [monthlyTarget, setMonthlyTarget] = useState<number>(500000);
  const [isEditingTarget, setIsEditingTarget] = useState<boolean>(false);
  const [tempTarget, setTempTarget] = useState<string>(monthlyTarget.toString());
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string>('Squareデータ連携中');

  // トランザクションデータ
  const [transactions, setTransactions] = useState<TransactionItem[]>([
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

  // --- タスク管理の状態 ---
  const [tasks, setTasks] = useState<TaskItem[]>([
    { id: '1', title: 'ジュニア体幹クリニックの告知Instagram投稿作成', category: 'SNS発信', dueDate: '2026-09-10', completed: false },
    { id: '2', title: '3ヶ月定期計測の対象者への連絡', category: '顧客フォロー', dueDate: '2026-09-12', completed: false },
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('SNS発信');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  // --- 顧客カルテの状態 ---
  const [clients, setClients] = useState<ClientProfile[]>([
    {
      id: 'c1',
      parentName: '鈴木 健一',
      childName: '鈴木 蓮',
      kana: 'スズキ レン',
      birthDate: '2014-05-15',
      firstLessonDate: '2026-03-10',
      lastBookingDate: '2026-09-01', // 1週間前 -> アラートなし
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
      lastBookingDate: '2026-08-10', // 約1ヶ月前 -> 🚨アラート対象
      concerns: '柔軟性の向上、股関節の硬さ',
      goal: 'レギュラー定着とケガ予防',
      memo: '少し恥ずかしがり屋だが集中力は高い。',
      tickets: [{ name: 'パーソナル 8回券', total: 8, remaining: 5 }],
      sessions: [
        { id: 's2', date: '2026-08-10', content: '股関節モビリティと下半身安定トレーニング', homeworkContent: '股関節ストレッチ毎日10分', homeworkImage: '' }
      ],
      measurements: [
        { id: 'm3', date: '2026-01-15', weight: 40.0, bodyFat: 20.0, muscleMass: 30.0, postureImages: [] }
      ]
    }
  ]);

  const [selectedClientId, setSelectedClientId] = useState<string>('c1');
  const [clientSubTab, setClientSubTab] = useState<'info' | 'sessions' | 'measurements'>('info');
  const [clientSearchQuery, setClientSearchQuery] = useState<string>('');

  // 新規セッション入力用
  const [newSessionDate, setNewSessionDate] = useState('2026-09-08');
  const [newSessionContent, setNewSessionContent] = useState('');
  const [newSessionHomework, setNewSessionHomework] = useState('');
  const [newSessionImagePreview, setNewSessionImagePreview] = useState<string>('');

  // 新規測定入力用
  const [newMeasDate, setNewMeasDate] = useState('2026-09-08');
  const [newWeight, setNewWeight] = useState<string>('');
  const [newBodyFat, setNewBodyFat] = useState<string>('');
  const [newMuscleMass, setNewMuscleMass] = useState<string>('');

  // Square手動データ同期シミュレーション
  const handleSquareSync = () => {
    setIsSyncing(true);
    setSyncMessage('Squareから同期中...');
    setTimeout(() => {
      setIsSyncing(false);
      setSyncMessage('同期完了 (最新)');
    }, 1000);
  };

  // --- 計算ロジック ---
  // 年齢自動計算関数
  const calculateAge = (birthDateStr: string) => {
    if (!birthDateStr) return 0;
    const today = new Date('2026-09-08');
    const birth = new Date(birthDateStr);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // アラート判定関数 (最終予約日基準)
  const getAlertStatus = (lastBookingDateStr: string) => {
    if (!lastBookingDateStr) return null;
    const today = new Date('2026-09-08');
    const lastDate = new Date(lastBookingDateStr);
    const diffTime = today.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 30) {
      return { type: 'danger', text: '🚨 1ヶ月未予約' };
    } else if (diffDays >= 14) {
      return { type: 'warning', text: '⚠️ 最終予約から2週間未予約' };
    }
    return null;
  };

  // 次回測定月の算出 (初回セッション日ベースで3ヶ月ごと)
  const getNextMeasurementInfo = (firstDateStr: string) => {
    if (!firstDateStr) return { targetMonthsText: '未設定', isTargetMonthNow: false };
    const firstDate = new Date(firstDateStr);
    const firstMonth = firstDate.getMonth() + 1; // 1-12
    // 3ヶ月ごとの月を算出 (例: 1月なら 1, 4, 7, 10)
    const targetMonths = [firstMonth, (firstMonth + 2) % 12 || 12, (firstMonth + 5) % 12 || 12, (firstMonth + 8) % 12 || 12].sort((a, b) => a - b);
    
    const currentMonth = 9; // 9月 (2026-09-08)
    const isTargetMonthNow = targetMonths.includes(currentMonth);

    return {
      targetMonthsText: targetMonths.map(m => `${m}月`).join(' / '),
      isTargetMonthNow
    };
  };

  // 売上管理の集計計算
  const filteredByMonth = transactions.filter(t => t.date.startsWith(selectedMonth));
  const filteredByYear = transactions.filter(t => t.date.startsWith(selectedYear));
  const monthlySales = filteredByMonth.reduce((sum, t) => sum + t.amount, 0);
  const yearlySales = filteredByYear.reduce((sum, t) => sum + t.amount, 0);
  const achievementRate = monthlyTarget > 0 ? Math.min(Math.round((monthlySales / monthlyTarget) * 100), 100) : 0;
  const todayStr = '2026-09-08';
  const todaySales = transactions.filter(t => t.date === todayStr).reduce((sum, t) => sum + t.amount, 0);
  const trialCount = filteredByMonth.filter(t => t.type === '体験').length;
  const ticketCount = filteredByMonth.filter(t => t.type === '回数券').length;
  const productCount = filteredByMonth.filter(t => t.type === '物販').length;
  const takaSales = filteredByMonth.filter(t => t.staff === 'TAKA').reduce((sum, t) => sum + t.amount, 0);
  const nanaSales = filteredByMonth.filter(t => t.staff === 'NANA').reduce((sum, t) => sum + t.amount, 0);
  const campaignStats = [
    { name: '夏休みキャンペーン', count: filteredByMonth.filter(t => t.campaign === '夏休みキャンペーン').length, revenue: filteredByMonth.filter(t => t.campaign === '夏休みキャンペーン').reduce((sum, t) => sum + t.amount, 0) },
    { name: 'SNS初回特典', count: filteredByMonth.filter(t => t.campaign === 'SNS初回特典').length, revenue: filteredByMonth.filter(t => t.campaign === 'SNS初回特典').reduce((sum, t) => sum + t.amount, 0) },
  ];
  const totalTrialsCount = trials.filter(t => t.date.startsWith(selectedMonth)).length;
  const convertedTrialsCount = trials.filter(t => t.date.startsWith(selectedMonth) && t.converted).length;
  const cvrRate = totalTrialsCount > 0 ? Math.round((convertedTrialsCount / totalTrialsCount) * 100) : 0;

  // 現在選択されている顧客
  const currentClient = clients.find(c => c.id === selectedClientId) || clients[0];

  // 顧客の検索フィルター
  const searchedClients = clients.filter(c => 
    c.childName.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
    c.parentName.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
    c.kana.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
    c.concerns.toLowerCase().includes(clientSearchQuery.toLowerCase())
  );

  return (
    <main className="p-6 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen font-sans">
      {/* 共通ヘッダー & タブ切り替え */}
      <div className="bg-white px-6 py-4 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-6">
          <span className="font-black text-gray-900 text-lg">GYM MANAGER</span>
          <div className="flex gap-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'transactions' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              売上管理
            </button>
            <button
              onClick={() => setActiveTab('clients')}
              className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'clients' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              顧客カルテ
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'tasks' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              タスク・議事録
            </button>
          </div>
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
              <p className="text-xl font-bold text-gray-900">{trialCount}名 <span className="text-xs text-gray-400 font-normal">/</span> {ticketCount}件 <span className="text-xs text-gray-400 font-normal">(物販:{productCount})</span></p>
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

              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <h2 className="text-base font-bold text-gray-900">キャンペーン貢献度分析</h2>
                <div className="space-y-3">
                  {campaignStats.map((c, i) => (
                    <div key={i} className="p-3 border rounded-xl bg-gray-50 space-y-1 text-xs">
                      <div className="flex justify-between font-bold text-gray-900">
                        <span>{c.name}</span>
                        <span className="text-blue-600">¥{c.revenue.toLocaleString()}</span>
                      </div>
                      <p className="text-[11px] text-gray-400">適用件数: {c.count}件</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-gray-900">回数券消化進捗</h2>
              <div className="space-y-4">
                {tickets.map((tk) => {
                  const percent = Math.round(((tk.total - tk.remaining) / tk.total) * 100);
                  return (
                    <div key={tk.id} className="p-3.5 border rounded-xl bg-gray-50 space-y-2 text-xs">
                      <div className="flex justify-between font-bold">
                        <span className="text-gray-900">{tk.client} <span className="text-gray-400 font-normal">({tk.name})</span></span>
                        <span className="text-blue-600">残り {tk.remaining}回 / 全{tk.total}回</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-bold text-gray-900">体験者トラッキング (CVR)</h2>
                <span className="px-2.5 py-1 bg-green-50 text-green-700 font-bold rounded-lg text-xs border border-green-100">
                  成約率 (CVR): {cvrRate}% ({convertedTrialsCount}/{totalTrialsCount}名)
                </span>
              </div>
              <div className="space-y-2">
                {trials.map(tr => (
                  <div key={tr.id} className="p-3 border rounded-xl flex items-center justify-between text-xs bg-white">
                    <div>
                      <p className="font-bold text-gray-900">{tr.name} <span className="text-gray-400 font-normal">({tr.age}歳)</span></p>
                      <p className="text-[11px] text-gray-400 mt-0.5">体験日: {tr.date} / 担当: {tr.staff}</p>
                    </div>
                    <div>
                      {tr.converted ? (
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg text-[10px]">回数券購入 (CV)</span>
                      ) : (
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-500 font-bold rounded-lg text-[10px]">検討中・未購入</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Tab 2: 顧客カルテ画面 --- */}
      {activeTab === 'clients' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側：検索＆顧客一覧パネル */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900">顧客一覧・検索</h2>
            <div>
              <input
                type="text"
                placeholder="受講生名、保護者名、悩みで検索..."
                value={clientSearchQuery}
                onChange={(e) => setClientSearchQuery(e.target.value)}
                className="w-full p-2.5 border rounded-xl text-xs bg-gray-50"
              />
            </div>
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

          {/* 右側：選択中顧客のカルテ詳細＆サブタブ */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 lg:col-span-2">
            {/* サブタブボタン */}
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

            {/* サブタブ1: 顧客基本情報 ＆ 手動編集機能 */}
            {clientSubTab === 'info' && (
              <div className="space-y-6 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-xl bg-gray-50 space-y-2">
                    <p className="font-bold text-gray-400">Square連携データ</p>
                    <div>
                      <label className="block text-gray-500 mb-1">保護者名 (Square紐付け)</label>
                      <input
                        type="text"
                        value={currentClient.parentName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setClients(clients.map(c => c.id === currentClient.id ? { ...c, parentName: val } : c));
                        }}
                        className="w-full p-2 border rounded-lg bg-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">受講生（子供名）</label>
                      <input
                        type="text"
                        value={currentClient.childName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setClients(clients.map(c => c.id === currentClient.id ? { ...c, childName: val } : c));
                        }}
                        className="w-full p-2 border rounded-lg bg-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">フリガナ</label>
                      <input
                        type="text"
                        value={currentClient.kana}
                        onChange={(e) => {
                          const val = e.target.value;
                          setClients(clients.map(c => c.id === currentClient.id ? { ...c, kana: val } : c));
                        }}
                        className="w-full p-2 border rounded-lg bg-white"
                      />
                    </div>
                  </div>

                  <div className="p-4 border rounded-xl bg-gray-50 space-y-2">
                    <p className="font-bold text-gray-400">年齢・日程・チケット情報</p>
                    <div className="flex justify-between items-center p-2 bg-white rounded border">
                      <span className="text-gray-500">生年月日 / 自動年齢</span>
                      <span className="font-bold text-gray-900">{currentClient.birthDate} ({calculateAge(currentClient.birthDate)}歳) ※常時最新化</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded border">
                      <span className="text-gray-500">初回レッスン日</span>
                      <span className="font-bold text-gray-900">{currentClient.firstLessonDate}</span>
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">チケット購入履歴一覧</label>
                      <div className="space-y-1">
                        {currentClient.tickets.map((tk, idx) => (
                          <div key={idx} className="p-2 bg-white rounded border flex justify-between">
                            <span className="font-bold">{tk.name}</span>
                            <span className="text-blue-600 font-bold">残り {tk.remaining}回 / 全{tk.total}回</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-xl bg-gray-50 space-y-3">
                  <p className="font-bold text-gray-400">手動編集項目 (悩み・目標・メモ)</p>
                  <div>
                    <label className="block text-gray-500 mb-1">お悩み</label>
                    <input
                      type="text"
                      value={currentClient.concerns}
                      onChange={(e) => {
                        const val = e.target.value;
                        setClients(clients.map(c => c.id === currentClient.id ? { ...c, concerns: val } : c));
                      }}
                      className="w-full p-2.5 border rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1">目標</label>
                    <input
                      type="text"
                      value={currentClient.goal}
                      onChange={(e) => {
                        const val = e.target.value;
                        setClients(clients.map(c => c.id === currentClient.id ? { ...c, goal: val } : c));
                      }}
                      className="w-full p-2.5 border rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1">メモ</label>
                    <textarea
                      rows={2}
                      value={currentClient.memo}
                      onChange={(e) => {
                        const val = e.target.value;
                        setClients(clients.map(c => c.id === currentClient.id ? { ...c, memo: val } : c));
                      }}
                      className="w-full p-2.5 border rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* サブタブ2: セッション記録タブ */}
            {clientSubTab === 'sessions' && (
              <div className="space-y-6 text-xs">
                {/* 新規セッション入力フォーム */}
                <div className="p-4 border rounded-xl bg-gray-50 space-y-3">
                  <p className="font-bold text-gray-900">新規セッション記録の追加</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-500 mb-1">実施日</label>
                      <input
                        type="date"
                        value={newSessionDate}
                        onChange={(e) => setNewSessionDate(e.target.value)}
                        className="w-full p-2 border rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">宿題内容</label>
                      <input
                        type="text"
                        placeholder="例: フロントプランク30秒"
                        value={newSessionHomework}
                        onChange={(e) => setNewSessionHomework(e.target.value)}
                        className="w-full p-2 border rounded-lg bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1">トレーニング内容</label>
                    <textarea
                      rows={2}
                      placeholder="今日のメニューや様子を入力..."
                      value={newSessionContent}
                      onChange={(e) => setNewSessionContent(e.target.value)}
                      className="w-full p-2 border rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1">宿題写真のアップロード＆プレビュー</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const reader = new FileReader();
                          reader.onload = (uploadEvent) => {
                            setNewSessionImagePreview(uploadEvent.target?.result as string);
                          };
                          reader.readAsDataURL(e.target.files[0]);
                        }
                      }}
                      className="w-full p-2 border rounded-lg bg-white text-[11px]"
                    />
                    {newSessionImagePreview && (
                      <div className="mt-2 flex items-center gap-3">
                        <img src={newSessionImagePreview} alt="プレビュー" className="w-16 h-16 object-cover rounded-lg border" />
                        <span className="text-gray-400 text-[10px]">プレビュー表示中</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (!newSessionContent) return;
                      const newSession: SessionRecord = {
                        id: String(Date.now()),
                        date: newSessionDate,
                        content: newSessionContent,
                        homeworkContent: newSessionHomework,
                        homeworkImage: newSessionImagePreview
                      };
                      setClients(clients.map(c => c.id === currentClient.id ? { ...c, sessions: [newSession, ...c.sessions] } : c));
                      setNewSessionContent('');
                      setNewSessionHomework('');
                      setNewSessionImagePreview('');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all"
                  >
                    セッション記録を追加
                  </button>
                </div>

                {/* 時系列セッション履歴表示 */}
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 text-sm">時系列セッション履歴</h3>
                  {currentClient.sessions.map((s) => (
                    <div key={s.id} className="p-4 border rounded-xl bg-white space-y-2 shadow-sm">
                      <div className="flex justify-between items-center text-gray-400 font-bold">
                        <span>実施日: {s.date}</span>
                      </div>
                      <p className="text-gray-900 font-bold">{s.content}</p>
                      {s.homeworkContent && (
                        <p className="text-blue-600 bg-blue-50 p-2 rounded-lg">宿題: {s.homeworkContent}</p>
                      )}
                      {s.homeworkImage && (
                        <div className="mt-2">
                          <img src={s.homeworkImage} alt="宿題写真" className="w-24 h-24 object-cover rounded-lg border" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* サブタブ3: 3ヶ月測定詳細タブ */}
            {clientSubTab === 'measurements' && (() => {
              const measInfo = getNextMeasurementInfo(currentClient.firstLessonDate);
              const measurements = currentClient.measurements;

              return (
                <div className="space-y-6 text-xs">
                  {/* 次回測定月のハイライト通知 */}
                  <div className={`p-4 rounded-xl border flex justify-between items-center ${measInfo.isTargetMonthNow ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-blue-50 border-blue-100 text-blue-900'}`}>
                    <div>
                      <p className="font-black text-sm">次回測定月のハイライト・スケジュール</p>
                      <p className="text-[11px] mt-0.5">初回セッション日 ({currentClient.firstLessonDate}) を基準にした計測対象月: <span className="font-bold">{measInfo.targetMonthsText}</span></p>
                    </div>
                    {measInfo.isTargetMonthNow && (
                      <span className="px-2.5 py-1 bg-amber-500 text-white font-bold rounded-lg text-[10px] animate-pulse">今月が計測月です！</span>
                    )}
                  </div>

                  {/* 新規測定データ追加フォーム */}
                  <div className="p-4 border rounded-xl bg-gray-50 space-y-3">
                    <p className="font-bold text-gray-900">測定データの追加</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-gray-500 mb-1">測定日</label>
                        <input
                          type="date"
                          value={newMeasDate}
                          onChange={(e) => setNewMeasDate(e.target.value)}
                          className="w-full p-2 border rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-500 mb-1">体重 (kg)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="33.8"
                          value={newWeight}
                          onChange={(e) => setNewWeight(e.target.value)}
                          className="w-full p-2 border rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-500 mb-1">体脂肪率 (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="17.5"
                          value={newBodyFat}
                          onChange={(e) => setNewBodyFat(e.target.value)}
                          className="w-full p-2 border rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-500 mb-1">筋肉量 (kg)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="26.3"
                          value={newMuscleMass}
                          onChange={(e) => setNewMuscleMass(e.target.value)}
                          className="w-full p-2 border rounded-lg bg-white"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (!newWeight) return;
                        const newMeas: MeasurementRecord = {
                          id: String(Date.now()),
                          date: newMeasDate,
                          weight: Number(newWeight),
                          bodyFat: Number(newBodyFat) || 0,
                          muscleMass: Number(newMuscleMass) || 0,
                          postureImages: []
                        };
                        setClients(clients.map(c => c.id === currentClient.id ? { ...c, measurements: [...c.measurements, newMeas] } : c));
                        setNewWeight('');
                        setNewBodyFat('');
                        setNewMuscleMass('');
                      }}
                      className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all"
                    >
                      測定データを追加
                    </button>
                  </div>

                  {/* 数値変化の自動算出テーブル ＆ 画像ストレージ連携 */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 text-sm">測定履歴と数値変化 (初回・前回比)</h3>
                    <div className="space-y-3">
                      {measurements.map((m, idx) => {
                        const firstM = measurements[0];
                        const prevM = idx > 0 ? measurements[idx - 1] : null;

                        const diffFirstWeight = Number((m.weight - firstM.weight).toFixed(1));
                        const diffPrevWeight = prevM ? Number((m.weight - prevM.weight).toFixed(1)) : 0;

                        return (
                          <div key={m.id} className="p-4 border rounded-xl bg-white space-y-3 shadow-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-gray-900">測定日: {m.date} {idx === 0 && <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600 ml-2">初回測定</span>}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div className="p-2 bg-gray-50 rounded-lg">
                                <p className="text-gray-400">体重</p>
                                <p className="text-base font-black text-gray-900">{m.weight} kg</p>
                                {idx > 0 && (
                                  <p className={`text-[10px] font-bold ${diffPrevWeight <= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                    前回比: {diffPrevWeight > 0 ? `+${diffPrevWeight}` : diffPrevWeight}kg
                                  </p>
                                )}
                              </div>
                              <div className="p-2 bg-gray-50 rounded-lg">
                                <p className="text-gray-400">体脂肪率</p>
                                <p className="text-base font-black text-gray-900">{m.bodyFat} %</p>
                              </div>
                              <div className="p-2 bg-gray-50 rounded-lg">
                                <p className="text-gray-400">筋肉量</p>
                                <p className="text-base font-black text-gray-900">{m.muscleMass} kg</p>
                                {idx > 0 && (
                                  <p className="text-[10px] font-bold text-blue-600">
                                    初回比: +{(m.muscleMass - firstM.muscleMass).toFixed(1)}kg
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="p-3 border-2 border-dashed rounded-lg bg-gray-50 text-center space-y-1">
                              <p className="text-[11px] text-gray-500">姿勢写真3枚・ケガゼロ/フィジカルテスト結果画像のドラッグ＆ドロップ保存</p>
                              <input type="file" multiple accept="image/*" className="text-[10px]" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* --- Tab 3: タスク・議事録画面 --- */}
      {activeTab === 'tasks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900">新規タスク追加</h2>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-bold">タスク名</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="例: 新規キャンペーンPOP作成"
                  className="w-full p-2.5 border rounded-xl bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-bold">カテゴリ</label>
                <select
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-gray-50"
                >
                  <option value="SNS発信">SNS発信</option>
                  <option value="顧客フォロー">顧客フォロー</option>
                  <option value="施設管理">施設管理</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-bold">期日</label>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-gray-50"
                />
              </div>
              <button
                onClick={() => {
                  if (!newTaskTitle) return;
                  setTasks([...tasks, { id: String(Date.now()), title: newTaskTitle, category: newTaskCategory, dueDate: newTaskDueDate || '2026-09-15', completed: false }]);
                  setNewTaskTitle('');
                }}
                className="w-full py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all"
              >
                追加する
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900">タスク一覧 & 議事録</h2>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="p-3 border rounded-xl bg-gray-50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => {
                        setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
                      }}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <div>
                      <p className={`font-bold ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">期日: {task.dueDate}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded text-[10px]">{task.category}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
