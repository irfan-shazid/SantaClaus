"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CalendarRange, X } from "lucide-react";

export default function AccountsFilters({ months }: { months: { value: string; label: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const month = searchParams.get("month") ?? "";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const hasFilter = Boolean(month || from || to);

  function apply(next: { month?: string; from?: string; to?: string }) {
    const params = new URLSearchParams();
    if (next.month) params.set("month", next.month);
    if (next.from) params.set("from", next.from);
    if (next.to) params.set("to", next.to);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-fuchsia-100 text-fuchsia-600">
          <CalendarRange className="h-4 w-4" />
        </div>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Reporting period</p>
        {hasFilter && (
          <button
            onClick={() => apply({})}
            className="ml-auto flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-100"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-400">Month</label>
          <select
            value={month}
            // Picking a month replaces any custom range, so the two never conflict.
            onChange={(e) => apply({ month: e.target.value })}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-fuchsia-400"
          >
            <option value="">All time</option>
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-400">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => apply({ from: e.target.value, to })}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-fuchsia-400"
          />
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-400">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => apply({ from, to: e.target.value })}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-fuchsia-400"
          />
        </div>
      </div>
    </div>
  );
}
