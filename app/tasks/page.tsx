'use client';

import React, { useState } from 'react';

interface Task {
  id: string;
  title: string;
  assignee: string;
  dueDate: string;
  status: '未着手' | '進行中' | '完了';
}

export default function TasksAndMinutesPage() {
  const [selectedMonth, setSelectedMonth] = useState('2026-09');

  const [tasks, setTasks] = useState<Task[]>([
    { id: 't-1', title: 'SNSキャンペーン画像作成', assignee: '藤田 渉仁', dueDate: '2026-09-15', status: '進行中' },
    { id: 't-2', title: '近隣スポーツ少年団へのチラシ配布', assignee: '藤田 奈々', dueDate: '2026-09-20', status: '未着手' }
  ]);

  const [meetingDate, setMeetingDate] = useState('2026-09-08');
  const [targetAmount, setTargetAmount] = useState('500000');
  const [targetCount, setTargetCount] = useState('10');
  const [salesProgress, setSalesProgress] = useState('70%');
  const [meetingMemo, setMeetingMemo] = useState('秋の新規入会キャンペーンの進捗確認。');

  const [newtaskTitle, setNewTaskTitle] = useState('');
  const [newAssignee, setNewAssignee] = useState('藤田 渉仁');
  const [newDueDate, setNewDueDate] = useState('');

  const handleCreateTaskFromMinutes = () => {
    if (!newtaskTitle || !newDueDate) return;
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newtaskTitle,
      assignee: newAssignee,
      dueDate: newDueDate,
      status: '未着手'
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setNewDueDate('');
    alert('議事録からタスク管理へ連携・登録しました！');
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">タスク・議事録管理</h1>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border border-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5e9bc4] bg-white"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
          <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            📅 タスク管理（予定の視覚化）
          </h2>

          <div className="space-y-3 mb-6">
            {tasks.map((task) => (
              <div key={task.id} className="p-3 border rounded border-slate-200 flex items-center justify-between hover:bg-slate-50">
                <div>
                  <p className="font-semibold text-sm text-slate-800">{task.title}</p>
                  <p className="text-xs text-slate-500">担当: {task.assignee} | 期日: {task.dueDate}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded font-bold ${
                  task.status === '完了' ? 'bg-slate-100 text-slate-600' : 'bg-[#FFE8AB] text-amber-900'
                }`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200 space-y-4">
          <h2 className="font-bold text-slate-700 border-b pb-2">📝 ミーティング議事録登録</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">日時</label>
              <input
                type="date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className="w-full border border-slate-300 rounded p-1.5 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">売上達成率</label>
              <input
                type="text"
                value={salesProgress}
                onChange={(e) => setSalesProgress(e.target.value)}
                className="w-full border border-slate-300 rounded p-1.5 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded border border-slate-200">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">キャンペーン目標金額</label>
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full border border-slate-300 rounded p-1.5 text-sm bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">目標件数</label>
              <input
                type="number"
                value={targetCount}
                onChange={(e) => setTargetCount(e.target.value)}
                className="w-full border border-slate-300 rounded p-1.5 text-sm bg-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">議事録メモ・進捗詳細</label>
            <textarea
              rows={3}
              value={meetingMemo}
              onChange={(e) => setMeetingMemo(e.target.value)}
              className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-[#5e9bc4]"
            />
          </div>

          <div className="border-t pt-3">
            <h3 className="text-xs font-bold text-slate-700 mb-2">💡 議事録決定タスク（自動連携）</h3>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="タスク内容"
                value={newtaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full border border-slate-300 rounded p-1.5 text-xs"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="担当者"
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  className="w-1/2 border border-slate-300 rounded p-1.5 text-xs"
                />
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-1/2 border border-slate-300 rounded p-1.5 text-xs"
                />
              </div>
              <button
                onClick={handleCreateTaskFromMinutes}
                className="w-full bg-[#5e9bc4] hover:bg-sky-600 text-white font-bold py-1.5 rounded text-xs transition"
              >
                タスクを自動連携して登録
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
