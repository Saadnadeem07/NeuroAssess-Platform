import { NextResponse, type NextRequest } from "next/server";

/**
 * Coarse edge gate for dashboard pages.
 *
 * It only checks that an `accessToken` cookie is PRESENT (not that it's valid —
 * cryptographic verification happens in the API route handlers, which run in
 * the Node runtime where `jsonwebtoken` is available). This just prevents
 * flashing protected UI to logged-out visitors.
 */

const PROTECTED_PREFIXES = ["/patient", "/psychiatrist", "/admin/dashboard"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!needsAuth) return NextResponse.next();

  const hasToken = Boolean(req.cookies.get("accessToken")?.value);
  if (hasToken) return NextResponse.next();

  const loginPath = pathname.startsWith("/admin") ? "/admin/login" : "/login";
  const url = req.nextUrl.clone();
  url.pathname = loginPath;
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/patient/:path*", "/psychiatrist/:path*", "/admin/dashboard/:path*"],
};
