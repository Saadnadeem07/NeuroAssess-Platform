import type { NextRequest } from "next/server";
import { withRoute } from "@/lib/apiHandler";
import { requirePsychiatrist } from "@/lib/auth-guards";
import { completePsychiatristProfile } from "@/lib/auth-handlers";

export const POST = withRoute(async (req: NextRequest) => {
  const { user } = await requirePsychiatrist(req);
  return completePsychiatristProfile(String(user._id), req);
});
