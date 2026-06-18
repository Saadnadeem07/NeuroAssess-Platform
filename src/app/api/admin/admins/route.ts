import type { NextRequest } from "next/server";
import { withRoute, ok } from "@/lib/apiHandler";
import { requireAdmin } from "@/lib/auth-guards";
import { safeAdmin } from "@/lib/sanitize";
import Admin from "@/models/Admin";

export const dynamic = "force-dynamic";

export const GET = withRoute(async (req: NextRequest) => {
  await requireAdmin(req);
  const admins = await Admin.find().select("-password");
  return ok(admins.map(safeAdmin));
});
