import type { NextRequest } from "next/server";
import { withRoute, ok, type RouteContext } from "@/lib/apiHandler";
import { requirePatient } from "@/lib/auth-guards";
import { AppError } from "@/lib/AppError";
import Report from "@/models/Report";

export const dynamic = "force-dynamic";

export const GET = withRoute(async (req: NextRequest, ctx: RouteContext) => {
  const { user } = await requirePatient(req);
  const { id } = (await ctx.params)!;
  const report = await Report.findById(id);
  if (!report) throw AppError.notFound("Report not found");
  if (String(report.user_id) !== String(user._id)) {
    throw AppError.forbidden("You are not authorized to access this report");
  }
  return ok(report);
});
