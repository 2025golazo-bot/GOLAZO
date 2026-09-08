'use client';

import { useState } from 'react';

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

export default function IntegratedApp() {
  // タブ切り替えステート ('transactions' | 'clients' | 'tasks')
  const [activeTab, setActiveTab] = useState<'transactions' | 'clients' | 'tasks'>('transactions');

  // 売上管理の状態
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

  // 回数券消化データ
  const [tickets] = useState<TicketProgress[]>([
    { id: '1', client: '鈴木 蓮', name: 'ジュニア体幹 4回券', total: 4, remaining: 1 },
    { id: '2', client: '山田 太郎', name: 'パーソナル 8回券', total: 8, remaining: 5 },
  ]);

  // 体験者トラッキング
  const [trials] = useState<TrialClient[]>([
    { id: '1', date: '2026-09-02', name: '高橋 一郎', age: 35, staff: 'TAKA', converted: true },
    { id: '2', date: '2026-09-06', name: '渡辺 美咲', age: 28, staff: 'NANA', converted: false },
  ]);

  // タスクデータの状態
  const [tasks, setTasks] = useState<TaskItem[]>([
    { id: '1', title: 'ジュニア体幹クリニックの告知Instagram投稿作成', category: 'SNS発信', dueDate: '2026-09-10', completed: false },
    { id: '2', title: '3ヶ月定期計測の対象者への連絡', category: '顧客フォロー', dueDate: '2026-09-12', completed: false },
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('SNS発信');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  // Square手動データ同期シミュレーション
  const handleSquareSync = () => {
    setIsSyncing(true);
    setSyncMessage('Squareから同期中...');
    setTimeout(() => {
      setIsSyncing(false);
      setSyncMessage('同期完了 (最新)');
    }, 1000);
  };

  // 集計計算 (月別・年度別)
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
          {/* 期間選択 & 目標設定バー */}
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

          {/* 指標カード群 */}
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

          {/* トランザクション & 分析 */}
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

          {/* 回数券消化 & 体験者管理 */}
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
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-xl font-black text-gray-900">顧客カルテ・写真管理</h2>
          <p className="text-xs text-gray-500">会員ごとのトレーニングカルテ、およびビフォーアフター写真の添付・管理を行います。</p>
          <div className="p-6 border-2 border-dashed rounded-xl bg-gray-50 text-center space-y-2">
            <p className="text-xs font-bold text-gray-600">顧客カルテの写真アップロード機能</p>
            <p className="text-[11px] text-gray-400">ここに写真ファイルをドラッグ＆ドロップ、または選択してアップロードできます。</p>
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
