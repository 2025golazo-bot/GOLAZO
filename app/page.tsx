'use client';

import { useState, useEffect, useCallback } from 'react';

// --- 型定義 ---

// 測定データ
interface MeasurementRecord {
  id: string;
  date: string; // 測定日
  postureImages: string[]; // 姿勢写真3枚
  weight: number; // 体重 (kg)
  bodyFat: number; // 体脂肪率 (%)
  muscleMass: number; // 筋肉量 (kg)
  testResultText: string; // テスト結果メモ
  testImage?: string; // テスト結果写真
}

// セッション記録
interface SessionRecord {
  id: string;
  date: string;
  content: string;
  homeworkText: string;
  homeworkImage?: string; // 宿題写真
  memo: string;
}

// 顧客カルテ型（Square連携データ + 詳細情報）
interface CustomerKarte {
  id: string; // Square Customer ID
  parentName: string; // 保護者のお名前
  childName: string; // お子様のお名前
  birthDate: string; // 生年月日 (YYYY-MM-DD)
  memo: string; // 備考メモ
  firstSessionDate: string; // 初回セッション日
  nextReservationDate: string; // 次回予約日
  concerns: string; // 悩み
  goals: string; // 目標
  ticketTotal: number; // 所持回数券 全体数
  ticketUsed: number; // 所持回数券 消化数
  sessions: SessionRecord[];
  measurements: MeasurementRecord[];
}

interface Payment {
  id: string;
  created_at: string;
  amount_money?: { amount: number; currency: string };
  status: string;
  customer_id?: string;
  customer_name?: string;
  item_names?: string;
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // 顧客カルテデータ（初期サンプルデータ）
  const [customers, setCustomers] = useState<CustomerKarte[]>([
    {
      id: 'SQUARE_CUST_001',
      parentName: '藤田 奈々',
      childName: '藤田 陸',
      birthDate: '2014-06-15',
      memo: 'サッカーJrユース所属。右足首の捻挫癖あり。',
      firstSessionDate: '2026-01-10',
      nextReservationDate: '2026-08-20', // フォロー対象の例
      concerns: '切り返しの時に踏ん張りが効かず、体幹がブレる',
      goals: 'アジリティの向上と怪我予防のための軸づくり',
      ticketTotal: 8,
      ticketUsed: 6,
      sessions: [
        {
          id: 's1',
          date: '2026-09-01 16:00',
          content: 'KOBA式体幹トレーニング＋リアクションアジリティ',
          homeworkText: '片足バランスクランチ 左右15回×2セット',
          homeworkImage: 'https://placehold.co/400x300/e2e8f0/475569?text=Homework+Doc',
          memo: '右膝が内側に入りやすいので注意して動作を行っていた。',
        },
      ],
      measurements: [
        {
          id: 'm1',
          date: '2026-06-01',
          postureImages: [
            'https://placehold.co/300x400/e2e8f0/475569?text=Front',
            'https://placehold.co/300x400/e2e8f0/475569?text=Side',
            'https://placehold.co/300x400/e2e8f0/475569?text=Back',
          ],
          weight: 42.5,
          bodyFat: 16.2,
          muscleMass: 33.1,
          testResultText: 'コアバランスフィジカルテスト: スコア78点（体幹ブレ改善あり）',
          testImage: 'https://placehold.co/400x300/e2e8f0/475569?text=Test+Result',
        },
      ],
    },
  ]);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('SQUARE_CUST_001');

  // 新規入力用フォームState
  const [newSession, setNewSession] = useState({ content: '', homeworkText: '', homeworkImage: '', memo: '' });
  const [newMeasurement, setNewMeasurement] = useState({
    weight: '',
    bodyFat: '',
    muscleMass: '',
    testResultText: '',
    postureImg1: '',
    postureImg2: '',
    postureImg3: '',
    testImage: '',
  });

  // 生年月日から年齢を動的に自動計算（誕生日が来たら自動加齢）
  const calculateAge = (birthDateStr: string): string => {
    if (!birthDateStr) return '未設定';
    const birth = new Date(birthDateStr);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age}歳`;
  };

  // 次回予約日の経過フォロー判断（14日・30日以上空いているか）
  const getFollowUpStatus = (nextResDateStr: string) => {
    if (!nextResDateStr) return { label: '次回未予約', color: 'bg-gray-100 text-gray-600' };
    const nextDate = new Date(nextResDateStr);
    const today = new Date();
    const diffTime = today.getTime() - nextDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 30) {
      return { label: `🚨 1ヶ月以上空いています (${diffDays}日経過・要連絡)`, color: 'bg-red-100 text-red-800 font-bold border border-red-300' };
    } else if (diffDays >= 14) {
      return { label: `⚠️ 2週間以上空いています (${diffDays}日経過・要フォロー)`, color: 'bg-amber-100 text-amber-800 font-bold border border-amber-300' };
    }
    return { label: `次回予約: ${nextResDateStr}`, color: 'bg-green-100 text-green-800 font-semibold' };
  };

  // 3ヶ月ごとの測定周期チェック（直近測定日から3ヶ月以上経過しているか判断）
  const getMeasurementStatus = (measurements: MeasurementRecord[]) => {
    if (!measurements || measurements.length === 0) {
      return { isDue: true, label: '🔔 初回計測未実施' };
    }
    const latest = measurements[measurements.length - 1];
    const lastDate = new Date(latest.date);
    const today = new Date();
    
    // 月差分を計算
    const monthDiff = (today.getFullYear() - lastDate.getFullYear()) * 12 + (today.getMonth() - lastDate.getMonth());

    if (monthDiff >= 3) {
      return { isDue: true, label: `🔔 前回の計測から3ヶ月経過しています (最終: ${latest.date})` };
    }
    
    // 次回の計測予定月を算出
    const nextDate = new Date(lastDate);
    nextDate.setMonth(nextDate.getMonth() + 3);
    const nextMonthStr = `${nextDate.getFullYear()}年${nextDate.getMonth() + 1}月`;

    return { isDue: false, label: `次回計測予定月: ${nextMonthStr}` };
  };

  // Squareデータ同期
  const handleSyncSquare = useCallback(async () => {
    setLoading(true);
    setMessage('Squareより顧客・決済情報を同期中...');
    try {
      const response = await fetch('/api/sync/square');
      const data = await response.json();

      if (data.success && Array.isArray(data.customers)) {
        // Square顧客情報を既存カルテにマージ
        const updatedList = [...customers];
        data.customers.forEach((sqCust: any) => {
          const exists = updatedList.find((c) => c.id === sqCust.id);
          if (!exists) {
            updatedList.push({
              id: sqCust.id,
              parentName: sqCust.given_name ? `${sqCust.family_name || ''} ${sqCust.given_name}` : 'Square顧客',
              childName: sqCust.note || 'お子様のお名前未登録',
              birthDate: '2015-01-01',
              memo: sqCust.note || '',
              firstSessionDate: sqCust.created_at ? sqCust.created_at.split('T')[0] : '',
              nextReservationDate: '',
              concerns: '新規追加顧客',
              goals: '',
              ticketTotal: 0,
              ticketUsed: 0,
              sessions: [],
              measurements: [],
            });
          }
        });
        setCustomers(updatedList);
        setMessage(`Square同期完了: ${data.customers.length}件の顧客データを取得・更新しました。`);
      }
    } catch (err) {
      console.error(err);
      setMessage('Square同期に失敗しました。');
    } finally {
      setLoading(false);
    }
  }, [customers]);

  const currentCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  // セッション記録追加
  const handleAddSession = () => {
    if (!newSession.content) return alert('セッション内容を入力してください。');
    const updated = customers.map((cust) => {
      if (cust.id === currentCustomer.id) {
        return {
          ...cust,
          ticketUsed: cust.ticketUsed < cust.ticketTotal ? cust.ticketUsed + 1 : cust.ticketUsed,
          sessions: [
            {
              id: Date.now().toString(),
              date: new Date().toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
              content: newSession.content,
              homeworkText: newSession.homeworkText,
              homeworkImage: newSession.homeworkImage || undefined,
              memo: newSession.memo,
            },
            ...cust.sessions,
          ],
        };
      }
      return cust;
    });
    setCustomers(updated);
    setNewSession({ content: '', homeworkText: '', homeworkImage: '', memo: '' });
  };

  // 測定データ追加
  const handleAddMeasurement = () => {
    if (!newMeasurement.weight) return alert('体重を入力してください。');
    const updated = customers.map((cust) => {
      if (cust.id === currentCustomer.id) {
        return {
          ...cust,
          measurements: [
            ...cust.measurements,
            {
              id: Date.now().toString(),
              date: new Date().toISOString().split('T')[0],
              postureImages: [
                newMeasurement.postureImg1 || 'https://placehold.co/300x400/e2e8f0/475569?text=Front',
                newMeasurement.postureImg2 || 'https://placehold.co/300x400/e2e8f0/475569?text=Side',
                newMeasurement.postureImg3 || 'https://placehold.co/300x400/e2e8f0/475569?text=Back',
              ],
              weight: Number(newMeasurement.weight),
              bodyFat: Number(newMeasurement.bodyFat),
              muscleMass: Number(newMeasurement.muscleMass),
              testResultText: newMeasurement.testResultText,
              testImage: newMeasurement.testImage || undefined,
            },
          ],
        };
      }
      return cust;
    });
    setCustomers(updated);
    setNewMeasurement({ weight: '', bodyFat: '', muscleMass: '', testResultText: '', postureImg1: '', postureImg2: '', postureImg3: '', testImage: '' });
  };

  const followStatus = getFollowUpStatus(currentCustomer?.nextReservationDate);
  const measurementStatus = getMeasurementStatus(currentCustomer?.measurements);

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900">顧客カルテ・セッション＆測定統合管理</h1>
          <p className="text-xs text-gray-500 mt-1">Square顧客自動同期 ＆ 3ヶ月測定アラート ＆ フォロー通知システム</p>
        </div>
        <button
          onClick={handleSyncSquare}
          disabled={loading}
          className="px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 disabled:bg-gray-400 shadow-sm transition"
        >
          {loading ? 'Square同期中...' : 'Square顧客データを同期'}
        </button>
      </div>

      {message && <p className="text-xs text-blue-700 bg-blue-50 p-3 rounded-lg border border-blue-200">{message}</p>}

      {/* 顧客選択セレクター */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
        <label className="text-sm font-bold text-gray-700 whitespace-nowrap">カルテを選択:</label>
        <select
          value={selectedCustomerId}
          onChange={(e) => setSelectedCustomerId(e.target.value)}
          className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-bold focus:outline-none focus:border-blue-500"
        >
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.childName} 様（保護者: {c.parentName} 様） / 年齢: {calculateAge(c.birthDate)}
            </option>
          ))}
        </select>
      </div>

      {/* 1. 顧客基本カルテカード (最上部) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-gray-900">{currentCustomer.childName} 選手</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                年齢: {calculateAge(currentCustomer.birthDate)}（生年月日: {currentCustomer.birthDate}）
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">保護者様: {currentCustomer.parentName} 様 / 初回体験・セッション日: {currentCustomer.firstSessionDate || '未登録'}</p>
          </div>

          {/* 予約フォローアラート */}
          <div className="flex flex-col items-end gap-1">
            <span className={`px-3.5 py-1.5 rounded-xl text-xs font-bold ${followStatus.color}`}>
              {followStatus.label}
            </span>
          </div>
        </div>

        {/* 悩み・目標・回数券 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-xl">
            <p className="font-bold text-amber-900 mb-1">【お悩み】</p>
            <p className="text-gray-700 font-medium">{currentCustomer.concerns || '未設定'}</p>
          </div>
          <div className="bg-blue-50/60 border border-blue-200 p-4 rounded-xl">
            <p className="font-bold text-blue-900 mb-1">【目標】</p>
            <p className="text-gray-700 font-medium">{currentCustomer.goals || '未設定'}</p>
          </div>
          <div className="bg-green-50/60 border border-green-200 p-4 rounded-xl flex flex-col justify-between">
            <div>
              <p className="font-bold text-green-900 mb-1">【回数券消化状況】</p>
              <p className="text-sm font-black text-green-800">
                {currentCustomer.ticketUsed} / {currentCustomer.ticketTotal} 回 消化済み
              </p>
            </div>
            <div className="w-full bg-green-200 rounded-full h-2 mt-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{
                  width: `${currentCustomer.ticketTotal > 0 ? (currentCustomer.ticketUsed / currentCustomer.ticketTotal) * 100 : 0}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* メモ */}
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs">
          <span className="font-bold text-gray-700">【メモ・既往歴】: </span>
          <span className="text-gray-600">{currentCustomer.memo || 'なし'}</span>
        </div>
      </div>

      {/* 2. 測定詳細 ＆ 3ヶ月周期計測アラート */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-2">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">測定詳細・変化比較</h2>
            {measurementStatus.isDue ? (
              <span className="px-3 py-1 bg-red-500 text-white text-xs font-extrabold rounded-full animate-pulse">
                {measurementStatus.label}
              </span>
            ) : (
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                {measurementStatus.label}
              </span>
            )}
          </div>
        </div>

        {/* 測定データの入力 */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3 text-xs">
          <p className="font-bold text-gray-800">新規測定記録の追加</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="number"
              placeholder="体重 (kg)"
              value={newMeasurement.weight}
              onChange={(e) => setNewMeasurement({ ...newMeasurement, weight: e.target.value })}
              className="p-2 border rounded-lg bg-white"
            />
            <input
              type="number"
              placeholder="体脂肪率 (%)"
              value={newMeasurement.bodyFat}
              onChange={(e) => setNewMeasurement({ ...newMeasurement, bodyFat: e.target.value })}
              className="p-2 border rounded-lg bg-white"
            />
            <input
              type="number"
              placeholder="筋肉量 (kg)"
              value={newMeasurement.muscleMass}
              onChange={(e) => setNewMeasurement({ ...newMeasurement, muscleMass: e.target.value })}
              className="p-2 border rounded-lg bg-white"
            />
          </div>
          <input
            type="text"
            placeholder="姿勢写真URL正面・側面・背面（URLを入力）"
            value={newMeasurement.postureImg1}
            onChange={(e) => setNewMeasurement({ ...newMeasurement, postureImg1: e.target.value })}
            className="w-full p-2 border rounded-lg bg-white"
          />
          <input
            type="text"
            placeholder="テスト結果メモ（例: CBFテスト 80点）"
            value={newMeasurement.testResultText}
            onChange={(e) => setNewMeasurement({ ...newMeasurement, testResultText: e.target.value })}
            className="w-full p-2 border rounded-lg bg-white"
          />
          <button
            onClick={handleAddMeasurement}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-black transition"
          >
            測定記録を保存
          </button>
        </div>

        {/* 履歴と変化計算 */}
        <div className="space-y-6">
          {currentCustomer.measurements.map((m, idx) => {
            const prev = idx > 0 ? currentCustomer.measurements[idx - 1] : null;
            const weightDiff = prev ? (m.weight - prev.weight).toFixed(1) : null;
            const fatDiff = prev ? (m.bodyFat - prev.bodyFat).toFixed(1) : null;
            const muscleDiff = prev ? (m.muscleMass - prev.muscleMass).toFixed(1) : null;

            return (
              <div key={m.id} className="p-5 border border-gray-200 rounded-xl bg-gray-50/50 space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-black text-sm text-gray-900">① 測定日: {m.date}</span>
                  <span className="text-xs text-gray-500">第 {idx + 1} 回目計測</span>
                </div>

                {/* ② 姿勢チェック（写真3枚） */}
                <div>
                  <p className="text-xs font-bold text-gray-700 mb-2">② 姿勢チェック（写真3枚）</p>
                  <div className="grid grid-cols-3 gap-3">
                    {m.postureImages.map((imgUrl, imgIdx) => (
                      <div key={imgIdx} className="relative aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden border">
                        <img src={imgUrl} alt={`姿勢${imgIdx + 1}`} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                          {imgIdx === 0 ? '正面' : imgIdx === 1 ? '側面' : '背面'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ③ 体重・体脂肪・筋肉量（自動計算比較） */}
                <div>
                  <p className="text-xs font-bold text-gray-700 mb-2">③ 体組成（前回比自動計算）</p>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-white border rounded-xl shadow-sm">
                      <p className="text-[10px] text-gray-400">体重</p>
                      <p className="text-base font-black text-gray-900">{m.weight} kg</p>
                      {weightDiff && (
                        <p className={`text-[10px] font-bold ${Number(weightDiff) > 0 ? 'text-red-500' : 'text-blue-500'}`}>
                          {Number(weightDiff) > 0 ? `+${weightDiff}` : weightDiff} kg
                        </p>
                      )}
                    </div>

                    <div className="p-3 bg-white border rounded-xl shadow-sm">
                      <p className="text-[10px] text-gray-400">体脂肪率</p>
                      <p className="text-base font-black text-gray-900">{m.bodyFat} %</p>
                      {fatDiff && (
                        <p className={`text-[10px] font-bold ${Number(fatDiff) > 0 ? 'text-red-500' : 'text-green-600'}`}>
                          {Number(fatDiff) > 0 ? `+${fatDiff}` : fatDiff} %
                        </p>
                      )}
                    </div>

                    <div className="p-3 bg-white border rounded-xl shadow-sm">
                      <p className="text-[10px] text-gray-400">筋肉量</p>
                      <p className="text-base font-black text-gray-900">{m.muscleMass} kg</p>
                      {muscleDiff && (
                        <p className={`text-[10px] font-bold ${Number(muscleDiff) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {Number(muscleDiff) > 0 ? `+${muscleDiff}` : muscleDiff} kg
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* ④ テスト結果 */}
                <div>
                  <p className="text-xs font-bold text-gray-700 mb-1">④ テスト結果</p>
                  <p className="text-xs text-gray-800 bg-white p-2.5 rounded-lg border">{m.testResultText}</p>
                  {m.testImage && (
                    <div className="mt-2 w-32 h-24 bg-gray-200 rounded-lg overflow-hidden border">
                      <img src={m.testImage} alt="テスト結果写真" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. セッション記録 */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
        <h2 className="text-xl font-bold text-gray-900 border-b pb-4">セッション記録 ＆ 宿題添付</h2>

        {/* セッション登録 */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3 text-xs">
          <p className="font-bold text-gray-800">本日のセッションを記録</p>
          <input
            type="text"
            placeholder="セッション内容（例: BOSU体幹トレーニング、フットアライメント）"
            value={newSession.content}
            onChange={(e) => setNewSession({ ...newSession, content: e.target.value })}
            className="w-full p-2 border rounded-lg bg-white"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="宿題内容（例: リアクションアジリティ自主練）"
              value={newSession.homeworkText}
              onChange={(e) => setNewSession({ ...newSession, homeworkText: e.target.value })}
              className="p-2 border rounded-lg bg-white"
            />
            <input
              type="text"
              placeholder="宿題参考写真・動画URL（任意）"
              value={newSession.homeworkImage}
              onChange={(e) => setNewSession({ ...newSession, homeworkImage: e.target.value })}
              className="p-2 border rounded-lg bg-white"
            />
          </div>
          <textarea
            placeholder="トレーナーメモ"
            value={newSession.memo}
            onChange={(e) => setNewSession({ ...newSession, memo: e.target.value })}
            className="w-full p-2 border rounded-lg bg-white h-16"
          />
          <button
            onClick={handleAddSession}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
          >
            セッションを記録して消化処理
          </button>
        </div>

        {/* セッション履歴一覧 */}
        <div className="space-y-4">
          {currentCustomer.sessions.map((s) => (
            <div key={s.id} className="p-4 border rounded-xl bg-white shadow-sm space-y-2 text-xs">
              <div className="flex justify-between items-center text-gray-500 font-bold border-b pb-2">
                <span>日時: {s.date}</span>
              </div>
              <p className="text-sm font-bold text-gray-900">セッション内容: {s.content}</p>

              {s.homeworkText && (
                <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 flex gap-4 items-start">
                  <div className="flex-1">
                    <p className="font-bold text-blue-900">【宿題】</p>
                    <p className="text-gray-700 mt-0.5">{s.homeworkText}</p>
                  </div>
                  {s.homeworkImage && (
                    <img src={s.homeworkImage} alt="宿題画像" className="w-16 h-16 object-cover rounded-lg border" />
                  )}
                </div>
              )}

              {s.memo && (
                <p className="text-gray-600 bg-gray-50 p-2 rounded border">
                  <span className="font-bold text-gray-700">メモ:</span> {s.memo}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
