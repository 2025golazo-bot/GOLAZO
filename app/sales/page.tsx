'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Sale {
  id: string;
  amount: number;
  paid_at: string;
  source: string;
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSales() {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('paid_at', { ascending: false });

      if (error) {
        console.error('Error fetching sales:', error);
      } else {
        setSales(data || []);
      }
      setLoading(false);
    }

    fetchSales();
  }, []);

  const totalSales = sales.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">売上管理ダッシュボード</h1>
      
      <div className="bg-white p-4 rounded-lg shadow mb-6 border">
        <p className="text-sm text-gray-500">総売上（Square連動）</p>
        <p className="text-3xl font-bold text-green-600">¥{totalSales.toLocaleString()}</p>
      </div>

      <h2 className="text-xl font-semibold mb-3">決済履歴</h2>
      {loading ? (
        <p>読み込み中...</p>
      ) : sales.length === 0 ? (
        <p className="text-gray-500">まだ売上データがありません。（Square決済が行われるとここに反映されます）</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden border">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-3">決済日時</th>
                <th className="p-3">金額</th>
                <th className="p-3">ソース</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{new Date(sale.paid_at).toLocaleString()}</td>
                  <td className="p-3 font-semibold">¥{sale.amount.toLocaleString()}</td>
                  <td className="p-3"><span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Square</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
