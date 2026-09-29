import Image from "next/image";
import { Heart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatTaka } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminWishlistPage() {
  const products = await prisma.product.findMany({
    where: { wishlistItems: { some: {} } },
    include: {
      category: { select: { name: true } },
      _count: { select: { wishlistItems: true } },
    },
    orderBy: { wishlistItems: { _count: "desc" } },
  });

  return (
    <div>
      <h2 className="mb-1 text-lg font-bold text-stone-800">Wishlist</h2>
      <p className="mb-4 text-sm text-stone-500">
        Upcoming products users have saved, ranked by how many people want it.
      </p>

      <div className="space-y-2">
        {products.map((p) => (
          <div key={p.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-stone-100">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-stone-100">
              {p.images[0] && <Image src={p.images[0]} alt={p.name} fill sizes="48px" className="object-cover" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-stone-800">{p.name}</p>
                {!p.isUpcoming && (
                  <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-500">
                    No longer marked Upcoming
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400">
                {p.category.name} · {formatTaka(p.price)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-santa-50 px-3 py-1.5 text-sm font-bold text-santa-600">
              <Heart className="h-3.5 w-3.5 fill-santa-600" />
              {p._count.wishlistItems}
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <p className="rounded-2xl bg-stone-50 p-8 text-center text-sm text-stone-500">
            No wishlist saves yet — publish an Upcoming product to start collecting interest.
          </p>
        )}
      </div>
    </div>
  );
}
