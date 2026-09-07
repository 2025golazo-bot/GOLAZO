import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RealtimeWatcher from "@/components/RealtimeWatcher";
import AlertBadge from "@/components/AlertBadge";
import ClientBasicInfoEditor from "@/components/ClientBasicInfoEditor";
import SessionLogForm from "@/components/SessionLogForm";
import MeasurementForm from "@/components/MeasurementForm";
import { formatDate, formatDateTime, diffLabel } from "@/lib/utils";
import type {
  ClientDetails,
  SessionLog,
  Measurement,
} from "@/types/database";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const [{ data: client }, { data: sessions }, { data: measurements }] =
    await Promise.all([
      supabase
        .from("view_client_details")
        .select("*")
        .eq("id", params.id)
        .maybeSingle(),
      supabase
        .from("session_logs")
        .select("*")
        .eq("client_id", params.id)
        .order("session_date", { ascending: false }),
      supabase
        .from("measurements")
        .select("*")
        .eq("client_id", params.id)
        .order("measurement_date", { ascending: false }),
    ]);

  if (!client) notFound();

  const c: ClientDetails = client;
  const sessionList: SessionLog[] = sessions || [];
  const measurementList: Measurement[] = measurements || [];

  return (
    <div className="space-y-8">
      <RealtimeWatcher tables={["clients", "session_logs", "measurements"]} />

      <div>
        <Link href="/clients" className="text-sm text-primary-dark hover:underline">
          ← 顧客カルテ一覧へ戻る
        </Link>
      </div>

      <section className="rounded-2xl bg-white p-6 shadow-card">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-ink">{c.child_name}</h1>
            <p className="text-sm text-ink/60">
              保護者: {c.parent_name || "未設定"} ／ {c.current_age}歳
            </p>
          </div>
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
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-1 text-sm text-ink/70">
            <p>初回セッション日: {formatDate(c.first_session_date)}</p>
            <p>
              回数券: 総数 {c.ticket_total} ／ 消化 {c.ticket_used} ／ 残り{" "}
              {c.ticket_remaining}
            </p>
          </div>
          <ClientBasicInfoEditor client={c} />
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">セッション記録</h2>
        </div>
        <div className="mb-4">
          <SessionLogForm clientId={c.id} />
        </div>
        <div className="space-y-3">
          {sessionList.length === 0 && (
            <p className="text-center text-ink/40">セッション記録がありません</p>
          )}
          {sessionList.map((s) => (
            <div key={s.id} className="rounded-2xl bg-white p-4 shadow-card">
              <div className="mb-2 flex items-center justify-between text-xs text-ink/50">
                <span>{formatDateTime(s.session_date)}</span>
                <span className="rounded-full bg-primary-50 px-2.5 py-1 font-semibold text-primary-dark">
                  {s.staff_name}
                </span>
              </div>
              <p className="text-sm text-ink">{s.content}</p>
              {s.homework_text && (
                <p className="mt-2 text-sm text-ink/70">
                  宿題: {s.homework_text}
                </p>
              )}
              {s.homework_image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.homework_image_url}
                  alt="宿題写真"
                  className="mt-2 h-24 w-24 rounded-lg object-cover"
                />
              )}
              {s.memo && (
                <p className="mt-2 text-xs text-ink/40">メモ: {s.memo}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-ink">測定詳細記録</h2>
        <div className="mb-4">
          <MeasurementForm clientId={c.id} />
        </div>
        <div className="space-y-3">
          {measurementList.length === 0 && (
            <p className="text-center text-ink/40">測定記録がありません</p>
          )}
          {measurementList.map((m, idx) => {
            const prev = measurementList[idx + 1]; // 次の要素＝より過去の測定
            const weightDiff = diffLabel(m.weight, prev?.weight ?? null, "kg");
            const fatDiff = diffLabel(m.body_fat, prev?.body_fat ?? null, "%");
            const muscleDiff = diffLabel(
              m.muscle_mass,
              prev?.muscle_mass ?? null,
              "kg"
            );

            return (
              <div key={m.id} className="rounded-2xl bg-white p-4 shadow-card">
                <p className="mb-3 text-xs text-ink/50">
                  測定日: {formatDate(m.measurement_date)}
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-ink/50">体重</p>
                    <p className="text-lg font-bold text-ink">
                      {m.weight ?? "―"} kg{" "}
                      {weightDiff && (
                        <span className={`ml-1 text-sm ${weightDiff.colorClass}`}>
                          {weightDiff.label}
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-ink/50">体脂肪率</p>
                    <p className="text-lg font-bold text-ink">
                      {m.body_fat ?? "―"} %{" "}
                      {fatDiff && (
                        <span className={`ml-1 text-sm ${fatDiff.colorClass}`}>
                          {fatDiff.label}
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-ink/50">筋肉量</p>
                    <p className="text-lg font-bold text-ink">
                      {m.muscle_mass ?? "―"} kg{" "}
                      {muscleDiff && (
                        <span className={`ml-1 text-sm ${muscleDiff.colorClass}`}>
                          {muscleDiff.label}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    m.posture_image_1_url,
                    m.posture_image_2_url,
                    m.posture_image_3_url,
                    m.test_result_image_url,
                  ]
                    .filter(Boolean)
                    .map((url, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={i}
                        src={url!}
                        alt="測定写真"
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
