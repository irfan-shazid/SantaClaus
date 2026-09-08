import { Suspense } from "react";
import { Wallet, TrendingUp, TrendingDown, Globe, Share2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatTaka } from "@/lib/format";
import {
  resolveDateRange,
  toPrismaDateFilter,
  recentMonths,
  formatBdDate,
  bdTodayIso,
} from "@/lib/date-range";
import AccountsFilters from "@/components/admin/AccountsFilters";
import AccountEntryForm from "@/components/admin/AccountEntryForm";
import DeleteAccountEntryButton from "@/components/admin/DeleteAccountEntryButton";

export const dynamic = "force-dynamic";

export default async function AdminAccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const range = resolveDateRange(params);
  const dateFilter = toPrismaDateFilter(range);

  const [revenueAgg, costs, externalIncomes] = await Promise.all([
    prisma.order.aggregate({
      _sum: { subtotal: true, deliveryCharge: true, total: true },
      where: { status: "DELIVERED", ...(dateFilter ? { createdAt: dateFilter } : {}) },
    }),
    prisma.accountEntry.findMany({
      where: { type: "COST", ...(dateFilter ? { date: dateFilter } : {}) },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
    prisma.accountEntry.findMany({
      where: { type: "EXTERNAL_INCOME", ...(dateFilter ? { date: dateFilter } : {}) },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  // Product revenue only - delivery charges are collected on behalf of the courier
  // and paid straight back out, so they aren't counted as earnings.
  const websiteIncome = revenueAgg._sum.subtotal ?? 0;
  const deliveryCollected = revenueAgg._sum.deliveryCharge ?? 0;
  const otherIncome = externalIncomes.reduce((n, e) => n + e.amount, 0);
  const totalCost = costs.reduce((n, e) => n + e.amount, 0);
  const totalEarnings = websiteIncome + otherIncome;
  const netProfit = totalEarnings - totalCost;
  const inProfit = netProfit >= 0;

  const summaryCards = [
    {
      label: "Total earnings",
      value: totalEarnings,
      icon: Wallet,
      accent: "bg-fuchsia-100 text-fuchsia-600",
      valueClass: "text-fuchsia-600",
    },
    {
      label: "Total cost",
      value: totalCost,
      icon: TrendingDown,
      accent: "bg-amber-100 text-amber-600",
      valueClass: "text-amber-600",
    },
    {
      label: inProfit ? "Net profit" : "Net loss",
      value: Math.abs(netProfit),
      icon: TrendingUp,
      accent: inProfit ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600",
      valueClass: inProfit ? "text-emerald-600" : "text-rose-600",
    },
  ];

  return (
    <div>
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-bold text-slate-800">Accounts</h2>
        <p className="text-xs font-semibold text-slate-500">
          Showing: <span className="text-fuchsia-600">{range.label}</span>
        </p>
      </div>
      <p className="mb-4 text-sm text-slate-500">
        Website sales, off-site income and costs for the selected period.
      </p>

      <Suspense fallback={null}>
        <AccountsFilters months={recentMonths()} />
      </Suspense>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {summaryCards.map((c) => (
          <div key={c.label} className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
            <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-full ${c.accent}`}>
              <c.icon className="h-4.5 w-4.5" />
            </div>
            <p className={`text-2xl font-extrabold ${c.valueClass}`}>{formatTaka(c.value)}</p>
            <p className="text-xs font-semibold text-slate-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl bg-white p-5 ring-1 ring-slate-100">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">How this is calculated</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-slate-600">
              <Globe className="h-4 w-4 text-slate-400" />
              Website sales (delivered orders)
            </span>
            <span className="font-semibold text-slate-800">{formatTaka(websiteIncome)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-slate-600">
              <Share2 className="h-4 w-4 text-slate-400" />
              Social media &amp; other platform income
            </span>
            <span className="font-semibold text-slate-800">+ {formatTaka(otherIncome)}</span>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-2">
            <span className="font-semibold text-slate-700">Total earnings</span>
            <span className="font-bold text-fuchsia-600">{formatTaka(totalEarnings)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-600">Total cost</span>
            <span className="font-semibold text-amber-600">− {formatTaka(totalCost)}</span>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-2">
            <span className="font-bold text-slate-800">{inProfit ? "Net profit" : "Net loss"}</span>
            <span className={`text-lg font-extrabold ${inProfit ? "text-emerald-600" : "text-rose-600"}`}>
              {inProfit ? "" : "− "}
              {formatTaka(Math.abs(netProfit))}
            </span>
          </div>
        </div>
        <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-400">
          Delivery charges collected in this period: {formatTaka(deliveryCollected)} — passed on to the courier, so
          they are not counted as earnings.
        </p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <EntrySection
          title="Costs"
          description="Anything you spend — stock, packaging, ads, delivery, salaries."
          type="COST"
          namePlaceholder="Cost name"
          entries={costs}
          total={totalCost}
          totalClass="text-amber-600"
          emptyText="No costs recorded for this period."
        />

        <EntrySection
          title="Other income"
          description="Sales from Facebook, Instagram, WhatsApp or any off-site channel."
          type="EXTERNAL_INCOME"
          namePlaceholder="Income name"
          entries={externalIncomes}
          total={otherIncome}
          totalClass="text-emerald-600"
          emptyText="No other income recorded for this period."
        />
      </div>
    </div>
  );
}

interface EntryRow {
  id: string;
  name: string;
  amount: number;
  date: Date;
}

function EntrySection({
  title,
  description,
  type,
  namePlaceholder,
  entries,
  total,
  totalClass,
  emptyText,
}: {
  title: string;
  description: string;
  type: "COST" | "EXTERNAL_INCOME";
  namePlaceholder: string;
  entries: EntryRow[];
  total: number;
  totalClass: string;
  emptyText: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-100">
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <p className="text-sm font-bold text-slate-800">{title}</p>
        <p className={`text-sm font-extrabold ${totalClass}`}>{formatTaka(total)}</p>
      </div>
      <p className="mb-3 text-xs text-slate-400">{description}</p>

      <AccountEntryForm type={type} defaultDate={bdTodayIso()} namePlaceholder={namePlaceholder} />

      {entries.length === 0 ? (
        <p className="mt-3 rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">{emptyText}</p>
      ) : (
        <ul className="mt-3 divide-y divide-slate-100">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-center gap-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">{entry.name}</p>
                <p className="text-xs text-slate-400">{formatBdDate(entry.date)}</p>
              </div>
              <p className="shrink-0 text-sm font-bold text-slate-700">{formatTaka(entry.amount)}</p>
              <DeleteAccountEntryButton id={entry.id} name={entry.name} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
