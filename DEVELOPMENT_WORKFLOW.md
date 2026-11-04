# Development workflow

## 1. Working environment

Primary development is Windows with WSL2 Ubuntu and VS Code. Run Git, Node.js, package-manager, Supabase CLI, and test commands inside Ubuntu so dependency paths and permissions match the application environment.

M2 will pin Node.js, package-manager, framework, and tool versions. Until then, do not scaffold with floating `latest` versions or add dependencies merely to reserve them.

Copy `.env.example` to an ignored local environment file only after the corresponding integration exists. Never paste credentials into issues, commits, prompts, logs, screenshots, test fixtures, or client-visible environment variables.

## 2. Task intake

For each task, the primary orchestrator:

1. Confirms milestone, user outcome, scope, acceptance criteria, and required evidence.
2. Inspects the branch and working tree and preserves existing changes.
3. Reads the relevant requirements, architecture, database, and milestone sections.
4. Uses the explorer for targeted repository discovery when it saves time.
5. Requests architect review before a large architectural plan or after repeated failure suggests a wrong assumption.
6. Assigns bounded work to at most three concurrent subagents, with exclusive file ownership for writers.
7. Identifies security, migration, provider-cost, and external-resource approvals before dependent work begins.

Subagents do not run Git commands or mutate GitHub. The primary orchestrator owns all repository-state decisions and integrates work.

## 3. Branch and commit policy

The repository begins on `main`. Create a task-specific branch only when the project owner authorizes Git mutation for that task. Suggested names:

- `feature/nextjs-foundation`
- `feature/supabase-auth-rls`
- `feature/secure-project-uploads`
- `feature/ai-image-analysis`
- `fix/plan-version-concurrency`

Before a commit:

- run relevant checks;
- obtain required reviews;
- inspect `git status` and the complete diff;
- stage only task-related files;
- scan for credentials, local data, images, generated artifacts, and unrelated changes.

Use conventional, outcome-focused messages such as `feat: add private project uploads` or `fix: reserve AI quota atomically`.

Do not push, open a pull request, merge, deploy, force-push, rewrite history, or delete branches without explicit project-owner authorization. When authorization is granted, report branch, commit hash/message, committed files, tests, and remote action.

## 4. Implementation rules

- Keep route handlers and Server Actions thin; application services own use cases.
- Use request-scoped authenticated Supabase clients for ordinary operations so RLS remains active.
- Validate external inputs and model outputs with shared runtime schemas.
- Add a migration, ownership constraints, RLS policies, and policy tests together.
- Use private storage and store object keys rather than signed URLs.
- Require idempotency and an operation record before external provider calls.
- Reserve usage atomically before billable AI work and reconcile uncertain outcomes.
- Apply hazardous-repair policy at every AI entry point.
- Update public contracts and documentation in the same task that changes them.

## 5. Testing expectations

M2 will define exact scripts. The intended verification ladder is:

1. Formatting and static analysis: formatter, lint, strict TypeScript, environment/schema validation.
2. Unit/component tests: Vitest and React Testing Library.
3. Database integration: local Supabase migrations, constraints, functions, RLS, and storage policies.
4. Service integration: authenticated services, idempotency, provider contracts, failure recovery.
5. End-to-end: Playwright core journeys and direct-access security attempts.
6. Build: production Next.js build and bundle-boundary checks.

Run the smallest meaningful set while iterating, then the milestone-required set before completion. Do not claim a check passed unless its command completed successfully in the current repository state.

Real-provider smoke tests are excluded from ordinary CI. They require configured credentials, explicit spending authorization, sanitized test assets, recorded model/version, and a cost/usage result. Deterministic fakes validate schemas and failures but are never represented as real inference.

## 6. Review gates

### Architecture review

Required before large structural changes, new infrastructure/provider choices, changes to the data ownership model, adoption of durable job infrastructure, and substantial milestone completion.

### QA and security review

Required for authentication, RLS, storage, uploads, account/project deletion, AI safety, quotas, external callbacks, and release candidates. Findings are reported by severity with file/line evidence; implementation agents fix them.

### Database change gate

Every database task includes migration reset, generated type update, CRUD policy matrix, two-user isolation, forged relationship attempts, appropriate indexes, and rollback/forward-repair notes.

### AI change gate

Every AI task includes versioned schemas/prompts/policy, structured parsing, injection resistance, safety tests, provenance/usage recording, timeout/idempotency behavior, and an honest unavailable-provider state.

## 7. External resources and approvals

Creating Supabase/Vercel/provider projects, enabling paid plans, adding payment methods, purchasing domains, running paid model calls, pushing code, opening or merging PRs, and deploying all require explicit project-owner approval.

Prepare configuration, migration, test, and deployment artifacts first where safe, then request the narrow approval needed for the external mutation. Never work around an approval boundary using personal accounts or embedded credentials.

## 8. Documentation and status reporting

On task completion report:

- outcome and user-visible behavior;
- files and contracts changed;
- migrations or environment variables added;
- tests run with results;
- review findings and resolutions;
- known limitations, costs, risks, and blockers;
- milestone status and recommended next task;
- Git/remote actions only if actually performed.

Keep `IMPLEMENTATION_PLAN.md` accurate. Mark complete only after acceptance and test evidence. University deliverables remain under `docs/university/` and must distinguish templates, drafts, observed evidence, and completed submissions.
