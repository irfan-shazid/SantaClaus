"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { decrementItem, incrementItem, removeItem } from "@/store/cartSlice";
import { formatTaka } from "@/lib/format";

export default function CartPage() {
  const items = useAppSelector((s) => s.cart.items);
  const dispatch = useAppDispatch();
  const itemCount = items.reduce((n, i) => n + i.quantity, 0);
  const subtotal = items.reduce((n, i) => n + i.price * i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-5 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-fuchsia-50">
          <ShoppingBag className="h-9 w-9 text-fuchsia-300" />
        </div>
        <p className="mt-4 text-lg font-bold text-slate-800">Your cart is empty</p>
        <p className="mt-1 text-sm text-slate-500">Add something cute for your little one.</p>
        <Link
          href="/shop"
          className="mt-5 rounded-full bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-fuchsia-200 transition active:scale-95"
        >
          Browse shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Your cart</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
        </div>
        <Link
          href="/shop"
          className="hidden items-center gap-1.5 text-sm font-semibold text-fuchsia-600 hover:underline md:flex"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Continue shopping
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <ul className="space-y-3">
          {items.map((item) => {
            const lineTotal = item.price * item.quantity;
            const atMaxStock = item.quantity >= item.stock;
            return (
              <li
                key={`${item.productId}-${item.variant ?? ""}`}
                className="flex gap-4 rounded-2xl bg-white p-3 ring-1 ring-slate-100 transition hover:shadow-sm md:p-4"
              >
                <Link
                  href={`/shop/${item.slug}`}
                  className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100"
                >
                  <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
                </Link>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link href={`/shop/${item.slug}`} className="text-sm font-semibold text-slate-800 hover:text-fuchsia-600">
                      {item.name}
                    </Link>
                    {item.variant && <p className="mt-0.5 text-xs text-slate-500">{item.variant}</p>}
                    <p className="mt-1 text-sm font-bold text-fuchsia-600">{formatTaka(item.price)}</p>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded-full border border-slate-200 p-1">
                      <button
                        onClick={() => dispatch(decrementItem({ productId: item.productId, variant: item.variant }))}
                        aria-label="Decrease quantity"
                        className="flex h-7 w-7 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 active:scale-90"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold text-slate-800">{item.quantity}</span>
                      <button
                        onClick={() => dispatch(incrementItem({ productId: item.productId, variant: item.variant }))}
                        disabled={atMaxStock}
                        aria-label="Increase quantity"
                        className="flex h-7 w-7 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => dispatch(removeItem({ productId: item.productId, variant: item.variant }))}
                      aria-label="Remove item"
                      className="flex items-center gap-1 rounded-full px-2 py-1.5 text-xs font-semibold text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                  {atMaxStock && <p className="mt-1 text-[11px] font-medium text-amber-600">Only {item.stock} in stock</p>}
                </div>
                <p className="hidden shrink-0 self-center text-sm font-bold text-slate-900 md:block">
                  {formatTaka(lineTotal)}
                </p>
              </li>
            );
          })}
        </ul>

        <div className="h-fit rounded-2xl bg-white p-5 ring-1 ring-slate-100 md:sticky md:top-20">
          <p className="text-sm font-bold text-slate-800">Order summary</p>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-slate-500">
              Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
            </span>
            <span className="font-bold text-slate-900">{formatTaka(subtotal)}</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Delivery charge is calculated at checkout.</p>
          <Link
            href="/checkout"
            className="mt-4 block w-full rounded-full bg-fuchsia-600 py-3 text-center text-sm font-bold text-white shadow-md shadow-fuchsia-200 transition active:scale-95"
          >
            Proceed to checkout
          </Link>
          <Link
            href="/shop"
            className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-fuchsia-600 md:hidden"
          >
            <ArrowLeft className="h-3 w-3" />
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
