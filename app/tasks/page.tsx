'use client';

import React, { useState, useMemo } from 'react';

// --- 型定義 ---
export type StaffType = 'TAKA' | 'NANA';
export type TaskCategory = 'SNS' | '顧客フォロー' | '事務' | 'その他';
export type TaskStatus = '未着手' | '進行中' | '完了';
export type RepeatType = 'none' | 'weekly' | 'monthly';

export interface TaskItem {
  id: string;
  title: string;
  dueDate: string; // YYYY-MM-DD
  staff: StaffType;
  category: TaskCategory;
  customCategory?: string; // その他指定時
  status: TaskStatus;
  isImportant: boolean; // 重要フラグ
  repeatType?: RepeatType;
  minutesId?: string; // 議事録由来の場合の参照ID
}

export type MinutesCategory = 'キャンペーン' | '週MT' | '月MT' | 'その他';

export interface CampaignMetrics {
  targetAmount: number;
  targetCount: number;
  currentAmount: number;
  currentCount: number;
  progressNote: string;
}

export interface PresetTaskItem {
  id: string;
  title: string;
  category: TaskCategory;
  staff: StaffType;
  checked: boolean;
}

export interface MeetingMinutes {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  category: MinutesCategory;
  customCategory?: string;
  content: string;
  campaignMetrics?: CampaignMetrics;
  presetTasks?: PresetTaskItem[];
}

export default function TasksAndMinutesPage() {
  // --- 画面状態 ---
  const [searchQuery, setSearchQuery] = useState<string>(''); // 全体検索キーワード
  const [activeMonth, setActiveMonth] = useState<string>('2026-10'); // 表示月 ('2026-10' 等)
  const [taskViewMode, setTaskViewMode] = useState<'list' | 'calendar'>('list'); // タスク表示モード

  // --- デモデータ: タスク一覧 ---
  const [tasks, setTasks] = useState<TaskItem[]>([
    { id: 't-1', title: '10月秋CP用 Instagram画像・文章作成', dueDate: '2026-10-05', staff: 'TAKA', category: 'SNS', status: '進行中', isImportant: true, repeatType: 'none' },
    { id: 't-2', title: '体験レッスン受講者（渡辺様）へフォローLINE送信', dueDate: '2026-10-06', staff: 'NANA', category: '顧客フォロー', status: '未着手', isImportant: false, repeatType: 'none' },
    { id: 't-3', title: 'Square決済データの月次データバックアップ', dueDate: '2026-10-10', staff: 'TAKA', category: '事務', status: '未着手', isImportant: false, repeatType: 'monthly' },
    { id: 't-4', title: '9月度 店舗清掃および機材安全点検', dueDate: '2026-09-30', staff: 'NANA', category: 'その他', customCategory: '店舗メンテナンス', status: '完了', isImportant: false, repeatType: 'weekly' },
  ]);

  // --- デモデータ: 議事録一覧 ---
  const [minutesList, setMinutesList] = useState<MeetingMinutes[]>([
    {
      id: 'm-1',
      date: '2026-10-01',
      title: '10月度 秋の体験入会キャンペーン戦略ミーティング',
      category: 'キャンペーン',
      content: '10月からの秋CPについての打ち合わせ。体験当日入会で10回券5,000円引きを実施する。SNS投稿頻度を週3に増やし、評価シートプレゼントを押し出す。',
      campaignMetrics: {
        targetAmount: 800000,
        targetCount: 15,
        currentAmount: 120000,
        currentCount: 2,
        progressNote: '初週出だし好調。Instagramの問い合わせ件数増加中。',
      },
      presetTasks: [
        { id: 'p-1', title: 'レジ設定 (Square割引適用設定)', category: '事務', staff: 'TAKA', checked: true },
        { id: 'p-2', title: 'SNS告知準備 (画像デザイン・文案)', category: 'SNS', staff: 'TAKA', checked: true },
        { id: 'p-3', title: 'SNS投稿予約 (毎週月・水・金)', category: 'SNS', staff: 'NANA', checked: false },
        { id: 'p-4', title: 'チラシ準備 (店内POP印刷)', category: '事務', staff: 'NANA', checked: false },
        { id: 'p-5', title: 'チラシ掲示・近隣配布', category: 'その他', staff: 'TAKA', checked: false },
        { id: 'p-6', title: '中間報告書作成', category: '事務', staff: 'NANA', checked: false },
      ]
    },
    {
      id: 'm-2',
      date: '2026-09-28',
      title: '週次定例ミーティング (会員消化状況 & 予約確認)',
      category: '週MT',
      content: '回数券残り2回以下の会員への個別アプローチを開始すること。山田様・藤田様の消化ペースが早いため、次回継続のご案内をTAKA担当で行う。',
    }
  ]);

  // --- 新規タスクフォーム状態 ---
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskForm, setTaskForm] = useState<Partial<TaskItem>>({
    title: '',
    dueDate: '2026-10-10',
    staff: 'TAKA',
    category: 'SNS',
    customCategory: '',
    status: '未着手',
    isImportant: false,
    repeatType: 'none',
  });

  // --- 新規議事録フォーム状態 ---
  const [isMinutesModalOpen, setIsMinutesModalOpen] = useState(false);
  const [editingMinutesId, setEditingMinutesId] = useState<string | null>(null);
  const [minutesForm, setMinutesForm] = useState<Partial<MeetingMinutes>>({
    date: '2026-10-05',
    title: '',
    category: 'キャンペーン',
    customCategory: '',
    content: '',
    campaignMetrics: {
      targetAmount: 500000,
      targetCount: 10,
      currentAmount: 0,
      currentCount: 0,
      progressNote: '',
    },
    presetTasks: []
  });

  // プリセットタスクテンプレート一覧
  const campaignPresets: Omit<PresetTaskItem, 'id' | 'checked'>[] = [
    { title: 'レジ設定 (Squareクーポンの登録)', category: '事務', staff: 'TAKA' },
    { title: 'SNS告知準備 (クリエイティブ・告知文作成)', category: 'SNS', staff: 'TAKA' },
    { title: 'SNS投稿予約 (期間中の自動配信設定)', category: 'SNS', staff: 'NANA' },
    { title: 'チラシ準備 (店内配布物・POP作成)', category: '事務', staff: 'NANA' },
    { title: 'チラシ掲示 (POP設置・店頭更新)', category: 'その他', staff: 'TAKA' },
    { title: '報告書作成 (中間・最終達成率のまとめ)', category: '事務', staff: 'TAKA' },
  ];

  // カテゴリー変更時にプリセットをセット
  const handleMinutesCategoryChange = (cat: MinutesCategory) => {
    let presets: PresetTaskItem[] = [];
    if (cat === 'キャンペーン') {
      presets = campaignPresets.map((p, idx) => ({ ...p, id: `preset-${idx}-${Date.now()}`, checked: true }));
    }
    setMinutesForm(prev => ({
      ...prev,
      category: cat,
      presetTasks: presets
    }));
  };

  // --- 検索フィルタリング ---
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      // 月フィルタ
      const monthMatch = t.dueDate.startsWith(activeMonth);
      // 検索キーワードフィルタ
      const query = searchQuery.trim().toLowerCase();
      if (!query) return monthMatch;

      const titleMatch = t.title.toLowerCase().includes(query);
      const staffMatch = t.staff.toLowerCase().includes(query);
      const catMatch = t.category.toLowerCase().includes(query) || (t.customCategory && t.customCategory.toLowerCase().includes(query));

      return (titleMatch || staffMatch || catMatch);
    });
  }, [tasks, activeMonth, searchQuery]);

  const filteredMinutes = useMemo(() => {
    return minutesList.filter(m => {
      // 月フィルタ
      const monthMatch = m.date.startsWith(activeMonth);
      // 検索キーワードフィルタ
      const query = searchQuery.trim().toLowerCase();
      if (!query) return monthMatch;

      const titleMatch = m.title.toLowerCase().includes(query);
      const contentMatch = m.content.toLowerCase().includes(query);
      const catMatch = m.category.toLowerCase().includes(query);

      return (titleMatch || contentMatch || catMatch);
    });
  }, [minutesList, activeMonth, searchQuery]);

  // --- タスク操作ハンドラー ---
  const handleSaveTask = () => {
    if (!taskForm.title || !taskForm.dueDate) return;

    if (editingTaskId) {
      setTasks(prev => prev.map(t => t.id === editingTaskId ? { ...t, ...taskForm } as TaskItem : t));
    } else {
      const newTask: TaskItem = {
        id: `t-${Date.now()}`,
        title: taskForm.title || '',
        dueDate: taskForm.dueDate || '',
        staff: taskForm.staff || 'TAKA',
        category: taskForm.category || 'SNS',
        customCategory: taskForm.customCategory,
        status: taskForm.status || '未着手',
        isImportant: !!taskForm.isImportant,
        repeatType: taskForm.repeatType || 'none',
      };
      setTasks(prev => [newTask, ...prev]);
    }
    setIsTaskModalOpen(false);
    setEditingTaskId(null);
  };

  const handleToggleTaskStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus: TaskStatus = t.status === '未着手' ? '進行中' : t.status === '進行中' ? '完了' : '未着手';
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  const handleDeleteTask = (id: string) => {
    if (confirm('このタスクを削除しますか？')) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  // --- 議事録保存 ＆ タスク自動連動ハンドラー ---
  const handleSaveMinutes = () => {
    if (!minutesForm.title || !minutesForm.date) return;

    let savedMinutesId = editingMinutesId || `m-${Date.now()}`;

    if (editingMinutesId) {
      setMinutesList(prev => prev.map(m => m.id === editingMinutesId ? { ...m, ...minutesForm, id: editingMinutesId } as MeetingMinutes : m));
    } else {
      const newMinutes: MeetingMinutes = {
        id: savedMinutesId,
        date: minutesForm.date || '',
        title: minutesForm.title || '',
        category: minutesForm.category || 'キャンペーン',
        customCategory: minutesForm.customCategory,
        content: minutesForm.content || '',
        campaignMetrics: minutesForm.category === 'キャンペーン' ? minutesForm.campaignMetrics : undefined,
        presetTasks: minutesForm.presetTasks
      };
      setMinutesList(prev => [newMinutes, ...prev]);
    }

    // チェックが入っているプリセットタスクを「タスク管理」へ一括自動登録
    if (minutesForm.presetTasks && minutesForm.presetTasks.length > 0) {
      const newGeneratedTasks: TaskItem[] = minutesForm.presetTasks
        .filter(p => p.checked)
        .map((p, idx) => ({
          id: `t-sync-${Date.now()}-${idx}`,
          title: `[${minutesForm.title}] ${p.title}`,
          dueDate: minutesForm.date || '2026-10-10',
          staff: p.staff,
          category: p.category,
          status: '未着手',
          isImportant: false,
          minutesId: savedMinutesId
        }));

      // 重複登録を避けてタスクリストに追加
      setTasks(prev => [...newGeneratedTasks, ...prev]);
    }

    setIsMinutesModalOpen(false);
    setEditingMinutesId(null);
  };

  const handleDeleteMinutes = (id: string) => {
    if (confirm('この議事録を削除しますか？')) {
      setMinutesList(prev => prev.filter(m => m.id !== id));
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 pb-12">
      {/* 共通ヘッダー */}
      <header className="bg-[#5e9bc4] text-white px-6 py-3 flex justify-between items-center shadow">
        <h1 className="text-xl font-bold tracking-wider">パーソナルジム GOLAZO 管理システム</h1>
        <nav className="flex gap-4 text-xs font-semibold">
          <span className="opacity-80 cursor-pointer hover:opacity-100">売上管理</span>
          <span className="opacity-80 cursor-pointer hover:opacity-100">顧客カルテ</span>
          <span className="bg-white text-[#5e9bc4] px-3 py-1 rounded shadow-sm font-bold">タスク・議事録</span>
        </nav>
      </header>

      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* 画面共通機能：全体キーワード検索 ＆ 月別タブコントロール */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* 検索バー */}
          <div className="w-full md:w-1/2 relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="タスク・議事録の全体キーワードリアルタイム検索 (タイトル, 内容, 担当者...)"
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#5e9bc4] outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
              >
                ✖ クリア
              </button>
            )}
          </div>

          {/* 月別タブ切り替え */}
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="text-slate-500">📅 表示年月:</span>
            {['2026-08', '2026-09', '2026-10', '2026-11'].map(m => (
              <button
                key={m}
                onClick={() => setActiveMonth(m)}
                className={`px-3 py-1.5 rounded-md border transition ${
                  activeMonth === m
                    ? 'bg-[#5e9bc4] text-white border-[#5e9bc4] shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {m.replace('-', '年')}月
              </button>
            ))}
          </div>
        </div>

        {/* 【1. タスク管理機能】 */}
        <section className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-800">✅ タスク管理</h2>
                <span className="bg-sky-100 text-[#5e9bc4] text-xs font-bold px-2 py-0.5 rounded-full">
                  {filteredTasks.length} 件
                </span>
              </div>
              <p className="text-[11px] text-slate-400">TAKA / NANAの担当毎タスク、期日、重要度の視覚管理</p>
            </div>

            <div className="flex items-center gap-3">
              {/* 表示モード切替 (リスト/カレンダー) */}
              <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex text-xs font-bold">
                <button
                  onClick={() => setTaskViewMode('list')}
                  className={`px-3 py-1 rounded ${taskViewMode === 'list' ? 'bg-white text-[#5e9bc4] shadow-sm' : 'text-slate-500'}`}
                >
                  📋 リスト
                </button>
                <button
                  onClick={() => setTaskViewMode('calendar')}
                  className={`px-3 py-1 rounded ${taskViewMode === 'calendar' ? 'bg-white text-[#5e9bc4] shadow-sm' : 'text-slate-500'}`}
                >
                  📅 カレンダー
                </button>
              </div>

              {/* タスク追加ボタン */}
              <button
                onClick={() => {
                  setEditingTaskId(null);
                  setTaskForm({
                    title: '',
                    dueDate: '2026-10-10',
                    staff: 'TAKA',
                    category: 'SNS',
                    status: '未着手',
                    isImportant: false,
                    repeatType: 'none',
                  });
                  setIsTaskModalOpen(true);
                }}
                className="bg-[#5e9bc4] hover:bg-[#4d8aa8] text-white px-3 py-1.5 rounded-md text-xs font-bold shadow transition flex items-center gap-1"
              >
                <span>＋ 新規タスク追加</span>
              </button>
            </div>
          </div>

          {/* タスク表示エリア (リスト or カレンダー) */}
          {taskViewMode === 'list' ? (
            /* リスト表示 */
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-600 border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50 text-slate-500 font-bold">
                    <th className="py-2.5 px-3">ステータス</th>
                    <th className="py-2.5 px-3">重要</th>
                    <th className="py-2.5 px-3">期日</th>
                    <th className="py-2.5 px-3">担当</th>
                    <th className="py-2.5 px-3">カテゴリー</th>
                    <th className="py-2.5 px-3">タスク内容</th>
                    <th className="py-2.5 px-3">繰り返し</th>
                    <th className="py-2.5 px-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map(task => (
                      <tr
                        key={task.id}
                        className={`border-b hover:bg-slate-50 transition ${
                          task.isImportant ? 'bg-red-50/40' : ''
                        }`}
                      >
                        {/* ステータスボタン */}
                        <td className="py-2.5 px-3">
                          <button
                            onClick={() => handleToggleTaskStatus(task.id)}
                            className={`px-2 py-1 rounded font-bold text-[11px] transition ${
                              task.status === '完了'
                                ? 'bg-emerald-100 text-emerald-800 line-through opacity-70'
                                : task.status === '進行中'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {task.status === '完了' ? '✅ 完了' : task.status === '進行中' ? '⏳ 進行中' : '⬜ 未着手'}
                          </button>
                        </td>

                        {/* 重要フラグ */}
                        <td className="py-2.5 px-3 text-center">
                          {task.isImportant ? (
                            <span className="bg-red-500 text-white font-extrabold px-2 py-0.5 rounded text-[10px] animate-pulse">
                              🔥 重要
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 font-semibold text-slate-700">{task.dueDate}</td>

                        {/* 担当者色分けバッジ */}
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                              task.staff === 'TAKA'
                                ? 'bg-sky-100 text-sky-800 border border-sky-200'
                                : 'bg-pink-100 text-pink-800 border border-pink-200'
                            }`}
                          >
                            👤 {task.staff}
                          </span>
                        </td>

                        {/* カテゴリー */}
                        <td className="py-2.5 px-3">
                          <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px]">
                            {task.category === 'その他' && task.customCategory ? task.customCategory : task.category}
                          </span>
                        </td>

                        {/* タスク内容 */}
                        <td className={`py-2.5 px-3 font-bold text-slate-800 ${task.status === '完了' ? 'line-through text-slate-400' : ''}`}>
                          {task.title}
                        </td>

                        {/* 繰り返し設定 */}
                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                          {task.repeatType === 'weekly' ? '🔁 毎週' : task.repeatType === 'monthly' ? '🔁 毎月' : '単発'}
                        </td>

                        {/* 操作 */}
                        <td className="py-2.5 px-3 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingTaskId(task.id);
                              setTaskForm(task);
                              setIsTaskModalOpen(true);
                            }}
                            className="text-[#5e9bc4] font-bold hover:underline"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-400 font-bold hover:underline"
                          >
                            削除
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        該当するタスクはありません
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* カレンダー表示（簡易ビュー） */
            <div className="grid grid-cols-1 md:grid-cols-7 gap-2 text-xs pt-2">
              {['月', '火', '水', '木', '金', '土', '日'].map(day => (
                <div key={day} className="text-center font-bold text-slate-400 py-1 bg-slate-50 rounded">
                  {day}
                </div>
              ))}
              {/* 日別タスクのカード配置デモ */}
              {Array.from({ length: 31 }).map((_, idx) => {
                const dayNum = idx + 1;
                const dateStr = `${activeMonth}-${dayNum.toString().padStart(2, '0')}`;
                const dayTasks = filteredTasks.filter(t => t.dueDate === dateStr);

                return (
                  <div key={idx} className="min-h-[80px] bg-slate-50/50 p-1.5 rounded border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-400 text-[10px]">{dayNum}日</span>
                    {dayTasks.map(t => (
                      <div
                        key={t.id}
                        className={`p-1 rounded text-[10px] font-bold shadow-sm ${
                          t.isImportant ? 'bg-red-100 border border-red-300 text-red-900' : 'bg-white border border-slate-200 text-slate-800'
                        }`}
                      >
                        <span className={t.staff === 'TAKA' ? 'text-sky-600' : 'text-pink-600'}>[{t.staff}]</span> {t.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 【2. ミーティング議事録機能】 */}
        <section className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-800">📝 ミーティング議事録 & キャンペーン進捗</h2>
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">
                  {filteredMinutes.length} 件
                </span>
              </div>
              <p className="text-[11px] text-slate-400">会議ログ、キャンペーン目標管理、定型タスクの自動抽出とタスク連携</p>
            </div>

            <button
              onClick={() => {
                setEditingMinutesId(null);
                setMinutesForm({
                  date: '2026-10-05',
                  title: '',
                  category: 'キャンペーン',
                  content: '',
                  campaignMetrics: {
                    targetAmount: 500000,
                    targetCount: 10,
                    currentAmount: 0,
                    currentCount: 0,
                    progressNote: '',
                  },
                  presetTasks: campaignPresets.map((p, idx) => ({ ...p, id: `preset-${idx}`, checked: true }))
                });
                setIsMinutesModalOpen(true);
              }}
              className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-md text-xs font-bold shadow transition flex items-center gap-1"
            >
              <span>＋ 新規議事録を作成</span>
            </button>
          </div>

          {/* 議事録カード一覧 */}
          <div className="space-y-4">
            {filteredMinutes.length > 0 ? (
              filteredMinutes.map(minutes => (
                <div key={minutes.id} className="p-4 bg-slate-50/80 rounded-lg border border-slate-200 space-y-3">
                  {/* カードヘッダー */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">
                        {minutes.date}
                      </span>
                      <span className="bg-[#FFE8AB] text-slate-800 text-xs font-bold px-2.5 py-0.5 rounded-md border border-amber-300">
                        🏷️ {minutes.category === 'その他' && minutes.customCategory ? minutes.customCategory : minutes.category}
                      </span>
                      <h3 className="font-bold text-slate-800 text-sm">{minutes.title}</h3>
                    </div>

                    <div className="space-x-2 text-xs">
                      <button
                        onClick={() => {
                          setEditingMinutesId(minutes.id);
                          setMinutesForm(minutes);
                          setIsMinutesModalOpen(true);
                        }}
                        className="text-[#5e9bc4] font-bold hover:underline"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDeleteMinutes(minutes.id)}
                        className="text-red-400 font-bold hover:underline"
                      >
                        削除
                      </button>
                    </div>
                  </div>

                  {/* 議事録詳細内容 */}
                  <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed bg-white p-3 rounded border border-slate-200">
                    {minutes.content}
                  </p>

                  {/* キャンペーン連動数値エリア（キャンペーンの場合のみ表示） */}
                  {minutes.category === 'キャンペーン' && minutes.campaignMetrics && (
                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-xs space-y-2">
                      <span className="font-bold text-amber-900 block text-[11px]">🎯 キャンペーン目標・達成進捗（売上連動用）</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-2.5 rounded border border-amber-100 font-bold">
                        <div>
                          <span className="text-[10px] text-slate-400 block">目標金額</span>
                          <span className="text-slate-800">¥{minutes.campaignMetrics.targetAmount.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">現在売上</span>
                          <span className="text-[#5e9bc4]">¥{minutes.campaignMetrics.currentAmount.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">目標件数 / 現在</span>
                          <span className="text-slate-800">{minutes.campaignMetrics.targetCount}件 / <span className="text-emerald-600">{minutes.campaignMetrics.currentCount}件</span></span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">達成率</span>
                          <span className="text-amber-800 text-sm font-extrabold">
                            {((minutes.campaignMetrics.currentAmount / (minutes.campaignMetrics.targetAmount || 1)) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      {minutes.campaignMetrics.progressNote && (
                        <p className="text-[11px] text-slate-600">📝 進捗メモ: {minutes.campaignMetrics.progressNote}</p>
                      )}
                    </div>
                  )}

                  {/* プリセット自動展開タスク表示 */}
                  {minutes.presetTasks && minutes.presetTasks.length > 0 && (
                    <div className="bg-sky-50/60 p-3 rounded-lg border border-sky-100 text-xs space-y-1.5">
                      <span className="font-bold text-sky-900 block text-[11px]">⚙️ 抽出された定型タスク（タスク画面へ自動同期）</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {minutes.presetTasks.map(pt => (
                          <div key={pt.id} className="flex items-center gap-2 bg-white p-2 rounded border border-sky-100">
                            <span className={pt.checked ? 'text-emerald-600 font-bold' : 'text-slate-300'}>
                              {pt.checked ? '✓ 同期済み' : '○'}
                            </span>
                            <span className="font-bold text-slate-700 flex-1">{pt.title}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${pt.staff === 'TAKA' ? 'bg-sky-100 text-sky-800' : 'bg-pink-100 text-pink-800'}`}>
                              {pt.staff}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                該当する議事録はありません
              </div>
            )}
          </div>
        </section>

      </div>

      {/* --- モーダル 1: タスク追加/編集 --- */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-slate-800">{editingTaskId ? 'タスク編集' : '新規タスク追加'}</h3>
              <button onClick={() => setIsTaskModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✖</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">タスク内容</label>
                <input
                  type="text"
                  value={taskForm.title || ''}
                  onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="例: Instagramの告知画像作成"
                  className="w-full border border-slate-300 rounded p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">担当者</label>
                  <select
                    value={taskForm.staff || 'TAKA'}
                    onChange={e => setTaskForm({ ...taskForm, staff: e.target.value as StaffType })}
                    className="w-full border border-slate-300 rounded p-2 font-bold"
                  >
                    <option value="TAKA">TAKA</option>
                    <option value="NANA">NANA</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">期日</label>
                  <input
                    type="date"
                    value={taskForm.dueDate || ''}
                    onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">カテゴリー</label>
                  <select
                    value={taskForm.category || 'SNS'}
                    onChange={e => setTaskForm({ ...taskForm, category: e.target.value as TaskCategory })}
                    className="w-full border border-slate-300 rounded p-2"
                  >
                    <option value="SNS">SNS</option>
                    <option value="顧客フォロー">顧客フォロー</option>
                    <option value="事務">事務</option>
                    <option value="その他">その他（手入力）</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">進捗状況</label>
                  <select
                    value={taskForm.status || '未着手'}
                    onChange={e => setTaskForm({ ...taskForm, status: e.target.value as TaskStatus })}
                    className="w-full border border-slate-300 rounded p-2 font-bold"
                  >
                    <option value="未着手">未着手</option>
                    <option value="進行中">進行中</option>
                    <option value="完了">完了</option>
                  </select>
                </div>
              </div>

              {taskForm.category === 'その他' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">カテゴリー手入力名</label>
                  <input
                    type="text"
                    value={taskForm.customCategory || ''}
                    onChange={e => setTaskForm({ ...taskForm, customCategory: e.target.value })}
                    placeholder="例: 店舗メンテナンス"
                    className="w-full border border-slate-300 rounded p-2"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">繰り返し設定</label>
                  <select
                    value={taskForm.repeatType || 'none'}
                    onChange={e => setTaskForm({ ...taskForm, repeatType: e.target.value as RepeatType })}
                    className="w-full border border-slate-300 rounded p-2"
                  >
                    <option value="none">なし（単発）</option>
                    <option value="weekly">毎週繰り返し</option>
                    <option value="monthly">毎月繰り返し</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="importantCheck"
                    checked={!!taskForm.isImportant}
                    onChange={e => setTaskForm({ ...taskForm, isImportant: e.target.checked })}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <label htmlFor="importantCheck" className="font-bold text-red-600">🔥 重要フラグを設定</label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="px-3 py-1.5 rounded border border-slate-300 text-slate-600 font-bold hover:bg-slate-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleSaveTask}
                className="px-4 py-1.5 rounded bg-[#5e9bc4] text-white font-bold hover:bg-[#4d8aa8]"
              >
                保存する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- モーダル 2: 議事録作成/編集 --- */}
      {isMinutesModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-xl text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-slate-800">{editingMinutesId ? '議事録編集' : '新規議事録を作成'}</h3>
              <button onClick={() => setIsMinutesModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✖</button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ミーティング日</label>
                  <input
                    type="date"
                    value={minutesForm.date || ''}
                    onChange={e => setMinutesForm({ ...minutesForm, date: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">カテゴリー</label>
                  <select
                    value={minutesForm.category || 'キャンペーン'}
                    onChange={e => handleMinutesCategoryChange(e.target.value as MinutesCategory)}
                    className="w-full border border-slate-300 rounded p-2 font-bold"
                  >
                    <option value="キャンペーン">キャンペーン</option>
                    <option value="週MT">週MT</option>
                    <option value="月MT">月MT</option>
                    <option value="その他">その他（手入力）</option>
                  </select>
                </div>
                {minutesForm.category === 'その他' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">カテゴリー手入力名</label>
                    <input
                      type="text"
                      value={minutesForm.customCategory || ''}
                      onChange={e => setMinutesForm({ ...minutesForm, customCategory: e.target.value })}
                      className="w-full border border-slate-300 rounded p-2"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">タイトル</label>
                <input
                  type="text"
                  value={minutesForm.title || ''}
                  onChange={e => setMinutesForm({ ...minutesForm, title: e.target.value })}
                  placeholder="例: 秋の体験入会キャンペーン打ち合わせ"
                  className="w-full border border-slate-300 rounded p-2 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">議事録・メモ内容</label>
                <textarea
                  rows={4}
                  value={minutesForm.content || ''}
                  onChange={e => setMinutesForm({ ...minutesForm, content: e.target.value })}
                  placeholder="協議内容、決定事項、決定プロセスのまとめなど"
                  className="w-full border border-slate-300 rounded p-2 leading-relaxed"
                />
              </div>

              {/* キャンペーン選択時の目標値手入力 */}
              {minutesForm.category === 'キャンペーン' && (
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 space-y-2">
                  <span className="font-bold text-amber-900 block text-[11px]">📊 キャンペーン目標値の手動設定</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-600 font-bold">目標金額 (円)</label>
                      <input
                        type="number"
                        value={minutesForm.campaignMetrics?.targetAmount || 0}
                        onChange={e => setMinutesForm({
                          ...minutesForm,
                          campaignMetrics: { ...minutesForm.campaignMetrics!, targetAmount: Number(e.target.value) }
                        })}
                        className="w-full border border-slate-300 rounded p-1 font-bold text-right"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 font-bold">目標件数 (件)</label>
                      <input
                        type="number"
                        value={minutesForm.campaignMetrics?.targetCount || 0}
                        onChange={e => setMinutesForm({
                          ...minutesForm,
                          campaignMetrics: { ...minutesForm.campaignMetrics!, targetCount: Number(e.target.value) }
                        })}
                        className="w-full border border-slate-300 rounded p-1 font-bold text-right"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 font-bold">現在実績金額</label>
                      <input
                        type="number"
                        value={minutesForm.campaignMetrics?.currentAmount || 0}
                        onChange={e => setMinutesForm({
                          ...minutesForm,
                          campaignMetrics: { ...minutesForm.campaignMetrics!, currentAmount: Number(e.target.value) }
                        })}
                        className="w-full border border-slate-300 rounded p-1 font-bold text-right"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 font-bold">現在実績件数</label>
                      <input
                        type="number"
                        value={minutesForm.campaignMetrics?.currentCount || 0}
                        onChange={e => setMinutesForm({
                          ...minutesForm,
                          campaignMetrics: { ...minutesForm.campaignMetrics!, currentCount: Number(e.target.value) }
                        })}
                        className="w-full border border-slate-300 rounded p-1 font-bold text-right"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* プリセットタスク展開 ＆ 一括登録チェック */}
              {minutesForm.presetTasks && minutesForm.presetTasks.length > 0 && (
                <div className="bg-sky-50 p-3 rounded-lg border border-sky-200 space-y-2">
                  <span className="font-bold text-sky-900 block text-[11px]">⚡ プリセット連動: タスク管理へ自動登録する項目</span>
                  <div className="space-y-1.5">
                    {minutesForm.presetTasks.map((pt, idx) => (
                      <div key={pt.id} className="flex items-center gap-2 bg-white p-2 rounded border border-sky-100">
                        <input
                          type="checkbox"
                          checked={pt.checked}
                          onChange={e => {
                            const updated = [...minutesForm.presetTasks!];
                            updated[idx].checked = e.target.checked;
                            setMinutesForm({ ...minutesForm, presetTasks: updated });
                          }}
                          className="w-4 h-4 text-[#5e9bc4] rounded"
                        />
                        <input
                          type="text"
                          value={pt.title}
                          onChange={e => {
                            const updated = [...minutesForm.presetTasks!];
                            updated[idx].title = e.target.value;
                            setMinutesForm({ ...minutesForm, presetTasks: updated });
                          }}
                          className="flex-1 border-none text-xs font-bold text-slate-700 focus:outline-none"
                        />
                        <select
                          value={pt.staff}
                          onChange={e => {
                            const updated = [...minutesForm.presetTasks!];
                            updated[idx].staff = e.target.value as StaffType;
                            setMinutesForm({ ...minutesForm, presetTasks: updated });
                          }}
                          className="border border-slate-300 rounded p-1 font-bold text-[10px]"
                        >
                          <option value="TAKA">TAKA</option>
                          <option value="NANA">NANA</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setIsMinutesModalOpen(false)}
                className="px-3 py-1.5 rounded border border-slate-300 text-slate-600 font-bold hover:bg-slate-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleSaveMinutes}
                className="px-4 py-1.5 rounded bg-amber-500 text-white font-bold hover:bg-amber-600"
              >
                保存 ＆ タスク画面へ反映
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
