"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import StaffToggle from "@/components/StaffToggle";
import type { MeetingType, StaffName } from "@/types/database";

const TYPES: MeetingType[] = ["月度MT", "週MT", "キャンペーン"];

interface TaskDraft {
  content: string;
  staff: StaffName;
  due_date: string;
}

export default function NewMeetingForm() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [meetingType, setMeetingType] = useState<MeetingType>("週MT");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [campaignTarget, setCampaignTarget] = useState("");
  const [taskDrafts, setTaskDrafts] = useState<TaskDraft[]>([]);
  const router = useRouter();
  const supabase = createClient();

  function addTaskDraft() {
    setTaskDrafts((prev) => [
      ...prev,
      { content: "", staff: "TAKA", due_date: "" },
    ]);
  }

  function updateTaskDraft(idx: number, patch: Partial<TaskDraft>) {
    setTaskDrafts((prev) =>
      prev.map((t, i) => (i === idx ? { ...t, ...patch } : t))
    );
  }

  function removeTaskDraft(idx: number) {
    setTaskDrafts((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title) return;
    setSaving(true);

    let linkedCampaignId: string | null = null;

    // キャンペーン自動連携: 種別が「キャンペーン」の場合、campaigns テーブルへ反映
    if (meetingType === "キャンペーン" && campaignName) {
      const { data: existing } = await supabase
        .from("campaigns")
        .select("id")
        .eq("name", campaignName)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("campaigns")
          .update({ target_count: Number(campaignTarget) || 0 })
          .eq("id", existing.id);
        linkedCampaignId = existing.id;
      } else {
        const { data: created } = await supabase
          .from("campaigns")
          .insert({
            name: campaignName,
            target_count: Number(campaignTarget) || 0,
            actual_count: 0,
          })
          .select("id")
          .single();
        linkedCampaignId = created?.id || null;
      }
    }

    const { data: meeting } = await supabase
      .from("meetings")
      .insert({
        meeting_type: meetingType,
        title,
        content: content || null,
        linked_campaign_id: linkedCampaignId,
      })
      .select("id")
      .single();

    // タスク自動連携: 議事録内で作成したタスクをタスクページへ追加
    if (meeting?.id && taskDrafts.length > 0) {
      for (const draft of taskDrafts) {
        if (!draft.content) continue;
        const { data: task } = await supabase
          .from("tasks")
          .insert({
            staff_name: draft.staff,
            content: draft.content,
            due_date: draft.due_date || null,
          })
          .select("id")
          .single();
        if (task?.id) {
          await supabase
            .from("meeting_tasks")
            .insert({ meeting_id: meeting.id, task_id: task.id });
        }
      }
    }

    setSaving(false);
    setOpen(false);
    setTitle("");
    setContent("");
    setCampaignName("");
    setCampaignTarget("");
    setTaskDrafts([]);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-card hover:bg-primary-dark"
      >
        ＋ 議事録を追加
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
          種別
        </label>
        <div className="inline-flex gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setMeetingType(t)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                meetingType === t
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-ink/60 hover:bg-gray-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-ink/60">
          タイトル *
        </label>
        <input
          required
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-ink/60">
          内容
        </label>
        <textarea
          rows={3}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      {meetingType === "キャンペーン" && (
        <div className="grid grid-cols-1 gap-4 rounded-lg bg-accent/30 p-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink/60">
              キャンペーン内容
            </label>
            <input
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink/60">
              目標数
            </label>
            <input
              type="number"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={campaignTarget}
              onChange={(e) => setCampaignTarget(e.target.value)}
            />
          </div>
          <p className="col-span-full text-xs text-ink/50">
            保存すると売上管理画面のキャンペーン実績表へ自動反映されます。
          </p>
        </div>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-semibold text-ink/60">
            議事録から作成するタスク
          </label>
          <button
            type="button"
            onClick={addTaskDraft}
            className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-ink/60 hover:bg-gray-200"
          >
            ＋ タスクを追加
          </button>
        </div>
        <div className="space-y-2">
          {taskDrafts.map((draft, idx) => (
            <div
              key={idx}
              className="flex flex-wrap items-center gap-2 rounded-lg bg-gray-50 p-2"
            >
              <StaffToggle
                value={draft.staff}
                onChange={(s) => updateTaskDraft(idx, { staff: s })}
                size="sm"
              />
              <input
                placeholder="タスク内容"
                className="flex-1 rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                value={draft.content}
                onChange={(e) =>
                  updateTaskDraft(idx, { content: e.target.value })
                }
              />
              <input
                type="date"
                className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                value={draft.due_date}
                onChange={(e) =>
                  updateTaskDraft(idx, { due_date: e.target.value })
                }
              />
              <button
                type="button"
                onClick={() => removeTaskDraft(idx)}
                className="text-xs text-red-500 hover:underline"
              >
                削除
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {saving ? "保存中..." : "議事録を保存"}
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
