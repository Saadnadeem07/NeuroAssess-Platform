import type { NextRequest } from "next/server";
import type { Model } from "mongoose";
import { withRoute, ok } from "@/lib/apiHandler";
import { requireAnyRole } from "@/lib/auth-guards";
import { AppError } from "@/lib/AppError";
import { ERROR_CODES } from "@/lib/errorCodes";
import { uploadImage, cloudinaryConfigured } from "@/lib/cloudinary";
import { safePatient, safePsychiatrist, safeAdmin } from "@/lib/sanitize";
import type { Role } from "@/lib/constants";
import Patient from "@/models/Patient";
import Psychiatrist from "@/models/Psychiatrist";
import Admin from "@/models/Admin";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/gif", "image/jpg", "image/webp"]);

const MODELS: Record<Role, Model<any>> = {
  patient: Patient as unknown as Model<any>,
  psychiatrist: Psychiatrist as unknown as Model<any>,
  admin: Admin as unknown as Model<any>,
};
const SANITIZE: Record<Role, (d: unknown) => unknown> = {
  patient: safePatient,
  psychiatrist: safePsychiatrist,
  admin: safeAdmin,
};

export const POST = withRoute(async (req: NextRequest) => {
  const { user, role } = await requireAnyRole(req);

  if (!cloudinaryConfigured()) {
    throw new AppError("Image storage is not configured. Add CLOUDINARY_* env vars.", 503);
  }

  const form = await req.formData();
  const file = form.get("image");
  if (!(file instanceof File)) throw AppError.badRequest("No image provided", ERROR_CODES.UPLOAD_INVALID);
  if (!ALLOWED.has(file.type)) {
    throw AppError.badRequest("Only JPG/PNG/GIF/WebP images are allowed", ERROR_CODES.UPLOAD_INVALID);
  }
  if (file.size > 5 * 1024 * 1024) throw AppError.badRequest("Image must be under 5MB", ERROR_CODES.UPLOAD_INVALID);

  const bytes = Buffer.from(await file.arrayBuffer());
  const url = await uploadImage(bytes, file.type, "avatars");

  const updated = await MODELS[role].findByIdAndUpdate(user._id, { avatarUrl: url }, { new: true }).select("-password");
  return ok(SANITIZE[role](updated), "Profile photo updated");
});
