"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { addItem } from "@/store/cartSlice";
import { openCart } from "@/store/uiSlice";
import { formatTaka } from "@/lib/format";

interface Props {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  variants: string[];
}

export default function AddToCartPanel({ id, slug, name, price, image, stock, variants }: Props) {
  const dispatch = useAppDispatch();
  const [variant, setVariant] = useState<string | null>(variants[0] ?? null);
  const [quantity, setQuantity] = useState(1);
  const outOfStock = stock <= 0;

  function handleAddToCart() {
    if (outOfStock) return;
    dispatch(
      addItem({
        productId: id,
        slug,
        name,
        image,
        price,
        stock,
        variant,
        quantity,
      })
    );
    dispatch(openCart());
    toast.success(`${name} added to cart`);
  }

  return (
    <div className="space-y-5">
      <p className="text-2xl font-extrabold text-fuchsia-600">{formatTaka(price)}</p>

      {variants.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Options</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v}
                onClick={() => setVariant(v)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
                  variant === v
                    ? "border-fuchsia-600 bg-fuchsia-600 text-white"
                    : "border-slate-200 text-slate-600 hover:border-fuchsia-300"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Quantity</p>
        <div className="flex w-fit items-center gap-3 rounded-full border border-slate-200 px-3 py-1.5">
          <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-6 text-center text-sm font-semibold">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
            disabled={quantity >= stock}
            aria-label="Increase quantity"
            className="disabled:opacity-30"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={outOfStock}
        className="w-full rounded-full bg-fuchsia-600 py-3.5 text-sm font-bold text-white shadow-md transition active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {outOfStock ? "Out of stock" : "Add to cart"}
      </button>
    </div>
  );
}
