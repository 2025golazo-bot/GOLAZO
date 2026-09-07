"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import StaffToggle from "@/components/StaffToggle";
import type { District, StaffName } from "@/types/database";

const DISTRICTS: District[] = ["板橋区", "北区", "その他"];

export default function NewLocalInfoForm() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [schoolOrTeam, setSchoolOrTeam] = useState("");
  const [district, setDistrict] = useState<District>("板橋区");
  const [eventName, setEventName] = useState("");
  const [url, setUrl] = useState("");
  const [staff, setStaff] = useState<StaffName>("TAKA");
  const [memo, setMemo] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!schoolOrTeam || !eventName) return;
    setSaving(true);
    const { error } = await supabase.from("local_info").insert({
      school_or_team_name: schoolOrTeam,
      district,
      event_name: eventName,
      url: url || null,
      staff_name: staff,
      memo: memo || null,
    });
    setSaving(false);
    if (!error) {
      setOpen(false);
      setSchoolOrTeam("");
      setEventName("");
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
        ＋ 近隣情報を追加
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
            学校名/チーム名 *
          </label>
          <input
            required
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={schoolOrTeam}
            onChange={(e) => setSchoolOrTeam(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-ink/60">
            地区
          </label>
          <div className="inline-flex gap-2">
            {DISTRICTS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDistrict(d)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  district === d
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-ink/60 hover:bg-gray-200"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-ink/60">
            行事名 *
          </label>
          <input
            required
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
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
