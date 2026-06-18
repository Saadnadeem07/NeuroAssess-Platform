# Setup, Seeding, Troubleshooting & Deployment

## Prerequisites

- **Node.js 18.18+** (Next.js 14 requirement)
- **MongoDB** — either a local `mongod` or a free **MongoDB Atlas** cluster
- npm (ships with Node)

## 1. Install

```bash
cd "NeuroAssess FYP Next JS"
npm install
```

## 2. Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`. The **minimum** to boot:

```bash
MONGODB_URI=mongodb://127.0.0.1:27017/neuroassess
JWT_SECRET=$(openssl rand -hex 48)
JWT_REFRESH_SECRET=$(openssl rand -hex 48)
```

Everything else has safe development defaults:
- **Email** — leave `EMAIL_*` blank and OTP/reset codes print to the server console.
- **AI** — `MOCK_AI=true` returns a deterministic handwriting assessment.

## 3. Seed an admin

Admins can't self‑register. Create the first one:

```bash
npm run seed:admin
# Uses ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME if set, else prompts/defaults.
```

Default seeded credentials (override via env before running):

```
email:    admin@neuroassess.local
password: Admin@12345
```

The seed marks the admin `emailVerified: true` so you can log in immediately at `/admin/login`.

## 4. Run

```bash
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
npm run typecheck# tsc --noEmit
```

## Trying the app

1. **Patient:** go to `/register`, choose *Patient*, fill the form, submit.
2. Check the **server console** for the OTP (or your inbox if SMTP is set).
3. Enter the OTP at `/verify-otp` → you land on the patient dashboard.
4. Run the **handwriting test** (upload any image) → see the mock result.
5. Start a **learning plan** module.
6. **Psychiatrist:** register at `/register` → *Psychiatrist*, verify OTP → you'll see a *pending approval* screen.
7. **Admin:** log in at `/admin/login`, open **Approvals**, approve the psychiatrist.
8. Log back in as the psychiatrist → full dashboard; set availability.
9. As the patient, **book** that psychiatrist and **message** them.

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| `MONGODB_URI is not set` on boot | Add it to `.env.local`. |
| `JWT_SECRET is not configured` | Set `JWT_SECRET` and `JWT_REFRESH_SECRET`. |
| Can't see the OTP email | Without SMTP, the OTP is printed to the **server console** (the terminal running `npm run dev`). |
| Psychiatrist can't log in | Expected until an admin approves them (`AUTH_NOT_APPROVED`). |
| 401 loops / instant logout | Clear cookies; ensure both JWT secrets are stable across restarts (don't regenerate them each run). |
| `Module not found: mongoose` in an edge context | Mongoose models must only be imported from Route Handlers / server code, never from `middleware.ts` or client components. |
| Mongoose "Cannot overwrite model" on hot reload | Handled by the `models.X || model(...)` guard — ensure new models follow it. |

## Deployment

### Vercel (recommended)
1. Push this folder to a Git repo.
2. Import it in Vercel.
3. Add the env vars from `.env.example` in the Vercel dashboard (use a managed MongoDB like Atlas).
4. Deploy. Route Handlers run as serverless functions; the UI is served by Vercel's edge/CDN.

> Note: the **in‑memory rate limiter** and the **cleanup scheduler** are per‑instance. On serverless/multi‑instance, move rate limiting to Redis/Upstash and run cleanup as a scheduled job (Vercel Cron) hitting an internal endpoint.

### Node / Docker
```bash
npm run build
npm run start    # serves on $PORT (default 3000)
```
Set `NODE_ENV=production` so cookies are issued with `secure: true` (requires HTTPS).

## Security checklist for production

- [ ] Strong, **stable** `JWT_SECRET` and `JWT_REFRESH_SECRET` (rotate deliberately).
- [ ] `NODE_ENV=production` and HTTPS (so `secure` cookies work).
- [ ] Real SMTP credentials.
- [ ] Managed MongoDB with auth + network allowlist.
- [ ] Redis‑backed rate limiting if running more than one instance.
- [ ] Object storage for uploads instead of the transient local dir.
