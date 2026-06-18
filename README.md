# NeuroAssess — Next.js Edition

> AI-assisted **early detection and personalised support for students with dyslexia and dysgraphia**.
> This is a full‑stack **Next.js (App Router)** port of the original MERN application (`NeuroAssess-FYP`).

NeuroAssess gives four kinds of users one platform:

- **Patients / students** take an AI handwriting assessment, receive a personalised multi‑module learning plan, track progress, book consultations, and message psychiatrists.
- **Psychiatrists** manage their patient roster, set availability, accept appointments, review reports, and message patients (after the platform verifies & approves their credentials).
- **Admins** approve or reject psychiatrist applications, manage users, and oversee the system.
- **Everyone** shares one secure, cookie‑based authentication system with email‑OTP verification.

---

## Why a Next.js rewrite?

The original project is a classic MERN split: an **Express** API in `server/` and a **Vite + React** SPA in `client/`, deployed as two separate services. This rewrite collapses both halves into a **single Next.js app**:

| Concern | MERN original | Next.js port |
| --- | --- | --- |
| Frontend | Vite + React Router SPA | Next.js App Router (RSC + client components) |
| Backend | Express server (`server/`) | Route Handlers under `src/app/api/**` |
| Auth | JWT in httpOnly cookies + Express middleware | Same model, enforced via `middleware.ts` + per‑route guards |
| DB | Mongoose | Mongoose (schemas reused, ported to TypeScript) |
| Deploy | 2 services + Nginx | 1 deployable (Vercel / Node) |

The **security model is preserved exactly**: short‑lived access tokens, rotating refresh tokens with reuse detection, bcrypt(12) password hashing, hashed OTPs with lockout, and a hashed password‑reset flow.

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
#    → set MONGODB_URI, JWT_SECRET, JWT_REFRESH_SECRET (minimum)

# 3. Seed the first admin (admins are not publicly registerable)
npm run seed:admin

# 4. Run the dev server
npm run dev
#    → http://localhost:3000
```

> **No SMTP configured?** In development the app prints OTP / reset codes to the
> server console instead of emailing them, so you can register and log in with
> zero email setup. See [`src/lib/email.ts`](src/lib/email.ts).

> **No real ML model?** Handwriting analysis is **mocked** by default
> (`MOCK_AI=true`) and returns a deterministic, plausible assessment so every
> patient flow works end‑to‑end. See [`src/lib/ai.ts`](src/lib/ai.ts).

---

## Documentation

The `docs/` folder explains everything in depth:

| Doc | What's inside |
| --- | --- |
| [docs/PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md) | What NeuroAssess is, who it's for, the full feature list per role |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | How the Next.js app is wired: request lifecycle, layers, conventions |
| [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) | Every folder and file, explained |
| [docs/DATA_MODEL.md](docs/DATA_MODEL.md) | All 9 Mongoose models, fields, relationships, indexes |
| [docs/API_REFERENCE.md](docs/API_REFERENCE.md) | Every API endpoint, payload, and response |
| [docs/AUTH_AND_SECURITY.md](docs/AUTH_AND_SECURITY.md) | Tokens, cookies, OTP, refresh rotation, rate limiting |
| [docs/MIGRATION_FROM_MERN.md](docs/MIGRATION_FROM_MERN.md) | Exactly how each Express piece maps to Next.js |
| [docs/SETUP.md](docs/SETUP.md) | Detailed local setup, seeding, troubleshooting, deployment |

---

## Tech stack

- **Next.js 14** (App Router, Route Handlers, middleware)
- **TypeScript** (strict)
- **MongoDB + Mongoose 8**
- **JWT** (`jsonwebtoken`) + **bcryptjs** for the auth core
- **Tailwind CSS** + a small shadcn‑style component set
- **Zod** for request validation
- **Nodemailer** for transactional email

---

## Project status

This port implements the full feature surface of `NeuroAssess-FYP`:
authentication (4 roles, OTP, refresh rotation, reset), the psychiatrist
approval workflow, appointments, messaging, the handwriting test, and the
multi‑module learning plan. The handwriting ML model is mocked and there is no
automated test suite yet — both are documented as follow‑ups in
[docs/PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md#roadmap).
