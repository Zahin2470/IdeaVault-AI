# IdeaVault AI

> Capture Ideas. Shape Them. Build What Matters.

An AI-powered workspace that takes a raw idea through Problem → Audience →
Solution → MVP → Roadmap → Tasks.

This repo currently implements **Phase 1 — Foundation**:
project setup, TypeScript, Tailwind, shadcn/ui primitives, Prisma schema,
Auth.js (credentials + Google), base authenticated shell, and the
light/dark/system theme system. Everything else (Idea Vault, Project
Workspace, MVP Planner, AI Copilot, etc.) is intentionally not built yet —
see the architecture plan for the phase order.

## Tech stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS + shadcn/ui + Radix primitives
- PostgreSQL + Prisma
- Auth.js (NextAuth) — Credentials + Google, database sessions
- Zod for validation, React Hook Form for forms

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   ```

   Fill in `DATABASE_URL` (a local or hosted Postgres instance),
   `AUTH_SECRET` (generate with `openssl rand -base64 32`), and Google
   OAuth credentials if you want Google sign-in.

3. **Set up the database**

   ```bash
   npm run db:push     # or: npm run db:migrate
   npm run db:seed      # creates alex@example.com / password123
   ```

4. **Run the dev server**

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000`.

## Project structure

```
app/
  (marketing)/      public landing page
  (auth)/           login, register, password flows
  (app)/            authenticated shell — dashboard, ideas, projects, ai, settings
  api/               route handlers
components/
  ui/                shadcn primitives
  layout/            shell/nav components
lib/
  auth/              Auth.js config + session helper
  db/                Prisma client singleton
  ai/                provider-agnostic AI service (added in Phase 6)
  validations/        Zod schemas
  services/           business logic, one file per entity (added as each phase lands)
prisma/
  schema.prisma       full domain model (all phases' entities, defined up front)
  seed.ts
```

## Development commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run db:generate` | Regenerate the Prisma client |
| `npm run db:migrate` | Create/apply a migration |
| `npm run db:push` | Push schema without a migration (fast local iteration) |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed the demo user |

## Next phase

Phase 2 — Idea Vault: create/list/search/filter/favorite/archive ideas.
Do not start Phase 2 until Phase 1 runs cleanly end-to-end (register →
login → land on `/dashboard`).

## Testing

```bash
npm run test        # run once
npm run test:watch  # watch mode
```

Covers the two riskiest categories of bug: validation-schema edge cases (`lib/validations/*.test.ts`) and the project access-control logic (`lib/services/access.service.test.ts`) — every write path in the app funnels through `canViewProject`/`canEditProject`/`isProjectOwner`, so that's the highest-value thing to have pinned down with tests. Prisma-backed service functions aren't covered here since that needs a real (or test) database; the access-control tests mock the Prisma client directly to test the permission logic in isolation.

## Deployment (Vercel)

This repo is set up for Vercel specifically — `vercel.json` already configures the due-task reminder cron, and `next.config.mjs` needs no changes.

1. **Push to GitHub** and import the repo in Vercel.

2. **Provision Postgres.** Any managed Postgres works (Vercel Postgres, Neon, Supabase all have usable free tiers) — grab its connection string for `DATABASE_URL`.

3. **Set environment variables** in the Vercel project settings — everything from `.env.example`, with production values:
   - `DATABASE_URL` — your production Postgres connection string
   - `AUTH_SECRET` — `openssl rand -base64 32`
   - `NEXTAUTH_URL` / `NEXT_PUBLIC_APP_URL` — your production domain (`https://yourapp.vercel.app` or custom domain)
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — if using Google sign-in, add the production callback URL (`https://yourdomain/api/auth/callback/google`) in the Google Cloud Console
   - `AI_PROVIDER` / `AI_API_KEY` — Gemini free-tier key
   - `STRIPE_SECRET_KEY` / `STRIPE_PRICE_ID` — use **live** keys, not test, for a real deployment
   - `STRIPE_WEBHOOK_SECRET` — create a webhook endpoint in the Stripe Dashboard pointing at `https://yourdomain/api/billing/webhook`, subscribed to `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted` — Stripe gives you this secret when you create it
   - `RESEND_API_KEY` / `EMAIL_FROM` — for real password-reset/verification emails, verify your own sending domain in Resend rather than using `onboarding@resend.dev` in production
   - `CRON_SECRET` — `openssl rand -base64 32`, then Vercel's Cron feature sends this automatically once set

4. **Override the build command** in Vercel's project settings to:
   ```
   npm run vercel-build
   ```
   This runs `prisma migrate deploy` before `next build`, so schema changes apply automatically on every deploy. This is different from `db:push` (used in local dev) — production should always go through real migrations, not schema push, so changes are tracked and reversible.

   Before your first deploy, generate an actual migration locally (this repo has only used `db push` so far, so there's no migration history yet):
   ```bash
   npm run db:migrate   # creates prisma/migrations/ from the current schema
   ```
   Commit the generated `prisma/migrations/` folder — `vercel-build` needs it to run `migrate deploy`.

5. **Deploy.** Vercel Cron picks up `vercel.json` automatically once `CRON_SECRET` is set.

## Continuous Integration

`.github/workflows/ci.yml` runs on every push/PR to `main`: install → generate Prisma client → typecheck → lint → test → build. All with placeholder env values — nothing in CI touches a real database, Stripe account, or AI provider.
