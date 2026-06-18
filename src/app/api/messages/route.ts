import type { NextRequest } from "next/server";
import { withRoute, ok } from "@/lib/apiHandler";
import { requirePatientOrPsychiatrist } from "@/lib/auth-guards";
import { messagingPrincipal } from "@/lib/messaging";
import { AppError } from "@/lib/AppError";
import Message from "@/models/Message";
import Patient from "@/models/Patient";
import Psychiatrist from "@/models/Psychiatrist";
import Appointment from "@/models/Appointment";

export const POST = withRoute(async (req: NextRequest) => {
  const principal = await requirePatientOrPsychiatrist(req);
  const sender = messagingPrincipal(principal);

  const { receiverId, content } = (await req.json().catch(() => ({}))) as {
    receiverId?: string;
    content?: string;
  };
  if (!receiverId || !content) throw AppError.badRequest("Receiver ID and message content are required");

  let receiver: { name: string } | null = await Patient.findById(receiverId);
  let receiverModel: "Patient" | "Psychiatrist" = "Patient";
  let receiverRole: "patient" | "psychiatrist" = "patient";
  if (!receiver) {
    receiver = await Psychiatrist.findById(receiverId);
    receiverModel = "Psychiatrist";
    receiverRole = "psychiatrist";
  }
  if (!receiver) throw AppError.notFound("Receiver not found");

  if (principal.role === "patient" && receiverModel === "Psychiatrist") {
    const hasAppointment = await Appointment.findOne({
      patient: sender.id,
      psychiatrist: receiverId,
      status: { $ne: "cancelled" },
    });
    if (!hasAppointment) {
      throw AppError.forbidden("You can only message psychiatrists you have appointments with");
    }
  }

  const message = await Message.create({
    sender: sender.id,
    senderModel: sender.model,
    senderName: sender.name,
    senderRole: sender.role,
    receiver: receiverId,
    receiverModel,
    receiverName: receiver.name,
    receiverRole,
    content,
    isRead: false,
  });
  return ok(message, undefined, 201);
});
