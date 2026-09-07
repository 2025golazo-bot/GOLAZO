"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import StatusToggle from "@/components/StatusToggle";
import { formatDate } from "@/lib/utils";
import type { Task, TaskStatus } from "@/types/database";

function addDays(dateStr: string | null, days: number): string {
  const base = dateStr ? new Date(dateStr) : new Date();
  base.setDate(base.getDate() + days);
  return base.toISOString().slice(0, 10);
}

export default function TaskRow({ task }: { task: Task }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function updateStatus(status: TaskStatus) {
    setBusy(true);
    await supabase.from("tasks").update({ status }).eq("id", task.id);
    setBusy(false);
    router.refresh();
  }

  async function copyTask(days: number) {
    setBusy(true);
    await supabase.from("tasks").insert({
      staff_name: task.staff_name,
      content: task.content,
      memo: task.memo,
      due_date: addDays(task.due_date, days),
      status: "unstarted",
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-dark">
            {task.staff_name}
          </span>
          <span className="text-xs text-ink/50">
            締切: {formatDate(task.due_date)}
          </span>
        </div>
        <p className="text-sm font-medium text-ink">{task.content}</p>
        {task.memo && <p className="text-xs text-ink/40">{task.memo}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <StatusToggle value={task.status} onChange={updateStatus} />
        <button
          disabled={busy}
          onClick={() => copyTask(1)}
          className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-ink/60 hover:bg-gray-200 disabled:opacity-50"
        >
          明日へコピー
        </button>
        <button
          disabled={busy}
          onClick={() => copyTask(7)}
          className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-ink/60 hover:bg-gray-200 disabled:opacity-50"
        >
          来週へコピー
        </button>
      </div>
    </div>
  );
}
