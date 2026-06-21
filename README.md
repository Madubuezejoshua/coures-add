# DocReview

A document review & publishing platform — **Vite + React** frontend and a
**Node/Express + Neon Postgres** API. Roles: admin, editor, reviewer, publisher,
reader. Workflow: editor submits → reviewer reviews → editor pays the publication
fee → publisher publishes → readers browse & purchase.

## Quick start
```bash
npm install
cp .env.example .env          # then fill in DATABASE_URL + JWT_SECRET
npm run db:reset              # create the database schema in Neon
npm run seed:admin -- admin@example.com "a-strong-password" "Site Admin"
npm start                     # runs the API (:5050) and the frontend (:5173) together
```

Or run the two processes separately: `npm run server` and `npm run dev`.

See **[SETUP.md](SETUP.md)** for full configuration, the API surface, and notes on
the optional integrations (Cloudflare R2, Paystack, SendGrid — mocked until you add
real keys).

## Scripts
| Script | Purpose |
| --- | --- |
| `npm start` | Run API + frontend together |
| `npm run dev` | Frontend only (Vite) |
| `npm run server` | API only (Express) |
| `npm run db:reset` / `db:migrate` | Create/refresh the Postgres schema |
| `npm run seed:admin -- <email> <pw> <name>` | Create an admin (can't self-register) |
| `npm run build` / `typecheck` / `lint` | Production build / typecheck / lint |
