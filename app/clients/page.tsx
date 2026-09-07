import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import RealtimeWatcher from "@/components/RealtimeWatcher";
import AlertBadge from "@/components/AlertBadge";
import NewClientForm from "@/components/NewClientForm";
import { formatDate } from "@/lib/utils";
import type { ClientDetails } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("view_client_details")
    .select("*")
    .order("child_name", { ascending: true });

  const clients: ClientDetails[] = data || [];

  return (
    <div className="space-y-6">
      <RealtimeWatcher tables={["clients"]} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-ink">顧客カルテ一覧</h1>
        <NewClientForm />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clients.length === 0 && (
          <p className="col-span-full text-center text-ink/40">
            顧客データがありません
          </p>
        )}
        {clients.map((c) => (
          <Link
            key={c.id}
            href={`/clients/${c.id}`}
            className="block rounded-2xl bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink">{c.child_name}</h2>
              <span className="text-sm text-ink/50">{c.current_age}歳</span>
            </div>
            <p className="mb-3 text-sm text-ink/60">
              保護者: {c.parent_name || "未設定"}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {c.follow_status === "needs_follow_2weeks" && (
                <AlertBadge tone="warning">⚠️ フォロー推奨（2週間空き）</AlertBadge>
              )}
              {c.follow_status === "needs_follow_1month" && (
                <AlertBadge tone="warning">⚠️ フォロー推奨（1ヶ月空き）</AlertBadge>
              )}
              {c.is_ticket_last_one && (
                <AlertBadge tone="urgent">🚨 残り1回（次回提案）</AlertBadge>
              )}
              {c.is_measurement_month && (
                <AlertBadge tone="info">🎯 今月は3ヶ月測定月</AlertBadge>
              )}
            </div>
            <p className="mt-3 text-xs text-ink/40">
              次回予約日: {formatDate(c.next_reservation_date)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
