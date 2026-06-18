export const MS = Object.freeze({
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
});

export const OTP_TTL_MS = 15 * MS.MINUTE;
export const OTP_MAX_ATTEMPTS = 5;
export const RESET_TOKEN_TTL_MS = 1 * MS.HOUR;

export const ACCESS_TOKEN_TTL = process.env.JWT_ACCESS_EXPIRE || "15m";
export const REFRESH_TOKEN_TTL = process.env.JWT_REFRESH_EXPIRE || "7d";

export const ACCESS_COOKIE_NAME = "accessToken";
export const REFRESH_COOKIE_NAME = "refreshToken";

export const ACCESS_COOKIE_MAX_AGE = 15 * MS.MINUTE; // ms
export const REFRESH_COOKIE_MAX_AGE = 7 * MS.DAY; // ms

export const CLEANUP_INTERVAL_MS = 5 * MS.MINUTE;
export const BCRYPT_COST = 12;

export type Role = "patient" | "psychiatrist" | "admin";
