import mongoose, { Schema, type Model, type Document } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { BCRYPT_COST, OTP_TTL_MS, OTP_MAX_ATTEMPTS } from "@/lib/constants";
import type { OtpVerifyResult } from "./Patient";

export interface IAvailability {
  startTime: string;
  endTime: string;
  workingDays: string[];
}

export interface IPsychiatrist extends Document {
  name: string;
  email: string;
  password: string;
  authProvider: "local" | "google";
  avatarUrl?: string;
  profileComplete: boolean;
  phone_number?: string;
  gender?: string;
  date_of_birth?: Date;
  country_of_nationality?: string;
  country_of_graduation?: string;
  date_of_graduation?: Date;
  institute_name?: string;
  license_number?: string;
  degrees?: string;
  years_of_experience?: number;
  expertise?: string;
  bio?: string;
  certificateUrl?: string;
  isApproved: boolean;
  approvedAt?: Date | null;
  approvedBy?: string | null;
  specializations: string[];
  education: string[];
  availability: IAvailability;
  emailVerified: boolean;
  isTemporary: boolean;
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

const psychiatristSchema = new Schema<IPsychiatrist>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
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
    // Credentials are collected after sign-up via the profile-completion step,
    // so they are optional at the schema level and gated by `profileComplete`.
    profileComplete: { type: Boolean, default: false },
    phone_number: { type: String, trim: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: false },
    date_of_birth: { type: Date },
    country_of_nationality: { type: String, trim: true },
    country_of_graduation: { type: String, trim: true },
    date_of_graduation: { type: Date },
    institute_name: { type: String, trim: true },
    license_number: { type: String, trim: true },
    degrees: { type: String, trim: true },
    years_of_experience: { type: Number },
    expertise: { type: String, trim: true },
    bio: { type: String, trim: true },
    certificateUrl: { type: String },
    isApproved: { type: Boolean, default: false },
    approvedAt: { type: Date, default: null },
    approvedBy: { type: String, default: null },
    specializations: { type: [String], default: [] },
    education: { type: [String], default: [] },
    availability: {
      type: {
        startTime: { type: String, default: "09:00" },
        endTime: { type: String, default: "17:00" },
        workingDays: { type: [String], default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] },
      },
      default: {
        startTime: "09:00",
        endTime: "17:00",
        workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      },
    },
    emailVerified: { type: Boolean, default: false },
    isTemporary: { type: Boolean, default: false },
    otp: otpShape,
    loginOtp: otpShape,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

psychiatristSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(BCRYPT_COST);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

psychiatristSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

psychiatristSchema.methods.generateOTP = function (): string {
  const otp = crypto.randomInt(100000, 1000000).toString();
  this.otp = {
    code: crypto.createHash("sha256").update(otp).digest("hex"),
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
    attempts: 0,
    lockedUntil: null,
  };
  return otp;
};

psychiatristSchema.methods.verifyOTP = function (candidate: string): OtpVerifyResult {
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

psychiatristSchema.methods.generateLoginOTP = function (): string {
  const otp = crypto.randomInt(100000, 1000000).toString();
  this.loginOtp = {
    code: crypto.createHash("sha256").update(otp).digest("hex"),
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
    attempts: 0,
    lockedUntil: null,
  };
  return otp;
};

psychiatristSchema.methods.verifyLoginOTP = function (candidate: string): boolean {
  if (!this.loginOtp?.code || !this.loginOtp.expiresAt) return false;
  if (this.loginOtp.lockedUntil && this.loginOtp.lockedUntil > new Date()) return false;
  if (this.loginOtp.expiresAt < new Date()) return false;
  const hashed = crypto.createHash("sha256").update(candidate).digest("hex");
  return this.loginOtp.code === hashed;
};

const Psychiatrist =
  (mongoose.models.Psychiatrist as Model<IPsychiatrist>) ||
  mongoose.model<IPsychiatrist>("Psychiatrist", psychiatristSchema);

export default Psychiatrist;
