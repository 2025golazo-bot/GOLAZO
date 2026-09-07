"use client";

import type { TaskStatus } from "@/types/database";

const STATUSES: { value: TaskStatus; label: string }[] = [
  { value: "unstarted", label: "未着手" },
  { value: "in_progress", label: "進行中" },
  { value: "completed", label: "完了" },
];

const ACTIVE_CLASS: Record<TaskStatus, string> = {
  unstarted: "bg-gray-400 text-white",
  in_progress: "bg-primary text-white",
  completed: "bg-green-600 text-white",
};

interface StatusToggleProps {
  value: TaskStatus;
  onChange: (status: TaskStatus) => void;
}

export default function StatusToggle({ value, onChange }: StatusToggleProps) {
  return (
    <div className="inline-flex gap-1.5">
      {STATUSES.map((s) => {
        const active = value === s.value;
        return (
          <button
            key={s.value}
            type="button"
            onClick={() => onChange(s.value)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              active
                ? ACTIVE_CLASS[s.value]
                : "bg-gray-100 text-ink/50 hover:bg-gray-200"
            }`}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
