import type { NextRequest } from "next/server";
import { withRoute } from "@/lib/apiHandler";
import { logout } from "@/lib/auth-handlers";

export const POST = withRoute(async (req: NextRequest) => logout(req));
