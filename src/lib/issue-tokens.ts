import type { NextRequest, NextResponse } from "next/server";
import RefreshToken from "@/models/RefreshToken";
import { signAccess, signRefresh, newJti, hashToken } from "./tokens";
import { setAuthCookies } from "./cookies";
import { MS, type Role } from "./constants";

const REFRESH_EXPIRES_MS = 7 * MS.DAY;

/**
 * Issues a fresh access + refresh token pair, persists the refresh token's
 * hash (for rotation/reuse detection), and sets both auth cookies on `res`.
 */
export async function issueTokens(
  account: { _id: unknown },
  role: Role,
  req: NextRequest,
  res: NextResponse
): Promise<void> {
  const id = String(account._id);
  const accessToken = signAccess({ id, role });
  const jti = newJti();
  const refreshToken = signRefresh({ id, role, jti });

  await RefreshToken.create({
    accountId: account._id,
    role,
    tokenHash: hashToken(refreshToken),
    jti,
    expiresAt: new Date(Date.now() + REFRESH_EXPIRES_MS),
    userAgent: req.headers.get("user-agent") || null,
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
  });

  setAuthCookies(res, { accessToken, refreshToken });
}
