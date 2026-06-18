import type { NextRequest } from "next/server";
import { withRoute, ok } from "@/lib/apiHandler";
import { requirePsychiatrist } from "@/lib/auth-guards";
import Appointment from "@/models/Appointment";

export const dynamic = "force-dynamic";

export const GET = withRoute(async (req: NextRequest) => {
  const { user } = await requirePsychiatrist(req);
  const appointments = await Appointment.find({ psychiatrist: user._id }).sort({ date: 1 });
  return ok(appointments);
});
