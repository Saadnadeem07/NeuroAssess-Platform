import type { NextRequest } from "next/server";
import { withRoute } from "@/lib/apiHandler";
import { requirePsychiatrist } from "@/lib/auth-guards";
import { changePassword } from "@/lib/auth-handlers";

export const POST = withRoute(async (req: NextRequest) => {
  const { user } = await requirePsychiatrist(req);
  return changePassword("psychiatrist", String(user._id), req);
});
