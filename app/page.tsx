'use client';

import { useState } from 'react';

// --- 型定義 ---
interface TaskItem {
  id: string;
  title: string;
  category: '議事録' | '週次タスク' | '月次タスク' | 'その他';
  repeatType: 'none' | 'weekly' | 'monthly';
  status: '未着手' | '進行中' | '完了';
  dueDate: string;
  assignee: string;
  content: string;
  createdAt: string;
}

export default function Home() {
  // 現在のタブ選択 ('task' | 'karte' | 'sales')
  const [activeTab, setActiveTab] = useState<'task' | 'karte' | 'sales'>('task');

  // --- タスク・議事録 State ---
  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: '1',
      title: '週次ミーティング議事録 ＆ 指導方針の確認',
      category: '議事録',
      repeatType: 'weekly',
      status: '完了',
      dueDate: '2026-09-07',
      assignee: '藤田',
      content: '・今週の体験者状況の共有\n・体幹プログラムのメニュー更新について確認',
      createdAt: '2026-09-07 10:00',
    },
    {
      id: '2',
      title: '月次売上チェック ＆ Squareデータ照合',
      category: '月次タスク',
      repeatType: 'monthly',
      status: '進行中',
      dueDate: '2026-09-30',
      assignee: '藤田',
      content: '今月の目標達成率の確認および回数券消化状況のチェック',
      createdAt: '2026-09-01 09:00',
    },
    {
      id: '3',
      title: '3ヶ月周期顧客計測アラート対象者のフォロー',
      category: '週次タスク',
      repeatType: 'weekly',
      status: '未着手',
      dueDate: '2026-09-14',
      assignee: '藤田',
      content: '姿勢・体組成計測から3ヶ月が経過した会員への日程調整連絡',
      createdAt: '2026-09-08 09:00',
    },
  ]);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'議事録' | '週次タスク' | '月次タスク' | 'その他'>('週次タスク');
  const [repeatType, setRepeatType] = useState<'none' | 'weekly' | 'monthly'>('weekly');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [assignee, setAssignee] = useState('藤田');
  const [content, setContent] = useState('');

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // テンプレート入力
  const handleApplyTemplate = (type: 'weekly_mtg' | 'monthly_sales' | 'measurement_check') => {
    const today = new Date().toISOString().split('T')[0];
    if (type === 'weekly_mtg') {
      setTitle('【週次】ミーティング議事録 ＆ セッション確認');
      setCategory('議事録');
      setRepeatType('weekly');
      setDueDate(today);
      setContent('【アジェンダ】\n1. 今週の予約・体験申込み状況\n2. 会員のトレーニング進捗・宿題確認\n3. 備品・機材メンテナンス');
    } else if (type === 'monthly_sales') {
      setTitle('【月次】集計 ＆ キャンペーン実績確認');
      setCategory('月次タスク');
      setRepeatType('monthly');
      setDueDate(today);
      setContent('1. 今月のSquare売上確認\n2. 回数券購入者・消化進捗一覧の確認\n3. 次月キャンペーンの準備');
    } else if (type === 'measurement_check') {
      setTitle('【週次】3ヶ月定期計測のアラート・予約フォロー');
      setCategory('週次タスク');
      setRepeatType('weekly');
      setDueDate(today);
      setContent('・前回の測定から3ヶ月経過した会員様の抽出\n・測定日時のお声がけとLINE連絡');
    }
  };

  // タスク新規登録
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert('タイトルを入力してください。');

    const newTask: TaskItem = {
      id: Date.now().toString(),
      title,
      category,
      repeatType,
      status: '未着手',
      dueDate,
      assignee,
      content,
      createdAt: new Date().toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setTasks([newTask, ...tasks]);
    setTitle('');
    setContent('');
    alert('タスク・議事録を登録しました！');
  };

  const handleStatusChange = (id: string, newStatus: '未着手' | '進行中' | '完了') => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, status: newStatus } : task)));
  };

  const handleDeleteTask = (id: string) => {
    if (confirm('このタスクを削除しますか？')) {
      setTasks(tasks.filter((t) => t.id !== id));
    }
  };

  const handleCompleteAndRenew = (task: TaskItem) => {
    const updatedTasks = tasks.map((t) => (t.id === task.id ? { ...t, status: '完了' as const } : t));

    if (task.repeatType !== 'none') {
      const nextDate = new Date(task.dueDate || new Date());
      if (task.repeatType === 'weekly') {
        nextDate.setDate(nextDate.getDate() + 7);
      } else if (task.repeatType === 'monthly') {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }

      const renewedTask: TaskItem = {
        ...task,
        id: Date.now().toString(),
        status: '未着手',
        dueDate: nextDate.toISOString().split('T')[0],
        createdAt: new Date().toLocaleString('ja-JP', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setTasks([renewedTask, ...updatedTasks]);
      alert(`タスクを完了にし、次回（${renewedTask.dueDate}）の繰り返しタスクを自動生成しました！`);
    } else {
      setTasks(updatedTasks);
    }
  };

  // 進捗率の計算
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.status === '完了').length;
  const inProgressCount = tasks.filter((t) => t.status === '進行中').length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredTasks = tasks.filter((t) => {
    const matchCategory = filterCategory === 'all' || t.category === filterCategory;
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchCategory && matchStatus;
  });

  return (
    <main className="p-6 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen">
      {/* 画面切り替えタブヘッダー */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-black text-gray-900">GOLAZO 統合管理システム</h1>

        <div className="flex bg-gray-100 p-1.5 rounded-xl text-xs font-bold gap-1">
          <button
            onClick={() => setActiveTab('task')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'task' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📋 タスク・議事録
          </button>
          <button
            onClick={() => setActiveTab('karte')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'karte' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            👤 顧客カルテ・計測
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'sales' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 売上管理
          </button>
        </div>
      </div>

      {/* --- TAB 1: タスク・議事録 --- */}
      {activeTab === 'task' && (
        <div className="space-y-8">
          {/* 進捗ダッシュボード */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-xs font-bold text-gray-500">全体進捗率</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-blue-600">{progressPercent}%</span>
                <span className="text-xs text-gray-400">({completedCount} / {totalCount} 件完了)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
                <div className="bg-blue-600 h-2.5 rounded-full transition-all" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-xs font-bold text-gray-500">未着手タスク</p>
              <p className="text-3xl font-black text-amber-500 mt-2">
                {tasks.filter((t) => t.status === '未着手').length} <span className="text-xs font-normal text-gray-400">件</span>
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-xs font-bold text-gray-500">進行中タスク</p>
              <p className="text-3xl font-black text-blue-500 mt-2">
                {inProgressCount} <span className="text-xs font-normal text-gray-400">件</span>
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-xs font-bold text-gray-500">完了済み</p>
              <p className="text-3xl font-black text-green-500 mt-2">
                {completedCount} <span className="text-xs font-normal text-gray-400">件</span>
              </p>
            </div>
          </div>

          {/* フォーム ＆ テンプレート */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">繰り返し業務のワンタップ作成（テンプレート）</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyTemplate('weekly_mtg')}
                  className="px-3.5 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 hover:bg-blue-100 transition"
                >
                  ＋ 【週次】ミーティング議事録
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyTemplate('monthly_sales')}
                  className="px-3.5 py-2 bg-purple-50 text-purple-700 text-xs font-bold rounded-xl border border-purple-200 hover:bg-purple-100 transition"
                >
                  ＋ 【月次】売上・集計タスク
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyTemplate('measurement_check')}
                  className="px-3.5 py-2 bg-amber-50 text-amber-700 text-xs font-bold rounded-xl border border-amber-200 hover:bg-amber-100 transition"
                >
                  ＋ 【週次】3ヶ月計測アラート確認
                </button>
              </div>
            </div>

            <form onSubmit={handleAddTask} className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
              <p className="text-xs font-bold text-gray-800">タスク・議事録の新規登録</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-gray-700">タイトル *</label>
                  <input
                    type="text"
                    placeholder="タスクまたは議事録の件名"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full mt-1 p-2.5 border rounded-lg bg-white font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-gray-700">カテゴリー</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full mt-1 p-2.5 border rounded-lg bg-white font-medium"
                    >
                      <option value="週次タスク">週次タスク</option>
                      <option value="月次タスク">月次タスク</option>
                      <option value="議事録">議事録</option>
                      <option value="その他">その他</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700">繰り返し設定</label>
                    <select
                      value={repeatType}
                      onChange={(e) => setRepeatType(e.target.value as any)}
                      className="w-full mt-1 p-2.5 border rounded-lg bg-white font-medium"
                    >
                      <option value="none">繰り返しなし</option>
                      <option value="weekly">毎週自動更新</option>
                      <option value="monthly">毎月自動更新</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700">実施日 / 期限</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full mt-1 p-2.5 border rounded-lg bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700">担当者</label>
                  <input
                    type="text"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    className="w-full mt-1 p-2.5 border rounded-lg bg-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700">詳細・メモ・議事録内容</label>
                <textarea
                  placeholder="メモや決定事項を入力"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full mt-1 p-2.5 border rounded-lg bg-white text-xs h-24"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gray-900 text-white font-bold text-xs rounded-xl hover:bg-black transition shadow-sm"
              >
                タスク・議事録を登録する
              </button>
            </form>
          </div>

          {/* タスク一覧 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
              <h2 className="text-lg font-bold text-gray-900">タスク・議事録 一覧 ({filteredTasks.length}件)</h2>

              <div className="flex items-center gap-3 text-xs">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="p-2 border rounded-lg bg-gray-50 font-medium"
                >
                  <option value="all">すべてのカテゴリー</option>
                  <option value="週次タスク">週次タスク</option>
                  <option value="月次タスク">月次タスク</option>
                  <option value="議事録">議事録</option>
                  <option value="その他">その他</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="p-2 border rounded-lg bg-gray-50 font-medium"
                >
                  <option value="all">すべてのステータス</option>
                  <option value="未着手">未着手</option>
                  <option value="進行中">進行中</option>
                  <option value="完了">完了</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {filteredTasks.length === 0 ? (
                <p className="text-xs text-gray-400 py-8 text-center">該当するタスク・議事録はありません。</p>
              ) : (
                filteredTasks.map((t) => (
                  <div
                    key={t.id}
                    className={`p-5 border rounded-xl space-y-3 transition ${
                      t.status === '完了' ? 'bg-gray-50/70 border-gray-200 opacity-75' : 'bg-white border-gray-200 shadow-sm'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-[10px] font-bold rounded-md">
                          {t.category}
                        </span>
                        {t.repeatType !== 'none' && (
                          <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-md border border-purple-200">
                            {t.repeatType === 'weekly' ? '🔄 毎週繰り返し' : '🔄 毎月繰り返し'}
                          </span>
                        )}
                        <h3 className={`font-bold text-sm ${t.status === '完了' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {t.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={t.status}
                          onChange={(e) => handleStatusChange(t.id, e.target.value as any)}
                          className={`text-xs font-bold p-1.5 rounded-lg border ${
                            t.status === '完了'
                              ? 'bg-green-100 text-green-800 border-green-300'
                              : t.status === '進行中'
                              ? 'bg-blue-100 text-blue-800 border-blue-300'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}
                        >
                          <option value="未着手">未着手</option>
                          <option value="進行中">進行中</option>
                          <option value="完了">完了</option>
                        </select>

                        {t.repeatType !== 'none' && t.status !== '完了' && (
                          <button
                            onClick={() => handleCompleteAndRenew(t)}
                            className="px-3 py-1.5 bg-green-600 text-white font-bold text-xs rounded-lg hover:bg-green-700 transition"
                          >
                            完了＆次回タスク作成
                          </button>
                        )}

                        <button onClick={() => handleDeleteTask(t.id)} className="p-1.5 text-gray-400 hover:text-red-600 text-xs">
                          削除
                        </button>
                      </div>
                    </div>

                    {t.content && (
                      <p className="text-xs text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border border-gray-100">
                        {t.content}
                      </p>
                    )}

                    <div className="flex justify-between items-center text-[11px] text-gray-400 pt-1">
                      <span>担当: {t.assignee || '未設定'} / 期限・実施日: {t.dueDate || 'なし'}</span>
                      <span>登録日: {t.createdAt}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: 顧客カルテ --- */}
      {activeTab === 'karte' && (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center space-y-3">
          <h2 className="text-xl font-bold text-gray-900">顧客カルテ ＆ 3ヶ月計測管理</h2>
          <p className="text-xs text-gray-500">Square顧客同期、姿勢・体組成計測、宿題写真付きカルテ画面が表示されます。</p>
        </div>
      )}

      {/* --- TAB 3: 売上管理 --- */}
      {activeTab === 'sales' && (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center space-y-3">
          <h2 className="text-xl font-bold text-gray-900">売上管理 ＆ Square同期ダッシュボード</h2>
          <p className="text-xs text-gray-500">Square連携の売上分析・月次比較が表示されます。</p>
        </div>
      )}
    </main>
  );
}
