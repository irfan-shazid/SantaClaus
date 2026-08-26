import { prisma } from "@/lib/prisma";
import { formatTaka } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { orders: true } },
      orders: { select: { total: true } },
    },
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">Total users · {users.length}</h2>
      </div>

      {users.length === 0 ? (
        <p className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">No users yet.</p>
      ) : (
        <div className="space-y-2">
          {users.map((user) => {
            const totalSpent = user.orders.reduce((sum, o) => sum + o.total, 0);
            return (
              <div
                key={user.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-100"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-slate-800">{user.name}</p>
                    {user.role === "ADMIN" && (
                      <span className="rounded-full bg-fuchsia-100 px-2 py-0.5 text-[10px] font-bold text-fuchsia-600">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-slate-400">{user.email}</p>
                  <p className="text-xs text-slate-400">
                    Joined {new Date(user.createdAt).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-6 text-right">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{user._count.orders}</p>
                    <p className="text-[11px] font-semibold text-slate-400">Orders</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-fuchsia-600">{formatTaka(totalSpent)}</p>
                    <p className="text-[11px] font-semibold text-slate-400">Total spent</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
