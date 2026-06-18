import crypto from "crypto";
import jwt from "jsonwebtoken";
import { AppError } from "./AppError";
import { ERROR_CODES } from "./errorCodes";
import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL, type Role } from "./constants";
import { requireEnv } from "./env";

export type AccessPayload = { sub: string; role: Role; type: "access" };
export type RefreshPayload = { sub: string; role: Role; type: "refresh"; jti: string };

type ExpiresIn = jwt.SignOptions["expiresIn"];

export function signAccess({ id, role }: { id: string | object; role: Role }): string {
  const options: jwt.SignOptions = { expiresIn: ACCESS_TOKEN_TTL as ExpiresIn };
  return jwt.sign({ sub: String(id), role, type: "access" }, requireEnv("JWT_SECRET"), options);
}

export function signRefresh({ id, role, jti }: { id: string | object; role: Role; jti: string }): string {
  const options: jwt.SignOptions = { expiresIn: REFRESH_TOKEN_TTL as ExpiresIn };
  return jwt.sign({ sub: String(id), role, type: "refresh", jti }, requireEnv("JWT_REFRESH_SECRET"), options);
}

export function verifyAccess(token: string): AccessPayload {
  try {
    const decoded = jwt.verify(token, requireEnv("JWT_SECRET")) as AccessPayload;
    if (decoded.type !== "access") {
      throw AppError.unauthorized("Invalid token type", ERROR_CODES.AUTH_TOKEN_INVALID);
    }
    return decoded;
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error instanceof jwt.TokenExpiredError) {
      throw AppError.unauthorized("Access token expired", ERROR_CODES.AUTH_TOKEN_EXPIRED);
    }
    throw AppError.unauthorized("Invalid access token", ERROR_CODES.AUTH_TOKEN_INVALID);
  }
}

export function verifyRefresh(token: string): RefreshPayload {
  try {
    const decoded = jwt.verify(token, requireEnv("JWT_REFRESH_SECRET")) as RefreshPayload;
    if (decoded.type !== "refresh") {
      throw AppError.unauthorized("Invalid token type", ERROR_CODES.AUTH_TOKEN_INVALID);
    }
    return decoded;
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error instanceof jwt.TokenExpiredError) {
      throw AppError.unauthorized("Refresh token expired", ERROR_CODES.AUTH_TOKEN_EXPIRED);
    }
    throw AppError.unauthorized("Invalid refresh token", ERROR_CODES.AUTH_TOKEN_INVALID);
  }
}

export const newJti = (): string => crypto.randomUUID();

export const hashToken = (token: string): string =>
  crypto.createHash("sha256").update(token).digest("hex");
