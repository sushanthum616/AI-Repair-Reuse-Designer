# AI Repair & Reuse Designer

AI Repair & Reuse Designer is a planned full-stack application that helps people evaluate damaged everyday items, compare practical and creative repair ideas, customize a preferred approach, and track progress. Its product principle is **AI suggests. You decide.**

## Current status

M2 is complete. The repository now contains an executable Next.js application foundation with a responsive marketing experience, a clearly labeled public dashboard demo, a non-submitting authentication preview, reusable UI primitives, and automated unit, component, accessibility, responsive, and production-build checks.

The next implementation task is M3: add local Supabase database, authentication, authorization, and account-lifecycle foundations. No Supabase project, AI provider, live upload path, or deployment resource exists yet.

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
- [University work area](docs/university/README.md)

## Local setup

Use WSL2 Ubuntu. The repository pins Node.js 24.15.0, npm 11.12.1, and Next.js 16.4.5.

```bash
nvm install
nvm use
npm ci
npm run dev
```

Before the first browser-test run in a fresh WSL installation, install Chromium and its Linux dependencies:

```bash
npx playwright install chromium
sudo npx playwright install-deps chromium
```

Open `http://localhost:3000`. Available routes are:

- `/` — responsive marketing and product-principle overview;
- `/dashboard` — public product preview using deterministic fixture projects;
- `/sign-in` — disabled authentication preview that does not send or store credentials.

Useful verification commands:

```bash
npm run check
npm run test:e2e
npm audit --audit-level=moderate
```

Environment variable names are documented in `.env.example`; do not place credentials in committed files. M2 requires no secrets.

## Safety and privacy

Private projects and images must be isolated with Row Level Security and private storage policies. AI output is untrusted until validated and screened. The application must refuse procedural guidance for high-risk electrical, gas, structural, chemical, battery, pressure, and similar hazards, and must direct the user to qualified help or safe disposal where appropriate.

## Contribution rules

Read `AGENTS.md` and `DEVELOPMENT_WORKFLOW.md` before changing the repository. Do not create billable resources, push, merge, or deploy without explicit project-owner permission.
