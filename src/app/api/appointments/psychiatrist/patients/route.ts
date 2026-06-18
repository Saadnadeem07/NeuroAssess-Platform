import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withRoute } from "@/lib/apiHandler";
import { requirePsychiatrist } from "@/lib/auth-guards";
import Appointment from "@/models/Appointment";

export const dynamic = "force-dynamic";

type RosterEntry = {
  _id: string;
  name: string;
  email: string;
  appointmentCount: number;
  lastAppointment: Date;
  nextAppointment: Date | null;
  status: string;
};

export const GET = withRoute(async (req: NextRequest) => {
  const { user } = await requirePsychiatrist(req);
  const appointments = await Appointment.find({
    psychiatrist: user._id,
    status: { $ne: "cancelled" },
  })
    .sort({ date: 1 })
    .populate("patient", "name");

  const byId = new Map<string, RosterEntry>();
  const now = new Date();
  for (const appt of appointments) {
    const id = String((appt.patient as unknown as { _id?: unknown })?._id ?? appt.patient);
    if (!byId.has(id)) {
      byId.set(id, {
        _id: id,
        name: appt.patientName,
        email: appt.patientEmail,
        appointmentCount: 0,
        lastAppointment: appt.date,
        nextAppointment: null,
        status: "Active",
      });
    }
    const entry = byId.get(id)!;
    entry.appointmentCount += 1;
    if (new Date(appt.date) > new Date(entry.lastAppointment)) entry.lastAppointment = appt.date;
    if (
      appt.status === "scheduled" &&
      new Date(appt.date) > now &&
      (!entry.nextAppointment || new Date(appt.date) < new Date(entry.nextAppointment))
    ) {
      entry.nextAppointment = appt.date;
    }
  }
  const data = Array.from(byId.values());
  return NextResponse.json({ success: true, count: data.length, data });
});
