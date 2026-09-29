import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import OrderTabs from "@/components/admin/OrderTabs";
import AdminOrderCard from "@/components/admin/AdminOrderCard";

export const dynamic = "force-dynamic";

const STATUSES = ["PENDING", "CONFIRMED", "GIVEN_TO_RIDER", "DELIVERED", "CANCELLED"] as const;
type Status = (typeof STATUSES)[number];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  // Validate rather than trust the URL - an unknown value would make Prisma throw.
  const status: Status = STATUSES.includes(params.status as Status) ? (params.status as Status) : "PENDING";

  const [orders, statusCounts] = await Promise.all([
    prisma.order.findMany({
      where: { status },
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
          <p className="rounded-2xl bg-stone-50 p-8 text-center text-sm text-stone-500">No orders in this stage.</p>
        ) : (
          orders.map((order) => (
            <AdminOrderCard
              key={order.id}
              order={{
                ...order,
                createdAt: order.createdAt.toISOString(),
                cancelledAt: order.cancelledAt?.toISOString() ?? null,
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
