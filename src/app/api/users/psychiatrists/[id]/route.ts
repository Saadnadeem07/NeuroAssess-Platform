import type { NextRequest } from "next/server";
import { withRoute, ok, type RouteContext } from "@/lib/apiHandler";
import { requirePatientOrPsychiatrist, requirePsychiatrist } from "@/lib/auth-guards";
import { AppError } from "@/lib/AppError";
import { publicPsychiatristFields, safePsychiatrist } from "@/lib/sanitize";
import Psychiatrist from "@/models/Psychiatrist";

export const dynamic = "force-dynamic";

export const GET = withRoute(async (req: NextRequest, ctx: RouteContext) => {
  await requirePatientOrPsychiatrist(req);
  const { id } = (await ctx.params)!;
  const psychiatrist = await Psychiatrist.findOne({ _id: id, isApproved: true, emailVerified: true });
  if (!psychiatrist || !psychiatrist.availability?.workingDays?.length) {
    throw AppError.notFound("Psychiatrist not found or unavailable");
  }
  return ok(publicPsychiatristFields(psychiatrist));
});

export const PUT = withRoute(async (req: NextRequest, ctx: RouteContext) => {
  const { user } = await requirePsychiatrist(req);
  const { id } = (await ctx.params)!;
  if (String(user._id) !== id) throw AppError.forbidden("Not authorized to update this profile");

  const bodyData = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const update: Record<string, unknown> = {};
  if (bodyData.name !== undefined) update.name = bodyData.name;
  const psychiatrist = await Psychiatrist.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  if (!psychiatrist) throw AppError.notFound("Psychiatrist not found");
  return ok(safePsychiatrist(psychiatrist), "Profile updated successfully");
});
