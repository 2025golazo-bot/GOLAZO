"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import StaffToggle from "@/components/StaffToggle";
import type { StaffName } from "@/types/database";

export default function NewTransactionForm() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [staff, setStaff] = useState<StaffName>("TAKA");
  const [memo, setMemo] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;
    setSaving(true);
    const { error } = await supabase.from("transactions").insert({
      name,
      url: url || null,
      staff_name: staff,
      memo: memo || null,
      source: "manual",
    });
    setSaving(false);
    if (!error) {
      setOpen(false);
      setName("");
      setUrl("");
      setMemo("");
      router.refresh();
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-card hover:bg-primary-dark"
      >
        ＋ 取引を追加
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
            名前 *
          </label>
          <input
            required
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-ink/60">
            詳細URL
          </label>
          <input
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-ink/60">
            担当者
          </label>
          <StaffToggle value={staff} onChange={setStaff} />
        </div>
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
          type="submit"
          disabled={saving}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {saving ? "保存中..." : "登録する"}
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
