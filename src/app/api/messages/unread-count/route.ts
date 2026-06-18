import type { NextRequest } from "next/server";
import { withRoute, ok } from "@/lib/apiHandler";
import { requirePatientOrPsychiatrist } from "@/lib/auth-guards";
import { messagingPrincipal } from "@/lib/messaging";
import Message from "@/models/Message";

export const dynamic = "force-dynamic";

export const GET = withRoute(async (req: NextRequest) => {
  const principal = await requirePatientOrPsychiatrist(req);
  const { id, model } = messagingPrincipal(principal);
  const count = await Message.countDocuments({ receiver: id, receiverModel: model, isRead: false });
  return ok({ count });
});
