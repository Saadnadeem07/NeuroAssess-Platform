import type { NextRequest } from "next/server";
import { withRoute, ok, type RouteContext } from "@/lib/apiHandler";
import { requirePatientOrPsychiatrist } from "@/lib/auth-guards";
import { AppError } from "@/lib/AppError";
import Appointment from "@/models/Appointment";

export const dynamic = "force-dynamic";

export const GET = withRoute(async (req: NextRequest, ctx: RouteContext) => {
  await requirePatientOrPsychiatrist(req);
  const { psychiatristId } = (await ctx.params)!;
  const date = new URL(req.url).searchParams.get("date");
  if (!psychiatristId || !date) throw AppError.badRequest("Psychiatrist ID and date are required");

  const queryDate = new Date(date);
  const startOfDay = new Date(queryDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(queryDate);
  endOfDay.setHours(23, 59, 59, 999);

  const appointments = await Appointment.find({
    psychiatrist: psychiatristId,
    date: { $gte: startOfDay, $lte: endOfDay },
    status: { $ne: "cancelled" },
  });
  return ok(appointments.map((a) => a.timeSlot));
});
