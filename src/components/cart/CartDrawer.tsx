"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeCart } from "@/store/uiSlice";
import { decrementItem, incrementItem, removeItem } from "@/store/cartSlice";
import { formatTaka } from "@/lib/format";

export default function CartDrawer() {
  const open = useAppSelector((s) => s.ui.cartOpen);
  const items = useAppSelector((s) => s.cart.items);
  const dispatch = useAppDispatch();

  const subtotal = items.reduce((n, i) => n + i.price * i.quantity, 0);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40"
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
              <h2 className="text-lg font-bold text-slate-900">Your cart</h2>
              <button
                onClick={() => dispatch(closeCart())}
                aria-label="Close cart"
                className="rounded-full p-1.5 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <p className="mt-10 text-center text-sm text-slate-500">Your cart is empty.</p>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li key={`${item.productId}-${item.variant ?? ""}`} className="flex gap-3">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="line-clamp-1 text-sm font-semibold text-slate-800">{item.name}</p>
                        {item.variant && <p className="text-xs text-slate-500">{item.variant}</p>}
                        <p className="mt-0.5 text-sm font-bold text-fuchsia-600">{formatTaka(item.price)}</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <button
                            onClick={() => dispatch(decrementItem({ productId: item.productId, variant: item.variant }))}
                            className="rounded-full border border-slate-200 p-1 hover:bg-slate-50"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => dispatch(incrementItem({ productId: item.productId, variant: item.variant }))}
                            disabled={item.quantity >= item.stock}
                            className="rounded-full border border-slate-200 p-1 hover:bg-slate-50 disabled:opacity-40"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => dispatch(removeItem({ productId: item.productId, variant: item.variant }))}
                            className="ml-auto rounded-full p-1 text-slate-400 hover:bg-red-50 hover:text-red-500"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
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
                  className="block w-full rounded-full bg-fuchsia-600 py-3 text-center text-sm font-bold text-white shadow-md transition active:scale-95"
                >
                  Checkout
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
