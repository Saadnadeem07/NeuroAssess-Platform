import type { NextResponse } from "next/server";
import {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  ACCESS_COOKIE_MAX_AGE,
  REFRESH_COOKIE_MAX_AGE,
} from "./constants";
import { isProd } from "./env";

type CookieOpts = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "strict";
  path: string;
  maxAge: number; // seconds
};

const base = (maxAgeMs: number): CookieOpts => ({
  httpOnly: true,
  secure: isProd(),
  sameSite: "strict",
  path: "/",
  maxAge: Math.floor(maxAgeMs / 1000),
});

export function setAuthCookies(
  res: NextResponse,
  { accessToken, refreshToken }: { accessToken: string; refreshToken?: string }
): void {
  res.cookies.set(ACCESS_COOKIE_NAME, accessToken, base(ACCESS_COOKIE_MAX_AGE));
  if (refreshToken) {
    res.cookies.set(REFRESH_COOKIE_NAME, refreshToken, base(REFRESH_COOKIE_MAX_AGE));
  }
}

export function clearAuthCookies(res: NextResponse): void {
  res.cookies.set(ACCESS_COOKIE_NAME, "", { ...base(0), maxAge: 0 });
  res.cookies.set(REFRESH_COOKIE_NAME, "", { ...base(0), maxAge: 0 });
}

export { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME };
