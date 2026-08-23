"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Banner3D from "@/components/three/Banner3D";
import CategoryScroller, { type CategoryCardData } from "@/components/home/CategoryScroller";

export default function Hero({ categories }: { categories: CategoryCardData[] }) {
  return (
    <section className="relative flex h-[calc(100svh-7.5rem)] max-h-[700px] min-h-[420px] flex-col md:h-auto md:max-h-none md:min-h-0">
      <div className="relative h-[58%] shrink-0 overflow-hidden rounded-b-[2.5rem] md:h-[74vh] md:min-h-[540px] md:rounded-b-[3rem]">
        <Banner3D />

        <div className="relative z-10 flex h-full flex-col justify-end p-5 pb-6 md:justify-center md:p-16">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-2 w-fit rounded-full bg-white/70 px-3 py-1 text-xs font-bold uppercase tracking-wider text-fuchsia-700 backdrop-blur md:text-sm"
          >
            Playful & cozy
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="max-w-md text-3xl font-extrabold leading-tight text-white drop-shadow-md sm:text-4xl md:max-w-xl md:text-6xl"
          >
            Clothes & toys your kids will love
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="mt-4"
          >
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-900 shadow-lg transition active:scale-95 md:px-7 md:py-3.5 md:text-base"
            >
              Shop now
              <span aria-hidden>→</span>
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="min-h-0 flex-1 md:flex-none">
        <CategoryScroller categories={categories} />
      </div>
    </section>
  );
}
