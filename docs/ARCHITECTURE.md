# Architecture

NeuroAssess (Next.js) is a **single full‑stack Next.js 14 application** using the App Router. The browser UI and the JSON API live in the same project and deploy as one unit.

```
                            ┌─────────────────────────────────────────────┐
                            │                Next.js app                   │
   Browser ───────────────▶│  middleware.ts  (edge route guard)           │
   (httpOnly cookies)       │       │                                      │
                            │       ▼                                      │
                            │  app/**/page.tsx        app/api/**/route.ts  │
                            │  (React UI)             (JSON API handlers)   │
                            │                              │               │
                            │                              ▼               │
                            │   lib/  (db, tokens, cookies, guards, email) │
                            │                              │               │
                            │                              ▼               │
                            │              models/ (Mongoose schemas)      │
                            └──────────────────────────────┼──────────────┘
                                                           ▼
                                                     MongoDB (Atlas/local)
```

## Layers

### 1. Routing & UI — `src/app`
- **Pages** (`page.tsx`) render the UI. The landing page is a Server Component; interactive pages (dashboards, auth forms) are Client Components that call the API via the `apiClient` fetch wrapper.
- **Route groups** keep things tidy: `(auth)` for login/register/OTP/reset, and role folders (`patient/`, `psychiatrist/`, `admin/`) for dashboards.

### 2. API — `src/app/api/**/route.ts`
Each Express route became a **Route Handler**. A handler:
1. is wrapped by `withRoute()` ([`src/lib/apiHandler.ts`](../src/lib/apiHandler.ts)), which provides the same centralised error handling, request‑id, and JSON envelope as the original Express `errorHandler`;
2. optionally runs `rateLimit()` for auth/OTP/reset endpoints;
3. calls an auth guard (`requirePatient`, `requirePsychiatrist`, `requireAdmin`, `requirePatientOrPsychiatrist`) when protected;
4. validates the body with a Zod schema;
5. talks to Mongoose models and returns `ok(...)` / throws `AppError`.

### 3. Domain & infrastructure — `src/lib`
The reusable core, ported almost 1:1 from the original `server/src/utils` + middleware:

| File | Responsibility | Original equivalent |
| --- | --- | --- |
| `db.ts` | Cached Mongoose connection (survives hot reload) | `config/database.js` |
| `env.ts` | Reads & validates required env vars | scattered `process.env` |
| `constants.ts` | TTLs, cookie names, bcrypt cost | `utils/constants.js` |
| `errorCodes.ts` | Stable machine‑readable error codes | `utils/errorCodes.js` |
| `AppError.ts` | Typed operational errors | `utils/AppError.js` |
| `tokens.ts` | Sign/verify access & refresh JWTs | `utils/tokens.js` |
| `cookies.ts` | Set/clear auth cookies (Next cookie API) | `utils/cookies.js` |
| `sanitize.ts` | Strip sensitive fields before responding | `utils/sanitize.js` |
| `passwordPolicy.ts` | Password strength (Zod) | `utils/passwordPolicy.js` |
| `apiHandler.ts` | `withRoute()` wrapper + JSON envelope | `middleware/errorHandler.js`, `asyncHandler.js` |
| `rateLimit.ts` | In‑memory fixed‑window limiter | `middleware/rateLimit.js` |
| `auth-guards.ts` | Load principal from access cookie | `middleware/auth.js` |
| `email.ts` | Nodemailer transactional email (+ dev console fallback) | `services/emailService.js` |
| `auth-service.ts` | Registration / OTP verify / cleanup | `services/authService.js` |
| `ai.ts` | **Mock** handwriting analyzer | the Hugging Face call in controllers |

### 4. Data — `src/models`
The nine Mongoose schemas, ported to TypeScript with the **Next.js model‑caching guard** (`models.X || model('X', schema)`) so hot reload doesn't re‑compile a model. See [DATA_MODEL.md](DATA_MODEL.md).

## Request lifecycle (protected API call)

Example: a patient books an appointment (`POST /api/appointments`).

1. Browser sends the request; the **httpOnly `accessToken` cookie** rides along automatically.
2. `middleware.ts` runs at the edge: for `/patient/**` *page* navigations it checks a cookie is present and redirects to `/login` if not. (It is a coarse gate; real authorization happens in the handler.)
3. The Route Handler is invoked, wrapped by `withRoute()`.
4. `requirePatient(req)` reads & verifies the access JWT, loads the `Patient` document, and returns the principal — or throws `AppError.unauthorized`.
5. The handler validates the body (Zod), runs booking rules (working day, no double‑book), and `Appointment.create(...)`.
6. On success → `ok(data, message, 201)`. On any thrown `AppError` → `withRoute` serialises the standard error envelope.

## Token refresh (client side)

`apiClient` mirrors the original axios interceptor: on a `401` from a protected
endpoint it does a **single‑flight** `POST /api/auth/refresh`, and if that
succeeds it retries the original request once. If refresh fails it dispatches a
global `auth:logout` event that `AuthContext` listens for to clear state and
route to login. See [`src/lib/api-client.ts`](../src/lib/api-client.ts).

## Conventions

- **Response envelope (success):** `{ success: true, data, message? }`
- **Response envelope (error):** `{ success: false, error, code, statusCode, requestId, details? }`
- **Auth is cookie‑only.** No `Authorization: Bearer` header is accepted (matches the hardened original).
- **Roles live in separate collections** (`Patient`, `Psychiatrist`, `Admin`) — there is no single `users` table. The JWT carries `{ sub, role }` and the guard picks the right model.
- **Errors are thrown, not returned.** Handlers throw `AppError`; `withRoute` translates them.
