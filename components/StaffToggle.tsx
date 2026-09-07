"use client";

const STAFF = ["TAKA", "NANA"] as const;

interface StaffToggleProps {
  value: string | null;
  onChange: (staff: "TAKA" | "NANA") => void;
  allowUnset?: boolean;
  size?: "sm" | "md";
}

export default function StaffToggle({
  value,
  onChange,
  size = "md",
}: StaffToggleProps) {
  const padding = size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm";

  return (
    <div className="inline-flex gap-2">
      {STAFF.map((staff) => {
        const active = value === staff;
        return (
          <button
            key={staff}
            type="button"
            onClick={() => onChange(staff)}
            className={`${padding} rounded-full font-semibold transition-colors ${
              active
                ? "bg-primary text-white shadow-card"
                : "bg-gray-100 text-ink/60 hover:bg-gray-200"
            }`}
          >
            {staff}
          </button>
        );
      })}
    </div>
  );
}
