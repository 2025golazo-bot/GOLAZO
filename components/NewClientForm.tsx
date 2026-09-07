"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewClientForm() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    parent_name: "",
    child_name: "",
    birth_date: "",
    first_session_date: "",
    concerns_and_goals: "",
  });
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.child_name || !form.birth_date) return;
    setSaving(true);
    const { error } = await supabase.from("clients").insert({
      parent_name: form.parent_name || null,
      child_name: form.child_name,
      birth_date: form.birth_date,
      first_session_date: form.first_session_date || null,
      concerns_and_goals: form.concerns_and_goals || null,
    });
    setSaving(false);
    if (!error) {
      setOpen(false);
      setForm({
        parent_name: "",
        child_name: "",
        birth_date: "",
        first_session_date: "",
        concerns_and_goals: "",
      });
      router.refresh();
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-card hover:bg-primary-dark"
      >
        ＋ 新規顧客を登録
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-primary-light bg-white p-5 shadow-card"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-ink/60">
            保護者名
          </label>
          <input
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={form.parent_name}
            onChange={(e) => setForm({ ...form, parent_name: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-ink/60">
            お子様名 *
          </label>
          <input
            required
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={form.child_name}
            onChange={(e) => setForm({ ...form, child_name: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-ink/60">
            生年月日 *
          </label>
          <input
            required
            type="date"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={form.birth_date}
            onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-ink/60">
            初回セッション日
          </label>
          <input
            type="date"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={form.first_session_date}
            onChange={(e) =>
              setForm({ ...form, first_session_date: e.target.value })
            }
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-ink/60">
          悩み・目標
        </label>
        <textarea
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          rows={2}
          value={form.concerns_and_goals}
          onChange={(e) =>
            setForm({ ...form, concerns_and_goals: e.target.value })
          }
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {saving ? "登録中..." : "登録する"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-ink/60 hover:bg-gray-200"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
