<div align="center">

<img
  src="https://capsule-render.vercel.app/api?type=rounded&height=180&color=0:000000,50:4F46E5,100:8B5CF6&text=IdeaVault%20AI&fontSize=52&fontColor=FFFFFF&font=Inter&fontAlignY=52&animation=fadeIn"
  width="100%"
/>

<p>
  <img
    src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=500&size=18&duration=3000&pause=1000&color=A78BFA&center=true&vCenter=true&width=500&lines=Capture+Ideas.+Shape+Them.+Build+What+Matters."
    alt="Tagline"
  />
</p>

An AI-powered workspace that takes a raw idea all the way through
Problem → Audience → Solution → MVP → Roadmap → Tasks.

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/tests-42%20passing-3fb950)](#testing)

</div>

---

## Overview

Most idea tools are either a blank note-taking app or a rigid project manager. IdeaVault AI sits in between: it walks a half-formed idea through the structured thinking that turns it into something buildable, then hands off to a real roadmap and task board.

The AI copilot **proposes, never writes**. Every AI-generated suggestion — problem statements, audience definitions, MVP plans — is shown for review first. Nothing touches your data until you approve it.

---

## ✨ Features

### Idea → Project pipeline
| | |
|---|---|
| **Idea Vault** | Quick-capture, search, filter, tag, favorite, archive |
| **Project Workspace** | Problem, Audience, Solution, and Feature definition |
| **MVP Planner** | Goal, core users, success criteria, and in-scope feature selection |
| **Roadmap** | Milestones with target dates and live progress |
| **Task Board** | Kanban columns, priorities, due dates, feature/milestone links |
| **Notes** | Freeform, pinnable project notes |

### AI Copilot
- Free-tier **Google Gemini** integration behind a provider-agnostic abstraction — swapping to OpenAI or xAI is one adapter file
- Project-scoped and global chat, with persisted history
- **Approval-gated generation**: AI output is Zod-validated, shown as a proposal, and only written on explicit approval
- Per-user daily rate limiting, enforced before the provider is ever called

### Platform
- **Auth** — email/password + Google OAuth, database sessions, email verification, password reset
- **Collaboration** — invite teammates as Editor or Viewer, with role-based access enforced server-side
- **Billing** — Stripe Checkout, billing portal, and signature-verified webhooks
- **Notifications** — in-app bell, milestone completions, due-task reminders via cron
- **Global search** — ⌘K command palette across ideas, projects, tasks, and notes
- **Light / dark / system themes**, persisted per account

---

## 🚀 Explore Demo

The landing page has an **"Explore Demo — No Signup"** button that signs visitors straight into a seeded account using the exact same login flow real users get. It's a live working session in the real app, not a read-only mockup, and it comes pre-populated with a complete sample project so it's never empty on first click.

> **Note:** it's one shared account, so concurrent visitors see each other's edits. It self-resets every 6 hours in production (`app/api/cron/reset-demo/route.ts`), or on demand with `npm run db:seed`. The demo login is exempt from rate limiting and blocked from password resets, so no single visitor can lock everyone else out.

---

## 🏁 Quick Start

**Prerequisites:** Node.js 20+, a PostgreSQL database (local, or a free tier from [Neon](https://neon.tech) / [Supabase](https://supabase.com))

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
```

Fill in at minimum:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ideavault"
AUTH_SECRET="..."        # generate: openssl rand -base64 32
AI_API_KEY="..."         # free key: https://aistudio.google.com/apikey
```

```bash
# 3. Set up the database
npm run db:generate
npm run db:push
npm run db:seed

# 4. Run
npm run dev
```

Visit **http://localhost:3000**.

<details>
<summary><b>Troubleshooting:</b> "User was denied access on the database"</summary>

<br>

A PostgreSQL permissions issue, not an app bug. On **Postgres 15+**, a role that can connect still needs explicit `public` schema rights:

```sql
CREATE USER "user" WITH PASSWORD 'password';
CREATE DATABASE ideavault OWNER "user";
\c ideavault
GRANT ALL ON SCHEMA public TO "user";
```

On Homebrew installs there's often no `postgres` superuser — your macOS username is the superuser, so connect with `psql postgres` rather than `psql -U postgres`. If setup gets tedious, a hosted free-tier database sidesteps it entirely.

</details>

<details>
<summary><b>Optional environment variables</b></summary>

<br>

| Variable | Purpose |
|---|---|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google sign-in |
| `RESEND_API_KEY` / `EMAIL_FROM` | Password reset + verification emails — without these, links print to the server console |
| `STRIPE_SECRET_KEY` / `STRIPE_PRICE_ID` / `STRIPE_WEBHOOK_SECRET` | Subscription billing |
| `CRON_SECRET` | Authenticates scheduled jobs |
| `NEXT_PUBLIC_DEMO_EMAIL` / `NEXT_PUBLIC_DEMO_PASSWORD` | Explore Demo account credentials |

Every feature degrades gracefully when its key is absent — the app runs fine with just `DATABASE_URL` and `AUTH_SECRET`.

</details>

---

## 🛠 Tech Stack

| Layer | Choice |
|---|---|
| **Framework** | Next.js 15 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS, shadcn/ui, Radix primitives, Framer Motion |
| **Database** | PostgreSQL + Prisma |
| **Auth** | Auth.js (NextAuth) — credentials + Google, database sessions |
| **AI** | Google Gemini, behind a provider-agnostic adapter layer |
| **Payments** | Stripe (Checkout + Billing Portal + webhooks) |
| **Email** | Resend |
| **Testing** | Vitest |

---

## 🏗 Architecture

```
app/
  (marketing)/          public landing page
  (auth)/               login, register, password + verification flows
  (app)/                authenticated shell — dashboard, ideas, projects, ai, settings
  api/                  route handlers (thin — auth check, validate, delegate)
components/
  ui/                   shadcn primitives
  layout/  motion/      app shell, shared animation components
lib/
  auth/                 Auth.js config + session helper
  db/                   Prisma client singleton
  ai/                   provider-agnostic AI service + prompts
  services/             business logic, one file per entity
  validations/          Zod schemas, shared client + server
prisma/
  schema.prisma         full domain model
```

**Principles the codebase holds to:**

- **Route handlers stay thin.** Auth check → Zod validate → call a service → return JSON. Business logic lives in `lib/services/`, never in the route.
- **One authorization boundary.** Every mutation funnels through `canViewProject` / `canEditProject` / `isProjectOwner` in `access.service.ts`. Middleware is a UX redirect, not a security control.
- **AI never writes directly.** Generation returns a validated proposal; persistence requires explicit user approval.
- **Secrets stay server-side.** Provider keys are read only inside adapter modules, never shipped to the client.

---

## 🧪 Testing

```bash
npm run test        # run once
npm run test:watch  # watch mode
```

**42 tests** covering the highest-risk logic: validation-schema edge cases, the project access-control matrix (owner/editor/viewer × view/edit/admin), rate limiting, AI prompt construction, and the demo-account guards. Prisma-backed CRUD isn't covered — that needs a live database — so the access-control tests mock Prisma directly to isolate the permission logic.

---

## 🚢 Deployment

Configured for **Vercel**. `vercel.json` already defines the scheduled jobs.

1. Push to GitHub and import the repo in Vercel.
2. Provision Postgres (Vercel Postgres, Neon, and Supabase all have usable free tiers).
3. Add every variable from `.env.example` with production values — use **live** Stripe keys, a verified Resend sending domain, and your real domain for `NEXTAUTH_URL` / `NEXT_PUBLIC_APP_URL`.
4. Override the build command to `npm run vercel-build` — this runs `prisma migrate deploy` before building, so schema changes apply on every deploy.
5. Generate and commit an initial migration before the first deploy:
   ```bash
   npm run db:migrate   # creates prisma/migrations/
   ```
6. Deploy. Vercel Cron picks up `vercel.json` once `CRON_SECRET` is set.

**Scheduled jobs:** due-task reminders (daily) · demo account reset (every 6 hours)

---

## 📜 Commands

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | Lint |
| `npm run test` | Run the test suite |
| `npm run db:generate` | Regenerate the Prisma client |
| `npm run db:push` | Push schema without a migration (local iteration) |
| `npm run db:migrate` | Create and apply a migration |
| `npm run db:seed` | Seed / reset the demo account |
| `npm run db:studio` | Open Prisma Studio |

---

## 🔄 Continuous Integration

`.github/workflows/ci.yml` runs on every push and PR to `main`: install → generate Prisma client → typecheck → lint → test → build. Entirely against placeholder environment values — CI never touches a real database, Stripe account, or AI provider.

---

<div align="center">

Built by **[Abrar Hossain Zahin](https://abrar-hossain-zahin-portfolio.vercel.app)**

</div>
