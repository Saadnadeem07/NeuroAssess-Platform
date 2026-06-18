import type { NextRequest } from "next/server";
import { withRoute, ok, type RouteContext } from "@/lib/apiHandler";
import { requirePatientOrPsychiatrist } from "@/lib/auth-guards";
import { messagingPrincipal } from "@/lib/messaging";
import { AppError } from "@/lib/AppError";
import Message from "@/models/Message";
import Patient from "@/models/Patient";
import Psychiatrist from "@/models/Psychiatrist";
import Appointment from "@/models/Appointment";

export const dynamic = "force-dynamic";

export const GET = withRoute(async (req: NextRequest, ctx: RouteContext) => {
  const principal = await requirePatientOrPsychiatrist(req);
  const { id: currentUserId, model: currentUserModel } = messagingPrincipal(principal);
  const partnerId = (await ctx.params)!.userId;

  let partnerModel: "Patient" | "Psychiatrist";
  if (await Patient.findById(partnerId)) partnerModel = "Patient";
  else if (await Psychiatrist.findById(partnerId)) partnerModel = "Psychiatrist";
  else throw AppError.notFound("Conversation partner not found");

  if (principal.role === "patient") {
    const hasAppointment = await Appointment.findOne({
      patient: currentUserId,
      psychiatrist: partnerId,
      status: { $ne: "cancelled" },
    });
    if (!hasAppointment) {
      throw AppError.forbidden("You can only message psychiatrists you have appointments with");
    }
  }

  const messages = await Message.find({
    $or: [
      { sender: currentUserId, senderModel: currentUserModel, receiver: partnerId, receiverModel: partnerModel },
      { sender: partnerId, senderModel: partnerModel, receiver: currentUserId, receiverModel: currentUserModel },
    ],
  }).sort({ createdAt: 1 });

  await Message.updateMany(
    { sender: partnerId, senderModel: partnerModel, receiver: currentUserId, receiverModel: currentUserModel, isRead: false },
    { isRead: true }
  );

  return ok(messages);
});
