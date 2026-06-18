import mongoose, { Schema, type Model, type Document } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { BCRYPT_COST, OTP_TTL_MS, OTP_MAX_ATTEMPTS } from "@/lib/constants";
import type { OtpVerifyResult } from "./Patient";

export interface IAdmin extends Document {
  name: string;
  email: string;
  password: string;
  permissions: string[];
  adminLevel: "junior" | "senior" | "super";
  lastLogin?: Date;
  emailVerified: boolean;
  isTemporary: boolean;
  otp?: { code?: string; expiresAt?: Date; attempts?: number; lockedUntil?: Date | null };
  loginOtp?: { code?: string; expiresAt?: Date; attempts?: number; lockedUntil?: Date | null };
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  hasPermission(permission: string): boolean;
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

const adminSchema = new Schema<IAdmin>(
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
    password: { type: String, required: true, minlength: 6, select: false },
    permissions: {
      type: [String],
      enum: ["manage_users", "manage_psychiatrists", "manage_content", "manage_payments", "super_admin"],
      default: ["manage_psychiatrists"],
    },
    adminLevel: { type: String, enum: ["junior", "senior", "super"], default: "junior" },
    lastLogin: { type: Date, default: Date.now },
    emailVerified: { type: Boolean, default: false },
    isTemporary: { type: Boolean, default: false },
    otp: otpShape,
    loginOtp: otpShape,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

adminSchema.methods.hasPermission = function (permission: string): boolean {
  return this.permissions.includes(permission) || this.permissions.includes("super_admin");
};

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(BCRYPT_COST);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

adminSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

adminSchema.methods.generateOTP = function (): string {
  const otp = crypto.randomInt(100000, 1000000).toString();
  this.otp = {
    code: crypto.createHash("sha256").update(otp).digest("hex"),
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
    attempts: 0,
    lockedUntil: null,
  };
  return otp;
};

adminSchema.methods.verifyOTP = function (candidate: string): OtpVerifyResult {
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

adminSchema.methods.generateLoginOTP = function (): string {
  const otp = crypto.randomInt(100000, 1000000).toString();
  this.loginOtp = {
    code: crypto.createHash("sha256").update(otp).digest("hex"),
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
    attempts: 0,
    lockedUntil: null,
  };
  return otp;
};

adminSchema.methods.verifyLoginOTP = function (candidate: string): boolean {
  if (!this.loginOtp?.code || !this.loginOtp.expiresAt) return false;
  if (this.loginOtp.lockedUntil && this.loginOtp.lockedUntil > new Date()) return false;
  if (this.loginOtp.expiresAt < new Date()) return false;
  const hashed = crypto.createHash("sha256").update(candidate).digest("hex");
  return this.loginOtp.code === hashed;
};

const Admin = (mongoose.models.Admin as Model<IAdmin>) || mongoose.model<IAdmin>("Admin", adminSchema);

export default Admin;
