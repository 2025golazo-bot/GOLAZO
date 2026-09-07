"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Client } from "@/types/database";

export default function ClientBasicInfoEditor({ client }: { client: Client }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nextReservation, setNextReservation] = useState(
    client.next_reservation_date || ""
  );
  const [goals, setGoals] = useState(client.concerns_and_goals || "");
  const [memo, setMemo] = useState(client.memo || "");
  const router = useRouter();
  const supabase = createClient();

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase
      .from("clients")
      .update({
        next_reservation_date: nextReservation || null,
        concerns_and_goals: goals || null,
        memo: memo || null,
      })
      .eq("id", client.id);
    setSaving(false);
    if (!error) {
      setEditing(false);
      router.refresh();
    }
  }

  if (!editing) {
    return (
      <div className="space-y-2 text-sm">
        <p>
          <span className="text-ink/50">次回予約日：</span>
          {client.next_reservation_date || "未設定"}
        </p>
        <p>
          <span className="text-ink/50">悩み・目標：</span>
          {client.concerns_and_goals || "未設定"}
        </p>
        <p>
          <span className="text-ink/50">メモ：</span>
          {client.memo || "―"}
        </p>
        <button
          onClick={() => setEditing(true)}
          className="mt-2 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-ink/60 hover:bg-gray-200"
        >
          編集する
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-semibold text-ink/60">
          次回予約日
        </label>
        <input
          type="date"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          value={nextReservation}
          onChange={(e) => setNextReservation(e.target.value)}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-ink/60">
          悩み・目標
        </label>
        <textarea
          rows={2}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          value={goals}
          onChange={(e) => setGoals(e.target.value)}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-ink/60">
          メモ
        </label>
        <textarea
          rows={2}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存する"}
        </button>
        <button
          onClick={() => setEditing(false)}
          className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-ink/60 hover:bg-gray-200"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}
