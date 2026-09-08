'use client';

import React, { useState } from 'react';

// タスクの型定義（タスク管理側と統一）
interface LinkedTask {
  id: string;
  title: string;
  category: 'Instagram' | '週例業務' | 'キャンペーン議事録' | 'その他' | '近隣情報連携';
  date: string;
  fiscalYear: number;
  month: number;
  status: '未着手' | '進行中' | '完了';
  dueDateAlarm: boolean;
  isImportant: boolean;
  memo: string;
}

// 近隣情報の型定義
interface NeighborInfo {
  id: string;
  targetArea: '板橋区' | '北区' | 'その他';
  schoolOrTeam: string;
  eventName: string;
  url: string;
  contactPerson: string;
  // 3つのメモ欄（それぞれにタスク化オプションを持たせる拡張）
  memo1: string;
  memo1TaskEnabled: boolean;
  memo1Date: string;
  memo1Status: '未着手' | '進行中' | '完了';
  memo1Important: boolean;
  memo1Alarm: boolean;

  memo2: string;
  memo2TaskEnabled: boolean;
  memo2Date: string;
  memo2Status: '未着手' | '進行中' | '完了';
  memo2Important: boolean;
  memo2Alarm: boolean;

  memo3: string;
  memo3TaskEnabled: boolean;
  memo3Date: string;
  memo3Status: '未着手' | '進行中' | '完了';
  memo3Important: boolean;
  memo3Alarm: boolean;
}

export default function NeighborsPage() {
  const todayStr = '2026-09-08';

  const [neighbors, setNeighbors] = useState<NeighborInfo[]>([
    {
      id: '1',
      targetArea: '北区',
      schoolOrTeam: '〇〇中学校サッカー部',
      eventName: '区民大会 決勝戦応援',
      url: 'https://example.com/itabashi-soccer',
      contactPerson: '山田 先生',
      memo1: 'グラウンド使用時の注意事項あり',
      memo1TaskEnabled: true,
      memo1Date: '2026-09-15',
      memo1Status: '未着手',
      memo1Important: true,
      memo1Alarm: true,
      memo2: '次回大会の案内パンフレット受取済み',
      memo2TaskEnabled: false,
      memo2Date: todayStr,
      memo2Status: '未着手',
      memo2Important: false,
      memo2Alarm: false,
      memo3: '',
      memo3TaskEnabled: false,
      memo3Date: todayStr,
      memo3Status: '未着手',
      memo3Important: false,
      memo3Alarm: false,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<string>('すべて');

  // フォーム状態
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<NeighborInfo, 'id'>>({
    targetArea: '北区',
    schoolOrTeam: '',
    eventName: '',
    url: '',
    contactPerson: '',
    memo1: '',
    memo1TaskEnabled: false,
    memo1Date: todayStr,
    memo1Status: '未着手',
    memo1Important: false,
    memo1Alarm: false,
    memo2: '',
    memo2TaskEnabled: false,
    memo2Date: todayStr,
    memo2Status: '未着手',
    memo2Important: false,
    memo2Alarm: false,
    memo3: '',
    memo3TaskEnabled: false,
    memo3Date: todayStr,
    memo3Status: '未着手',
    memo3Important: false,
    memo3Alarm: false,
  });

  // 保存・追加処理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.schoolOrTeam || !form.eventName) return;

    if (isEditing && selectedId) {
      setNeighbors(neighbors.map(n => n.id === selectedId ? { ...n, ...form } : n));
    } else {
      const newItem: NeighborInfo = {
        id: Date.now().toString(),
        ...form,
      };
      setNeighbors([...neighbors, newItem]);
    }
    resetForm();
  };

  const handleEdit = (item: NeighborInfo) => {
    setSelectedId(item.id);
    setForm(item);
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('この近隣情報を削除してもよろしいですか？')) {
      setNeighbors(neighbors.filter(n => n.id !== id));
      if (selectedId === id) resetForm();
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setSelectedId(null);
    setForm({
      targetArea: '北区',
      schoolOrTeam: '',
      eventName: '',
      url: '',
      contactPerson: '',
      memo1: '',
      memo1TaskEnabled: false,
      memo1Date: todayStr,
      memo1Status: '未着手',
      memo1Important: false,
      memo1Alarm: false,
      memo2: '',
      memo2TaskEnabled: false,
      memo2Date: todayStr,
      memo2Status: '未着手',
      memo2Important: false,
      memo2Alarm: false,
      memo3: '',
      memo3TaskEnabled: false,
      memo3Date: todayStr,
      memo3Status: '未着手',
      memo3Important: false,
      memo3Alarm: false,
    });
  };

  // フィルタリング＆検索
  const filteredNeighbors = neighbors.filter(item => {
    const matchesArea = selectedAreaFilter === 'すべて' || item.targetArea === selectedAreaFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      item.schoolOrTeam.toLowerCase().includes(query) ||
      item.eventName.toLowerCase().includes(query) ||
      item.contactPerson.toLowerCase().includes(query) ||
      item.memo1.toLowerCase().includes(query) ||
      item.memo2.toLowerCase().includes(query) ||
      item.memo3.toLowerCase().includes(query);

    return matchesArea && matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🏫 近隣情報・イベント管理</h1>
          <p className="text-sm text-gray-600 mt-1">学校やスポーツチームのイベント情報、担当者メモ、タスク連携を一元管理します。</p>
        </div>
      </div>

      {/* 検索・フィルターバー */}
      <div className="bg-white p-4 rounded-lg border shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <span className="text-sm font-semibold">🔍 検索:</span>
          <input
            type="text"
            placeholder="学校名、チーム名、イベント、担当者、メモで検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border rounded px-3 py-2 text-sm flex-1"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold">📍 対象区:</span>
          {['すべて', '板橋区', '北区', 'その他'].map((area) => (
            <button
              key={area}
              onClick={() => setSelectedAreaFilter(area)}
              className={`px-3 py-1.5 rounded text-sm font-medium ${
                selectedAreaFilter === area ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左側：一覧表示エリア */}
        <div className="lg:col-span-2 space-y-4">
          {filteredNeighbors.length === 0 ? (
            <div className="bg-white border rounded-lg p-8 text-center text-gray-500 shadow-sm">
              該当する近隣情報はありません。
            </div>
          ) : (
            filteredNeighbors.map((item) => (
              <div key={item.id} className="bg-white border rounded-lg p-5 shadow-sm hover:shadow transition">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                      item.targetArea === '板橋区' ? 'bg-emerald-100 text-emerald-800' :
                      item.targetArea === '北区' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.targetArea}
                    </span>
                    <h3 className="font-bold text-lg text-gray-900">{item.schoolOrTeam}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded hover:bg-gray-200 font-medium"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded hover:bg-red-100 font-medium"
                    >
                      削除
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm font-medium text-blue-900 bg-blue-50 px-3 py-1.5 rounded inline-block">
                    📅 イベント: {item.eventName}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                  <div>👤 担当者: <span className="font-medium text-gray-800">{item.contactPerson || '未設定'}</span></div>
                  <div>
                    🔗 URL: {item.url ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                        リンクを開く ↗
                      </a>
                    ) : (
                      <span className="text-gray-400">未設定</span>
                    )}
                  </div>
                </div>

                {/* 3つのメモ欄 ＆ タスク連携表示 */}
                <div className="bg-gray-50 rounded p-3 space-y-2.5 text-xs text-gray-700 border">
                  <div className="font-semibold text-gray-500">📝 メモ ＆ タスク連動内容</div>
                  
                  {[
                    { text: item.memo1, enabled: item.memo1TaskEnabled, date: item.memo1Date, status: item.memo1Status, imp: item.memo1Important, alarm: item.memo1Alarm },
                    { text: item.memo2, enabled: item.memo2TaskEnabled, date: item.memo2Date, status: item.memo2Status, imp: item.memo2Important, alarm: item.memo2Alarm },
                    { text: item.memo3, enabled: item.memo3TaskEnabled, date: item.memo3Date, status: item.memo3Status, imp: item.memo3Important, alarm: item.memo3Alarm },
                  ].map((m, idx) => m.text ? (
                    <div key={idx} className="bg-white p-2 rounded border border-gray-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">・{m.text}</span>
                        {m.enabled && (
                          <span className="flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold border border-purple-200">
                            {m.imp && '⭐'} {m.alarm && '🔔'} タスク化 ({m.date} / {m.status})
                          </span>
                        )}
                      </div>
                    </div>
                  ) : null)}

                  {!item.memo1 && !item.memo2 && !item.memo3 && (
                    <div className="text-gray-400 italic">メモはありません</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* 右側：登録・編集フォーム */}
        <div className="bg-white border rounded-lg p-5 shadow-sm h-fit">
          <h2 className="font-bold text-lg mb-4 text-gray-900">
            {isEditing ? '✏️ 近隣情報の編集' : '＋ 新規近隣情報の追加'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div>
              <label className="block font-medium mb-1">対象区</label>
              <select
                value={form.targetArea}
                onChange={(e) => setForm({ ...form, targetArea: e.target.value as NeighborInfo['targetArea'] })}
                className="w-full border rounded p-2 bg-white"
              >
                <option value="板橋区">板橋区</option>
                <option value="北区">北区</option>
                <option value="その他">その他</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-1">学校・チーム名 <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                placeholder="例: 〇〇中学校サッカー部"
                value={form.schoolOrTeam}
                onChange={(e) => setForm({ ...form, schoolOrTeam: e.target.value })}
                className="w-full border rounded p-2"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">イベント名 <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                placeholder="例: 区民大会 決勝戦"
                value={form.eventName}
                onChange={(e) => setForm({ ...form, eventName: e.target.value })}
                className="w-full border rounded p-2"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">詳細URL</label>
              <input
                type="url"
                placeholder="https://..."
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                className="w-full border rounded p-2"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">関係者の担当者名</label>
              <input
                type="text"
                placeholder="例: 山田 先生"
                value={form.contactPerson}
                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                className="w-full border rounded p-2"
              />
            </div>

            {/* --- 3つのメモ欄 ＆ タスク登録連携機能 --- */}
            <div className="space-y-4 pt-3 border-t">
              <label className="block font-bold text-gray-800">📝 メモ欄 ＆ タスク手動登録 (3つ)</label>

              {/* メモ1 */}
              <div className="bg-gray-50 p-3 rounded border space-y-2">
                <input
                  type="text"
                  placeholder="メモ 1 の内容"
                  value={form.memo1}
                  onChange={(e) => setForm({ ...form, memo1: e.target.value })}
                  className="w-full border rounded p-2 text-xs bg-white"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="m1Task"
                    checked={form.memo1TaskEnabled}
                    onChange={(e) => setForm({ ...form, memo1TaskEnabled: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <label htmlFor="m1Task" className="text-xs font-medium cursor-pointer text-blue-900">このメモをタスク一覧に連携登録する</label>
                </div>
                {form.memo1TaskEnabled && (
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <input
                      type="date"
                      value={form.memo1Date}
                      onChange={(e) => setForm({ ...form, memo1Date: e.target.value })}
                      className="border rounded p-1.5 bg-white"
                    />
                    <select
                      value={form.memo1Status}
                      onChange={(e) => setForm({ ...form, memo1Status: e.target.value as any })}
                      className="border rounded p-1.5 bg-white"
                    >
                      <option value="未着手">未着手</option>
                      <option value="進行中">進行中</option>
                      <option value="完了">完了</option>
                    </select>
                    <div className="flex items-center gap-2 col-span-2 pt-1">
                      <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={form.memo1Important} onChange={(e) => setForm({ ...form, memo1Important: e.target.checked })} /> ⭐ 重要</label>
                      <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={form.memo1Alarm} onChange={(e) => setForm({ ...form, memo1Alarm: e.target.checked })} /> 🔔 期日アラーム</label>
                    </div>
                  </div>
                )}
              </div>

              {/* メモ2 */}
              <div className="bg-gray-50 p-3 rounded border space-y-2">
                <input
                  type="text"
                  placeholder="メモ 2 の内容"
                  value={form.memo2}
                  onChange={(e) => setForm({ ...form, memo2: e.target.value })}
                  className="w-full border rounded p-2 text-xs bg-white"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="m2Task"
                    checked={form.memo2TaskEnabled}
                    onChange={(e) => setForm({ ...form, memo2TaskEnabled: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <label htmlFor="m2Task" className="text-xs font-medium cursor-pointer text-blue-900">このメモをタスク一覧に連携登録する</label>
                </div>
                {form.memo2TaskEnabled && (
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <input
                      type="date"
                      value={form.memo2Date}
                      onChange={(e) => setForm({ ...form, memo2Date: e.target.value })}
                      className="border rounded p-1.5 bg-white"
                    />
                    <select
                      value={form.memo2Status}
                      onChange={(e) => setForm({ ...form, memo2Status: e.target.value as any })}
                      className="border rounded p-1.5 bg-white"
                    >
                      <option value="未着手">未着手</option>
                      <option value="進行中">進行中</option>
                      <option value="完了">完了</option>
                    </select>
                    <div className="flex items-center gap-2 col-span-2 pt-1">
                      <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={form.memo2Important} onChange={(e) => setForm({ ...form, memo2Important: e.target.checked })} /> ⭐ 重要</label>
                      <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={form.memo2Alarm} onChange={(e) => setForm({ ...form, memo2Alarm: e.target.checked })} /> 🔔 期日アラーム</label>
                    </div>
                  </div>
                )}
              </div>

              {/* メモ3 */}
              <div className="bg-gray-50 p-3 rounded border space-y-2">
                <input
                  type="text"
                  placeholder="メモ 3 の内容"
                  value={form.memo3}
                  onChange={(e) => setForm({ ...form, memo3: e.target.value })}
                  className="w-full border rounded p-2 text-xs bg-white"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="m3Task"
                    checked={form.memo3TaskEnabled}
                    onChange={(e) => setForm({ ...form, memo3TaskEnabled: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <label htmlFor="m3Task" className="text-xs font-medium cursor-pointer text-blue-900">このメモをタスク一覧に連携登録する</label>
                </div>
                {form.memo3TaskEnabled && (
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <input
                      type="date"
                      value={form.memo3Date}
                      onChange={(e) => setForm({ ...form, memo3Date: e.target.value })}
                      className="border rounded p-1.5 bg-white"
                    />
                    <select
                      value={form.memo3Status}
                      onChange={(e) => setForm({ ...form, memo3Status: e.target.value as any })}
                      className="border rounded p-1.5 bg-white"
                    >
                      <option value="未着手">未着手</option>
                      <option value="進行中">進行中</option>
                      <option value="完了">完了</option>
                    </select>
                    <div className="flex items-center gap-2 col-span-2 pt-1">
                      <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={form.memo3Important} onChange={(e) => setForm({ ...form, memo3Important: e.target.checked })} /> ⭐ 重要</label>
                      <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={form.memo3Alarm} onChange={(e) => setForm({ ...form, memo3Alarm: e.target.checked })} /> 🔔 期日アラーム</label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 transition"
              >
                {isEditing ? '変更を保存する' : '登録する'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-2 border rounded text-gray-600 hover:bg-gray-100"
                >
                  取消
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
