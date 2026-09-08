'use client';

import { useState } from 'react';

interface Measurement {
  date: string;
  weight: number;
  fat: number;
  muscle: number;
  postureImage1?: string;
  postureImage2?: string;
  postureImage3?: string;
  testResultImage?: string;
}

interface Session {
  id: string;
  date: string;
  content: string;
  homework: string;
  homeworkPhoto?: string;
  memo: string;
}

interface Client {
  id: string;
  childName: string; // お子様のお名前
  parentName: string; // 保護者様のお名前
  birthday: string; // 誕生日 (年齢自動計算用)
  phone: string;
  goal: string;
  firstSessionDate: string;
  nextReservationDate: string;
  memo: string;
  measurements: Measurement[];
  sessions: Session[];
}

export default function ClientsPage() {
  // 年齢を自動計算する関数
  const calculateAge = (birthDateStr: string) => {
    if (!birthDateStr) return '未設定';
    const birth = new Date(birthDateStr);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age}歳`;
  };

  // サンプル顧客データ
  const [clients, setClients] = useState<Client[]>([
    {
      id: '1',
      childName: '鈴木 蓮',
      parentName: '鈴木 花子',
      birthday: '2013-05-15',
      phone: '080-9876-5432',
      goal: 'サッカーの俊敏性向上・体幹ブレの改善',
      firstSessionDate: '2026-03-10',
      nextReservationDate: '2026-09-25', // 2週間〜1ヶ月チェック用
      memo: '毎週火曜日に通うジュニア会員。体幹トレーニングに前向き。',
      measurements: [
        { date: '2026-06-01', weight: 42.5, fat: 16.2, muscle: 33.1 }, // 3ヶ月前
        { date: '2026-09-01', weight: 43.0, fat: 15.8, muscle: 34.0 }, // 直近計測
      ],
      sessions: [
        {
          id: 's1',
          date: '2026-09-01',
          content: 'KOBA式体幹バランストレーニング ＆ アジリティドリル',
          homework: 'フロントプランク 1分×2セット',
          memo: '前回よりブレが少なくなっている。宿題も毎日継続中。',
        },
      ],
    },
    {
      id: '2',
      childName: '山田 太郎',
      parentName: 'ご本人',
      birthday: '1990-08-20',
      phone: '090-1234-5678',
      goal: '猫背改善・ダイエット',
      firstSessionDate: '2025-11-01',
      nextReservationDate: '2026-07-10', // 予約が1ヶ月以上空いているためアラート対象の例
      memo: 'デスクワークによる腰痛持ち。フットアライメント調整を実施。',
      measurements: [
        { date: '2026-05-10', weight: 72.0, fat: 22.5, muscle: 52.0 },
      ],
      sessions: [],
    },
  ]);

  const [selectedClient, setSelectedClient] = useState<Client>(clients[0]);

  // 新規セッション追加フォーム用 state
  const [newSessionDate, setNewSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [newSessionContent, setNewSessionContent] = useState('');
  const [newSessionHomework, setNewSessionHomework] = useState('');
  const [newSessionMemo, setNewSessionMemo] = useState('');

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionContent) return alert('セッション内容を入力してください。');

    const updatedSessions = [
      {
        id: Date.now().toString(),
        date: newSessionDate,
        content: newSessionContent,
        homework: newSessionHomework,
        memo: newSessionMemo,
      },
      ...selectedClient.sessions,
    ];

    const updatedClient = { ...selectedClient, sessions: updatedSessions };
    setSelectedClient(updatedClient);
    setClients(clients.map((c) => (c.id === updatedClient.id ? updatedClient : c)));
    setNewSessionContent('');
    setNewSessionHomework('');
    setNewSessionMemo('');
    alert('セッション記録を追加しました！');
  };

  // 次回予約が2週間〜1ヶ月以上空いているかチェックする判定
  const checkReservationAlert = (nextDateStr: string) => {
    if (!nextDateStr) return { alert: true, text: '⚠️ 次回予約なし' };
    const nextDate = new Date(nextDateStr);
    const today = new Date();
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { alert: true, text: '⚠️ 予約日が過ぎています（フォロー必要）' };
    }
    if (diffDays > 14) {
      return { alert: true, text: `⚠️ 前回から2週間以上空いています (${diffDays}日後)` };
    }
    return { alert: false, text: `次回予約日: ${nextDateStr} (順調)` };
  };

  return (
    <main className="p-6 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">顧客カルテ管理 (Square連携)</h1>
          <p className="text-xs text-gray-500 mt-1">会員様の目標、セッション記録、3ヶ月定期計測、フォローアップ管理</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左側：会員リスト */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3 lg:col-span-1">
          <h2 className="text-sm font-bold text-gray-900 border-b pb-2">会員一覧 ({clients.length}名)</h2>
          <div className="space-y-2 overflow-y-auto max-h-[600px]">
            {clients.map((c) => {
              const alertInfo = checkReservationAlert(c.nextReservationDate);
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedClient(c)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition space-y-1 ${
                    selectedClient.id === c.id ? 'bg-blue-50 border-blue-300 shadow-sm' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-gray-900">{c.childName}</span>
                    <span className="text-xs font-bold text-blue-600">{calculateAge(c.birthday)}</span>
                  </div>
                  <p className="text-[11px] text-gray-500">保護者: {c.parentName}</p>
                  <p className={`text-[10px] font-bold ${alertInfo.alert ? 'text-amber-600' : 'text-gray-400'}`}>
                    {alertInfo.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 右側：選択された会員の詳細カルテ */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 lg:col-span-2">
          {/* 会員基本情報 */}
          <div className="border-b pb-4 space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h2 className="text-xl font-black text-gray-900">
                  {selectedClient.childName}{' '}
                  <span className="text-sm font-normal text-gray-500">({calculateAge(selectedClient.birthday)})</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">保護者様名: {selectedClient.parentName} / TEL: {selectedClient.phone}</p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-xl">
                  初回セッション: {selectedClient.firstSessionDate}
                </span>
              </div>
            </div>

            {/* 予約フォローアップアラートバナー */}
            <div className={`p-3 rounded-xl text-xs font-bold border ${
              checkReservationAlert(selectedClient.nextReservationDate).alert
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-green-50 text-green-800 border-green-200'
            }`}>
              {checkReservationAlert(selectedClient.nextReservationDate).text}
            </div>

            <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-xs border">
              <p><strong className="text-gray-700">悩み・目標:</strong> <span className="text-gray-900 font-medium">{selectedClient.goal}</span></p>
              <p><strong className="text-gray-700">指導メモ:</strong> <span className="text-gray-900 font-medium">{selectedClient.memo}</span></p>
            </div>
          </div>

          {/* 3ヶ月周期の定期計測セクション */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-900">①〜⑤ 3ヶ月定期計測・身体データ推移</h3>
              <span className="text-[11px] bg-purple-50 text-purple-700 font-bold px-2.5 py-1 rounded-lg border border-purple-200">
                🔄 3ヶ月周期計測対象
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b bg-gray-50 text-gray-500">
                    <th className="p-2.5 font-bold">計測日</th>
                    <th className="p-2.5 font-bold">体重 (kg)</th>
                    <th className="p-2.5 font-bold">体脂肪率 (%)</th>
                    <th className="p-2.5 font-bold">筋肉量 (kg)</th>
                    <th className="p-2.5 font-bold">姿勢・テスト写真</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {selectedClient.measurements.map((m, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-2.5 font-bold text-gray-900">{m.date}</td>
                      <td className="p-2.5 text-blue-600 font-bold">{m.weight} kg</td>
                      <td className="p-2.5 text-gray-700">{m.fat} %</td>
                      <td className="p-2.5 text-gray-700">{m.muscle} kg</td>
                      <td className="p-2.5 text-gray-400 text-[11px]">
                        [姿勢チェック画像3枚登録済] <br /> [テスト結果写真登録済]
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* セッション記録追加フォーム */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
            <h3 className="text-sm font-bold text-gray-900">新規セッション記録の追加</h3>
            <form onSubmit={handleAddSession} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700">日時</label>
                  <input
                    type="date"
                    value={newSessionDate}
                    onChange={(e) => setNewSessionDate(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700">セッション内容</label>
                  <input
                    type="text"
                    placeholder="例: 体幹トレーニング ＆ フットアライメント"
                    value={newSessionContent}
                    onChange={(e) => setNewSessionContent(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-lg bg-white"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-gray-700">宿題 (写真添付可能)</label>
                <input
                  type="text"
                  placeholder="例: プランク 1分×2回 (写真アップロード可)"
                  value={newSessionHomework}
                  onChange={(e) => setNewSessionHomework(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700">メモ・気づき</label>
                <textarea
                  placeholder="本人のコンディションや特記事項"
                  value={newSessionMemo}
                  onChange={(e) => setNewSessionMemo(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-lg bg-white h-16"
                />
              </div>
              <button type="submit" className="w-full py-2.5 bg-gray-900 text-white font-bold rounded-lg hover:bg-black transition">
                セッション記録を保存する
              </button>
            </form>
          </div>

          {/* 過去のセッション履歴一覧 */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-gray-900">過去のセッション・指導履歴</h3>
            {selectedClient.sessions.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">セッション記録はありません。</p>
            ) : (
              selectedClient.sessions.map((s) => (
                <div key={s.id} className="p-4 border rounded-xl bg-white space-y-2 shadow-sm text-xs">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-black text-gray-900 text-sm">{s.content}</span>
                    <span className="text-gray-400 text-[11px]">{s.date}</span>
                  </div>
                  {s.homework && <p className="text-gray-700"><strong>宿題:</strong> {s.homework}</p>}
                  {s.memo && <p className="text-gray-600 bg-gray-50 p-2.5 rounded-lg"><strong>メモ:</strong> {s.memo}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
