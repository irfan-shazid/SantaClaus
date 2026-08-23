import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import ProductGrid from "@/components/shop/ProductGrid";
import ShopFilters from "@/components/shop/ShopFilters";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; type?: string; q?: string }>;
}) {
  const params = await searchParams;

  const where: Prisma.ProductWhereInput = {};
  if (params.category) where.category = { slug: params.category };
  if (params.type === "CLOTHING" || params.type === "TOY") where.type = params.type;
  if (params.q) where.name = { contains: params.q, mode: "insensitive" };

  const [products, categories] = await Promise.all([
    prisma.product.findMany({ where, orderBy: { createdAt: "desc" } }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
      <h1 className="mb-4 text-2xl font-extrabold text-slate-900 md:text-3xl">Shop</h1>
      <Suspense fallback={null}>
        <ShopFilters categories={categories} />
      </Suspense>
      <div className="mt-5">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
