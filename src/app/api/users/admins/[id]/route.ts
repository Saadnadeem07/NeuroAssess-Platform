import type { NextRequest } from "next/server";
import { withRoute, ok, type RouteContext } from "@/lib/apiHandler";
import { requireAdmin } from "@/lib/auth-guards";
import { AppError } from "@/lib/AppError";
import { safeAdmin } from "@/lib/sanitize";
import Admin from "@/models/Admin";

export const PUT = withRoute(async (req: NextRequest, ctx: RouteContext) => {
  const { user } = await requireAdmin(req);
  const { id } = (await ctx.params)!;
  if (String(user._id) !== id) throw AppError.forbidden("Not authorized to update this profile");

  const bodyData = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const update: Record<string, unknown> = {};
  if (bodyData.name !== undefined) update.name = bodyData.name;
  const admin = await Admin.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  if (!admin) throw AppError.notFound("Admin not found");
  return ok(safeAdmin(admin), "Profile updated successfully");
});
