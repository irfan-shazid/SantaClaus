"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const TABS = [
  { key: "PENDING", label: "Pending" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "GIVEN_TO_RIDER", label: "Given to rider" },
  { key: "DELIVERED", label: "Delivered" },
];

export default function OrderTabs({ counts }: { counts: Record<string, number> }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get("status") ?? "PENDING";

  return (
    <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => router.push(`${pathname}?status=${tab.key}`)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
            active === tab.key ? "bg-fuchsia-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {tab.label} · {counts[tab.key] ?? 0}
        </button>
      ))}
    </div>
  );
}
