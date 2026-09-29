// Skeleton matching the shop grid, so navigating here paints instantly
// instead of holding the previous page while products are fetched.
export default function ShopLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
      <div className="mb-4 h-8 w-28 animate-pulse rounded-lg bg-white/60 md:h-9 md:w-32" />

      <div className="flex gap-2">
        {[64, 84, 64].map((w, i) => (
          <div key={i} className="h-8 animate-pulse rounded-full bg-white/60" style={{ width: w }} />
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl bg-white ring-1 ring-stone-100">
            <div className="aspect-square animate-pulse bg-stone-100" />
            <div className="space-y-2 p-3">
              <div className="h-3.5 w-3/4 animate-pulse rounded bg-stone-100" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-stone-100" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-stone-100" />
              <div className="mt-2.5 h-8 animate-pulse rounded-full bg-stone-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
