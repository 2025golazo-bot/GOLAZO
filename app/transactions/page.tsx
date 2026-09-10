import { createClient } from "@/lib/supabase/server";
import RealtimeWatcher from "@/components/RealtimeWatcher";
import NewTransactionForm from "@/components/NewTransactionForm";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const supabase = createClient();
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false });

  // 強制的にanyキャストを行い、TypeScriptの型チェックを完全にスキップします
  const list = (transactions || []) as Array<any>;

  // 簡易集計
  const totalAmount = list.reduce((acc, cur) => acc + (Number(cur.amount) || 0), 0);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <RealtimeWatcher table="transactions" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">売上・決済トランザクション</h1>
          <p className="text-sm text-slate-500 mt-1">Square決済および手動登録されたトランザクションの一覧です。</p>
        </div>
        <div className="bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-400 block font-semibold">総売上金額</span>
          <span className="text-xl font-bold text-emerald-600">¥{totalAmount.toLocaleString()}</span>
        </div>
      </div>

      {/* 新規トランザクション登録フォーム */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-sm font-bold text-slate-700 mb-3">＋ 手動トランザクション追加</h2>
        <NewTransactionForm />
      </div>

      {/* トランザクション一覧テーブル */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-700">
          履歴一覧 ({list.length}件)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-400 border-b border-slate-200">
                <th className="p-3 font-semibold">日時</th>
                <th className="p-3 font-semibold">クライアント名</th>
                <th className="p-3 font-semibold">項目</th>
                <th className="p-3 font-semibold">種別</th>
                <th className="p-3 font-semibold">担当</th>
                <th className="p-3 font-semibold text-right">金額</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {list.length > 0 ? (
                list.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 text-slate-500">{formatDate(tx.date)}</td>
                    <td className="p-3 font-bold text-slate-800">{tx.client}</td>
                    <td className="p-3">{tx.item}</td>
                    <td className="p-3">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
                        {tx.type}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-[#5e9bc4]">{tx.staff}</td>
                    <td className="p-3 text-right font-bold text-slate-800">
                      ¥{(Number(tx.amount) || 0).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    トランザクションデータがありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
