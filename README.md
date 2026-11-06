# AI Repair & Reuse Designer

AI Repair & Reuse Designer is a planned full-stack application that helps people evaluate damaged everyday items, compare practical and creative repair ideas, customize a preferred approach, and track progress. Its product principle is **AI suggests. You decide.**

## Current status

M3 is complete. The repository now contains a local Supabase schema, generated database types, tested Row Level Security, email-confirmed authentication and recovery, protected account routes, versioned data export, and a retryable deletion workflow that removes the Auth identity last. The deterministic product preview remains public at `/demo`; `/dashboard` and `/settings` are private.

The next implementation task is M4: project management and secure private image uploads. No hosted Supabase project, AI provider, live upload path, billable resource, or deployment exists yet.

## Planned stack

- Next.js App Router, React, and TypeScript
- Tailwind CSS and shadcn/ui
- Next.js Route Handlers and server-only services
- Supabase PostgreSQL, Auth, and private Storage
- Configurable vision, text, and optional image-generation providers
- Vitest, React Testing Library, and Playwright
- Vercel deployment after explicit approval

The architecture is a modular monolith. Browser code, domain policy, server use cases, persistence, storage, and AI providers have explicit boundaries while remaining in one deployable application.

## Documentation map

- [Requirements](REQUIREMENTS.md)
- [Architecture](ARCHITECTURE.md)
- [Database design](DATABASE_DESIGN.md)
- [Implementation plan](IMPLEMENTATION_PLAN.md)
- [Development workflow](DEVELOPMENT_WORKFLOW.md)
- [Agent workflow](AGENTS.md)
- [Initialization validation](docs/validation/2026-11-03-initialization.md)
- [M2 foundation validation](docs/validation/2026-11-04-m2-foundation.md)
- [M3 authentication and authorization validation](docs/validation/2026-11-06-m3-auth-foundation.md)
- [University work area](docs/university/README.md)

## Local setup

Use WSL2 Ubuntu with Docker Desktop WSL integration enabled. The repository pins Node.js 24.15.0, npm 11.12.1, Next.js 16.4.5, and the Supabase CLI as a development dependency.

```bash
nvm install
nvm use
npm ci
npm run db:start
npm run dev:local
```

`dev:local` reads the disposable local Supabase URLs and keys in memory. It does not write them to a file. Mailpit is available at `http://127.0.0.1:54324` for local confirmation and recovery emails.

Before the first browser-test run in a fresh WSL installation, install Chromium and its Linux dependencies:

```bash
npx playwright install chromium
sudo npx playwright install-deps chromium
```

Open `http://localhost:3000`. Available routes are:

- `/` — responsive marketing and product-principle overview;
- `/demo` — public product preview using deterministic fixture projects;
- `/sign-in` — sign in or create an email-confirmed private account;
- `/forgot-password` and `/update-password` — local PKCE account recovery;
- `/dashboard` — protected private project workspace;
- `/settings` — protected profile, export, and account-deletion controls.

Useful verification commands:

```bash
npm run check
npm run test:db
npm run test:integration
npm run test:e2e
npm run test:e2e:auth
npm audit --audit-level=moderate
```

Use `npm run db:reset` to rebuild the disposable local database from migrations; it deletes local development data. Environment variable names for hosted environments are documented in `.env.example`; do not place credentials in committed files. M3 creates no hosted or paid resources.

## Safety and privacy

Private projects and images must be isolated with Row Level Security and private storage policies. AI output is untrusted until validated and screened. The application must refuse procedural guidance for high-risk electrical, gas, structural, chemical, battery, pressure, and similar hazards, and must direct the user to qualified help or safe disposal where appropriate.

## Contribution rules

Read `AGENTS.md` and `DEVELOPMENT_WORKFLOW.md` before changing the repository. Do not create billable resources, push, merge, or deploy without explicit project-owner permission.
