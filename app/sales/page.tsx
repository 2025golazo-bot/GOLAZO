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

type CampaignItem = {
  id: number;
  title: string;
  appliedCount: number;
  contribution: number;
};

export default function SalesPage() {
  // 初期ダミーデータ
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

  // キャンペーンデータ（議事録連携想定）
  const [campaigns] = useState<CampaignItem[]>([
    { id: 1, title: '秋の入会金無料＆ペア割キャンペーン', appliedCount: 4, contribution: 120000 },
    { id: 2, title: 'プロテインセット割', appliedCount: 12, contribution: 48000 },
  ]);

  // 目標売上（手動設定用 State）
  const [monthlyTarget, setMonthlyTarget] = useState<number>(1000000);
  const [yearlyTarget, setYearlyTarget] = useState<number>(12000000);
  const [isEditingTarget, setIsEditingTarget] = useState(false);

  // フィルター・表示期間の状態
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedMonth, setSelectedMonth] = useState<string>('10');
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  // 日付・キーワード・カテゴリで絞り込み
  const filteredSales = sales.filter((item) => {
    const matchesSearch = item.clientName.includes(searchTerm) || item.memo.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesPeriod =
      item.date.startsWith(`${selectedYear}-${selectedMonth.padStart(2, '0')}`);
    return matchesSearch && matchesCategory && matchesPeriod;
  });

  // 本日の売上計算
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAmount = sales
    .filter((item) => item.date === todayStr)
    .reduce((sum, item) => sum + item.amount, 0);

  // 今月の売上計算（現在選択されている月、または当月）
  const currentMonthSales = sales.filter((item) =>
    item.date.startsWith(`${selectedYear}-${selectedMonth.padStart(2, '0')}`)
  );
  const monthTotalAmount = currentMonthSales.reduce((sum, item) => sum + item.amount, 0);

  // 年度売上計算（選択された年の1月〜12月）
  const yearlyAmount = sales
    .filter((item) => item.date.startsWith(selectedYear))
    .reduce((sum, item) => sum + item.amount, 0);

  // 体験者数・回数券販売数のカウント（今月分）
  const trialCount = currentMonthSales.filter((item) => item.category === '体験料').length;
  const ticketCount = currentMonthSales.filter((item) => item.category === '回数券').length;

  // 担当者別売上（今月）
  const takaMonthAmount = currentMonthSales
    .filter((item) => item.staff === 'TAKA')
    .reduce((sum, item) => sum + item.amount, 0);
  const nanaMonthAmount = currentMonthSales
    .filter((item) => item.staff === 'NANA')
    .reduce((sum, item) => sum + item.amount, 0);

  // 達成率計算
  const monthlyProgress = Math.min(Math.round((monthTotalAmount / (monthlyTarget || 1)) * 100), 100);

  // メモのインライン編集ハンドラー
  const handleMemoChange = (id: number, newMemo: string) => {
    setSales(sales.map((item) => (item.id === id ? { ...item, memo: newMemo } : item)));
  };

  // 削除ハンドラー
  const handleDeleteSale = (id: number) => {
    if (confirm('この売上データを削除してもよろしいですか？')) {
      setSales(sales.filter((item) => item.id !== id));
    }
  };

  // 手動Square同期ハンドラー
  const handleSquareSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      alert('Square APIとの手動同期が完了しました。最新の決済データが反映されました。');
    }, 1200);
  };

  // 売上データ追加
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
    setIsModalOpen(false);
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
              ジムの売上データ、目標達成状況、キャンペーン貢献額、Square連携を一元管理します。
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleSquareSync}
              disabled={isSyncing}
              className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isSyncing ? '⏳' : '🔄'}</span> {isSyncing ? '同期中...' : 'Square手動連携'}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 sm:flex-none bg-[#5e9bc4] hover:bg-[#4d85ab] text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm flex items-center justify-center gap-2"
            >
              <span>＋</span> 売上手動追加
            </button>
          </div>
        </div>

        {/* 期間選択フィルター（過去の売上確認用） */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-600">表示年月を選択:</span>
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
          <div className="text-xs text-slate-500">
            選択中：<span className="font-bold text-slate-700">{selectedYear}年{selectedMonth}月</span> のデータを集計中
          </div>
        </div>

        {/* 本日 / 今月 / 年度の売上合計 & 目標プログレスバー */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-1">
            <span className="text-xs font-semibold text-slate-400">本日の売上合計</span>
            <div className="text-2xl font-bold text-slate-800">¥{todayAmount.toLocaleString()}</div>
            <div className="text-xs text-slate-500 pt-1">購入件数: {sales.filter(i => i.date === todayStr).length}件</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-1">
            <span className="text-xs font-semibold text-slate-400">今月の売上合計（{selectedMonth}月）</span>
            <div className="text-2xl font-bold text-[#5e9bc4]">¥{monthTotalAmount.toLocaleString()}</div>
            <div className="text-xs text-slate-500 pt-1">購入件数: {currentMonthSales.length}件</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-1">
            <span className="text-xs font-semibold text-slate-400">年度売上合計（{selectedYear}年）</span>
            <div className="text-2xl font-bold text-slate-800">¥{yearlyAmount.toLocaleString()}</div>
            <div className="text-xs text-slate-500 pt-1">年度目標: ¥{yearlyTarget.toLocaleString()}</div>
          </div>
        </div>

        {/* 目標売上 vs 現在の売上（プログレスバー） */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-800">今月（{selectedMonth}月）の目標達成率</h3>
              <p className="text-xs text-slate-500">目標売上に対する現在の達成状況です。</p>
            </div>
            <button
              onClick={() => setIsEditingTarget(!isEditingTarget)}
              className="text-xs text-[#5e9bc4] hover:underline font-semibold"
            >
              {isEditingTarget ? '目標を保存' : '⚙️ 目標を手動変更'}
            </button>
          </div>

          {isEditingTarget ? (
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
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
          ) : null}

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-bold text-slate-700">
                実績: ¥{monthTotalAmount.toLocaleString()} / 目標: ¥{monthlyTarget.toLocaleString()}
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

        {/* 担当者別売上 & 体験者数・回数券販売数 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 担当者別売上確認 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">👤 担当者別売上（今月）</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="text-xs font-semibold text-slate-500">TAKA 担当売上</span>
                <div className="text-xl font-bold text-slate-800">¥{takaMonthAmount.toLocaleString()}</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="text-xs font-semibold text-slate-500">NANA 担当売上</span>
                <div className="text-xl font-bold text-slate-800">¥{nanaMonthAmount.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* 体験者数・回数券販売数・決済連携状況 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">🏷️ 今月の主要指標</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center space-y-1">
                <span className="text-xs font-semibold text-slate-500">体験者数</span>
                <div className="text-lg font-bold text-[#5e9bc4]">{trialCount} 名</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center space-y-1">
                <span className="text-xs font-semibold text-slate-500">回数券販売</span>
                <div className="text-lg font-bold text-[#5e9bc4]">{ticketCount} 件</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center space-y-1">
                <span className="text-xs font-semibold text-slate-500">Square API</span>
                <div className="text-xs font-bold text-emerald-600 pt-1 flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 接続正常
                </div>
              </div>
            </div>
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

        {/* 検索・カテゴリフィルター */}
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

        {/* 売上データ一覧テーブル（備考欄編集・購入日・購入者表示対応） */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <span className="text-xs font-semibold text-slate-600">
              該当データ一覧（表示件数: <span className="text-[#5e9bc4] font-bold">{filteredSales.length}件</span>）
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
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-800">売上データの追加</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
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
                  onClick={() => setIsModalOpen(false)}
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
