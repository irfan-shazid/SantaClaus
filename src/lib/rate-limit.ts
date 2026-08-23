import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const hasUpstash =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = hasUpstash
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : undefined;

function makeLimiter(requests: number, window: `${number} ${"s" | "m" | "h"}`) {
  if (!redis) return undefined;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
  });
}

// Generic API traffic (per IP)
export const apiLimiter = makeLimiter(60, "1 m");
// Auth / login attempts (per IP)
export const authLimiter = makeLimiter(10, "1 m");
// Order submission (per IP) - orders carry manual payment proof, so keep this tight
export const orderLimiter = makeLimiter(5, "1 m");
// Image upload (per IP)
export const uploadLimiter = makeLimiter(20, "1 m");

export async function checkRateLimit(
  limiter: Ratelimit | undefined,
  identifier: string
): Promise<{ success: boolean; remaining: number }> {
  if (!limiter) {
    // No Upstash configured (e.g. local dev without env vars yet) - fail open.
    return { success: true, remaining: 1 };
  }
  const result = await limiter.limit(identifier);
  return { success: result.success, remaining: result.remaining };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "127.0.0.1";
}
