# Data Model

NeuroAssess uses **MongoDB** via **Mongoose**. There are **nine** collections. Roles are stored in **separate collections** (`Patient`, `Psychiatrist`, `Admin`) rather than a single users table — this mirrors the original design and keeps role‑specific fields and validation clean.

All schemas use `timestamps` and are defined in [`src/models`](../src/models). Each model file uses the Next.js caching guard:

```ts
export default (mongoose.models.Patient as Model<IPatient>) ||
  mongoose.model<IPatient>("Patient", patientSchema);
```

---

## Patient
The student / primary user. File: [`src/models/Patient.ts`](../src/models/Patient.ts)

| Field | Type | Notes |
| --- | --- | --- |
| `name` | String | required |
| `email` | String | required, unique, lowercased |
| `password` | String | required, **bcrypt(12)**, `select: false` |
| `dateOfBirth` | Date | optional |
| `gender` | enum | `male` / `female` / `other` / `prefer not to say` |
| `membershipStatus` | Boolean | default `false` (premium flag, no payments yet) |
| `membershipExpiresAt` | Date | optional |
| `emergencyContact` | `{ name, relationship, phone }` | optional |
| `emailVerified` | Boolean | default `false` |
| `isTemporary` | Boolean | `true` until OTP verified; cleaned up if it expires |
| `lastLogin` | Date | optional |
| `otp` | `{ code, expiresAt, attempts, lockedUntil }` | hashed OTP + lockout |
| `loginOtp` | same shape | reserved for future login‑OTP |
| `resetPasswordToken` / `resetPasswordExpires` | String / Date | hashed reset token |

**Methods:** `comparePassword`, `generateOTP`, `verifyOTP` (returns `{ ok, reason }`), `generateLoginOTP`, `verifyLoginOTP`.

---

## Psychiatrist
The licensed professional. File: [`src/models/Psychiatrist.ts`](../src/models/Psychiatrist.ts)

Includes everything Patient has for auth, **plus** credential fields:

| Field | Type | Notes |
| --- | --- | --- |
| `phone_number` | String | required |
| `gender` | enum | `Male` / `Female` / `Other` |
| `date_of_birth` | Date | required |
| `country_of_nationality` | String | required |
| `country_of_graduation` | String | required |
| `date_of_graduation` | Date | required |
| `institute_name` | String | required |
| `license_number` | String | required |
| `degrees` | String | required |
| `years_of_experience` | Number | required |
| `expertise` | String | required |
| `bio` | String | required |
| `certificateUrl` | String | required (proof of credentials) |
| `isApproved` | Boolean | **default `false`** — gates login |
| `approvedAt` / `approvedBy` | Date / String | set on admin approval |
| `specializations` | [String] | |
| `education` | [String] | |
| `availability` | `{ startTime, endTime, workingDays[] }` | gates booking; defaults to 09:00–17:00 Mon–Fri |

Same auth fields/methods as Patient (`emailVerified`, `isTemporary`, `otp`, reset token, etc.).

---

## Admin
The operator. File: [`src/models/Admin.ts`](../src/models/Admin.ts). **Seeded, never self‑registered.**

| Field | Type | Notes |
| --- | --- | --- |
| `name`, `email`, `password` | | as above (bcrypt(12)) |
| `permissions` | [enum] | `manage_users`, `manage_psychiatrists`, `manage_content`, `manage_payments`, `super_admin` |
| `adminLevel` | enum | `junior` / `senior` / `super` |
| `lastLogin` | Date | |
| `emailVerified`, `isTemporary`, `otp`, `loginOtp`, reset token | | as above |

**Extra method:** `hasPermission(p)` — true if the admin has `p` or `super_admin`.

---

## RefreshToken
Server‑side store of issued refresh tokens, enabling **rotation + reuse detection**. File: [`src/models/RefreshToken.ts`](../src/models/RefreshToken.ts)

| Field | Type | Notes |
| --- | --- | --- |
| `accountId` | ObjectId | indexed; references the role's document |
| `role` | enum | `patient` / `psychiatrist` / `admin` |
| `tokenHash` | String | SHA‑256 of the refresh JWT (the raw token is never stored) |
| `jti` | String | unique token id |
| `expiresAt` | Date | TTL index removes expired docs automatically |
| `revokedAt` | Date | set on logout / rotation / reuse |
| `replacedBy` | String | `jti` of the successor token after rotation |
| `userAgent` / `ip` | String | audit context |

**Method:** `isActive()` — not revoked and not expired.

---

## Appointment
A booked consultation. File: [`src/models/Appointment.ts`](../src/models/Appointment.ts)

| Field | Type | Notes |
| --- | --- | --- |
| `patient` / `psychiatrist` | ObjectId refs | |
| `date` | Date | stored at 12:00 UTC of the booked day |
| `timeSlot` | String | e.g. `"10:00 AM - 11:00 AM"` |
| `status` | enum | `scheduled` / `completed` / `cancelled` |
| `notes` | String | |
| `patientName`, `psychiatristName`, `patientEmail`, `psychiatristEmail` | String | denormalised for quick reads & emails |

Indexes on `(patient, date)`, `(psychiatrist, date)`, `status`.

---

## Message
A direct message between a patient and a psychiatrist. File: [`src/models/Message.ts`](../src/models/Message.ts)

| Field | Type | Notes |
| --- | --- | --- |
| `sender` / `receiver` | ObjectId (`refPath`) | polymorphic across Patient/Psychiatrist |
| `senderModel` / `receiverModel` | enum | `Patient` / `Psychiatrist` |
| `senderRole` / `receiverRole` | enum | `patient` / `psychiatrist` |
| `senderName` / `receiverName` | String | denormalised |
| `content` | String | required |
| `isRead` | Boolean | default `false` |

Indexes on `(sender, receiver)`, `(receiver, isRead)`, `createdAt`.

---

## Report
An assessment or learning‑plan output. File: [`src/models/Report.ts`](../src/models/Report.ts)

| Field | Type | Notes |
| --- | --- | --- |
| `report_name` | String | e.g. `14-30_2026-06-18_testing` |
| `report_type` | enum | `testing` / `learning-plan` / `learning-plan-completed` |
| `user_id` | ObjectId → Patient | |
| `report_data` | Mixed | the raw AI result payload |

Compound unique index on `(user_id, report_name)`. Static finders: `findByUserId`, `findByUserIdAndType`. Uses `created_at` / `updated_at` timestamps.

---

## LearningPlan
One module of a patient's personalised plan. File: [`src/models/LearningPlan.ts`](../src/models/LearningPlan.ts)

| Field | Type | Notes |
| --- | --- | --- |
| `user_id` | ObjectId → Patient | |
| `module_number` | enum `1`/`2` | |
| `learning_plan_paragraph` | String | the generated plan text |
| `report_id` | ObjectId → Report | the report that produced it |

Compound **unique** index on `(user_id, module_number)` — one plan per module per patient. Statics: `findByUserId`, `findByUserIdAndModule`. Uses `created_at` / `updated_at`.

---

## Relationships

```
Patient ──< Appointment >── Psychiatrist
   │                              ▲
   ├──< Report                    │
   ├──< LearningPlan ──> Report   │
   └──< Message >──────────────── ┘   (polymorphic sender/receiver)

Patient / Psychiatrist / Admin ──< RefreshToken   (by accountId + role)
Admin ──approves──> Psychiatrist  (sets isApproved / approvedBy)
```
