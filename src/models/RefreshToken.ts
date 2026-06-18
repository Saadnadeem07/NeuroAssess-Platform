import mongoose, { Schema, type Model, type Document, type Types } from "mongoose";
import type { Role } from "@/lib/constants";

export interface IRefreshToken extends Document {
  accountId: Types.ObjectId;
  role: Role;
  tokenHash: string;
  jti: string;
  expiresAt: Date;
  revokedAt?: Date | null;
  replacedBy?: string | null;
  userAgent?: string | null;
  ip?: string | null;
  isActive(): boolean;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    accountId: { type: Schema.Types.ObjectId, required: true, index: true },
    role: { type: String, enum: ["patient", "psychiatrist", "admin"], required: true },
    tokenHash: { type: String, required: true, unique: true, index: true },
    jti: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
    replacedBy: { type: String, default: null },
    userAgent: { type: String, default: null },
    ip: { type: String, default: null },
  },
  { timestamps: true }
);

refreshTokenSchema.index({ accountId: 1, role: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

refreshTokenSchema.methods.isActive = function (): boolean {
  return !this.revokedAt && this.expiresAt > new Date();
};

const RefreshToken =
  (mongoose.models.RefreshToken as Model<IRefreshToken>) ||
  mongoose.model<IRefreshToken>("RefreshToken", refreshTokenSchema);

export default RefreshToken;
