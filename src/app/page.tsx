import Link from "next/link";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import Hero from "@/components/home/Hero";
import ProductGrid from "@/components/shop/ProductGrid";

// Keep the page itself dynamic (no build-time prerender dependency on the DB being
// reachable), but cache the underlying query results for a short window so repeat
// requests don't hit Postgres every time.
export const dynamic = "force-dynamic";

const getHomeData = unstable_cache(
  async () => {
    const [categories, featured] = await Promise.all([
      prisma.category.findMany({ orderBy: { order: "asc" } }),
      prisma.product.findMany({
        where: { featured: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);
    return { categories, featured };
  },
  ["home-page-data"],
  { revalidate: 30 }
);

export default async function HomePage() {
  const { categories, featured } = await getHomeData();

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
