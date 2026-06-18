import { z } from "zod";

export const MIN_LEN = 8;

/** Same rules as the original express-validator policy. */
export const passwordSchema = z
  .string({ required_error: "Password is required" })
  .min(MIN_LEN, `Password must be at least ${MIN_LEN} characters long`)
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const emailSchema = z
  .string({ required_error: "Email is required" })
  .email("Please include a valid email")
  .transform((e) => e.toLowerCase().trim());
