"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
      <p className="text-6xl">😢</p>
      <h1 className="mt-4 text-xl font-extrabold text-slate-900">Something went wrong</h1>
      <p className="mt-1 text-sm text-slate-500">Please try again.</p>
      <button onClick={reset} className="mt-5 rounded-full bg-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white">
        Try again
      </button>
    </div>
  );
}
