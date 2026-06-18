import type { NextRequest } from "next/server";
import { withRoute } from "@/lib/apiHandler";
import { requirePatient } from "@/lib/auth-guards";
import { profile } from "@/lib/auth-handlers";

export const dynamic = "force-dynamic";

export const GET = withRoute(async (req: NextRequest) => {
  const { user } = await requirePatient(req);
  return profile("patient", user);
});
