export function formatYen(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "¥0";
  return `¥${Math.round(amount).toLocaleString("ja-JP")}`;
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "未設定";
  const d = new Date(dateStr);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "未設定";
  const d = new Date(dateStr);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${String(
    d.getHours()
  ).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function diffLabel(
  current: number | null,
  previous: number | null,
  unit: string
): { label: string; colorClass: string } | null {
  if (current === null || previous === null) return null;
  const diff = Math.round((current - previous) * 10) / 10;
  if (diff === 0) return { label: `±0${unit}`, colorClass: "text-gray-500" };
  const sign = diff > 0 ? "+" : "";
  return {
    label: `${sign}${diff}${unit}`,
    colorClass: diff > 0 ? "text-red-600" : "text-blue-600",
  };
}

export function achievementRate(actual: number, target: number): number {
  if (!target) return 0;
  return Math.min(100, Math.round((actual / target) * 1000) / 10);
}
