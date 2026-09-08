"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Tags, Layers, Wallet, Heart, Users } from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Tags },
  { href: "/admin/categories", label: "Categories", icon: Layers },
  { href: "/admin/accounts", label: "Accounts", icon: Wallet },
  { href: "/admin/wishlist", label: "Wishlist", icon: Heart },
  { href: "/admin/users", label: "Users", icon: Users },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    // Horizontal scrolling pills on mobile, fixed left sidebar from md up.
    <nav
      className="flex gap-2 overflow-x-auto border-b border-slate-200 pb-2 md:sticky md:top-20 md:w-52 md:shrink-0 md:flex-col md:gap-1 md:overflow-visible md:rounded-2xl md:border-0 md:bg-white md:p-2 md:pb-2 md:ring-1 md:ring-slate-100"
      style={{ scrollbarWidth: "none" }}
    >
      {LINKS.map((link) => {
        const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition md:flex md:w-full md:items-center md:gap-2.5 md:rounded-xl md:px-3 md:py-2 ${
              active ? "bg-fuchsia-600 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <link.icon className="hidden h-4 w-4 shrink-0 md:block" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
