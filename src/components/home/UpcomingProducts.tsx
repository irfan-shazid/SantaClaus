"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { formatTaka } from "@/lib/format";

export interface UpcomingProductData {
  id: string;
  name: string;
  price: number;
  images: string[];
}

export default function UpcomingProducts({ products }: { products: UpcomingProductData[] }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isPending || !session) return;
    fetch("/api/wishlist")
      .then((res) => res.json())
      .then((data: { productIds: string[] }) => setWishlisted(new Set(data.productIds)))
      .catch(() => {});
  }, [session, isPending]);

  async function toggleWishlist(productId: string) {
    if (!session) {
      toast.error("Please sign in to save items to your wishlist.");
      router.push("/login");
      return;
    }
    if (pending.has(productId)) return;

    const alreadyWishlisted = wishlisted.has(productId);
    setPending((prev) => new Set(prev).add(productId));
    setWishlisted((prev) => {
      const next = new Set(prev);
      if (alreadyWishlisted) next.delete(productId);
      else next.add(productId);
      return next;
    });

    try {
      const res = await fetch(alreadyWishlisted ? `/api/wishlist/${productId}` : "/api/wishlist", {
        method: alreadyWishlisted ? "DELETE" : "POST",
        headers: alreadyWishlisted ? undefined : { "Content-Type": "application/json" },
        body: alreadyWishlisted ? undefined : JSON.stringify({ productId }),
      });
      if (!res.ok) throw new Error();
      toast.success(alreadyWishlisted ? "Removed from wishlist" : "Added to wishlist");
    } catch {
      setWishlisted((prev) => {
        const next = new Set(prev);
        if (alreadyWishlisted) next.add(productId);
        else next.delete(productId);
        return next;
      });
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPending((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  }

  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-14">
      <div className="mb-4 md:mb-6">
        <h2 className="text-xl font-extrabold text-slate-900 md:text-2xl">Upcoming products</h2>
        <p className="mt-0.5 text-sm text-slate-500">Save your favorites — we&apos;ll have them ready soon.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
        {products.map((product) => {
          const isWishlisted = wishlisted.has(product.id);
          return (
            <div key={product.id} className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-100">
              <div className="relative aspect-square overflow-hidden bg-slate-100">
                {product.images[0] && (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover"
                  />
                )}
                <span className="absolute left-2 top-2 rounded-full bg-violet-600/90 px-2 py-0.5 text-[10px] font-bold text-white">
                  Coming soon
                </span>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  aria-pressed={isWishlisted}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition active:scale-90"
                >
                  <Heart
                    className={`h-4 w-4 transition ${isWishlisted ? "fill-fuchsia-600 text-fuchsia-600" : "text-slate-500"}`}
                  />
                </button>
              </div>
              <div className="p-3">
                <p className="line-clamp-1 text-sm font-semibold text-slate-800">{product.name}</p>
                <p className="mt-1 text-sm font-bold text-fuchsia-600">{formatTaka(product.price)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
