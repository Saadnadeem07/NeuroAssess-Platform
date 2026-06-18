import type { NextRequest } from "next/server";
import { withRoute, ok } from "@/lib/apiHandler";
import { requireAdmin } from "@/lib/auth-guards";
import Patient from "@/models/Patient";

export const dynamic = "force-dynamic";

export const GET = withRoute(async (req: NextRequest) => {
  await requireAdmin(req);
  const patients = await Patient.find().select("-password");
  return ok(
    patients.map((p) => ({
      _id: p._id,
      name: p.name,
      email: p.email,
      createdAt: (p as unknown as { createdAt: Date }).createdAt,
      lastLogin: p.lastLogin || null,
      gender: p.gender,
      dateOfBirth: p.dateOfBirth,
      membershipStatus: p.membershipStatus,
    }))
  );
});
