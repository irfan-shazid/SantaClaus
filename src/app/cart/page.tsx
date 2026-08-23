"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { decrementItem, incrementItem, removeItem } from "@/store/cartSlice";
import { formatTaka } from "@/lib/format";

export default function CartPage() {
  const items = useAppSelector((s) => s.cart.items);
  const dispatch = useAppDispatch();
  const subtotal = items.reduce((n, i) => n + i.price * i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-5 text-center">
        <p className="text-lg font-bold text-slate-800">Your cart is empty</p>
        <p className="mt-1 text-sm text-slate-500">Add something cute for your little one.</p>
        <Link href="/shop" className="mt-5 rounded-full bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white">
          Browse shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-8 md:py-10">
      <h1 className="mb-5 text-2xl font-extrabold text-slate-900">Your cart</h1>

      <ul className="space-y-4">
        {items.map((item) => (
          <li
            key={`${item.productId}-${item.variant ?? ""}`}
            className="flex gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-100"
          >
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
              <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">{item.name}</p>
              {item.variant && <p className="text-xs text-slate-500">{item.variant}</p>}
              <p className="mt-0.5 text-sm font-bold text-fuchsia-600">{formatTaka(item.price)}</p>
              <div className="mt-2 flex items-center gap-3">
                <button
                  onClick={() => dispatch(decrementItem({ productId: item.productId, variant: item.variant }))}
                  className="rounded-full border border-slate-200 p-1.5 hover:bg-slate-50"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                <button
                  onClick={() => dispatch(incrementItem({ productId: item.productId, variant: item.variant }))}
                  disabled={item.quantity >= item.stock}
                  className="rounded-full border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-40"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => dispatch(removeItem({ productId: item.productId, variant: item.variant }))}
                  className="ml-auto rounded-full p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 rounded-2xl bg-slate-50 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Subtotal</span>
          <span className="font-bold text-slate-900">{formatTaka(subtotal)}</span>
        </div>
        <p className="mt-1 text-xs text-slate-400">Delivery charge is calculated at checkout.</p>
        <Link
          href="/checkout"
          className="mt-4 block w-full rounded-full bg-fuchsia-600 py-3 text-center text-sm font-bold text-white shadow-md transition active:scale-95"
        >
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
}
