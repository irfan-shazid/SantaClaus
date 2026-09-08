"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function AccountEntryForm({
  type,
  defaultDate,
  namePlaceholder,
}: {
  type: "COST" | "EXTERNAL_INCOME";
  defaultDate: string;
  namePlaceholder: string;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter an amount greater than zero.");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, name, amount: Math.round(parsedAmount), date }),
    });
    const data = await res.json().catch(() => null);
    setSaving(false);

    if (!res.ok) {
      toast.error(typeof data?.error === "string" ? data.error : "Could not save entry.");
      return;
    }

    setName("");
    setAmount("");
    toast.success(type === "COST" ? "Cost added." : "Income added.");
    // Refresh so the list and the summary totals above update together.
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-2 rounded-xl bg-slate-50 p-3 sm:grid-cols-[1fr_120px_150px_auto]">
      <input
        required
        maxLength={120}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={namePlaceholder}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-fuchsia-400"
      />
      <input
        required
        type="number"
        min={1}
        step={1}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-fuchsia-400"
      />
      <input
        required
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-fuchsia-400"
      />
      <button
        type="submit"
        disabled={saving}
        className="flex items-center justify-center gap-1.5 rounded-lg bg-fuchsia-600 px-4 py-2 text-sm font-bold text-white transition active:scale-95 disabled:opacity-60"
      >
        <Plus className="h-4 w-4" />
        {saving ? "Adding…" : "Add"}
      </button>
    </form>
  );
}
