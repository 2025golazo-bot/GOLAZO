"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ja } from "date-fns/locale";
import TaskRow from "@/components/TaskRow";
import type { Task } from "@/types/database";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export default function TaskCalendar({ tasks }: { tasks: Task[] }) {
  const [month, setMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    return eachDayOfInterval({ start, end });
  }, [month]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach((t) => {
      if (!t.due_date) return;
      const key = t.due_date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    });
    return map;
  }, [tasks]);

  const selectedKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
  const selectedTasks = selectedKey ? tasksByDate.get(selectedKey) || [] : [];
  const undatedTasks = tasks.filter((t) => !t.due_date);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-4 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <button
            onClick={() => setMonth((m) => subMonths(m, 1))}
            className="rounded-lg px-2 py-1 text-ink/50 hover:bg-gray-100"
          >
            ←
          </button>
          <p className="text-sm font-bold text-ink">
            {format(month, "yyyy年 M月", { locale: ja })}
          </p>
          <button
            onClick={() => setMonth((m) => addMonths(m, 1))}
            className="rounded-lg px-2 py-1 text-ink/50 hover:bg-gray-100"
          >
            →
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-ink/40">
          {WEEKDAYS.map((w) => (
            <div key={w} className="py-1">
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayTasks = tasksByDate.get(key) || [];
            const inMonth = isSameMonth(day, month);
            const selected = selectedDate && isSameDay(day, selectedDate);
            return (
              <button
                key={key}
                onClick={() => setSelectedDate(day)}
                className={`flex h-16 flex-col items-center justify-start rounded-lg border p-1 text-xs transition-colors ${
                  selected
                    ? "border-primary bg-primary-50"
                    : "border-transparent hover:bg-gray-50"
                } ${inMonth ? "text-ink" : "text-ink/25"}`}
              >
                <span>{format(day, "d")}</span>
                {dayTasks.length > 0 && (
                  <span className="mt-1 rounded-full bg-accent px-1.5 text-[10px] font-bold text-ink">
                    {dayTasks.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-ink/60">
          {selectedDate
            ? `${format(selectedDate, "yyyy年M月d日", { locale: ja })} のタスク`
            : "日付を選択してください"}
        </h3>
        {selectedTasks.length === 0 && (
          <p className="text-sm text-ink/30">この日のタスクはありません</p>
        )}
        {selectedTasks.map((t) => (
          <TaskRow key={t.id} task={t} />
        ))}

        {undatedTasks.length > 0 && (
          <>
            <h3 className="pt-4 text-sm font-semibold text-ink/60">
              締切未設定のタスク
            </h3>
            {undatedTasks.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
