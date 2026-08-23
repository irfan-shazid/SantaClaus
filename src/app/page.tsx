import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Hero from "@/components/home/Hero";
import ProductGrid from "@/components/shop/ProductGrid";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, featured] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    prisma.product.findMany({
      where: { featured: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return (
    <div>
      <Hero categories={categories} />

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-14">
        <div className="mb-4 flex items-center justify-between md:mb-6">
          <h2 className="text-xl font-extrabold text-slate-900 md:text-2xl">Featured picks</h2>
          <Link href="/shop" className="text-sm font-semibold text-fuchsia-600 hover:underline">
            View all →
          </Link>
        </div>
        {featured.length > 0 ? (
          <ProductGrid products={featured} />
        ) : (
          <p className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">
            New arrivals are on the way — check back soon!
          </p>
        )}
      </section>
    </div>
  );
}
