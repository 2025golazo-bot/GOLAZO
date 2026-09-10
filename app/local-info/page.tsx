import { createClient } from "@/lib/supabase/server";
import RealtimeWatcher from "@/components/RealtimeWatcher";
import NewTransactionForm from "@/components/NewTransactionForm";
import { formatDate } from "@/lib/utils";
import type { TransactionRow } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function LocalInfoPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false });

  const items: TransactionRow[] = data || [];

  return (
    <div className="space-y-6">
      <RealtimeWatcher tables={["transactions"]} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-ink">ローカル情報・取引一覧</h1>
        <NewTransactionForm />
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-primary-50 text-left text-xs font-semibold uppercase tracking-wide text-primary-dark">
            <tr>
              <th className="px-4 py-3">名前</th>
              <th className="px-4 py-3">詳細URL</th>
              <th className="px-4 py-3">担当者</th>
              <th className="px-4 py-3">メモ</th>
              <th className="px-4 py-3">登録元</th>
              <th className="px-4 py-3">登録日</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-ink/40" colSpan={6}>
                  データがありません
                </td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-ink">{item.name}</td>
                <td className="px-4 py-3">
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary-dark hover:underline"
                    >
                      詳細を見る
                    </a>
                  ) : (
                    "―"
                  )}
                </td>
                <td className="px-4 py-3">
                  {item.staff_name ? (
                    <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-dark">
                      {item.staff_name}
                    </span>
                  ) : (
                    "―"
                  )}
                </td>
                <td className="px-4 py-3 text-ink/60">{item.memo || "―"}</td>
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
