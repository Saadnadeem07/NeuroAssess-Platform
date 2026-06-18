import mongoose, { Schema, type Model, type Document } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { BCRYPT_COST, OTP_TTL_MS, OTP_MAX_ATTEMPTS } from "@/lib/constants";

export type OtpVerifyResult = { ok: true } | { ok: false; reason: "expired" | "invalid" | "locked" };

export interface IPatient extends Document {
  name: string;
  email: string;
  password: string;
  authProvider: "local" | "google";
  avatarUrl?: string;
  profileComplete: boolean;
  phone?: string;
  dateOfBirth?: Date;
  gender?: string;
  membershipStatus: boolean;
  membershipExpiresAt?: Date;
  emergencyContact?: { name?: string; relationship?: string; phone?: string };
  emailVerified: boolean;
  isTemporary: boolean;
  lastLogin?: Date;
  otp?: { code?: string; expiresAt?: Date; attempts?: number; lockedUntil?: Date | null };
  loginOtp?: { code?: string; expiresAt?: Date; attempts?: number; lockedUntil?: Date | null };
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  comparePassword(candidate: string): Promise<boolean>;
  generateOTP(): string;
  verifyOTP(candidate: string): OtpVerifyResult;
  generateLoginOTP(): string;
  verifyLoginOTP(candidate: string): boolean;
}

const otpShape = {
  code: String,
  expiresAt: Date,
  attempts: { type: Number, default: 0 },
  lockedUntil: { type: Date, default: null },
};

const patientSchema = new Schema<IPatient>(
  {
    name: { type: String, required: [true, "Please provide your name"], trim: true },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      // Required for local accounts; Google accounts authenticate via OAuth.
      required: [
        function (this: { authProvider?: string }) {
          return this.authProvider !== "google";
        },
        "Please provide a password",
      ],
      minlength: 6,
      select: false,
    },
    authProvider: { type: String, enum: ["local", "google"], default: "local" },
    avatarUrl: { type: String },
    profileComplete: { type: Boolean, default: false },
    phone: { type: String, trim: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["male", "female", "other", "prefer not to say"] },
    membershipStatus: { type: Boolean, default: false },
    membershipExpiresAt: { type: Date },
    emergencyContact: { name: String, relationship: String, phone: String },
    emailVerified: { type: Boolean, default: false },
    isTemporary: { type: Boolean, default: false },
    lastLogin: { type: Date },
    otp: otpShape,
    loginOtp: otpShape,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

patientSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(BCRYPT_COST);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

patientSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

patientSchema.methods.generateOTP = function (): string {
  const otp = crypto.randomInt(100000, 1000000).toString();
  this.otp = {
    code: crypto.createHash("sha256").update(otp).digest("hex"),
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
    attempts: 0,
    lockedUntil: null,
  };
  return otp;
};

patientSchema.methods.verifyOTP = function (candidate: string): OtpVerifyResult {
  if (!this.otp?.code || !this.otp.expiresAt) return { ok: false, reason: "invalid" };
  if (this.otp.lockedUntil && this.otp.lockedUntil > new Date()) return { ok: false, reason: "locked" };
  if (this.otp.expiresAt < new Date()) return { ok: false, reason: "expired" };
  const hashed = crypto.createHash("sha256").update(candidate).digest("hex");
  if (this.otp.code !== hashed) {
    this.otp.attempts = (this.otp.attempts || 0) + 1;
    if (this.otp.attempts >= OTP_MAX_ATTEMPTS) this.otp.lockedUntil = new Date(Date.now() + OTP_TTL_MS);
    return { ok: false, reason: "invalid" };
  }
  return { ok: true };
};

patientSchema.methods.generateLoginOTP = function (): string {
  const otp = crypto.randomInt(100000, 1000000).toString();
  this.loginOtp = {
    code: crypto.createHash("sha256").update(otp).digest("hex"),
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
    attempts: 0,
    lockedUntil: null,
  };
  return otp;
};

patientSchema.methods.verifyLoginOTP = function (candidate: string): boolean {
  if (!this.loginOtp?.code || !this.loginOtp.expiresAt) return false;
  if (this.loginOtp.lockedUntil && this.loginOtp.lockedUntil > new Date()) return false;
  if (this.loginOtp.expiresAt < new Date()) return false;
  const hashed = crypto.createHash("sha256").update(candidate).digest("hex");
  return this.loginOtp.code === hashed;
};

const Patient =
  (mongoose.models.Patient as Model<IPatient>) || mongoose.model<IPatient>("Patient", patientSchema);

export default Patient;
