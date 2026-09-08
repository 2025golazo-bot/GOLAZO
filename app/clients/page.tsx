'use client';

import { useState } from 'react';

export default function ClientsPage() {
  const [clients] = useState([
    { id: '1', name: '山田 太郎', phone: '090-1234-5678', goal: 'ダイエット・体幹強化', lastVisit: '2026-09-01' },
    { id: '2', name: '鈴木 花子', phone: '080-9876-5432', goal: '姿勢改善・ピラティス', lastVisit: '2026-09-02' },
  ]);

  return (
    <main className="p-6 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-black text-gray-900">顧客カルテ管理</h1>
        <p className="text-xs text-gray-500 mt-1">会員様の目標、トレーニングカルテ、コンディショニング履歴</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900">会員一覧</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clients.map((c) => (
            <div key={c.id} className="p-4 border rounded-xl bg-gray-50 space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm text-gray-900">{c.name}</h3>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">会員</span>
              </div>
              <p className="text-xs text-gray-600">TEL: {c.phone}</p>
              <p className="text-xs text-gray-600">目標: {c.goal}</p>
              <p className="text-[11px] text-gray-400">最終来店: {c.lastVisit}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
