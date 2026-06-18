/* Serializers that strip sensitive fields before sending to clients. */

type AnyDoc = Record<string, unknown> & { toObject?: () => Record<string, unknown> };

const toPlain = (doc: unknown): Record<string, unknown> | null => {
  if (!doc) return null;
  const d = doc as AnyDoc;
  return typeof d.toObject === "function" ? d.toObject() : (d as Record<string, unknown>);
};

const stripSensitive = (obj: Record<string, unknown> | null): Record<string, unknown> | null => {
  if (!obj) return obj;
  const rest = { ...obj };
  delete rest.password;
  delete rest.otp;
  delete rest.loginOtp;
  delete rest.resetPasswordToken;
  delete rest.resetPasswordExpires;
  delete rest.__v;
  return rest;
};

export const safePatient = (doc: unknown) => stripSensitive(toPlain(doc));
export const safePsychiatrist = (doc: unknown) => stripSensitive(toPlain(doc));
export const safeAdmin = (doc: unknown) => stripSensitive(toPlain(doc));
export const safeAccount = (doc: unknown) => stripSensitive(toPlain(doc));

/** Public-facing psychiatrist directory: drop PII the public should not see. */
export const publicPsychiatristFields = (doc: unknown) => {
  const obj = toPlain(doc);
  if (!obj) return obj;
  return {
    _id: obj._id,
    name: obj.name,
    expertise: obj.expertise,
    bio: obj.bio,
    specializations: obj.specializations,
    education: obj.education,
    years_of_experience: obj.years_of_experience,
    degrees: obj.degrees,
    availability: obj.availability,
    isApproved: obj.isApproved,
    gender: obj.gender,
  };
};
