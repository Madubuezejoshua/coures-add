# DocReview — Setup (Express + Neon Postgres)

DocReview is a **Vite + React** frontend with a **Node/Express + Neon Postgres** API.
Firebase has been fully removed.

## Stack
- **Frontend:** Vite + React + TypeScript + Tailwind (`src/`)
- **API:** Express (`server/`), JWT auth (bcrypt password hashing)
- **Database:** Neon Postgres (`DATABASE_URL` in `.env`)
- **Storage:** Cloudflare R2 / S3 (presigned uploads) — optional
- **Payments:** Paystack — optional (mock-completes when unconfigured)
- **Email:** SendGrid — optional (logs to console when unconfigured)

Integrations whose keys are still placeholders (R2, Paystack, SendGrid) degrade
to safe mocks so the app works end-to-end in development; add real keys to `.env`
to enable them.

## 1. Environment
Your `.env` already contains `DATABASE_URL` (Neon). Recommended to add:
```
JWT_SECRET=<a-long-random-string>     # else a dev default is used
PORT=5050                             # API port (5050 is the default)
```
Real keys (optional, to enable those features):
`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_ENDPOINT`,
`PAYSTACK_SECRET_KEY`, `SENDGRID_API_KEY`.

## 2. Install
```
npm install
```

## 3. Create the database schema
The DB may contain tables from a previous prototype. Reset to this app's schema:
```
npm run db:reset      # drops THIS app's tables + recreates them
# or, non-destructive (only creates missing tables):
npm run db:migrate
```

## 4. Create the first admin
Admins can't self-register. Create one:
```
npm run seed:admin -- admin@yourdomain.com "a-strong-password" "Site Admin"
```

## 5. Run
Two processes:
```
npm run server        # API on http://127.0.0.1:5050
npm run dev           # Vite frontend on http://localhost:5173
```
In dev, the Vite server proxies `/api/*` to the API (see `vite.config.ts`), so no
CORS setup is needed. For production set `VITE_API_URL` to the deployed API URL.

## Roles & flow
- Public sign-up at `/signup` → role cards (Editor / Reviewer / Publisher / Reader).
  New accounts are **pending** until an admin approves them.
- Workflow: editor submits → reviewer claims & decides → editor pays the
  publication fee → publisher publishes → readers browse/purchase.
- Registration numbers are sequential per role: `EDT-000001`, `REV-…`, `PUB-…`, `USR-…`.

## API surface (all under `/api`)
`auth/{register,login,me}` · `users` (admin) · `documents/*` (workflow) ·
`payments/{pay-fee,purchase,mine,all}` · `payouts/*` · `notifications` ·
`messages/{inbox,sent}` · `logs` (admin) · `uploads/presign`.
