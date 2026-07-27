"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const PERIODS = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
] as const;

export function StatsPeriodToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("period") ?? "today";

  function handleChange(period: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (period === "today") params.delete("period");
    else params.set("period", period);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="inline-flex items-center rounded-xl border border-[var(--color-border)] bg-white p-1">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => handleChange(p.value)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            current === p.value
              ? "bg-[var(--color-accent)] text-white"
              : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
