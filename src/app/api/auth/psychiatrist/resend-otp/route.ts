import type { NextRequest } from "next/server";
import { withRoute } from "@/lib/apiHandler";
import { rateLimit } from "@/lib/rateLimit";
import { resendOtp } from "@/lib/auth-handlers";

export const POST = withRoute(async (req: NextRequest) => {
  rateLimit(req, "otp");
  return resendOtp("psychiatrist", req);
});
