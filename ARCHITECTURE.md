# Initial system architecture

## 1. Architecture decision

Use a modular monolith deployed as one Next.js application, backed by Supabase. The system keeps clear module and trust boundaries while avoiding operational complexity that the current scale does not justify.

This document is an initial design. M2 and M3 will validate framework and Supabase details against pinned versions before implementation contracts are finalized.

## 2. Context and trust boundaries

```text
User browser
  │ authenticated HTTPS
  ▼
Next.js application on Vercel
  ├─ App Router UI and Server Components
  ├─ thin Route Handlers / Server Actions
  ├─ application services and domain policy
  ├─ request-scoped Supabase client ──► Supabase Auth/Postgres/RLS
  ├─ private storage gateway ─────────► Supabase Storage policies
  └─ AI orchestration ────────────────► configured vision/text/image provider
```

Untrusted inputs cross every external boundary: browser requests, uploaded bytes and embedded image text, database content, provider output, and assistant messages. Runtime schemas and authorization checks apply at entry points; Row Level Security and storage policies provide defense in depth.

## 3. Planned repository structure

```text
app/
  (marketing)/                 public landing content
  (auth)/                      sign-in, registration, recovery
  (app)/                       authenticated application routes
  api/                         thin Route Handlers for client-driven operations
components/
  ui/                          shadcn/ui primitives
  shared/                      cross-feature presentation components
features/
  projects/                    project UI, state, and feature contracts
  assets/                      upload and preview UI
  analysis/                    analysis and suggestion UI
  plans/                       customization, versions, and steps
  progress/                    step progress and history
  assistant/                   project-scoped conversation UI
  feedback/                    feedback UI
server/
  auth/                        session and authorization helpers
  services/                    application use cases and transactions
  repositories/               typed persistence interfaces and Supabase adapters
  storage/                     upload validation and private-object operations
  ai/                          provider ports, adapters, prompts, schemas, safety
  usage/                       quota reservation, settlement, and rate limits
  observability/               structured logs, metrics, correlation IDs
contracts/                     shared DTO and runtime-validation schemas
lib/                           environment parsing and framework-neutral helpers
supabase/
  migrations/                  versioned SQL schema and policy changes
  tests/                       RLS, policy, constraint, and function tests
tests/
  integration/                 server and provider-contract integration tests
  e2e/                         Playwright journeys
docs/
  decisions/                   architecture decision records
  university/                  assignment-only material and evidence
```

Code imported by browser bundles must not import `server/`, privileged environment variables, service-role clients, or AI SDK credentials. Enforce this with server-only markers, lint rules, and focused tests where practical.

## 4. Request and use-case flow

1. A Server Component, Server Action, or Route Handler obtains the authenticated user through a request-scoped Supabase client.
2. The boundary validates identifiers and payloads with a shared schema.
3. An application service performs the use case. UI code never owns authorization or transaction rules.
4. Repositories use the authenticated client so RLS remains active. A privileged client is allowed only inside a named administrative module with explicit authorization and audit logging.
5. The service returns a typed result with safe error categories. Boundaries translate this result to navigation, UI state, or an HTTP response.

Server Components may call application services directly. They should not make internal HTTP requests to the same application merely to reuse logic.

## 5. Authentication and authorization

Supabase Auth provides identity and session management. Middleware may refresh sessions and protect broad route groups, but each data operation independently verifies the authenticated user.

Authorization layers:

- Database RLS is the primary row-privacy boundary.
- Storage policies protect private objects by owner/project/asset path.
- Services enforce business permissions, lifecycle state, quotas, and cross-entity invariants.
- UI route protection improves experience but is not a security boundary.

All child inserts must prove that their parent project belongs to the current user. Policies use `WITH CHECK`, and database constraints or verified functions prevent forged cross-owner relationships.

## 6. Upload and asset lifecycle

The initial preferred flow uses a server-authorized private upload with a pending asset record:

1. Create a pending asset record after checking project ownership and quota.
2. Authorize a short-lived upload target for a path containing owner, project, and asset IDs.
3. Upload bytes to private storage.
4. Finalize through the server: verify object existence, file signature, allowed format, byte size, decoded dimensions, and metadata.
5. Remove metadata where practical, mark the asset ready, and only then allow it into an AI request.

Finalization stores the validated checksum and object generation/etag where the provider exposes one. A ready asset's object key and bytes are immutable: authenticated clients lose upload/replace permission for that path, and replacement creates a new asset ID and object key that must pass validation again. Every AI run binds to the source asset ID and validated checksum/version so a later byte substitution cannot silently change its evidence.

Store object keys and content metadata in PostgreSQL, never durable signed URLs. Cleanup handles abandoned pending uploads and storage objects remaining after failed deletion. Database cascades alone are not sufficient for storage deletion. Storage tests attempt post-finalization overwrite, same-key replay, and analysis after a checksum mismatch.

## 7. AI subsystem

### Provider abstraction

Define framework-independent ports such as `VisionAnalyzer`, `RepairPlanGenerator`, `RepairAssistant`, and optional `ConceptImageGenerator`. Provider adapters translate these ports to vendor APIs. Provider/model selection comes from validated server configuration and can be changed without changing domain services.

### Structured and safe output

Every operation has:

- a versioned request schema and bounded context builder;
- a versioned prompt template;
- a strict response schema;
- output parsing, normalization, and safe rendering;
- hazardous-task classification before and after generation;
- recorded provider/model, schema/prompt/policy versions, latency, usage, and sanitized outcome.

The model receives no arbitrary command execution or network tools. Image text, user instructions, and previous model content are data and cannot override the application safety policy.

### Execution model

Begin with a measured synchronous flow only when provider and hosting durations fit reliable limits. Every operation first creates an `ai_runs` record and atomically reserves quota. It then calls the provider with an idempotency key and settles usage on completion.

Slow analysis or concept-image generation requires a durable execution path. The mechanism will be selected after measurements and an architecture decision; no microservice is introduced during initialization. The application must not start untracked background work after returning a response.

### Failure behavior

Use explicit states such as `queued`, `running`, `succeeded`, `failed_retryable`, `failed_terminal`, `blocked_safety`, and `cancelled`. A timeout is not proof that the provider failed, so reconciliation checks existing operations before retrying. Retries are capped and do not create duplicate ideas or plan versions.

## 8. Data and versioning model

Projects own assets, AI runs, ideas, plans, progress, conversations, and feedback. AI-generated suggestions are preserved as provenance-bearing records. User customization creates immutable plan versions and immutable ordered steps. Current selection is a pointer to a version, not an in-place mutation of history.

Version numbers use a unique constraint and transaction-safe allocation. Progress remains associated with its original version and step. A remix may offer a deliberate progress-mapping workflow later; it never silently copies incompatible completion state.

## 9. Safety architecture

Safety is a cross-cutting domain policy, not a single prompt clause. The same policy gates:

- initial image analysis;
- repair/reuse suggestions;
- customization and step generation;
- assistant answers;
- concept-image prompts and captions.

For hazardous or uncertain cases the system returns a structured refusal or referral containing the reason, safe stop condition, and appropriate professional or disposal category. A photograph cannot establish hidden electrical, gas, structural, battery, pressure, or chemical safety. Concept images are always labeled illustrative.

## 10. Observability and privacy

Structured events include a request correlation ID, operation type, status, latency, retry count, provider/model identifiers, policy version, safety outcome, and usage totals. Logs must exclude credentials, authorization headers, image bytes, private signed URLs, full prompts, and sensitive free text.

Operational metrics track API errors, AI latency/failure/usage, quota outcomes, upload validation failures, deletion backlog, and safety blocks. Product analytics require a later consent and privacy decision.

## 11. Testing architecture

- Unit: contracts, domain policy, safety classification, quota accounting, versioning, and provider adapters.
- Database: migrations, constraints, all CRUD RLS policies, storage policies, and two-user isolation.
- Integration: services against local Supabase; provider adapters against deterministic fakes or recorded schemas.
- Component: accessible forms, upload states, comparison, plan steps, and error recovery.
- End-to-end: authenticated journeys, direct access attempts, upload/analysis states, progress, and deletion.
- Real-provider smoke: manual or protected CI only after credentials and spending approval.

## 12. Deployment topology and environments

Use separate local, preview/staging, and production environments. Supabase projects, storage, credentials, OAuth callbacks, and AI keys are isolated by environment. Database changes run as versioned migrations. Production setup includes backups, recovery verification, quotas, cost alerts, monitoring, rollback, and deletion-worker health before launch.

No Vercel, Supabase, AI-provider, or monitoring resource is created during initialization.

## 13. Architecture decisions still required

- ADR: package manager and pinned framework/tool versions in M2
- ADR: AI provider/model selection after evaluation in M5
- ADR: durable execution mechanism if synchronous measurements fail budgets
- ADR: retention periods, export format, and deletion service-level objective
- ADR: concept-image generation launch scope and provider
- ADR: production monitoring and error-reporting provider
