interface AlertBadgeProps {
  tone: "warning" | "urgent" | "info" | "success";
  children: React.ReactNode;
}

const TONE_CLASS: Record<AlertBadgeProps["tone"], string> = {
  warning: "bg-accent text-ink border border-accent-dark",
  urgent: "bg-accent text-red-700 border border-red-300 animate-pulse",
  info: "bg-primary-50 text-primary-dark border border-primary-light",
  success: "bg-green-100 text-green-700 border border-green-300",
};

export default function AlertBadge({ tone, children }: AlertBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${TONE_CLASS[tone]}`}
    >
      {children}
    </span>
  );
}
