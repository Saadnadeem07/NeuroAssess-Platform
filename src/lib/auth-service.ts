import type { Model } from "mongoose";
import Patient from "@/models/Patient";
import Psychiatrist from "@/models/Psychiatrist";
import Admin from "@/models/Admin";
import { AppError } from "./AppError";
import { ERROR_CODES } from "./errorCodes";
import { sendOTPEmail } from "./email";

interface OtpDoc {
  _id: unknown;
  email: string;
  name: string;
  emailVerified: boolean;
  isTemporary: boolean;
  otp?: { expiresAt?: Date };
  generateOTP(): string;
  verifyOTP(otp: string): { ok: true } | { ok: false; reason: string };
  save(): Promise<unknown>;
}

// --- Registration ----------------------------------------------------------

export async function registerPatient(data: { email: string; password: string; name: string }) {
  const existing = await Patient.findOne({ email: data.email });
  if (existing) throw AppError.conflict("Patient already exists with this email");

  // Minimal sign-up: profile details are collected after first login.
  const patient = await Patient.create({ ...data, isTemporary: true, profileComplete: false });
  const otp = patient.generateOTP();
  await patient.save();

  const result = await sendOTPEmail(data.email, otp);
  if (!result.success) throw new AppError("Failed to send verification email", 502);
  return patient;
}

export async function registerPsychiatrist(data: { email: string; password: string; name: string }) {
  const existing = await Psychiatrist.findOne({ email: data.email });
  if (existing) throw AppError.conflict("Psychiatrist already exists with this email");

  // Credentials are collected after first login, then reviewed by an admin.
  const psychiatrist = await Psychiatrist.create({
    ...data,
    isApproved: false,
    isTemporary: true,
    profileComplete: false,
  });
  const otp = psychiatrist.generateOTP();
  await psychiatrist.save();

  const result = await sendOTPEmail(data.email, otp);
  if (!result.success) throw new AppError("Failed to send verification email", 502);
  return psychiatrist;
}

// --- OTP verify / resend ---------------------------------------------------

function verifyForModel<T extends OtpDoc>(ModelRef: Model<any>, label: string) {
  return async (id: string, otp: string): Promise<T> => {
    const doc = (await ModelRef.findById(id)) as T | null;
    if (!doc) throw AppError.notFound(`${label} not found`);
    if (doc.emailVerified) throw AppError.conflict("Email already verified");

    const result = doc.verifyOTP(otp);
    if (!result.ok) {
      await doc.save();
      if (result.reason === "expired") throw AppError.unauthorized("OTP has expired", ERROR_CODES.AUTH_OTP_EXPIRED);
      if (result.reason === "locked")
        throw AppError.unauthorized("Too many incorrect attempts. Please request a new OTP.", ERROR_CODES.AUTH_OTP_LOCKED);
      throw AppError.unauthorized("Invalid OTP", ERROR_CODES.AUTH_OTP_INVALID);
    }

    (doc as unknown as { emailVerified: boolean }).emailVerified = true;
    (doc as unknown as { isTemporary: boolean }).isTemporary = false;
    (doc as unknown as { otp: unknown }).otp = undefined;
    await doc.save();
    return doc;
  };
}

function resendForModel(ModelRef: Model<any>, label: string) {
  return async (id: string): Promise<void> => {
    const doc = (await ModelRef.findById(id)) as OtpDoc | null;
    if (!doc) throw AppError.notFound(`${label} not found`);
    if (doc.emailVerified) throw AppError.conflict("Email already verified");
    const otp = doc.generateOTP();
    await doc.save();
    const result = await sendOTPEmail(doc.email, otp);
    if (!result.success) throw new AppError("Failed to send verification email", 502);
  };
}

export const verifyPatientOTP = verifyForModel(Patient as unknown as Model<any>, "Patient");
export const verifyPsychiatristOTP = verifyForModel(Psychiatrist as unknown as Model<any>, "Psychiatrist");
export const verifyAdminOTP = verifyForModel(Admin as unknown as Model<any>, "Admin");

export const resendPatientOTP = resendForModel(Patient as unknown as Model<any>, "Patient");
export const resendPsychiatristOTP = resendForModel(Psychiatrist as unknown as Model<any>, "Psychiatrist");
export const resendAdminOTP = resendForModel(Admin as unknown as Model<any>, "Admin");

// --- Cleanup of unverified accounts ----------------------------------------

function cleanupForModel(ModelRef: Model<any>, label: string) {
  return async (): Promise<number> => {
    const result = await ModelRef.deleteMany({ isTemporary: true, "otp.expiresAt": { $lt: new Date() } });
    if (result.deletedCount > 0) {
      // eslint-disable-next-line no-console
      console.log(`[cleanup] Removed ${result.deletedCount} temporary ${label}(s)`);
    }
    return result.deletedCount ?? 0;
  };
}

export const cleanupTemporaryPatients = cleanupForModel(Patient as unknown as Model<any>, "patient");
export const cleanupTemporaryPsychiatrists = cleanupForModel(Psychiatrist as unknown as Model<any>, "psychiatrist");

export async function cleanupTemporaryAccounts() {
  await cleanupTemporaryPatients();
  await cleanupTemporaryPsychiatrists();
}
