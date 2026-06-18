import type { NextRequest } from "next/server";
import { withRoute } from "@/lib/apiHandler";
import { requirePatient } from "@/lib/auth-guards";
import { completePatientProfile } from "@/lib/auth-handlers";

export const POST = withRoute(async (req: NextRequest) => {
  const { user } = await requirePatient(req);
  return completePatientProfile(String(user._id), req);
});
