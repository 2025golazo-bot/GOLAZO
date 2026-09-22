'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import { createClient } from '@/lib/supabase/client';

type ExpenseItem = {
  id?: number;
  category: string;
  amount: number | '';
  sortOrder: number;
};

type SquareSale = {
  date: string;
  amount: number;
};

type ManualSale = {
  date?: string;
  amount?: number;
  source?: string;
};

type AnnualMonthData = {
  month: number;
  sales: number;
  expenses: number;
  profit: number;
};

type FiscalMonthData = {
  year: number;
  month: number;
  label: string;
  sales: number;
  expenses: number;
  profit: number;
};

type ExpenseComparisonData = {
  category: string;
  currentAmount: number;
  previousAmount: number;
  difference: number;
};

const DEFAULT_EXPENSE_CATEGORIES = [
  '家賃',
  '水道',
  '電気代',
  '地震保険',
  '保険（TAKA）',
  '保険（NANA）',
  '人件費',
  '雑費',
  '研修費',
  '交際費',
  '会議費',
  '決済手数料',
  'その他',
  '初期投資',
];

export default function ProfitPage() {
  const supabase = useMemo(() => createClient(), []);

  const now = new Date();

  const [selectedYear, setSelectedYear] = useState(
    String(now.getFullYear())
  );
  const [selectedMonth, setSelectedMonth] = useState(
    String(now.getMonth() + 1)
  );

  const [squareSalesAmount, setSquareSalesAmount] = useState(0);
  const [manualSalesAmount, setManualSalesAmount] = useState(0);

  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [newCategory, setNewCategory] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<
    'monthly' | 'annual' | 'fiscal' | 'expenseComparison'
  >('monthly');
  const [annualData, setAnnualData] = useState<AnnualMonthData[]>([]);
  const [isAnnualLoading, setIsAnnualLoading] = useState(false);
  const [fiscalData, setFiscalData] = useState<FiscalMonthData[]>([]);
  const [expenseComparisonData, setExpenseComparisonData] = useState<
    ExpenseComparisonData[]
  >([]);
  const [isFiscalLoading, setIsFiscalLoading] = useState(false);
  const [isComparisonLoading, setIsComparisonLoading] = useState(false);

  const expenseMonth = `${selectedYear}-${selectedMonth.padStart(2, '0')}`;

  const totalSales = squareSalesAmount + manualSalesAmount;

  const totalExpenses = expenses.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );

  const profit = totalSales - totalExpenses;

  const annualSales = annualData.reduce(
    (sum, item) => sum + item.sales,
    0
  );

  const annualExpenses = annualData.reduce(
    (sum, item) => sum + item.expenses,
    0
  );

  const annualProfit = annualSales - annualExpenses;

  const fiscalSales = fiscalData.reduce(
    (sum, item) => sum + item.sales,
    0
  );

  const fiscalExpenses = fiscalData.reduce(
    (sum, item) => sum + item.expenses,
    0
  );

  const fiscalProfit = fiscalSales - fiscalExpenses;

  const previousYear = String(Number(selectedYear) - 1);

  const years = Array.from(
    { length: 8 },
    (_, index) => String(now.getFullYear() - 5 + index)
  );

  useEffect(() => {
    const loadProfitData = async () => {
      setIsLoading(true);

      try {
        const startDate = `${expenseMonth}-01`;

        const endDateObject = new Date(
          Number(selectedYear),
          Number(selectedMonth),
          0
        );

        const endDate = `${selectedYear}-${selectedMonth.padStart(
          2,
          '0'
        )}-${String(endDateObject.getDate()).padStart(2, '0')}`;

        const [
          { data: squareSales, error: squareSalesError },
          { data: expenseRows, error: expenseError },
        ] = await Promise.all([
          supabase
            .from('square_sales')
            .select('date, amount')
            .eq('source', 'square')
            .gte('date', startDate)
            .lte('date', endDate),

          supabase
            .from('profit_expenses')
            .select('id, category, amount, sort_order')
            .eq('expense_month', expenseMonth)
            .order('sort_order', { ascending: true }),
        ]);

        if (squareSalesError) {
          console.warn(
            'Square売上の読み込みに失敗しました:',
            squareSalesError.message
          );
        }

        if (expenseError) {
          console.warn(
            '経費の読み込みに失敗しました:',
            expenseError.message
          );
        }

        const squareTotal = ((squareSales || []) as SquareSale[]).reduce(
          (sum, item) => sum + (Number(item.amount) || 0),
          0
        );

        setSquareSalesAmount(squareTotal);

        let manualTotal = 0;

        try {
          const savedSales = JSON.parse(
            localStorage.getItem('golazo_sales_items') || '[]'
          );

          if (Array.isArray(savedSales)) {
            manualTotal = (savedSales as ManualSale[])
              .filter(
                (item) =>
                  item?.source === 'manual' &&
                  String(item.date || '').startsWith(expenseMonth)
              )
              .reduce(
                (sum, item) => sum + (Number(item.amount) || 0),
                0
              );
          }
        } catch (error) {
          console.warn('手入力売上の読み込みに失敗しました:', error);
        }

        setManualSalesAmount(manualTotal);

        const savedExpenses: ExpenseItem[] = (expenseRows || []).map(
          (row: any) => ({
            id: Number(row.id),
            category: String(row.category),
            amount: Number(row.amount) || 0,
            sortOrder: Number(row.sort_order) || 0,
          })
        );

        const savedCategoryNames = new Set(
          savedExpenses.map((item) => item.category)
        );

        const defaultExpenses: ExpenseItem[] =
          DEFAULT_EXPENSE_CATEGORIES.filter(
            (category) => !savedCategoryNames.has(category)
          ).map((category, index) => ({
            category,
            amount: 0,
            sortOrder: index,
          }));

        const combined = [...savedExpenses, ...defaultExpenses].sort(
          (a, b) => {
            const aDefaultIndex =
              DEFAULT_EXPENSE_CATEGORIES.indexOf(a.category);
            const bDefaultIndex =
              DEFAULT_EXPENSE_CATEGORIES.indexOf(b.category);

            const aOrder =
              aDefaultIndex >= 0 ? aDefaultIndex : 1000 + a.sortOrder;
            const bOrder =
              bDefaultIndex >= 0 ? bDefaultIndex : 1000 + b.sortOrder;

            return aOrder - bOrder;
          }
        );

        setExpenses(
          combined.map((item, index) => ({
            ...item,
            sortOrder: index,
          }))
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadProfitData();
  }, [expenseMonth, selectedMonth, selectedYear, supabase]);

  useEffect(() => {
    if (viewMode !== 'annual') return;

    const loadAnnualData = async () => {
      setIsAnnualLoading(true);

      try {
        const startDate = `${selectedYear}-01-01`;
        const endDate = `${selectedYear}-12-31`;

        const [
          { data: squareSales, error: squareSalesError },
          { data: expenseRows, error: expenseError },
        ] = await Promise.all([
          supabase
            .from('square_sales')
            .select('date, amount')
            .eq('source', 'square')
            .gte('date', startDate)
            .lte('date', endDate),

          supabase
            .from('profit_expenses')
            .select('expense_month, amount')
            .gte('expense_month', `${selectedYear}-01`)
            .lte('expense_month', `${selectedYear}-12`),
        ]);

        if (squareSalesError) {
          console.warn(
            '年間Square売上の読み込みに失敗しました:',
            squareSalesError.message
          );
        }

        if (expenseError) {
          console.warn(
            '年間経費の読み込みに失敗しました:',
            expenseError.message
          );
        }

        const monthlyData: AnnualMonthData[] = Array.from(
          { length: 12 },
          (_, index) => ({
            month: index + 1,
            sales: 0,
            expenses: 0,
            profit: 0,
          })
        );

        ((squareSales || []) as SquareSale[]).forEach((item) => {
          const month = Number(String(item.date).slice(5, 7));

          if (month >= 1 && month <= 12) {
            monthlyData[month - 1].sales += Number(item.amount) || 0;
          }
        });

        try {
          const savedSales = JSON.parse(
            localStorage.getItem('golazo_sales_items') || '[]'
          );

          if (Array.isArray(savedSales)) {
            (savedSales as ManualSale[])
              .filter(
                (item) =>
                  item?.source === 'manual' &&
                  String(item.date || '').startsWith(selectedYear)
              )
              .forEach((item) => {
                const month = Number(
                  String(item.date || '').slice(5, 7)
                );

                if (month >= 1 && month <= 12) {
                  monthlyData[month - 1].sales +=
                    Number(item.amount) || 0;
                }
              });
          }
        } catch (error) {
          console.warn(
            '年間手入力売上の読み込みに失敗しました:',
            error
          );
        }

        (expenseRows || []).forEach((row: any) => {
          const month = Number(
            String(row.expense_month).slice(5, 7)
          );

          if (month >= 1 && month <= 12) {
            monthlyData[month - 1].expenses +=
              Number(row.amount) || 0;
          }
        });

        monthlyData.forEach((item) => {
          item.profit = item.sales - item.expenses;
        });

        setAnnualData(monthlyData);
      } finally {
        setIsAnnualLoading(false);
      }
    };

    void loadAnnualData();
  }, [selectedYear, supabase, viewMode]);

  useEffect(() => {
    if (viewMode !== 'fiscal') return;

    const loadFiscalData = async () => {
      setIsFiscalLoading(true);

      try {
        const fiscalYear = Number(selectedYear);
        const nextYear = fiscalYear + 1;
        const startDate = `${fiscalYear}-04-01`;
        const endDate = `${nextYear}-03-31`;

        const [
          { data: squareSales, error: squareSalesError },
          { data: expenseRows, error: expenseError },
        ] = await Promise.all([
          supabase
            .from('square_sales')
            .select('date, amount')
            .eq('source', 'square')
            .gte('date', startDate)
            .lte('date', endDate),
          supabase
            .from('profit_expenses')
            .select('expense_month, amount')
            .gte('expense_month', `${fiscalYear}-04`)
            .lte('expense_month', `${nextYear}-03`),
        ]);

        if (squareSalesError) {
          console.warn(
            '年度Square売上の読み込みに失敗しました:',
            squareSalesError.message
          );
        }

        if (expenseError) {
          console.warn(
            '年度経費の読み込みに失敗しました:',
            expenseError.message
          );
        }

        const months: FiscalMonthData[] = [
          ...Array.from({ length: 9 }, (_, index) => ({
            year: fiscalYear,
            month: index + 4,
            label: `${index + 4}月`,
            sales: 0,
            expenses: 0,
            profit: 0,
          })),
          ...Array.from({ length: 3 }, (_, index) => ({
            year: nextYear,
            month: index + 1,
            label: `${index + 1}月`,
            sales: 0,
            expenses: 0,
            profit: 0,
          })),
        ];

        const findMonth = (year: number, month: number) =>
          months.find(
            (item) => item.year === year && item.month === month
          );

        ((squareSales || []) as SquareSale[]).forEach((item) => {
          const date = String(item.date);
          const year = Number(date.slice(0, 4));
          const month = Number(date.slice(5, 7));
          const target = findMonth(year, month);

          if (target) {
            target.sales += Number(item.amount) || 0;
          }
        });

        try {
          const savedSales = JSON.parse(
            localStorage.getItem('golazo_sales_items') || '[]'
          );

          if (Array.isArray(savedSales)) {
            (savedSales as ManualSale[])
              .filter((item) => {
                if (item?.source !== 'manual') return false;
                const date = String(item.date || '');
                return date >= startDate && date <= endDate;
              })
              .forEach((item) => {
                const date = String(item.date || '');
                const year = Number(date.slice(0, 4));
                const month = Number(date.slice(5, 7));
                const target = findMonth(year, month);

                if (target) {
                  target.sales += Number(item.amount) || 0;
                }
              });
          }
        } catch (error) {
          console.warn('年度手入力売上の読み込みに失敗しました:', error);
        }

        (expenseRows || []).forEach((row: any) => {
          const expenseMonthValue = String(row.expense_month);
          const year = Number(expenseMonthValue.slice(0, 4));
          const month = Number(expenseMonthValue.slice(5, 7));
          const target = findMonth(year, month);

          if (target) {
            target.expenses += Number(row.amount) || 0;
          }
        });

        months.forEach((item) => {
          item.profit = item.sales - item.expenses;
        });

        setFiscalData(months);
      } finally {
        setIsFiscalLoading(false);
      }
    };

    void loadFiscalData();
  }, [selectedYear, supabase, viewMode]);

  useEffect(() => {
    if (viewMode !== 'expenseComparison') return;

    const loadExpenseComparison = async () => {
      setIsComparisonLoading(true);

      try {
        const currentYear = Number(selectedYear);
        const priorYear = currentYear - 1;

        const { data: rows, error } = await supabase
          .from('profit_expenses')
          .select('expense_month, category, amount')
          .gte('expense_month', `${priorYear}-01`)
          .lte('expense_month', `${currentYear}-12`);

        if (error) {
          console.warn(
            '経費比較の読み込みに失敗しました:',
            error.message
          );
        }

        const currentMap = new Map<string, number>();
        const previousMap = new Map<string, number>();
        const categoryNames = new Set<string>(
          DEFAULT_EXPENSE_CATEGORIES
        );

        (rows || []).forEach((row: any) => {
          const expenseMonthValue = String(row.expense_month);
          const year = Number(expenseMonthValue.slice(0, 4));
          const category = String(row.category);
          const amount = Number(row.amount) || 0;

          categoryNames.add(category);

          if (year === currentYear) {
            currentMap.set(
              category,
              (currentMap.get(category) || 0) + amount
            );
          }

          if (year === priorYear) {
            previousMap.set(
              category,
              (previousMap.get(category) || 0) + amount
            );
          }
        });

        const defaultOrder = (category: string) => {
          const index = DEFAULT_EXPENSE_CATEGORIES.indexOf(category);
          return index >= 0 ? index : 1000;
        };

        const comparison = Array.from(categoryNames)
          .sort((a, b) => {
            const orderDifference =
              defaultOrder(a) - defaultOrder(b);

            if (orderDifference !== 0) {
              return orderDifference;
            }

            return a.localeCompare(b, 'ja');
          })
          .map((category) => {
            const currentAmount = currentMap.get(category) || 0;
            const previousAmount = previousMap.get(category) || 0;

            return {
              category,
              currentAmount,
              previousAmount,
              difference: currentAmount - previousAmount,
            };
          });

        setExpenseComparisonData(comparison);
      } finally {
        setIsComparisonLoading(false);
      }
    };

    void loadExpenseComparison();
  }, [selectedYear, supabase, viewMode]);

  const handleAmountChange = (index: number, value: string) => {
    const amount: number | '' =
      value === '' ? '' : Math.max(0, Number(value) || 0);

    setExpenses((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, amount } : item
      )
    );
  };

  const handleAddCategory = () => {
    const category = newCategory.trim();

    if (!category) return;

    if (expenses.some((item) => item.category === category)) {
      alert('同じ経費項目がすでにあります。');
      return;
    }

    setExpenses((current) => [
      ...current,
      {
        category,
        amount: 0,
        sortOrder: current.length,
      },
    ]);

    setNewCategory('');
  };

  const handleDeleteCategory = (index: number) => {
    const target = expenses[index];

    if (DEFAULT_EXPENSE_CATEGORIES.includes(target.category)) {
      alert('初期経費項目は削除できません。');
      return;
    }

    if (!window.confirm(`「${target.category}」を削除しますか？`)) {
      return;
    }

    setExpenses((current) =>
      current
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({
          ...item,
          sortOrder: itemIndex,
        }))
    );
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const { error: deleteError } = await supabase
        .from('profit_expenses')
        .delete()
        .eq('expense_month', expenseMonth);

      if (deleteError) {
        throw deleteError;
      }

      const rows = expenses.map((item, index) => ({
        expense_month: expenseMonth,
        category: item.category,
        amount: Number(item.amount) || 0,
        sort_order: index,
        updated_at: new Date().toISOString(),
      }));

      const { error: insertError } = await supabase
        .from('profit_expenses')
        .insert(rows);

      if (insertError) {
        throw insertError;
      }

      alert(`${selectedYear}年${selectedMonth}月の経費を保存しました。`);
    } catch (error: any) {
      console.error('経費保存エラー:', error);
      alert(`経費の保存に失敗しました。\n${error?.message || ''}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <p className="text-sm font-semibold text-[#5e9bc4] mb-1">
            PROFIT MANAGEMENT
          </p>

          <h2 className="text-2xl font-bold text-slate-800">
            💰 収支管理
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            売上管理の売上と月ごとの経費から利益を確認します。
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                表示
              </label>
              <div className="flex rounded-xl border border-slate-300 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setViewMode('monthly')}
                  className={`px-4 py-2 text-sm font-semibold ${
                    viewMode === 'monthly'
                      ? 'bg-[#5e9bc4] text-white'
                      : 'bg-white text-slate-600'
                  }`}
                >
                  月次
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('annual')}
                  className={`px-4 py-2 text-sm font-semibold ${
                    viewMode === 'annual'
                      ? 'bg-[#5e9bc4] text-white'
                      : 'bg-white text-slate-600'
                  }`}
                >
                  年間
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('fiscal')}
                  className={`px-4 py-2 text-sm font-semibold ${
                    viewMode === 'fiscal'
                      ? 'bg-[#5e9bc4] text-white'
                      : 'bg-white text-slate-600'
                  }`}
                >
                  年度
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('expenseComparison')}
                  className={`px-4 py-2 text-sm font-semibold ${
                    viewMode === 'expenseComparison'
                      ? 'bg-[#5e9bc4] text-white'
                      : 'bg-white text-slate-600'
                  }`}
                >
                  経費比較
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                年
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="border border-slate-300 rounded-xl px-3 py-2 bg-white"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}年
                  </option>
                ))}
              </select>
            </div>

            {viewMode === 'monthly' && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  月
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="border border-slate-300 rounded-xl px-3 py-2 bg-white"
                >
                  {Array.from(
                    { length: 12 },
                    (_, index) => String(index + 1)
                  ).map((month) => (
                    <option key={month} value={month}>
                      {month}月
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {viewMode === 'monthly' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-xs font-semibold text-slate-500">
              月間売上
            </p>
            <p className="text-2xl font-bold text-[#5e9bc4] mt-2">
              ¥{totalSales.toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Square ¥{squareSalesAmount.toLocaleString()} ＋ 手入力 ¥
              {manualSalesAmount.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-xs font-semibold text-slate-500">
              経費合計
            </p>
            <p className="text-2xl font-bold text-slate-800 mt-2">
              ¥{totalExpenses.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-xs font-semibold text-slate-500">
              利益
            </p>
            <p
              className={`text-2xl font-bold mt-2 ${
                profit >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              ¥{profit.toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mt-2">
              売上 − 経費
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">
              {selectedYear}年{selectedMonth}月 経費内訳
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              金額を入力して保存してください。
            </p>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              読み込み中...
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-100">
                {expenses.map((item, index) => {
                  const isDefault = DEFAULT_EXPENSE_CATEGORIES.includes(
                    item.category
                  );

                  return (
                    <div
                      key={`${item.category}-${index}`}
                      className="p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                    >
                      <div className="flex-1 font-semibold text-sm text-slate-700">
                        {item.category}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">¥</span>

                        <input
                          type="number"
                          min="0"
                          value={item.amount}
                          onChange={(e) =>
                            handleAmountChange(index, e.target.value)
                          }
                          className="w-40 border border-slate-300 rounded-xl px-3 py-2 text-right"
                        />

                        {!isDefault && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(index)}
                            className="px-3 py-2 rounded-xl text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100"
                          >
                            削除
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-5 bg-slate-50 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-500 mb-2">
                  経費項目を追加
                </p>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="例：広告費"
                    className="flex-1 border border-slate-300 rounded-xl px-3 py-2 bg-white"
                  />

                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-4 py-2 rounded-xl bg-slate-700 text-white text-sm font-semibold hover:bg-slate-800"
                  >
                    ＋ 項目追加
                  </button>
                </div>
              </div>

              <div className="p-5 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#5e9bc4] text-white font-semibold disabled:opacity-50"
                >
                  {isSaving ? '保存中...' : '経費を保存'}
                </button>
              </div>
            </>
          )}
        </div>
          </>
        ) : viewMode === 'annual' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <p className="text-xs font-semibold text-slate-500">
                  年間売上
                </p>
                <p className="text-2xl font-bold text-[#5e9bc4] mt-2">
                  ¥{annualSales.toLocaleString()}
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <p className="text-xs font-semibold text-slate-500">
                  年間経費
                </p>
                <p className="text-2xl font-bold text-slate-800 mt-2">
                  ¥{annualExpenses.toLocaleString()}
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <p className="text-xs font-semibold text-slate-500">
                  年間収支
                </p>
                <p
                  className={`text-2xl font-bold mt-2 ${
                    annualProfit >= 0
                      ? 'text-emerald-600'
                      : 'text-red-600'
                  }`}
                >
                  ¥{annualProfit.toLocaleString()}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  売上 − 経費
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">
                  {selectedYear}年 年間収支
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  1月から12月までの売上・経費・収支を確認できます。
                </p>
              </div>

              {isAnnualLoading ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  読み込み中...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-xs font-semibold text-slate-500 border-b border-slate-200">
                        <th className="p-4">月</th>
                        <th className="p-4 text-right">売上</th>
                        <th className="p-4 text-right">経費</th>
                        <th className="p-4 text-right">収支</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 text-sm">
                      {annualData.map((item) => (
                        <tr key={item.month}>
                          <td className="p-4 font-semibold text-slate-700">
                            {item.month}月
                          </td>
                          <td className="p-4 text-right font-semibold text-[#5e9bc4]">
                            ¥{item.sales.toLocaleString()}
                          </td>
                          <td className="p-4 text-right text-slate-700">
                            ¥{item.expenses.toLocaleString()}
                          </td>
                          <td
                            className={`p-4 text-right font-bold ${
                              item.profit >= 0
                                ? 'text-emerald-600'
                                : 'text-red-600'
                            }`}
                          >
                            ¥{item.profit.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>

                    <tfoot>
                      <tr className="bg-slate-50 border-t border-slate-200">
                        <td className="p-4 font-bold text-slate-800">
                          年間合計
                        </td>
                        <td className="p-4 text-right font-bold text-[#5e9bc4]">
                          ¥{annualSales.toLocaleString()}
                        </td>
                        <td className="p-4 text-right font-bold text-slate-800">
                          ¥{annualExpenses.toLocaleString()}
                        </td>
                        <td
                          className={`p-4 text-right font-bold ${
                            annualProfit >= 0
                              ? 'text-emerald-600'
                              : 'text-red-600'
                          }`}
                        >
                          ¥{annualProfit.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : viewMode === 'fiscal' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <p className="text-xs font-semibold text-slate-500">
                  年度売上
                </p>
                <p className="text-2xl font-bold text-[#5e9bc4] mt-2">
                  ¥{fiscalSales.toLocaleString()}
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <p className="text-xs font-semibold text-slate-500">
                  年度経費
                </p>
                <p className="text-2xl font-bold text-slate-800 mt-2">
                  ¥{fiscalExpenses.toLocaleString()}
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <p className="text-xs font-semibold text-slate-500">
                  年度収支
                </p>
                <p
                  className={`text-2xl font-bold mt-2 ${
                    fiscalProfit >= 0
                      ? 'text-emerald-600'
                      : 'text-red-600'
                  }`}
                >
                  ¥{fiscalProfit.toLocaleString()}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  4月〜翌年3月
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">
                  {selectedYear}年度 収支
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedYear}年4月〜{Number(selectedYear) + 1}年3月
                </p>
              </div>

              {isFiscalLoading ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  読み込み中...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-xs font-semibold text-slate-500 border-b border-slate-200">
                        <th className="p-4">月</th>
                        <th className="p-4 text-right">売上</th>
                        <th className="p-4 text-right">経費</th>
                        <th className="p-4 text-right">収支</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {fiscalData.map((item) => (
                        <tr key={`${item.year}-${item.month}`}>
                          <td className="p-4 font-semibold text-slate-700">
                            {item.year}年 {item.label}
                          </td>
                          <td className="p-4 text-right font-semibold text-[#5e9bc4]">
                            ¥{item.sales.toLocaleString()}
                          </td>
                          <td className="p-4 text-right text-slate-700">
                            ¥{item.expenses.toLocaleString()}
                          </td>
                          <td
                            className={`p-4 text-right font-bold ${
                              item.profit >= 0
                                ? 'text-emerald-600'
                                : 'text-red-600'
                            }`}
                          >
                            ¥{item.profit.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 border-t border-slate-200">
                        <td className="p-4 font-bold">年度合計</td>
                        <td className="p-4 text-right font-bold text-[#5e9bc4]">
                          ¥{fiscalSales.toLocaleString()}
                        </td>
                        <td className="p-4 text-right font-bold">
                          ¥{fiscalExpenses.toLocaleString()}
                        </td>
                        <td
                          className={`p-4 text-right font-bold ${
                            fiscalProfit >= 0
                              ? 'text-emerald-600'
                              : 'text-red-600'
                          }`}
                        >
                          ¥{fiscalProfit.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">
                経費内訳比較
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {previousYear}年と{selectedYear}年の年間経費を項目別に比較します。
              </p>
            </div>

            {isComparisonLoading ? (
              <div className="p-8 text-center text-sm text-slate-500">
                読み込み中...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-xs font-semibold text-slate-500 border-b border-slate-200">
                      <th className="p-4">経費項目</th>
                      <th className="p-4 text-right">
                        {previousYear}年
                      </th>
                      <th className="p-4 text-right">
                        {selectedYear}年
                      </th>
                      <th className="p-4 text-right">前年差</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {expenseComparisonData.map((item) => (
                      <tr key={item.category}>
                        <td className="p-4 font-semibold text-slate-700">
                          {item.category}
                        </td>
                        <td className="p-4 text-right text-slate-600">
                          ¥{item.previousAmount.toLocaleString()}
                        </td>
                        <td className="p-4 text-right font-semibold text-slate-800">
                          ¥{item.currentAmount.toLocaleString()}
                        </td>
                        <td
                          className={`p-4 text-right font-bold ${
                            item.difference > 0
                              ? 'text-red-600'
                              : item.difference < 0
                              ? 'text-emerald-600'
                              : 'text-slate-500'
                          }`}
                        >
                          {item.difference > 0 ? '+' : ''}
                          ¥{item.difference.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 border-t border-slate-200">
                      <td className="p-4 font-bold">経費合計</td>
                      <td className="p-4 text-right font-bold">
                        ¥
                        {expenseComparisonData
                          .reduce(
                            (sum, item) =>
                              sum + item.previousAmount,
                            0
                          )
                          .toLocaleString()}
                      </td>
                      <td className="p-4 text-right font-bold">
                        ¥
                        {expenseComparisonData
                          .reduce(
                            (sum, item) =>
                              sum + item.currentAmount,
                            0
                          )
                          .toLocaleString()}
                      </td>
                      <td className="p-4 text-right font-bold">
                        ¥
                        {expenseComparisonData
                          .reduce(
                            (sum, item) =>
                              sum + item.difference,
                            0
                          )
                          .toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
