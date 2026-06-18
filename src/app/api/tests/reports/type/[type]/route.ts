import type { NextRequest } from "next/server";
import { withRoute, ok, type RouteContext } from "@/lib/apiHandler";
import { requirePatient } from "@/lib/auth-guards";
import { AppError } from "@/lib/AppError";
import Report, { type ReportType } from "@/models/Report";

export const dynamic = "force-dynamic";

const VALID: ReportType[] = ["testing", "learning-plan", "learning-plan-completed"];

export const GET = withRoute(async (req: NextRequest, ctx: RouteContext) => {
  const { user } = await requirePatient(req);
  const { type } = (await ctx.params)!;
  if (!VALID.includes(type as ReportType)) throw AppError.badRequest("Invalid report type");
  const reports = await Report.findByUserIdAndType(String(user._id), type as ReportType);
  return ok(reports);
});
