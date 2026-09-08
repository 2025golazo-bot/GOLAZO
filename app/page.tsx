'use client';

import { useState, useEffect, useCallback } from 'react';

// --- 型定義 ---

interface Payment {
  id: string;
  created_at: string;
  amount_money?: { amount: number; currency: string };
  status: string;
  customer_id?: string;
  customer_name?: string;
  item_names?: string;
}

interface ProductSummary {
  name: string;
  count: number;
  totalSales: number;
}

interface TrialCustomer {
  id: string;
  name: string;
  age: string;
  trialDate: string;
  purchasedTicket: boolean;
  ticketType?: string;
}

interface Campaign {
  id: string;
  title: string;
  period: string;
  count: number;
  sales: number;
}

interface TicketProgress {
  id: string;
  customerName: string;
  ticketName: string;
  totalCount: number;
  usedCount: number;
}

// 測定データ型
interface MeasurementRecord {
  id: string;
  date: string;
  postureImages: string[];
  weight: number;
  bodyFat: number;
  muscleMass: number;
  testResultText: string;
  testImage?: string;
}

// セッション記録型
interface SessionRecord {
  id: string;
  date: string;
  content: string;
  homeworkText: string;
  homeworkImage?: string;
  memo: string;
}

// 顧客カルテ型
interface CustomerKarte {
  id: string;
  parentName: string;
  childName: string;
  birthDate: string;
  memo: string;
  firstSessionDate: string;
  nextReservationDate: string;
  concerns: string;
  goals: string;
  ticketTotal: number;
  ticketUsed: number;
  sessions: SessionRecord[];
  measurements: MeasurementRecord[];
}

export default function Home() {
  // タブ切り替え State ("sales": 売上管理, "karte": 顧客カルテ)
  const [activeTab, setActiveTab] = useState<'sales' | 'karte'>('sales');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);

  // ---------------- 売上管理 State ----------------
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);

  const [annualTarget, setAnnualTarget] = useState<number>(12000000);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [inputTarget, setInputTarget] = useState<string>('12000000');

  const [metrics, setMetrics] = useState({
    dailySales: 0,
    dailyCount: 0,
    monthlySales: 0,
    monthlyCount: 0,
    yearlySales: 0,
    yearlyCount: 0,
  });

  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [monthlyProducts, setMonthlyProducts] = useState<ProductSummary[]>([]);

  const [trialCustomers, setTrialCustomers] = useState<TrialCustomer[]>([
    { id: '1', name: '佐藤 陸', age: '11歳 (小5)', trialDate: '2026-09-02', purchasedTicket: true, ticketType: 'ジュニアコース4回券' },
    { id: '2', name: '田中 健太', age: '14歳 (中2)', trialDate: '2026-09-05', purchasedTicket: false },
  ]);
  const [newTrial, setNewTrial] = useState({ name: '', age: '', trialDate: '', purchasedTicket: false, ticketType: '' });

  const [campaigns, setCampaigns] = useState<Campaign[]>([
    { id: '1', title: '秋の体幹強化体験キャンペーン', period: '2026/09/01 - 09/30', count: 5, sales: 22000 },
    { id: '2', title: 'ご紹介割引特典', period: '通年', count: 3, sales: 36000 },
  ]);

  const [tickets, setTickets] = useState<TicketProgress[]>([
    { id: '1', customerName: '山田 太郎', ticketName: 'パーソナルトレーニング 8回券', totalCount: 8, usedCount: 5 },
    { id: '2', customerName: '佐藤 陸', ticketName: 'ジュニア4回券', totalCount: 4, usedCount: 2 },
  ]);

  // ---------------- 顧客カルテ State ----------------
  const [customers, setCustomers] = useState<CustomerKarte[]>([
    {
      id: 'SQUARE_CUST_001',
      parentName: '藤田 奈々',
      childName: '藤田 陸',
      birthDate: '2014-06-15',
      memo: 'サッカーJrユース所属。右足首の捻挫癖あり。',
      firstSessionDate: '2026-01-10',
      nextReservationDate: '2026-08-20',
      concerns: '切り返しの時に体幹がブレる',
      goals: 'アジリティ向上と軸づくり',
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
          testResultText: 'コアバランステスト: スコア78点',
          testImage: 'https://placehold.co/400x300/e2e8f0/475569?text=Test+Result',
        },
      ],
    },
  ]);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('SQUARE_CUST_001');
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

  // 目標金額の読み込み
  useEffect(() => {
    const savedTarget = localStorage.getItem('GOLAZO_ANNUAL_TARGET');
    if (savedTarget) {
      const parsed = Number(savedTarget);
      if (!isNaN(parsed) && parsed > 0) {
        setAnnualTarget(parsed);
        setInputTarget(savedTarget);
      }
    }
  }, []);

  const handleSaveTarget = () => {
    const newTarget = Number(inputTarget);
    if (!isNaN(newTarget) && newTarget > 0) {
      setAnnualTarget(newTarget);
      localStorage.setItem('GOLAZO_ANNUAL_TARGET', newTarget.toString());
      setIsEditingTarget(false);
    } else {
      alert('有効な数値を入力してください。');
    }
  };

  // Squareデータ同期
  const handleSync = useCallback(async () => {
    setLoading(true);
    setMessage('Square データを自動同期中...');

    try {
      const response = await fetch('/api/sync/square');
      const data = await response.json();

      if (data.success) {
        if (Array.isArray(data.payments)) {
          const sortedPayments = [...data.payments].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setAllPayments(sortedPayments);
        }

        if (Array.isArray(data.customers)) {
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
        }

        setMessage(`Square同期完了: 決済 ${data.summary?.fetchedPaymentsCount || 0} 件 / 顧客 ${data.summary?.fetchedCustomersCount || 0} 件`);
      } else {
        setMessage(`同期エラー: ${data.error || 'データ取得失敗'}`);
      }
    } catch (error) {
      console.error(error);
      setMessage('通信エラーが発生しました。');
    } finally {
      setLoading(false);
    }
  }, [customers]);

  useEffect(() => {
    handleSync();
  }, []);

  // 動的集計処理 (売上管理用)
  useEffect(() => {
    if (allPayments.length === 0) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const targetYearMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

    let daily = 0, dCount = 0;
    let monthly = 0, mCount = 0;
    let yearly = 0, yCount = 0;

    const monthlyList: Payment[] = [];
    const productMap: { [key: string]: { count: number; totalSales: number } } = {};

    allPayments.forEach((p) => {
      const createdAt = p.created_at;
      if (!createdAt) return;

      const amount = p.amount_money?.amount ? Number(p.amount_money.amount) : 0;
      const dateStr = createdAt.split('T')[0];
      const yearMonth = dateStr.substring(0, 7);
      const year = Number(dateStr.substring(0, 4));

      if (dateStr === todayStr) {
        daily += amount;
        dCount++;
      }
      if (yearMonth === targetYearMonth) {
        monthly += amount;
        mCount++;
        monthlyList.push(p);

        const itemName = p.item_names || '店頭決済・その他';
        if (!productMap[itemName]) {
          productMap[itemName] = { count: 0, totalSales: 0 };
        }
        productMap[itemName].count += 1;
        productMap[itemName].totalSales += amount;
      }
      if (year === selectedYear) {
        yearly += amount;
        yCount++;
      }
    });

    setMetrics({
      dailySales: daily,
      dailyCount: dCount,
      monthlySales: monthly,
      monthlyCount: mCount,
      yearlySales: yearly,
      yearlyCount: yCount,
    });

    setFilteredPayments(monthlyList);

    const productsList: ProductSummary[] = Object.keys(productMap)
      .map((name) => ({
        name,
        count: productMap[name].count,
        totalSales: productMap[name].totalSales,
      }))
      .sort((a, b) => b.totalSales - a.totalSales);

    setMonthlyProducts(productsList);
  }, [allPayments, selectedYear, selectedMonth]);

  // 体験者追加
  const handleAddTrial = () => {
    if (!newTrial.name || !newTrial.trialDate) return alert('名前と体験日を入力してください。');
    setTrialCustomers([
      ...trialCustomers,
      {
        id: Date.now().toString(),
        name: newTrial.name,
        age: newTrial.age || '未設定',
        trialDate: newTrial.trialDate,
        purchasedTicket: newTrial.purchasedTicket,
        ticketType: newTrial.ticketType,
      },
    ]);
    setNewTrial({ name: '', age: '', trialDate: '', purchasedTicket: false, ticketType: '' });
  };

  // 回数券消化
  const handleUseTicket = (id: string) => {
    setTickets(
      tickets.map((t) => (t.id === id && t.usedCount < t.totalCount ? { ...t, usedCount: t.usedCount + 1 } : t))
    );
  };

  // 顧客カルテ補助関数
  const calculateAge = (birthDateStr: string): string => {
    if (!birthDateStr) return '未設定';
    const birth = new Date(birthDateStr);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
    return `${age}歳`;
  };

  const getFollowUpStatus = (nextResDateStr: string) => {
    if (!nextResDateStr) return { label: '次回未予約', color: 'bg-gray-100 text-gray-600' };
    const nextDate = new Date(nextResDateStr);
    const diffDays = Math.floor((new Date().getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays >= 30) return { label: `🚨 1ヶ月以上空いています (${diffDays}日経過・要連絡)`, color: 'bg-red-100 text-red-800 font-bold border border-red-300' };
    if (diffDays >= 14) return { label: `⚠️ 2週間以上空いています (${diffDays}日経過・要フォロー)`, color: 'bg-amber-100 text-amber-800 font-bold border border-amber-300' };
    return { label: `次回予約: ${nextResDateStr}`, color: 'bg-green-100 text-green-800 font-semibold' };
  };

  const getMeasurementStatus = (measurements: MeasurementRecord[]) => {
    if (!measurements || measurements.length === 0) return { isDue: true, label: '🔔 初回計測未実施' };
    const latest = measurements[measurements.length - 1];
    const lastDate = new Date(latest.date);
    const today = new Date();
    const monthDiff = (today.getFullYear() - lastDate.getFullYear()) * 12 + (today.getMonth() - lastDate.getMonth());

    if (monthDiff >= 3) return { isDue: true, label: `🔔 前回の計測から3ヶ月経過しています (最終: ${latest.date})` };
    const nextDate = new Date(lastDate);
    nextDate.setMonth(nextDate.getMonth() + 3);
    return { isDue: false, label: `次回計測予定月: ${nextDate.getFullYear()}年${nextDate.getMonth() + 1}月` };
  };

  const currentCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  const handleAddSession = () => {
    if (!newSession.content) return alert('セッション内容を入力してください。');
    setCustomers(
      customers.map((cust) =>
        cust.id === currentCustomer.id
          ? {
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
            }
          : cust
      )
    );
    setNewSession({ content: '', homeworkText: '', homeworkImage: '', memo: '' });
  };

  const handleAddMeasurement = () => {
    if (!newMeasurement.weight) return alert('体重を入力してください。');
    setCustomers(
      customers.map((cust) =>
        cust.id === currentCustomer.id
          ? {
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
            }
          : cust
      )
    );
    setNewMeasurement({ weight: '', bodyFat: '', muscleMass: '', testResultText: '', postureImg1: '', postureImg2: '', postureImg3: '', testImage: '' });
  };

  const achievementRate = annualTarget > 0 ? Math.min(Math.round((metrics.yearlySales / annualTarget) * 100), 100) : 0;
  const followStatus = getFollowUpStatus(currentCustomer?.nextReservationDate);
  const measurementStatus = getMeasurementStatus(currentCustomer?.measurements);

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen">
      {/* メインヘッダー ＆ タブ切り替え */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900">GOLAZO 統合管理ダッシュボード</h1>
          <p className="text-xs text-gray-500 mt-1">Squareデータ自動同期対応システム</p>
        </div>

        <div className="flex items-center gap-3">
          {/* タブ切り替えボタン */}
          <div className="bg-gray-100 p-1 rounded-xl flex">
            <button
              onClick={() => setActiveTab('sales')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'sales' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              📊 売上管理
            </button>
            <button
              onClick={() => setActiveTab('karte')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'karte' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              📋 顧客カルテ
            </button>
          </div>

          <button
            onClick={handleSync}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 disabled:bg-gray-400 shadow-sm transition"
          >
            {loading ? '同期中...' : 'Squareデータを再同期'}
          </button>
        </div>
      </div>

      {message && <p className="text-xs text-blue-700 bg-blue-50 p-3 rounded-lg border border-blue-200">{message}</p>}

      {/* ---------------- タブ1: 売上管理 ---------------- */}
      {activeTab === 'sales' && (
        <div className="space-y-8">
          {/* 期間選択 */}
          <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <span className="text-sm font-semibold text-gray-700">表示対象期間:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>{y} 年</option>
              ))}
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>{m} 月</option>
              ))}
            </select>
          </div>

          {/* 売上指標カード */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <p className="text-sm font-medium text-gray-500">本日の売上（日報）</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">¥{metrics.dailySales.toLocaleString()}</h3>
              <p className="text-xs text-gray-500 mt-1">件数: {metrics.dailyCount} 件</p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <p className="text-sm font-medium text-gray-500">{selectedYear}年{selectedMonth}月の売上</p>
              <h3 className="text-2xl font-bold text-blue-600 mt-2">¥{metrics.monthlySales.toLocaleString()}</h3>
              <p className="text-xs text-gray-500 mt-1">件数: {metrics.monthlyCount} 件</p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <p className="text-sm font-medium text-gray-500">{selectedYear}年度 累計売上</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">¥{metrics.yearlySales.toLocaleString()}</h3>
              <p className="text-xs text-gray-500 mt-1">件数: {metrics.yearlyCount} 件</p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">{selectedYear}年 目標達成率</p>
                {!isEditingTarget && (
                  <button onClick={() => setIsEditingTarget(true)} className="text-xs text-blue-600 hover:underline">
                    目標変更
                  </button>
                )}
              </div>
              <h3 className="text-2xl font-bold text-green-600 mt-2">{achievementRate}%</h3>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${achievementRate}%` }}></div>
              </div>
              <div className="mt-3 text-xs">
                {isEditingTarget ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      value={inputTarget}
                      onChange={(e) => setInputTarget(e.target.value)}
                      className="w-28 px-2 py-1 text-xs border rounded border-gray-300"
                    />
                    <button onClick={handleSaveTarget} className="px-2 py-1 text-white bg-green-600 rounded text-xs">保存</button>
                  </div>
                ) : (
                  <p className="text-gray-400">目標: ¥{annualTarget.toLocaleString()}</p>
                )}
              </div>
            </div>
          </div>

          {/* 体験者管理 ＆ 回数券消化進捗 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 体験者管理 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h2 className="text-lg font-bold text-gray-900">体験者管理</h2>
                <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-semibold">
                  全 {trialCustomers.length} 名
                </span>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                <p className="text-xs font-bold text-gray-700">新規体験者の追加</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="お名前"
                    value={newTrial.name}
                    onChange={(e) => setNewTrial({ ...newTrial, name: e.target.value })}
                    className="p-2 border rounded border-gray-300 bg-white"
                  />
                  <input
                    type="text"
                    placeholder="年齢・学年 (例: 10歳/小4)"
                    value={newTrial.age}
                    onChange={(e) => setNewTrial({ ...newTrial, age: e.target.value })}
                    className="p-2 border rounded border-gray-300 bg-white"
                  />
                  <input
                    type="date"
                    value={newTrial.trialDate}
                    onChange={(e) => setNewTrial({ ...newTrial, trialDate: e.target.value })}
                    className="p-2 border rounded border-gray-300 bg-white"
                  />
                  <select
                    value={newTrial.purchasedTicket ? 'true' : 'false'}
                    onChange={(e) => setNewTrial({ ...newTrial, purchasedTicket: e.target.value === 'true' })}
                    className="p-2 border rounded border-gray-300 bg-white"
                  >
                    <option value="false">回数券未購入</option>
                    <option value="true">回数券購入済み</option>
                  </select>
                </div>
                <button
                  onClick={handleAddTrial}
                  className="w-full py-1.5 bg-gray-800 text-white rounded text-xs font-semibold hover:bg-gray-900"
                >
                  体験者を登録
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-100 uppercase text-gray-500 font-semibold">
                    <tr>
                      <th className="p-2.5">名前</th>
                      <th className="p-2.5">年齢 / 学年</th>
                      <th className="p-2.5">体験日</th>
                      <th className="p-2.5">回数券購入</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {trialCustomers.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="p-2.5 font-bold text-gray-900">{t.name}</td>
                        <td className="p-2.5">{t.age}</td>
                        <td className="p-2.5">{t.trialDate}</td>
                        <td className="p-2.5">
                          {t.purchasedTicket ? (
                            <span className="px-2 py-0.5 text-xs font-bold bg-green-100 text-green-800 rounded-full">
                              購入済み
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">未購入</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 回数券の消化進捗 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h2 className="text-lg font-bold text-gray-900">回数券の消化進捗</h2>
                <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-semibold">
                  進行中 {tickets.length} 件
                </span>
              </div>

              <div className="space-y-4">
                {tickets.map((t) => {
                  const percentage = Math.round((t.usedCount / t.totalCount) * 100);
                  const isFinished = t.usedCount >= t.totalCount;

                  return (
                    <div key={t.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{t.customerName}</p>
                          <p className="text-xs text-gray-500">{t.ticketName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm text-gray-800">
                            {t.usedCount} / {t.totalCount} 回
                          </p>
                          <span className="text-xs text-gray-400">({percentage}%)</span>
                        </div>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all ${isFinished ? 'bg-red-500' : 'bg-blue-600'}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-between items-center pt-1">
                        {isFinished ? (
                          <span className="text-xs text-red-600 font-bold">消化完了（次回更新のご案内）</span>
                        ) : (
                          <span className="text-xs text-gray-500">残り {t.totalCount - t.usedCount} 回</span>
                        )}
                        <button
                          onClick={() => handleUseTicket(t.id)}
                          disabled={isFinished}
                          className="px-2.5 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:bg-gray-300"
                        >
                          1回分消化
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* キャンペーンの内容と実績 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-3">キャンペーンの内容と実績</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campaigns.map((c) => (
                <div key={c.id} className="p-4 border rounded-xl bg-gradient-to-r from-blue-50/50 to-white space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900">{c.title}</h3>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded font-medium">{c.period}</span>
                  </div>
                  <div className="flex justify-between items-end pt-2">
                    <div>
                      <p className="text-xs text-gray-500">適用件数</p>
                      <p className="text-lg font-bold text-gray-800">{c.count} 件</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">売上貢献額</p>
                      <p className="text-lg font-bold text-blue-600">¥{c.sales.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 販売商品内訳 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">{selectedYear}年{selectedMonth}月に販売された商品内訳</h2>
            {monthlyProducts.length === 0 ? (
              <p className="text-sm text-gray-400">データがありません。</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {monthlyProducts.map((prod, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{prod.name}</p>
                      <p className="text-xs text-gray-500">{prod.count} 件販売</p>
                    </div>
                    <p className="font-bold text-blue-600 text-sm">¥{prod.totalSales.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------- タブ2: 顧客カルテ ---------------- */}
      {activeTab === 'karte' && (
        <div className="space-y-8">
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

          {/* 1. 顧客基本情報 */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 gap-3">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black text-gray-900">{currentCustomer.childName} 選手</h2>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                    年齢: {calculateAge(currentCustomer.birthDate)}（生年月日: {currentCustomer.birthDate}）
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">保護者様: {currentCustomer.parentName} 様 / 初回体験日: {currentCustomer.firstSessionDate || '未登録'}</p>
              </div>

              <span className={`px-3.5 py-1.5 rounded-xl text-xs font-bold ${followStatus.color}`}>
                {followStatus.label}
              </span>
            </div>

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
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs">
              <span className="font-bold text-gray-700">【メモ・既往歴】: </span>
              <span className="text-gray-600">{currentCustomer.memo || 'なし'}</span>
            </div>
          </div>

          {/* 2. 測定詳細 ＆ 3ヶ月周期計測アラート */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-xl font-bold text-gray-900">測定詳細・変化比較</h2>
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${measurementStatus.isDue ? 'bg-red-500 text-white animate-pulse' : 'bg-green-100 text-green-800'}`}>
                {measurementStatus.label}
              </span>
            </div>

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
                placeholder="姿勢写真URL正面・側面・背面"
                value={newMeasurement.postureImg1}
                onChange={(e) => setNewMeasurement({ ...newMeasurement, postureImg1: e.target.value })}
                className="w-full p-2 border rounded-lg bg-white"
              />
              <input
                type="text"
                placeholder="テスト結果メモ"
                value={newMeasurement.testResultText}
                onChange={(e) => setNewMeasurement({ ...newMeasurement, testResultText: e.target.value })}
                className="w-full p-2 border rounded-lg bg-white"
              />
              <button onClick={handleAddMeasurement} className="px-4 py-2 bg-gray-900 text-white rounded-lg font-bold">
                測定記録を保存
              </button>
            </div>

            <div className="space-y-6">
              {currentCustomer.measurements.map((m, idx) => (
                <div key={m.id} className="p-5 border rounded-xl bg-gray-50/50 space-y-4">
                  <p className="font-black text-sm text-gray-900">① 測定日: {m.date}</p>
                  <div>
                    <p className="text-xs font-bold text-gray-700 mb-2">② 姿勢チェック（写真3枚）</p>
                    <div className="grid grid-cols-3 gap-3">
                      {m.postureImages.map((imgUrl, i) => (
                        <div key={i} className="aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden border">
                          <img src={imgUrl} alt="姿勢" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-700 mb-2">③ 体組成（体重・体脂肪率・筋肉量）</p>
                    <div className="grid grid-cols-3 gap-3 text-center text-xs">
                      <div className="p-2 bg-white border rounded">体重: <b>{m.weight} kg</b></div>
                      <div className="p-2 bg-white border rounded">体脂肪率: <b>{m.bodyFat} %</b></div>
                      <div className="p-2 bg-white border rounded">筋肉量: <b>{m.muscleMass} kg</b></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-700 mb-1">④ テスト結果</p>
                    <p className="text-xs text-gray-800 bg-white p-2.5 rounded-lg border">{m.testResultText}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. セッション記録 */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-4">セッション記録 ＆ 宿題</h2>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3 text-xs">
              <input
                type="text"
                placeholder="セッション内容"
                value={newSession.content}
                onChange={(e) => setNewSession({ ...newSession, content: e.target.value })}
                className="w-full p-2 border rounded-lg bg-white"
              />
              <input
                type="text"
                placeholder="宿題内容"
                value={newSession.homeworkText}
                onChange={(e) => setNewSession({ ...newSession, homeworkText: e.target.value })}
                className="w-full p-2 border rounded-lg bg-white"
              />
              <button onClick={handleAddSession} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold">
                セッションを記録
              </button>
            </div>

            <div className="space-y-4">
              {currentCustomer.sessions.map((s) => (
                <div key={s.id} className="p-4 border rounded-xl bg-white shadow-sm space-y-2 text-xs">
                  <p className="font-bold text-gray-500">日時: {s.date}</p>
                  <p className="text-sm font-bold text-gray-900">セッション内容: {s.content}</p>
                  {s.homeworkText && <p className="text-blue-900 bg-blue-50 p-2 rounded">【宿題】: {s.homeworkText}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
