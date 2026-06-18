import type { NextRequest } from "next/server";
import { withRoute } from "@/lib/apiHandler";
import { requireAdmin } from "@/lib/auth-guards";
import { profile } from "@/lib/auth-handlers";

export const dynamic = "force-dynamic";

export const GET = withRoute(async (req: NextRequest) => {
  const { user } = await requireAdmin(req);
  return profile("admin", user);
});
