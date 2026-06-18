import type { NextRequest } from "next/server";
import { withRoute } from "@/lib/apiHandler";
import { requireAdmin } from "@/lib/auth-guards";
import { changePassword } from "@/lib/auth-handlers";

export const POST = withRoute(async (req: NextRequest) => {
  const { user } = await requireAdmin(req);
  return changePassword("admin", String(user._id), req);
});
