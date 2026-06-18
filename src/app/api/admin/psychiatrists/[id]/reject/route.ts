import type { NextRequest } from "next/server";
import mongoose from "mongoose";
import { withRoute, done, type RouteContext } from "@/lib/apiHandler";
import { requireAdmin } from "@/lib/auth-guards";
import { AppError } from "@/lib/AppError";
import { sendRejectionEmail } from "@/lib/email";
import Psychiatrist from "@/models/Psychiatrist";

export const PATCH = withRoute(async (req: NextRequest, ctx: RouteContext) => {
  await requireAdmin(req);
  const { id } = (await ctx.params)!;
  if (!mongoose.Types.ObjectId.isValid(id)) throw AppError.badRequest("Invalid psychiatrist ID");

  const { reason } = (await req.json().catch(() => ({}))) as { reason?: string };
  if (!reason || !reason.trim()) throw AppError.badRequest("Rejection reason is required");

  const psychiatrist = await Psychiatrist.findById(id);
  if (!psychiatrist) throw AppError.notFound("Psychiatrist not found");

  sendRejectionEmail(psychiatrist.email, psychiatrist.name, reason).catch((err) =>
    console.warn("[admin] rejection email failed", err?.message)
  );

  await Psychiatrist.findByIdAndDelete(id);
  return done("Psychiatrist application rejected");
});
