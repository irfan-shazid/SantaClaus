// Mirrors the product detail layout so tapping a card paints the shell
// immediately and only the real content swaps in.
export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">
      <div className="h-3 w-24 animate-pulse rounded bg-white/60" />

      <div className="mt-3 grid gap-8 md:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-2xl bg-white/70" />

        <div>
          <div className="h-8 w-3/4 animate-pulse rounded-lg bg-white/70 md:h-9" />
          <div className="mt-4 space-y-2">
            <div className="h-3.5 w-full animate-pulse rounded bg-white/60" />
            <div className="h-3.5 w-11/12 animate-pulse rounded bg-white/60" />
            <div className="h-3.5 w-2/3 animate-pulse rounded bg-white/60" />
          </div>
          <div className="mt-6 h-7 w-28 animate-pulse rounded-lg bg-white/70" />
          <div className="mt-5 h-12 w-full animate-pulse rounded-full bg-white/70" />
        </div>
      </div>
    </div>
  );
}
