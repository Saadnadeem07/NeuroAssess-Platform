import { v2 as cloudinary } from "cloudinary";

/**
 * Cloudinary image storage with graceful fallback.
 *
 * Configure with either CLOUDINARY_URL, or the three discrete vars:
 *   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 *
 * If unconfigured, `cloudinaryConfigured()` returns false and callers fall
 * back to storing images inline (base64) so the app keeps working.
 */

let configured: boolean | null = null;

function ensureConfig(): boolean {
  if (configured !== null) return configured;

  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({ secure: true });
    configured = true;
    return true;
  }
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (cloud_name && api_key && api_secret) {
    cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
    configured = true;
    return true;
  }
  configured = false;
  return false;
}

export function cloudinaryConfigured(): boolean {
  return ensureConfig();
}

/** Uploads an image buffer and returns its secure CDN URL. */
export async function uploadImage(
  bytes: Buffer,
  mime: string,
  folder: string
): Promise<string> {
  if (!ensureConfig()) throw new Error("Cloudinary is not configured");
  const dataUri = `data:${mime};base64,${bytes.toString("base64")}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: `neuroassess/${folder}`,
    resource_type: "image",
    overwrite: true,
  });
  return result.secure_url;
}
