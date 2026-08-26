import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatTaka } from "@/lib/format";
import { ZONE_LABELS, type Zone } from "@/lib/delivery";
import { ACCOUNT_TYPE_LABELS, type AccountType } from "@/lib/payment";
import StatusTimeline from "@/components/orders/StatusTimeline";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order || (order.userId !== user.id && user.role !== "ADMIN")) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-8 md:py-10">
      <h1 className="mb-1 text-2xl font-extrabold text-slate-900">Order details</h1>
      <p className="mb-6 text-xs text-slate-400">
        Placed {new Date(order.createdAt).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" })}
      </p>

      <div className="mb-6 rounded-2xl bg-white p-5 ring-1 ring-slate-100">
        <StatusTimeline status={order.status} />
      </div>

      <div className="mb-6 rounded-2xl bg-white p-5 ring-1 ring-slate-100">
        <p className="mb-3 text-sm font-bold text-slate-700">Items</p>
        <ul className="space-y-3">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                {item.productImage && (
                  <Image src={item.productImage} alt={item.productName} fill sizes="56px" className="object-cover" />
                )}
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium text-slate-700">{item.productName}</p>
                <p className="text-xs text-slate-400">
                  {item.variant ? `${item.variant} · ` : ""}Qty {item.quantity}
                </p>
              </div>
              <p className="text-sm font-semibold text-slate-700">{formatTaka(item.price * item.quantity)}</p>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1.5 border-t border-slate-200 pt-3 text-sm">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span>{formatTaka(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Delivery ({ZONE_LABELS[order.zone as Zone]})</span>
            <span>{formatTaka(order.deliveryCharge)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-slate-900">
            <span>Total amount</span>
            <span>{formatTaka(order.total)}</span>
          </div>
          <div className="flex justify-between border-t border-dashed border-slate-200 pt-1.5 text-fuchsia-700">
            <span className="font-semibold">Due on delivery</span>
            <span className="font-bold">{formatTaka(order.total - order.deliveryCharge)}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-100">
        <p className="mb-3 text-sm font-bold text-slate-700">Delivery & payment info</p>
        <dl className="space-y-2 text-sm">
          <Row label="Name" value={order.customerName} />
          <Row label="Phone" value={order.phone} />
          <Row label="Address" value={order.address} />
          <Row label="Account type" value={ACCOUNT_TYPE_LABELS[order.accountType as AccountType]} />
          <Row label="bKash number" value={order.bkashNumber} />
          <Row label="Transaction ID" value={order.transactionId} />
        </dl>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-slate-400">{label}</dt>
      <dd className="text-right font-medium text-slate-700">{value}</dd>
    </div>
  );
}
