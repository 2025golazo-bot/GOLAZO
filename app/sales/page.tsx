// app/sales/page.tsx
'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';

type SaleItem = {
  id: number;
  date: string;
  clientName: string;
  category: '月謝・コース' | '回数券' | '物販・プロテイン' | '体験料';
  amount: number;
  paymentMethod: 'Square決済' | '現金' | '銀行振込';
  staff: 'TAKA' | 'NANA';
  memo: string;
};

type TrialItem = {
  id: number;
  date: string;
  clientName: string;
  age: number;
  staff: 'TAKA' | 'NANA';
  hasPurchasedTicket: boolean;
  memo: string;
};

type CampaignItem = {
  id: number;
  title: string;
  appliedCount: number;
  contribution: number;
};

export default function SalesPage() {
  // 売上ダミーデータ
  const [sales, setSales] = useState<SaleItem[]>([
    {
      id: 1,
      date: '2026-10-05',
      clientName: '藤田 奈々 様',
      category: '月謝・コース',
      amount: 60000,
      paymentMethod: 'Square決済',
      staff: 'TAKA',
      memo: '10回券（共通）',
    },
    {
      id: 2,
      date: '2026-10-06',
      clientName: '佐藤 健太 様',
      category: '体験料',
      amount: 3000,
      paymentMethod: '現金',
      staff: 'NANA',
      memo: '初回体験トレーニング',
    },
    {
      id: 3,
      date: '2026-09-15',
      clientName: '鈴木 花子 様',
      category: '回数券',
      amount: 35000,
      paymentMethod: 'Square決済',
      staff: 'TAKA',
      memo: '5回券購入',
    },
  ]);

  // 体験者ダミーデータ
  const [trials, setTrials] = useState<TrialItem[]>([
    {
      id: 1,
      date: '2026-10-06',
      clientName: '佐藤 健太 様',
      age: 28,
      staff: 'NANA',
      hasPurchasedTicket: true,
      memo: '入会前向き、次回カウンセリング',
    },
    {
      id: 2,
      date: '2026-10-02',
      clientName: '高橋 莉子 様',
      age: 34,
      staff: 'TAKA',
      hasPurchasedTicket: false,
      memo: '他社と比較中',
    },
  ]);

  // キャンペーンデータ（議事録連携想定）
  const [campaigns] = useState<CampaignItem[]>([
    { id: 1, title: '秋の入会金無料＆ペア割キャンペーン', appliedCount: 4, contribution: 120000 },
    { id: 2, title: 'プロテインセット割', appliedCount: 12, contribution: 48000 },
  ]);

  // 目標売上（手動設定用 State）
  const [monthlyTarget, setMonthlyTarget] = useState<number>(1000000);
  const [yearlyTarget, setYearlyTarget] = useState<number>(12000000);
  const [isEditingTarget, setIsEditingTarget] = useState(false);

  // フィルター・表示期間の状態（過去の売上確認用）
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedMonth, setSelectedMonth] = useState<string>('10');
  
  // モーダル管理
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // 新規追加用フォーム State
  const [newSale, setNewSale] = useState({
    date: new Date().toISOString().split('T')[0],
    clientName: '',
    category: '月謝・コース' as const,
    amount: '',
    paymentMethod: 'Square決済' as const,
    staff: 'TAKA' as const,
    memo: '',
  });

  const [newTrial, setNewTrial] = useState({
    date: new Date().toISOString().split('T')[0],
    clientName: '',
    age: '',
    staff: 'TAKA' as const,
    hasPurchasedTicket: false,
    memo: '',
  });

  // --- 固定集計（本日・リアルタイム今月・年度） ---
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAmount = sales.filter((item) => item.date === todayStr).reduce((sum, item) => sum + item.amount, 0);

  const realCurrentYear = new Date().getFullYear().toString();
  const realCurrentMonth = (new Date().getMonth() + 1).toString();
  const realCurrentMonthSales = sales.filter((item) =>
    item.date.startsWith(`${realCurrentYear}-${realCurrentMonth.padStart(2, '0')}`)
  );
  const realCurrentMonthAmount = realCurrentMonthSales.reduce((sum, item) => sum + item.amount, 0);

  const realYearlySales = sales.filter((item) => item.date.startsWith(realCurrentYear));
  const realYearlyAmount = realYearlySales.reduce((sum, item) => sum + item.amount, 0);


  // --- 選択された年月（過去の売上など）に応じた連動集計 ---
  const selectedPeriodSales = sales.filter((item) =>
    item.date.startsWith(`${selectedYear}-${selectedMonth.padStart(2, '0')}`)
  );
  const selectedPeriodAmount = selectedPeriodSales.reduce((sum, item) => sum + item.amount, 0);

  const selectedYearSales = sales.filter((item) => item.date.startsWith(selectedYear));
  const selectedYearAmount = selectedYearSales.reduce((sum, item) => sum + item.amount, 0);

  // 選択された年月の体験者数・回数券販売数
  const selectedTrialCount = selectedPeriodSales.filter((item) => item.category === '体験料').length;
  const selectedTicketCount = selectedPeriodSales.filter((item) => item.category === '回数券').length;

  // 選択された年月の担当者別売上
  const takaMonthAmount = selectedPeriodSales.filter((item) => item.staff === 'TAKA').reduce((sum, item) => sum + item.amount, 0);
  const nanaMonthAmount = selectedPeriodSales.filter((item) => item.staff === 'NANA').reduce((sum, item) => sum + item.amount, 0);

  // 選択された「年度」の担当者別売上
  const takaYearAmount = selectedYearSales.filter((item) => item.staff === 'TAKA').reduce((sum, item) => sum + item.amount, 0);
  const nanaYearAmount = selectedYearSales.filter((item) => item.staff === 'NANA').reduce((sum, item) => sum + item.amount, 0);

  // 達成率計算（選択中の月をベースにする）
  const monthlyProgress = Math.min(Math.round((selectedPeriodAmount / (monthlyTarget || 1)) * 100), 100);

  // 一覧テーブル用フィルター
  const filteredSales = sales.filter((item) => {
    const matchesSearch = item.clientName.includes(searchTerm) || item.memo.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesPeriod = item.date.startsWith(`${selectedYear}-${selectedMonth.padStart(2, '0')}`);
    return matchesSearch && matchesCategory && matchesPeriod;
  });

  // 体験者一覧フィルター（選択中の月に一致するもの）
  const filteredTrials = trials.filter((item) => item.date.startsWith(`${selectedYear}-${selectedMonth.padStart(2, '0')}`));
  // 体験者コンバージョン率（回数券購入有無）
  const trialConversionRate = filteredTrials.length > 0 
    ? Math.round((filteredTrials.filter(t => t.hasPurchasedTicket).length / filteredTrials.length) * 100) 
    : 0;

  // 各種ハンドラー
  const handleMemoChange = (id: number, newMemo: string) => {
    setSales(sales.map((item) => (item.id === id ? { ...item, memo: newMemo } : item)));
  };

  const handleDeleteSale = (id: number) => {
    if (confirm('この売上データを削除してもよろしいですか？')) {
      setSales(sales.filter((item) => item.id !== id));
    }
  };

  const handleTrialMemoChange = (id: number, newMemo: string) => {
    setTrials(trials.map((item) => (item.id === id ? { ...item, memo: newMemo } : item)));
  };

  const handleToggleTrialTicket = (id: number) => {
    setTrials(trials.map((item) => (item.id === id ? { ...item, hasPurchasedTicket: !item.hasPurchasedTicket } : item)));
  };

  const handleDeleteTrial = (id: number) => {
    if (confirm('この体験者データを削除してもよろしいですか？')) {
      setTrials(trials.filter((item) => item.id !== id));
    }
  };

  const handleSquareSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      alert('Square APIとの手動同期が完了しました。最新データが反映されました。');
    }, 1200);
  };

  const handleAddSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSale.clientName || !newSale.amount) return;

    const saleToAdd: SaleItem = {
      id: Date.now(),
      date: newSale.date,
      clientName: newSale.clientName,
      category: newSale.category,
      amount: Number(newSale.amount),
      paymentMethod: newSale.paymentMethod,
      staff: newSale.staff,
      memo: newSale.memo,
    };

    setSales([saleToAdd, ...sales]);
    setNewSale({
      date: new Date().toISOString().split('T')[0],
      clientName: '',
      category: '月謝・コース',
      amount: '',
      paymentMethod: 'Square決済',
      staff: 'TAKA',
      memo: '',
    });
    setIsSaleModalOpen(false);
  };

  const handleAddTrial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrial.clientName) return;

    const trialToAdd: TrialItem = {
      id: Date.now(),
      date: newTrial.date,
      clientName: newTrial.clientName,
      age: Number(newTrial.age) || 0,
      staff: newTrial.staff,
      hasPurchasedTicket: newTrial.hasPurchasedTicket,
      memo: newTrial.memo,
    };

    setTrials([trialToAdd, ...trials]);
    setNewTrial({
      date: new Date().toISOString().split('T')[0],
      clientName: '',
      age: '',
      staff: 'TAKA',
      hasPurchasedTicket: false,
      memo: '',
    });
    setIsTrialModalOpen(false);
  };

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 font-sans pb-12">
      <Header />

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* トップタイトル & アクションボタン */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span>📊</span> 売上管理・Square連携ダッシュボード
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              ジムの売上、目標達成率、体験者コンバージョン、担当者別実績を一元管理します。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleSquareSync}
              disabled={isSyncing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isSyncing ? '⏳' : '🔄'}</span> {isSyncing ? '同期中...' : 'Square手動連携'}
            </button>
            <button
              onClick={() => setIsTrialModalOpen(true)}
              className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm flex items-center gap-2"
            >
              <span>＋</span> 体験者追加
            </button>
            <button
              onClick={() => setIsSaleModalOpen(true)}
              className="bg-[#5e9bc4] hover:bg-[#4d85ab] text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm flex items-center gap-2"
            >
              <span>＋</span> 売上手動追加
            </button>
          </div>
        </div>

        {/* 固定サマリー（本日・今月・年度） */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-1">
            <span className="text-xs font-semibold text-slate-400">本日の売上合計（固定）</span>
            <div className="text-2xl font-bold text-slate-800">¥{todayAmount.toLocaleString()}</div>
            <div className="text-xs text-slate-500 pt-1">本日の購入件数: {sales.filter(i => i.date === todayStr).length}件</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-1">
            <span className="text-xs font-semibold text-slate-400">今月の売上合計（固定・当月）</span>
            <div className="text-2xl font-bold text-[#5e9bc4]">¥{realCurrentMonthAmount.toLocaleString()}</div>
            <div className="text-xs text-slate-500 pt-1">当月購入件数: {realCurrentMonthSales.length}件</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-1">
            <span className="text-xs font-semibold text-slate-400">年度売上合計（固定・{realCurrentYear}年）</span>
            <div className="text-2xl font-bold text-slate-800">¥{realYearlyAmount.toLocaleString()}</div>
            <div className="text-xs text-slate-500 pt-1">年間目標: ¥{yearlyTarget.toLocaleString()}</div>
          </div>
        </div>

        {/* 期間選択フィルター（過去の売上・情報閲覧用） */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-600">📅 表示・比較する年月を選択:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl text-sm bg-white font-semibold"
            >
              <option value="2026">2026年</option>
              <option value="2025">2025年</option>
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl text-sm bg-white font-semibold"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={String(m)}>
                  {m}月
                </option>
              ))}
            </select>
          </div>
          <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            選択中表示：<span className="font-bold text-slate-700">{selectedYear}年{selectedMonth}月</span> の全データを分析中
          </div>
        </div>

        {/* 選択中年月の目標達成率プログレスバー */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                🎯 選択中月（{selectedYear}年{selectedMonth}月）の目標達成率
              </h3>
              <p className="text-xs text-slate-500">選択している月の売上と月間・年間目標の比較です。</p>
            </div>
            <button
              onClick={() => setIsEditingTarget(!isEditingTarget)}
              className="text-xs text-[#5e9bc4] hover:underline font-semibold"
            >
              {isEditingTarget ? '目標を保存' : '⚙️ 目標を手動変更'}
            </button>
          </div>

          {isEditingTarget && (
            <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="text-xs font-semibold text-slate-600">月間目標 (円):</label>
              <input
                type="number"
                value={monthlyTarget}
                onChange={(e) => setMonthlyTarget(Number(e.target.value))}
                className="px-3 py-1 border border-slate-200 rounded-lg text-sm bg-white"
              />
              <label className="text-xs font-semibold text-slate-600">年間目標 (円):</label>
              <input
                type="number"
                value={yearlyTarget}
                onChange={(e) => setYearlyTarget(Number(e.target.value))}
                className="px-3 py-1 border border-slate-200 rounded-lg text-sm bg-white"
              />
              <button
                onClick={() => setIsEditingTarget(false)}
                className="bg-[#5e9bc4] text-white px-3 py-1 rounded-lg text-xs font-semibold"
              >
                決定
              </button>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-bold text-slate-700">
                選択月売上: ¥{selectedPeriodAmount.toLocaleString()} / 月間目標: ¥{monthlyTarget.toLocaleString()}
              </span>
              <span className="font-bold text-[#5e9bc4]">{monthlyProgress}% 達成</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
              <div
                className="bg-[#5e9bc4] h-full rounded-full transition-all duration-500"
                style={{ width: `${monthlyProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* 担当者別売上（月・年） & 主要指標 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 担当者別売上（選択中の月・選択中の年） */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">👤 担当者別売上確認（TAKA / NANA）</h3>
            <div className="space-y-3">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">TAKA 担当</span>
                  <div className="text-xs text-slate-500 mt-1">{selectedMonth}月 / {selectedYear}年</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-800">月間: ¥{takaMonthAmount.toLocaleString()}</div>
                  <div className="text-xs text-slate-500">年間: ¥{takaYearAmount.toLocaleString()}</div>
                </div>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded">NANA 担当</span>
                  <div className="text-xs text-slate-500 mt-1">{selectedMonth}月 / {selectedYear}年</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-800">月間: ¥{nanaMonthAmount.toLocaleString()}</div>
                  <div className="text-xs text-slate-500">年間: ¥{nanaYearAmount.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 選択中年月の主要指標（体験者数・回数券販売数・年間売上） */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">🏷️ {selectedYear}年{selectedMonth}月の主要指標</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center space-y-1">
                <span className="text-xs font-semibold text-slate-500">体験者数</span>
                <div className="text-lg font-bold text-[#5e9bc4]">{selectedTrialCount} 名</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center space-y-1">
                <span className="text-xs font-semibold text-slate-500">回数券販売</span>
                <div className="text-lg font-bold text-[#5e9bc4]">{selectedTicketCount} 件</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center space-y-1">
                <span className="text-xs font-semibold text-slate-500">{selectedYear}年売上</span>
                <div className="text-sm font-bold text-slate-800 pt-1">¥{selectedYearAmount.toLocaleString()}</div>
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 flex justify-between items-center">
              <span>Square API 接続状況:</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 正常接続中
              </span>
            </div>
          </div>
        </div>

        {/* 体験者一覧セクション（体験日・名前・年齢・担当・回数券購入有無・備考の手動編集対応） */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden space-y-4">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-50">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span>🏃‍♂️</span> 体験者管理（{selectedYear}年{selectedMonth}月）
              </h3>
              <p className="text-xs text-slate-500">
                体験者のステータス・回数券購入有無（コンバージョン率: <span className="font-bold text-[#5e9bc4]">{trialConversionRate}%</span>）・備考欄を自由に編集できます。
              </p>
            </div>
            <button
              onClick={() => setIsTrialModalOpen(true)}
              className="bg-[#5e9bc4] hover:bg-[#4d85ab] text-white px-3 py-1.5 rounded-xl font-semibold text-xs transition shadow-sm"
            >
              ＋ 体験者追加
            </button>
          </div>

          <div className="overflow-x-auto p-4 pt-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="p-3">体験日</th>
                  <th className="p-3">体験者名</th>
                  <th className="p-3">年齢</th>
                  <th className="p-3">担当者</th>
                  <th className="p-3 text-center">回数券購入有無</th>
                  <th className="p-3">備考欄（編集可）</th>
                  <th className="p-3 text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredTrials.length > 0 ? (
                  filteredTrials.map((trial) => (
                    <tr key={trial.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 text-slate-600 text-xs font-medium">{trial.date}</td>
                      <td className="p-3 font-bold text-slate-800">{trial.clientName}</td>
                      <td className="p-3 text-xs text-slate-600">{trial.age}歳</td>
                      <td className="p-3 text-xs">
                        <span className={`px-2 py-0.5 rounded-md font-semibold ${trial.staff === 'TAKA' ? 'bg-sky-50 text-sky-700' : 'bg-pink-50 text-pink-700'}`}>
                          {trial.staff}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleToggleTrialTicket(trial.id)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition shadow-sm ${
                            trial.hasPurchasedTicket
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {trial.hasPurchasedTicket ? '✓ 購入済み' : '未購入'}
                        </button>
                      </td>
                      <td className="p-3 text-xs">
                        <input
                          type="text"
                          value={trial.memo}
                          onChange={(e) => handleTrialMemoChange(trial.id, e.target.value)}
                          placeholder="備考を入力..."
                          className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5e9bc4]"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDeleteTrial(trial.id)}
                          className="text-slate-400 hover:text-red-500 text-xs font-bold transition p-1"
                          title="削除"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400 text-sm">
                      該当する体験者データがありません。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* キャンペーン実績（議事録連携） */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span>🎉</span> キャンペーン効果測定（議事録連携データ）
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {campaigns.map((camp) => (
              <div key={camp.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <div className="text-sm font-bold text-slate-800">{camp.title}</div>
                  <div className="text-xs text-slate-500 mt-1">適用件数: <span className="font-semibold text-slate-700">{camp.appliedCount}件</span></div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-400">売上貢献額</span>
                  <div className="text-base font-bold text-[#5e9bc4]">¥{camp.contribution.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 売上データ一覧検索・カテゴリフィルター */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <input
            type="text"
            placeholder="顧客名やメモで検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-80 px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5e9bc4]/50"
          />
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['all', '月謝・コース', '回数券', '物販・プロテイン', '体験料'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? 'bg-[#5e9bc4] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? 'すべて' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* 売上データ一覧テーブル */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <span className="text-xs font-semibold text-slate-600">
              売上明細一覧（表示件数: <span className="text-[#5e9bc4] font-bold">{filteredSales.length}件</span>）
            </span>
            <span className="text-xs text-slate-400">※備考欄は直接編集可能です</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">購入日</th>
                  <th className="p-4">商品購入者名</th>
                  <th className="p-4">カテゴリ</th>
                  <th className="p-4">担当者</th>
                  <th className="p-4">金額</th>
                  <th className="p-4">決済方法</th>
                  <th className="p-4">備考欄（編集可）</th>
                  <th className="p-4 text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredSales.length > 0 ? (
                  filteredSales.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 text-slate-600 text-xs font-medium">{item.date}</td>
                      <td className="p-4 font-bold text-slate-800">{item.clientName}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-semibold text-slate-600">
                        <span className={`px-2 py-0.5 rounded-md ${item.staff === 'TAKA' ? 'bg-sky-50 text-sky-700' : 'bg-pink-50 text-pink-700'}`}>
                          {item.staff}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-800">¥{item.amount.toLocaleString()}</td>
                      <td className="p-4 text-xs text-slate-600">{item.paymentMethod}</td>
                      <td className="p-4 text-xs">
                        <input
                          type="text"
                          value={item.memo}
                          onChange={(e) => handleMemoChange(item.id, e.target.value)}
                          placeholder="メモを入力..."
                          className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5e9bc4]"
                        />
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleDeleteSale(item.id)}
                          className="text-slate-400 hover:text-red-500 text-xs font-bold transition p-1"
                          title="削除"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 text-sm">
                      該当する売上データが見つかりませんでした。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 売上手動追加モーダル */}
      {isSaleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-800">売上データの追加</h3>
              <button onClick={() => setIsSaleModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleAddSale} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">購入日</label>
                  <input
                    type="date"
                    required
                    value={newSale.date}
                    onChange={(e) => setNewSale({ ...newSale, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">商品購入者名 *</label>
                  <input
                    type="text"
                    required
                    placeholder="山田 太郎 様"
                    value={newSale.clientName}
                    onChange={(e) => setNewSale({ ...newSale, clientName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">カテゴリ</label>
                  <select
                    value={newSale.category}
                    onChange={(e: any) => setNewSale({ ...newSale, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                  >
                    <option value="月謝・コース">月謝・コース</option>
                    <option value="回数券">回数券</option>
                    <option value="物販・プロテイン">物販・プロテイン</option>
                    <option value="体験料">体験料</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">担当者</label>
                  <select
                    value={newSale.staff}
                    onChange={(e: any) => setNewSale({ ...newSale, staff: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                  >
                    <option value="TAKA">TAKA</option>
                    <option value="NANA">NANA</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">金額 (円) *</label>
                  <input
                    type="number"
                    required
                    placeholder="10000"
                    value={newSale.amount}
                    onChange={(e) => setNewSale({ ...newSale, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">決済方法</label>
                  <select
                    value={newSale.paymentMethod}
                    onChange={(e: any) => setNewSale({ ...newSale, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                  >
                    <option value="Square決済">Square決済</option>
                    <option value="現金">現金</option>
                    <option value="銀行振込">銀行振込</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">備考欄</label>
                <input
                  type="text"
                  placeholder="例: 10回券（共通）など"
                  value={newSale.memo}
                  onChange={(e) => setNewSale({ ...newSale, memo: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSaleModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-semibold"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#5e9bc4] hover:bg-[#4d85ab] text-white rounded-xl text-sm font-semibold"
                >
                  追加する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 体験者追加モーダル */}
      {isTrialModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-800">体験者データの追加</h3>
              <button onClick={() => setIsTrialModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleAddTrial} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">体験日</label>
                  <input
                    type="date"
                    required
                    value={newTrial.date}
                    onChange={(e) => setNewTrial({ ...newTrial, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">体験者名 *</label>
                  <input
                    type="text"
                    required
                    placeholder="山田 花子 様"
                    value={newTrial.clientName}
                    onChange={(e) => setNewTrial({ ...newTrial, clientName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">年齢</label>
                  <input
                    type="number"
                    placeholder="30"
                    value={newTrial.age}
                    onChange={(e) => setNewTrial({ ...newTrial, age: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">担当者</label>
                  <select
                    value={newTrial.staff}
                    onChange={(e: any) => setNewTrial({ ...newTrial, staff: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                  >
                    <option value="TAKA">TAKA</option>
                    <option value="NANA">NANA</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="ticketCheck"
                  checked={newTrial.hasPurchasedTicket}
                  onChange={(e) => setNewTrial({ ...newTrial, hasPurchasedTicket: e.target.checked })}
                  className="w-4 h-4 text-[#5e9bc4] border-slate-300 rounded focus:ring-[#5e9bc4]"
                />
                <label htmlFor="ticketCheck" className="text-xs font-semibold text-slate-700">
                  回数券・コースの購入あり（コンバージョン）
                </label>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">備考</label>
                <input
                  type="text"
                  placeholder="例: 入会前向きなど"
                  value={newTrial.memo}
                  onChange={(e) => setNewTrial({ ...newTrial, memo: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTrialModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-semibold"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#5e9bc4] hover:bg-[#4d85ab] text-white rounded-xl text-sm font-semibold"
                >
                  追加する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
