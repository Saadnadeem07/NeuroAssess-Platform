import type { NextRequest } from "next/server";
import { withRoute, ok } from "@/lib/apiHandler";
import { requirePatient } from "@/lib/auth-guards";
import { AppError } from "@/lib/AppError";
import { sendAppointmentEmails } from "@/lib/email";
import Appointment from "@/models/Appointment";
import Patient from "@/models/Patient";
import Psychiatrist from "@/models/Psychiatrist";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const POST = withRoute(async (req: NextRequest) => {
  const { user } = await requirePatient(req);
  const { psychiatristId, date, timeSlot } = (await req.json().catch(() => ({}))) as {
    psychiatristId?: string;
    date?: string;
    timeSlot?: string;
  };
  if (!psychiatristId || !date || !timeSlot) {
    throw AppError.badRequest("Psychiatrist ID, date, and time slot are required");
  }

  const patient = await Patient.findById(user._id);
  const psychiatrist = await Psychiatrist.findById(psychiatristId);
  if (!patient || !psychiatrist) throw AppError.notFound("Patient or psychiatrist not found");

  const isoDate = new Date(date);
  const year = isoDate.getUTCFullYear();
  const month = isoDate.getUTCMonth();
  const day = isoDate.getUTCDate();
  const appointmentDate = new Date(Date.UTC(year, month, day, 12, 0, 0));
  const appointmentDay = new Date(Date.UTC(year, month, day, 0, 0, 0));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (appointmentDay < today) throw AppError.badRequest("Cannot book appointments for past dates");

  if (appointmentDay.getTime() === today.getTime()) {
    const timeStart = timeSlot.split(" - ")[0];
    const [hourStr, minuteStr] = timeStart.split(":");
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr.split(" ")[0], 10);
    const isPM = timeStart.includes("PM");
    if (isPM && hour !== 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;
    const apptDateTime = new Date(appointmentDate);
    apptDateTime.setHours(hour, minute, 0, 0);
    if (apptDateTime < new Date()) throw AppError.badRequest("Cannot book appointments for past time slots");
  }

  const dayOfWeek = DAYS[appointmentDay.getUTCDay()];
  if (!psychiatrist.availability?.workingDays?.length) {
    throw AppError.badRequest("Psychiatrist has not set their availability");
  }
  if (!psychiatrist.availability.workingDays.includes(dayOfWeek)) {
    throw AppError.badRequest("Psychiatrist is not available on this day");
  }

  const startOfDay = new Date(appointmentDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(appointmentDate);
  endOfDay.setHours(23, 59, 59, 999);

  const conflict = await Appointment.findOne({
    psychiatrist: psychiatristId,
    date: { $gte: startOfDay, $lte: endOfDay },
    timeSlot,
    status: { $ne: "cancelled" },
  });
  if (conflict) throw AppError.conflict("This time slot is already booked");

  const patientConflict = await Appointment.findOne({
    patient: patient._id,
    date: { $gte: startOfDay, $lte: endOfDay },
    timeSlot,
    status: { $ne: "cancelled" },
  });
  if (patientConflict) throw AppError.conflict("You already have an appointment at this time");

  const appointment = await Appointment.create({
    patient: patient._id,
    psychiatrist: psychiatrist._id,
    date: appointmentDate,
    timeSlot,
    patientName: patient.name,
    psychiatristName: psychiatrist.name,
    patientEmail: patient.email,
    psychiatristEmail: psychiatrist.email,
  });

  sendAppointmentEmails(appointment).catch((err) =>
    console.warn("[appointments] confirmation email failed", err?.message)
  );

  return ok(appointment, "Appointment booked successfully", 201);
});
