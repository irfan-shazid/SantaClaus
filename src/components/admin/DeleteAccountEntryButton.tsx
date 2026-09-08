"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function DeleteAccountEntryButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Delete "${name}"?`)) return;
    const res = await fetch(`/api/accounts/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Could not delete entry.");
      return;
    }
    toast.success("Entry deleted.");
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      aria-label={`Delete ${name}`}
      className="rounded-full p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
