import type { Principal } from "./auth-guards";

export type MsgPrincipal = {
  id: string;
  model: "Patient" | "Psychiatrist";
  role: "patient" | "psychiatrist";
  name: string;
};

/** Derive the messaging principal shape from an auth guard result. */
export function messagingPrincipal(p: Principal): MsgPrincipal {
  const isPatient = p.role === "patient";
  return {
    id: String(p.user._id),
    model: isPatient ? "Patient" : "Psychiatrist",
    role: isPatient ? "patient" : "psychiatrist",
    name: p.user.name,
  };
}
