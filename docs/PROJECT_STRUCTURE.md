# Project Structure

Every folder and the role of each file. (`★` = the most important files to read first.)

```
NeuroAssess FYP Next JS/
├── README.md                     Project intro + quick start
├── package.json                  Scripts & dependencies
├── tsconfig.json                 TypeScript config (path alias @/* → src/*)
├── next.config.mjs               Next.js config
├── tailwind.config.ts            Tailwind theme tokens
├── postcss.config.mjs            PostCSS (tailwind + autoprefixer)
├── .env.example                  All environment variables (copy to .env.local)
│
├── docs/                         ← you are here
│   ├── PROJECT_OVERVIEW.md        What it is, roles, features, roadmap
│   ├── ARCHITECTURE.md            How the app is wired
│   ├── PROJECT_STRUCTURE.md       This file
│   ├── DATA_MODEL.md              The 9 Mongoose models
│   ├── API_REFERENCE.md           Every endpoint
│   ├── AUTH_AND_SECURITY.md       Tokens, OTP, refresh rotation, rate limits
│   ├── MIGRATION_FROM_MERN.md     Express → Next.js mapping
│   └── SETUP.md                   Setup, seeding, troubleshooting, deploy
│
├── scripts/
│   └── seed-admin.ts          ★   Creates the first admin account
│
├── public/
│   └── uploads/.gitkeep          Transient upload dir (gitignored)
│
└── src/
    ├── middleware.ts         ★   Edge route guard for dashboard pages
    ├── app/                      Next.js App Router (UI + API)
    │   ├── layout.tsx        ★   Root layout, fonts, AuthProvider
    │   ├── globals.css           Tailwind layers + design tokens
    │   ├── page.tsx              Landing page (hero, features, how‑it‑works, FAQ)
    │   │
    │   ├── (auth)/               Route group — auth screens
    │   │   ├── login/page.tsx        Patient/psychiatrist login (role tabs)
    │   │   ├── register/page.tsx     Patient & psychiatrist registration
    │   │   ├── admin/login/page.tsx  Admin login
    │   │   ├── verify-otp/page.tsx   OTP entry
    │   │   ├── forgot-password/page.tsx
    │   │   └── reset-password/page.tsx
    │   │
    │   ├── patient/dashboard/page.tsx        ★ Patient dashboard shell
    │   ├── psychiatrist/dashboard/page.tsx   ★ Psychiatrist dashboard shell
    │   ├── admin/dashboard/page.tsx          ★ Admin dashboard shell
    │   │
    │   └── api/                  Route Handlers (the backend)
    │       ├── health/route.ts
    │       ├── auth/
    │       │   ├── patient/{register,login,me,verify-otp,resend-otp,
    │       │   │            forgot-password,reset-password,change-password}/route.ts
    │       │   ├── psychiatrist/{…same set…}/route.ts
    │       │   ├── admin/{login,me,verify-otp,resend-otp,
    │       │   │          forgot-password,reset-password,change-password}/route.ts
    │       │   ├── refresh/route.ts
    │       │   └── logout/route.ts
    │       ├── users/…           Psychiatrist directory + self profile updates
    │       ├── admin/…           Approvals, user lists, settings
    │       ├── appointments/…    Book, list, cancel, slots, rosters
    │       ├── tests/…           Handwriting test + reports
    │       ├── learning-plans/…  Modules + reset
    │       └── messages/…        Conversations + send + read state
    │
    ├── lib/                  ★   Domain & infrastructure (framework‑agnostic core)
    │   ├── db.ts                 Cached Mongoose connection
    │   ├── env.ts                Env access helpers
    │   ├── constants.ts          TTLs, cookie names, bcrypt cost
    │   ├── errorCodes.ts         Stable error codes
    │   ├── AppError.ts           Typed operational errors
    │   ├── tokens.ts             JWT sign/verify
    │   ├── cookies.ts            Auth cookie set/clear
    │   ├── sanitize.ts           Strip sensitive fields
    │   ├── passwordPolicy.ts     Password strength (Zod)
    │   ├── apiHandler.ts         withRoute() wrapper + ok()/error envelope
    │   ├── rateLimit.ts          In‑memory fixed‑window limiter
    │   ├── auth-guards.ts        requirePatient / Psychiatrist / Admin / either
    │   ├── auth-service.ts       Register / OTP verify / cleanup logic
    │   ├── email.ts              Nodemailer + dev console fallback
    │   ├── ai.ts                 MOCK handwriting analyzer
    │   ├── http.ts               Small helpers (read JSON / multipart)
    │   └── utils.ts              cn() classname helper
    │
    ├── models/              ★    Mongoose schemas (TypeScript)
    │   ├── Patient.ts  Psychiatrist.ts  Admin.ts  RefreshToken.ts
    │   ├── Appointment.ts  Message.ts  Report.ts  LearningPlan.ts
    │
    ├── context/
    │   └── AuthContext.tsx   ★   Client auth state + role + login/logout
    │
    ├── services/
    │   └── auth-client.ts        Client wrapper for the auth API
    │
    ├── lib/api-client.ts         Fetch wrapper with single‑flight refresh + retry
    │
    └── components/
        ├── ui/                   Small shadcn‑style primitives
        │   ├── button.tsx  input.tsx  label.tsx  card.tsx  badge.tsx
        │   ├── textarea.tsx  select.tsx  tabs.tsx  toast.tsx  spinner.tsx
        ├── landing/              Hero, Features, HowItWorks, FAQ, Footer, Nav
        ├── dashboard/            Shared dashboard shell (sidebar + topbar)
        ├── patient/              Patient feature panels (test, plan, reports,
        │                         directory, appointments, messages, profile)
        ├── psychiatrist/         Psychiatrist feature panels (patients,
        │                         appointments, availability, messages, pending)
        └── admin/                Admin feature panels (approvals, users, settings)
```

## Reading order for a newcomer

1. [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) — understand the product.
2. [ARCHITECTURE.md](ARCHITECTURE.md) — understand the wiring.
3. `src/models/*` + [DATA_MODEL.md](DATA_MODEL.md) — understand the data.
4. `src/lib/apiHandler.ts`, `auth-guards.ts`, `tokens.ts` — understand the request spine.
5. `src/app/api/auth/**` — see the patterns in action.
6. `src/app/(auth)/**` + `src/context/AuthContext.tsx` — the client side.
