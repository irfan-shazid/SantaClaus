import Link from "next/link";
import { Clock, CheckCircle2, Truck, PackageCheck, ShoppingBag, Tags, Users, Wallet, Heart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatTaka } from "@/lib/format";
import { statusLabel } from "@/components/orders/StatusTimeline";
import BkashSettingsForm from "@/components/admin/BkashSettingsForm";

export const dynamic = "force-dynamic";

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-sky-100 text-sky-700",
  GIVEN_TO_RIDER: "bg-violet-100 text-violet-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
};

export default async function AdminOverviewPage() {
  const [
    pending,
    confirmed,
    givenToRider,
    delivered,
    productCount,
    categoryCount,
    customerCount,
    wishlistCount,
    revenueAgg,
    settings,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "CONFIRMED" } }),
    prisma.order.count({ where: { status: "GIVEN_TO_RIDER" } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.product.count(),
    prisma.category.count(),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.wishlistItem.count(),
    prisma.order.aggregate({
      _sum: { total: true, subtotal: true, deliveryCharge: true },
      where: { status: "DELIVERED" },
    }),
    prisma.settings.upsert({ where: { id: "store" }, update: {}, create: { id: "store" } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  const totalOrders = pending + confirmed + givenToRider + delivered;

  const orderCards = [
    { label: "Pending", value: pending, icon: Clock, accent: "bg-amber-100 text-amber-600" },
    { label: "Confirmed", value: confirmed, icon: CheckCircle2, accent: "bg-sky-100 text-sky-600" },
    { label: "Given to rider", value: givenToRider, icon: Truck, accent: "bg-violet-100 text-violet-600" },
    { label: "Delivered", value: delivered, icon: PackageCheck, accent: "bg-emerald-100 text-emerald-600" },
  ];

  const catalogCards = [
    { label: "Total orders", value: totalOrders, icon: ShoppingBag, accent: "bg-fuchsia-100 text-fuchsia-600" },
    { label: "Products", value: productCount, icon: Tags, accent: "bg-slate-100 text-slate-600" },
    { label: "Categories", value: categoryCount, icon: Tags, accent: "bg-slate-100 text-slate-600" },
    { label: "Total users", value: customerCount, icon: Users, accent: "bg-slate-100 text-slate-600", href: "/admin/users" },
    { label: "Wishlist saves", value: wishlistCount, icon: Heart, accent: "bg-fuchsia-100 text-fuchsia-600", href: "/admin/wishlist" },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {orderCards.map((c) => (
          <div key={c.label} className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
            <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-full ${c.accent}`}>
              <c.icon className="h-4.5 w-4.5" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{c.value}</p>
            <p className="text-xs font-semibold text-slate-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        {catalogCards.map((c) => {
          const content = (
            <>
              <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-full ${c.accent}`}>
                <c.icon className="h-4.5 w-4.5" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{c.value}</p>
              <p className="text-xs font-semibold text-slate-500">{c.label}</p>
            </>
          );
          return c.href ? (
            <Link key={c.label} href={c.href} className="rounded-2xl bg-white p-4 ring-1 ring-slate-100 transition hover:shadow-sm">
              {content}
            </Link>
          ) : (
            <div key={c.label} className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
              {content}
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-100">
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-fuchsia-100 text-fuchsia-600">
              <Wallet className="h-4 w-4" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Revenue from delivered orders</p>
          </div>
          <Link href="/admin/accounts" className="text-xs font-semibold text-fuchsia-600 hover:underline">
            Filter by date & see profit →
          </Link>
          <p className="mt-2 text-3xl font-extrabold text-fuchsia-600">{formatTaka(revenueAgg._sum.subtotal ?? 0)}</p>

          <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Total delivery amount given</span>
              <span className="font-semibold text-slate-700">{formatTaka(revenueAgg._sum.deliveryCharge ?? 0)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Total earned (with delivery charge)</span>
              <span className="font-semibold text-slate-700">{formatTaka(revenueAgg._sum.total ?? 0)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-100">
          <BkashSettingsForm initialNumber={settings.bkashNumber} />
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white p-5 ring-1 ring-slate-100">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-700">Recent orders</p>
          <Link href="/admin/orders" className="text-xs font-semibold text-fuchsia-600 hover:underline">
            View all →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">No orders yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recentOrders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/admin/orders?status=${order.status}`}
                  className="flex items-center justify-between gap-3 py-3 transition hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{order.customerName}</p>
                    <p className="truncate text-xs text-slate-400">{order.user.email}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <p className="text-sm font-bold text-slate-700">{formatTaka(order.total)}</p>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_COLOR[order.status]}`}>
                      {statusLabel(order.status)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
