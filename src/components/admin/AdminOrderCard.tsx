"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatTaka } from "@/lib/format";
import { ZONE_LABELS, type Zone } from "@/lib/delivery";
import { ACCOUNT_TYPE_LABELS, type AccountType } from "@/lib/payment";

const NEXT_STATUS: Record<string, { key: string; label: string } | null> = {
  PENDING: { key: "CONFIRMED", label: "Mark confirmed" },
  CONFIRMED: { key: "GIVEN_TO_RIDER", label: "Mark given to rider" },
  GIVEN_TO_RIDER: { key: "DELIVERED", label: "Mark delivered" },
  DELIVERED: null,
  CANCELLED: null,
};

const REASON_MAX = 500;

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
  cancelReason: string | null;
  cancelledAt: string | null;
  user: { name: string; email: string };
  items: { id: string; productName: string; variant: string | null; price: number; quantity: number }[];
}

export default function AdminOrderCard({ order }: { order: OrderData }) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [reason, setReason] = useState("");
  const next = NEXT_STATUS[order.status];
  const isCancelled = order.status === "CANCELLED";
  const canCancel = !isCancelled && order.status !== "DELIVERED";

  async function updateStatus(status: string) {
    setUpdating(true);
    const res = await fetch(`/api/orders/${order.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdating(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      toast.error(typeof data?.error === "string" ? data.error : "Could not update order status.");
      return;
    }
    toast.success("Order status updated.");
    router.refresh();
  }

  async function handleCancel() {
    const trimmed = reason.trim();
    if (!trimmed) {
      toast.error("Please write a reason — the customer will see it.");
      return;
    }
    setUpdating(true);
    const res = await fetch(`/api/orders/${order.id}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: trimmed }),
    });
    setUpdating(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      toast.error(typeof data?.error === "string" ? data.error : "Could not cancel order.");
      return;
    }
    toast.success("Order cancelled. The customer can see your message.");
    setShowCancel(false);
    setReason("");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Delete this pending order? This cannot be undone and will restore product stock.")) return;
    setUpdating(true);
    const res = await fetch(`/api/orders/${order.id}`, { method: "DELETE" });
    setUpdating(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "Could not delete order.");
      return;
    }
    toast.success("Order deleted.");
    router.refresh();
  }

  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-stone-100">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-stone-800">{order.customerName}</p>
          <p className="text-xs text-stone-400">
            {order.user.email} · {new Date(order.createdAt).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-extrabold text-santa-600">{formatTaka(order.total)}</p>
          <p className="text-[11px] font-semibold text-stone-400">Total amount</p>
          <p className="mt-1.5 text-sm font-bold text-stone-600">{formatTaka(order.total)}</p>
          <p className="text-[11px] font-semibold text-stone-400">Due (before delivery charge)</p>
          <p className="mt-1.5 text-sm font-bold text-emerald-600">{formatTaka(order.total - order.deliveryCharge)}</p>
          <p className="text-[11px] font-semibold text-stone-400">Due (after delivery charge)</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div className="space-y-1 rounded-xl bg-stone-50 p-3">
          <p className="font-semibold text-stone-600">Delivery</p>
          <p className="text-stone-500">{order.phone}</p>
          <p className="text-stone-500">{order.address}</p>
          <p className="text-stone-500">{ZONE_LABELS[order.zone as Zone]} · {formatTaka(order.deliveryCharge)}</p>
        </div>
        <div className="space-y-1 rounded-xl bg-stone-50 p-3">
          <p className="font-semibold text-stone-600">Payment proof</p>
          <p className="text-stone-500">Account type: {ACCOUNT_TYPE_LABELS[order.accountType as AccountType]}</p>
          <p className="text-stone-500">Sender number: {order.bkashNumber}</p>
          <p className="text-stone-500">Transaction ID: {order.transactionId}</p>
          <p className={order.deliveryChargePaid ? "font-semibold text-emerald-600" : "font-semibold text-amber-600"}>
            {order.deliveryChargePaid ? "✓ Delivery charge confirmed by customer" : "Delivery charge not confirmed"}
          </p>
        </div>
      </div>

      <ul className="mt-3 space-y-1 text-sm text-stone-600">
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

      {isCancelled ? (
        <div className="mt-4 rounded-xl bg-stone-50 p-3 text-sm ring-1 ring-stone-200">
          <p className="flex items-center gap-1.5 font-bold text-stone-700">
            <Ban className="h-4 w-4 text-stone-500" />
            Cancelled
            {order.cancelledAt && (
              <span className="font-normal text-stone-400">
                · {new Date(order.cancelledAt).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" })}
              </span>
            )}
          </p>
          {order.cancelReason && (
            <p className="mt-1.5 whitespace-pre-line wrap-break-word text-stone-600">
              <span className="font-semibold text-stone-700">Message to customer: </span>
              {order.cancelReason}
            </p>
          )}
          <p className="mt-1.5 text-xs text-stone-400">Stock for these items was returned to inventory.</p>
        </div>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {next && (
              <button
                onClick={() => updateStatus(next.key)}
                disabled={updating}
                className="rounded-full bg-santa-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
              >
                {next.label}
              </button>
            )}
            <select
              value={order.status}
              disabled={updating}
              onChange={(e) => updateStatus(e.target.value)}
              className="rounded-full border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-600"
            >
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="GIVEN_TO_RIDER">Given to rider</option>
              <option value="DELIVERED">Delivered</option>
            </select>

            <div className="ml-auto flex items-center gap-2">
              {canCancel && !showCancel && (
                <button
                  onClick={() => setShowCancel(true)}
                  disabled={updating}
                  className="flex items-center gap-1.5 rounded-full border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-600 transition hover:bg-stone-100 disabled:opacity-60"
                >
                  <Ban className="h-3.5 w-3.5" />
                  Cancel order
                </button>
              )}
              {order.status === "PENDING" && (
                <button
                  onClick={handleDelete}
                  disabled={updating}
                  className="flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50 disabled:opacity-60"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              )}
            </div>
          </div>

          {showCancel && (
            <div className="mt-3 rounded-xl bg-stone-50 p-3 ring-1 ring-stone-200">
              <label htmlFor={`cancel-${order.id}`} className="text-xs font-bold text-stone-700">
                Why is this order being cancelled?
              </label>
              <p className="text-[11px] text-stone-400">The customer will see this message on their order.</p>
              <textarea
                id={`cancel-${order.id}`}
                value={reason}
                onChange={(e) => setReason(e.target.value.slice(0, REASON_MAX))}
                rows={3}
                autoFocus
                placeholder="e.g. Sorry, this item just went out of stock. Your payment will be refunded to your bKash number within 2 days."
                className="mt-2 w-full resize-none rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-santa-400"
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-[11px] text-stone-400">
                  {reason.length}/{REASON_MAX}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowCancel(false);
                      setReason("");
                    }}
                    disabled={updating}
                    className="rounded-full px-3 py-2 text-xs font-semibold text-stone-500 transition hover:bg-stone-100 disabled:opacity-60"
                  >
                    Keep order
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={updating || !reason.trim()}
                    className="rounded-full bg-stone-800 px-4 py-2 text-xs font-bold text-white transition hover:bg-stone-900 disabled:opacity-50"
                  >
                    {updating ? "Cancelling…" : "Confirm cancellation"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
