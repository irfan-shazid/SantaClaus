"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { signIn, signUp } from "@/lib/auth-client";

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp.email({ name, email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Could not create account.");
      return;
    }
    router.push(redirect);
    router.refresh();
  }

  async function handleGoogleSignup() {
    await signIn.social({ provider: "google", callbackURL: redirect });
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-5 py-10">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-extrabold text-slate-900">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">Sign up to shop and track your orders.</p>

        <button
          onClick={handleGoogleSignup}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95"
        >
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
          <div className="h-px flex-1 bg-slate-200" />
          or
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <form onSubmit={handleSignup} className="space-y-3">
          <input
            type="text"
            required
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-fuchsia-400"
          />
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-fuchsia-400"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-fuchsia-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-fuchsia-600 py-3 text-sm font-bold text-white shadow-md transition active:scale-95 disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-fuchsia-600 hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
