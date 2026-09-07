"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import StaffToggle from "@/components/StaffToggle";
import type { StaffName } from "@/types/database";

export default function NewTaskForm() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [staff, setStaff] = useState<StaffName>("TAKA");
  const [content, setContent] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [memo, setMemo] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content) return;
    setSaving(true);
    const { error } = await supabase.from("tasks").insert({
      staff_name: staff,
      content,
      due_date: dueDate || null,
      memo: memo || null,
    });
    setSaving(false);
    if (!error) {
      setOpen(false);
      setContent("");
      setDueDate("");
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
        ＋ タスクを追加
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-primary-light bg-white p-5 shadow-card"
    >
      <div>
        <label className="mb-1 block text-xs font-semibold text-ink/60">
          担当者
        </label>
        <StaffToggle value={staff} onChange={setStaff} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-ink/60">
          内容 *
        </label>
        <input
          required
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-ink/60">
          締切日
        </label>
        <input
          type="date"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
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
          type="submit"
          disabled={saving}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {saving ? "保存中..." : "タスクを保存"}
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
