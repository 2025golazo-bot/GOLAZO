'use client';

import React, { useState } from 'react';

// 近隣情報の型定義
interface NeighborInfo {
  id: string;
  targetArea: '板橋区' | '北区' | 'その他';
  schoolOrTeam: string;
  eventName: string;
  url: string;
  contactPerson: string;
  memo1: string;
  memo2: string;
  memo3: string;
}

export default function NeighborsPage() {
  const [neighbors, setNeighbors] = useState<NeighborInfo[]>([
    {
      id: '1',
      targetArea: '北区',
      schoolOrTeam: '〇〇中学校サッカー部',
      eventName: '区民大会 決勝戦応援',
      url: 'https://example.com/itabashi-soccer',
      contactPerson: '山田 先生',
      memo1: 'グラウンド使用時の注意事項あり',
      memo2: '次回大会の案内パンフレット受取済み',
      memo3: '夏期クリニックのチラシ配布に協力可能か要確認',
    },
    {
      id: '2',
      targetArea: '板橋区',
      schoolOrTeam: '××ミニバスケットボールクラブ',
      eventName: '夏休みスポーツ体験会',
      url: '',
      contactPerson: '鈴木 コーチ',
      memo1: '小学生の体幹トレーニングに興味あり',
      memo2: '連絡は基本的に夕方以降',
      memo3: '体験会へのトレーナー派遣について相談中',
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
    memo2: '',
    memo3: '',
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
      memo2: '',
      memo3: '',
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
          <p className="text-sm text-gray-600 mt-1">近くの学校やスポーツチームのイベント情報、担当者、メモを集約管理します。</p>
        </div>
      </div>

      {/* 検索・フィルターバー */}
      <div className="bg-white p-4 rounded-lg border shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <span className="text-sm font-semibold">🔍 キーワード検索:</span>
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
                  <div>👤 関係者担当者: <span className="font-medium text-gray-800">{item.contactPerson || '未設定'}</span></div>
                  <div>
                    🔗 詳細URL: {item.url ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                        リンクを開く ↗
                      </a>
                    ) : (
                      <span className="text-gray-400">未設定</span>
                    )}
                  </div>
                </div>

                {/* 3つのメモ欄 */}
                <div className="bg-gray-50 rounded p-3 space-y-1.5 text-xs text-gray-700 border">
                  <div className="font-semibold text-gray-500 mb-1">📝 メモ欄</div>
                  {item.memo1 && <div className="truncate">・{item.memo1}</div>}
                  {item.memo2 && <div className="truncate">・{item.memo2}</div>}
                  {item.memo3 && <div className="truncate">・{item.memo3}</div>}
                  {!item.memo1 && !item.memo2 && !item.memo3 && <div className="text-gray-400 italic">メモはありません</div>}
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
              <label className="block font-medium mb-1">詳細URL（外部リンク）</label>
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

            {/* 3つの独立したメモ欄 */}
            <div className="space-y-2 pt-2 border-t">
              <label className="block font-medium text-gray-700">📝 メモ欄 (3つ)</label>
              <input
                type="text"
                placeholder="メモ 1"
                value={form.memo1}
                onChange={(e) => setForm({ ...form, memo1: e.target.value })}
                className="w-full border rounded p-2 text-xs"
              />
              <input
                type="text"
                placeholder="メモ 2"
                value={form.memo2}
                onChange={(e) => setForm({ ...form, memo2: e.target.value })}
                className="w-full border rounded p-2 text-xs"
              />
              <input
                type="text"
                placeholder="メモ 3"
                value={form.memo3}
                onChange={(e) => setForm({ ...form, memo3: e.target.value })}
                className="w-full border rounded p-2 text-xs"
              />
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
