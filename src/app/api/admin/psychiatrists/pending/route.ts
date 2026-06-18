import type { NextRequest } from "next/server";
import { withRoute, ok } from "@/lib/apiHandler";
import { requireAdmin } from "@/lib/auth-guards";
import { safePsychiatrist } from "@/lib/sanitize";
import Psychiatrist from "@/models/Psychiatrist";

export const dynamic = "force-dynamic";

export const GET = withRoute(async (req: NextRequest) => {
  await requireAdmin(req);
  // Only surface applications that are verified AND have submitted their
  // credentials (profileComplete) — there's nothing to review otherwise.
  const pending = await Psychiatrist.find({
    isApproved: false,
    emailVerified: true,
    profileComplete: true,
  }).select("-password");
  return ok(pending.map(safePsychiatrist));
});
