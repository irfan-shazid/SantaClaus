import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { apiLimiter, authLimiter, checkRateLimit, getClientIp } from "@/lib/rate-limit";

const PROTECTED_PAGE_PREFIXES = ["/account", "/admin", "/checkout"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    const isAuthRoute = pathname.startsWith("/api/auth");
    const ip = getClientIp(request);
    const { success } = await checkRateLimit(
      isAuthRoute ? authLimiter : apiLimiter,
      `${isAuthRoute ? "auth" : "api"}:${ip}`
    );
    if (!success) {
      return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
    }
    return NextResponse.next();
  }

  const needsAuth = PROTECTED_PAGE_PREFIXES.some((p) => pathname.startsWith(p));
  if (!needsAuth) return NextResponse.next();

  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*", "/checkout/:path*", "/api/:path*"],
};
