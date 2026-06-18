import type { NextRequest } from "next/server";
import { withRoute } from "@/lib/apiHandler";
import { rateLimit } from "@/lib/rateLimit";
import { login } from "@/lib/auth-handlers";

export const POST = withRoute(async (req: NextRequest) => {
  rateLimit(req, "auth");
  return login("admin", req);
});
