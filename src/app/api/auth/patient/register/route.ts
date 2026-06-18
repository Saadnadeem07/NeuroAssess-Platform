import type { NextRequest } from "next/server";
import { withRoute, ok } from "@/lib/apiHandler";
import { rateLimit } from "@/lib/rateLimit";
import { registerPatientSchema } from "@/lib/validators";
import { registerPatient } from "@/lib/auth-service";

export const POST = withRoute(async (req: NextRequest) => {
  rateLimit(req, "auth");
  const data = registerPatientSchema.parse(await req.json());
  const patient = await registerPatient(data);
  return ok(
    { id: patient._id, email: patient.email, name: patient.name },
    "Registration successful. Please verify your email using the OTP we just sent.",
    201
  );
});
