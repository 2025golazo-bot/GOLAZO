"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import StaffToggle from "@/components/StaffToggle";
import ImageUploadInput from "@/components/ImageUploadInput";
import type { StaffName } from "@/types/database";

export default function SessionLogForm({ clientId }: { clientId: string }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [staff, setStaff] = useState<StaffName>("TAKA");
  const [content, setContent] = useState("");
  const [homeworkText, setHomeworkText] = useState("");
  const [memo, setMemo] = useState("");
  const [homeworkImageUrl, setHomeworkImageUrl] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content) return;
    setSaving(true);
    const { error } = await supabase.from("session_logs").insert({
      client_id: clientId,
      staff_name: staff,
      content,
      homework_text: homeworkText || null,
      homework_image_url: homeworkImageUrl,
      memo: memo || null,
    });
    setSaving(false);
    if (!error) {
      setOpen(false);
      setContent("");
      setHomeworkText("");
      setMemo("");
      setHomeworkImageUrl(null);
      router.refresh();
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-card hover:bg-primary-dark"
      >
        ＋ セッション記録を追加
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
        <textarea
          required
          rows={3}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-ink/60">
          宿題
        </label>
        <input
          className="mb-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          placeholder="宿題の内容"
          value={homeworkText}
          onChange={(e) => setHomeworkText(e.target.value)}
        />
        <ImageUploadInput
          label="宿題の写真添付"
          folder={`clients/${clientId}/homework`}
          onUploaded={setHomeworkImageUrl}
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
          {saving ? "保存中..." : "記録を保存"}
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
