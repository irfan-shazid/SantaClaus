"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export interface CategoryCardData {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
}

export default function CategoryScroller({ categories }: { categories: CategoryCardData[] }) {
  if (categories.length === 0) return null;

  return (
    <div className="flex h-full flex-col justify-center gap-2 px-4 py-3 md:py-8">
      <h2 className="px-1 text-sm font-bold uppercase tracking-wide text-slate-500 md:text-base">
        Shop by category
      </h2>
      <div
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-6 md:gap-4 md:overflow-visible"
        style={{ scrollbarWidth: "none" }}
      >
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.35, ease: "easeOut" }}
            className="snap-start"
          >
            <Link
              href={`/shop?category=${cat.slug}`}
              className="flex w-20 shrink-0 flex-col items-center gap-1.5 rounded-2xl bg-white/80 p-2 shadow-sm ring-1 ring-slate-900/5 transition active:scale-95 md:w-full md:p-3"
            >
              <div className="relative h-14 w-14 overflow-hidden rounded-full bg-slate-100 ring-2 ring-white md:h-16 md:w-16">
                <Image src={cat.logoUrl} alt={cat.name} fill sizes="64px" className="object-cover" />
              </div>
              <span className="line-clamp-1 text-center text-[11px] font-semibold text-slate-700 md:text-xs">
                {cat.name}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
