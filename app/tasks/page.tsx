import { createClient } from "@/lib/supabase/server";
import RealtimeWatcher from "@/components/RealtimeWatcher";
import NewTaskForm from "@/components/NewTaskForm";
import TaskCalendar from "@/components/TaskCalendar";
import NewMeetingForm from "@/components/NewMeetingForm";
import { formatDateTime } from "@/lib/utils";
import type { Task, Meeting } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const supabase = createClient();

  const [{ data: tasks }, { data: meetings }] = await Promise.all([
    supabase.from("tasks").select("*").order("due_date", { ascending: true }),
    supabase
      .from("meetings")
      .select("*")
      .order("meeting_date", { ascending: false }),
  ]);

  const taskList: Task[] = tasks || [];
  const meetingList: Meeting[] = meetings || [];

  return (
    <div className="space-y-10">
      <RealtimeWatcher tables={["tasks", "meetings", "campaigns"]} />

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-ink">業務タスク・カレンダー</h1>
          <NewTaskForm />
        </div>
        <TaskCalendar tasks={taskList} />
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-ink">ミーティング議事録</h2>
          <NewMeetingForm />
        </div>
        <div className="space-y-3">
          {meetingList.length === 0 && (
            <p className="text-center text-ink/40">議事録がありません</p>
          )}
          {meetingList.map((m) => (
            <div key={m.id} className="rounded-2xl bg-white p-4 shadow-card">
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-dark">
                  {m.meeting_type}
                </span>
                <span className="text-xs text-ink/40">
                  {formatDateTime(m.meeting_date)}
                </span>
              </div>
              <h3 className="font-semibold text-ink">{m.title}</h3>
              {m.content && (
                <p className="mt-1 whitespace-pre-wrap text-sm text-ink/70">
                  {m.content}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
