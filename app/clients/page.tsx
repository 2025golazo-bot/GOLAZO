'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';

type Client = {
  id: number;
  name: string;
  kana: string;
  phone: string;
  email: string;
  status: 'active' | 'pending' | 'archived';
  plan: string;
  lastVisit: string;
  memo: string;
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([
    {
      id: 1,
      name: '山田 太郎',
      kana: 'ヤマダ タロウ',
      phone: '090-1234-5678',
      email: 'yamada@example.com',
      status: 'active',
      plan: '月4回コース',
      lastVisit: '2026-09-05',
      memo: '体幹トレーニングを中心に実施。スクワットのフォーム要改善。',
    },
    {
      id: 2,
      name: '佐藤 花子',
      kana: 'サトウ ハナコ',
      phone: '080-8765-4321',
      email: 'hanako@example.com',
      status: 'active',
      plan: '月8回コース',
      lastVisit: '2026-09-07',
      memo: '姿勢改善・ピラティス希望。肩こり軽減傾向あり。',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // 編集用のステート（編集中のクライアントID、およびフォームデータ）
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // 新規登録フォーム用のステート
  const [newClient, setNewClient] = useState({
    name: '',
    kana: '',
    phone: '',
    email: '',
    plan: '月4回コース',
    memo: '',
  });

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.includes(searchTerm) ||
      client.kana.includes(searchTerm) ||
      client.phone.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // 新規顧客追加
  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name) return;

    const clientToAdd: Client = {
      id: Date.now(),
      name: newClient.name,
      kana: newClient.kana,
      phone: newClient.phone,
      email: newClient.email,
      status: 'active',
      plan: newClient.plan,
      lastVisit: '未記録',
      memo: newClient.memo,
    };

    setClients([clientToAdd, ...clients]);
    setNewClient({ name: '', kana: '', phone: '', email: '', plan: '月4回コース', memo: '' });
    setIsModalOpen(false);
  };

  // 顧客情報の更新（編集保存）
  const handleUpdateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    setClients(
      clients.map((c) => (c.id === editingClient.id ? editingClient : c))
    );
    setEditingClient(null);
  };

  // 顧客の削除
  const handleDeleteClient = (id: number) => {
    if (confirm('本当にこの顧客データを削除しますか？')) {
      setClients(clients.filter((c) => c.id !== id));
      if (selectedClient?.id === id) setSelectedClient(null);
    }
  };

  // Square手動同期のシミュレーションハンドラー
  const handleSquareSync = async () => {
    setIsSyncing(true);
    // 実際のAPI連携処理（例: fetch('/api/square/sync') など）をここに記述できます
    setTimeout(() => {
      setIsSyncing(false);
      alert('Squareの最新決済・顧客データの同期が完了しました！');
    }, 1200);
  };

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 font-sans pb-12">
      <Header />

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* ページタイトル & アクションボタン */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span>📋</span> 顧客リスト管理
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              ジムの会員情報やカルテ、連絡先を一覧で管理します。
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleSquareSync}
              disabled={isSyncing}
              className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isSyncing ? '⏳' : '🔄'}</span>
              {isSyncing ? '同期中...' : 'Square手動同期'}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 sm:flex-none bg-[#5e9bc4] hover:bg-[#4d85ab] text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm flex items-center justify-center gap-2"
            >
              <span>＋</span> 新規顧客追加
            </button>
          </div>
        </div>

        {/* 検索・フィルターツールバー */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="w-full md:w-96">
            <input
              type="text"
              placeholder="名前、フリガナ、電話番号で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]/50"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterStatus === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              すべて ({clients.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterStatus === 'active' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              アクティブ
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterStatus === 'pending' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              体験・検討中
            </button>
          </div>
        </div>

        {/* 顧客一覧テーブル */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">顧客名</th>
                  <th className="p-4">ステータス</th>
                  <th className="p-4">プラン</th>
                  <th className="p-4">連絡先</th>
                  <th className="p-4">最終来店</th>
                  <th className="p-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{client.name}</div>
                        <div className="text-xs text-slate-400">{client.kana}</div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                            client.status === 'active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : client.status === 'pending'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {client.status === 'active' ? 'アクティブ' : client.status === 'pending' ? '体験・検討' : 'アーカイブ'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 font-medium">{client.plan}</td>
                      <td className="p-4 text-slate-600">
                        <div>{client.phone}</div>
                        <div className="text-xs text-slate-400">{client.email}</div>
                      </td>
                      <td className="p-4 text-slate-600 text-xs">{client.lastVisit}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedClient(client)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-[#5e9bc4] hover:text-white rounded-lg text-xs font-semibold transition text-slate-700"
                          >
                            カルテ
                          </button>
                          <button
                            onClick={() => setEditingClient(client)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-amber-500 hover:text-white rounded-lg text-xs font-semibold transition text-slate-700"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleDeleteClient(client.id)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-rose-500 hover:text-white rounded-lg text-xs font-semibold transition text-slate-700"
                          >
                            削除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 text-sm">
                      該当する顧客データが見つかりませんでした。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 新規顧客追加モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-800">新規顧客の登録</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleAddClient} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">お名前 *</label>
                  <input
                    type="text"
                    required
                    placeholder="山田 太郎"
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">フリガナ</label>
                  <input
                    type="text"
                    placeholder="ヤマダ タロウ"
                    value={newClient.kana}
                    onChange={(e) => setNewClient({ ...newClient, kana: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">電話番号</label>
                  <input
                    type="text"
                    placeholder="090-0000-0000"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">メールアドレス</label>
                  <input
                    type="email"
                    placeholder="example@email.com"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">契約プラン</label>
                <select
                  value={newClient.plan}
                  onChange={(e) => setNewClient({ ...newClient, plan: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]/50"
                >
                  <option value="月4回コース">月4回コース</option>
                  <option value="月8回コース">月8回コース</option>
                  <option value="通い放題コース">通い放題コース</option>
                  <option value="体験レッスン">体験レッスン</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">初期メモ・カルテ情報</label>
                <textarea
                  rows={3}
                  placeholder="運動歴、怪我の有無、要望など..."
                  value={newClient.memo}
                  onChange={(e) => setNewClient({ ...newClient, memo: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]/50"
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
                  登録する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 顧客情報編集モーダル */}
      {editingClient && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-800">顧客情報の編集</h3>
              <button onClick={() => setEditingClient(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleUpdateClient} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">お名前 *</label>
                  <input
                    type="text"
                    required
                    value={editingClient.name}
                    onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">フリガナ</label>
                  <input
                    type="text"
                    value={editingClient.kana}
                    onChange={(e) => setEditingClient({ ...editingClient, kana: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">電話番号</label>
                  <input
                    type="text"
                    value={editingClient.phone}
                    onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">メールアドレス</label>
                  <input
                    type="email"
                    value={editingClient.email}
                    onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">ステータス</label>
                  <select
                    value={editingClient.status}
                    onChange={(e) => setEditingClient({ ...editingClient, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]/50"
                  >
                    <option value="active">アクティブ</option>
                    <option value="pending">体験・検討</option>
                    <option value="archived">アーカイブ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">契約プラン</label>
                  <select
                    value={editingClient.plan}
                    onChange={(e) => setEditingClient({ ...editingClient, plan: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]/50"
                  >
                    <option value="月4回コース">月4回コース</option>
                    <option value="月8回コース">月8回コース</option>
                    <option value="通い放題コース">通い放題コース</option>
                    <option value="体験レッスン">体験レッスン</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">トレーニングカルテ・メモ</label>
                <textarea
                  rows={3}
                  value={editingClient.memo}
                  onChange={(e) => setEditingClient({ ...editingClient, memo: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]/50"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-semibold"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold shadow-sm"
                >
                  更新する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 詳細カルテモーダル */}
      {selectedClient && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-lg text-slate-800">{selectedClient.name}</h3>
                <p className="text-xs text-slate-400">{selectedClient.kana}</p>
              </div>
              <button onClick={() => setSelectedClient(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-xs text-slate-400 block">ステータス</span>
                  <span className="font-semibold text-emerald-600">
                    {selectedClient.status === 'active' ? 'アクティブ会員' : selectedClient.status === 'pending' ? '体験・検討中' : 'アーカイブ'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">契約プラン</span>
                  <span className="font-semibold text-slate-700">{selectedClient.plan}</span>
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-400 block mb-1">連絡先情報</span>
                <div className="bg-slate-50 p-3 rounded-xl space-y-1 text-slate-700">
                  <div>📞 {selectedClient.phone}</div>
                  <div>✉️ {selectedClient.email}</div>
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-400 block mb-1">トレーニングカルテ・メモ</span>
                <div className="bg-slate-50 p-3 rounded-xl text-slate-700 min-h-[80px] whitespace-pre-wrap">
                  {selectedClient.memo || 'メモはまだ登録されていません。'}
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedClient(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
