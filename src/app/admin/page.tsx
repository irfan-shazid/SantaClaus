import { prisma } from "@/lib/prisma";
import { formatTaka } from "@/lib/format";
import BkashSettingsForm from "@/components/admin/BkashSettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [pending, confirmed, givenToRider, delivered, productCount, categoryCount, revenueAgg, settings] =
    await Promise.all([
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "CONFIRMED" } }),
      prisma.order.count({ where: { status: "GIVEN_TO_RIDER" } }),
      prisma.order.count({ where: { status: "DELIVERED" } }),
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: "DELIVERED" } }),
      prisma.settings.upsert({ where: { id: "store" }, update: {}, create: { id: "store" } }),
    ]);

  const cards = [
    { label: "Pending orders", value: pending, accent: "bg-amber-100 text-amber-700" },
    { label: "Confirmed", value: confirmed, accent: "bg-sky-100 text-sky-700" },
    { label: "Given to rider", value: givenToRider, accent: "bg-violet-100 text-violet-700" },
    { label: "Delivered", value: delivered, accent: "bg-emerald-100 text-emerald-700" },
    { label: "Products", value: productCount, accent: "bg-slate-100 text-slate-700" },
    { label: "Categories", value: categoryCount, accent: "bg-slate-100 text-slate-700" },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
            <p className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${c.accent}`}>{c.label}</p>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl bg-white p-5 ring-1 ring-slate-100">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Revenue from delivered orders</p>
        <p className="mt-1 text-3xl font-extrabold text-fuchsia-600">{formatTaka(revenueAgg._sum.total ?? 0)}</p>
      </div>

      <div className="mt-4 rounded-2xl bg-white p-5 ring-1 ring-slate-100">
        <BkashSettingsForm initialNumber={settings.bkashNumber} />
      </div>
    </div>
  );
}
