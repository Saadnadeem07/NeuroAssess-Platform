import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { exchangeCodeForProfile } from "@/lib/google";
import { issueTokens } from "@/lib/issue-tokens";
import Patient from "@/models/Patient";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = req.cookies.get("g_oauth_state")?.value;

  const fail = (reason: string) => NextResponse.redirect(new URL(`/login?error=${reason}`, req.url));

  // CSRF protection: the state must round-trip via the httpOnly cookie.
  if (!code || !state || !cookieState || state !== cookieState) return fail("google_state");

  try {
    await connectDB();
    const profile = await exchangeCodeForProfile(code);

    let patient = await Patient.findOne({ email: profile.email });
    if (!patient) {
      patient = await Patient.create({
        name: profile.name,
        email: profile.email,
        authProvider: "google",
        avatarUrl: profile.picture,
        emailVerified: true,
        isTemporary: false,
        profileComplete: false,
      });
    }

    const res = NextResponse.redirect(new URL("/auth/continue?role=patient", req.url));
    await issueTokens(patient, "patient", req, res);
    res.cookies.set("g_oauth_state", "", { path: "/", maxAge: 0 });
    return res;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[google] callback error:", (err as Error).message);
    return fail("google_failed");
  }
}
