import type { NextRequest } from "next/server";
import { withRoute, ok } from "@/lib/apiHandler";
import { requirePatient } from "@/lib/auth-guards";
import Report from "@/models/Report";

export const dynamic = "force-dynamic";

export const GET = withRoute(async (req: NextRequest) => {
  const { user } = await requirePatient(req);
  const reports = await Report.findByUserId(String(user._id));
  return ok(reports);
});
