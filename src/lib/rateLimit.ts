import type { NextRequest } from "next/server";
import { AppError } from "./AppError";
import { ERROR_CODES } from "./errorCodes";
import { MS } from "./constants";

/**
 * In-memory fixed-window rate limiter (equivalent to express-rate-limit).
 * Per-instance only — back with Redis/Upstash for multi-instance production.
 */

type Bucket = { count: number; resetAt: number };

const STORE = new Map<string, Bucket>();

type LimiterName = "global" | "auth" | "otp" | "passwordReset";

const CONFIG: Record<LimiterName, { windowMs: number; max: number; message: string }> = {
  global: { windowMs: 1 * MS.MINUTE, max: 200, message: "Too many requests, please slow down." },
  auth: { windowMs: 15 * MS.MINUTE, max: 10, message: "Too many auth attempts, please try again in 15 minutes." },
  otp: { windowMs: 15 * MS.MINUTE, max: 5, message: "Too many OTP attempts, please try again later." },
  passwordReset: { windowMs: 1 * MS.HOUR, max: 5, message: "Too many password reset requests, please try again later." },
};

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

/** Throws AppError(429) when the caller exceeds the window. */
export function rateLimit(req: NextRequest, name: LimiterName): void {
  const cfg = CONFIG[name];
  const key = `${name}:${clientIp(req)}`;
  const now = Date.now();
  const bucket = STORE.get(key);

  if (!bucket || bucket.resetAt <= now) {
    STORE.set(key, { count: 1, resetAt: now + cfg.windowMs });
    return;
  }

  bucket.count += 1;
  if (bucket.count > cfg.max) {
    throw new AppError(cfg.message, 429, ERROR_CODES.RATE_LIMIT_EXCEEDED);
  }
}

// Opportunistic cleanup so the map doesn't grow unbounded.
if (typeof setInterval !== "undefined") {
  const handle = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of STORE) {
      if (bucket.resetAt <= now) STORE.delete(key);
    }
  }, 5 * MS.MINUTE);
  // Don't keep the process alive just for cleanup.
  (handle as unknown as { unref?: () => void }).unref?.();
}
