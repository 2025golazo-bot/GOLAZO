'use client';

import React, { useState } from 'react';

// 型定義
interface Session {
  id: string;
  date: string;
  staff: string;
  content: string;
  homework: string;
  photo: string | null;
}

interface PhysicalData {
  id: string;
  date: string;
  weight: number;
  fat: number;
  muscle: number;
  note?: string;
}

interface Client {
  id: string;
  name: string;
  kana: string;
  age: number;
  birthdate: string;
  parentName: string;
  phone: string;
  firstLessonDate: string;
  lastReservationDate: string;
  concern: string;
  memo: string;
  alert: string | null;
  physicalHistory: PhysicalData[];
  sessions: Session[];
}

export default function ClientsPage() {
  // 会員データ（ダミー初期値）
  const [clients, setClients] = useState<Client[]>([
    {
      id: 'c-001',
      name: '鈴木 蓮',
      kana: 'スズキ レン',
      age: 13,
      birthdate: '2013-05-12',
      parentName: '鈴木 花子',
      phone: '080-9876-5432',
      firstLessonDate: '2026-03-10',
      lastReservationDate: '2026-08-22',
      concern: 'サッカーの敏捷性向上・体幹ブレの改善',
      memo: '毎週火曜日に通うジュニア会員。',
      alert: '前回セッションから2週間以上空いています (17日後)',
      physicalHistory: [
        { id: 'm-1', date: '2026-06-01', weight: 42.5, fat: 16.2, muscle: 33.1, note: '写真・姿勢チェック記録済' },
        { id: 'm-2', date: '2026-09-01', weight: 43.0, fat: 15.8, muscle: 34.0, note: '写真・姿勢チェック記録済' }
      ],
      sessions: [
        { id: 's-1', date: '2026-09-01', staff: '藤田 渉仁', content: '体幹バランス＆アジリティ', homework: 'プランク 1分×2回', photo: null },
        { id: 's-2', date: '2026-08-22', staff: '藤田 渉仁', content: 'フットアライメントチェック・フォーム指導', homework: '足指ストレッチ', photo: null }
      ]
    },
    {
      id: 'c-002',
      name: '山田 太郎',
      kana: 'ヤマダ タロウ',
      age: 36,
      birthdate: '1990-01-15',
      parentName: 'ご本人',
      phone: '090-1234-5678',
      firstLessonDate: '2026-01-10',
      lastReservationDate: '2026-08-01',
      concern: '腰痛予防・ボディメイク',
      memo: '土曜日午前希望',
      alert: '要確認アラートあり',
      physicalHistory: [
        { id: 'm-10', date: '2026-06-10', weight: 68.0, fat: 21.0, muscle: 50.2, note: '初回計測' }
      ],
      sessions: [
        { id: 's-10', date: '2026-08-01', staff: '藤田 渉仁', content: 'フォームローラーケア＆体幹基礎', homework: 'ストレッチ10分', photo: null }
      ]
    }
  ]);

  const [selectedClientId, setSelectedClientId] = useState<string>('c-001');
  const selectedClient = clients.find(c => c.id === selectedClientId) || clients[0];

  // セッション表示用の年月フィルター状態
  const [selectedYearMonth, setSelectedYearMonth] = useState<string>('ALL');

  // 新規セッション入力用フォーム
  const [newSessionDate, setNewSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newSessionContent, setNewSessionContent] = useState<string>('');
  const [newSessionHomework, setNewSessionHomework] = useState<string>('');

  // 編集モード管理
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editSessionContent, setEditSessionContent] = useState<string>('');
  const [editSessionHomework, setEditSessionHomework] = useState<string>('');

  // 身体データ手動追加・修正フォーム状態
  const [newPhysicalDate, setNewPhysicalDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newWeight, setNewWeight] = useState<string>('');
  const [newFat, setNewFat] = useState<string>('');
  const [newMuscle, setNewMuscle] = useState<string>('');
  const [editingPhysicalId, setEditingPhysicalId] = useState<string | null>(null);

  // --- セッション操作ハンドラー ---
  const handleAddSession = () => {
    if (!newSessionContent) return;
    const newSession: Session = {
      id: `s-${Date.now()}`,
      date: newSessionDate,
      staff: '藤田 渉仁',
      content: newSessionContent,
      homework: newSessionHomework,
      photo: null
    };

    setClients(prev =>
      prev.map(c => {
        if (c.id === selectedClient.id) {
          return { ...c, sessions: [newSession, ...c.sessions] };
        }
        return c;
      })
    );
    setNewSessionContent('');
    setNewSessionHomework('');
  };

  const handleStartEditSession = (session: Session) => {
    setEditingSessionId(session.id);
    setEditSessionContent(session.content);
    setEditSessionHomework(session.homework);
  };

  const handleSaveEditSession = (sessionId: string) => {
    setClients(prev =>
      prev.map(c => {
        if (c.id === selectedClient.id) {
          const updated = c.sessions.map(s => {
            if (s.id === sessionId) {
              return { ...s, content: editSessionContent, homework: editSessionHomework };
            }
            return s;
          });
          return { ...c, sessions: updated };
        }
        return c;
      })
    );
    setEditingSessionId(null);
  };

  // --- 身体データ操作ハンドラー ---
  const handleAddPhysical = () => {
    if (!newWeight) return;
    const newEntry: PhysicalData = {
      id: `m-${Date.now()}`,
      date: newPhysicalDate,
      weight: parseFloat(newWeight) || 0,
      fat: parseFloat(newFat) || 0,
      muscle: parseFloat(newMuscle) || 0,
      note: '手動入力'
    };

    setClients(prev =>
      prev.map(c => {
        if (c.id === selectedClient.id) {
          return { ...c, physicalHistory: [...c.physicalHistory, newEntry] };
        }
        return c;
      })
    );
    setNewWeight('');
    setNewFat('');
    setNewMuscle('');
  };

  const handleUpdatePhysical = (id: string, field: keyof PhysicalData, value: string) => {
    setClients(prev =>
      prev.map(c => {
        if (c.id === selectedClient.id) {
          const updated = c.physicalHistory.map(m => {
            if (m.id === id) {
              return { ...m, [field]: field === 'date' || field === 'note' ? value : parseFloat(value) || 0 };
            }
            return m;
          });
          return { ...c, physicalHistory: updated };
        }
        return c;
      })
    );
  };

  // セッション年月リストの自動生成
  const availableYearMonths = Array.from(
    new Set(selectedClient.sessions.map(s => s.date.substring(0, 7)))
  ).sort().reverse();

  const filteredSessions = selectedClient.sessions.filter(s => {
    if (selectedYearMonth === 'ALL') return true;
    return s.date.startsWith(selectedYearMonth);
  });

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800">
      {/* ヘッダー */}
      <header className="bg-sky-600 text-white px-6 py-3 flex justify-between items-center shadow">
        <h1 className="text-xl font-bold tracking-wider">GYM MANAGER</h1>
        <nav className="flex gap-4 text-xs font-semibold">
          <span className="opacity-75 cursor-pointer hover:opacity-100">売上管理</span>
          <span className="bg-white text-sky-800 px-3 py-1 rounded shadow-sm">顧客カルテ</span>
          <span className="opacity-75 cursor-pointer hover:opacity-100">タスク・議事録</span>
          <span className="opacity-75 cursor-pointer hover:opacity-100">近隣情報</span>
          <span className="opacity-75 cursor-pointer hover:opacity-100">取引一覧</span>
        </nav>
      </header>

      <div className="p-6 max-w-7xl mx-auto space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">顧客カルテ管理（自動更新・自動判定）</h2>
          <p className="text-xs text-slate-500">年齢自動計算 ・ 3ヶ月計測サイクル自動通知 ・ 予約フォロー</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* 左カラム：会員一覧 */}
          <div className="md:col-span-1 space-y-3">
            <h3 className="font-bold text-sm text-slate-600">会員一覧 ({clients.length}名)</h3>
            {clients.map(client => (
              <div
                key={client.id}
                onClick={() => setSelectedClientId(client.id)}
                className={`p-4 rounded-lg border cursor-pointer transition shadow-sm ${
                  selectedClientId === client.id
                    ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-800">{client.name}</span>
                  <span className="text-xs font-semibold text-sky-600">{client.age}歳</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">保護者様: {client.parentName}</p>
                {client.alert && (
                  <span className="inline-block mt-2 text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                    要確認アラートあり
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* 右カラム：選択中の会員詳細 */}
          <div className="md:col-span-3 space-y-6">
            {/* 基本情報カード */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">
                    {selectedClient.name} <span className="text-sm text-slate-500 font-normal">({selectedClient.age}歳)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    保護者様: {selectedClient.parentName} / TEL: {selectedClient.phone}
                  </p>
                </div>
                <span className="bg-sky-100 text-sky-800 text-xs font-bold px-3 py-1 rounded-full">
                  初回: {selectedClient.firstLessonDate}
                </span>
              </div>

              {selectedClient.alert && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold p-2.5 rounded flex items-center gap-1.5">
                  ⚠️ {selectedClient.alert}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t text-xs text-slate-600">
                <div><span className="font-bold text-slate-700">悩み・目標:</span> {selectedClient.concern}</div>
                <div><span className="font-bold text-slate-700">指導メモ:</span> {selectedClient.memo}</div>
              </div>
            </div>

            {/* ①〜⑤ 3ヶ月定期計測・身体データ推移（手動修正・追加可能） */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  ①〜⑤ 3ヶ月定期計測・身体データ推移
                </h4>
                <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded">
                  3ヶ月周期自動判定
                </span>
              </div>

              {/* 身体データ一覧テーブル */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-600 border-collapse">
                  <thead>
                    <tr className="border-b bg-slate-50 text-slate-500">
                      <th className="py-2 px-2">計測日</th>
                      <th className="py-2 px-2">体重 (kg)</th>
                      <th className="py-2 px-2">体脂肪率 (%)</th>
                      <th className="py-2 px-2">筋肉量 (kg)</th>
                      <th className="py-2 px-2">姿勢・テストデータ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedClient.physicalHistory.map(m => (
                      <tr key={m.id} className="border-b hover:bg-slate-50">
                        <td className="py-2 px-2">
                          <input
                            type="date"
                            value={m.date}
                            onChange={e => handleUpdatePhysical(m.id, 'date', e.target.value)}
                            className="border border-slate-200 rounded px-1.5 py-0.5"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            step="0.1"
                            value={m.weight}
                            onChange={e => handleUpdatePhysical(m.id, 'weight', e.target.value)}
                            className="w-16 border border-slate-200 rounded px-1.5 py-0.5 font-bold text-sky-700"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            step="0.1"
                            value={m.fat}
                            onChange={e => handleUpdatePhysical(m.id, 'fat', e.target.value)}
                            className="w-16 border border-slate-200 rounded px-1.5 py-0.5"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            step="0.1"
                            value={m.muscle}
                            onChange={e => handleUpdatePhysical(m.id, 'muscle', e.target.value)}
                            className="w-16 border border-slate-200 rounded px-1.5 py-0.5"
                          />
                        </td>
                        <td className="py-2 px-2 text-slate-400">{m.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 手動データ追加フォーム */}
              <div className="bg-slate-50 p-3 rounded-md border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">+ 計測データの手動追加</span>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                  <input
                    type="date"
                    value={newPhysicalDate}
                    onChange={e => setNewPhysicalDate(e.target.value)}
                    className="border border-slate-300 rounded p-1.5"
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="体重 (kg)"
                    value={newWeight}
                    onChange={e => setNewWeight(e.target.value)}
                    className="border border-slate-300 rounded p-1.5"
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="体脂肪 (%)"
                    value={newFat}
                    onChange={e => setNewFat(e.target.value)}
                    className="border border-slate-300 rounded p-1.5"
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="筋肉量 (kg)"
                    value={newMuscle}
                    onChange={e => setNewMuscle(e.target.value)}
                    className="border border-slate-300 rounded p-1.5"
                  />
                  <button
                    onClick={handleAddPhysical}
                    className="bg-sky-600 hover:bg-sky-700 text-white font-bold rounded p-1.5 transition col-span-2 md:col-span-1"
                  >
                    追加する
                  </button>
                </div>
              </div>
            </div>

            {/* 新規セッション記録の追加 */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
              <h4 className="font-bold text-slate-800 text-sm">新規セッション記録の追加</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">日時</label>
                  <input
                    type="date"
                    value={newSessionDate}
                    onChange={e => setNewSessionDate(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-slate-500 mb-1 font-semibold">セッション内容</label>
                  <input
                    type="text"
                    placeholder="例: 体幹トレーニング、KOBA式バランス"
                    value={newSessionContent}
                    onChange={e => setNewSessionContent(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2"
                  />
                </div>
              </div>
              <div className="text-xs">
                <label className="block text-slate-500 mb-1 font-semibold">宿題 (写真添付可能)</label>
                <input
                  type="text"
                  placeholder="例: プランク 1分×2回"
                  value={newSessionHomework}
                  onChange={e => setNewSessionHomework(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2"
                />
              </div>
              <button
                onClick={handleAddSession}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 rounded text-xs transition"
              >
                セッションを登録
              </button>
            </div>

            {/* 時系列セッション履歴（年月タブ選択） */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-3">
                <h4 className="font-bold text-slate-800 text-sm">時系列セッション履歴</h4>
                
                {/* 年月切り替えタブ */}
                <div className="flex gap-1 overflow-x-auto text-xs">
                  <button
                    onClick={() => setSelectedYearMonth('ALL')}
                    className={`px-3 py-1 rounded-full font-bold transition ${
                      selectedYearMonth === 'ALL'
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    すべて
                  </button>
                  {availableYearMonths.map(ym => (
                    <button
                      key={ym}
                      onClick={() => setSelectedYearMonth(ym)}
                      className={`px-3 py-1 rounded-full font-bold transition ${
                        selectedYearMonth === ym
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {ym.replace('-', '年')}月
                    </button>
                  ))}
                </div>
              </div>

              {/* 履歴リスト */}
              <div className="space-y-3">
                {filteredSessions.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">該当する期間の記録はありません。</p>
                ) : (
                  filteredSessions.map(session => (
                    <div key={session.id} className="p-3 bg-slate-50 rounded border border-slate-200 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-700">{session.date} (担当: {session.staff})</span>
                        {editingSessionId === session.id ? (
                          <button
                            onClick={() => handleSaveEditSession(session.id)}
                            className="bg-emerald-600 text-white px-2 py-0.5 rounded font-bold hover:bg-emerald-700"
                          >
                            保存
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartEditSession(session)}
                            className="text-sky-600 font-semibold hover:underline"
                          >
                            編集
                          </button>
                        )}
                      </div>

                      {editingSessionId === session.id ? (
                        <div className="space-y-2 pt-1">
                          <input
                            type="text"
                            value={editSessionContent}
                            onChange={e => setEditSessionContent(e.target.value)}
                            className="w-full border border-slate-300 rounded p-1.5"
                          />
                          <input
                            type="text"
                            value={editSessionHomework}
                            onChange={e => setEditSessionHomework(e.target.value)}
                            className="w-full border border-slate-300 rounded p-1.5"
                            placeholder="宿題"
                          />
                        </div>
                      ) : (
                        <>
                          <p className="text-slate-800 font-medium">{session.content}</p>
                          {session.homework && (
                            <p className="text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-100">
                              <span className="font-bold">宿題:</span> {session.homework}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
