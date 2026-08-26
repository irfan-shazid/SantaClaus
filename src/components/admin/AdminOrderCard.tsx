"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatTaka } from "@/lib/format";
import { ZONE_LABELS, type Zone } from "@/lib/delivery";
import { ACCOUNT_TYPE_LABELS, type AccountType } from "@/lib/payment";

const NEXT_STATUS: Record<string, { key: string; label: string } | null> = {
  PENDING: { key: "CONFIRMED", label: "Mark confirmed" },
  CONFIRMED: { key: "GIVEN_TO_RIDER", label: "Mark given to rider" },
  GIVEN_TO_RIDER: { key: "DELIVERED", label: "Mark delivered" },
  DELIVERED: null,
};

interface OrderData {
  id: string;
  status: string;
  customerName: string;
  phone: string;
  address: string;
  zone: string;
  accountType: string;
  bkashNumber: string;
  transactionId: string;
  deliveryChargePaid: boolean;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  createdAt: string;
  user: { name: string; email: string };
  items: { id: string; productName: string; variant: string | null; price: number; quantity: number }[];
}

export default function AdminOrderCard({ order }: { order: OrderData }) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const next = NEXT_STATUS[order.status];

  async function updateStatus(status: string) {
    setUpdating(true);
    const res = await fetch(`/api/orders/${order.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdating(false);
    if (!res.ok) {
      toast.error("Could not update order status.");
      return;
    }
    toast.success("Order status updated.");
    router.refresh();
  }

  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-slate-800">{order.customerName}</p>
          <p className="text-xs text-slate-400">
            {order.user.email} · {new Date(order.createdAt).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-extrabold text-fuchsia-600">{formatTaka(order.total)}</p>
          <p className="text-[11px] font-semibold text-slate-400">Total amount</p>
          <p className="mt-1 text-sm font-bold text-emerald-600">{formatTaka(order.total - order.deliveryCharge)}</p>
          <p className="text-[11px] font-semibold text-slate-400">Due on delivery</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div className="space-y-1 rounded-xl bg-slate-50 p-3">
          <p className="font-semibold text-slate-600">Delivery</p>
          <p className="text-slate-500">{order.phone}</p>
          <p className="text-slate-500">{order.address}</p>
          <p className="text-slate-500">{ZONE_LABELS[order.zone as Zone]} · {formatTaka(order.deliveryCharge)}</p>
        </div>
        <div className="space-y-1 rounded-xl bg-slate-50 p-3">
          <p className="font-semibold text-slate-600">Payment proof</p>
          <p className="text-slate-500">Account type: {ACCOUNT_TYPE_LABELS[order.accountType as AccountType]}</p>
          <p className="text-slate-500">Sender number: {order.bkashNumber}</p>
          <p className="text-slate-500">Transaction ID: {order.transactionId}</p>
          <p className={order.deliveryChargePaid ? "font-semibold text-emerald-600" : "font-semibold text-amber-600"}>
            {order.deliveryChargePaid ? "✓ Delivery charge confirmed by customer" : "Delivery charge not confirmed"}
          </p>
        </div>
      </div>

      <ul className="mt-3 space-y-1 text-sm text-slate-600">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between">
            <span>
              {item.productName}
              {item.variant ? ` (${item.variant})` : ""} × {item.quantity}
            </span>
            <span>{formatTaka(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {next && (
          <button
            onClick={() => updateStatus(next.key)}
            disabled={updating}
            className="rounded-full bg-fuchsia-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
          >
            {next.label}
          </button>
        )}
        <select
          value={order.status}
          disabled={updating}
          onChange={(e) => updateStatus(e.target.value)}
          className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"
        >
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="GIVEN_TO_RIDER">Given to rider</option>
          <option value="DELIVERED">Delivered</option>
        </select>
      </div>
    </div>
  );
}
