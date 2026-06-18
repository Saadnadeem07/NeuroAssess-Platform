import type { NextRequest } from "next/server";
import mongoose from "mongoose";
import { withRoute, ok, type RouteContext } from "@/lib/apiHandler";
import { requireAdmin } from "@/lib/auth-guards";
import { AppError } from "@/lib/AppError";
import { safePsychiatrist } from "@/lib/sanitize";
import { sendApprovalEmail } from "@/lib/email";
import Psychiatrist from "@/models/Psychiatrist";

export const PATCH = withRoute(async (req: NextRequest, ctx: RouteContext) => {
  const { user: admin } = await requireAdmin(req);
  const { id } = (await ctx.params)!;
  if (!mongoose.Types.ObjectId.isValid(id)) throw AppError.badRequest("Invalid psychiatrist ID");

  const existing = await Psychiatrist.findById(id);
  if (!existing) throw AppError.notFound("Psychiatrist not found");
  if (existing.isApproved) throw AppError.conflict("Psychiatrist is already approved");

  const psychiatrist = await Psychiatrist.findByIdAndUpdate(
    id,
    { isApproved: true, approvedAt: new Date(), approvedBy: String(admin._id) },
    { new: true, runValidators: true }
  );

  sendApprovalEmail(psychiatrist!.email, psychiatrist!.name).catch((err) =>
    console.warn("[admin] approval email failed", err?.message)
  );

  return ok(safePsychiatrist(psychiatrist), "Psychiatrist approved successfully");
});
