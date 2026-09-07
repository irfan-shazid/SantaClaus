"use client";

import Link from "next/link";
import { ShoppingBag, User } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { openCart } from "@/store/uiSlice";
import SantaLogo from "./SantaLogo";

export default function Header() {
  const { data: session } = useSession();
  const dispatch = useAppDispatch();
  const count = useAppSelector((s) => s.cart.items.reduce((n, i) => n + i.quantity, 0));

  const accountHref = session ? (session.user.role === "ADMIN" ? "/admin" : "/account") : "/login";

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-fuchsia-100/60 bg-white/60 backdrop-blur-md md:h-16">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-1.5 text-lg font-extrabold tracking-tight text-fuchsia-600 md:text-xl">
          <SantaLogo className="h-7 w-7 animate-santa-peek md:h-8 md:w-8" />
          Santa<span className="text-slate-900">Claus</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
          <Link href="/" className="transition hover:text-fuchsia-600">
            Home
          </Link>
          <Link href="/shop" className="transition hover:text-fuchsia-600">
            Shop
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <button
            aria-label="Open cart"
            onClick={() => dispatch(openCart())}
            className="relative rounded-full p-2 transition hover:bg-slate-100 active:scale-95"
          >
            <ShoppingBag className="h-5 w-5 text-slate-700" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-fuchsia-600 px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </button>
          <Link
            href={accountHref}
            aria-label="Account"
            className="hidden rounded-full p-2 transition hover:bg-slate-100 active:scale-95 md:inline-flex"
          >
            <User className="h-5 w-5 text-slate-700" />
          </Link>
        </div>
      </div>
    </header>
  );
}
