import { z } from "zod";
import { passwordSchema, emailSchema } from "./passwordPolicy";

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const otpSchema = z.object({
  id: z.string().min(1, "ID is required"),
  otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export const idOnlySchema = z.object({ id: z.string().min(1, "ID is required") });

export const forgotSchema = z.object({ email: emailSchema });

export const resetSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: passwordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
});

export const createAdminSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: emailSchema,
  password: passwordSchema,
  superAdmin: z.boolean().optional(),
});

// --- Minimal sign-up (both roles): just identity + credentials ------------

export const registerPatientSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: emailSchema,
  password: passwordSchema,
});

export const registerPsychiatristSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: emailSchema,
  password: passwordSchema,
});

// --- Profile completion (collected after first login) ---------------------

export const completePatientProfileSchema = z.object({
  phone: z.string().trim().min(1, "Phone number is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other", "prefer not to say"], {
    errorMap: () => ({ message: "Please select a gender" }),
  }),
  emergencyContact: z.object({
    name: z.string().trim().min(1, "Emergency contact name is required"),
    relationship: z.string().trim().min(1, "Relationship is required"),
    phone: z.string().trim().min(1, "Emergency contact phone is required"),
  }),
});

export const completePsychiatristProfileSchema = z.object({
  phone_number: z.string().trim().min(1, "Phone number is required"),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  country_of_nationality: z.string().trim().min(1, "Country of nationality is required"),
  country_of_graduation: z.string().trim().min(1, "Country of graduation is required"),
  date_of_graduation: z.string().min(1, "Date of graduation is required"),
  institute_name: z.string().trim().min(1, "Institute name is required"),
  license_number: z.string().trim().min(1, "License number is required"),
  degrees: z.string().trim().min(1, "Degrees are required"),
  years_of_experience: z.coerce.number({ invalid_type_error: "Years of experience is required" }),
  expertise: z.string().trim().min(1, "Expertise is required"),
  bio: z.string().trim().min(1, "Bio is required"),
  certificateUrl: z.string().url("Certificate URL must be a valid URL"),
});
