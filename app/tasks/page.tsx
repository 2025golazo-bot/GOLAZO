'use client'; //

import React, { useState, useMemo } from 'react';
import { Task, MeetingNote, Staff } from '../types';

export const TaskAndMeeting: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. タスク管理ステート
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 't1',
      title: 'SNS告知画像の作成',
      assignedTo: 'TAKA',
      dueDate: '2026-09-15',
      category: 'SNS',
      status: '未着手',
      isImportant: true,
    },
  ]);

  // 2. 議事録管理ステート
  const [meetingForm, setMeetingForm] = useState<{
    dateTime: string;
    category: 'キャンペーン' | '週MT' | '月MT' | string;
    customCategory: string;
    title: string;
    content: string;
    // キャンペーン議事録連動項目
    targetAmount: number;
    targetCount: number;
    salesProgress: string;
    achievementRate: string;
    campaignProgress: string;
  }>({
    dateTime: '2026-09-08T10:00',
    category: 'キャンペーン',
    customCategory: '',
    title: '秋の体験キャンペーンMT',
    content: '集客に向けたSNS発信とチラシの準備を確認。',
    targetAmount: 500000,
    targetCount: 10,
    salesProgress: '順調に推移中',
    achievementRate: '80%',
    campaignProgress: 'チラシデザイン完了',
  });

  // プリセットタスクの状態（カテゴリーに応じて自動展開・カスタマイズ可能）
  const [presetTasks, setPresetTasks] = useState<{ title: string; assignedTo: Staff; dueDate: string }[]>([
    { title: 'レジ設定', assignedTo: 'TAKA', dueDate: '2026-09-12' },
    { title: 'SNS告知準備', assignedTo: 'NANA', dueDate: '2026-09-13' },
    { title: 'SNS投稿予約', assignedTo: 'NANA', dueDate: '2026-09-14' },
    { title: 'チラシ準備', assignedTo: 'TAKA', dueDate: '2026-09-15' },
    { title: 'チラシ掲示', assignedTo: 'TAKA', dueDate: '2026-09-16' },
    { title: '報告書作成', assignedTo: 'NANA', dueDate: '2026-09-18' },
  ]);

  // 議事録からタスクを一括登録・上のタスク管理へ連動同期
  const handleRegisterTasksFromMeeting = () => {
    const newTasks: Task[] = presetTasks.map((pt, idx) => ({
      id: `${Date.now()}-${idx}`,
      title: `【${meetingForm.title}】${pt.title}`,
      assignedTo: pt.assignedTo,
      dueDate: pt.dueDate,
      category: meetingForm.category === 'キャンペーン' ? 'SNS' : '事務',
      status: '未着手',
      isImportant: false,
    }));

    setTasks((prev) => [...prev, ...newTasks]);
    alert('選択された定型タスクを上のタスク管理画面へ自動連携・登録しました！');
  };

  // 全体キーワード検索による絞り込み
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchMonth = t.dueDate.startsWith(selectedMonth);
      const matchQuery =
        !searchQuery ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());
      return matchMonth && matchQuery;
    });
  }, [tasks, selectedMonth, searchQuery]);

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* ヘッダー・月別タブ & 全体検索 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#5e9bc4]">タスク・議事録画面</h1>
          <p className="text-xs text-slate-500 mt-1">月別管理およびタスク連動・議事録の管理を行います</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600">月別選択:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="p-2 border rounded-md bg-white text-sm"
            />
          </div>
          <div className="w-64">
            <input
              type="text"
              placeholder="全体キーワード検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border rounded-md text-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* タスク管理セクション */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-lg font-semibold text-slate-800 border-b pb-2 flex justify-between items-center">
            <span>タスク管理（カレンダー・リスト表示）</span>
            <span className="text-xs font-normal text-slate-400">({filteredTasks.length}件表示中)</span>
          </h2>
          <div className="space-y-3 max-h-[650px] overflow-y-auto pr-1">
            {filteredTasks.map((t) => (
              <div
                key={t.id}
                className={`p-3.5 rounded-lg border flex justify-between items-center transition-all ${
                  t.isImportant ? 'border-red-400 bg-red-50/40' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold ${
                        t.assignedTo === 'TAKA' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                      }`}
                    >
                      {t.assignedTo}
                    </span>
                    <span className="font-bold text-sm text-slate-800">{t.title}</span>
                    {t.isImportant && (
                      <span className="text-xs bg-red-500 text-white font-bold px-1.5 py-0.5 rounded">重要</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    期日: {t.dueDate} | カテゴリ: {t.category}
                  </div>
                </div>
                <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded font-medium">{t.status}</span>
              </div>
            ))}
            {filteredTasks.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-sm">条件に一致するタスクはありません。</div>
            )}
          </div>
        </div>

        {/* 議事録管理セクション */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-lg font-semibold text-slate-800 border-b pb-2">ミーティング議事録作成＆タスク連動</h2>
          
          <div className="space-y-3 text-sm max-h-[650px] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">日時</label>
                <input
                  type="datetime-local"
                  value={meetingForm.dateTime}
                  onChange={(e) => setMeetingForm({ ...meetingForm, dateTime: e.target.value })}
                  className="w-full mt-1 p-2 border rounded"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">カテゴリー</label>
                <select
                  value={meetingForm.category}
                  onChange={(e) => setMeetingForm({ ...meetingForm, category: e.target.value })}
                  className="w-full mt-1 p-2 border rounded bg-white"
                >
                  <option value="キャンペーン">キャンペーン</option>
                  <option value="週MT">週MT</option>
                  <option value="月MT">月MT</option>
                  <option value="その他">その他</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600">タイトル</label>
              <input
                type="text"
                value={meetingForm.title}
                onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                className="w-full mt-1 p-2 border rounded"
              />
            </div>

            {/* キャンペーン議事録連動項目 */}
            {meetingForm.category === 'キャンペーン' && (
              <div className="p-3 bg-[#FFE8AB]/20 rounded-lg border border-[#FFE8AB] space-y-3">
                <span className="text-xs font-bold text-amber-800">キャンペーン連動指標</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">目標金額 (円)</label>
                    <input
                      type="number"
                      value={meetingForm.targetAmount}
                      onChange={(e) => setMeetingForm({ ...meetingForm, targetAmount: Number(e.target.value) })}
                      className="w-full mt-1 p-1.5 border rounded bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">目標件数</label>
                    <input
                      type="number"
                      value={meetingForm.targetCount}
                      onChange={(e) => setMeetingForm({ ...meetingForm, targetCount: Number(e.target.value) })}
                      className="w-full mt-1 p-1.5 border rounded bg-white text-xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">売上進捗</label>
                    <input
                      type="text"
                      value={meetingForm.salesProgress}
                      onChange={(e) => setMeetingForm({ ...meetingForm, salesProgress: e.target.value })}
                      className="w-full mt-1 p-1.5 border rounded bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">達成率</label>
                    <input
                      type="text"
                      value={meetingForm.achievementRate}
                      onChange={(e) => setMeetingForm({ ...meetingForm, achievementRate: e.target.value })}
                      className="w-full mt-1 p-1.5 border rounded bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">キャンペーン進捗</label>
                    <input
                      type="text"
                      value={meetingForm.campaignProgress}
                      onChange={(e) => setMeetingForm({ ...meetingForm, campaignProgress: e.target.value })}
                      className="w-full mt-1 p-1.5 border rounded bg-white text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-600">内容</label>
              <textarea
                value={meetingForm.content}
                onChange={(e) => setMeetingForm({ ...meetingForm, content: e.target.value })}
                className="w-full mt-1 p-2 border rounded"
                rows={3}
              />
            </div>

            {/* プリセットタスク自動展開＆カスタマイズ領域 */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700">自動連動プリセットタスク（編集可能）</span>
                <span className="text-[10px] text-slate-400">{presetTasks.length}件設定中</span>
              </div>
              <div className="space-y-1.5">
                {presetTasks.map((pt, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded border border-slate-100 text-xs">
                    <input
                      type="text"
                      value={pt.title}
                      onChange={(e) => {
                        const updated = [...presetTasks];
                        updated[idx].title = e.target.value;
                        setPresetTasks(updated);
                      }}
                      className="flex-1 p-1 border rounded"
                    />
                    <select
                      value={pt.assignedTo}
                      onChange={(e) => {
                        const updated = [...presetTasks];
                        updated[idx].assignedTo = e.target.value as Staff;
                        setPresetTasks(updated);
                      }}
                      className="p-1 border rounded bg-white"
                    >
                      <option value="TAKA">TAKA</option>
                      <option value="NANA">NANA</option>
                    </select>
                    <input
                      type="date"
                      value={pt.dueDate}
                      onChange={(e) => {
                        const updated = [...presetTasks];
                        updated[idx].dueDate = e.target.value;
                        setPresetTasks(updated);
                      }}
                      className="p-1 border rounded text-[11px]"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleRegisterTasksFromMeeting}
              className="w-full py-2.5 bg-[#5e9bc4] text-white font-bold rounded-lg shadow hover:opacity-90 transition-opacity"
            >
              議事録を保存し、定型タスクを上のタスク管理へ自動連携
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
