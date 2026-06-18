import type { NextRequest } from "next/server";
import { withRoute, ok } from "@/lib/apiHandler";
import { requirePatientOrPsychiatrist } from "@/lib/auth-guards";
import { messagingPrincipal } from "@/lib/messaging";
import { AppError } from "@/lib/AppError";
import Message from "@/models/Message";

export const PUT = withRoute(async (req: NextRequest) => {
  const principal = await requirePatientOrPsychiatrist(req);
  const { id, model } = messagingPrincipal(principal);
  const { messageIds } = (await req.json().catch(() => ({}))) as { messageIds?: string[] };
  if (!messageIds || !Array.isArray(messageIds)) throw AppError.badRequest("Message IDs array is required");

  const result = await Message.updateMany(
    { _id: { $in: messageIds }, receiver: id, receiverModel: model },
    { isRead: true }
  );
  return ok({ modifiedCount: result.modifiedCount });
});
