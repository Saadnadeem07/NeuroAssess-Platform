import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";
import { googleConfigured, googleAuthUrl } from "@/lib/google";
import { isProd } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!googleConfigured()) {
    return NextResponse.redirect(new URL("/login?error=google_unconfigured", req.url));
  }
  const state = crypto.randomUUID();
  const res = NextResponse.redirect(googleAuthUrl(state));
  // `lax` so the state cookie is returned on the top-level redirect back.
  res.cookies.set("g_oauth_state", state, {
    httpOnly: true,
    secure: isProd(),
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
