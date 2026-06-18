import type { NextRequest } from "next/server";
import { withRoute, ok, type RouteContext } from "@/lib/apiHandler";
import { requirePatient } from "@/lib/auth-guards";
import { AppError } from "@/lib/AppError";
import LearningPlan from "@/models/LearningPlan";

export const dynamic = "force-dynamic";

export const GET = withRoute(async (req: NextRequest, ctx: RouteContext) => {
  const { user } = await requirePatient(req);
  const moduleNumber = parseInt((await ctx.params)!.moduleNumber, 10);
  if (![1, 2].includes(moduleNumber)) throw AppError.badRequest("Invalid module number. Must be 1 or 2.");
  const plan = await LearningPlan.findByUserIdAndModule(String(user._id), moduleNumber);
  if (!plan) throw AppError.notFound(`Learning plan for Module ${moduleNumber} not found`);
  return ok(plan);
});
