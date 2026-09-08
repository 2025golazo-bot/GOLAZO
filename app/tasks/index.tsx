'use client';

import { useState } from 'react';

interface Task {
  id: string;
  title: string;
  category: string;
  dueDate: string;
  completed: boolean;
  assignedTo: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'ジュニア体幹クリニックの告知Instagram投稿作成',
      category: 'SNS発信',
      dueDate: '2026-09-10',
      completed: false,
      assignedTo: '藤田 渉仁',
    },
    {
      id: '2',
      title: '3ヶ月定期計測の対象者への連絡',
      category: '顧客フォロー',
      dueDate: '2026-09-12',
      completed: false,
      assignedTo: '藤田 渉仁',
    },
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('SNS発信');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  const [ticketProgress] = useState([
    { id: '1', client: '鈴木 蓮', ticketName: 'ジュニア体幹 4回券', total: 4, remaining: 1 },
    { id: '2', client: '山田 太郎', ticketName: 'パーソナル 8回券', total: 8, remaining: 5 },
  ]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      category: newTaskCategory,
      dueDate: newTaskDueDate || '2026-09-10',
      completed: false,
      assignedTo: '藤田 渉仁',
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
    setNewTaskDueDate('');
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <main className="p-6 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-black text-gray-900">タスク・運用管理</h1>
        <p className="text-xs text-gray-500 mt-1">パーソナルジムGOLAZOの日常業務管理</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900">新規タスク追加</h2>
          <form onSubmit={handleAddTask} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-gray-700">タスク名</label>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full mt-1 p-2 border rounded-lg bg-white"
                required
              />
            </div>
            <div>
              <label className="font-bold text-gray-700">カテゴリ</label>
              <select
                value={newTaskCategory}
                onChange={(e) => setNewTaskCategory(e.target.value)}
                className="w-full mt-1 p-2 border rounded-lg bg-white"
              >
                <option value="SNS発信">SNS発信</option>
                <option value="顧客フォロー">顧客フォロー</option>
                <option value="事務・広告">事務・広告</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-gray-700">期日</label>
              <input
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                className="w-full mt-1 p-2 border rounded-lg bg-white"
              />
            </div>
            <button type="submit" className="w-full py-2.5 bg-gray-900 text-white font-bold rounded-lg hover:bg-black transition">
              追加する
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900">タスク一覧</h2>
          <div className="space-y-2">
            {tasks.map((task) => (
              <div key={task.id} className="p-3.5 border rounded-xl flex items-center justify-between text-xs bg-white">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTaskCompletion(task.id)}
                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                  />
                  <div>
                    <p className={`font-bold text-gray-900 ${task.completed ? 'line-through text-gray-400' : ''}`}>
                      {task.title}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">期日: {task.dueDate}</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-blue-50 text-blue-700 font-bold rounded text-[10px]">{task.category}</span>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t space-y-4">
            <h2 className="text-lg font-bold text-gray-900">回数券の消化進捗</h2>
            <div className="space-y-4">
              {ticketProgress.map((tp) => {
                const rate = Math.round(((tp.total - tp.remaining) / tp.total) * 100);
                return (
                  <div key={tp.id} className="p-3 border rounded-xl bg-gray-50 space-y-2 text-xs">
                    <div className="flex justify-between font-bold">
                      <span className="text-gray-900">{tp.client} ({tp.ticketName})</span>
                      <span className="text-blue-600">残り {tp.remaining}回 / 全{tp.total}回</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${rate}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
