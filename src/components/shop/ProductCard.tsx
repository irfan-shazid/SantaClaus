"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { formatTaka } from "@/lib/format";
import { useAppDispatch } from "@/store/hooks";
import { addItem } from "@/store/cartSlice";
import { openCart } from "@/store/uiSlice";

export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  price: number;
  images: string[];
  stock: number;
  type: "CLOTHING" | "TOY";
  variants?: string[];
}

export default function ProductCard({ product, index = 0 }: { product: ProductCardData; index?: number }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const outOfStock = product.stock <= 0;

  function cartLine() {
    return {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0] ?? "",
      price: product.price,
      stock: product.stock,
      variant: product.variants?.[0] ?? null,
      quantity: 1,
    };
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (outOfStock) return;
    dispatch(addItem(cartLine()));
    dispatch(openCart());
    toast.success(`${product.name} added to cart`);
  }

  function handleBuyNow(e: React.MouseEvent) {
    e.preventDefault();
    if (outOfStock) return;
    dispatch(addItem(cartLine()));
    router.push("/checkout");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: Math.min(index, 6) * 0.04 }}
      className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-100 transition hover:shadow-lg"
    >
      <Link href={`/shop/${product.slug}`} className="group block">
        <div className="relative aspect-square overflow-hidden bg-slate-100">
          {product.images[0] && (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          )}
          {outOfStock && (
            <span className="absolute left-2 top-2 rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] font-bold text-white">
              Out of stock
            </span>
          )}
        </div>
      </Link>

      <div className="p-3">
        <Link href={`/shop/${product.slug}`}>
          <p className="line-clamp-1 text-sm font-semibold text-slate-800">{product.name}</p>
        </Link>
        <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
          {product.type === "CLOTHING" ? "Clothing" : "Toy"}
        </p>
        <p className="mt-1 text-sm font-bold text-fuchsia-600">{formatTaka(product.price)}</p>

        <div className="mt-2.5 flex items-center gap-1.5">
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            aria-label="Add to cart"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-fuchsia-400 hover:text-fuchsia-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleBuyNow}
            disabled={outOfStock}
            className="flex-1 rounded-full bg-fuchsia-600 py-1.5 text-xs font-bold text-white transition active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Buy now
          </button>
        </div>
        <Link
          href={`/shop/${product.slug}`}
          className="mt-1.5 block text-center text-[11px] font-semibold text-slate-400 transition hover:text-fuchsia-600"
        >
          View details
        </Link>
      </div>
    </motion.div>
  );
}
