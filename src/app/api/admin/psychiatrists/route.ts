import type { NextRequest } from "next/server";
import { withRoute, ok } from "@/lib/apiHandler";
import { requireAdmin } from "@/lib/auth-guards";
import { safePsychiatrist } from "@/lib/sanitize";
import Psychiatrist from "@/models/Psychiatrist";

export const dynamic = "force-dynamic";

export const GET = withRoute(async (req: NextRequest) => {
  await requireAdmin(req);
  const psychiatrists = await Psychiatrist.find().select("-password");
  return ok(psychiatrists.map(safePsychiatrist));
});
