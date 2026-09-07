import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, Clock, CheckCircle2 } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatTaka } from "@/lib/format";
import StatusTimeline, { statusLabel } from "@/components/orders/StatusTimeline";
import LogoutButton from "@/components/account/LogoutButton";

export const dynamic = "force-dynamic";

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-sky-100 text-sky-700",
  GIVEN_TO_RIDER: "bg-violet-100 text-violet-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
};

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/account");

  const [orders, wishlist] = await Promise.all([
    prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
    prisma.wishlistItem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { product: { select: { name: true, price: true, images: true, isUpcoming: true } } },
    }),
  ]);

  const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;
  const inProgressCount = orders.length - deliveredCount;

  const stats = [
    { label: "Total orders", value: orders.length, icon: Package, accent: "bg-fuchsia-100 text-fuchsia-600" },
    { label: "In progress", value: inProgressCount, icon: Clock, accent: "bg-amber-100 text-amber-600" },
    { label: "Delivered", value: deliveredCount, icon: CheckCircle2, accent: "bg-emerald-100 text-emerald-600" },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Hi, {user.name.split(" ")[0]}</h1>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
        <LogoutButton />
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-white p-3 text-center ring-1 ring-slate-100 md:p-4">
            <div className={`mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full ${s.accent}`}>
              <s.icon className="h-4.5 w-4.5" />
            </div>
            <p className="text-xl font-extrabold text-slate-900">{s.value}</p>
            <p className="text-[11px] font-semibold text-slate-500 md:text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {wishlist.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">My wishlist</h2>
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {wishlist.map((w) => (
              <div key={w.id} className="w-28 shrink-0 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-100">
                <div className="relative aspect-square bg-slate-100">
                  {w.product.images[0] && (
                    <Image src={w.product.images[0]} alt={w.product.name} fill sizes="112px" className="object-cover" />
                  )}
                  {w.product.isUpcoming && (
                    <span className="absolute left-1 top-1 rounded-full bg-violet-600/90 px-1.5 py-0.5 text-[9px] font-bold text-white">
                      Soon
                    </span>
                  )}
                </div>
                <div className="p-2">
                  <p className="line-clamp-1 text-xs font-semibold text-slate-700">{w.product.name}</p>
                  <p className="text-xs font-bold text-fuchsia-600">{formatTaka(w.product.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">My orders</h2>

      {orders.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-8 text-center">
          <p className="text-sm text-slate-500">You haven&apos;t placed any orders yet.</p>
          <Link href="/shop" className="mt-3 inline-block text-sm font-semibold text-fuchsia-600 hover:underline">
            Start shopping →
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/account/orders/${order.id}`}
                className="block rounded-2xl bg-white p-4 ring-1 ring-slate-100 transition hover:shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-3">
                      {order.items.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-2 ring-white"
                        >
                          {item.productImage && (
                            <Image src={item.productImage} alt={item.productName} fill sizes="44px" className="object-cover" />
                          )}
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {order.items.length} item{order.items.length > 1 ? "s" : ""} · {formatTaka(order.total)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${STATUS_COLOR[order.status]}`}>
                    {statusLabel(order.status)}
                  </span>
                </div>
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <StatusTimeline status={order.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
