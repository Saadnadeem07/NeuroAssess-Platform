# API Reference

All endpoints live under `/api`. Auth is **cookie‑based** (httpOnly `accessToken` + `refreshToken`); send credentials with every request (the browser does this automatically; from tools use `--cookie`).

**Success envelope:** `{ "success": true, "data": ..., "message"?: ... }`
**Error envelope:** `{ "success": false, "error", "code", "statusCode", "requestId", "details"? }`

Rate‑limited groups: `auth` (10 / 15min), `otp` (5 / 15min), `passwordReset` (5 / hour), and a global limiter (200 / min).

---

## Health

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/health` | — | DB connectivity + timestamp |

---

## Auth — Patient (`/api/auth/patient`)

| Method | Path | Auth | Body | Description |
| --- | --- | --- | --- | --- |
| POST | `/register` | — | `{ name, email, password, dateOfBirth?, gender? }` | Creates a temporary patient, emails OTP. Returns `{ id, email, name }`. |
| POST | `/login` | — | `{ email, password }` | If unverified → 403 `AUTH_EMAIL_NOT_VERIFIED` (re‑sends OTP, returns `details.id`). On success sets cookies, returns the patient. |
| POST | `/verify-otp` | — | `{ id, otp }` | Verifies OTP, marks account permanent, issues tokens. |
| POST | `/resend-otp` | — | `{ id }` | Re‑sends OTP. |
| GET | `/me` | patient | — | Current patient profile. |
| POST | `/forgot-password` | — | `{ email }` | Always 200 (no user enumeration); emails reset link if account exists. |
| POST | `/reset-password` | — | `{ token, newPassword }` | Resets password, revokes all refresh tokens. |
| POST | `/change-password` | patient | `{ currentPassword, newPassword }` | Changes password, revokes refresh tokens. |

## Auth — Psychiatrist (`/api/auth/psychiatrist`)
Same set as patient, but:
- `/register` body includes all credential fields (see [DATA_MODEL.md](DATA_MODEL.md#psychiatrist)).
- `/login` additionally returns 403 `AUTH_NOT_APPROVED` if `isApproved` is false.

## Auth — Admin (`/api/auth/admin`)
Same set **except no `/register`** (admins are seeded). `/login`, `/verify-otp`, `/resend-otp`, `/me`, `/forgot-password`, `/reset-password`, `/change-password`.

## Auth — shared

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/refresh` | refresh cookie | Rotates refresh token (reuse detection), issues a new access token. |
| POST | `/api/auth/logout` | — | Revokes the current refresh token, clears cookies. |

---

## Users (`/api/users`)

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/psychiatrists/approved` | patient or psychiatrist | Approved + verified + available psychiatrists (public fields). |
| GET | `/psychiatrists/:id` | patient or psychiatrist | One approved psychiatrist's public profile. |
| PUT | `/psychiatrists/:id` | psychiatrist (self) | Update own `name`. |
| PUT | `/psychiatrists/:id/availability` | psychiatrist (self) | `{ startTime, endTime, workingDays[] }`. |
| PUT | `/patients/:id` | patient (self) | Update own `name`. |
| PUT | `/admins/:id` | admin (self) | Update own `name`. |

---

## Admin (`/api/admin`) — all require `admin`

| Method | Path | Description |
| --- | --- | --- |
| GET | `/psychiatrists` | All psychiatrists. |
| GET | `/psychiatrists/pending` | Verified but not‑yet‑approved psychiatrists. |
| PATCH | `/psychiatrists/:id/approve` | Approve; emails the psychiatrist. |
| PATCH | `/psychiatrists/:id/reject` | `{ reason }` — emails applicant, deletes the application. |
| GET | `/patients` | All patients (summary fields). |
| GET | `/admins` | All admins. |
| GET | `/settings` | System settings. |
| PUT | `/settings` | Update system settings. |

---

## Appointments (`/api/appointments`)

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/` | patient | `{ psychiatristId, date, timeSlot }` — books, with working‑day + double‑book checks; emails both parties. |
| GET | `/patient` | patient | The patient's appointments. |
| GET | `/psychiatrist` | psychiatrist | The psychiatrist's appointments. |
| PUT | `/cancel/:id` | patient or psychiatrist | Cancel (must be a party); emails both. |
| GET | `/booked-slots/:psychiatristId?date=` | patient or psychiatrist | Time slots already taken on a date. |
| GET | `/psychiatrist/patients` | psychiatrist | Derived patient roster (counts, next/last appointment). |
| GET | `/my-psychiatrists` | patient | Distinct psychiatrists the patient has appointments with. |

---

## Tests / Handwriting (`/api/tests`) — all require `patient`

| Method | Path | Description |
| --- | --- | --- |
| POST | `/initial` | multipart `image` — runs the (mock) analyzer; saves a `testing` report if dysgraphia markers are found. |
| GET | `/reports` | All of the patient's reports. |
| GET | `/reports/:id` | One report (ownership enforced). |
| GET | `/reports/type/:type` | Reports filtered by type. |

---

## Learning Plans (`/api/learning-plans`) — all require `patient`

| Method | Path | Description |
| --- | --- | --- |
| GET | `/` | The patient's learning‑plan modules. |
| GET | `/module/:moduleNumber` | One module (1 or 2). |
| POST | `/module` | multipart `image` + `moduleNumber` (+ optional `previousLearningPlan`). Creates/updates a module; Module 2 requires Module 1 to exist. |
| POST | `/reset` | Archives both modules to a `learning-plan-completed` report, then clears the plan. Requires both modules done. |

---

## Messages (`/api/messages`) — all require `patient` or `psychiatrist`

| Method | Path | Description |
| --- | --- | --- |
| GET | `/conversations` | Conversation list with last message + unread count. |
| GET | `/conversation/:userId` | Full thread with a partner; marks incoming as read. Patients may only message psychiatrists they have an appointment with. |
| POST | `/` | `{ receiverId, content }` — send a message (same appointment rule for patients). |
| GET | `/unread-count` | Total unread for the current user. |
| PUT | `/mark-read` | `{ messageIds[] }` — mark messages read. |
