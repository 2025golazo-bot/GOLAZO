'use client';

import React, { useState } from 'react';

// タスクの型定義
interface Task {
  id: string;
  title: string;
  category: 'Instagram' | '週例業務' | 'キャンペーン議事録' | 'その他';
  date: string; // YYYY-MM-DD
  fiscalYear: number; // 年度 (例: 2026)
  month: number; // 月度 (1-12)
  status: '未着手' | '進行中' | '完了';
  dueDateAlarm: boolean; // 期日アラーム設定 (🔔)
  isImportant: boolean;  // 重要フラグ設定 (⭐)
  memo: string; // メモ欄
}

export default function TasksPage() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  // 状態管理
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  
  // 初期サンプルデータ
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

  // タブ切り替え ('list' | 'calendar' | 'minutes')
  const [activeTab, setActiveTab] = useState<'list' | 'calendar' | 'minutes'>('list');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  // フォーム状態
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

  // キャンペーン議事録の固定（プリセット）選択肢
  const presetCampaignOptions = [
    'キックオフミーティング決定事項',
    'SNS広告運用方針のすり合わせ',
    '夏期クリニック振り返り議事録',
  ];

  // 年度・月度でフィルタリングしたタスク
  const filteredTasks = tasks.filter(
    (task) => task.fiscalYear === selectedFiscalYear && task.month === selectedMonth
  );

  // キャンペーン議事録の未完了タスク（全期間・または選択月など。全期間でチェック）
  const uncompletedCampaignTasks = tasks.filter(
    (task) => task.category === 'キャンペーン議事録' && task.status !== '完了'
  );

  // タスク保存・更新処理
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

  // カレンダーや他タブから該当タスクを選択して詳細・編集へ移行
  const handleSelectTask = (task: Task) => {
    setSelectedTaskId(task.id);
    setEditForm(task);
    setIsEditing(true);
    setActiveTab('list'); // 編集は一覧（メイン）タブで行う
  };

  return (
    <div className="p-6 max-w-6xl mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-4">GOLAZO 業務タスク管理</h1>

      {/* 画面上部：キャンペーン議事録の未完了アラームバナー */}
      {uncompletedCampaignTasks.length > 0 && (
        <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 mb-6 rounded shadow-sm flex items-center justify-between">
          <div>
            <p className="font-bold">⚠️ キャンペーン議事録の未完了タスクがあります</p>
            <p className="text-sm">未完了の議事録関連タスクが {uncompletedCampaignTasks.length} 件残っています。</p>
          </div>
          <button 
            onClick={() => setActiveTab('minutes')}
            className="bg-amber-600 text-white px-3 py-1.5 rounded text-xs hover:bg-amber-700 font-medium"
          >
            議事録ページで確認
          </button>
        </div>
      )}

      {/* コントロールパネル (年度・月度選択 & タブ切り替え) */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-gray-50 p-4 rounded-lg border">
        <div className="flex items-center gap-3">
          <label className="font-semibold text-sm">📅 表示選択:</label>
          <select 
            value={selectedFiscalYear} 
            onChange={(e) => setSelectedFiscalYear(Number(e.target.value))}
            className="border rounded px-3 py-1.5 bg-white text-sm"
          >
            {[2024, 2025, 2026, 2027, 2028].map((year) => (
              <option key={year} value={year}>{year}年度</option>
            ))}
          </select>

          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="border rounded px-3 py-1.5 bg-white text-sm"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>{m}月度</option>
            ))}
          </select>
        </div>

        {/* タブ切り替え（一覧・カレンダー・議事録専用ページ） */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded text-sm font-medium ${activeTab === 'list' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-700'}`}
          >
            タスク一覧・編集
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 rounded text-sm font-medium ${activeTab === 'calendar' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-700'}`}
          >
            カレンダー表示
          </button>
          <button
            onClick={() => setActiveTab('minutes')}
            className={`px-4 py-2 rounded text-sm font-medium relative ${activeTab === 'minutes' ? 'bg-purple-600 text-white' : 'bg-white border text-gray-700'}`}
          >
            📝 キャンペーン議事録
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
          <div className="md:col-span-2 bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">{selectedFiscalYear}年度 {selectedMonth}月度 タスク一覧</h2>
              <button 
                onClick={resetForm}
                className="text-sm bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700"
              >
                + 新規タスク追加
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="p-2.5">日付</th>
                    <th className="p-2.5">カテゴリ</th>
                    <th className="p-2.5">タスク名</th>
                    <th className="p-2.5">ステータス</th>
                    <th className="p-2.5">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-gray-500">該当するタスクはありません。</td>
                    </tr>
                  ) : (
                    filteredTasks.map((task) => (
                      <tr key={task.id} className="border-b hover:bg-gray-50">
                        <td className="p-2.5">{task.date}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            task.category === 'キャンペーン議事録' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {task.category}
                          </span>
                        </td>
                        <td className="p-2.5 font-medium flex items-center gap-1.5">
                          {task.isImportant && <span className="text-red-500" title="重要">⭐</span>}
                          {task.title}
                          {task.dueDateAlarm && <span className="text-blue-500 text-xs" title="期日アラーム">🔔</span>}
                        </td>
                        <td className="p-2.5">
                          <span className={`px-2 py-1 rounded text-xs ${
                            task.status === '完了' ? 'bg-green-100 text-green-800' : 
                            task.status === '進行中' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <button
                            onClick={() => handleSelectTask(task)}
                            className="text-blue-600 hover:underline"
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
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <h2 className="font-bold text-lg mb-4">{isEditing ? 'タスク詳細・編集' : '新規タスク登録'}</h2>
            <form onSubmit={handleSaveTask} className="space-y-4 text-sm">
              <div>
                <label className="block font-medium mb-1">カテゴリ</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value as Task['category'] })}
                  className="w-full border rounded p-2 bg-white"
                >
                  <option value="Instagram">Instagram</option>
                  <option value="週例業務">週例業務</option>
                  <option value="キャンペーン議事録">キャンペーン議事録</option>
                  <option value="その他">その他</option>
                </select>
              </div>

              {/* キャンペーン議事録の場合：固定（プリセット）選択肢 ＋ 手動入力の両立 */}
              {editForm.category === 'キャンペーン議事録' && (
                <div>
                  <label className="block font-medium mb-1">議事録タスク（固定選択 or 手動入力）</label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        setEditForm({ ...editForm, title: e.target.value });
                      }
                    }}
                    className="w-full border rounded p-2 bg-white mb-2 text-xs"
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
                    className="w-full border rounded p-2"
                  />
                </div>
              )}

              {editForm.category !== 'キャンペーン議事録' && (
                <div>
                  <label className="block font-medium mb-1">タスク名</label>
                  <input
                    type="text"
                    required
                    value={editForm.title || ''}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full border rounded p-2"
                    placeholder="例: ストーリー投稿"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium mb-1">日付</label>
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
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">ステータス</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Task['status'] })}
                    className="w-full border rounded p-2 bg-white"
                  >
                    <option value="未着手">未着手</option>
                    <option value="進行中">進行中</option>
                    <option value="完了">完了</option>
                  </select>
                </div>
              </div>

              {/* 重要アラーム ＆ 期日アラーム設定 */}
              <div className="space-y-2 py-2 border-t border-b">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="importantCheck"
                    checked={editForm.isImportant || false}
                    onChange={(e) => setEditForm({ ...editForm, isImportant: e.target.checked })}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <label htmlFor="importantCheck" className="font-medium cursor-pointer text-red-600">⭐ 重要タスクに設定（重要アラーム）</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="alarmCheck"
                    checked={editForm.dueDateAlarm || false}
                    onChange={(e) => setEditForm({ ...editForm, dueDateAlarm: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="alarmCheck" className="font-medium cursor-pointer">🔔 期日アラームを設定</label>
                </div>
              </div>

              {/* メモ欄 */}
              <div>
                <label className="block font-medium mb-1">メモ欄</label>
                <textarea
                  value={editForm.memo || ''}
                  onChange={(e) => setEditForm({ ...editForm, memo: e.target.value })}
                  className="w-full border rounded p-2 h-20"
                  placeholder="詳細や特記事項を記入..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700"
                >
                  {isEditing ? '変更を保存' : '追加する'}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-3 py-2 border rounded text-gray-600 hover:bg-gray-100"
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
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="font-bold text-lg mb-2">{selectedFiscalYear}年度 {selectedMonth}月度 カレンダー</h2>
          <p className="text-sm text-gray-500 mb-4">カレンダー内のタスクをクリックすると、該当タスクの詳細・編集画面に移行します。</p>
          
          <div className="grid grid-cols-7 gap-2">
            {['日', '月', '火', '水', '木', '金', '土'].map((day, idx) => (
              <div key={idx} className="text-center font-bold text-sm bg-gray-100 py-2 rounded">{day}</div>
            ))}
            {Array.from({ length: 31 }, (_, i) => {
              const dayNum = i + 1;
              const dateStr = `${selectedFiscalYear}-${String(selectedMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayTasks = filteredTasks.filter(t => t.date === dateStr);

              return (
                <div key={i} className="min-h-[100px] border rounded p-1.5 flex flex-col bg-white overflow-hidden">
                  <span className="text-xs font-semibold text-gray-600 mb-1">{dayNum}</span>
                  <div className="flex flex-col gap-1 overflow-y-auto">
                    {dayTasks.map(task => (
                      <button
                        key={task.id}
                        onClick={() => handleSelectTask(task)}
                        className={`text-left text-xs p-1 rounded truncate transition hover:opacity-80 ${
                          task.category === 'キャンペーン議事録' ? 'bg-purple-100 text-purple-900 border border-purple-300' : 'bg-blue-50 text-blue-900 border border-blue-200'
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

      {/* --- タブ3: キャンペーン議事録（専用ページ） --- */}
      {activeTab === 'minutes' && (
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="font-bold text-xl text-purple-900">📝 キャンペーン議事録 専用ページ</h2>
              <p className="text-sm text-gray-600 mt-1">キャンペーン議事録に関するタスクの確認・管理を行います。未完了タスクがある場合は専用のアラームが表示されます。</p>
            </div>
            <button 
              onClick={() => {
                resetForm();
                setEditForm(prev => ({ ...prev, category: 'キャンペーン議事録' }));
                setActiveTab('list');
              }}
              className="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700 font-medium"
            >
              + 議事録タスクを追加する
            </button>
          </div>

          {/* 議事録ページ内での未完了アラーム通知 */}
          {uncompletedCampaignTasks.length > 0 ? (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6 flex items-center justify-between">
              <div>
                <p className="font-bold">🚨 議事録タスク未完了アラーム</p>
                <p className="text-sm">対応が必要な未完了の議事録タスクが <strong>{uncompletedCampaignTasks.length}件</strong> 残っています。</p>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg mb-6">
              <p className="font-bold">✨ すべてのキャンペーン議事録タスクが完了しています！</p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-purple-50 border-b">
                  <th className="p-3">日付</th>
                  <th className="p-3">タスク名（固定選択 or 手動入力）</th>
                  <th className="p-3">ステータス</th>
                  <th className="p-3">メモ</th>
                  <th className="p-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {tasks.filter(t => t.category === 'キャンペーン議事録').length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">キャンペーン議事録のタスクは登録されていません。</td>
                  </tr>
                ) : (
                  tasks.filter(t => t.category === 'キャンペーン議事録').map(task => (
                    <tr key={task.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{task.date}</td>
                      <td className="p-3 font-medium flex items-center gap-1.5">
                        {task.isImportant && <span className="text-red-500" title="重要">⭐</span>}
                        {task.dueDateAlarm && <span className="text-blue-500 text-xs" title="期日アラーム">🔔</span>}
                        {task.title}
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded text-xs font-medium ${
                          task.status === '完了' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="p-3 text-gray-600 truncate max-w-xs">{task.memo || '-'}</td>
                      <td className="p-3">
                        <button 
                          onClick={() => handleSelectTask(task)} 
                          className="text-blue-600 hover:underline font-medium"
                        >
                          詳細・編集
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
