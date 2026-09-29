import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { CATALOG_TAG } from "@/lib/catalog-cache";
import { prisma } from "@/lib/prisma";
import ProductGrid from "@/components/shop/ProductGrid";
import ShopFilters from "@/components/shop/ShopFilters";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

// Cached per filter combination (the arguments form part of the cache key), so
// browsing back and forth between categories doesn't re-query Postgres each time.
// The page stays dynamic, so there's no build-time dependency on the database.
const getShopData = unstable_cache(
  async (category?: string, type?: string, q?: string) => {
    // Upcoming products aren't for sale yet - keep them off the regular browse/search listing.
    const where: Prisma.ProductWhereInput = { isUpcoming: false };
    if (category) where.category = { slug: category };
    if (type === "CLOTHING" || type === "TOY") where.type = type;
    if (q) where.name = { contains: q, mode: "insensitive" };

    const [products, categories] = await Promise.all([
      prisma.product.findMany({ where, orderBy: { createdAt: "desc" } }),
      prisma.category.findMany({ orderBy: { order: "asc" } }),
    ]);
    return { products, categories };
  },
  ["shop-page-data"],
  { revalidate: 30, tags: [CATALOG_TAG] }
);

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; type?: string; q?: string }>;
}) {
  const params = await searchParams;
  const { products, categories } = await getShopData(params.category, params.type, params.q);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
      <h1 className="mb-4 text-2xl font-extrabold text-stone-900 md:text-3xl">Shop</h1>
      <Suspense fallback={null}>
        <ShopFilters categories={categories} />
      </Suspense>
      <div className="mt-5">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
