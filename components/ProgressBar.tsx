interface ProgressBarProps {
  percent: number;
  label?: string;
  height?: "sm" | "md" | "lg";
}

export default function ProgressBar({
  percent,
  label,
  height = "md",
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  const heightClass =
    height === "sm" ? "h-2" : height === "lg" ? "h-5" : "h-3.5";

  return (
    <div className="w-full">
      {label && (
        <div className="mb-1 flex items-center justify-between text-sm text-ink/70">
          <span>{label}</span>
          <span className="font-semibold text-ink">{clamped.toFixed(1)}%</span>
        </div>
      )}
      <div className={`w-full rounded-full bg-gray-200 ${heightClass}`}>
        <div
          className={`${heightClass} rounded-full bg-accent transition-all duration-500`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
