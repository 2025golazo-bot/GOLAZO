'use client';

import React, { useState, useMemo } from 'react';

// --- 型定義 ---
interface SaleRecord {
  id: string;
  date: string; // YYYY-MM-DD
  time: string;
  customerName: string; // 購入者名（保護者名等）
  studentName?: string; // 対象受講生名
  productName: string; // 商品名（10回券、単発等）
  amount: number;
  staff: 'TAKA' | 'NANA';
  campaignName?: string; // 適用キャンペーン
  squarePaymentId: string;
}

interface TrialClient {
  id: string;
  date: string;
  name: string;
  age: number;
  staff: 'TAKA' | 'NANA';
  converted: boolean; // 回数券購入有無
  productPurchased?: string;
}

interface CampaignSummary {
  id: string;
  name: string;
  note: string; // 議事録メモ連携
}

interface MemberTicketStatus {
  id: string;
  parentName: string;
  studentName: string;
  totalPurchased: number;
  remaining: number;
}

export default function SalesPage() {
  // --- 目標金額（手入力・状態管理） ---
  const [monthlyTarget, setMonthlyTarget] = useState<number>(1000000); // 今月目標 (例: 100万円)
  const [yearlyTarget, setYearlyTarget] = useState<number>(12000000); // 今年度目標 (例: 1,200万円)

  // --- 期間指定フィルター（何日〜何日） ---
  const todayStr = '2026-10-05'; // デモ用本日日付
  const [startDate, setStartDate] = useState<string>('2026-10-01');
  const [endDate, setEndDate] = useState<string>('2026-10-31');

  // --- 過去売上表示用の選択 ---
  const [selectedArchiveYear, setSelectedArchiveYear] = useState<string>('2026');
  const [selectedArchiveMonth, setSelectedArchiveMonth] = useState<string>('10');

  // --- Square自動連携売上データ (サンプル) ---
  const [salesHistory] = useState<SaleRecord[]>([
    { id: 's-1', date: '2026-10-05', time: '10:30', customerName: '藤田 奈々', studentName: '藤田 陸', productName: '10回券 (共通)', amount: 60000, staff: 'TAKA', campaignName: '秋の体験入会CP', squarePaymentId: 'sq_pay_998811' },
    { id: 's-2', date: '2026-10-05', time: '14:00', customerName: '山田 太郎', studentName: '山田 花', productName: '5回券', amount: 32000, staff: 'NANA', squarePaymentId: 'sq_pay_772200' },
    { id: 's-3', date: '2026-10-02', time: '16:15', customerName: '佐藤 健', studentName: '佐藤 翔', productName: '単発パーソナル', amount: 7500, staff: 'TAKA', squarePaymentId: 'sq_pay_554433' },
    { id: 's-4', date: '2026-09-28', time: '11:00', customerName: '高橋 恵', studentName: '高橋 蓮', productName: '10回券 (共通)', amount: 60000, staff: 'NANA', campaignName: '秋の体験入会CP', squarePaymentId: 'sq_pay_112233' },
    { id: 's-5', date: '2026-09-15', time: '15:30', customerName: '鈴木 一郎', studentName: '鈴木 拓海', productName: '5回券', amount: 32000, staff: 'TAKA', squarePaymentId: 'sq_pay_445566' },
  ]);

  // --- 体験者データ ---
  const [trialClients] = useState<TrialClient[]>([
    { id: 't-1', date: '2026-10-04', name: '渡辺 颯太', age: 10, staff: 'TAKA', converted: true, productPurchased: '10回券' },
    { id: 't-2', date: '2026-10-02', name: '伊藤 結衣', age: 7, staff: 'NANA', converted: false },
    { id: 't-3', date: '2026-09-25', name: '小林 蒼空', age: 11, staff: 'TAKA', converted: true, productPurchased: '5回券' },
    { id: 't-4', date: '2026-09-18', name: '加藤 陽菜', age: 9, staff: 'NANA', converted: true, productPurchased: '10回券' },
  ]);

  // --- 議事録連携キャンペーン情報 ---
  const [campaigns] = useState<CampaignSummary[]>([
    { id: 'c-1', name: '秋の体験入会CP', note: '体験当日入会で10回券 5,000円引き＋評価シート無料プレゼント' },
    { id: 'c-2', name: '兄弟・家族紹介CP', note: 'ご紹介者様・ご新規様ともに1チケット進呈' }
  ]);

  // --- 会員別 回数券保有・消化状況 ---
  const [memberTickets] = useState<MemberTicketStatus[]>([
    { id: 'm-1', parentName: '藤田 奈々', studentName: '藤田 陸 / 翔', totalPurchased: 20, remaining: 8 },
    { id: 'm-2', parentName: '山田 太郎', studentName: '山田 花', totalPurchased: 10, remaining: 3 },
    { id: 'm-3', parentName: '高橋 恵', studentName: '高橋 蓮', totalPurchased: 10, remaining: 7 },
    { id: 'm-4', parentName: '鈴木 一郎', studentName: '鈴木 拓海', totalPurchased: 5, remaining: 1 },
  ]);

  // --- 集計ヘルパー関数 (担当者別内訳算出) ---
  const calcStaffBreakdown = (records: SaleRecord[]) => {
    let taka = 0;
    let nana = 0;
    records.forEach(s => {
      if (s.staff === 'TAKA') taka += s.amount;
      if (s.staff === 'NANA') nana += s.amount;
    });
    const total = taka + nana;
    return {
      taka,
      nana,
      takaRate: total > 0 ? ((taka / total) * 100).toFixed(0) : '0',
      nanaRate: total > 0 ? ((nana / total) * 100).toFixed(0) : '0',
    };
  };

  // --- 各領域の集計 ---

  // 1. 本日売上
  const todaySalesRecords = useMemo(() => salesHistory.filter(s => s.date === todayStr), [salesHistory, todayStr]);
  const todaySales = useMemo(() => todaySalesRecords.reduce((sum, s) => sum + s.amount, 0), [todaySalesRecords]);

  // 2. 今月売上 (2026年10月固定計算) & 担当者別
  const currentMonthSalesRecords = useMemo(() => salesHistory.filter(s => s.date.startsWith('2026-10')), [salesHistory]);
  const currentMonthSales = useMemo(() => currentMonthSalesRecords.reduce((sum, s) => sum + s.amount, 0), [currentMonthSalesRecords]);
  const currentMonthStaff = useMemo(() => calcStaffBreakdown(currentMonthSalesRecords), [currentMonthSalesRecords]);

  // 3. 今年度売上 (2026年度: 2026-04 〜 2027-03) & 担当者別
  const currentYearSalesRecords = useMemo(() => salesHistory.filter(s => s.date >= '2026-04-01' && s.date <= '2027-03-31'), [salesHistory]);
  const currentYearSales = useMemo(() => currentYearSalesRecords.reduce((sum, s) => sum + s.amount, 0), [currentYearSalesRecords]);
  const currentYearStaff = useMemo(() => calcStaffBreakdown(currentYearSalesRecords), [currentYearSalesRecords]);

  // 今月回数券販売数 & 体験者数
  const monthlyTicketCount = useMemo(() => currentMonthSalesRecords.filter(s => s.productName.includes('回券')).length, [currentMonthSalesRecords]);
  const monthlyTrialCount = useMemo(() => trialClients.filter(t => t.date.startsWith('2026-10')).length, [trialClients]);

  // 4. 期間指定フィルター（設定期間）での集計 & 担当者別
  const filteredSalesByDate = useMemo(() => {
    return salesHistory.filter(s => s.date >= startDate && s.date <= endDate);
  }, [salesHistory, startDate, endDate]);

  const filteredTotalAmount = useMemo(() => {
    return filteredSalesByDate.reduce((sum, s) => sum + s.amount, 0);
  }, [filteredSalesByDate]);

  const filteredStaffSummary = useMemo(() => calcStaffBreakdown(filteredSalesByDate), [filteredSalesByDate]);

  // 商品別カウント（件数 & 金額）
  const productSummary = useMemo(() => {
    const map: { [key: string]: { count: number; total: number } } = {};
    filteredSalesByDate.forEach(s => {
      if (!map[s.productName]) {
        map[s.productName] = { count: 0, total: 0 };
      }
      map[s.productName].count += 1;
      map[s.productName].total += s.amount;
    });
    return map;
  }, [filteredSalesByDate]);

  // 5. 体験者コンバージョン（成約）率計算
  const trialConversionStats = useMemo(() => {
    const total = trialClients.length;
    const converted = trialClients.filter(t => t.converted).length;
    const rate = total > 0 ? ((converted / total) * 100).toFixed(1) : '0';
    return { total, converted, rate };
  }, [trialClients]);

  // 6. 全体回数券消化率
  const ticketOverallStats = useMemo(() => {
    const totalPurchased = memberTickets.reduce((sum, m) => sum + m.totalPurchased, 0);
    const totalRemaining = memberTickets.reduce((sum, m) => sum + m.remaining, 0);
    const totalUsed = totalPurchased - totalRemaining;
    const usedRate = totalPurchased > 0 ? ((totalUsed / totalPurchased) * 100).toFixed(1) : '0';
    return { totalPurchased, totalRemaining, totalUsed, usedRate };
  }, [memberTickets]);

  // 7. 過去アーカイブ売上（選択された年月） & 担当者別
  const archiveSalesRecords = useMemo(() => {
    const prefix = `${selectedArchiveYear}-${selectedArchiveMonth.padStart(2, '0')}`;
    return salesHistory.filter(s => s.date.startsWith(prefix));
  }, [salesHistory, selectedArchiveYear, selectedArchiveMonth]);

  const archiveSales = useMemo(() => archiveSalesRecords.reduce((sum, s) => sum + s.amount, 0), [archiveSalesRecords]);
  const archiveStaffSummary = useMemo(() => calcStaffBreakdown(archiveSalesRecords), [archiveSalesRecords]);

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800">
      {/* ヘッダー */}
      <header className="bg-[#5e9bc4] text-white px-6 py-3 flex justify-between items-center shadow">
        <h1 className="text-xl font-bold tracking-wider">パーソナルジム GOLAZO 管理システム</h1>
        <nav className="flex gap-4 text-xs font-semibold">
          <span className="bg-white text-[#5e9bc4] px-3 py-1 rounded shadow-sm font-bold">売上管理</span>
          <span className="opacity-80 cursor-pointer hover:opacity-100">顧客カルテ</span>
          <span className="opacity-80 cursor-pointer hover:opacity-100">タスク・議事録</span>
        </nav>
      </header>

      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* 上部ステータスバー: Square同期状態 & 目標設定エリア */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Square API 自動連携中 (最終同期: 本日 10:30)
            </span>
            <span className="text-xs text-slate-400">※Squareで決済された売上データがリアルタイム反映されます</span>
          </div>

          {/* 目標金額 手入力フォーム */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <label className="font-bold text-slate-600">🎯 今月目標:</label>
              <input
                type="number"
                step="10000"
                value={monthlyTarget}
                onChange={e => setMonthlyTarget(Number(e.target.value))}
                className="w-28 border border-slate-300 rounded px-2 py-1 font-bold text-right text-slate-700"
              />
              <span className="text-slate-500">円</span>
            </div>
            <div className="flex items-center gap-1.5">
              <label className="font-bold text-slate-600">🏆 今年度目標:</label>
              <input
                type="number"
                step="100000"
                value={yearlyTarget}
                onChange={e => setYearlyTarget(Number(e.target.value))}
                className="w-32 border border-slate-300 rounded px-2 py-1 font-bold text-right text-slate-700"
              />
              <span className="text-slate-500">円</span>
            </div>
          </div>
        </div>

        {/* 1. 売上サマリー & 目標達成プログレスバー (担当者毎内訳付き) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* 本日売上 */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Today's Sales</span>
            <div className="flex justify-between items-baseline">
              <h2 className="text-3xl font-extrabold text-slate-800">¥{todaySales.toLocaleString()}</h2>
              <span className="text-xs font-bold text-slate-500">{todayStr}</span>
            </div>
            <p className="text-[11px] text-slate-400">Square決済完了件数: {todaySalesRecords.length} 件</p>
          </div>

          {/* 今月売上 (月別) & 担当者毎売上 */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-[#5e9bc4] uppercase tracking-wider">Monthly Progress (今月)</span>
              <span className="text-xs font-bold bg-sky-100 text-[#5e9bc4] px-2 py-0.5 rounded">
                達成率: {((currentMonthSales / (monthlyTarget || 1)) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <h2 className="text-3xl font-extrabold text-[#5e9bc4]">¥{currentMonthSales.toLocaleString()}</h2>
              <span className="text-xs text-slate-400">/ ¥{monthlyTarget.toLocaleString()}</span>
            </div>
            {/* プログレスバー */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#5e9bc4] h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (currentMonthSales / (monthlyTarget || 1)) * 100)}%` }}
              ></div>
            </div>

            {/* 担当者毎売上（今月） */}
            <div className="bg-sky-50/60 p-2.5 rounded border border-sky-100 text-xs space-y-1 mt-2">
              <span className="font-bold text-slate-600 block text-[11px]">👤 今月の担当者別売上</span>
              <div className="flex justify-between text-slate-700 font-semibold">
                <span className="text-sky-800">TAKA: ¥{currentMonthStaff.taka.toLocaleString()} <span className="text-[10px] text-slate-400">({currentMonthStaff.takaRate}%)</span></span>
                <span className="text-pink-800">NANA: ¥{currentMonthStaff.nana.toLocaleString()} <span className="text-[10px] text-slate-400">({currentMonthStaff.nanaRate}%)</span></span>
              </div>
            </div>

            <div className="flex justify-between text-[11px] text-slate-500 pt-1">
              <span>🎟️ 回数券販売: <strong>{monthlyTicketCount}</strong> 件</span>
              <span>👟 体験者数: <strong>{monthlyTrialCount}</strong> 名</span>
            </div>
          </div>

          {/* 今年度売上 (年度) & 担当者毎売上 */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Annual Progress (今年度)</span>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                達成率: {((currentYearSales / (yearlyTarget || 1)) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <h2 className="text-3xl font-extrabold text-emerald-800">¥{currentYearSales.toLocaleString()}</h2>
              <span className="text-xs text-slate-400">/ ¥{yearlyTarget.toLocaleString()}</span>
            </div>
            {/* プログレスバー */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (currentYearSales / (yearlyTarget || 1)) * 100)}%` }}
              ></div>
            </div>

            {/* 担当者毎売上（今年度） */}
            <div className="bg-emerald-50/60 p-2.5 rounded border border-emerald-100 text-xs space-y-1 mt-2">
              <span className="font-bold text-slate-600 block text-[11px]">👤 今年度の担当者別売上</span>
              <div className="flex justify-between text-slate-700 font-semibold">
                <span className="text-sky-800">TAKA: ¥{currentYearStaff.taka.toLocaleString()} <span className="text-[10px] text-slate-400">({currentYearStaff.takaRate}%)</span></span>
                <span className="text-pink-800">NANA: ¥{currentYearStaff.nana.toLocaleString()} <span className="text-[10px] text-slate-400">({currentYearStaff.nanaRate}%)</span></span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">2026年度 累計実績 (4月〜翌3月)</p>
          </div>

        </div>

        {/* 2. 任意設定期間フィルター（何日〜何日）& 担当者毎売上 & 販売商品内訳 */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">📅 設定期間 売上 & 担当者毎分析</h3>
              <p className="text-[11px] text-slate-400">指定した期間内の売上合計・担当者毎の内訳・商品別販売件数を集計します</p>
            </div>

            {/* 期間選択カレンダー */}
            <div className="flex items-center gap-2 text-xs bg-slate-50 p-2 rounded border border-slate-200">
              <span className="font-bold text-slate-600">設定期間:</span>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="border border-slate-300 rounded p-1 font-semibold text-slate-700 bg-white"
              />
              <span className="text-slate-400">〜</span>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="border border-slate-300 rounded p-1 font-semibold text-slate-700 bg-white"
              />
            </div>
          </div>

          {/* 指定期間のサマリー ＆ 担当者毎売上カード */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* 設定期間内の売上合計 & 担当者毎売上（グラフィカル表示） */}
            <div className="bg-sky-50/50 p-4 rounded-lg border border-sky-100 space-y-3">
              <span className="text-xs font-bold text-slate-500 block">設定期間内の売上合計</span>
              <p className="text-2xl font-extrabold text-[#5e9bc4]">¥{filteredTotalAmount.toLocaleString()}</p>

              {/* 担当者毎売上カード */}
              <div className="border-t border-sky-200 pt-2 space-y-2 text-xs">
                <span className="font-bold text-slate-700 block">👨‍🏫 担当者毎売上 (設定期間内)</span>
                
                {/* TAKA */}
                <div className="space-y-0.5">
                  <div className="flex justify-between items-center text-slate-700 font-bold">
                    <span className="text-sky-800">TAKA</span>
                    <span>¥{filteredStaffSummary.taka.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">({filteredStaffSummary.takaRate}%)</span></span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-sky-500 h-1.5" style={{ width: `${filteredStaffSummary.takaRate}%` }}></div>
                  </div>
                </div>

                {/* NANA */}
                <div className="space-y-0.5 pt-1">
                  <div className="flex justify-between items-center text-slate-700 font-bold">
                    <span className="text-pink-800">NANA</span>
                    <span>¥{filteredStaffSummary.nana.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">({filteredStaffSummary.nanaRate}%)</span></span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-pink-400 h-1.5" style={{ width: `${filteredStaffSummary.nanaRate}%` }}></div>
                  </div>
                </div>

              </div>
            </div>

            {/* 購入商品の件数サマリー */}
            <div className="md:col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-600 block">🛍️ 設定期間内の商品別 販売件数・内訳</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.keys(productSummary).length > 0 ? (
                  Object.entries(productSummary).map(([pName, data]) => (
                    <div key={pName} className="bg-white p-2.5 rounded border border-slate-200 shadow-sm text-xs">
                      <span className="font-bold text-slate-800 block truncate">{pName}</span>
                      <div className="flex justify-between items-baseline mt-1">
                        <span className="text-sm font-extrabold text-[#5e9bc4]">{data.count} <span className="text-[10px] font-normal">件</span></span>
                        <span className="text-[11px] text-slate-500">¥{data.total.toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 col-span-3 py-2">該当期間の購入商品はありません</p>
                )}
              </div>
            </div>
          </div>

          {/* 期間内の購入者明細テーブル */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-slate-700">🧾 購入日・商品購入者 明細一覧 ({filteredSalesByDate.length}件)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-600 border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50 text-slate-500 font-bold">
                    <th className="py-2.5 px-3">購入日時</th>
                    <th className="py-2.5 px-3">購入者名 (保護者)</th>
                    <th className="py-2.5 px-3">受講生名</th>
                    <th className="py-2.5 px-3">購入商品</th>
                    <th className="py-2.5 px-3">金額</th>
                    <th className="py-2.5 px-3">担当</th>
                    <th className="py-2.5 px-3">適用キャンペーン</th>
                    <th className="py-2.5 px-3">Square決済ID</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSalesByDate.length > 0 ? (
                    filteredSalesByDate.map(sale => (
                      <tr key={sale.id} className="border-b hover:bg-slate-50 transition">
                        <td className="py-2.5 px-3 font-semibold">{sale.date} <span className="text-slate-400 text-[10px]">{sale.time}</span></td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{sale.customerName} 様</td>
                        <td className="py-2.5 px-3 text-slate-600">{sale.studentName || '-'}</td>
                        <td className="py-2.5 px-3 font-bold text-[#5e9bc4]">{sale.productName}</td>
                        <td className="py-2.5 px-3 font-extrabold text-slate-800">¥{sale.amount.toLocaleString()}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded font-bold ${sale.staff === 'TAKA' ? 'bg-sky-100 text-sky-800' : 'bg-pink-100 text-pink-800'}`}>
                            {sale.staff}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          {sale.campaignName ? (
                            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold text-[10px]">
                              🏷️ {sale.campaignName}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">{sale.squarePaymentId}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-400">選択された期間内の売上データはありません</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 3. 中段グリッド: キャンペーン効果 & 体験者管理 (コンバージョン率) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* 左：キャンペーン効果・連動（議事録連携） */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
            <div className="border-b pb-2 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">📣 キャンペーン効果 & 売上貢献度</h3>
                <p className="text-[11px] text-slate-400">議事録で設定したキャンペーンの適用状況</p>
              </div>
              <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold">議事録連動中</span>
            </div>

            <div className="space-y-3">
              {campaigns.map(cp => {
                const appliedSales = salesHistory.filter(s => s.campaignName === cp.name);
                const appliedCount = appliedSales.length;
                const totalContribution = appliedSales.reduce((sum, s) => sum + s.amount, 0);

                return (
                  <div key={cp.id} className="p-3 bg-amber-50/50 rounded-lg border border-amber-200 space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-amber-900 text-sm">🏷️ {cp.name}</span>
                      <span className="bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded text-[11px]">
                        売上貢献: ¥{totalContribution.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] bg-white p-2 rounded border border-amber-100">{cp.note}</p>
                    <div className="text-right text-slate-500 font-bold">
                      適用件数: <span className="text-amber-800 text-sm">{appliedCount}</span> 件
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 右：体験者管理 & 回数券購入率（コンバージョン集計） */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
            <div className="border-b pb-2 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">👟 体験者一覧 & 入会成約率 (CVR)</h3>
                <p className="text-[11px] text-slate-400">体験レッスンから回数券購入への転換率</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-bold">体験成約率 (CVR)</span>
                <span className="text-base font-extrabold text-[#5e9bc4]">{trialConversionStats.rate}%</span>
              </div>
            </div>

            <div className="space-y-2">
              <table className="w-full text-xs text-left text-slate-600 border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50 text-slate-500">
                    <th className="py-2 px-2">体験日</th>
                    <th className="py-2 px-2">体験者名</th>
                    <th className="py-2 px-2">年齢</th>
                    <th className="py-2 px-2">担当</th>
                    <th className="py-2 px-2">回数券購入</th>
                  </tr>
                </thead>
                <tbody>
                  {trialClients.map(tc => (
                    <tr key={tc.id} className="border-b">
                      <td className="py-2 px-2 font-semibold">{tc.date}</td>
                      <td className="py-2 px-2 font-bold text-slate-800">{tc.name} 様</td>
                      <td className="py-2 px-2">{tc.age} 歳</td>
                      <td className="py-2 px-2 font-bold text-slate-600">{tc.staff}</td>
                      <td className="py-2 px-2">
                        {tc.converted ? (
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                            ✅ 成約 ({tc.productPurchased})
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-400 px-2 py-0.5 rounded font-bold">
                            未購入
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* 4. 下部：回数券消化進捗 & 過去売上アーカイブ (担当者毎内訳付き) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* 回数券消化進捗 (2カラム分) */}
          <div className="md:col-span-2 bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
            <div className="border-b pb-2 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">🎫 会員別 回数券消化進捗 & 全体消化率</h3>
                <p className="text-[11px] text-slate-400">会員ごとの残りチケット数と全体の消費スピード</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-bold">全体消化率</span>
                <span className="text-base font-extrabold text-emerald-700">{ticketOverallStats.usedRate}%</span>
              </div>
            </div>

            {/* 全体プログレスバー */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>発行累計: {ticketOverallStats.totalPurchased} 回</span>
                <span>消化済み: {ticketOverallStats.totalUsed} 回 / 残り: {ticketOverallStats.totalRemaining} 回</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${ticketOverallStats.usedRate}%` }}></div>
              </div>
            </div>

            {/* 会員別残り回数テーブル */}
            <table className="w-full text-xs text-left text-slate-600 border-collapse">
              <thead>
                <tr className="border-b bg-slate-50 text-slate-500 font-bold">
                  <th className="py-2 px-2">保護者名</th>
                  <th className="py-2 px-2">受講生（お子様）</th>
                  <th className="py-2 px-2">累計購入回数</th>
                  <th className="py-2 px-2">残り回数</th>
                  <th className="py-2 px-2">ステータス</th>
                </tr>
              </thead>
              <tbody>
                {memberTickets.map(m => (
                  <tr key={m.id} className="border-b">
                    <td className="py-2 px-2 font-bold text-slate-800">{m.parentName} 様</td>
                    <td className="py-2 px-2">{m.studentName}</td>
                    <td className="py-2 px-2 font-bold text-slate-600">{m.totalPurchased} 回</td>
                    <td className="py-2 px-2 font-extrabold text-[#5e9bc4]">{m.remaining} 回</td>
                    <td className="py-2 px-2">
                      {m.remaining <= 2 ? (
                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold text-[10px]">
                          ⚠️ 次回追加提案対象
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold text-[10px]">
                          正常
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 過去の売上（月・年）アーカイブ閲覧 & 担当者毎売上 */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
            <div className="border-b pb-2">
              <h3 className="font-bold text-slate-800 text-sm">📁 過去売上アーカイブ (担当者毎)</h3>
              <p className="text-[11px] text-slate-400">年月を選択して過去実績・担当者内訳を照会</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-1 font-bold">年</label>
                  <select
                    value={selectedArchiveYear}
                    onChange={e => setSelectedArchiveYear(e.target.value)}
                    className="w-full border border-slate-300 rounded p-1.5 font-bold text-[#5e9bc4]"
                  >
                    <option value="2026">2026年</option>
                    <option value="2025">2025年</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-bold">月</label>
                  <select
                    value={selectedArchiveMonth}
                    onChange={e => setSelectedArchiveMonth(e.target.value)}
                    className="w-full border border-slate-300 rounded p-1.5 font-bold text-[#5e9bc4]"
                  >
                    {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => (
                      <option key={m} value={m}>{parseInt(m, 10)}月</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 選択した年月の合計売上 & 担当者毎売上 */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                <div className="text-center">
                  <span className="text-[11px] font-bold text-slate-500 block">
                    {selectedArchiveYear}年 {parseInt(selectedArchiveMonth, 10)}月 実績売上
                  </span>
                  <p className="text-2xl font-extrabold text-slate-800">
                    ¥{archiveSales.toLocaleString()}
                  </p>
                </div>

                <div className="border-t border-slate-200 pt-2 space-y-1">
                  <span className="font-bold text-slate-600 block text-[10px]">👤 担当者毎売上</span>
                  <div className="flex justify-between font-bold text-[11px]">
                    <span className="text-sky-800">TAKA: ¥{archiveStaffSummary.taka.toLocaleString()}</span>
                    <span className="text-pink-800">NANA: ¥{archiveStaffSummary.nana.toLocaleString()}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
