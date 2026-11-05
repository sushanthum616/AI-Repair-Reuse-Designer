# Implementation plan

## Roadmap controls

This roadmap is the project status source of truth. A milestone is complete only when its acceptance criteria and test requirements have verified evidence. Update status, decisions, dependencies, and blockers in the same change that alters scope.

Statuses: `not started`, `in progress`, `blocked`, `complete`.

Initialization baseline: November 3, 2026. No application code, cloud resources, AI credentials, or deployment exists at this baseline.

## Milestone summary

| Milestone | Title | Primary agent | Dependencies | Status |
|---|---|---|---|---|
| M1 | Architecture, multi-agent setup, and project foundation | Main + Architect | None | Complete for initialization |
| M2 | Next.js application, design system, and responsive UI | Frontend | M1 | Complete |
| M3 | Supabase database, authentication, and authorization | Backend | M2 | Not started |
| M4 | Project management and secure image uploads | Backend + Frontend | M3 | Not started |
| M5 | Real AI image analysis and repair recommendations | AI + Backend | M4 | Not started |
| M6 | Creative remix studio and repair plan versioning | Frontend + Backend + AI | M5 | Not started |
| M7 | Repair instructions, progress tracking, and AI assistant | Backend + AI + Frontend | M6 | Not started |
| M8 | Before-and-after visualization, saved ideas, and feedback | Frontend + Backend | M7 | Not started |
| M9 | Automated testing, security hardening, and performance | QA/Security + all engineers | M2–M8 | Not started |
| M10 | Production deployment, monitoring, and documentation | Main + QA/Security | M9 and approval | Not started |

## M1 — Architecture, multi-agent setup, and project foundation

**Scope:** Capture product requirements, modular-monolith architecture, proposed data/security model, development workflow, project-local agent roles, environment variable contract, and milestone plan. Validate Codex configuration syntax and role discovery without building application features.

**Assigned agents:** Main orchestrator; Explorer for repository inspection; Architect for design review.

**Dependencies:** None.

**Deliverables:** `AGENTS.md`, `.codex/config.toml`, `.codex/agents/`, `README.md`, `REQUIREMENTS.md`, `ARCHITECTURE.md`, `DATABASE_DESIGN.md`, `IMPLEMENTATION_PLAN.md`, `DEVELOPMENT_WORKFLOW.md`, `.env.example`, `.gitignore`, and `docs/university/README.md`.

**Acceptance criteria:** Repository state is preserved; requested GPT-5.6 identifiers are confirmed in the local catalog; role files use explicit models/reasoning and a three-thread limit; installed Codex loads the project configuration and exposes every role with its resolved model and reasoning level in the generated collaboration tool schema; documentation is internally consistent; no application, billable resource, push, or deployment is created.

**Test requirements:** Codex Doctor configuration load; generated collaboration tool-schema inspection; repository file/link check; secret-pattern, whitespace, and Git-status inspection.

**Status:** Complete for initialization after validation. Application scaffolding starts in M2.

## M2 — Next.js application, design system, and responsive UI

**Scope:** Pin the package manager and supported versions; scaffold Next.js App Router with strict TypeScript; configure Tailwind, shadcn/ui, lint/format/type/test scripts; implement accessible marketing, authentication shell, dashboard shell, navigation, loading/error/empty states, and responsive design tokens. Use clearly labeled deterministic fixtures only.

**Assigned agents:** Frontend Engineer, with Architect review of structure and QA accessibility review.

**Dependencies:** M1.

**Deliverables:** Executable app foundation, component conventions, route groups, design tokens, reusable UI primitives, fixture policy, Vitest/RTL/Playwright baseline, and setup instructions.

**Acceptance criteria:** App starts in WSL; public/authenticated shells are responsive; core navigation is keyboard accessible; no fixture is described as live AI; privileged imports cannot enter browser bundles; CI-style scripts are deterministic.

**Test requirements:** Formatting, lint, typecheck, unit/component smoke tests, Playwright navigation/accessibility smoke, production build.

**Status:** Complete on November 4, 2026. The pinned Next.js foundation, responsive shells, deterministic fixture policy, import-boundary linting, reusable UI primitives, and Vitest/RTL/Playwright baselines are implemented. Formatting, lint, strict typecheck, unit/component tests, desktop/mobile accessibility and overflow checks, and the production build pass; evidence is recorded in `docs/validation/2026-11-04-m2-foundation.md`.

## M3 — Supabase database, authentication, and authorization

**Scope:** Configure local Supabase; implement initial migrations for profiles/projects and ownership primitives; integrate Auth; create request-scoped clients; add RLS and authorization helpers; generate database types; implement the account-lifecycle foundation: export endpoint/UI for profile and current project records, deleting-state mutation guard, and deletion coordinator with Auth-user removal as the terminal step.

**Assigned agents:** Backend Engineer, with Frontend auth UI work and QA/Security review.

**Dependencies:** M2.

**Deliverables:** Supabase config/migrations/tests, auth flows, protected routes, server-only environment validation, typed clients/repositories, profile/settings UI, initial account export, deletion-state guard, and deletion coordinator contract.

**Acceptance criteria:** Registration/login/logout/recovery work locally; every private table has explicit CRUD policies and server-authored columns are not directly user-writable; anonymous and cross-user access fail; service-role use is isolated; generated types match migrations; account export contains authorized baseline records; deleting accounts cannot create new work and Auth removal occurs only after required cleanup succeeds.

**Test requirements:** Migration reset; database constraints; two-user RLS matrix including forged child ownership and server-authored fields; auth integration; export authorization/content; deleting-state mutation rejection; terminal Auth-removal behavior; protected-route Playwright flows; secret and browser-bundle checks.

**Status:** Not started.

## M4 — Repair project management and secure image uploads

**Scope:** Project CRUD/lifecycle; private asset records; upload authorization, validation, preview, metadata handling, signed reads, cleanup, quota, and deletion across database/storage. Extend account export with project/asset metadata and implement account/project storage cleanup, late-upload rejection, and retryable deletion finalization.

**Assigned agents:** Backend Engineer and Frontend Engineer with exclusive file ownership; QA/Security review.

**Dependencies:** M3.

**Deliverables:** Project dashboard/forms, project detail, private upload flow, asset service/repository, storage policies, validation pipeline, account/project export metadata, cleanup/deletion jobs, late-arriving upload protection, and error recovery UI.

**Acceptance criteria:** Users manage only their projects; unsupported or oversized/malformed images are rejected; pending files cannot reach AI; finalized keys/bytes cannot be overwritten and analysis binds to their validated checksum/version; object keys are private and owner-scoped; abandoned and late-arriving uploads plus deleted project/account storage are reconciled before final deletion; export includes authorized asset metadata without exposing durable signed URLs.

**Test requirements:** CRUD/service tests; direct cross-user database/storage attempts; forged validation-state/metadata writes; signature/size/dimension validation; post-finalization overwrite, same-key replay, checksum mismatch, and late-upload tests; deletion/orphan/export tests; Playwright project/upload journeys.

**Status:** Not started.

## M5 — Real AI image analysis and repair recommendations

**Scope:** Provider-neutral AI ports; real configured vision/text adapter; structured schemas; run lifecycle/idempotency; atomic usage reservation; hazardous-task policy; analysis and comparison UI; failure and unavailable-provider states. Cancel or reconcile pending AI work during project/account deletion and prevent late results from recreating deleted data.

**Assigned agents:** AI Engineer and Backend Engineer, with Frontend result UI and QA/Security review.

**Dependencies:** M4 and approved provider credentials/spending for real smoke tests.

**Deliverables:** AI adapters, prompt/schema/policy versions, analysis service, run and usage persistence, repair ideas, safety referrals, usage controls, observability, and results UI.

**Acceptance criteria:** A real provider analyzes a validated private image when authorized; output passes schemas and safety policy; unavailable credentials produce an honest dependency state; retries do not duplicate ideas/charges; deleting projects/accounts accept no new runs, and late provider results cannot recreate data; hazardous or uncertain cases do not receive unsafe procedural instructions.

**Test requirements:** Deterministic adapter/contract tests; adversarial prompt/image-text cases; forged provenance/safety/usage writes; quota concurrency; idempotency/timeouts/reconciliation including deletion races and late results; provider-disabled tests; approved real-provider smoke with cost recorded.

**Status:** Not started.

## M6 — Creative remix studio and repair plan versioning

**Scope:** Compare ideas; customize goals/style/budget/skill/tools/materials; generate revised plans; immutable version history; ordered steps; selected-version pointer; optional preview contracts.

**Assigned agents:** Frontend Engineer, Backend Engineer, and AI Engineer, coordinated within the three-agent cap.

**Dependencies:** M5.

**Deliverables:** Remix studio, customization schemas, plan/version services and tables, version history/diff UI, plan selection, and safe revision generation.

**Acceptance criteria:** Users can produce and revisit immutable versions; provenance is retained; concurrent saves create unique ordered versions; edits never overwrite history; safety screening reruns after customization.

**Test requirements:** Version allocation concurrency; immutability/ownership constraints; customization validation; AI schema/safety tests; accessible comparison and version-history component/E2E tests.

**Status:** Not started.

## M7 — Repair instructions, progress tracking, and AI assistant

**Scope:** Detailed safe steps, stop conditions, progress and notes bound to plan versions, repair history, project-scoped assistant, bounded context/retention, and assistant usage/safety controls. Extend account export and deletion to progress, plan history, and retained assistant content.

**Assigned agents:** Backend Engineer, AI Engineer, and Frontend Engineer.

**Dependencies:** M6.

**Deliverables:** Instruction views, progress service/UI, assistant threads/messages, context builder, assistant adapter, retention controls, and lifecycle/history views.

**Acceptance criteria:** Progress remains attached to its original version; invalid cross-version steps are rejected; assistant sees only authorized bounded context; authenticated clients cannot forge assistant/system message roles or safety fields; every answer passes safety policy; export contains authorized progress/plan/conversation content; deletion removes or redacts retained conversation as designed.

**Test requirements:** Progress invariants and two-user isolation; version remix behavior; assistant injection/adversarial safety tests; rate/quota tests; retention/deletion tests; end-to-end resume and assistant journeys.

**Status:** Not started.

## M8 — Before-and-after visualization, saved ideas, and feedback

**Scope:** Source/progress comparison, optional AI concept images, bookmarks, outcome photos, and feedback linked to exact artifacts.

**Assigned agents:** Frontend Engineer and Backend Engineer; AI Engineer only if concept generation is approved.

**Dependencies:** M7 and separate approval for billable concept-image generation.

**Deliverables:** Comparison UI, concept generation adapter/workflow if approved, exact-version bookmarks, outcome assets, and feedback forms/reporting data.

**Acceptance criteria:** Original, progress, and generated images have clear provenance; concept images are labeled illustrative; private assets remain isolated; saved items point to immutable subjects; feedback cannot reference another user's content.

**Test requirements:** Storage/RLS isolation; provenance/label component tests; bookmarks/feedback constraints; concept provider contract and safety tests if enabled; responsive visual-regression coverage where stable.

**Status:** Not started.

## M9 — Automated testing, security hardening, and performance

**Scope:** Consolidate full test matrix; threat model; accessibility audit; dependency/config review; abuse controls; recovery/concurrency testing; performance budgets and optimization; deletion/export verification.

**Assigned agents:** QA & Security Reviewer leads findings; implementation agents own fixes; Architect reviews systemic changes.

**Dependencies:** M2–M8 feature completion.

**Deliverables:** Threat model, traceable requirements-test matrix, hardened policies/configuration, performance report, accessibility evidence, recovery runbook, and release-candidate checklist.

**Acceptance criteria:** No unresolved critical/high security findings; all private tables/storage pass isolation tests; core WCAG 2.2 AA checks pass; budgets are measured and accepted; quota, deletion, timeout, and recovery paths are verified; test suite is stable.

**Test requirements:** Full unit/integration/E2E suite; adversarial authorization/upload/AI tests; dependency scan; production build; load/concurrency tests within approved limits; backup/recovery rehearsal where available.

**Status:** Not started.

## M10 — Production deployment, monitoring, and documentation

**Scope:** Provision approved production/staging resources; configure environments, domains, callbacks, migrations, monitoring, alerts, backups, budgets, retention/deletion operations, rollback, legal/support content, and handoff documentation.

**Assigned agents:** Main Orchestrator with QA/Security and Architect release reviews.

**Dependencies:** M9 complete; explicit approval for resource creation, production credentials, data region, spending, and deployment.

**Deliverables:** Staging and production deployments, runbooks, monitoring/alerts, cost controls, backup/recovery evidence, release notes, support/privacy documentation, and rollback plan.

**Acceptance criteria:** Staging acceptance passes; production config contains no development secrets/URLs; migrations and rollback are rehearsed; monitoring and budget alerts fire in controlled tests; privacy/safety/account deletion work end-to-end; owner explicitly approves launch.

**Test requirements:** Staging full suite and smoke; production-safe post-deploy smoke; monitoring/alert test; backup and restore check; rollback rehearsal; final security, accessibility, and architecture sign-off.

**Status:** Not started.

## Current blockers and decisions needed later

- The project owner must choose/approve Supabase, Vercel, AI, and monitoring accounts before any billable or external resource is created.
- Launch region, retention, legal terms, age requirements, and supported languages are undecided.
- AI provider/model selection requires representative evaluation; initialization confirms availability only.
- A durable execution mechanism is deferred until M5 measurements establish that synchronous execution is insufficient.
