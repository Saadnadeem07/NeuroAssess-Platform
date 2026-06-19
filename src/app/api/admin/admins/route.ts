import type { NextRequest } from "next/server";
import { withRoute, ok } from "@/lib/apiHandler";
import { requireAdmin } from "@/lib/auth-guards";
import { AppError } from "@/lib/AppError";
import { safeAdmin } from "@/lib/sanitize";
import { createAdminSchema } from "@/lib/validators";
import Admin from "@/models/Admin";

export const dynamic = "force-dynamic";

export const GET = withRoute(async (req: NextRequest) => {
  await requireAdmin(req);
  const admins = await Admin.find().select("-password");
  return ok(admins.map(safeAdmin));
});

export const POST = withRoute(async (req: NextRequest) => {
  const { user } = await requireAdmin(req);
  // Only super admins can provision other admins.
  if (!user.hasPermission?.("super_admin")) {
    throw AppError.forbidden("Only super admins can add administrators");
  }

  const { name, email, password, superAdmin } = createAdminSchema.parse(await req.json());

  const existing = await Admin.findOne({ email });
  if (existing) throw AppError.conflict("An admin already exists with this email");

  const admin = await Admin.create({
    name,
    email,
    password,
    emailVerified: true, // provisioned by a trusted admin — no OTP needed
    isTemporary: false,
    permissions: superAdmin ? ["super_admin"] : ["manage_psychiatrists", "manage_users"],
    adminLevel: superAdmin ? "super" : "junior",
  });

  return ok(safeAdmin(admin), "Administrator created successfully", 201);
});
