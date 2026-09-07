"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeCart } from "@/store/uiSlice";
import { decrementItem, incrementItem, removeItem } from "@/store/cartSlice";
import { formatTaka } from "@/lib/format";

export default function CartDrawer() {
  const open = useAppSelector((s) => s.ui.cartOpen);
  const items = useAppSelector((s) => s.cart.items);
  const dispatch = useAppDispatch();

  const itemCount = items.reduce((n, i) => n + i.quantity, 0);
  const subtotal = items.reduce((n, i) => n + i.price * i.quantity, 0);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[1px]"
            onClick={() => dispatch(closeCart())}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Your cart</h2>
                {itemCount > 0 && (
                  <p className="text-xs font-medium text-slate-400">
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </p>
                )}
              </div>
              <button
                onClick={() => dispatch(closeCart())}
                aria-label="Close cart"
                className="rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="mt-10 flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-fuchsia-50">
                    <ShoppingBag className="h-7 w-7 text-fuchsia-300" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-700">Your cart is empty</p>
                  <p className="mt-1 text-xs text-slate-400">Add something cute for your little one.</p>
                  <Link
                    href="/shop"
                    onClick={() => dispatch(closeCart())}
                    className="mt-4 rounded-full bg-fuchsia-600 px-5 py-2 text-xs font-bold text-white shadow-sm transition active:scale-95"
                  >
                    Browse shop
                  </Link>
                </div>
              ) : (
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li
                      key={`${item.productId}-${item.variant ?? ""}`}
                      className="flex gap-3 rounded-xl p-1.5 transition hover:bg-slate-50"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="line-clamp-1 text-sm font-semibold text-slate-800">{item.name}</p>
                        {item.variant && <p className="text-xs text-slate-500">{item.variant}</p>}
                        <p className="mt-0.5 text-sm font-bold text-fuchsia-600">{formatTaka(item.price)}</p>
                        <div className="mt-1.5 flex items-center gap-1 rounded-full border border-slate-200 p-0.5 w-fit">
                          <button
                            onClick={() => dispatch(decrementItem({ productId: item.productId, variant: item.variant }))}
                            aria-label="Decrease quantity"
                            className="flex h-6 w-6 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 active:scale-90"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => dispatch(incrementItem({ productId: item.productId, variant: item.variant }))}
                            disabled={item.quantity >= item.stock}
                            aria-label="Increase quantity"
                            className="flex h-6 w-6 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => dispatch(removeItem({ productId: item.productId, variant: item.variant }))}
                        className="h-fit rounded-full p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-slate-100 p-4">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-bold text-slate-900">{formatTaka(subtotal)}</span>
                </div>
                <p className="mb-3 text-xs text-slate-400">Delivery charge is calculated at checkout.</p>
                <Link
                  href="/checkout"
                  onClick={() => dispatch(closeCart())}
                  className="block w-full rounded-full bg-fuchsia-600 py-3 text-center text-sm font-bold text-white shadow-md shadow-fuchsia-200 transition active:scale-95"
                >
                  Checkout
                </Link>
                <Link
                  href="/cart"
                  onClick={() => dispatch(closeCart())}
                  className="mt-2 block w-full rounded-full py-2 text-center text-xs font-semibold text-slate-500 transition hover:text-fuchsia-600"
                >
                  View full cart
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
