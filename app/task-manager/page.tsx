// app/task-manager/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/Header';

type Assignee = 'TAKA' | 'NANA';
type RepeatMode = 'none' | 'weekly' | 'monthly';
type RepeatConfig = { days: number[]; endDate: string | null };

type TaskItem = {
  id: string;
  title: string;
  assignee: Assignee;
  dueDate: string; // YYYY-MM-DD
  category: string; // SNS / 顧客フォロー / 事務 / その他
  priority: boolean; // 重要フラグ（赤強調・重要ボタン）
  completed: boolean;
  repeat: RepeatMode;
  repeatConfig?: RepeatConfig;
  repeatGroupId?: string;
  linkedMinutesId?: string;
};

type MinutesItem = {
  id: number;
  date: string; // YYYY-MM-DD
  campaignStartDate?: string;
  campaignEndDate?: string;
  campaignCalendarEnabled?: boolean;
  squareProductName?: string;
  title: string;
  category: string; // キャンペーン / 週MT / 月MT / その他
  targetAmount?: number;
  targetCount?: number;
  salesProgress?: string;
  targetAchievementRate?: string;
  campaignProgress?: string;
  actualCount?: number;
  actualSales?: number;
  tasks: {
    title: string;
    assignee: Assignee;
    dueDate: string;
    priority: boolean;
  }[];
  notes: string;
};

const CAMPAIGN_PRESETS = [
  'レジ設定',
  'SNS告知準備',
  'SNS投稿予約',
  'チラシ準備',
  'チラシ掲示',
  '報告書作成'
];

type MinutesTask = {
  title: string;
  assignee: Assignee;
  dueDate: string;
  priority: boolean;
};

type TaskTemplate = {
  id: string;
  category: string;
  title: string;
  assignee: Assignee;
  priority: boolean;
};

const MINUTES_CATEGORIES = ['週MT', '月MT', 'キャンペーン', 'その他'];
const DEFAULT_TEMPLATES: Record<string, MinutesTask[]> = {
  'キャンペーン': CAMPAIGN_PRESETS.map(title => ({ title, assignee: 'TAKA', dueDate: '', priority: false })),
  '週MT': [],
  '月MT': [],
  'その他': [],
};

export default function TaskManagerPage() {
  const [activeTab, setActiveTab] = useState<'task' | 'minutes' | 'calendar'>('task');
  const [selectedYearMonth, setSelectedYearMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );

  // --- タスクの状態 ---
  // タスクはSupabaseから読み込みます。初回は既存UIのサンプル2件を
  // Supabaseへ登録することで、これまでの画面表示も維持します。
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let cancelled = false;

    const loadTasks = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, assignee, due_date, category, priority, completed, repeat, repeat_config, repeat_group_id, linked_minutes_id, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('タスク読み込みエラー:', error);
        alert(`タスクの読み込みに失敗しました。\\n${error.message}`);
        return;
      }

      if (cancelled) return;

      const loadedTasks: TaskItem[] = (data ?? []).map((row) => ({
        id: String(row.id),
        title: row.title ?? '',
        assignee: row.assignee === 'NANA' ? 'NANA' : 'TAKA',
        dueDate: row.due_date ?? '',
        category: row.category ?? 'その他',
        priority: Boolean(row.priority),
        completed: Boolean(row.completed),
        repeat: row.repeat === 'weekly' || row.repeat === 'monthly' ? row.repeat : 'none',
        repeatConfig: row.repeat_config ?? undefined,
        repeatGroupId: row.repeat_group_id ? String(row.repeat_group_id) : undefined,
        linkedMinutesId: row.linked_minutes_id ? String(row.linked_minutes_id) : undefined,
      }));

      // まだSupabaseにタスクが1件もない場合は、従来画面にあった
      // サンプルタスクを一度だけ登録します。
      if (loadedTasks.length === 0) {
        const seedTasks = [
          {
            title: 'SNS広告のクリエイティブ修正',
            assignee: 'TAKA',
            due_date: '2026-09-20',
            category: 'SNS',
            priority: true,
            completed: false,
            repeat: 'weekly',
          },
          {
            title: '新規顧客へのフォローアップ連絡',
            assignee: 'NANA',
            due_date: '2026-09-15',
            category: '顧客フォロー',
            priority: false,
            completed: false,
            repeat: 'none',
          },
        ];

        const { data: seededData, error: seedError } = await supabase
          .from('tasks')
          .insert(seedTasks)
          .select('id, title, assignee, due_date, category, priority, completed, repeat, repeat_config, repeat_group_id, linked_minutes_id, created_at')
          .order('created_at', { ascending: false });

        if (seedError) {
          console.error('初期タスク登録エラー:', seedError);
          alert(`初期タスクの登録に失敗しました。\\n${seedError.message}`);
          return;
        }

        const seededTasks: TaskItem[] = (seededData ?? []).map((row) => ({
          id: String(row.id),
          title: row.title ?? '',
          assignee: row.assignee === 'NANA' ? 'NANA' : 'TAKA',
          dueDate: row.due_date ?? '',
          category: row.category ?? 'その他',
          priority: Boolean(row.priority),
          completed: Boolean(row.completed),
          repeat: row.repeat === 'weekly' || row.repeat === 'monthly' ? row.repeat : 'none',
          linkedMinutesId: row.linked_minutes_id ? String(row.linked_minutes_id) : undefined,
        }));

        if (!cancelled) setTasks(seededTasks);
        return;
      }

      setTasks(loadedTasks);
    };

    loadTasks();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  useEffect(() => {
    let cancelled = false;
    const loadTemplates = async () => {
      const { data, error } = await supabase
        .from('task_templates')
        .select('id, category, title, assignee, priority, created_at')
        .order('created_at', { ascending: true });
      if (error) {
        console.warn('定型タスク読み込みエラー:', error.message);
        return;
      }
      if (cancelled) return;
      const loaded = (data ?? []).map(row => ({
        id: String(row.id),
        category: row.category ?? 'その他',
        title: row.title ?? '',
        assignee: row.assignee === 'NANA' ? 'NANA' as Assignee : 'TAKA' as Assignee,
        priority: Boolean(row.priority),
      }));
      if (loaded.length > 0) {
        setTaskTemplates(loaded);
      } else {
        const seed = CAMPAIGN_PRESETS.map(title => ({
          category: 'キャンペーン', title, assignee: 'TAKA', priority: false
        }));
        const { data: seeded, error: seedError } = await supabase
          .from('task_templates').insert(seed)
          .select('id, category, title, assignee, priority');
        if (!seedError && seeded) {
          setTaskTemplates(seeded.map(row => ({
            id: String(row.id), category: row.category ?? 'キャンペーン',
            title: row.title ?? '', assignee: row.assignee === 'NANA' ? 'NANA' : 'TAKA',
            priority: Boolean(row.priority)
          })));
        }
      }
    };
    loadTemplates();
    return () => { cancelled = true; };
  }, [supabase]);

  useEffect(() => {
    const ensureRecurringTasksForMonth = async () => {
      if (tasks.length === 0) return;
      const masters = tasks.filter(t => t.repeat !== 'none' && t.repeatGroupId && t.repeatConfig);
      if (masters.length === 0) return;

      const [year, month] = selectedYearMonth.split('-').map(Number);
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0);
      const from = `${selectedYearMonth}-01`;
      const to = `${selectedYearMonth}-${String(monthEnd.getDate()).padStart(2, '0')}`;

      const { data: existingRows, error } = await supabase
        .from('tasks')
        .select('id, title, assignee, due_date, category, priority, completed, repeat, repeat_config, repeat_group_id, linked_minutes_id, created_at')
        .gte('due_date', from)
        .lte('due_date', to);

      if (error) {
        console.warn('繰り返し予定の確認に失敗しました:', error.message);
        return;
      }

      const existing = new Set((existingRows ?? []).map((row) =>
        `${row.repeat_group_id ?? ''}:${row.due_date}`
      ));
      const payloads: Record<string, unknown>[] = [];

      for (const master of masters) {
        const config = master.repeatConfig;
        if (!config || !master.repeatGroupId) continue;

        for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().slice(0, 10);
          if (dateStr < master.dueDate) continue;
          if (config.endDate && dateStr > config.endDate) continue;
          const matches = master.repeat === 'weekly'
            ? config.days.includes(d.getDay())
            : config.days.includes(d.getDate());
          if (!matches || dateStr === master.dueDate) continue;

          const key = `${master.repeatGroupId}:${dateStr}`;
          if (existing.has(key)) continue;

          payloads.push({
            title: master.title,
            assignee: master.assignee,
            due_date: dateStr,
            category: master.category,
            priority: master.priority,
            completed: false,
            repeat: 'none',
            repeat_config: config,
            repeat_group_id: master.repeatGroupId,
            linked_minutes_id: master.linkedMinutesId ?? null,
          });
          existing.add(key);
        }
      }

      if (payloads.length === 0) return;

      const { data: inserted, error: insertError } = await supabase
        .from('tasks')
        .insert(payloads)
        .select('id, title, assignee, due_date, category, priority, completed, repeat, repeat_config, repeat_group_id, linked_minutes_id, created_at');

      if (insertError) {
        console.warn('繰り返し予定の自動追加に失敗しました:', insertError.message);
        return;
      }

      const added: TaskItem[] = (inserted ?? []).map(row => ({
        id: String(row.id),
        title: row.title ?? '',
        assignee: row.assignee === 'NANA' ? 'NANA' : 'TAKA',
        dueDate: row.due_date ?? '',
        category: row.category ?? 'その他',
        priority: Boolean(row.priority),
        completed: Boolean(row.completed),
        repeat: 'none',
        repeatConfig: row.repeat_config ?? undefined,
        repeatGroupId: row.repeat_group_id ? String(row.repeat_group_id) : undefined,
        linkedMinutesId: row.linked_minutes_id ? String(row.linked_minutes_id) : undefined,
      }));
      setTasks(prev => [...added, ...prev]);
    };

    ensureRecurringTasksForMonth();
  }, [selectedYearMonth, supabase, tasks]);

  const [taskSearch, setTaskSearch] = useState('');
  const [taskCategoryFilter, setTaskCategoryFilter] = useState('all');
  const [taskAssigneeFilter, setTaskAssigneeFilter] = useState('all');

  // --- 議事録の状態 ---
  const [minutesList, setMinutesList] = useState<MinutesItem[]>([
    {
      id: 1,
      date: '2026-09-05',
      title: '9月度キックオフ＆キャンペーン方針MT',
      category: '月MT',
      salesProgress: '順調（前年比110%）',
      targetAchievementRate: '85%',
      campaignProgress: '準備着手済み',
      tasks: [
        { title: 'レジ設定', assignee: 'TAKA', dueDate: '2026-09-10', priority: true },
        { title: 'SNS告知準備', assignee: 'NANA', dueDate: '2026-09-12', priority: false }
      ],
      notes: '全体目標に向けてSNSとチラシの導線を強化する。'
    }
  ]);

  const [minutesSearch, setMinutesSearch] = useState('');

  type SquareProductLineItem = {
    name?: string;
    quantity?: number;
    amount?: number;
  };

  useEffect(() => {
    let cancelled = false;
    const loadCampaignActuals = async (loadedMinutes: MinutesItem[]) => {
      const campaigns = loadedMinutes.filter(
        (m) =>
          m.category === 'キャンペーン' &&
          m.squareProductName?.trim() &&
          m.campaignStartDate &&
          m.campaignEndDate,
      );

      if (campaigns.length === 0) return loadedMinutes;

      const minStart = campaigns.reduce(
        (min, m) => (m.campaignStartDate! < min ? m.campaignStartDate! : min),
        campaigns[0].campaignStartDate!,
      );
      const maxEnd = campaigns.reduce(
        (max, m) => (m.campaignEndDate! > max ? m.campaignEndDate! : max),
        campaigns[0].campaignEndDate!,
      );

      const { data: squareSales, error: squareSalesError } = await supabase
        .from('square_sales')
        .select('date,product_line_items,source')
        .gte('date', minStart)
        .lte('date', maxEnd);

      if (squareSalesError) {
        console.warn('キャンペーン実績のSquare売上読み込みエラー:', squareSalesError.message);
        return loadedMinutes;
      }

      console.log('キャンペーン実績Square売上:', squareSales);

      return loadedMinutes.map((campaign) => {
        if (
          campaign.category !== 'キャンペーン' ||
          !campaign.squareProductName?.trim() ||
          !campaign.campaignStartDate ||
          !campaign.campaignEndDate
        ) {
          return campaign;
        }

        const productName = campaign.squareProductName.trim();
        let actualCount = 0;
        let actualSales = 0;

        (squareSales ?? []).forEach((sale) => {
          if (
            sale.source !== 'square' ||
            sale.date < campaign.campaignStartDate! ||
            sale.date > campaign.campaignEndDate!
          ) {
            return;
          }

          const lineItems = Array.isArray(sale.product_line_items)
            ? (sale.product_line_items as SquareProductLineItem[])
            : [];

          lineItems.forEach((line) => {
            if (line.name === productName) {
              actualCount += Number(line.quantity) || 0;
              actualSales += Number(line.amount) || 0;
            }
          });
        });

        return {
          ...campaign,
          actualCount,
          actualSales,
        };
      });
    };

    const loadMinutes = async () => {
      const { data, error } = await supabase
        .from('minutes')
        .select('id, date, campaign_start_date, campaign_end_date, campaign_calendar_enabled, square_product_name, title, category, target_amount, target_count, sales_progress, target_achievement_rate, campaign_progress, tasks, notes, created_at')
        .order('date', { ascending: false });
      if (error) {
        console.warn('議事録読み込みエラー:', error.message);
        return;
      }
      if (cancelled) return;
      const loaded: MinutesItem[] = (data ?? []).map(row => ({
        id: Number(row.id),
        date: row.date ?? '',
        campaignStartDate: row.campaign_start_date ?? undefined,
        campaignEndDate: row.campaign_end_date ?? undefined,
        campaignCalendarEnabled: Boolean(row.campaign_calendar_enabled),
        squareProductName: row.square_product_name ?? undefined,
        title: row.title ?? '',
        category: row.category ?? 'その他',
        targetAmount: row.target_amount == null ? undefined : Number(row.target_amount),
        targetCount: row.target_count == null ? undefined : Number(row.target_count),
        salesProgress: row.sales_progress ?? '',
        targetAchievementRate: row.target_achievement_rate ?? '',
        campaignProgress: row.campaign_progress ?? '',
        tasks: Array.isArray(row.tasks) ? row.tasks.map((t: MinutesTask) => ({
          title: t.title ?? '', assignee: t.assignee === 'NANA' ? 'NANA' : 'TAKA',
          dueDate: t.dueDate ?? '', priority: Boolean(t.priority)
        })) : [],
        notes: row.notes ?? ''
      }));
      const withActuals = await loadCampaignActuals(loaded);

      if (!cancelled && withActuals.length > 0) setMinutesList(withActuals);
    };
    loadMinutes();
    return () => { cancelled = true; };
  }, [supabase]);

  // --- モーダル制御 ---
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  const [isMinutesModalOpen, setIsMinutesModalOpen] = useState(false);
  const [editingMinutes, setEditingMinutes] = useState<MinutesItem | null>(null);

  // タスク用フォームステート
  const [tFormTitle, setTFormTitle] = useState('');
  const [tFormAssignee, setTFormAssignee] = useState<Assignee>('TAKA');
  const [tFormDueDate, setTFormDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [tFormCategory, setTFormCategory] = useState('SNS');
  const [tFormOtherCategory, setTFormOtherCategory] = useState('');
  const [tFormPriority, setTFormPriority] = useState(false);
  const [tFormRepeat, setTFormRepeat] = useState<RepeatMode>('none');
  const [tFormRepeatDays, setTFormRepeatDays] = useState<number[]>([]);
  const [tFormRepeatEndDate, setTFormRepeatEndDate] = useState('');
  const [tFormRepeatNoEnd, setTFormRepeatNoEnd] = useState(true);

  // 議事録用フォームステート
  const [mFormDate, setMFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [mFormCampaignStartDate, setMFormCampaignStartDate] = useState('');
  const [mFormCampaignEndDate, setMFormCampaignEndDate] = useState('');
  const [mFormCampaignCalendarEnabled, setMFormCampaignCalendarEnabled] = useState(false);
  const [mFormSquareProductName, setMFormSquareProductName] = useState('');
  const [mFormTitle, setMFormTitle] = useState('');
  const [mFormCategory, setMFormCategory] = useState('週MT');
  const [mFormOtherCategory, setMFormOtherCategory] = useState('');
  const [mFormTargetAmount, setMFormTargetAmount] = useState<number | ''>('');
  const [mFormTargetCount, setMFormTargetCount] = useState<number | ''>('');
  const [mFormSalesProgress, setMFormSalesProgress] = useState('');
  const [mFormTargetAchievementRate, setMFormTargetAchievementRate] = useState('');
  const [mFormCampaignProgress, setMFormCampaignProgress] = useState('');
  const [mFormNotes, setMFormNotes] = useState('');
  const [mFormTasks, setMFormTasks] = useState<MinutesTask[]>([]);
  const [taskTemplates, setTaskTemplates] = useState<TaskTemplate[]>([]);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateCategory, setTemplateCategory] = useState('週MT');
  const [templateTitle, setTemplateTitle] = useState('');
  const [templateAssignee, setTemplateAssignee] = useState<Assignee>('TAKA');
  const [templatePriority, setTemplatePriority] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // タスクハンドラー
  // ---------------------------------------------------------------------------
  const handleOpenAddTask = () => {
    setEditingTask(null);
    setTFormTitle('');
    setTFormAssignee('TAKA');
    setTFormDueDate(new Date().toISOString().split('T')[0]);
    setTFormCategory('SNS');
    setTFormOtherCategory('');
    setTFormPriority(false);
    setTFormRepeat('none');
    setTFormRepeatDays([]);
    setTFormRepeatEndDate('');
    setTFormRepeatNoEnd(true);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task: TaskItem) => {
    setEditingTask(task);
    setTFormTitle(task.title);
    setTFormAssignee(task.assignee);
    setTFormDueDate(task.dueDate);
    if (['SNS', '顧客フォロー', '事務'].includes(task.category)) {
      setTFormCategory(task.category);
      setTFormOtherCategory('');
    } else {
      setTFormCategory('その他');
      setTFormOtherCategory(task.category);
    }
    setTFormPriority(task.priority);
    setTFormRepeat(task.repeat);
    setTFormRepeatDays(task.repeatConfig?.days ?? (
      task.repeat === 'weekly'
        ? [new Date(`${task.dueDate}T00:00:00`).getDay()]
        : task.repeat === 'monthly' ? [Number(task.dueDate.slice(8, 10))] : []
    ));
    setTFormRepeatEndDate(task.repeatConfig?.endDate ?? '');
    setTFormRepeatNoEnd(!task.repeatConfig?.endDate);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tFormTitle.trim()) return;

    const finalCategory = tFormCategory === 'その他'
      ? (tFormOtherCategory.trim() || 'その他')
      : tFormCategory;

    if (tFormRepeat !== 'none' && tFormRepeatDays.length === 0) {
      alert(tFormRepeat === 'weekly' ? '繰り返す曜日を1つ以上選択してください。' : '繰り返す日を1つ以上選択してください。');
      return;
    }
    if (tFormRepeat !== 'none' && !tFormRepeatNoEnd && !tFormRepeatEndDate) {
      alert('繰り返しの終了日を指定してください。');
      return;
    }

    const repeatConfig: RepeatConfig = {
      days: [...tFormRepeatDays].sort((a, b) => a - b),
      endDate: tFormRepeat === 'none' || tFormRepeatNoEnd ? null : tFormRepeatEndDate,
    };
    const repeatGroupId = tFormRepeat !== 'none'
      ? (editingTask?.repeatGroupId || crypto.randomUUID())
      : null;

    const taskPayload = {
      title: tFormTitle.trim(),
      assignee: tFormAssignee,
      due_date: tFormDueDate,
      category: finalCategory,
      priority: tFormPriority,
      repeat: tFormRepeat,
      repeat_config: repeatConfig,
      repeat_group_id: repeatGroupId,
    };

    if (editingTask) {
      const { data, error } = await supabase
        .from('tasks')
        .update(taskPayload)
        .eq('id', editingTask.id)
        .select('id, title, assignee, due_date, category, priority, completed, repeat, repeat_config, repeat_group_id, linked_minutes_id, created_at')
        .single();

      if (error || !data) {
        console.error('タスク更新エラー:', error);
        alert(`タスクの更新に失敗しました。\n${error?.message ?? ''}`);
        return;
      }

      const updatedTask: TaskItem = {
        id: String(data.id),
        title: data.title ?? '',
        assignee: data.assignee === 'NANA' ? 'NANA' : 'TAKA',
        dueDate: data.due_date ?? '',
        category: data.category ?? 'その他',
        priority: Boolean(data.priority),
        completed: Boolean(data.completed),
        repeat: data.repeat === 'weekly' || data.repeat === 'monthly' ? data.repeat : 'none',
        repeatConfig: data.repeat_config ?? undefined,
        repeatGroupId: data.repeat_group_id ? String(data.repeat_group_id) : undefined,
        linkedMinutesId: data.linked_minutes_id ? String(data.linked_minutes_id) : undefined,
      };
      setTasks(prev => prev.map(t => t.id === editingTask.id ? updatedTask : t));
    } else {
      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...taskPayload, completed: false })
        .select('id, title, assignee, due_date, category, priority, completed, repeat, repeat_config, repeat_group_id, linked_minutes_id, created_at')
        .single();

      if (error || !data) {
        console.error('タスク登録エラー:', error);
        alert(`タスクの保存に失敗しました。\n${error?.message ?? ''}`);
        return;
      }

      const newTaskItem: TaskItem = {
        id: String(data.id),
        title: data.title ?? '',
        assignee: data.assignee === 'NANA' ? 'NANA' : 'TAKA',
        dueDate: data.due_date ?? '',
        category: data.category ?? 'その他',
        priority: Boolean(data.priority),
        completed: Boolean(data.completed),
        repeat: data.repeat === 'weekly' || data.repeat === 'monthly' ? data.repeat : 'none',
        repeatConfig: data.repeat_config ?? undefined,
        repeatGroupId: data.repeat_group_id ? String(data.repeat_group_id) : undefined,
        linkedMinutesId: data.linked_minutes_id ? String(data.linked_minutes_id) : undefined,
      };
      setTasks(prev => [newTaskItem, ...prev]);

      // 期限なしは登録時に1年分を先行登録します。以降の月を表示した際に不足分を自動追加します。
      // 将来の月を開いた際の自動補充は次段階で追加できます。
      if (tFormRepeat !== 'none' && repeatGroupId) {
        const start = new Date(`${tFormDueDate}T00:00:00`);
        const end = repeatConfig.endDate
          ? new Date(`${repeatConfig.endDate}T00:00:00`)
          : new Date(start.getFullYear() + 1, start.getMonth(), start.getDate());
        const occurrencePayloads: Record<string, unknown>[] = [];

        for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().slice(0, 10);
          if (dateStr === tFormDueDate) continue;
          const matches = tFormRepeat === 'weekly'
            ? repeatConfig.days.includes(d.getDay())
            : repeatConfig.days.includes(d.getDate());
          if (!matches) continue;
          occurrencePayloads.push({
            title: tFormTitle.trim(),
            assignee: tFormAssignee,
            due_date: dateStr,
            category: finalCategory,
            priority: tFormPriority,
            completed: false,
            repeat: 'none',
            repeat_config: repeatConfig,
            repeat_group_id: repeatGroupId,
          });
        }

        if (occurrencePayloads.length > 0) {
          const { data: occurrenceData, error: occurrenceError } = await supabase
            .from('tasks')
            .insert(occurrencePayloads)
            .select('id, title, assignee, due_date, category, priority, completed, repeat, repeat_config, repeat_group_id, linked_minutes_id, created_at');

          if (occurrenceError) {
            console.error('繰り返しタスク登録エラー:', occurrenceError);
            alert(`繰り返しタスクの一部登録に失敗しました。\n${occurrenceError.message}`);
          } else {
            const occurrenceTasks: TaskItem[] = (occurrenceData ?? []).map(row => ({
              id: String(row.id),
              title: row.title ?? '',
              assignee: row.assignee === 'NANA' ? 'NANA' : 'TAKA',
              dueDate: row.due_date ?? '',
              category: row.category ?? 'その他',
              priority: Boolean(row.priority),
              completed: Boolean(row.completed),
              repeat: 'none',
              repeatConfig: row.repeat_config ?? undefined,
              repeatGroupId: row.repeat_group_id ? String(row.repeat_group_id) : undefined,
              linkedMinutesId: row.linked_minutes_id ? String(row.linked_minutes_id) : undefined,
            }));
            setTasks(prev => [...occurrenceTasks, ...prev]);
          }
        }
      }
    }

    setIsTaskModalOpen(false);
  };

  const handleDeleteTask = async (id: string) => {
    const target = tasks.find(t => t.id === id);
    if (!target) return;
    const isSeries = Boolean(target.repeatGroupId);
    if (!confirm(isSeries
      ? 'この繰り返しタスクを削除しますか？\n同じ繰り返しグループの予定も削除されます。'
      : 'このタスクを削除してもよろしいですか？')) return;

    const { error } = isSeries
      ? await supabase.from('tasks').delete().eq('repeat_group_id', target.repeatGroupId)
      : await supabase.from('tasks').delete().eq('id', id);

    if (error) {
      console.error('タスク削除エラー:', error);
      alert(`タスクの削除に失敗しました。\n${error.message}`);
      return;
    }

    setTasks(prev => isSeries
      ? prev.filter(t => t.repeatGroupId !== target.repeatGroupId)
      : prev.filter(t => t.id !== id));
  };

  const toggleComplete = async (id: string) => {
    const currentTask = tasks.find(t => t.id === id);
    if (!currentTask) return;

    const nextCompleted = !currentTask.completed;

    const { data, error } = await supabase
      .from('tasks')
      .update({ completed: nextCompleted })
      .eq('id', id)
      .select('id, title, assignee, due_date, category, priority, completed, repeat, repeat_config, repeat_group_id, linked_minutes_id, created_at')
      .single();

    if (error) {
      console.error('タスク完了状態更新エラー:', error);
      alert(`タスク状態の更新に失敗しました。\\n${error.message}`);
      return;
    }

    if (!data) {
      alert('タスクの更新結果を取得できませんでした。');
      return;
    }

    const updatedTask: TaskItem = {
      id: String(data.id),
      title: data.title ?? '',
      assignee: data.assignee === 'NANA' ? 'NANA' : 'TAKA',
      dueDate: data.due_date ?? '',
      category: data.category ?? 'その他',
      priority: Boolean(data.priority),
      completed: Boolean(data.completed),
      repeat: data.repeat === 'weekly' || data.repeat === 'monthly' ? data.repeat : 'none',
      linkedMinutesId: data.linked_minutes_id ? String(data.linked_minutes_id) : undefined,
    };

    setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
  };

  // ---------------------------------------------------------------------------
  // 議事録ハンドラー
  // ---------------------------------------------------------------------------
  const handleOpenAddMinutes = () => {
    setEditingMinutes(null);
    const today = new Date().toISOString().split('T')[0];
    setMFormDate(today);
    setMFormCampaignStartDate(today);
    setMFormCampaignEndDate(today);
    setMFormTitle('');
    setMFormCategory('週MT');
    setMFormOtherCategory('');
    setMFormTargetAmount('');
    setMFormTargetCount('');
    setMFormSalesProgress('');
    setMFormTargetAchievementRate('');
    setMFormCampaignProgress('');
    setMFormNotes('');
    setMFormTasks([]);
    setIsMinutesModalOpen(true);
  };

  const handleOpenEditMinutes = (m: MinutesItem) => {
    setEditingMinutes(m);
    setMFormDate(m.date);
    setMFormCampaignStartDate(m.campaignStartDate ?? m.date);
    setMFormCampaignEndDate(m.campaignEndDate ?? m.date);
    setMFormSquareProductName(m.squareProductName ?? '');
    setMFormTitle(m.title);
    if (['キャンペーン', '週MT', '月MT'].includes(m.category)) {
      setMFormCategory(m.category);
      setMFormOtherCategory('');
    } else {
      setMFormCategory('その他');
      setMFormOtherCategory(m.category);
    }
    setMFormTargetAmount(m.targetAmount ?? '');
    setMFormTargetCount(m.targetCount ?? '');
    setMFormSalesProgress(m.salesProgress ?? '');
    setMFormTargetAchievementRate(m.targetAchievementRate ?? '');
    setMFormCampaignProgress(m.campaignProgress ?? '');
    setMFormNotes(m.notes);
    setMFormTasks(m.tasks ? [...m.tasks] : []);
    setIsMinutesModalOpen(true);
  };

  const getTemplatesForCategory = (category: string): MinutesTask[] => {
    const dbTemplates = taskTemplates.filter(t => t.category === category);
    const source = dbTemplates.length > 0 ? dbTemplates : (DEFAULT_TEMPLATES[category] ?? []);
    return source.map(t => ({
      title: t.title, assignee: t.assignee, dueDate: mFormDate, priority: t.priority
    }));
  };

  const handleCategoryChangeForMinutes = (cat: string) => {
    setMFormCategory(cat);
    if (mFormTasks.length === 0) {
      const presetTasks = getTemplatesForCategory(cat);
      if (presetTasks.length > 0) setMFormTasks(presetTasks);
    }
  };

  const handleAddPresetToMinutes = () => {
    const presetTasks = getTemplatesForCategory(mFormCategory);
    if (presetTasks.length > 0) setMFormTasks([...mFormTasks, ...presetTasks]);
  };

  const handleOpenTemplateManager = () => {
    setTemplateCategory(mFormCategory);
    setTemplateTitle('');
    setTemplateAssignee('TAKA');
    setTemplatePriority(false);
    setEditingTemplateId(null);
    setIsTemplateModalOpen(true);
  };

  const handleEditTemplate = (template: TaskTemplate) => {
    setTemplateCategory(template.category);
    setTemplateTitle(template.title);
    setTemplateAssignee(template.assignee);
    setTemplatePriority(template.priority);
    setEditingTemplateId(template.id);
  };

  const handleSaveTemplate = async () => {
    if (!templateTitle.trim()) return;
    const payload = {
      category: templateCategory,
      title: templateTitle.trim(),
      assignee: templateAssignee,
      priority: templatePriority,
    };
    if (editingTemplateId) {
      const { data, error } = await supabase.from('task_templates').update(payload)
        .eq('id', editingTemplateId).select('id, category, title, assignee, priority').single();
      if (error || !data) {
        alert(`定型タスクの更新に失敗しました。\n${error?.message ?? ''}`);
        return;
      }
      setTaskTemplates(prev => prev.map(t => t.id === editingTemplateId ? {
        id: String(data.id), category: data.category, title: data.title,
        assignee: data.assignee === 'NANA' ? 'NANA' : 'TAKA', priority: Boolean(data.priority)
      } : t));
    } else {
      const { data, error } = await supabase.from('task_templates').insert(payload)
        .select('id, category, title, assignee, priority').single();
      if (error || !data) {
        alert(`定型タスクの登録に失敗しました。\n${error?.message ?? ''}`);
        return;
      }
      setTaskTemplates(prev => [...prev, {
        id: String(data.id), category: data.category, title: data.title,
        assignee: data.assignee === 'NANA' ? 'NANA' : 'TAKA', priority: Boolean(data.priority)
      }]);
    }
    setTemplateTitle('');
    setTemplateAssignee('TAKA');
    setTemplatePriority(false);
    setEditingTemplateId(null);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('この定型タスクを削除しますか？')) return;
    const { error } = await supabase.from('task_templates').delete().eq('id', id);
    if (error) {
      alert(`定型タスクの削除に失敗しました。\n${error.message}`);
      return;
    }
    setTaskTemplates(prev => prev.filter(t => t.id !== id));
  };

  const handleAddBlankTaskToMinutes = () => {
    setMFormTasks([...mFormTasks, { title: '', assignee: 'TAKA', dueDate: mFormDate, priority: false }]);
  };

  const handleRemoveTaskFromMinutes = (index: number) => {
    setMFormTasks(mFormTasks.filter((_, i) => i !== index));
  };

  const handleSaveMinutes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mFormTitle.trim()) return;

    const finalCategory = mFormCategory === 'その他'
      ? (mFormOtherCategory.trim() || 'その他') : mFormCategory;
    const minutesId = editingMinutes ? editingMinutes.id : Date.now();

    const payload = {
      id: minutesId,
      date: mFormDate,
      campaign_start_date: finalCategory === 'キャンペーン' ? (mFormCampaignStartDate || null) : null,
      campaign_end_date: finalCategory === 'キャンペーン' ? (mFormCampaignEndDate || null) : null,
      campaign_calendar_enabled: finalCategory === 'キャンペーン' ? mFormCampaignCalendarEnabled : false,
      square_product_name: finalCategory === 'キャンペーン' ? (mFormSquareProductName.trim() || null) : null,
      title: mFormTitle.trim(),
      category: finalCategory,
      target_amount: mFormTargetAmount === '' ? null : Number(mFormTargetAmount),
      target_count: mFormTargetCount === '' ? null : Number(mFormTargetCount),
      sales_progress: mFormSalesProgress.trim(),
      target_achievement_rate: mFormTargetAchievementRate.trim(),
      campaign_progress: mFormCampaignProgress.trim(),
      tasks: mFormTasks,
      notes: mFormNotes.trim(),
    };

    const result = editingMinutes
      ? await supabase.from('minutes').update(payload).eq('id', minutesId).select().single()
      : await supabase.from('minutes').insert(payload).select().single();

    if (result.error || !result.data) {
      console.error('議事録保存エラー:', result.error);
      alert(`議事録の保存に失敗しました。\n${result.error?.message ?? ''}`);
      return;
    }

    const row = result.data;
    const minutesData: MinutesItem = {
      id: Number(row.id),
      date: row.date,
      campaignStartDate: row.campaign_start_date ?? undefined,
      campaignEndDate: row.campaign_end_date ?? undefined,
      campaignCalendarEnabled: Boolean(row.campaign_calendar_enabled),
      title: row.title,
      category: row.category,
      targetAmount: row.target_amount == null ? undefined : Number(row.target_amount),
      targetCount: row.target_count == null ? undefined : Number(row.target_count),
      salesProgress: row.sales_progress ?? '',
      targetAchievementRate: row.target_achievement_rate ?? '',
      campaignProgress: row.campaign_progress ?? '',
      tasks: Array.isArray(row.tasks) ? row.tasks : mFormTasks,
      notes: row.notes ?? '',
    };

    if (editingMinutes) {
      setMinutesList(prev => prev.map(m => m.id === editingMinutes.id ? minutesData : m));
    } else {
      setMinutesList(prev => [minutesData, ...prev]);

      const linkedTaskPayloads = mFormTasks.filter(mt => mt.title.trim()).map(mt => ({
        title: mt.title.trim(),
        assignee: mt.assignee,
        due_date: mt.dueDate,
        category: finalCategory === 'キャンペーン' ? 'SNS' : '事務',
        priority: mt.priority,
        completed: false,
        repeat: 'none',
        linked_minutes_id: String(minutesData.id),
      }));

      if (linkedTaskPayloads.length > 0) {
        const { data: linkedData, error: linkedError } = await supabase.from('tasks')
          .insert(linkedTaskPayloads)
          .select('id, title, assignee, due_date, category, priority, completed, repeat, repeat_config, repeat_group_id, linked_minutes_id, created_at')
          .order('created_at', { ascending: false });

        if (linkedError) {
          console.error('議事録連動タスク保存エラー:', linkedError);
          alert(`連動タスクの保存に失敗しました。\n${linkedError.message}`);
        } else {
          const newlyCreatedTasks: TaskItem[] = (linkedData ?? []).map(row => ({
            id: String(row.id), title: row.title ?? '',
            assignee: row.assignee === 'NANA' ? 'NANA' : 'TAKA',
            dueDate: row.due_date ?? '', category: row.category ?? 'その他',
            priority: Boolean(row.priority), completed: Boolean(row.completed),
            repeat: row.repeat === 'weekly' || row.repeat === 'monthly' ? row.repeat : 'none',
            repeatConfig: row.repeat_config ?? undefined,
            repeatGroupId: row.repeat_group_id ? String(row.repeat_group_id) : undefined,
            linkedMinutesId: row.linked_minutes_id ? String(row.linked_minutes_id) : undefined,
          }));
          setTasks(prev => [...newlyCreatedTasks, ...prev]);
        }
      }
    }

    setIsMinutesModalOpen(false);
  };

  const handleDeleteMinutes = async (id: number) => {
    if (!confirm('この議事録を削除しますか？')) return;
    const { error } = await supabase.from('minutes').delete().eq('id', id);
    if (error) {
      alert(`議事録の削除に失敗しました。\n${error.message}`);
      return;
    }
    setMinutesList(prev => prev.filter(m => m.id !== id));
  };

  // ---------------------------------------------------------------------------
  // フィルター・表示用メモ化
  // ---------------------------------------------------------------------------
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesYearMonth = t.dueDate ? t.dueDate.startsWith(selectedYearMonth) : false;
      const matchesSearch = t.title.includes(taskSearch) || t.category.includes(taskSearch);
      const matchesCategory = taskCategoryFilter === 'all' || t.category === taskCategoryFilter;
      const matchesAssignee = taskAssigneeFilter === 'all' || t.assignee === taskAssigneeFilter;
      return matchesYearMonth && matchesSearch && matchesCategory && matchesAssignee;
    });
  }, [tasks, selectedYearMonth, taskSearch, taskCategoryFilter, taskAssigneeFilter]);

  const filteredMinutes = useMemo(() => {
    return minutesList.filter(m => {
      const matchesYearMonth = m.date.startsWith(selectedYearMonth);
      const matchesSearch = m.title.includes(minutesSearch) || m.notes.includes(minutesSearch) || m.category.includes(minutesSearch);
      return matchesYearMonth && matchesSearch;
    });
  }, [minutesList, selectedYearMonth, minutesSearch]);

  const calendarDays = useMemo(() => {
    const [yearStr, monthStr] = selectedYearMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayIndex = new Date(year, month - 1, 1).getDay();

    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ day: null, dateStr: '' });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dStr = String(d).padStart(2, '0');
      const dateStr = `${selectedYearMonth}-${dStr}`;
      days.push({ day: d, dateStr });
    }
    return days;
  }, [selectedYearMonth]);

  const yearMonthOptions = useMemo(() => {
    const options = [];
    const currentDate = new Date();
    for (let i = -12; i <= 12; i++) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      options.push(d.toISOString().slice(0, 7));
    }
    return Array.from(new Set(options)).sort().reverse();
  }, []);

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 font-sans pb-12">
      <Header />

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span>📋</span> タスク・議事録統合管理システム
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              ジム運営のタスク管理、定型タスク連動型ミーティング議事録、カレンダー予定を一元管理します。
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500">表示年月:</span>
              <select
                value={selectedYearMonth}
                onChange={(e) => setSelectedYearMonth(e.target.value)}
                className="bg-transparent text-sm font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                {yearMonthOptions.map(ym => (
                  <option key={ym} value={ym}>{ym.replace('-', '年')}月</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenAddTask}
                className="bg-[#5e9bc4] hover:bg-[#4d85ab] text-white px-4 py-2 rounded-xl font-semibold text-sm transition shadow-sm flex items-center gap-1.5"
              >
                <span>＋</span> タスク追加
              </button>
              <button
                onClick={handleOpenAddMinutes}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl font-semibold text-sm transition shadow-sm flex items-center gap-1.5"
              >
                <span>📝</span> 議事録作成
              </button>
            </div>
          </div>
        </div>

        <div className="flex border-b border-slate-200 gap-4">
          <button
            onClick={() => setActiveTab('task')}
            className={`pb-3 px-4 font-bold text-sm transition border-b-2 ${
              activeTab === 'task'
                ? 'border-[#5e9bc4] text-[#5e9bc4]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            ◻︎ タスク管理 ({filteredTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('minutes')}
            className={`pb-3 px-4 font-bold text-sm transition border-b-2 ${
              activeTab === 'minutes'
                ? 'border-[#5e9bc4] text-[#5e9bc4]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            ◻︎ ミーティング議事録 ({filteredMinutes.length})
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`pb-3 px-4 font-bold text-sm transition border-b-2 ${
              activeTab === 'calendar'
                ? 'border-[#5e9bc4] text-[#5e9bc4]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            📅 カレンダー表示
          </button>
        </div>

        {/* タブ1: タスク管理 */}
        {activeTab === 'task' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-3 justify-between items-center">
              <div className="w-full md:w-80">
                <input
                  type="text"
                  placeholder="タスク内容で検索..."
                  value={taskSearch}
                  onChange={(e) => setTaskSearch(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]/50"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={taskAssigneeFilter}
                  onChange={(e) => setTaskAssigneeFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700"
                >
                  <option value="all">担当者: すべて</option>
                  <option value="TAKA">TAKA</option>
                  <option value="NANA">NANA</option>
                </select>

                <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
                  {['all', 'SNS', '顧客フォロー', '事務', 'キャンペーン'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setTaskCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        taskCategoryFilter === cat
                          ? 'bg-[#5e9bc4] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat === 'all' ? '全カテゴリー' : cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition ${
                      item.completed ? 'opacity-60 bg-slate-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleComplete(item.id)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-[#5e9bc4] focus:ring-[#5e9bc4] cursor-pointer"
                      />
                      <div className="space-y-1.5 w-full">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold text-white ${
                              item.assignee === 'TAKA' ? 'bg-[#5e9bc4]' : 'bg-emerald-600'
                            }`}
                          >
                            {item.assignee}
                          </span>

                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600">
                            {item.category}
                          </span>

                          {item.priority && (
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                              🔥 重要
                            </span>
                          )}

                          {(item.repeat !== 'none' || item.repeatGroupId) && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              🔄 繰り返し{item.repeat !== 'none' ? ` (${item.repeat === 'weekly' ? '週' : '月'})` : ''}
                            </span>
                          )}

                          <span className="text-xs text-slate-400 ml-auto">期日: {item.dueDate}</span>
                        </div>

                        <h3 className={`font-bold text-slate-800 text-sm sm:text-base ${item.completed ? 'line-through text-slate-400' : ''}`}>
                          {item.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => handleOpenEditTask(item)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                      >
                        修正
                      </button>
                      <button
                        onClick={() => handleDeleteTask(item.id)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-semibold transition"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-200">
                  該当するタスクが見つかりませんでした。
                </div>
              )}
            </div>
          </div>
        )}

        {/* タブ2: ミーティング議事録 */}
        {activeTab === 'minutes' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
              <div className="w-full md:w-96">
                <input
                  type="text"
                  placeholder="議事録のタイトルや内容で検索..."
                  value={minutesSearch}
                  onChange={(e) => setMinutesSearch(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]/50"
                />
              </div>
              <div className="text-xs font-semibold text-slate-500 hidden md:block">
                対象年月: {selectedYearMonth}
              </div>
            </div>

            <div className="space-y-4">
              {filteredMinutes.length > 0 ? (
                filteredMinutes.map((m) => (
                  <div key={m.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-slate-100 pb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-[#5e9bc4] text-white">
                            {m.category}
                          </span>
                          <span className="text-xs text-slate-400 font-semibold">{m.date}</span>
                        </div>
                        <h3 className="font-bold text-lg text-slate-800">{m.title}</h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditMinutes(m)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                        >
                          修正
                        </button>
                        <button
                          onClick={() => handleDeleteMinutes(m.id)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-semibold transition"
                        >
                          削除
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                      {m.targetAmount !== undefined && (
                        <div>
                          <span className="text-slate-400 block">目標金額</span>
                          <span className="font-bold text-slate-800 text-sm">¥{m.targetAmount.toLocaleString()}</span>
                        </div>
                      )}
                      {m.targetCount !== undefined && (
                        <div>
                          <span className="text-slate-400 block">目標件数</span>
                          <span className="font-bold text-slate-800 text-sm">{m.targetCount} 件</span>
                        </div>
                      )}
                      {m.category === 'キャンペーン' && m.squareProductName?.trim() && (
                        <>
                          <div>
                            <span className="text-slate-400 block">実績件数</span>
                            <span className="font-bold text-slate-800 text-sm">
                              {(m.actualCount ?? 0).toLocaleString()} 件
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">実績売上</span>
                            <span className="font-bold text-slate-800 text-sm">
                              ¥{(m.actualSales ?? 0).toLocaleString()}
                            </span>
                          </div>
                        </>
                      )}
                      {m.salesProgress && (
                        <div>
                          <span className="text-slate-400 block">売上進捗</span>
                          <span className="font-bold text-slate-800 text-sm">{m.salesProgress}</span>
                        </div>
                      )}
                      {m.targetAchievementRate && (
                        <div>
                          <span className="text-slate-400 block">目標達成率</span>
                          <span className="font-bold text-slate-800 text-sm">{m.targetAchievementRate}</span>
                        </div>
                      )}
                      {m.campaignProgress && (
                        <div>
                          <span className="text-slate-400 block">キャンペーン進捗</span>
                          <span className="font-bold text-slate-800 text-sm">{m.campaignProgress}</span>
                        </div>
                      )}
                    </div>

                    {m.tasks && m.tasks.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">連動定型タスク</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {m.tasks.map((t, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                              <div className="flex items-center gap-2">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold text-white ${t.assignee === 'TAKA' ? 'bg-[#5e9bc4]' : 'bg-emerald-600'}`}>
                                  {t.assignee}
                                </span>
                                <span className="font-semibold text-slate-700">{t.title}</span>
                              </div>
                              <span className="text-slate-400">期日: {t.dueDate}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-slate-600 whitespace-pre-wrap bg-white p-3 rounded-xl border border-slate-100">
                      {m.notes || 'MT詳細メモなし'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-200">
                  該当する議事録が見つかりませんでした。
                </div>
              )}
            </div>
          </div>
        )}

        {/* タブ3: カレンダー表示 */}
        {activeTab === 'calendar' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">
                📅 {selectedYearMonth.replace('-', '年')}月のスケジュールカレンダー
              </h3>
              <p className="text-xs text-slate-500">日付ごとのタスク予定がひと目で分かります</p>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-500 border-b border-slate-200 pb-2">
              <span className="text-rose-500">日</span>
              <span>月</span>
              <span>火</span>
              <span>水</span>
              <span>木</span>
              <span>金</span>
              <span className="text-[#5e9bc4]">土</span>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((item, index) => {
                const dayTasks = item.dateStr ? tasks.filter(t => t.dueDate === item.dateStr) : [];
                const dayCampaigns = item.dateStr
                  ? minutesList.filter(m =>
                      m.category === 'キャンペーン' &&
                      m.campaignCalendarEnabled === true &&
                      m.campaignStartDate &&
                      m.campaignEndDate &&
                      item.dateStr >= m.campaignStartDate &&
                      item.dateStr <= m.campaignEndDate
                    )
                  : [];
                return (
                  <div
                    key={index}
                    className={`min-h-[100px] p-2 rounded-xl border flex flex-col justify-between transition ${
                      item.day
                        ? 'bg-white border-slate-200 hover:border-[#5e9bc4]/50'
                        : 'bg-slate-50/50 border-transparent'
                    }`}
                  >
                    {item.day && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-700">{item.day}</span>
                          {dayTasks.length > 0 && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-bold">
                              {dayTasks.length}件
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 overflow-y-auto max-h-[70px] mt-1">
                          {dayCampaigns.map(campaign => (
                            <div
                              key={`campaign-${campaign.id}`}
                              className="text-[10px] p-1 rounded truncate bg-[#FFE8AB] text-slate-700 font-semibold"
                              title={`キャンペーン: ${campaign.title}`}
                            >
                              🟨 {campaign.title}
                            </div>
                          ))}
                          {dayTasks.map(t => (
                            <div
                              key={t.id}
                              onClick={() => handleOpenEditTask(t)}
                              className={`text-[10px] p-1 rounded truncate cursor-pointer transition ${
                                t.completed ? 'bg-slate-100 text-slate-400 line-through' : 'bg-slate-100 text-slate-700 hover:bg-[#5e9bc4]/10 hover:text-[#5e9bc4]'
                              }`}
                              title={t.title}
                            >
                              <span className={`font-bold mr-1 ${t.assignee === 'TAKA' ? 'text-[#5e9bc4]' : 'text-emerald-600'}`}>
                                [{t.assignee}]
                              </span>
                              {t.title}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* タスク登録・修正モーダル */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-800">
                {editingTask ? 'タスクの修正' : '新規タスクの追加'}
              </h3>
              <button onClick={() => setIsTaskModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">タスク内容 *</label>
                <input
                  type="text"
                  required
                  placeholder="例: チラシ掲示とSNS告知準備..."
                  value={tFormTitle}
                  onChange={(e) => setTFormTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">担当者</label>
                  <select
                    value={tFormAssignee}
                    onChange={(e) => setTFormAssignee(e.target.value as Assignee)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                  >
                    <option value="TAKA">TAKA</option>
                    <option value="NANA">NANA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">期日 *</label>
                  <input
                    type="date"
                    required
                    value={tFormDueDate}
                    onChange={(e) => setTFormDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">カテゴリー</label>
                  <select
                    value={tFormCategory}
                    onChange={(e) => setTFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                  >
                    <option value="SNS">SNS</option>
                    <option value="顧客フォロー">顧客フォロー</option>
                    <option value="事務">事務</option>
                    <option value="キャンペーン">キャンペーン</option>
                    <option value="その他">その他</option>
                  </select>
                </div>
                {tFormCategory === 'その他' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">その他のカテゴリー名</label>
                    <input
                      type="text"
                      placeholder="例: 設備・清掃"
                      value={tFormOtherCategory}
                      onChange={(e) => setTFormOtherCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">繰り返し</label>
                  <select
                    value={tFormRepeat}
                    onChange={(e) => {
                      const mode = e.target.value as RepeatMode;
                      setTFormRepeat(mode);
                      if (mode === 'weekly' && tFormRepeatDays.length === 0) {
                        setTFormRepeatDays([new Date(`${tFormDueDate}T00:00:00`).getDay()]);
                      } else if (mode === 'monthly' && tFormRepeatDays.length === 0) {
                        setTFormRepeatDays([Number(tFormDueDate.slice(8, 10))]);
                      } else if (mode === 'none') {
                        setTFormRepeatDays([]);
                        setTFormRepeatEndDate('');
                        setTFormRepeatNoEnd(true);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                  >
                    <option value="none">なし</option>
                    <option value="weekly">毎週（曜日指定）</option>
                    <option value="monthly">毎月（日付指定）</option>
                  </select>
                </div>
              </div>

              {tFormRepeat !== 'none' && (
                <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2">
                      {tFormRepeat === 'weekly' ? '繰り返す曜日' : '繰り返す日'}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {(tFormRepeat === 'weekly'
                        ? ['日', '月', '火', '水', '木', '金', '土'].map((label, value) => ({ label, value }))
                        : Array.from({ length: 31 }, (_, i) => ({ label: `${i + 1}日`, value: i + 1 }))
                      ).map(({ label, value }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setTFormRepeatDays(prev =>
                            prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value].sort((a, b) => a - b)
                          )}
                          className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition ${
                            tFormRepeatDays.includes(value)
                              ? 'bg-[#5e9bc4] text-white border-[#5e9bc4]'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <label className="text-xs font-semibold text-slate-600">期間</label>
                    <label className="flex items-center gap-1.5 text-xs">
                      <input type="radio" checked={tFormRepeatNoEnd} onChange={() => setTFormRepeatNoEnd(true)} />
                      この先ずっと
                    </label>
                    <label className="flex items-center gap-1.5 text-xs">
                      <input type="radio" checked={!tFormRepeatNoEnd} onChange={() => setTFormRepeatNoEnd(false)} />
                      期限付き
                    </label>
                    {!tFormRepeatNoEnd && (
                      <input type="date" min={tFormDueDate} value={tFormRepeatEndDate}
                        onChange={(e) => setTFormRepeatEndDate(e.target.value)}
                        className="px-2 py-1 rounded-lg border border-slate-200 text-xs bg-white" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500">曜日・日付を複数選択できます。「この先ずっと」は必要な月を表示すると、その月の予定を自動追加します。</p>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="tFormPriority"
                  checked={tFormPriority}
                  onChange={(e) => setTFormPriority(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <label htmlFor="tFormPriority" className="text-xs font-bold text-slate-700 cursor-pointer">
                  🔥 重要タスクとして赤強調する
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#5e9bc4] hover:bg-[#4d85ab] text-white rounded-xl text-xs font-semibold transition shadow-sm"
                >
                  保存する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 議事録登録・修正モーダル */}
      {isMinutesModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-800">
                {editingMinutes ? 'ミーティング議事録の修正' : '新規ミーティング議事録の作成'}
              </h3>
              <button onClick={() => setIsMinutesModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveMinutes} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">議事録タイトル *</label>
                  <input
                    type="text"
                    required
                    placeholder="例: 9月度キックオフ＆キャンペーン方針MT"
                    value={mFormTitle}
                    onChange={(e) => setMFormTitle(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">実施日 *</label>
                  <input
                    type="date"
                    required
                    value={mFormDate}
                    onChange={(e) => setMFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">カテゴリー</label>
                  <select
                    value={mFormCategory}
                    onChange={(e) => handleCategoryChangeForMinutes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                  >
                    <option value="週MT">週MT</option>
                    <option value="月MT">月MT</option>
                    <option value="キャンペーン">キャンペーン</option>
                    <option value="その他">その他</option>
                  </select>
                </div>
                {mFormCategory === 'その他' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">その他のカテゴリー名</label>
                    <input
                      type="text"
                      placeholder="例: 臨時MT"
                      value={mFormOtherCategory}
                      onChange={(e) => setMFormOtherCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                )}
              </div>

              {mFormCategory === 'キャンペーン' && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        キャンペーン開始日
                      </label>
                      <input
                        type="date"
                        value={mFormCampaignStartDate}
                        onChange={(e) => setMFormCampaignStartDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        キャンペーン終了日
                      </label>
                      <input
                        type="date"
                        value={mFormCampaignEndDate}
                        onChange={(e) => setMFormCampaignEndDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 mt-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mFormCampaignCalendarEnabled}
                      onChange={(e) => setMFormCampaignCalendarEnabled(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-[#5e9bc4] focus:ring-[#5e9bc4]"
                    />
                    <span className="text-sm font-semibold text-slate-700">
                      カレンダーに連携する
                    </span>
                  </label>
                  <div className="mt-4">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      レジ設定の商品名（Square）
                    </label>
                    <input
                      type="text"
                      placeholder="Squareに登録されている商品名と完全一致"
                      value={mFormSquareProductName}
                      onChange={(e) => setMFormSquareProductName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Squareの売上と商品名を完全一致で照合します。
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">目標金額 (円)</label>
                  <input
                    type="number"
                    placeholder="例: 500000"
                    value={mFormTargetAmount}
                    onChange={(e) => setMFormTargetAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">目標件数</label>
                  <input
                    type="number"
                    placeholder="例: 10"
                    value={mFormTargetCount}
                    onChange={(e) => setMFormTargetCount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">売上進捗</label>
                  <input
                    type="text"
                    placeholder="例: 順調（前年比110%）"
                    value={mFormSalesProgress}
                    onChange={(e) => setMFormSalesProgress(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">目標達成率</label>
                  <input
                    type="text"
                    placeholder="例: 85%"
                    value={mFormTargetAchievementRate}
                    onChange={(e) => setMFormTargetAchievementRate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">キャンペーン進捗</label>
                <input
                  type="text"
                  placeholder="例: チラシデザイン確定・印刷発注済み"
                  value={mFormCampaignProgress}
                  onChange={(e) => setMFormCampaignProgress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              {/* 連動タスクセクション */}
              <div className="space-y-3 border-t border-slate-100 pt-3">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-700">連動定型タスク (ここに入力した項目はタスク管理にも自動追加されます)</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddPresetToMinutes}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition"
                    >
                      + {mFormCategory}定型読込
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenTemplateManager}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition"
                    >
                      ⚙ 定型管理
                    </button>
                    <button
                      type="button"
                      onClick={handleAddBlankTaskToMinutes}
                      className="px-2.5 py-1 bg-[#5e9bc4]/10 hover:bg-[#5e9bc4]/20 text-[#5e9bc4] rounded-lg text-[11px] font-bold transition"
                    >
                      + タスク行追加
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {mFormTasks.map((t, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <input
                        type="text"
                        placeholder="タスク内容"
                        value={t.title}
                        onChange={(e) => {
                          const updated = [...mFormTasks];
                          updated[idx].title = e.target.value;
                          setMFormTasks(updated);
                        }}
                        className="flex-1 px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-white"
                      />
                      <select
                        value={t.assignee}
                        onChange={(e) => {
                          const updated = [...mFormTasks];
                          updated[idx].assignee = e.target.value as Assignee;
                          setMFormTasks(updated);
                        }}
                        className="px-2 py-1 rounded-lg border border-slate-200 text-xs bg-white"
                      >
                        <option value="TAKA">TAKA</option>
                        <option value="NANA">NANA</option>
                      </select>
                      <input
                        type="date"
                        value={t.dueDate}
                        onChange={(e) => {
                          const updated = [...mFormTasks];
                          updated[idx].dueDate = e.target.value;
                          setMFormTasks(updated);
                        }}
                        className="px-2 py-1 rounded-lg border border-slate-200 text-xs bg-white"
                      />
                      <label className="flex items-center gap-1 text-[10px] text-slate-500 shrink-0">
                        <input type="checkbox" checked={t.priority}
                          onChange={(e) => {
                            const updated = [...mFormTasks];
                            updated[idx].priority = e.target.checked;
                            setMFormTasks(updated);
                          }}
                        />
                        🔥
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveTaskFromMinutes(idx)}
                        className="text-rose-500 hover:text-rose-700 font-bold px-1.5 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {mFormTasks.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-2">連動タスクはありません。</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">議事録詳細メモ</label>
                <textarea
                  rows={3}
                  placeholder="MTでの決定事項や詳細メモ..."
                  value={mFormNotes}
                  onChange={(e) => setMFormNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]/50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMinutesModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#5e9bc4] hover:bg-[#4d85ab] text-white rounded-xl text-xs font-semibold transition shadow-sm"
                >
                  保存する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isTemplateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-800">⚙ 議事録の定型タスク管理</h3>
              <button onClick={() => setIsTemplateModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <p className="text-[11px] text-slate-500">ここで変更した定型タスクは、これから作成する新規議事録に反映されます。既存の議事録は変更しません。</p>

            <select value={templateCategory} onChange={(e) => {
              setTemplateCategory(e.target.value);
              setEditingTemplateId(null);
              setTemplateTitle('');
              setTemplateAssignee('TAKA');
              setTemplatePriority(false);
            }} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white">
              {MINUTES_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>

            <div className="space-y-2">
              {taskTemplates.filter(t => t.category === templateCategory).map(t => (
                <div key={t.id} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="flex-1 text-xs font-semibold text-slate-700">{t.title}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white border border-slate-200">{t.assignee}</span>
                  {t.priority && <span className="text-[10px] text-rose-600 font-bold">🔥</span>}
                  <button type="button" onClick={() => handleEditTemplate(t)} className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-semibold">修正</button>
                  <button type="button" onClick={() => handleDeleteTemplate(t.id)} className="px-2 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-semibold">削除</button>
                </div>
              ))}
              {taskTemplates.filter(t => t.category === templateCategory).length === 0 &&
                <p className="text-xs text-slate-400 text-center py-3">このカテゴリーの定型タスクはありません。</p>}
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-3">
              <div className="text-xs font-bold text-slate-700">{editingTemplateId ? '定型タスクを修正' : '定型タスクを追加'}</div>
              <input type="text" placeholder="タスク内容" value={templateTitle}
                onChange={(e) => setTemplateTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <select value={templateAssignee} onChange={(e) => setTemplateAssignee(e.target.value as Assignee)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white">
                  <option value="TAKA">TAKA</option><option value="NANA">NANA</option>
                </select>
                <label className="flex items-center gap-2 px-3 py-2 text-xs font-semibold">
                  <input type="checkbox" checked={templatePriority} onChange={(e) => setTemplatePriority(e.target.checked)} /> 🔥 重要
                </label>
              </div>
              <div className="flex justify-end gap-2">
                {editingTemplateId && <button type="button" onClick={() => {
                  setEditingTemplateId(null); setTemplateTitle(''); setTemplateAssignee('TAKA'); setTemplatePriority(false);
                }} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold">新規入力</button>}
                <button type="button" onClick={handleSaveTemplate}
                  className="px-4 py-2 bg-[#5e9bc4] hover:bg-[#4d85ab] text-white rounded-xl text-xs font-semibold">
                  {editingTemplateId ? '更新する' : '登録する'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
