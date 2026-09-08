'use client';

import React, { useState } from 'react';

// ==========================================
// --- 型定義 ---
// ==========================================

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
  const [activeTab, setActiveTab] = useState<'transactions' | 'clients' | 'tasks' | 'local' | 'vendors'>('clients');

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
      parentName: '鈴木 花子',
      childName: '鈴木 蓮',
      kana: 'スズキ レン',
      birthDate: '2013-05-15',
      firstLessonDate: '2026-03-10',
      lastBookingDate: '2026-08-22',
      concerns: 'サッカーの俊敏性向上・体幹ブレの改善',
      goal: 'サッカーで当たり負けない体幹をつける',
      memo: '毎週火曜日に通うジュニア会員。',
      tickets: [{ name: 'ジュニア体幹 4回券', total: 4, remaining: 1 }],
      sessions: [
        { id: 's1', date: '2026-09-01', content: 'コアバランス調整 & リアクションアジリティ', homeworkContent: 'フロントプランク 30秒×3セット', homeworkImage: '' }
      ],
      measurements: [
        { id: 'm1', date: '2026-06-01', weight: 42.5, bodyFat: 16.2, muscleMass: 33.1, postureImages: [] },
        { id: 'm2', date: '2026-09-01', weight: 43.0, bodyFat: 15.8, muscleMass: 34.0, postureImages: [] }
      ]
    },
    {
      id: 'c2',
      parentName: 'ご本人',
      childName: '山田 太郎',
      kana: 'ヤマダ タロウ',
      birthDate: '1990-11-20',
      firstLessonDate: '2026-01-15',
      lastBookingDate: '2026-08-10',
      concerns: '柔軟性の向上、股関節の硬さ',
      goal: 'レギュラー定着とケガ予防',
      memo: '少し恥ずかしがり屋だが集中力は高い。',
      tickets: [{ name: 'パーソナル 8回券', total: 8, remaining: 5 }],
      sessions: [
        { id: 's2', date: '2026-08-08', content: '股関節モビリティと下半身安定トレーニング', homeworkContent: '股関節ストレッチ毎日10分', homeworkImage: '' }
      ],
      measurements: [
        { id: 'm3', date: '2026-01-15', weight: 65.0, bodyFat: 20.0, muscleMass: 48.0, postureImages: [] }
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
    if (diffDays >= 30) return { type: 'danger', text: '要確認アラートあり' };
    if (diffDays >= 14) return { type: 'warning', text: '要確認アラートあり' };
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
    <div className="min-h-screen bg-sky-900/10 font-sans p-6">
      <main className="max-w-7xl mx-auto space-y-6">
        {/* メインヘッダー（ナビゲーションバー） */}
        <div className="bg-[#4882a8] px-8 py-4 rounded-xl shadow-md flex justify-between items-center flex-wrap gap-4 text-white">
          <div className="flex items-center gap-8">
            <span className="font-bold text-xl tracking-wider uppercase">
              GYM MANAGER
            </span>
            <nav className="flex items-center gap-2 text-sm font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('transactions')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'transactions'
                    ? 'bg-white text-[#356586] shadow-sm font-bold'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                売上管理
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('clients')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'clients'
                    ? 'bg-white text-[#356586] shadow-sm font-bold'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                顧客カルテ
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('tasks')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'tasks'
                    ? 'bg-white text-[#356586] shadow-sm font-bold'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                タスク・議事録
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('local')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'local'
                    ? 'bg-white text-[#356586] shadow-sm font-bold'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                近隣情報
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('vendors')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'vendors'
                    ? 'bg-white text-[#356586] shadow-sm font-bold'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                取引一覧
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSquareSync}
              disabled={isSyncing}
              className="px-4 py-1.5 bg-white/20 hover:bg-white/30 text-white font-bold rounded-lg text-xs transition-all border border-white/30"
            >
              {isSyncing ? '同期中...' : syncMessage}
            </button>
          </div>
        </div>

        {/* ==========================================
            PAGE 1: 売上管理画面
           ========================================== */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
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
                          className="px-2 py-0.5 bg-[#4882a8] text-white rounded text-[10px]"
                        >
                          保存
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsEditingTarget(true)}
                        className="text-[#4882a8] hover:underline"
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
                <p className="text-2xl font-black text-[#4882a8]">¥{monthlySales.toLocaleString()}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
                <p className="text-xs font-bold text-gray-400">体験者数 / 回数券販売</p>
                <p className="text-xl font-bold text-gray-900">{filteredByMonth.filter(t => t.type === '体験').length}名 <span className="text-xs text-gray-400 font-normal">/</span> {filteredByMonth.filter(t => t.type === '回数券').length}件</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-gray-400">月間目標達成率</span>
                  <span className="text-[#4882a8]">{achievementRate}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="bg-[#4882a8] h-2.5 rounded-full transition-all duration-500" style={{ width: `${achievementRate}%` }}></div>
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
                          <td className="p-3"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.staff === 'TAKA' ? 'bg-[#4882a8]/20 text-[#2c5370]' : 'bg-pink-100 text-pink-700'}`}>{t.staff}</span></td>
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
                      <span className="font-black text-[#4882a8] text-sm">¥{takaSales.toLocaleString()}</span>
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
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h1 className="text-xl font-bold text-gray-900 mb-1">顧客カルテ管理（自動更新・自動判定）</h1>
              <p className="text-xs text-gray-400">年齢自動計算・3ヶ月計測サイクル自動通知・予約フォロー</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-gray-800">会員一覧（{clients.length}名）</h2>
                <div className="space-y-3">
                  {searchedClients.map(c => {
                    const alert = getAlertStatus(c.lastBookingDate);
                    const isSelected = c.id === selectedClientId;
                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedClientId(c.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all space-y-1 ${isSelected ? 'border-blue-400 bg-blue-50/30' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-900">{c.childName}</span>
                          <span className="text-xs font-semibold text-blue-600">{calculateAge(c.birthDate)}歳</span>
                        </div>
                        <p className="text-xs text-gray-400">保護者: {c.parentName}</p>
                        {alert && (
                          <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                            {alert.text}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 lg:col-span-2">
                <div className="flex justify-between items-start border-b pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{currentClient.childName} <span className="text-sm font-normal text-gray-500">({calculateAge(currentClient.birthDate)}歳)</span></h2>
                    <p className="text-xs text-gray-400 mt-0.5">保護者様: {currentClient.parentName} / TEL: 080-9876-5432</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                    初回: {currentClient.firstLessonDate}
                  </span>
                </div>

                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl text-xs font-bold">
                  ⚠️ 前回セッションから2週間以上空いています (17日後)
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <p>直近計測日: 2026-09-01 (周期内)</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl space-y-2 text-xs">
                  <p><span className="font-bold text-gray-700">悩み・目標:</span> {currentClient.concerns}</p>
                  <p><span className="font-bold text-gray-700">指導メモ:</span> {currentClient.memo}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm text-gray-800">①〜⑤ 3ヶ月定期計測・身体データ推移</h3>
                    <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded">3ヶ月周期自動判定</span>
                  </div>
                  <table className="w-full text-xs text-left border">
                    <thead>
                      <tr className="bg-gray-50 border-b text-gray-500">
                        <th className="p-2">計測日</th>
                        <th className="p-2">体重 (kg)</th>
                        <th className="p-2">体脂肪率 (%)</th>
                        <th className="p-2">筋肉量 (kg)</th>
                        <th className="p-2">姿勢・テストデータ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {currentClient.measurements.map(m => (
                        <tr key={m.id}>
                          <td className="p-2 font-bold">{m.date}</td>
                          <td className="p-2 text-blue-600 font-bold">{m.weight} kg</td>
                          <td className="p-2">{m.bodyFat} %</td>
                          <td className="p-2">{m.muscleMass} kg</td>
                          <td className="p-2 text-gray-400">[写真・姿勢チェック記録済]</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-3 border-t pt-4">
                  <h3 className="font-bold text-sm text-gray-800">新規セッション記録の追加</h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-gray-400 mb-1">日時</label>
                      <input type="date" value="2026-09-08" className="w-full p-2 border rounded-lg bg-gray-50" readOnly />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-1">セッション内容</label>
                      <input type="text" placeholder="例: 体幹トレーニング" className="w-full p-2 border rounded-lg bg-gray-50" />
                    </div>
                  </div>
                </div>
              </div>
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
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${taskSubTab === 'tasks' ? 'bg-[#4882a8] text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  タスク管理
                </button>
                <button
                  onClick={() => setTaskSubTab('notes')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${taskSubTab === 'notes' ? 'bg-[#4882a8] text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  ミーティング議事録
                </button>
              </div>
            </div>

            {taskSubTab === 'tasks' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
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
                  <button
                    onClick={() => {
                      if (!newTaskTitle) return;
                      const newTask: TaskItem = {
                        id: Date.now().toString(),
                        title: newTaskTitle,
                        category: newTaskCategory,
                        staff: newTaskStaff,
                        dueDate: newTaskDueDate,
                        repeat: newTaskRepeat,
                        isImportant: newTaskImportant,
                        status: '未着手'
                      };
                      setTasks([...tasks, newTask]);
                      setNewTaskTitle('');
                    }}
                    className="w-full py-2 bg-[#4882a8] text-white font-bold rounded-lg shadow-sm"
                  >
                    タスクを追加
                  </button>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 lg:col-span-2">
                  <h3 className="font-bold text-gray-900 text-sm">タスク一覧</h3>
                  <div className="space-y-2">
                    {tasks.map(t => (
                      <div key={t.id} className="p-3 border rounded-xl flex items-center justify-between hover:bg-gray-50">
                        <span className="font-bold text-gray-900">{t.title}</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-[10px] font-bold">{t.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 text-xs">
                <h3 className="font-bold text-gray-900 text-sm">議事録一覧</h3>
                {meetingNotes.map(n => (
                  <div key={n.id} className="p-4 border rounded-xl space-y-2 bg-gray-50">
                    <p className="font-bold text-gray-900">{n.title}</p>
                    <p className="text-gray-600">{n.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            PAGE 4: 近隣情報画面
           ========================================== */}
        {activeTab === 'local' && (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-gray-900 text-sm">地域・施設・イベントリスト</h3>
            <table className="w-full text-left border">
              <thead>
                <tr className="bg-gray-50 border-b font-bold text-gray-500">
                  <th className="p-2">区分</th>
                  <th className="p-2">施設・団体名</th>
                  <th className="p-2">イベント・概要</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {localInfos.map(item => (
                  <tr key={item.id}>
                    <td className="p-2"><span className="px-2 py-0.5 bg-blue-50 text-[#4882a8] font-bold rounded">{item.district}</span></td>
                    <td className="p-2 font-bold">{item.name}</td>
                    <td className="p-2">{item.eventName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ==========================================
            PAGE 5: 取引一覧画面（業者・設備）
           ========================================== */}
        {activeTab === 'vendors' && (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-gray-900 text-sm">取引先・契約サービス一覧</h3>
            <table className="w-full text-left border">
              <thead>
                <tr className="bg-gray-50 border-b font-bold text-gray-500">
                  <th className="p-2">業者・サービス名</th>
                  <th className="p-2">用途・内容</th>
                  <th className="p-2">担当窓口</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {vendors.map(v => (
                  <tr key={v.id}>
                    <td className="p-2 font-bold">{v.name}</td>
                    <td className="p-2">{v.usageDetail}</td>
                    <td className="p-2">{v.contactStaff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
