"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ImageUploadInput from "@/components/ImageUploadInput";

export default function MeasurementForm({ clientId }: { clientId: string }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [muscleMass, setMuscleMass] = useState("");
  const [posture1, setPosture1] = useState<string | null>(null);
  const [posture2, setPosture2] = useState<string | null>(null);
  const [posture3, setPosture3] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("measurements").insert({
      client_id: clientId,
      weight: weight ? parseFloat(weight) : null,
      body_fat: bodyFat ? parseFloat(bodyFat) : null,
      muscle_mass: muscleMass ? parseFloat(muscleMass) : null,
      posture_image_1_url: posture1,
      posture_image_2_url: posture2,
      posture_image_3_url: posture3,
      test_result_image_url: testResult,
    });
    setSaving(false);
    if (!error) {
      setOpen(false);
      setWeight("");
      setBodyFat("");
      setMuscleMass("");
      setPosture1(null);
      setPosture2(null);
      setPosture3(null);
      setTestResult(null);
      router.refresh();
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-card hover:bg-primary-dark"
      >
        ＋ 測定記録を追加
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-primary-light bg-white p-5 shadow-card"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-ink/60">
            体重（kg）
          </label>
          <input
            type="number"
            step="0.1"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-ink/60">
            体脂肪率（%）
          </label>
          <input
            type="number"
            step="0.1"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={bodyFat}
            onChange={(e) => setBodyFat(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-ink/60">
            筋肉量（kg）
          </label>
          <input
            type="number"
            step="0.1"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={muscleMass}
            onChange={(e) => setMuscleMass(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ImageUploadInput
          label="姿勢チェック（正面）"
          folder={`clients/${clientId}/posture`}
          onUploaded={setPosture1}
        />
        <ImageUploadInput
          label="姿勢チェック（側面）"
          folder={`clients/${clientId}/posture`}
          onUploaded={setPosture2}
        />
        <ImageUploadInput
          label="姿勢チェック（背面）"
          folder={`clients/${clientId}/posture`}
          onUploaded={setPosture3}
        />
      </div>

      <ImageUploadInput
        label="テスト結果写真"
        folder={`clients/${clientId}/test-result`}
        onUploaded={setTestResult}
      />

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {saving ? "保存中..." : "測定記録を保存"}
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
