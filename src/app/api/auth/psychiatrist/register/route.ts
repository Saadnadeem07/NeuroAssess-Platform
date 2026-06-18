import type { NextRequest } from "next/server";
import { withRoute, ok } from "@/lib/apiHandler";
import { rateLimit } from "@/lib/rateLimit";
import { registerPsychiatristSchema } from "@/lib/validators";
import { registerPsychiatrist } from "@/lib/auth-service";

export const POST = withRoute(async (req: NextRequest) => {
  rateLimit(req, "auth");
  const data = registerPsychiatristSchema.parse(await req.json());
  const psychiatrist = await registerPsychiatrist(data);
  return ok(
    { id: psychiatrist._id, email: psychiatrist.email, name: psychiatrist.name },
    "Registration successful. Please verify your email using the OTP we just sent.",
    201
  );
});
