import type { NextRequest } from "next/server";
import { withRoute, ok, type RouteContext } from "@/lib/apiHandler";
import { requirePsychiatrist } from "@/lib/auth-guards";
import { AppError } from "@/lib/AppError";
import { safePsychiatrist } from "@/lib/sanitize";
import Psychiatrist from "@/models/Psychiatrist";

export const PUT = withRoute(async (req: NextRequest, ctx: RouteContext) => {
  const { user } = await requirePsychiatrist(req);
  const { id } = (await ctx.params)!;
  if (String(user._id) !== id) throw AppError.forbidden("Not authorized to update this availability");

  const { startTime, endTime, workingDays } = (await req.json().catch(() => ({}))) as {
    startTime?: string;
    endTime?: string;
    workingDays?: string[];
  };
  if (!startTime || !endTime) throw AppError.badRequest("Start time and end time are required");

  const psychiatrist = await Psychiatrist.findByIdAndUpdate(
    id,
    { availability: { startTime, endTime, workingDays: Array.isArray(workingDays) ? workingDays : [] } },
    { new: true, runValidators: true }
  );
  if (!psychiatrist) throw AppError.notFound("Psychiatrist not found");
  return ok(safePsychiatrist(psychiatrist), "Availability updated successfully");
});
