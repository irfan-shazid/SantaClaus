"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function BkashSettingsForm({ initialNumber }: { initialNumber: string }) {
  const [number, setNumber] = useState(initialNumber);
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bkashNumber: number }),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error("Could not update bKash number.");
      return;
    }
    toast.success("bKash number updated.");
  }

  return (
    <form onSubmit={handleSave} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
          Store bKash number (shown to customers at checkout)
        </label>
        <input
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-fuchsia-400"
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-fuchsia-600 px-5 py-2 text-sm font-bold text-white disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
