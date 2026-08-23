"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Store, ShoppingBag, User } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { openCart } from "@/store/uiSlice";

export default function MobileTabBar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const dispatch = useAppDispatch();
  const count = useAppSelector((s) => s.cart.items.reduce((n, i) => n + i.quantity, 0));

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const tabClass = (active: boolean) =>
    `flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-semibold ${
      active ? "text-fuchsia-600" : "text-slate-500"
    }`;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 border-t border-fuchsia-100/60 bg-white/75 backdrop-blur-md md:hidden">
      <Link href="/" className={tabClass(isActive("/"))}>
        <Home className="h-5 w-5" />
        Home
      </Link>
      <Link href="/shop" className={tabClass(isActive("/shop"))}>
        <Store className="h-5 w-5" />
        Shop
      </Link>
      <button onClick={() => dispatch(openCart())} className={tabClass(false) + " relative"}>
        <ShoppingBag className="h-5 w-5" />
        Cart
        {count > 0 && (
          <span className="absolute right-6 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-fuchsia-600 px-1 text-[9px] font-bold text-white">
            {count}
          </span>
        )}
      </button>
      <Link href={session ? "/account" : "/login"} className={tabClass(isActive("/account"))}>
        <User className="h-5 w-5" />
        Account
      </Link>
    </nav>
  );
}
