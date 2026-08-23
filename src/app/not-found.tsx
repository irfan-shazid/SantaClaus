import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
      <p className="text-6xl">🧸</p>
      <h1 className="mt-4 text-xl font-extrabold text-slate-900">Page not found</h1>
      <p className="mt-1 text-sm text-slate-500">We couldn&apos;t find what you were looking for.</p>
      <Link href="/" className="mt-5 rounded-full bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white">
        Back home
      </Link>
    </div>
  );
}
