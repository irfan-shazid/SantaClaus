import "server-only";
import { headers } from "next/headers";
import { auth, type AuthSession } from "@/lib/auth";

export async function getCurrentSession(): Promise<AuthSession | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session;
}

export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user ?? null;
}

export async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === "ADMIN";
}
