import type { NextRequest } from "next/server";
import { withRoute, ok } from "@/lib/apiHandler";
import { requirePatient } from "@/lib/auth-guards";
import LearningPlan from "@/models/LearningPlan";

export const dynamic = "force-dynamic";

export const GET = withRoute(async (req: NextRequest) => {
  const { user } = await requirePatient(req);
  const plans = await LearningPlan.findByUserId(String(user._id));
  return ok(plans);
});
