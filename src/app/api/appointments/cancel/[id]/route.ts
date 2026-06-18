import type { NextRequest } from "next/server";
import { withRoute, ok, type RouteContext } from "@/lib/apiHandler";
import { requirePatientOrPsychiatrist } from "@/lib/auth-guards";
import { AppError } from "@/lib/AppError";
import { sendCancellationEmails } from "@/lib/email";
import Appointment from "@/models/Appointment";

export const PUT = withRoute(async (req: NextRequest, ctx: RouteContext) => {
  const { user, role } = await requirePatientOrPsychiatrist(req);
  const { id } = (await ctx.params)!;

  const appointment = await Appointment.findById(id);
  if (!appointment) throw AppError.notFound("Appointment not found");

  let cancelledBy: "patient" | "psychiatrist" | null = null;
  if (role === "patient" && String(appointment.patient) === String(user._id)) cancelledBy = "patient";
  else if (role === "psychiatrist" && String(appointment.psychiatrist) === String(user._id))
    cancelledBy = "psychiatrist";
  if (!cancelledBy) throw AppError.forbidden("Not authorized to cancel this appointment");

  appointment.status = "cancelled";
  await appointment.save();

  sendCancellationEmails(appointment, cancelledBy).catch((err) =>
    console.warn("[appointments] cancellation email failed", err?.message)
  );

  return ok(appointment, "Appointment cancelled successfully");
});
