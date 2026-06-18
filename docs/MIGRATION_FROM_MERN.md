# Migration: MERN → Next.js

This document maps each part of the original `NeuroAssess-FYP` (Express + Vite/React) onto its Next.js equivalent, so anyone familiar with the original can navigate this port instantly.

## Top‑level shape

| Original (MERN) | This port (Next.js) |
| --- | --- |
| `server/` (Express API) | `src/app/api/**/route.ts` |
| `client/` (Vite + React SPA) | `src/app/**/page.tsx` + `src/components/**` |
| `server/src/index.js` (app bootstrap) | Next.js itself + `middleware.ts` |
| Two deployables + Nginx | One Next.js deployable |

## Backend mapping

| Express concept | Next.js implementation |
| --- | --- |
| `app.use("/api/auth", router)` | folder `src/app/api/auth/**/route.ts` |
| `router.post("/login", ctrl)` | `export async function POST(req)` in that folder's `route.ts` |
| `asyncHandler(fn)` | `withRoute(fn)` in `src/lib/apiHandler.ts` |
| `errorHandler` (4‑arg middleware) | `withRoute` catch block → JSON envelope |
| `middleware/auth.js` (`protectX`) | `requireX(req)` in `src/lib/auth-guards.ts` |
| `middleware/rateLimit.js` | `rateLimit(req, "auth")` in `src/lib/rateLimit.ts` |
| `middleware/validate.js` + express‑validator | Zod `.parse()` per handler |
| `req.body` | `await readJson(req)` / `await req.formData()` |
| `req.params.id` | the `{ params }` arg of the handler |
| `req.query` | `new URL(req.url).searchParams` |
| `res.json({...})` | `return ok(data, message)` |
| `res.cookie(...)` | `setAuthCookies(res, ...)` via `NextResponse` |
| `multer` upload | `await req.formData()` → `File` |
| cron `setInterval` cleanup | `cleanupTemporaryAccounts()` (on‑demand / scheduled) |

### File‑by‑file

| Original file | Ported to |
| --- | --- |
| `server/src/config/database.js` | `src/lib/db.ts` (adds hot‑reload cache) |
| `server/src/utils/constants.js` | `src/lib/constants.ts` |
| `server/src/utils/errorCodes.js` | `src/lib/errorCodes.ts` |
| `server/src/utils/AppError.js` | `src/lib/AppError.ts` |
| `server/src/utils/tokens.js` | `src/lib/tokens.ts` |
| `server/src/utils/cookies.js` | `src/lib/cookies.ts` |
| `server/src/utils/sanitize.js` | `src/lib/sanitize.ts` |
| `server/src/utils/passwordPolicy.js` | `src/lib/passwordPolicy.ts` (Zod instead of express‑validator) |
| `server/src/middleware/auth.js` | `src/lib/auth-guards.ts` |
| `server/src/middleware/errorHandler.js` + `asyncHandler.js` | `src/lib/apiHandler.ts` |
| `server/src/middleware/rateLimit.js` | `src/lib/rateLimit.ts` |
| `server/src/services/authService.js` | `src/lib/auth-service.ts` |
| `server/src/services/emailService.js` | `src/lib/email.ts` |
| `server/src/controllers/authController.js` | split across `src/app/api/auth/**` |
| `server/src/controllers/reportController.js` | `src/app/api/tests/**` + `src/lib/ai.ts` |
| `server/src/controllers/learningPlanController.js` | `src/app/api/learning-plans/**` + `src/lib/ai.ts` |
| `server/src/models/*.js` | `src/models/*.ts` (TS + cache guard) |
| each `server/src/routes/*.js` | matching `src/app/api/<name>/**` |

## Frontend mapping

| Original (React SPA) | This port (Next.js) |
| --- | --- |
| `react-router-dom` `<Routes>` | filesystem routing under `src/app` |
| `App.tsx` route table | route‑group folders + `layout.tsx` |
| `services/api.ts` (axios + interceptor) | `src/lib/api-client.ts` (fetch + single‑flight refresh) |
| `services/auth.ts` | `src/services/auth-client.ts` |
| `context/AuthContext.tsx` | `src/context/AuthContext.tsx` (largely unchanged) |
| `import.meta.env.VITE_API_URL` | same‑origin `/api` (no separate host) |
| Radix‑heavy `components/ui/*` (56 files) | a lean shadcn‑style subset |
| `pages/dashboard/*` + `components/<role>/*` | `app/<role>/dashboard/page.tsx` + `components/<role>/*` |

## Behavioural differences (intentional)

- **Same origin.** The SPA used to call a separate `http://localhost:5000`. Here the UI and API share an origin, so CORS configuration is unnecessary and cookies "just work".
- **Mocked AI.** The original called a Hugging Face endpoint (`HUGGING_FACE_API_URL`). This port ships a deterministic mock (`src/lib/ai.ts`) so flows work without a model; set `MOCK_AI=false` + `HANDWRITING_API_URL` to call a real one.
- **Email fallback.** If SMTP isn't configured, OTP/reset codes are logged to the server console in development (the original required SMTP).
- **Rate limiting is in‑memory.** Equivalent behaviour to express‑rate‑limit, but per‑instance; use Redis for multi‑instance production.
- **Validation via Zod** instead of express‑validator — same rules, same `VALIDATION_FAILED` error shape (`details: [{ field, message }]`).
