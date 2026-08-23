import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import OrderTabs from "@/components/admin/OrderTabs";
import AdminOrderCard from "@/components/admin/AdminOrderCard";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const status = params.status ?? "PENDING";

  const [orders, statusCounts] = await Promise.all([
    prisma.order.findMany({
      where: { status: status as never },
      orderBy: { createdAt: "asc" },
      include: { items: true, user: { select: { name: true, email: true } } },
    }),
    prisma.order.groupBy({ by: ["status"], _count: true }),
  ]);

  const counts = Object.fromEntries(statusCounts.map((c) => [c.status, c._count]));

  return (
    <div>
      <Suspense fallback={null}>
        <OrderTabs counts={counts} />
      </Suspense>

      <div className="mt-4 space-y-3">
        {orders.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">No orders in this stage.</p>
        ) : (
          orders.map((order) => (
            <AdminOrderCard
              key={order.id}
              order={{ ...order, createdAt: order.createdAt.toISOString() }}
            />
          ))
        )}
      </div>
    </div>
  );
}
