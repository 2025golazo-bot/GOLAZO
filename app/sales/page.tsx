// app/sales/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/Header';

type SaleItem = {
  id: number;
  date: string;
  clientName: string;
  category: '月謝・コース' | '回数券' | '物販・プロテイン' | '体験料';
  amount: number;
  paymentMethod: 'Square決済' | '現金' | '銀行振込';
  staff: 'TAKA' | 'NANA' | '未設定';
  memo: string;
  source?: 'manual' | 'square';
  squareOrderId?: string;
  squarePaymentId?: string;

  productName?: string;
  productNames?: string[];
  squareCatalogObjectIds?: string[];
};

type TrialItem = {
  id: number;
  date: string;
  clientName: string;
  age: number;
  staff: 'TAKA' | 'NANA';
  hasPurchasedTicket: boolean;
  memo: string;
  productName?: string;
  productNames?: string[];
  squareCatalogObjectIds?: string[];
  source?: 'manual' | 'square';
  squareOrderId?: string;
  squarePaymentId?: string;
};

type CampaignItem = {
  id: number;
  yearMonth: string;
  title: string;
  appliedCount: number;
  contribution: number;
  targetCount: number;
  targetSales: number;
};

const normalizeSquareSale = (item: any): SaleItem => ({
  id: Number(item.id),
  date: String(item.date),
  clientName: String(item.clientName || 'Square取引'),
  category: item.category as SaleItem['category'],
  amount: Number(item.amount) || 0,
  paymentMethod: 'Square決済',
  staff: (item.staff || '未設定') as SaleItem['staff'],
  memo: String(item.memo || ''),
  source: 'square',
  squareOrderId: item.squareOrderId ? String(item.squareOrderId) : undefined,
  squarePaymentId: item.squarePaymentId ? String(item.squarePaymentId) : undefined,
});

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
      source: 'manual',
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
      source: 'manual',
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
      source: 'manual',
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

  // キャンペーンデータ（今月と比較月を並べて確認するため年月を保持）
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([
    { id: 1, yearMonth: '2026-09', title: '秋の入会金無料＆ペア割キャンペーン', appliedCount: 4, contribution: 120000, targetCount: 10, targetSales: 300000 },
    { id: 2, yearMonth: '2026-09', title: 'プロテインセット割', appliedCount: 12, contribution: 48000, targetCount: 20, targetSales: 80000 },
    { id: 3, yearMonth: '2025-09', title: '秋の入会キャンペーン', appliedCount: 3, contribution: 90000, targetCount: 8, targetSales: 200000 },
    { id: 4, yearMonth: '2025-09', title: 'プロテインセット割', appliedCount: 8, contribution: 32000, targetCount: 15, targetSales: 60000 },
  ]);

  // 目標売上（手動設定用 State）
  const [monthlyTarget, setMonthlyTarget] = useState<string>('1000000');
  const [yearlyTarget, setYearlyTarget] = useState<string>('12000000');
  const [currentMonthlyTarget, setCurrentMonthlyTarget] = useState<string>('0');
  const [currentYearlyTarget, setCurrentYearlyTarget] = useState<string>('0');
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [isSavingTarget, setIsSavingTarget] = useState(false);
  const [isTrialsLoaded, setIsTrialsLoaded] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  // フィルター・表示期間の状態（過去の売上確認用）
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedMonth, setSelectedMonth] = useState<string>('10');
  
  // 選択中の年月と「現在」の年月の目標をSupabaseから読み込みます。
  useEffect(() => {
    const loadTargets = async () => {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      const [selectedResult, currentResult] = await Promise.all([
        supabase
          .from('sales_targets')
          .select('monthly_target, yearly_target')
          .eq('target_year', Number(selectedYear))
          .eq('target_month', Number(selectedMonth))
          .maybeSingle(),
        supabase
          .from('sales_targets')
          .select('monthly_target, yearly_target')
          .eq('target_year', currentYear)
          .eq('target_month', currentMonth)
          .maybeSingle(),
      ]);

      if (selectedResult.error) {
        console.warn('比較年月の売上目標の読み込みに失敗しました:', selectedResult.error.message);
      } else if (selectedResult.data) {
        setMonthlyTarget(String(selectedResult.data.monthly_target ?? 0));
        setYearlyTarget(String(selectedResult.data.yearly_target ?? 0));
      } else {
        setMonthlyTarget('0');
        setYearlyTarget('0');
      }

      if (currentResult.error) {
        console.warn('現在年月の売上目標の読み込みに失敗しました:', currentResult.error.message);
      } else if (currentResult.data) {
        setCurrentMonthlyTarget(String(currentResult.data.monthly_target ?? 0));
        setCurrentYearlyTarget(String(currentResult.data.yearly_target ?? 0));
      } else {
        setCurrentMonthlyTarget('0');
        setCurrentYearlyTarget('0');
      }
    };

    loadTargets();
  }, [supabase, selectedYear, selectedMonth]);

  const handleSaveTargets = async () => {
    const monthly = monthlyTarget === '' ? 0 : Number(monthlyTarget);
    const yearly = yearlyTarget === '' ? 0 : Number(yearlyTarget);

    if (!Number.isFinite(monthly) || !Number.isFinite(yearly) || monthly < 0 || yearly < 0) {
      alert('目標金額は0円以上の数値で入力してください。');
      return;
    }

    setIsSavingTarget(true);

    const { error } = await supabase
      .from('sales_targets')
      .upsert(
        {
          target_year: Number(selectedYear),
          target_month: Number(selectedMonth),
          monthly_target: monthly,
          yearly_target: yearly,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'target_year,target_month' }
      );

    setIsSavingTarget(false);

    if (error) {
      console.error('売上目標保存エラー:', error);
      alert(`売上目標の保存に失敗しました。\n${error.message}`);
      return;
    }

    setMonthlyTarget(String(monthly));
    setYearlyTarget(String(yearly));
    setIsEditingTarget(false);
    alert(`${selectedYear}年${selectedMonth}月の売上目標を保存しました。`);
  };

  // 手動登録データはSquare連携前のため、ブラウザに保存して再読み込み後も維持します。
  useEffect(() => {
    try {
      const savedSales = JSON.parse(localStorage.getItem('golazo_sales_items') || 'null');
      const savedTrials = JSON.parse(localStorage.getItem('golazo_trial_items') || 'null');

      if (Array.isArray(savedSales)) {
        setSales(savedSales.map((item) => ({ ...item, source: item.source || 'manual' })));
      }
      if (Array.isArray(savedTrials)) {
        setTrials(savedTrials);
      }
    } catch (error) {
      console.warn('手動登録データの読み込みに失敗しました:', error);
    }
  }, []);

  useEffect(() => {
    try {
      const savedCampaigns = JSON.parse(localStorage.getItem('golazo_campaign_items') || 'null');
      if (Array.isArray(savedCampaigns)) setCampaigns(savedCampaigns);
    } catch (error) {
      console.warn('保存済みキャンペーンの読み込みに失敗しました:', error);
    }
  }, []);

  // 備考欄は現在Square連携前のローカル管理データのため、
  // 編集内容だけをブラウザに保存して再読み込み後も維持します。
  useEffect(() => {
    try {
      const savedSalesMemos = JSON.parse(localStorage.getItem('golazo_sales_memos') || '{}');
      const savedTrialMemos = JSON.parse(localStorage.getItem('golazo_trial_memos') || '{}');

      if (savedSalesMemos && typeof savedSalesMemos === 'object') {
        setSales((current) =>
          current.map((item) =>
            Object.prototype.hasOwnProperty.call(savedSalesMemos, String(item.id))
              ? { ...item, memo: String(savedSalesMemos[String(item.id)]) }
              : item
          )
        );
      }

      if (savedTrialMemos && typeof savedTrialMemos === 'object') {
        setTrials((current) =>
          current.map((item) =>
            Object.prototype.hasOwnProperty.call(savedTrialMemos, String(item.id))
              ? { ...item, memo: String(savedTrialMemos[String(item.id)]) }
              : item
          )
        );
      }
    } catch (error) {
      console.warn('保存済み備考の読み込みに失敗しました:', error);
    }
  }, []);

  // 体験者データもブラウザに保存し、再読み込み後も維持します。
  useEffect(() => {
    try {
      const savedTrials = JSON.parse(localStorage.getItem('golazo_trials') || 'null');
      if (Array.isArray(savedTrials)) {
        setTrials(savedTrials);
      }
    } catch (error) {
      console.warn('体験者データの読み込みに失敗しました:', error);
    } finally {
      setIsTrialsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isTrialsLoaded) return;
    try {
      localStorage.setItem('golazo_trials', JSON.stringify(trials));
    } catch (error) {
      console.warn('体験者データの保存に失敗しました:', error);
    }
  }, [trials, isTrialsLoaded]);

  // モーダル管理
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<number | null>(null);
  const [campaignForm, setCampaignForm] = useState({ yearMonth: '', title: '', appliedCount: '', contribution: '', targetCount: '', targetSales: '' });
  const [editingSaleId, setEditingSaleId] = useState<number | null>(null);
  const [editingTrialId, setEditingTrialId] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // 新規追加用フォーム State
  const [newSale, setNewSale] = useState({
    date: new Date().toISOString().split('T')[0],
    clientName: '',
    category: '月謝・コース' as SaleItem['category'],
    amount: '',
    paymentMethod: 'Square決済' as SaleItem['paymentMethod'],
    staff: 'TAKA' as SaleItem['staff'],
    memo: '',
  });

  const [newTrial, setNewTrial] = useState({
    date: new Date().toISOString().split('T')[0],
    clientName: '',
    age: '',
    staff: 'TAKA' as TrialItem['staff'],
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

  // 達成率計算（選択月と選択年を完全に分離）
  const monthlyTargetNumber = Number(monthlyTarget) || 0;
  const yearlyTargetNumber = Number(yearlyTarget) || 0;
  const monthlyProgress = monthlyTargetNumber > 0
    ? Math.round((selectedPeriodAmount / monthlyTargetNumber) * 100)
    : 0;
  const yearlyProgress = yearlyTargetNumber > 0
    ? Math.round((selectedYearAmount / yearlyTargetNumber) * 100)
    : 0;

  const currentMonthlyTargetNumber = Number(currentMonthlyTarget) || 0;
  const currentYearlyTargetNumber = Number(currentYearlyTarget) || 0;
  const currentMonthlyProgress = currentMonthlyTargetNumber > 0
    ? Math.round((realCurrentMonthAmount / currentMonthlyTargetNumber) * 100)
    : 0;
  const currentYearlyProgress = currentYearlyTargetNumber > 0
    ? Math.round((realYearlyAmount / currentYearlyTargetNumber) * 100)
    : 0;

  const buildProductSummary = (items: SaleItem[]) => {
    const summary: Record<string, { count: number; category: SaleItem['category'] }> = {};

    items.forEach((item) => {
      const names = item.productNames?.length
        ? item.productNames
        : (item.productName
            ? [item.productName]
            : (item.source === 'square' && item.memo.trim()
                ? item.memo.split(' / ').map((name) => name.trim()).filter(Boolean)
                : [item.category]));

      names.forEach((name) => {
        const productName = String(name || '').trim();
        if (!productName) return;
        if (!summary[productName]) {
          summary[productName] = { count: 0, category: item.category };
        }
        summary[productName].count += 1;
      });
    });

    return summary;
  };

  const selectedProductSummary = buildProductSummary(selectedPeriodSales);
  const currentProductSummary = buildProductSummary(realCurrentMonthSales);
  const productSummaryNames = Array.from(
    new Set([...Object.keys(currentProductSummary), ...Object.keys(selectedProductSummary)]),
  ).sort((a, b) => a.localeCompare(b, 'ja'));

  const countProductNames = (items: SaleItem[]) => items.reduce<Record<string, number>>((acc, item) => {
    const names = item.productNames?.length
      ? item.productNames
      : item.productName
        ? [item.productName]
        : (item.source === 'square' && item.memo.trim()
          ? item.memo.split(' / ').map((name) => name.trim()).filter(Boolean)
          : []);
    for (const name of names) { const key = name.trim(); if (key) acc[key] = (acc[key] || 0) + 1; }
    return acc;
  }, {});
  const selectedProductNameSummary = countProductNames(selectedPeriodSales);
  const currentProductNameSummary = countProductNames(realCurrentMonthSales);
  const productComparisonNames = Array.from(new Set([...Object.keys(currentProductNameSummary), ...Object.keys(selectedProductNameSummary)])).sort((a, b) => a.localeCompare(b, 'ja'));


  const currentCampaigns = campaigns.filter((camp) => camp.yearMonth === `${realCurrentYear}-${realCurrentMonth.padStart(2, '0')}`);
  const selectedCampaigns = campaigns.filter((camp) => camp.yearMonth === `${selectedYear}-${selectedMonth.padStart(2, '0')}`);

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
    setSales((current) => {
      const next = current.map((item) =>
        item.id === id ? { ...item, memo: newMemo } : item
      );

      try {
        localStorage.setItem('golazo_sales_items', JSON.stringify(next));
      } catch (error) {
        console.warn('売上データの保存に失敗しました:', error);
      }

      return next;
    });

    try {
      const saved = JSON.parse(localStorage.getItem('golazo_sales_memos') || '{}');
      saved[String(id)] = newMemo;
      localStorage.setItem('golazo_sales_memos', JSON.stringify(saved));
    } catch (error) {
      console.warn('売上備考の保存に失敗しました:', error);
    }
  };

  const handleDeleteSale = (id: number) => {
    if (confirm('この売上データを削除してもよろしいですか？')) {
      setSales((current) => {
      const next = current.filter((item) => item.id !== id);
      localStorage.setItem('golazo_sales_items', JSON.stringify(next));
      return next;
    });
    }
  };

  const handleTrialMemoChange = (id: number, newMemo: string) => {
    setTrials((current) => current.map((item) => (item.id === id ? { ...item, memo: newMemo } : item)));
    try {
      const saved = JSON.parse(localStorage.getItem('golazo_trial_memos') || '{}');
      saved[String(id)] = newMemo;
      localStorage.setItem('golazo_trial_memos', JSON.stringify(saved));
    } catch (error) {
      console.warn('体験者備考の保存に失敗しました:', error);
    }
  };

  const handleToggleTrialTicket = (id: number) => {
    setTrials((current) => {
      const next = current.map((item) => (item.id === id ? { ...item, hasPurchasedTicket: !item.hasPurchasedTicket } : item));
      localStorage.setItem('golazo_trial_items', JSON.stringify(next));
      return next;
    });
  };

  const handleDeleteTrial = (id: number) => {
    if (confirm('この体験者データを削除してもよろしいですか？')) {
      setTrials((current) => {
        const next = current.filter((item) => item.id !== id);
        localStorage.setItem('golazo_trial_items', JSON.stringify(next));
        return next;
      });
    }
  };

  const openCampaignEditor = (campaign: CampaignItem) => {
    setEditingCampaignId(campaign.id);
    setCampaignForm({
      yearMonth: campaign.yearMonth,
      title: campaign.title,
      appliedCount: String(campaign.appliedCount),
      contribution: String(campaign.contribution),
      targetCount: String(campaign.targetCount),
      targetSales: String(campaign.targetSales),
    });
    setIsCampaignModalOpen(true);
  };

  const openNewCampaign = (yearMonth: string) => {
    setEditingCampaignId(null);
    setCampaignForm({ yearMonth, title: '', appliedCount: '0', contribution: '0', targetCount: '0', targetSales: '0' });
    setIsCampaignModalOpen(true);
  };

  const handleSaveCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignForm.title.trim()) return;
    const item: CampaignItem = {
      id: editingCampaignId ?? Date.now(),
      yearMonth: campaignForm.yearMonth,
      title: campaignForm.title.trim(),
      appliedCount: Number(campaignForm.appliedCount) || 0,
      contribution: Number(campaignForm.contribution) || 0,
      targetCount: Number(campaignForm.targetCount) || 0,
      targetSales: Number(campaignForm.targetSales) || 0,
    };
    setCampaigns((current) => {
      const next = editingCampaignId
        ? current.map((campaign) => campaign.id === editingCampaignId ? item : campaign)
        : [item, ...current];
      localStorage.setItem('golazo_campaign_items', JSON.stringify(next));
      return next;
    });
    setIsCampaignModalOpen(false);
  };

  const handleSquareSync = async () => {
    setIsSyncing(true);
    try {
      const currentYear = new Date().getFullYear();
      const selectedYearNumber = Number(selectedYear);
      const startYear = Math.min(currentYear, selectedYearNumber);
      const endYear = Math.max(currentYear, selectedYearNumber);
      const startDate = `${startYear}-01-01`;
      const endDate = `${endYear}-12-31`;

      const response = await fetch('/api/sync/square-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Square同期に失敗しました。');
      }

      const squareSales = Array.isArray(data.sales) ? data.sales.map(normalizeSquareSale) : [];

      let savedMemos: Record<string, string> = {};
      try {
        const parsed = JSON.parse(localStorage.getItem('golazo_sales_memos') || '{}');
        if (parsed && typeof parsed === 'object') savedMemos = parsed;
      } catch (error) {
        console.warn('保存済み売上備考の読み込みに失敗しました:', error);
      }

      const squareSalesWithMemos = squareSales.map((item: SaleItem) =>
        Object.prototype.hasOwnProperty.call(savedMemos, String(item.id))
          ? { ...item, memo: String(savedMemos[String(item.id)]) }
          : item
      );

      setSales((current) => {
        const manualSales = current.filter((item) => item.source !== 'square');
        const next = [...squareSalesWithMemos, ...manualSales];
        localStorage.setItem('golazo_sales_items', JSON.stringify(next));
        return next;
      });

      alert(
        data.source === 'db-only'
          ? `保存済みSquare売上を${squareSales.length}件表示しました。`
          : `Squareから新規・更新分を確認し、保存済み売上${squareSales.length}件を表示しました。`
      );
    } catch (error) {
      console.error('Square売上同期エラー:', error);
      alert(`Square同期に失敗しました。\n${error instanceof Error ? error.message : '通信エラー'}`);
    } finally {
      setIsSyncing(false);
    }
  };;;

  // ページ表示時にSquareから最新売上を自動同期します。
  useEffect(() => {
    void handleSquareSync();
    // 初回表示時のみ実行
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openSaleEditor = (sale: SaleItem) => {
    setEditingSaleId(sale.id);
    setNewSale({
      date: sale.date,
      clientName: sale.clientName,
      category: sale.category,
      amount: String(sale.amount),
      paymentMethod: sale.paymentMethod,
      staff: sale.staff,
      memo: sale.memo,
    });
    setIsSaleModalOpen(true);
  };

  const handleAddSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSale.clientName || !newSale.amount) return;

    setSales((current) => {
      const saleToSave: SaleItem = {
        id: editingSaleId ?? Date.now(),
        date: newSale.date,
        clientName: newSale.clientName,
        category: newSale.category,
        amount: Number(newSale.amount),
        paymentMethod: newSale.paymentMethod,
        staff: newSale.staff,
        memo: newSale.memo,
      };
      const next = editingSaleId
        ? current.map((item) => item.id === editingSaleId ? saleToSave : item)
        : [saleToSave, ...current];
      localStorage.setItem('golazo_sales_items', JSON.stringify(next));
      return next;
    });
    setEditingSaleId(null);
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

  const openTrialEditor = (trial: TrialItem) => {
    setEditingTrialId(trial.id);
    setNewTrial({
      date: trial.date,
      clientName: trial.clientName,
      age: String(trial.age),
      staff: trial.staff,
      hasPurchasedTicket: trial.hasPurchasedTicket,
      memo: trial.memo,
    });
    setIsTrialModalOpen(true);
  };

  const handleAddTrial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrial.clientName) return;

    setTrials((current) => {
      const trialToSave: TrialItem = {
        id: editingTrialId ?? Date.now(),
        date: newTrial.date,
        clientName: newTrial.clientName,
        age: Number(newTrial.age) || 0,
        staff: newTrial.staff,
        hasPurchasedTicket: newTrial.hasPurchasedTicket,
        memo: newTrial.memo,
      };
      const next = editingTrialId
        ? current.map((item) => item.id === editingTrialId ? trialToSave : item)
        : [trialToSave, ...current];
      localStorage.setItem('golazo_trials', JSON.stringify(next));
      return next;
    });

    setEditingTrialId(null);
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
              <span>{isSyncing ? '⏳' : '🔄'}</span> {isSyncing ? '同期中...' : 'Square売上同期'}
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
            <div className="text-xs text-slate-500 pt-1">年間目標: ¥{currentYearlyTargetNumber.toLocaleString()}</div>
          </div>
        </div>

        {/* 比較年月選択 */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-slate-600">📅 比較する年月:</span>
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
                <option key={m} value={String(m)}>{m}月</option>
              ))}
            </select>
          </div>
          <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            現在と <span className="font-bold text-slate-700">{selectedYear}年{selectedMonth}月</span> を比較
          </div>
        </div>

        {/* 現在 vs 比較年月 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">📊 現在と比較年月の売上・実績比較</h3>
            <p className="text-xs text-slate-500 mt-1">売上・目標・達成率・体験数・回数券購入を同じ表でシンプルに比較します。</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold text-slate-500 border-b border-slate-200">
                  <th className="p-4 w-[30%]">項目</th>
                  <th className="p-4 w-[35%]">現在（{realCurrentYear}年{Number(realCurrentMonth)}月）</th>
                  <th className="p-4 w-[35%]">比較年月（{selectedYear}年{selectedMonth}月）</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                <tr>
                  <td className="p-4 font-semibold text-slate-600">月間売上</td>
                  <td className="p-4 font-bold text-[#5e9bc4]">¥{realCurrentMonthAmount.toLocaleString()}</td>
                  <td className="p-4 font-bold text-slate-800">¥{selectedPeriodAmount.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-600">月間目標</td>
                  <td className="p-4 font-semibold text-slate-800">¥{currentMonthlyTargetNumber.toLocaleString()}</td>
                  <td className="p-4 font-semibold text-slate-800">¥{monthlyTargetNumber.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-600">月間達成率</td>
                  <td className="p-4 font-bold text-[#5e9bc4]">{currentMonthlyProgress}%達成</td>
                  <td className="p-4 font-bold text-slate-800">{monthlyProgress}%達成</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-600">年間売上</td>
                  <td className="p-4 font-bold text-slate-800">¥{realYearlyAmount.toLocaleString()}</td>
                  <td className="p-4 font-bold text-slate-800">¥{selectedYearAmount.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-600">年間目標</td>
                  <td className="p-4 font-semibold text-slate-800">¥{currentYearlyTargetNumber.toLocaleString()}</td>
                  <td className="p-4 font-semibold text-slate-800">¥{yearlyTargetNumber.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-600">年間達成率</td>
                  <td className="p-4 font-bold text-[#5e9bc4]">{currentYearlyProgress}%達成</td>
                  <td className="p-4 font-bold text-slate-800">{yearlyProgress}%達成</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-600">体験数</td>
                  <td className="p-4 font-bold text-[#5e9bc4]">
                    {sales.filter((item) => item.date.startsWith(`${realCurrentYear}-${realCurrentMonth.padStart(2, '0')}`) && item.category === '体験料').length} 名
                  </td>
                  <td className="p-4 font-bold text-slate-800">{selectedTrialCount} 名</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-600">回数券購入</td>
                  <td className="p-4 font-bold text-[#5e9bc4]">
                    {sales.filter((item) => item.date.startsWith(`${realCurrentYear}-${realCurrentMonth.padStart(2, '0')}`) && item.category === '回数券').length} 件
                  </td>
                  <td className="p-4 font-bold text-slate-800">{selectedTicketCount} 件</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 目標設定 */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800">🎯 {selectedYear}年{selectedMonth}月の目標設定</h3>
            <p className="text-xs text-slate-500 mt-1">比較年月の月間・年間目標を登録できます。</p>
          </div>
          <button
            onClick={() => setIsEditingTarget(!isEditingTarget)}
            className="text-xs text-[#5e9bc4] hover:underline font-semibold"
          >
            {isEditingTarget ? '目標を閉じる' : '⚙️ 目標を変更'}
          </button>
        </div>

        {isEditingTarget && (
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center gap-3">
            <label className="text-xs font-semibold text-slate-600">月間目標 (円):</label>
            <input
              type="number"
              min="0"
              step="1"
              value={monthlyTarget}
              onChange={(e) => setMonthlyTarget(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white"
            />
            <label className="text-xs font-semibold text-slate-600">年間目標 (円):</label>
            <input
              type="number"
              min="0"
              step="1"
              value={yearlyTarget}
              onChange={(e) => setYearlyTarget(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white"
            />
            <button
              onClick={handleSaveTargets}
              disabled={isSavingTarget}
              className="bg-[#5e9bc4] text-white px-4 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-60"
            >
              {isSavingTarget ? '保存中…' : '保存'}
            </button>
          </div>
        )}


        {/* 販売商品比較 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">🏷️ 販売商品比較</h3>
            <p className="text-xs text-slate-500 mt-1">
              Squareに登録されている実際の商品・サービス名を、今月と比較年月で並べて比較します。
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold text-slate-500 border-b border-slate-200">
                  <th className="p-3">商品名（Square）</th>
                  <th className="p-3">今月（{realCurrentYear}年{Number(realCurrentMonth)}月）</th>
                  <th className="p-3">比較年月（{selectedYear}年{selectedMonth}月）</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {productSummaryNames.length > 0 ? (
                  productSummaryNames.map((productName) => (
                    <tr key={productName} className="hover:bg-slate-50/70">
                      <td className="p-3">
                        <div className="font-semibold text-slate-700">{productName}</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          GOLAZO分類：{currentProductSummary[productName]?.category || selectedProductSummary[productName]?.category || '未分類'}
                        </div>
                      </td>
                      <td className="p-3 font-bold text-[#5e9bc4]">
                        {currentProductSummary[productName]?.count || 0}件
                      </td>
                      <td className="p-3 font-bold text-slate-800">
                        {selectedProductSummary[productName]?.count || 0}件
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-sm text-slate-400">
                      Squareの商品・サービスデータがありません。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* キャンペーン内容・結果 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span>🎉</span> キャンペーン内容・結果比較
              </h3>
              <p className="text-xs text-slate-500 mt-1">キャンペーンごとに今月と比較年月の詳細を分けて確認します。</p>
            </div>
            <button
              onClick={() => openNewCampaign(`${realCurrentYear}-${realCurrentMonth.padStart(2, '0')}`)}
              className="bg-[#5e9bc4] hover:bg-[#4d85ab] text-white px-3 py-1.5 rounded-xl font-semibold text-xs transition shadow-sm"
            >
              ＋ キャンペーン追加
            </button>
          </div>
          <div className="space-y-3">
            {Array.from(new Set([...currentCampaigns.map(c => c.title), ...selectedCampaigns.map(c => c.title)])).length > 0 ?
              Array.from(new Set([...currentCampaigns.map(c => c.title), ...selectedCampaigns.map(c => c.title)])).map((title) => {
                const current = currentCampaigns.find(c => c.title === title);
                const selected = selectedCampaigns.find(c => c.title === title);
                return (
                  <div key={title} className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-slate-800">🎯 {title}</span>
                    </div>
                    <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                      <div className="p-4 space-y-2">
                        <div className="text-xs font-bold text-[#5e9bc4]">今月（{realCurrentYear}年{Number(realCurrentMonth)}月）</div>
                        {current ? (
                          <>
                            <div className="text-xs text-slate-600">目標件数：<span className="font-bold">{current.targetCount}件</span> ／ 実績：<span className="font-bold">{current.appliedCount}件</span></div>
                            <div className="text-xs text-slate-600">目標売上：<span className="font-bold">¥{current.targetSales.toLocaleString()}</span> ／ 実績：<span className="font-bold">¥{current.contribution.toLocaleString()}</span></div>
                            <button onClick={() => openCampaignEditor(current)} className="text-[#5e9bc4] hover:text-[#4d85ab] text-xs font-bold">✏️ 修正</button>
                          </>
                        ) : <span className="text-slate-400 text-xs">該当なし</span>}
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="text-xs font-bold text-slate-700">比較年月（{selectedYear}年{selectedMonth}月）</div>
                        {selected ? (
                          <>
                            <div className="text-xs text-slate-600">目標件数：<span className="font-bold">{selected.targetCount}件</span> ／ 実績：<span className="font-bold">{selected.appliedCount}件</span></div>
                            <div className="text-xs text-slate-600">目標売上：<span className="font-bold">¥{selected.targetSales.toLocaleString()}</span> ／ 実績：<span className="font-bold">¥{selected.contribution.toLocaleString()}</span></div>
                            <button onClick={() => openCampaignEditor(selected)} className="text-[#5e9bc4] hover:text-[#4d85ab] text-xs font-bold">✏️ 修正</button>
                          </>
                        ) : <span className="text-slate-400 text-xs">該当なし</span>}
                      </div>
                    </div>
                  </div>
                );
              }) : <div className="p-6 text-center text-slate-400 text-sm">キャンペーン登録なし</div>}
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
                      <td className="p-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => openTrialEditor(trial)}
                          className="text-[#5e9bc4] hover:text-[#4d85ab] text-xs font-bold transition p-1 mr-1 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="修正"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteTrial(trial.id)}
                          className="text-slate-400 hover:text-red-500 text-xs font-bold transition p-1 disabled:opacity-30 disabled:cursor-not-allowed"
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
                  <th className="p-4">商品・サービス名（Square）</th>
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
                      <td className="p-4 text-xs">
                        {item.source === 'square' ? (
                          <div className="min-w-[220px]">
                            <div className="font-semibold text-slate-700">
                              {item.productNames?.length
                                ? item.productNames.join(' / ')
                                : item.productName || item.memo || 'Square取引'}
                            </div>
                            <div className="mt-1 text-[10px] text-emerald-600 font-bold">
                              Square商品
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
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
                      <td className="p-4 text-xs text-slate-600">{item.paymentMethod}{item.source === 'square' && <span className="ml-2 text-[10px] text-emerald-600 font-bold">Square自動</span>}</td>
                      <td className="p-4 text-xs">
                        <textarea
                          rows={2}
                          value={item.memo}
                          onChange={(e) => handleMemoChange(item.id, e.target.value)}
                          placeholder="メモを入力..."
                          className="w-full min-w-[220px] md:min-w-[280px] px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs leading-5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5e9bc4] resize-y"
                        />
                      </td>
                      <td className="p-4 text-center whitespace-nowrap">
                        <button
                          disabled={item.source === 'square'}
                          onClick={() => openSaleEditor(item)}
                          className="text-[#5e9bc4] hover:text-[#4d85ab] text-xs font-bold transition p-1 mr-1"
                          title="修正"
                        >
                          ✏️
                        </button>
                        <button
                          disabled={item.source === 'square'}
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
                    <td colSpan={9} className="p-8 text-center text-slate-400 text-sm">
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
              <h3 className="font-bold text-lg text-slate-800">{editingSaleId ? '売上データの修正' : '売上データの追加'}</h3>
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
                    <option value="未設定">未設定</option>
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
                  {editingSaleId ? '保存する' : '追加する'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* キャンペーン追加・修正モーダル */}
      {isCampaignModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-800">{editingCampaignId ? 'キャンペーンの修正' : 'キャンペーンの追加'}</h3>
              <button onClick={() => setIsCampaignModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleSaveCampaign} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">対象年月</label>
                  <input type="month" required value={campaignForm.yearMonth} onChange={(e) => setCampaignForm({ ...campaignForm, yearMonth: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">キャンペーン内容 *</label>
                  <input type="text" required value={campaignForm.title} onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">目標件数</label>
                  <input type="number" min="0" value={campaignForm.targetCount} onChange={(e) => setCampaignForm({ ...campaignForm, targetCount: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">目標売上 (円)</label>
                  <input type="number" min="0" value={campaignForm.targetSales} onChange={(e) => setCampaignForm({ ...campaignForm, targetSales: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">実績件数</label>
                  <input type="number" min="0" value={campaignForm.appliedCount} onChange={(e) => setCampaignForm({ ...campaignForm, appliedCount: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">実績売上 (円)</label>
                  <input type="number" min="0" value={campaignForm.contribution} onChange={(e) => setCampaignForm({ ...campaignForm, contribution: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsCampaignModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-semibold">キャンセル</button>
                <button type="submit" className="px-4 py-2 bg-[#5e9bc4] hover:bg-[#4d85ab] text-white rounded-xl text-sm font-semibold">保存する</button>
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
              <h3 className="font-bold text-lg text-slate-800">{editingTrialId ? '体験者データの修正' : '体験者データの追加'}</h3>
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
