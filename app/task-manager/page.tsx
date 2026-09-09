// app/task-manager/page.tsx
'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';

type TaskItem = {
  id: number;
  title: string;
  category: 'タスク' | '議事録' | 'アイデア';
  priority: '高' | '中' | '低';
  dueDate: string;
  completed: boolean;
  content: string;
};

export default function TaskManagerPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: 1,
      title: 'ゴラッソトレーニングクリニックの集客企画',
      category: 'アイデア',
      priority: '高',
      dueDate: '2026-09-20',
      completed: false,
      content: 'SNS広告のクリエイティブ修正とチラシ配布のスケジュール調整。',
    },
    {
      id: 2,
      title: '9月度ミーティング議事録',
      category: '議事録',
      priority: '中',
      dueDate: '2026-09-05',
      completed: true,
      content: '新規クライアント獲得目標50名に向けた広告・SNS投稿の自動化について確認。',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newTask, setNewTask] = useState({
    title: '',
    category: 'タスク' as const,
    priority: '中' as const,
    dueDate: new Date().toISOString().split('T')[0],
    content: '',
  });

  const filteredTasks = tasks.filter((item) => {
    const matchesSearch = item.title.includes(searchTerm) || item.content.includes(searchTerm);
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleComplete = (id: number) => {
    setTasks(
      tasks.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;

    const taskToAdd: TaskItem = {
      id: Date.now(),
      title: newTask.title,
      category: newTask.category,
      priority: newTask.priority,
      dueDate: newTask.dueDate,
      completed: false,
      content: newTask.content,
    };

    setTasks([taskToAdd, ...tasks]);
    setNewTask({
      title: '',
      category: 'タスク',
      priority: '中',
      dueDate: new Date().toISOString().split('T')[0],
      content: '',
    });
    setIsModalOpen(false);
  };

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 font-sans pb-12">
      <Header />

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span>📝</span> タスク・議事録管理
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              ジムの運営タスク、ミーティング議事録、アイデアを管理します。
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#5e9bc4] hover:bg-[#4d85ab] text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm flex items-center gap-2"
          >
            <span>＋</span> 新規作成
          </button>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="w-full md:w-96">
            <input
              type="text"
              placeholder="タイトルや内容で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]/50"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterCategory === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              すべて
            </button>
            <button
              onClick={() => setFilterCategory('タスク')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterCategory === 'タスク' ? 'bg-[#5e9bc4] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              タスク
            </button>
            <button
              onClick={() => setFilterCategory('議事録')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterCategory === '議事録' ? 'bg-[#5e9bc4] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              議事録
            </button>
            <button
              onClick={() => setFilterCategory('アイデア')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterCategory === 'アイデア' ? 'bg-[#5e9bc4] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              アイデア
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((item) => (
              <div
                key={item.id}
                className={`bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition ${
                  item.completed ? 'opacity-60 bg-slate-50' : ''
                }`}
              >
                <div className="flex items-start gap-3 w-full">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleComplete(item.id)}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-[#5e9bc4] focus:ring-[#5e9bc4]"
                  />
                  <div className="space-y-1 w-full">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600">
                        {item.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          item.priority === '高'
                            ? 'bg-rose-100 text-rose-700'
                            : item.priority === '中'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        優先度: {item.priority}
                      </span>
                      <span className="text-xs text-slate-400">期日: {item.dueDate}</span>
                    </div>
                    <h3 className={`font-bold text-slate-800 ${item.completed ? 'line-through text-slate-400' : ''}`}>
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 whitespace-pre-wrap bg-slate-50 p-2.5 rounded-xl">
                      {item.content || '詳細なし'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-200">
              該当するタスク・議事録が見つかりませんでした。
            </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-800">新規タスク・議事録の追加</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">タイトル *</label>
                <input
                  type="text"
                  required
                  placeholder="タイトルを入力..."
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">種別</label>
                  <select
                    value={newTask.category}
                    onChange={(e: any) => setNewTask({ ...newTask, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                  >
                    <option value="タスク">タスク</option>
                    <option value="議事録">議事録</option>
                    <option value="アイデア">アイデア</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">優先度</label>
                  <select
                    value={newTask.priority}
                    onChange={(e: any) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                  >
                    <option value="高">高</option>
                    <option value="中">中</option>
                    <option value="低">低</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">期日</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">詳細・内容</label>
                <textarea
                  rows={3}
                  placeholder="詳細な内容や議事録本文..."
                  value={newTask.content}
                  onChange={(e) => setNewTask({ ...newTask, content: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-semibold"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#5e9bc4] hover:bg-[#4d85ab] text-white rounded-xl text-sm font-semibold"
                >
                  追加する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
