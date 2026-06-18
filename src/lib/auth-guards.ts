import type { NextRequest } from "next/server";
import { AppError } from "./AppError";
import { ERROR_CODES } from "./errorCodes";
import { ACCESS_COOKIE_NAME, type Role } from "./constants";
import { verifyAccess } from "./tokens";
import Patient from "@/models/Patient";
import Psychiatrist from "@/models/Psychiatrist";
import Admin from "@/models/Admin";
import type { Model } from "mongoose";

const ROLE_MODELS: Record<Role, Model<any>> = {
  patient: Patient as unknown as Model<any>,
  psychiatrist: Psychiatrist as unknown as Model<any>,
  admin: Admin as unknown as Model<any>,
};

function extractToken(req: NextRequest): string | null {
  // Cookie-only auth — no Authorization: Bearer.
  return req.cookies.get(ACCESS_COOKIE_NAME)?.value ?? null;
}

async function loadPrincipal(sub: string, role: Role) {
  const Model = ROLE_MODELS[role];
  if (!Model) return null;
  return Model.findById(sub).select("-password");
}

export type Principal<T = any> = { user: T; role: Role; id: string };

async function authenticate(req: NextRequest, allowed: Role[]): Promise<Principal> {
  const token = extractToken(req);
  if (!token) {
    throw AppError.unauthorized("Not authenticated", ERROR_CODES.AUTH_TOKEN_INVALID);
  }
  const decoded = verifyAccess(token);
  if (!allowed.includes(decoded.role)) {
    throw AppError.forbidden(
      `Access denied. ${allowed.join(" or ")} role required.`,
      ERROR_CODES.AUTH_FORBIDDEN
    );
  }
  const user = await loadPrincipal(decoded.sub, decoded.role);
  if (!user) throw AppError.unauthorized("Account not found");
  return { user, role: decoded.role, id: String(user._id) };
}

export const requirePatient = (req: NextRequest) => authenticate(req, ["patient"]);
export const requirePsychiatrist = (req: NextRequest) => authenticate(req, ["psychiatrist"]);
export const requireAdmin = (req: NextRequest) => authenticate(req, ["admin"]);
export const requirePatientOrPsychiatrist = (req: NextRequest) =>
  authenticate(req, ["patient", "psychiatrist"]);
