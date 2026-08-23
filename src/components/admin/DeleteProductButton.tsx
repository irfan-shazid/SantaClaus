"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this product?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Could not delete product.");
      return;
    }
    toast.success("Product deleted.");
    router.refresh();
  }

  return (
    <button onClick={handleDelete} className="rounded-full p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500">
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
