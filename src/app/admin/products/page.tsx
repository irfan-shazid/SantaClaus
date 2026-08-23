import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatTaka } from "@/lib/format";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: { select: { name: true } } },
  });

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Link
          href="/admin/products/new"
          className="flex items-center gap-1.5 rounded-full bg-fuchsia-600 px-4 py-2 text-sm font-bold text-white"
        >
          <Plus className="h-4 w-4" />
          Add product
        </Link>
      </div>

      <div className="space-y-2">
        {products.map((p) => (
          <div key={p.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-100">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100">
              {p.images[0] && <Image src={p.images[0]} alt={p.name} fill sizes="48px" className="object-cover" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">{p.name}</p>
              <p className="text-xs text-slate-400">
                {p.category.name} · {p.type === "CLOTHING" ? "Clothing" : "Toy"} · Stock {p.stock}
              </p>
            </div>
            <p className="text-sm font-bold text-fuchsia-600">{formatTaka(p.price)}</p>
            <Link href={`/admin/products/${p.id}`} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold">
              Edit
            </Link>
            <DeleteProductButton id={p.id} />
          </div>
        ))}
        {products.length === 0 && (
          <p className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">No products yet.</p>
        )}
      </div>
    </div>
  );
}
