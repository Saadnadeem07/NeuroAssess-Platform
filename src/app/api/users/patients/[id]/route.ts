import type { NextRequest } from "next/server";
import { withRoute, ok, type RouteContext } from "@/lib/apiHandler";
import { requirePatient } from "@/lib/auth-guards";
import { AppError } from "@/lib/AppError";
import { safePatient } from "@/lib/sanitize";
import Patient from "@/models/Patient";

export const PUT = withRoute(async (req: NextRequest, ctx: RouteContext) => {
  const { user } = await requirePatient(req);
  const { id } = (await ctx.params)!;
  if (String(user._id) !== id) throw AppError.forbidden("Not authorized to update this user");

  const bodyData = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const update: Record<string, unknown> = {};
  if (bodyData.name !== undefined) update.name = bodyData.name;
  const patient = await Patient.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  if (!patient) throw AppError.notFound("Patient not found");
  return ok(safePatient(patient), "Profile updated successfully");
});
