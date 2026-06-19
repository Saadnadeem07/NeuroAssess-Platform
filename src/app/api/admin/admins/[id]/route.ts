import type { NextRequest } from "next/server";
import mongoose from "mongoose";
import { withRoute, done, type RouteContext } from "@/lib/apiHandler";
import { requireAdmin } from "@/lib/auth-guards";
import { AppError } from "@/lib/AppError";
import Admin from "@/models/Admin";

export const DELETE = withRoute(async (req: NextRequest, ctx: RouteContext) => {
  const { user } = await requireAdmin(req);
  if (!user.hasPermission?.("super_admin")) {
    throw AppError.forbidden("Only super admins can remove administrators");
  }

  const { id } = (await ctx.params)!;
  if (!mongoose.Types.ObjectId.isValid(id)) throw AppError.badRequest("Invalid admin ID");

  if (String(user._id) === id) throw AppError.badRequest("You cannot delete your own account");

  const total = await Admin.countDocuments();
  if (total <= 1) throw AppError.badRequest("Cannot delete the last remaining administrator");

  const admin = await Admin.findByIdAndDelete(id);
  if (!admin) throw AppError.notFound("Admin not found");

  return done("Administrator removed");
});
