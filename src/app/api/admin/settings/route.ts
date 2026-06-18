import type { NextRequest } from "next/server";
import { withRoute, ok } from "@/lib/apiHandler";
import { requireAdmin } from "@/lib/auth-guards";

export const dynamic = "force-dynamic";

export const GET = withRoute(async (req: NextRequest) => {
  await requireAdmin(req);
  return ok({
    emailNotifications: true,
    systemAlerts: true,
    dataRetention: "90",
    securityLevel: "high",
  });
});

export const PUT = withRoute(async (req: NextRequest) => {
  await requireAdmin(req);
  const { emailNotifications, systemAlerts, dataRetention, securityLevel } = (await req
    .json()
    .catch(() => ({}))) as Record<string, unknown>;
  return ok({ emailNotifications, systemAlerts, dataRetention, securityLevel });
});
