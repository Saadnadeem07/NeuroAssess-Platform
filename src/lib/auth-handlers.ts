import crypto from "crypto";
import { type NextRequest, NextResponse } from "next/server";
import type { Model } from "mongoose";
import Patient from "@/models/Patient";
import Psychiatrist from "@/models/Psychiatrist";
import Admin from "@/models/Admin";
import RefreshToken from "@/models/RefreshToken";
import { AppError } from "./AppError";
import { ERROR_CODES } from "./errorCodes";
import { ok, done } from "./apiHandler";
import { issueTokens } from "./issue-tokens";
import { setAuthCookies, clearAuthCookies, REFRESH_COOKIE_NAME } from "./cookies";
import { signAccess, signRefresh, verifyRefresh, newJti, hashToken } from "./tokens";
import { RESET_TOKEN_TTL_MS, MS, type Role } from "./constants";
import { safePatient, safePsychiatrist, safeAdmin } from "./sanitize";
import { sendOTPEmail, sendResetPasswordEmail } from "./email";
import * as authService from "./auth-service";
import { appUrl } from "./env";
import {
  loginSchema,
  otpSchema,
  idOnlySchema,
  forgotSchema,
  resetSchema,
  changePasswordSchema,
  completePatientProfileSchema,
  completePsychiatristProfileSchema,
} from "./validators";

const REFRESH_EXPIRES_MS = 7 * MS.DAY;

const MODELS: Record<Role, Model<any>> = {
  patient: Patient as unknown as Model<any>,
  psychiatrist: Psychiatrist as unknown as Model<any>,
  admin: Admin as unknown as Model<any>,
};

const SANITIZERS: Record<Role, (doc: unknown) => unknown> = {
  patient: safePatient,
  psychiatrist: safePsychiatrist,
  admin: safeAdmin,
};

const VERIFY: Record<Role, (id: string, otp: string) => Promise<any>> = {
  patient: authService.verifyPatientOTP,
  psychiatrist: authService.verifyPsychiatristOTP,
  admin: authService.verifyAdminOTP,
};

const RESEND: Record<Role, (id: string) => Promise<void>> = {
  patient: authService.resendPatientOTP,
  psychiatrist: authService.resendPsychiatristOTP,
  admin: authService.resendAdminOTP,
};

async function body(req: NextRequest): Promise<Record<string, unknown>> {
  try {
    return (await req.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

// --- Login -----------------------------------------------------------------

export async function login(role: Role, req: NextRequest): Promise<NextResponse> {
  const { email, password } = loginSchema.parse(await body(req));
  const Model = MODELS[role];
  const account = await Model.findOne({ email }).select("+password");
  if (!account) {
    throw AppError.unauthorized("Invalid credentials", ERROR_CODES.AUTH_INVALID_CREDENTIALS);
  }

  if (!account.emailVerified) {
    const otp = account.generateOTP();
    await account.save();
    await sendOTPEmail(account.email, otp);
    throw new AppError(
      "Email not verified. Verification code sent to your email.",
      403,
      ERROR_CODES.AUTH_EMAIL_NOT_VERIFIED,
      { id: String(account._id) }
    );
  }

  if (role === "psychiatrist" && !account.isApproved) {
    throw new AppError("Your account is pending approval", 403, ERROR_CODES.AUTH_NOT_APPROVED);
  }

  const matches = await account.comparePassword(password);
  if (!matches) {
    throw AppError.unauthorized("Invalid credentials", ERROR_CODES.AUTH_INVALID_CREDENTIALS);
  }

  account.lastLogin = new Date();
  await account.save();

  const res = ok(SANITIZERS[role](account));
  await issueTokens(account, role, req, res);
  return res;
}

// --- OTP -------------------------------------------------------------------

export async function verifyOtp(role: Role, req: NextRequest): Promise<NextResponse> {
  const { id, otp } = otpSchema.parse(await body(req));
  const account = await VERIFY[role](id, otp);
  const res = ok(SANITIZERS[role](account), "OTP verification successful");
  await issueTokens(account, role, req, res);
  return res;
}

export async function resendOtp(role: Role, req: NextRequest): Promise<NextResponse> {
  const { id } = idOnlySchema.parse(await body(req));
  await RESEND[role](id);
  return done("OTP resent successfully");
}

// --- Profile ---------------------------------------------------------------

export function profile(role: Role, account: unknown): NextResponse {
  return ok(SANITIZERS[role](account));
}

// --- Profile completion ----------------------------------------------------

export async function completePatientProfile(accountId: string, req: NextRequest): Promise<NextResponse> {
  const data = completePatientProfileSchema.parse(await body(req));
  const patient = await Patient.findByIdAndUpdate(
    accountId,
    { ...data, profileComplete: true },
    { new: true, runValidators: true }
  );
  if (!patient) throw AppError.notFound("Account not found");
  return ok(safePatient(patient), "Profile completed successfully");
}

export async function completePsychiatristProfile(accountId: string, req: NextRequest): Promise<NextResponse> {
  const data = completePsychiatristProfileSchema.parse(await body(req));
  const psychiatrist = await Psychiatrist.findByIdAndUpdate(
    accountId,
    { ...data, profileComplete: true },
    { new: true, runValidators: true }
  );
  if (!psychiatrist) throw AppError.notFound("Account not found");
  return ok(safePsychiatrist(psychiatrist), "Profile submitted for review");
}

// --- Forgot / reset password ----------------------------------------------

export async function forgotPassword(role: Role, req: NextRequest): Promise<NextResponse> {
  const { email } = forgotSchema.parse(await body(req));
  const account = await MODELS[role].findOne({ email });
  // Respond identically whether or not the account exists (anti-enumeration).
  if (account) {
    const resetToken = crypto.randomBytes(32).toString("hex");
    account.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    account.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await account.save();
    const resetUrl = `${appUrl()}/reset-password?token=${resetToken}&role=${role}`;
    await sendResetPasswordEmail(email, resetUrl);
  }
  return done("If an account exists for that email, a reset link has been sent.");
}

export async function resetPassword(role: Role, req: NextRequest): Promise<NextResponse> {
  const { token, newPassword } = resetSchema.parse(await body(req));
  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  const account = await MODELS[role]
    .findOne({ resetPasswordToken: hashed, resetPasswordExpires: { $gt: new Date() } })
    .select("+password");
  if (!account) {
    throw AppError.unauthorized("Invalid or expired token", ERROR_CODES.AUTH_TOKEN_INVALID);
  }
  account.password = newPassword;
  account.resetPasswordToken = undefined;
  account.resetPasswordExpires = undefined;
  await account.save();
  await RefreshToken.updateMany({ accountId: account._id, revokedAt: null }, { revokedAt: new Date() });
  return done("Password reset successful. Please log in.");
}

export async function changePassword(role: Role, accountId: string, req: NextRequest): Promise<NextResponse> {
  const { currentPassword, newPassword } = changePasswordSchema.parse(await body(req));
  const account = await MODELS[role].findById(accountId).select("+password");
  if (!account) throw AppError.notFound("Account not found");
  const matches = await account.comparePassword(currentPassword);
  if (!matches) {
    throw AppError.unauthorized("Current password is incorrect", ERROR_CODES.AUTH_INVALID_CREDENTIALS);
  }
  account.password = newPassword;
  await account.save();
  await RefreshToken.updateMany({ accountId: account._id, revokedAt: null }, { revokedAt: new Date() });
  return done("Password updated successfully. Please log in again.");
}

// --- Refresh + logout ------------------------------------------------------

export async function refresh(req: NextRequest): Promise<NextResponse> {
  const cookieToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value;
  if (!cookieToken) {
    throw AppError.unauthorized("Missing refresh token", ERROR_CODES.AUTH_TOKEN_INVALID);
  }
  const decoded = verifyRefresh(cookieToken);
  const tokenHash = hashToken(cookieToken);

  const stored = await RefreshToken.findOne({ tokenHash });
  if (!stored) {
    // Token reuse from outside our store — possible theft.
    await RefreshToken.updateMany(
      { accountId: decoded.sub, role: decoded.role, revokedAt: null },
      { revokedAt: new Date() }
    );
    const res = NextResponse.json(
      { success: false, error: "Refresh token reused", code: ERROR_CODES.AUTH_REFRESH_REUSED, statusCode: 401 },
      { status: 401 }
    );
    clearAuthCookies(res);
    return res;
  }
  if (!stored.isActive()) {
    const res = NextResponse.json(
      { success: false, error: "Refresh token revoked or expired", code: ERROR_CODES.AUTH_TOKEN_EXPIRED, statusCode: 401 },
      { status: 401 }
    );
    clearAuthCookies(res);
    return res;
  }

  const Model = MODELS[decoded.role];
  const principal = await Model.findById(decoded.sub).select("-password");
  if (!principal) {
    const res = NextResponse.json(
      { success: false, error: "Account not found", code: ERROR_CODES.AUTH_TOKEN_INVALID, statusCode: 401 },
      { status: 401 }
    );
    clearAuthCookies(res);
    return res;
  }

  // Rotate.
  const accessToken = signAccess({ id: String(principal._id), role: decoded.role });
  const newJtiValue = newJti();
  const newRefresh = signRefresh({ id: String(principal._id), role: decoded.role, jti: newJtiValue });

  await RefreshToken.create({
    accountId: principal._id,
    role: decoded.role,
    tokenHash: hashToken(newRefresh),
    jti: newJtiValue,
    expiresAt: new Date(Date.now() + REFRESH_EXPIRES_MS),
    userAgent: req.headers.get("user-agent") || null,
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
  });
  stored.revokedAt = new Date();
  stored.replacedBy = newJtiValue;
  await stored.save();

  const res = ok({ role: decoded.role });
  setAuthCookies(res, { accessToken, refreshToken: newRefresh });
  return res;
}

export async function logout(req: NextRequest): Promise<NextResponse> {
  const cookieToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value;
  if (cookieToken) {
    const tokenHash = hashToken(cookieToken);
    await RefreshToken.findOneAndUpdate({ tokenHash, revokedAt: null }, { revokedAt: new Date() });
  }
  const res = done("Logged out successfully");
  clearAuthCookies(res);
  return res;
}
