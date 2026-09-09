'use client';

import React, { useState } from 'react';

// 近隣情報・イベント情報の型定義
interface NeighborItem {
  id: string;
  category: '近隣施設・店舗' | '地域イベント' | '提携・協業候補' | 'その他';
  name: string;
  addressOrLocation: string;
  contactPerson: string;
  phone: string;
  url: string;
  
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
}

export default function NeighborsPage() {
  const todayStr = '2026-09-09';

  const [neighbors, setNeighbors] = useState<NeighborItem[]>([
    {
      id: '1',
      category: '近隣施設・店舗',
      name: '赤羽スポーツカフェ',
      addressOrLocation: '北区赤羽1-x-x',
      contactPerson: '店長 鈴木様',
      phone: '03-1111-2222',
      url: 'https://example.com',
      memo1: 'チラシ設置の件でお話しに行く',
      memo1TaskEnabled: true,
      memo1Date: '2026-09-25',
      memo1Status: '未着手',
      memo1Important: true,
      memo1Alarm: true,
      memo2: '夏イベントで共同プロモーションの可能性あり',
      memo2TaskEnabled: false,
      memo2Date: todayStr,
      memo2Status: '未着手',
      memo2Important: false,
      memo2Alarm: false,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('すべて');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [form, setForm] = useState<Omit<NeighborItem, 'id'>>({
    category: '近隣施設・店舗',
    name: '',
    addressOrLocation: '',
    contactPerson: '',
    phone: '',
    url: '',
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
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;

    if (isEditing && selectedId) {
      setNeighbors(neighbors.map(n => n.id === selectedId ? { ...n, ...form } : n));
    } else {
      const newItem: NeighborItem = {
        id: Date.now().toString(),
        ...form,
      };
      setNeighbors([...neighbors, newItem]);
    }
    resetForm();
  };

  const handleEdit = (item: NeighborItem) => {
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
      category: '近隣施設・店舗',
      name: '',
      addressOrLocation: '',
      contactPerson: '',
      phone: '',
      url: '',
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
    });
  };

  const filteredNeighbors = neighbors.filter(item => {
    const matchesCat = selectedCategory === 'すべて' || item.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesQuery = (
      item.name.toLowerCase().includes(q) ||
      item.addressOrLocation.toLowerCase().includes(q) ||
      item.contactPerson.toLowerCase().includes(q) ||
      item.phone.toLowerCase().includes(q) ||
      item.memo1.toLowerCase().includes(q) ||
      item.memo2.toLowerCase().includes(q)
    );
    return matchesCat && matchesQuery;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans">
      {/* ヘッダータイトル：パーソナルジムGOLAZO */}
      <div className="mb-4">
        <h2 className="text-xl font-extrabold text-blue-900 tracking-wide">パーソナルジムGOLAZO</h2>
      </div>

      {/* ページ切り替えナビゲーション（追加・修正部分） */}
      <div className="flex flex-wrap gap-2 mb-6 bg-gray-100 p-3 rounded-lg border">
        <a href="/sales" className="px-3 py-1.5 bg-white border rounded text-sm font-medium hover:bg-gray-50">💰 売上管理</a>
        <a href="/customers" className="px-3 py-1.5 bg-white border rounded text-sm font-medium hover:bg-gray-50">👥 顧客リスト</a>
        <a href="/tasks" className="px-3 py-1.5 bg-white border rounded text-sm font-medium hover:bg-gray-50">📝 タスク・議事録</a>
        <a href="/neighbors" className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium">🏫 近隣情報</a>
        <a href="/vendors" className="px-3 py-1.5 bg-white border rounded text-sm font-medium hover:bg-gray-50">⚙️ マシン・業者一覧</a>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🏫 近隣情報・イベント管理</h1>
          <p className="text-sm text-gray-600 mt-1">ジム周辺の施設、店舗、地域イベント、提携候補先を管理し、タスクや営業活動に繋げます。</p>
        </div>
      </div>

      {/* 検索・フィルター */}
      <div className="bg-white p-4 rounded-lg border shadow-sm mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">カテゴリー:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="すべて">すべて</option>
            <option value="近隣施設・店舗">近隣施設・店舗</option>
            <option value="地域イベント">地域イベント</option>
            <option value="提携・協業候補">提携・協業候補</option>
            <option value="その他">その他</option>
          </select>
        </div>
        <div className="flex items-center gap-2 flex-1">
          <span className="text-sm font-semibold">🔍 キーワード:</span>
          <input
            type="text"
            placeholder="名称、場所、担当者、メモで検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border rounded px-3 py-2 text-sm flex-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左側：一覧表示 */}
        <div className="lg:col-span-2 space-y-4">
          {filteredNeighbors.length === 0 ? (
            <div className="bg-white border rounded-lg p-8 text-center text-gray-500 shadow-sm">
              該当する近隣情報はありません。
            </div>
          ) : (
            filteredNeighbors.map((item) => (
              <div key={item.id} className="bg-white border rounded-lg p-5 shadow-sm hover:shadow transition">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      {item.category}
                    </span>
                    <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
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

                <div className="text-sm text-gray-600 mb-3">
                  📍 場所・住所: <span className="font-medium text-gray-800">{item.addressOrLocation || '-'}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                  <div>👤 担当・関係者: <span className="font-medium text-gray-800">{item.contactPerson || '-'}</span></div>
                  <div>📞 電話番号: <span className="font-medium text-gray-800">{item.phone || '-'}</span></div>
                </div>

                {item.url && (
                  <div className="mb-4 text-sm">
                    🔗 URL: <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{item.url}</a>
                  </div>
                )}

                {/* メモ＆タスク連携表示 */}
                <div className="bg-gray-50 rounded p-3 space-y-2 text-xs text-gray-700 border">
                  <div className="font-semibold text-gray-500">📝 メモ ＆ タスク連携</div>
                  
                  {[
                    { text: item.memo1, enabled: item.memo1TaskEnabled, date: item.memo1Date, status: item.memo1Status, imp: item.memo1Important, alarm: item.memo1Alarm },
                    { text: item.memo2, enabled: item.memo2TaskEnabled, date: item.memo2Date, status: item.memo2Status, imp: item.memo2Important, alarm: item.memo2Alarm },
                  ].map((m, idx) => m.text ? (
                    <div key={idx} className="bg-white p-2 rounded border border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">・{m.text}</span>
                        {m.enabled && (
                          <span className="flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold border border-purple-200">
                            {m.imp && '⭐'} {m.alarm && '🔔'} タスク化 ({m.date} / {m.status})
                          </span>
                        )}
                      </div>
                    </div>
                  ) : null)}

                  {!item.memo1 && !item.memo2 && (
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
            {isEditing ? '✏️ 近隣情報の編集' : '＋ 新規情報の追加'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div>
              <label className="block font-medium mb-1">カテゴリー</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                className="w-full border rounded p-2"
              >
                <option value="近隣施設・店舗">近隣施設・店舗</option>
                <option value="地域イベント">地域イベント</option>
                <option value="提携・協業候補">提携・協業候補</option>
                <option value="その他">その他</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-1">名称 (施設名・イベント名等) <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                placeholder="例: 赤羽スポーツカフェ"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded p-2"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">場所・住所</label>
              <input
                type="text"
                placeholder="例: 北区赤羽1-x-x"
                value={form.addressOrLocation}
                onChange={(e) => setForm({ ...form, addressOrLocation: e.target.value })}
                className="w-full border rounded p-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-medium mb-1">担当・関係者</label>
                <input
                  type="text"
                  placeholder="例: 店長 鈴木様"
                  value={form.contactPerson}
                  onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">電話番号</label>
                <input
                  type="text"
                  placeholder="03-0000-0000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border rounded p-2"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1">URL</label>
              <input
                type="url"
                placeholder="https://..."
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                className="w-full border rounded p-2"
              />
            </div>

            {/* メモ欄 ＆ タスク手動登録連携 */}
            <div className="space-y-3 pt-3 border-t">
              <label className="block font-bold text-gray-800">📝 メモ欄 ＆ タスク手動登録 (2つ)</label>

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
                    id="n-m1Task"
                    checked={form.memo1TaskEnabled}
                    onChange={(e) => setForm({ ...form, memo1TaskEnabled: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <label htmlFor="n-m1Task" className="text-xs font-medium cursor-pointer text-blue-900">このメモをタスクに連携登録</label>
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
                    id="n-m2Task"
                    checked={form.memo2TaskEnabled}
                    onChange={(e) => setForm({ ...form, memo2TaskEnabled: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <label htmlFor="n-m2Task" className="text-xs font-medium cursor-pointer text-blue-900">このメモをタスクに連携登録</label>
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
