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
    <div className="flex h-full flex-col gap-2 overflow-y-auto px-4 py-3 md:py-8">
      <h2 className="px-1 text-sm font-bold uppercase tracking-wide text-slate-500 md:text-base">
        Shop by category
      </h2>
      <div className="grid grid-cols-4 gap-x-2 gap-y-3 md:grid-cols-6 md:gap-x-4 md:gap-y-6">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.35, ease: "easeOut" }}
          >
            <Link
              href={`/shop?category=${cat.slug}`}
              className="group flex flex-col items-center gap-1.5 transition active:scale-95"
            >
              <div className="relative aspect-square w-full max-w-16 overflow-hidden rounded-full bg-slate-100 shadow-[0_2px_10px_rgba(217,74,180,0.18)] ring-2 ring-white transition group-hover:shadow-[0_4px_16px_rgba(217,74,180,0.3)] md:max-w-20">
                <Image src={cat.logoUrl} alt={cat.name} fill sizes="80px" className="object-cover" />
                <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-fuchsia-500/10" />
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
