# Project Overview

## What is NeuroAssess?

**NeuroAssess** is a web platform for the **early detection and personalised support of students with dyslexia and dysgraphia** — two common specific learning differences that affect reading and handwriting.

The core idea: a student uploads a sample of their handwriting, an AI model analyses it for markers of dysgraphia, and the platform turns the result into a **personalised, multi‑module learning plan**. Around that core, the platform adds the human side of care — licensed psychiatrists who can be booked for consultations and messaged directly — plus the administration needed to keep the professional side trustworthy (credential verification and approval).

This repository is the **Next.js edition**: a single full‑stack Next.js application that reproduces the original MERN project's features with the same security model.

## Who is it for?

NeuroAssess has **four roles**, each with its own dashboard and permissions.

### 1. Patient / Student
The primary user. After registering and verifying their email:

- **Initial handwriting test** — upload a handwriting image; the AI returns a classification (e.g. *Potential Dysgraphia* vs. *Typical*) with feedback, flagged words, spelling errors, and alignment/spacing issues. A report is saved when dysgraphia markers are detected.
- **Learning plan** — a structured programme delivered in **modules** (Module 1 → Module 2). Each module is generated from a fresh handwriting sample and builds on the previous one. Completing both modules archives a completion report and resets the plan.
- **Reports** — browse all past assessment and learning‑plan reports.
- **Psychiatrist directory** — browse approved, available psychiatrists and view their profiles.
- **Appointments** — book a consultation slot with a psychiatrist (respecting that psychiatrist's working days and avoiding double‑booking).
- **Messaging** — chat with psychiatrists they have an appointment with.
- **Profile & settings** — update name, change password.

### 2. Psychiatrist
A licensed professional. Registration requires detailed credentials (license number, degrees, graduation details, years of experience, a certificate URL, bio, expertise). After email verification, the account is **pending admin approval** and cannot log in to the full dashboard until approved. Once approved:

- **Dashboard** — overview of patients and upcoming appointments.
- **Patients** — the roster of patients derived from their non‑cancelled appointments, with appointment counts and next/last appointment dates.
- **Appointments** — view and cancel scheduled appointments.
- **Availability** — set working days and start/end hours (this gates what patients can book).
- **Messages** — chat with patients.
- **Reports & settings** — review patient context and manage their own profile.

### 3. Admin
The platform operator. Admins are **not publicly registerable** — they are seeded by a script. An admin can:

- **Approve / reject** pending psychiatrist applications (with a rejection reason; rejection emails the applicant and deletes the application).
- **View all** psychiatrists, patients, and admins.
- **Dashboard KPIs** — pending approvals, total users, etc.
- **System settings** — notification / retention / security toggles.

### 4. Shared authentication
Every role shares one authentication system: email + password, **email‑OTP verification** on first login/registration, httpOnly access + refresh cookies, refresh‑token rotation with reuse detection, and a secure password‑reset flow. See [AUTH_AND_SECURITY.md](AUTH_AND_SECURITY.md).

## Feature matrix

| Feature | Patient | Psychiatrist | Admin |
| --- | :---: | :---: | :---: |
| Register (self‑serve) | ✅ | ✅ (needs approval) | ❌ (seeded) |
| Email OTP verification | ✅ | ✅ | ✅ |
| Login / logout | ✅ | ✅ (if approved) | ✅ |
| Forgot / reset password | ✅ | ✅ | ✅ |
| Change password | ✅ | ✅ | ✅ |
| Handwriting test (AI) | ✅ | — | — |
| Learning plan (modules) | ✅ | — | — |
| Reports | ✅ (own) | view patient | — |
| Psychiatrist directory | ✅ | — | — |
| Book appointment | ✅ | — | — |
| Manage appointments | view/cancel | view/cancel | — |
| Set availability | — | ✅ | — |
| Messaging | ✅ (with their psychiatrists) | ✅ (with patients) | — |
| Approve psychiatrists | — | — | ✅ |
| Manage all users | — | — | ✅ |

## End‑to‑end flows

> **Minimal sign-up + progressive profiling.** Sign-up asks for only **name,
> email and password** (or one click with **Google**, for patients). The rest of
> the profile is collected *after* the first login through a **blocking
> completion gate** — the dashboard stays hidden until the profile is 100%
> complete. This is driven by a `profileComplete` flag on each account.

**Patient onboarding**
1. Register with name/email/password — or **Continue with Google** (no OTP needed; Google verifies the email).
2. Verify OTP (local sign-up only) → tokens issued.
3. **Profile completion gate** — add phone, date of birth, gender and an emergency contact. Nothing else is accessible until this is done.
4. Take the initial handwriting test → AI result, report saved if markers found.
5. Start the learning plan (Module 1) → later complete Module 2 → completion archived.
6. Optionally book a psychiatrist and message them.

**Psychiatrist onboarding**
1. Register with name/email/password → temporary account, OTP emailed.
2. Verify OTP → tokens issued.
3. **Profile completion gate** — submit full professional credentials (license, degrees, certificate URL, etc.). Sets `profileComplete: true`.
4. Account is now **`isApproved: false`** → the *pending approval* screen is shown.
5. Admin reviews the (now-complete) application → **approve** (email, account unlocked) or **reject** (email + reason, application deleted).
6. After approval: set availability, accept appointments, message patients.

## Roadmap

These are intentionally out of scope for this port and tracked as follow‑ups:

- **Real ML model** — handwriting analysis is mocked (`src/lib/ai.ts`). Wire a real endpoint via `HANDWRITING_API_URL`.
- **Automated tests** — no unit/integration suite yet (mirrors the original).
- **Real‑time messaging** — messaging is request/response (polling), not WebSocket.
- **Payments / premium tiers** — the data model has a `membershipStatus` flag but no payment integration.
- **File storage** — uploaded images are processed transiently; production should use object storage (S3 / Cloudinary).
