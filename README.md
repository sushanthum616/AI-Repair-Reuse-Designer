# AI Repair & Reuse Designer

AI Repair & Reuse Designer is a planned full-stack application that helps people evaluate damaged everyday items, compare practical and creative repair ideas, customize a preferred approach, and track progress. Its product principle is **AI suggests. You decide.**

## Current status

Project initialization is complete at the documentation and Codex-configuration level. The application has not been scaffolded, no Supabase project has been created, no AI provider has been connected, and no deployment resources have been provisioned.

The next implementation task is M2: scaffold the Next.js application, establish the design system, and build the responsive application shell using static fixtures clearly labeled as fixtures.

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
- [University work area](docs/university/README.md)

## Local setup

The executable setup steps will be added in M2 when the package manager, Next.js version, linting, formatting, and test commands are pinned. Environment variable names are documented in `.env.example`; do not place credentials in committed files.

## Safety and privacy

Private projects and images must be isolated with Row Level Security and private storage policies. AI output is untrusted until validated and screened. The application must refuse procedural guidance for high-risk electrical, gas, structural, chemical, battery, pressure, and similar hazards, and must direct the user to qualified help or safe disposal where appropriate.

## Contribution rules

Read `AGENTS.md` and `DEVELOPMENT_WORKFLOW.md` before changing the repository. Do not create billable resources, push, merge, or deploy without explicit project-owner permission.
