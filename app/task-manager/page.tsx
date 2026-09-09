'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// タスクの型定義
interface Task {
  id: string;
  title: string;
  category: 'Instagram' | '週例業務' | 'キャンペーン議事録' | 'その他';
  date: string; // YYYY-MM-DD
  fiscalYear: number;
  month: number;
  status: '未着手' | '進行中' | '完了';
  dueDateAlarm: boolean;
  isImportant: boolean;
  memo: string;
}

// 議事録の型定義（新規追加）
interface MeetingMinutes {
  id: string;
  title: string;          // 議事録タイトル (例: 10月度キックオフ会議)
  date: string;           // 開催日
  participants: string;   // 参加者 (例: TAKA, NANA)
  agenda: string;         // アジェンダ・議題
  decisions: string;      // 決定事項
  freeMemo: string;       // 自由メモ・詳細
  linkedTaskIds: string[];// 紐づくタスクID一覧
}

export default function TasksPage() {
  const pathname = usePathname();
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  // --- ナビゲーションメニュー設定 ---
  const navItems = [
    { label: '売上管理', href: '/sales', icon: '📊' },
    { label: '顧客リスト', href: '/clients', icon: '📋' },
    { label: 'タスク・議事録', href: '/task-manager', icon: '📝' },
    { label: '近隣情報', href: '/local-info', icon: '📍' },
    { label: 'マシン・業者一覧', href: '/vendors', icon: '🏋️' },
  ];

  // 状態管理
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  
  // タスク初期データ
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'ストーリー（過去投稿）',
      category: 'Instagram',
      date: '2026-09-07',
      fiscalYear: 2026,
      month: 9,
      status: '未着手',
      dueDateAlarm: true,
      isImportant: false,
      memo: '',
    },
    {
      id: '2',
      title: '新企画の打ち合わせ議事録',
      category: 'キャンペーン議事録',
      date: '2026-09-09',
      fiscalYear: 2026,
      month: 9,
      status: '未着手',
      dueDateAlarm: true,
      isImportant: true,
      memo: '要確認事項あり',
    },
  ]);

  // 議事録初期データ（新規追加）
  const [minutesList, setMinutesList] = useState<MeetingMinutes[]>([
    {
      id: 'm-1',
      title: '秋の体験入会キャンペーン方針決定会議',
      date: '2026-09-09',
      participants: 'TAKA, NANA',
      agenda: '1. 特典内容の確認\n2. 告知スケジュール',
      decisions: '当日入会で10回券5,000円引き＋評価シート無料プレゼントに決定。',
      freeMemo: 'SNS広告の予算配分も合わせて見直すこと。',
      linkedTaskIds: ['2']
    }
  ]);

  // タブ切り替え ('list' | 'calendar' | 'minutes')
  const [activeTab, setActiveTab] = useState<'list' | 'calendar' | 'minutes'>('list');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  // タスクフォーム状態
  const [editForm, setEditForm] = useState<Partial<Task>>({
    title: '',
    category: 'Instagram',
    date: '2026-09-01',
    fiscalYear: 2026,
    month: 9,
    status: '未着手',
    dueDateAlarm: false,
    isImportant: false,
    memo: '',
  });

  // 議事録編集・新規フォーム状態（新規追加）
  const [selectedMinutesId, setSelectedMinutesId] = useState<string | null>(null);
  const [isMinutesEditing, setIsMinutesEditing] = useState<boolean>(false);
  const [minutesForm, setMinutesForm] = useState<Partial<MeetingMinutes>>({
    title: '',
    date: '2026-09-09',
    participants: 'TAKA, NANA',
    agenda: '',
    decisions: '',
    freeMemo: '',
    linkedTaskIds: []
  });

  // プリセット
  const presetCampaignOptions = [
    'キックオフミーティング決定事項',
    'SNS広告運用方針のすり合わせ',
    '夏期クリニック振り返り議事録',
  ];

  // フィルター
  const filteredTasks = tasks.filter(
    (task) => task.fiscalYear === selectedFiscalYear && task.month === selectedMonth
  );

  const uncompletedCampaignTasks = tasks.filter(
    (task) => task.category === 'キャンペーン議事録' && task.status !== '完了'
  );

  // タスク保存処理
  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.title) return;

    if (selectedTaskId && isEditing) {
      setTasks(tasks.map(t => t.id === selectedTaskId ? { ...t, ...editForm } as Task : t));
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        title: editForm.title || '無題のタスク',
        category: editForm.category || 'その他',
        date: editForm.date || '2026-09-01',
        fiscalYear: editForm.fiscalYear || selectedFiscalYear,
        month: editForm.month || selectedMonth,
        status: editForm.status || '未着手',
        dueDateAlarm: editForm.dueDateAlarm || false,
        isImportant: editForm.isImportant || false,
        memo: editForm.memo || '',
      };
      setTasks([...tasks, newTask]);
    }
    resetForm();
  };

  const resetForm = () => {
    setSelectedTaskId(null);
    setIsEditing(false);
    setEditForm({
      title: '',
      category: 'Instagram',
      date: `${selectedFiscalYear}-${String(selectedMonth).padStart(2, '0')}-01`,
      fiscalYear: selectedFiscalYear,
      month: selectedMonth,
      status: '未着手',
      dueDateAlarm: false,
      isImportant: false,
      memo: '',
    });
  };

  const handleSelectTask = (task: Task) => {
    setSelectedTaskId(task.id);
    setEditForm(task);
    setIsEditing(true);
    setActiveTab('list');
  };

  // 議事録保存処理（新規追加）
  const handleSaveMinutes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!minutesForm.title) return;

    if (selectedMinutesId && isMinutesEditing) {
      setMinutesList(minutesList.map(m => m.id === selectedMinutesId ? { ...m, ...minutesForm } as MeetingMinutes : m));
    } else {
      const newMinutes: MeetingMinutes = {
        id: `min-${Date.now()}`,
        title: minutesForm.title || '無題の議事録',
        date: minutesForm.date || '2026-09-09',
        participants: minutesForm.participants || 'TAKA, NANA',
        agenda: minutesForm.agenda || '',
        decisions: minutesForm.decisions || '',
        freeMemo: minutesForm.freeMemo || '',
        linkedTaskIds: minutesForm.linkedTaskIds || []
      };
      setMinutesList([newMinutes, ...minutesList]);

      // 自動的に「キャンペーン議事録」カテゴリのタスクとしても登録する
      const newTask: Task = {
        id: `task-min-${Date.now()}`,
        title: minutesForm.title,
        category: 'キャンペーン議事録',
        date: minutesForm.date || '2026-09-09',
        fiscalYear: selectedFiscalYear,
        month: selectedMonth,
        status: '未着手',
        dueDateAlarm: true,
        isImportant: true,
        memo: `議事録連携: ${minutesForm.decisions || ''}`
      };
      setTasks(prev => [newTask, ...prev]);
    }
    resetMinutesForm();
  };

  const resetMinutesForm = () => {
    setSelectedMinutesId(null);
    setIsMinutesEditing(false);
    setMinutesForm({
      title: '',
      date: '2026-09-09',
      participants: 'TAKA, NANA',
      agenda: '',
      decisions: '',
      freeMemo: '',
      linkedTaskIds: []
    });
  };

  const handleSelectMinutes = (minutes: MeetingMinutes) => {
    setSelectedMinutesId(minutes.id);
    setMinutesForm(minutes);
    setIsMinutesEditing(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-12">
      {/* 統一ヘッダーナビゲーション */}
      <header className="bg-[#5e9bc4] text-white px-6 py-3.5 flex justify-between items-center shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="bg-white text-[#5e9bc4] p-1.5 rounded-lg font-black text-sm">GOLAZO</span>
          <h1 className="text-lg font-bold tracking-wider">パーソナルジム GOLAZO 管理システム</h1>
        </div>
        <nav className="flex gap-2 text-xs font-semibold">
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

      {/* メインコンテンツエリア */}
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <h2 className="text-xl font-bold text-slate-800">GOLAZO 業務タスク管理 & 議事録</h2>

        {/* 画面上部：キャンペーン議事録の未完了アラームバナー */}
        {uncompletedCampaignTasks.length > 0 && (
          <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 rounded-xl shadow-sm flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-sm">⚠️ キャンペーン議事録の未完了タスクがあります</p>
              <p className="text-slate-600 mt-0.5">未完了の議事録関連タスクが {uncompletedCampaignTasks.length} 件残っています。</p>
            </div>
            <button 
              onClick={() => setActiveTab('minutes')}
              className="bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-amber-700 font-bold transition shadow-sm"
            >
              議事録ページで確認
            </button>
          </div>
        )}

        {/* コントロールパネル (年度・月度選択 & タブ切り替え) */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs">
          <div className="flex items-center gap-3">
            <label className="font-bold text-slate-700">📅 表示選択:</label>
            <select 
              value={selectedFiscalYear} 
              onChange={(e) => setSelectedFiscalYear(Number(e.target.value))}
              className="border border-slate-300 rounded-lg px-3 py-1.5 bg-white font-bold text-[#5e9bc4] outline-none"
            >
              {[2024, 2025, 2026, 2027, 2028].map((year) => (
                <option key={year} value={year}>{year}年度</option>
              ))}
            </select>

            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="border border-slate-300 rounded-lg px-3 py-1.5 bg-white font-bold text-[#5e9bc4] outline-none"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>{m}月度</option>
              ))}
            </select>
          </div>

          {/* タブ切り替え */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-lg font-bold transition ${
                activeTab === 'list'
                  ? 'bg-[#5e9bc4] text-white shadow-sm'
                  : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              タスク一覧・編集
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-4 py-2 rounded-lg font-bold transition ${
                activeTab === 'calendar'
                  ? 'bg-[#5e9bc4] text-white shadow-sm'
                  : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              カレンダー表示
            </button>
            <button
              onClick={() => setActiveTab('minutes')}
              className={`px-4 py-2 rounded-lg font-bold relative transition ${
                activeTab === 'minutes'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              📝 議事録詳細・登録
              {uncompletedCampaignTasks.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {uncompletedCampaignTasks.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* --- タブ1: タスク一覧・編集 --- */}
        {activeTab === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 左側：タスク一覧テーブル */}
            <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-bold text-slate-800 text-sm">{selectedFiscalYear}年度 {selectedMonth}月度 タスク一覧</h3>
                <button 
                  onClick={resetForm}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
                >
                  + 新規タスク追加
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b text-slate-500 font-bold">
                      <th className="py-2.5 px-3">日付</th>
                      <th className="py-2.5 px-3">カテゴリ</th>
                      <th className="py-2.5 px-3">タスク名</th>
                      <th className="py-2.5 px-3">ステータス</th>
                      <th className="py-2.5 px-3">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-slate-400">該当するタスクはありません。</td>
                      </tr>
                    ) : (
                      filteredTasks.map((task) => (
                        <tr key={task.id} className="border-b hover:bg-slate-50 transition">
                          <td className="py-2.5 px-3 font-semibold text-slate-700">{task.date}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                              task.category === 'キャンペーン議事録' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}>
                              {task.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-800 flex items-center gap-1.5">
                            {task.isImportant && <span className="text-red-500" title="重要">⭐</span>}
                            {task.title}
                            {task.dueDateAlarm && <span className="text-sky-500 text-[10px]" title="期日アラーム">🔔</span>}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              task.status === '完了' ? 'bg-emerald-100 text-emerald-800' : 
                              task.status === '進行中' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {task.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <button
                              onClick={() => handleSelectTask(task)}
                              className="font-bold text-[#5e9bc4] hover:underline"
                            >
                              詳細
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 右側：登録・編集フォーム */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 text-xs">
              <h3 className="font-bold text-slate-800 text-sm border-b pb-3">{isEditing ? 'タスク詳細・編集' : '新規タスク登録'}</h3>
              <form onSubmit={handleSaveTask} className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">カテゴリ</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value as Task['category'] })}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800 outline-none focus:ring-1 focus:ring-[#5e9bc4]"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="週例業務">週例業務</option>
                    <option value="キャンペーン議事録">キャンペーン議事録</option>
                    <option value="その他">その他</option>
                  </select>
                </div>

                {editForm.category === 'キャンペーン議事録' && (
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">議事録タスク名（固定選択 or 手動入力）</label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          setEditForm({ ...editForm, title: e.target.value });
                        }
                      }}
                      className="w-full border border-slate-300 rounded-lg p-2 bg-white mb-2 text-slate-800 outline-none"
                      defaultValue=""
                    >
                      <option value="" disabled>-- 以前からの固定選択肢から選ぶ --</option>
                      {presetCampaignOptions.map((opt, idx) => (
                        <option key={idx} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="または手動で自由に入力"
                      value={editForm.title || ''}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2 text-slate-800 outline-none focus:ring-1 focus:ring-[#5e9bc4]"
                    />
                  </div>
                )}

                {editForm.category !== 'キャンペーン議事録' && (
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">タスク名</label>
                    <input
                      type="text"
                      required
                      value={editForm.title || ''}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2 text-slate-800 outline-none focus:ring-1 focus:ring-[#5e9bc4]"
                      placeholder="例: ストーリー投稿"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">日付</label>
                    <input
                      type="date"
                      value={editForm.date || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const d = new Date(val);
                        setEditForm({ 
                          ...editForm, 
                          date: val,
                          fiscalYear: !isNaN(d.getFullYear()) ? d.getFullYear() : editForm.fiscalYear,
                          month: !isNaN(d.getMonth()) ? d.getMonth() + 1 : editForm.month
                        });
                      }}
                      className="w-full border border-slate-300 rounded-lg p-2 text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">ステータス</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Task['status'] })}
                      className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800 outline-none"
                    >
                      <option value="未着手">未着手</option>
                      <option value="進行中">進行中</option>
                      <option value="完了">完了</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2 py-2 border-t border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="importantCheck"
                      checked={editForm.isImportant || false}
                      onChange={(e) => setEditForm({ ...editForm, isImportant: e.target.checked })}
                      className="w-4 h-4 text-red-600 rounded border-slate-300"
                    />
                    <label htmlFor="importantCheck" className="font-bold cursor-pointer text-red-600">⭐ 重要タスクに設定</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="alarmCheck"
                      checked={editForm.dueDateAlarm || false}
                      onChange={(e) => setEditForm({ ...editForm, dueDateAlarm: e.target.checked })}
                      className="w-4 h-4 text-sky-600 rounded border-slate-300"
                    />
                    <label htmlFor="alarmCheck" className="font-bold cursor-pointer text-slate-700">🔔 期日アラームを設定</label>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">メモ欄</label>
                  <textarea
                    value={editForm.memo || ''}
                    onChange={(e) => setEditForm({ ...editForm, memo: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 h-20 text-slate-800 outline-none resize-none"
                    placeholder="詳細や特記事項を記入..."
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-[#5e9bc4] hover:bg-sky-600 text-white py-2.5 rounded-lg font-bold transition shadow-sm"
                  >
                    {isEditing ? '変更を保存' : '追加する'}
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 font-bold transition"
                    >
                      キャンセル
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- タブ2: カレンダー表示 --- */}
        {activeTab === 'calendar' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">{selectedFiscalYear}年度 {selectedMonth}月度 カレンダー</h3>
              <p className="text-xs text-slate-400 mt-0.5">カレンダー内のタスクをクリックすると、該当タスクの詳細・編集画面に移行します。</p>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {['日', '月', '火', '水', '木', '金', '土'].map((day, idx) => (
                <div key={idx} className="text-center font-bold text-xs bg-slate-50 py-2 rounded-lg text-slate-600 border border-slate-200">{day}</div>
              ))}
              {Array.from({ length: 31 }, (_, i) => {
                const dayNum = i + 1;
                const dateStr = `${selectedFiscalYear}-${String(selectedMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const dayTasks = filteredTasks.filter(t => t.date === dateStr);

                return (
                  <div key={i} className="min-h-[110px] border border-slate-200 rounded-xl p-2 flex flex-col bg-white overflow-hidden shadow-sm">
                    <span className="text-xs font-bold text-slate-400 mb-1">{dayNum}</span>
                    <div className="flex flex-col gap-1 overflow-y-auto">
                      {dayTasks.map(task => (
                        <button
                          key={task.id}
                          onClick={() => handleSelectTask(task)}
                          className={`text-left text-[11px] p-1.5 rounded-lg truncate transition font-bold ${
                            task.category === 'キャンペーン議事録' ? 'bg-purple-100 text-purple-900 border border-purple-200' : 'bg-sky-50 text-sky-900 border border-sky-100'
                          }`}
                          title={task.title}
                        >
                          {task.isImportant && '⭐'}{task.dueDateAlarm && '🔔'} {task.title}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- タブ3: 議事録詳細・タスク連動登録 --- */}
        {activeTab === 'minutes' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 左側：保存済み議事録一覧 */}
            <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <span>📝</span> キャンペーン・会議 議事録一覧
                </h3>
                <button 
                  onClick={resetMinutesForm}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
                >
                  + 新規議事録作成
                </button>
              </div>

              {uncompletedCampaignTasks.length > 0 && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs font-bold">
                  🚨 未完了の議事録関連タスクが {uncompletedCampaignTasks.length}件 残っています。
                </div>
              )}

              <div className="space-y-3">
                {minutesList.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">登録されている議事録はありません。</p>
                ) : (
                  minutesList.map((m) => (
                    <div key={m.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-purple-900 text-sm">{m.title}</span>
                        <span className="text-slate-400 font-semibold">{m.date}</span>
                      </div>
                      <p className="text-slate-600"><strong>参加者:</strong> {m.participants}</p>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                        <p className="font-bold text-slate-700">【決定事項】</p>
                        <p className="text-slate-800 whitespace-pre-wrap">{m.decisions || '未記入'}</p>
                      </div>
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => handleSelectMinutes(m)}
                          className="bg-white border border-purple-300 text-purple-700 hover:bg-purple-50 px-3 py-1 rounded-lg font-bold transition"
                        >
                          内容を確認・編集
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 右側：議事録新規作成 & タスク連動登録フォーム */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 text-xs">
              <h3 className="font-bold text-slate-800 text-sm border-b pb-3">
                {isMinutesEditing ? '議事録の編集' : '新規議事録作成 & タスク登録'}
              </h3>
              <form onSubmit={handleSaveMinutes} className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">議事録タイトル</label>
                  <input
                    type="text"
                    required
                    placeholder="例: 10月度プロモーション戦略会議"
                    value={minutesForm.title || ''}
                    onChange={(e) => setMinutesForm({ ...minutesForm, title: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-slate-800 outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">開催日</label>
                    <input
                      type="date"
                      value={minutesForm.date || ''}
                      onChange={(e) => setMinutesForm({ ...minutesForm, date: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2 text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">参加者</label>
                    <input
                      type="text"
                      placeholder="TAKA, NANA"
                      value={minutesForm.participants || ''}
                      onChange={(e) => setMinutesForm({ ...minutesForm, participants: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2 text-slate-800 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">アジェンダ・議題</label>
                  <textarea
                    rows={2}
                    placeholder="1. 現状確認&#10;2. 次の一手について"
                    value={minutesForm.agenda || ''}
                    onChange={(e) => setMinutesForm({ ...minutesForm, agenda: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-slate-800 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">決定事項（※タスクに自動連動します）</label>
                  <textarea
                    rows={3}
                    placeholder="会議で決定した内容を記入..."
                    value={minutesForm.decisions || ''}
                    onChange={(e) => setMinutesForm({ ...minutesForm, decisions: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-slate-800 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">自由メモ・特記事項</label>
                  <textarea
                    rows={2}
                    placeholder="補足や次回持ち越し事項など..."
                    value={minutesForm.freeMemo || ''}
                    onChange={(e) => setMinutesForm({ ...minutesForm, freeMemo: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-slate-800 outline-none resize-none"
                  />
                </div>

                <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 text-[11px] text-purple-900 font-semibold">
                  💡 保存すると、この議事録タイトルが「キャンペーン議事録」タスクとしても自動追加され、タスク一覧やカレンダーから進捗管理できるようになります。
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg font-bold transition shadow-sm"
                  >
                    {isMinutesEditing ? '議事録の変更を保存' : '議事録を保存 ＆ タスク化'}
                  </button>
                  {isMinutesEditing && (
                    <button
                      type="button"
                      onClick={resetMinutesForm}
                      className="px-4 py-2.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 font-bold transition"
                    >
                      キャンセル
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
