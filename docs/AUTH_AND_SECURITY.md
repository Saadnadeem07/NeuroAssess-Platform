# Authentication & Security

This port preserves the **hardened security model** of the original `NeuroAssess-FYP`. Authentication is **cookie‑based** (no bearer tokens), with short‑lived access tokens and rotating refresh tokens.

## Tokens

| Token | Lifetime | Storage | Purpose |
| --- | --- | --- | --- |
| **Access** | 15 min (`JWT_ACCESS_EXPIRE`) | httpOnly cookie `accessToken` | Authorises API calls |
| **Refresh** | 7 days (`JWT_REFRESH_EXPIRE`) | httpOnly cookie `refreshToken` | Mints new access tokens |

- Both are JWTs signed with **separate secrets** (`JWT_SECRET`, `JWT_REFRESH_SECRET`).
- Payload: `{ sub: <accountId>, role: "patient"|"psychiatrist"|"admin", type: "access"|"refresh", jti? }`.
- The guard verifies `type` matches — an access token can't be used as a refresh token or vice‑versa.

Implemented in [`src/lib/tokens.ts`](../src/lib/tokens.ts).

## Cookies

Set via the Next.js cookie API in [`src/lib/cookies.ts`](../src/lib/cookies.ts):

```
httpOnly: true
secure:   true in production
sameSite: "strict"
path:     "/"
maxAge:   access 15m, refresh 7d
```

`httpOnly` keeps JS from reading tokens (XSS resistance); `sameSite: strict` mitigates CSRF; `secure` enforces HTTPS in production.

## Password handling

- Hashed with **bcrypt, cost factor 12** (`BCRYPT_COST`), in each model's `pre('save')` hook.
- `password` has `select: false` — never returned by default; explicitly `.select('+password')` only when verifying.
- **Password policy** (Zod, [`src/lib/passwordPolicy.ts`](../src/lib/passwordPolicy.ts)): ≥ 8 chars, at least one uppercase, one lowercase, one digit.

## Email OTP verification

On registration the account is created **temporary** (`isTemporary: true`, `emailVerified: false`) and a 6‑digit OTP is emailed.

- The OTP is **hashed (SHA‑256)** before storage — the raw code is only ever sent by email.
- TTL: 15 minutes (`OTP_TTL_MS`).
- **Lockout:** after 5 wrong attempts (`OTP_MAX_ATTEMPTS`) the OTP locks for another TTL window.
- `verifyOTP()` returns `{ ok: true }` or `{ ok: false, reason: "expired" | "invalid" | "locked" }`, mapped to `AUTH_OTP_*` error codes.
- Unverified temporary accounts whose OTP has expired are purged by a periodic cleanup ([`src/lib/auth-service.ts`](../src/lib/auth-service.ts), invoked from a lightweight scheduler / on demand).

## Refresh‑token rotation + reuse detection

The strongest part of the model, in `POST /api/auth/refresh`:

1. Read the `refreshToken` cookie; verify it; compute its SHA‑256 hash.
2. Look up the hash in the `RefreshToken` collection.
   - **Not found** → the token was already rotated away or forged → treat as **theft**: revoke *all* of that account's refresh tokens, clear cookies, return `AUTH_REFRESH_REUSED`.
   - **Found but revoked/expired** → clear cookies, return `AUTH_TOKEN_EXPIRED`.
3. Otherwise **rotate**: mint a new access + refresh token, store the new hash, mark the old token `revokedAt` and `replacedBy = newJti`, set fresh cookies.

Only **hashes** of refresh tokens are ever stored, so a database leak doesn't expose usable tokens.

Refresh tokens are also revoked on **logout**, **password reset**, and **password change**.

## Authorization guards

[`src/lib/auth-guards.ts`](../src/lib/auth-guards.ts) provides:

- `requirePatient(req)` / `requirePsychiatrist(req)` / `requireAdmin(req)` — verify the access cookie, confirm the role matches, load and return the principal document.
- `requirePatientOrPsychiatrist(req)` — allows either role (used by messaging & the psychiatrist directory).

A psychiatrist whose `isApproved` is false is blocked at **login** (not just at the dashboard), returning `AUTH_NOT_APPROVED`.

## Edge middleware

[`middleware.ts`](../middleware.ts) is a **coarse** gate: for dashboard page routes (`/patient/**`, `/psychiatrist/**`, `/admin/**`) it checks an `accessToken` cookie exists and redirects to the relevant login page if not. It deliberately does **not** do cryptographic verification (that belongs in the handlers) — it just avoids flashing protected UI to logged‑out visitors.

## Rate limiting

[`src/lib/rateLimit.ts`](../src/lib/rateLimit.ts) is an in‑memory fixed‑window limiter keyed by client IP:

| Limiter | Window | Max | Applied to |
| --- | --- | --- | --- |
| global | 1 min | 200 | every API route |
| auth | 15 min | 10 | login / register |
| otp | 15 min | 5 | verify / resend OTP |
| passwordReset | 1 hour | 5 | forgot / reset password |

> In‑memory limiting is per‑instance. For multi‑instance production, back it with Redis / Upstash.

## Error codes

Stable, machine‑readable codes ([`src/lib/errorCodes.ts`](../src/lib/errorCodes.ts)) let the client react precisely (e.g. route to OTP on `AUTH_EMAIL_NOT_VERIFIED`, show "pending approval" on `AUTH_NOT_APPROVED`):

```
AUTH_INVALID_CREDENTIALS  AUTH_TOKEN_EXPIRED      AUTH_TOKEN_INVALID
AUTH_FORBIDDEN            AUTH_EMAIL_NOT_VERIFIED  AUTH_NOT_APPROVED
AUTH_OTP_INVALID         AUTH_OTP_EXPIRED         AUTH_OTP_LOCKED
AUTH_REFRESH_REUSED      RESOURCE_NOT_FOUND       RESOURCE_CONFLICT
VALIDATION_FAILED        RATE_LIMIT_EXCEEDED      UPLOAD_INVALID
INTERNAL_SERVER_ERROR
```

## Anti‑enumeration

`forgot-password` always responds 200 with the same message whether or not the email exists, so attackers can't discover registered emails.
