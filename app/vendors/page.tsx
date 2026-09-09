'use client';

import React, { useState } from 'react';

// マシン・業者情報の型定義
interface VendorItem {
  id: string;
  name: string;
  usageDetails: string;
  contactPerson: string;
  url: string;
  email: string;
  phone: string;
  businessCard1: string;
  businessCard2: string;
  
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

export default function VendorsPage() {
  const todayStr = '2026-09-09';

  const [vendors, setVendors] = useState<VendorItem[]>([
    {
      id: '1',
      name: 'BOSU バランストレーナー公式',
      usageDetails: '体幹トレーニングおよびファンクショナルエリアで使用',
      contactPerson: '佐藤 担当',
      url: 'https://example.com/bosu',
      email: 'support@example.com',
      phone: '03-0000-0000',
      businessCard1: '',
      businessCard2: '',
      memo1: 'メンテナンス時期について来月確認する',
      memo1TaskEnabled: true,
      memo1Date: '2026-09-20',
      memo1Status: '未着手',
      memo1Important: true,
      memo1Alarm: true,
      memo2: '予備パーツのカタログ受取済み',
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
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [form, setForm] = useState<Omit<VendorItem, 'id'>>({
    name: '',
    usageDetails: '',
    contactPerson: '',
    url: '',
    email: '',
    phone: '',
    businessCard1: '',
    businessCard2: '',
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, cardKey: 'businessCard1' | 'businessCard2') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, [cardKey]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;

    if (isEditing && selectedId) {
      setVendors(vendors.map(v => v.id === selectedId ? { ...v, ...form } : v));
    } else {
      const newItem: VendorItem = {
        id: Date.now().toString(),
        ...form,
      };
      setVendors([...vendors, newItem]);
    }
    resetForm();
  };

  const handleEdit = (item: VendorItem) => {
    setSelectedId(item.id);
    setForm(item);
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('このマシン・業者情報を削除してもよろしいですか？')) {
      setVendors(vendors.filter(v => v.id !== id));
      if (selectedId === id) resetForm();
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setSelectedId(null);
    setForm({
      name: '',
      usageDetails: '',
      contactPerson: '',
      url: '',
      email: '',
      phone: '',
      businessCard1: '',
      businessCard2: '',
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

  const filteredVendors = vendors.filter(item => {
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.usageDetails.toLowerCase().includes(q) ||
      item.contactPerson.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q) ||
      item.phone.toLowerCase().includes(q) ||
      item.memo1.toLowerCase().includes(q) ||
      item.memo2.toLowerCase().includes(q) ||
      item.memo3.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans">
      {/* ヘッダータイトル：パーソナルジムGOLAZO */}
      <div className="mb-4">
        <h2 className="text-xl font-extrabold text-blue-900 tracking-wide">パーソナルジムGOLAZO</h2>
      </div>

      {/* ページ切り替えナビゲーション */}
      <div className="flex flex-wrap gap-2 mb-6 bg-gray-100 p-3 rounded-lg border">
        <a href="/sales" className="px-3 py-1.5 bg-white border rounded text-sm font-medium hover:bg-gray-50">💰 売上管理</a>
        <a href="/customers" className="px-3 py-1.5 bg-white border rounded text-sm font-medium hover:bg-gray-50">👥 顧客リスト</a>
        <a href="/tasks" className="px-3 py-1.5 bg-white border rounded text-sm font-medium hover:bg-gray-50">📝 タスク・議事録</a>
        <a href="/neighbors" className="px-3 py-1.5 bg-white border rounded text-sm font-medium hover:bg-gray-50">🏫 近隣情報</a>
        <a href="/vendors" className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium">⚙️ マシン・業者一覧</a>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">⚙️ 使用マシン・業者情報管理</h1>
          <p className="text-sm text-gray-600 mt-1">ジムで使用しているマシンや取引業者の詳細、担当者、名刺画像、タスク連携メモを管理します。</p>
        </div>
      </div>

      {/* 検索バー */}
      <div className="bg-white p-4 rounded-lg border shadow-sm mb-6 flex items-center gap-3">
        <span className="text-sm font-semibold">🔍 キーワード検索:</span>
        <input
          type="text"
          placeholder="名前、使用詳細、担当者、メール、電話番号、メモで検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border rounded px-3 py-2 text-sm flex-1"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左側：一覧表示エリア */}
        <div className="lg:col-span-2 space-y-4">
          {filteredVendors.length === 0 ? (
            <div className="bg-white border rounded-lg p-8 text-center text-gray-500 shadow-sm">
              該当するマシン・業者情報はありません。
            </div>
          ) : (
            filteredVendors.map((item) => (
              <div key={item.id} className="bg-white border rounded-lg p-5 shadow-sm hover:shadow transition">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-xl text-gray-900">{item.name}</h3>
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

                <div className="mb-3 bg-gray-50 p-2.5 rounded text-sm text-gray-700">
                  <span className="font-semibold text-gray-900">使用詳細:</span> {item.usageDetails || '未設定'}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 mb-4">
                  <div>👤 担当者: <span className="font-medium text-gray-800">{item.contactPerson || '-'}</span></div>
                  <div>📞 連絡先: <span className="font-medium text-gray-800">{item.phone || '-'}</span></div>
                  <div>✉️ メール: <span className="font-medium text-gray-800">{item.email || '-'}</span></div>
                </div>

                {item.url && (
                  <div className="mb-4 text-sm">
                    🔗 URL: <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{item.url}</a>
                  </div>
                )}

                {/* 名刺画像プレビュー */}
                {(item.businessCard1 || item.businessCard2) && (
                  <div className="mb-4 pt-3 border-t">
                    <div className="text-xs font-semibold text-gray-500 mb-2">名刺画像</div>
                    <div className="flex gap-3">
                      {item.businessCard1 && (
                        <div className="border rounded p-1 bg-gray-50 w-32">
                          <img src={item.businessCard1} alt="名刺1" className="w-full h-20 object-cover rounded" />
                          <span className="text-[10px] text-center block text-gray-500 mt-1">名刺 1</span>
                        </div>
                      )}
                      {item.businessCard2 && (
                        <div className="border rounded p-1 bg-gray-50 w-32">
                          <img src={item.businessCard2} alt="名刺2" className="w-full h-20 object-cover rounded" />
                          <span className="text-[10px] text-center block text-gray-500 mt-1">名刺 2</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3つのメモ欄 ＆ タスク連携表示 */}
                <div className="bg-gray-50 rounded p-3 space-y-2 text-xs text-gray-700 border">
                  <div className="font-semibold text-gray-500">📝 メモ ＆ タスク連携</div>
                  
                  {[
                    { text: item.memo1, enabled: item.memo1TaskEnabled, date: item.memo1Date, status: item.memo1Status, imp: item.memo1Important, alarm: item.memo1Alarm },
                    { text: item.memo2, enabled: item.memo2TaskEnabled, date: item.memo2Date, status: item.memo2Status, imp: item.memo2Important, alarm: item.memo2Alarm },
                    { text: item.memo3, enabled: item.memo3TaskEnabled, date: item.memo3Date, status: item.memo3Status, imp: item.memo3Important, alarm: item.memo3Alarm },
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
            {isEditing ? '✏️ マシン・業者情報の編集' : '＋ 新規情報の追加'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div>
              <label className="block font-medium mb-1">名前（マシン名 / 業者名） <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                placeholder="例: BOSUバランストレーナー"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded p-2"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">使用詳細</label>
              <textarea
                placeholder="例: スタジオのバランス運動で使用"
                value={form.usageDetails}
                onChange={(e) => setForm({ ...form, usageDetails: e.target.value })}
                className="w-full border rounded p-2 h-16"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-medium mb-1">担当者名</label>
                <input
                  type="text"
                  placeholder="例: 佐藤 担当"
                  value={form.contactPerson}
                  onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">連絡先 (電話)</label>
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
              <label className="block font-medium mb-1">メールアドレス</label>
              <input
                type="email"
                placeholder="support@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border rounded p-2"
              />
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

            {/* 名刺保存 2枚 */}
            <div className="space-y-2 pt-2 border-t">
              <label className="block font-bold text-gray-800 text-xs">📇 名刺保存 (2枚まで)</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-gray-600 mb-1">名刺 1</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'businessCard1')}
                    className="w-full text-xs border rounded p-1 bg-gray-50"
                  />
                  {form.businessCard1 && <img src={form.businessCard1} alt="preview1" className="w-full h-14 object-cover mt-1 rounded border" />}
                </div>
                <div>
                  <label className="block text-[11px] text-gray-600 mb-1">名刺 2</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'businessCard2')}
                    className="w-full text-xs border rounded p-1 bg-gray-50"
                  />
                  {form.businessCard2 && <img src={form.businessCard2} alt="preview2" className="w-full h-14 object-cover mt-1 rounded border" />}
                </div>
              </div>
            </div>

            {/* --- 3つのメモ欄 ＆ タスク手動登録連携機能 --- */}
            <div className="space-y-3 pt-3 border-t">
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
                    id="v-m1Task"
                    checked={form.memo1TaskEnabled}
                    onChange={(e) => setForm({ ...form, memo1TaskEnabled: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <label htmlFor="v-m1Task" className="text-xs font-medium cursor-pointer text-blue-900">このメモをタスクに連携登録</label>
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
                    id="v-m2Task"
                    checked={form.memo2TaskEnabled}
                    onChange={(e) => setForm({ ...form, memo2TaskEnabled: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <label htmlFor="v-m2Task" className="text-xs font-medium cursor-pointer text-blue-900">このメモをタスクに連携登録</label>
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
                    id="v-m3Task"
                    checked={form.memo3TaskEnabled}
                    onChange={(e) => setForm({ ...form, memo3TaskEnabled: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <label htmlFor="v-m3Task" className="text-xs font-medium cursor-pointer text-blue-900">このメモをタスクに連携登録</label>
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
