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
