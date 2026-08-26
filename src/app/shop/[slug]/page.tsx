import { notFound } from "next/navigation";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import ImageGallery from "@/components/shop/ImageGallery";
import AddToCartPanel from "@/components/shop/AddToCartPanel";
import type { Metadata } from "next";

// Keep the page dynamic (no build-time DB dependency), but cache each product's
// query result briefly so repeat views don't hit Postgres every time. Checkout still
// re-validates stock server-side, so a briefly-stale stock count here can never oversell.
export const dynamic = "force-dynamic";

const getProduct = unstable_cache(
  async (slug: string) => {
    return prisma.product.findUnique({
      where: { slug },
      include: { category: true },
    });
  },
  ["product-by-slug"],
  { revalidate: 30 }
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  return { title: product.name, description: product.description };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">
      <Link href={`/shop?category=${product.category.slug}`} className="text-xs font-semibold text-fuchsia-600">
        {product.category.name}
      </Link>

      <div className="mt-3 grid gap-8 md:grid-cols-2">
        <ImageGallery images={product.images} name={product.name} />

        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 md:text-3xl">{product.name}</h1>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">{product.description}</p>

          <div className="mt-6">
            <AddToCartPanel
              id={product.id}
              slug={product.slug}
              name={product.name}
              price={product.price}
              image={product.images[0] ?? ""}
              stock={product.stock}
              variants={product.variants}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
