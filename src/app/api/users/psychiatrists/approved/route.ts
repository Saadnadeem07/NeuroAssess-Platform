import type { NextRequest } from "next/server";
import { withRoute, ok } from "@/lib/apiHandler";
import { requirePatientOrPsychiatrist } from "@/lib/auth-guards";
import { publicPsychiatristFields } from "@/lib/sanitize";
import Psychiatrist from "@/models/Psychiatrist";

export const dynamic = "force-dynamic";

export const GET = withRoute(async (req: NextRequest) => {
  await requirePatientOrPsychiatrist(req);
  const psychiatrists = await Psychiatrist.find({
    isApproved: true,
    emailVerified: true,
    "availability.workingDays.0": { $exists: true },
  });
  return ok(psychiatrists.map(publicPsychiatristFields));
});
