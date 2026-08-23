"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ShopFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category") ?? "";
  const activeType = searchParams.get("type") ?? "";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  const chipClass = (active: boolean) =>
    `shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
      active ? "bg-fuchsia-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
    }`;

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        <button onClick={() => updateParam("type", "")} className={chipClass(activeType === "")}>
          All
        </button>
        <button onClick={() => updateParam("type", "CLOTHING")} className={chipClass(activeType === "CLOTHING")}>
          Clothing
        </button>
        <button onClick={() => updateParam("type", "TOY")} className={chipClass(activeType === "TOY")}>
          Toys
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        <button onClick={() => updateParam("category", "")} className={chipClass(activeCategory === "")}>
          All categories
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => updateParam("category", c.slug)}
            className={chipClass(activeCategory === c.slug)}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
