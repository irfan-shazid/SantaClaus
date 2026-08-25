"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearCart } from "@/store/cartSlice";
import { DELIVERY_CHARGE, ZONE_LABELS, type Zone } from "@/lib/delivery";
import { ACCOUNT_TYPES, ACCOUNT_TYPE_LABELS, type AccountType } from "@/lib/payment";
import { formatTaka } from "@/lib/format";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const items = useAppSelector((s) => s.cart.items);
  const dispatch = useAppDispatch();

  const [bkashStoreNumber, setBkashStoreNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [seededName, setSeededName] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [zone, setZone] = useState<Zone>("INSIDE_DHAKA");
  const [accountType, setAccountType] = useState<AccountType>("BKASH");
  const [bkashNumber, setBkashNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill the name field once the session loads, without clobbering further edits.
  if (session?.user?.name && session.user.name !== seededName) {
    setSeededName(session.user.name);
    setCustomerName(session.user.name);
  }

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((s) => setBkashStoreNumber(s.bkashNumber))
      .catch(() => {});
  }, []);

  const subtotal = items.reduce((n, i) => n + i.price * i.quantity, 0);
  const deliveryCharge = DELIVERY_CHARGE[zone];
  const total = subtotal + deliveryCharge;

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-5 text-center">
        <p className="text-lg font-bold text-slate-800">Your cart is empty</p>
        <p className="mt-1 text-sm text-slate-500">Add products before checking out.</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          phone,
          address,
          zone,
          accountType,
          bkashNumber,
          transactionId,
          items: items.map((i) => ({ productId: i.productId, variant: i.variant, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not place order.");
        return;
      }
      dispatch(clearCart());
      toast.success("Order placed! We'll confirm it shortly.");
      router.push(`/account/orders/${data.id}`);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-10">
      <h1 className="mb-5 text-2xl font-extrabold text-slate-900">Checkout</h1>

      <div className="grid gap-8 md:grid-cols-5">
        <form onSubmit={handleSubmit} className="space-y-4 md:col-span-3">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Full name
            </label>
            <input
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-fuchsia-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Phone number
            </label>
            <input
              required
              type="tel"
              placeholder="01XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-fuchsia-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Delivery address
            </label>
            <textarea
              required
              rows={3}
              placeholder="House, road, area, city"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-fuchsia-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Delivery zone
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(DELIVERY_CHARGE) as Zone[]).map((z) => (
                <button
                  type="button"
                  key={z}
                  onClick={() => setZone(z)}
                  className={`rounded-xl border px-3 py-3 text-left text-sm font-semibold transition ${
                    zone === z ? "border-fuchsia-600 bg-fuchsia-50 text-fuchsia-700" : "border-slate-200 text-slate-600"
                  }`}
                >
                  {ZONE_LABELS[z]}
                  <span className="block text-xs font-normal text-slate-400">
                    {formatTaka(DELIVERY_CHARGE[z])} delivery
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-fuchsia-50 p-4">
            <p className="text-sm font-bold text-fuchsia-700">Pay delivery charge via bKash</p>
            <p className="mt-1 text-sm text-slate-600">
              Send <span className="font-bold">{formatTaka(deliveryCharge)}</span> via bKash (Send Money) to
            </p>
            <p className="mt-1 text-lg font-extrabold tracking-wide text-slate-900">
              {bkashStoreNumber || "loading…"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Then enter the bKash number you sent from and the Transaction ID below. Product cost is paid on
              delivery (cash on delivery).
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Your bKash number
            </label>
            <input
              required
              placeholder="01XXXXXXXXX"
              value={bkashNumber}
              onChange={(e) => setBkashNumber(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-fuchsia-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Account type
            </label>
            <select
              required
              value={accountType}
              onChange={(e) => setAccountType(e.target.value as AccountType)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-fuchsia-400"
            >
              {ACCOUNT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {ACCOUNT_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
              bKash Transaction ID
            </label>
            <input
              required
              placeholder="e.g. 8N7A6B5C4D"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-fuchsia-400"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-fuchsia-600 py-3.5 text-sm font-bold text-white shadow-md transition active:scale-95 disabled:opacity-60"
          >
            {submitting ? "Placing order…" : `Place order · ${formatTaka(total)}`}
          </button>
        </form>

        <div className="h-fit rounded-2xl bg-slate-50 p-4 md:col-span-2">
          <p className="mb-3 text-sm font-bold text-slate-700">Order summary</p>
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={`${item.productId}-${item.variant ?? ""}`} className="flex gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-200">
                  <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                </div>
                <div className="flex-1 text-sm">
                  <p className="line-clamp-1 font-medium text-slate-700">{item.name}</p>
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
              <span>{formatTaka(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Delivery ({ZONE_LABELS[zone]})</span>
              <span>{formatTaka(deliveryCharge)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900">
              <span>Total</span>
              <span>{formatTaka(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
