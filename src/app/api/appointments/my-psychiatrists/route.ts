import type { NextRequest } from "next/server";
import { withRoute, ok } from "@/lib/apiHandler";
import { requirePatient } from "@/lib/auth-guards";
import Appointment from "@/models/Appointment";

export const dynamic = "force-dynamic";

export const GET = withRoute(async (req: NextRequest) => {
  const { user } = await requirePatient(req);
  const appointments = await Appointment.find({
    patient: user._id,
    status: { $ne: "cancelled" },
  }).populate("psychiatrist", "name");

  const seen = new Set<string>();
  const data: { _id: string; name: string }[] = [];
  for (const a of appointments) {
    const psych = a.psychiatrist as unknown as { _id?: unknown; name?: string };
    const id = psych?._id ? String(psych._id) : null;
    if (id && !seen.has(id)) {
      seen.add(id);
      data.push({ _id: id, name: psych.name ?? a.psychiatristName });
    }
  }
  return ok(data);
});
