import { createClient } from "@/lib/supabase/server";
import RealtimeWatcher from "@/components/RealtimeWatcher";
import NewTransactionForm from "@/components/NewTransactionForm";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const supabase = createClient();
  
  // transactionsではなく、実際のテーブル名である "sales" からデータを取得します
  const { data } = await supabase
    .from("sales")
    .select("*")
    .order("created_at", { ascending: false });

  const items: any[] = data || [];
  
  // 総売上金額の計算
  const totalAmount = items.reduce((acc, cur) => acc + (Number(cur.amount) || 0), 0);

  return (
    <div className="space-y-6">
      <RealtimeWatcher tables={["sales"]} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">売上・取引一覧</h1>
          <p className="text-sm text-ink/60 mt-1">Square決済および手動登録された売上の履歴です。</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-card border border-gray-100">
          <span className="text-xs text-ink/50 block font-semibold">総売上金額</span>
          <span className="text-lg font-bold text-emerald-600">¥{totalAmount.toLocaleString()}</span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-primary-50 text-left text-xs font-semibold uppercase tracking-wide text-primary-dark">
            <tr>
              <th className="px-4 py-3">金額</th>
              <th className="px-4 py-3">登録元</th>
              <th className="px-4 py-3">決済ID / 備考</th>
              <th className="px-4 py-3">登録日</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-ink/40" colSpan={4}>
                  取引データがありません
                </td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-bold text-ink">
                  ¥{(Number(item.amount) || 0).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      item.source === "square"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-ink/50"
                    }`}
                  >
                    {item.source === "square" ? "Square自動連携" : "手動登録"}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink/60">
                  {item.square_payment_id ? (
                    <span className="font-mono text-xs bg-gray-50 px-2 py-1 rounded border border-gray-100" title={item.square_payment_id}>
                      {item.square_payment_id.slice(0, 12)}...
                    </span>
                  ) : (
                    "―"
                  )}
                </td>
                <td className="px-4 py-3 text-ink/40">
                  {formatDate(item.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
