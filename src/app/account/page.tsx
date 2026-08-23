import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatTaka } from "@/lib/format";
import { statusLabel } from "@/components/orders/StatusTimeline";
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

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Hi, {user.name.split(" ")[0]}</h1>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
        <LogoutButton />
      </div>

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
                className="flex items-center justify-between rounded-2xl bg-white p-4 ring-1 ring-slate-100 transition hover:shadow-sm"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {order.items.length} item{order.items.length > 1 ? "s" : ""} · {formatTaka(order.total)}
                  </p>
                  <p className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_COLOR[order.status]}`}>
                  {statusLabel(order.status)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
