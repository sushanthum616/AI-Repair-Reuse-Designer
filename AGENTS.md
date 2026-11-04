# AI Repair & Reuse Designer agent workflow

## Mission and product principles

Build a production-oriented application that helps people repair, redesign, and reuse damaged items. Preserve the product principle: **AI suggests. You decide.** AI output is advice that the user can inspect, compare, customize, and reject.

Never present mock output as real AI inference. Never provide procedural guidance for high-risk electrical, gas, structural, chemical, battery, pressure-vessel, or similarly hazardous work. For risky items, provide a clear stop condition and recommend an appropriate qualified professional or approved disposal path.

## Architecture and scope

- Use a modular monolith with Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase PostgreSQL/Auth/Storage, and server-side AI provider adapters.
- Keep browser code, route handlers, application services, domain policy, data access, and provider integrations separated by explicit interfaces.
- Treat Supabase Row Level Security as a required authorization boundary. Server code must not rely on UI filtering for privacy.
- Keep secrets in server-only environment variables. Never expose service-role or AI provider keys to browser bundles.
- Do not introduce microservices, queues, paid infrastructure, or new external providers without project-owner approval and an architecture decision record.

## Agent team and delegation

The primary orchestrator uses `gpt-5.6-sol` with high reasoning and owns planning, integration, repository state, and final verification. Project-local specialist definitions live in `.codex/agents/`.

- `explorer`: `gpt-5.6-luna`, medium, read-only exploration.
- `architect`: `gpt-5.6-sol`, high, read-only design and review.
- `frontend_engineer`: `gpt-5.6-sol`, medium, bounded frontend implementation.
- `backend_engineer`: `gpt-5.6-sol`, medium, bounded server and Supabase implementation.
- `ai_engineer`: `gpt-5.6-sol`, high, bounded AI integration and safety implementation.
- `qa_security_reviewer`: `gpt-5.6-sol`, high, read-only quality and security review.

Use at most three concurrent subagents. Give each implementation agent explicit file ownership. Never allow two writing agents to edit the same files concurrently. The primary orchestrator resolves shared contracts and integrates all work.

Only the primary orchestrator may create or switch branches, commit, push, open or update pull requests, merge, or perform any other Git/GitHub mutation. Subagents must not run Git commands.

Use the architect before adopting a large architectural change, when a reasonable fix fails repeatedly, and before declaring a substantial milestone complete. Use the QA/security reviewer for authentication, authorization, storage, AI-safety, and release-critical changes.

## Development workflow

Before each task:

1. Inspect the branch and working tree and preserve all uncommitted work.
2. Read the relevant requirements, architecture, database design, and milestone entry.
3. Inspect current interfaces before changing them and report conflicts or duplicate work.
4. Create a descriptive feature branch only when the project owner has authorized Git mutations for the task.
5. Define acceptance criteria, tests, agent ownership, and out-of-scope work.

During implementation:

- Keep route handlers thin and put use cases in server-only services.
- Validate request bodies, path/query values, uploaded file metadata, and model outputs with shared schemas.
- Use generated Supabase types and migrations; do not edit production data manually.
- Add RLS and storage-policy tests with every schema or policy change.
- Store AI provider/model/version, prompt version, safety decision, latency, and usage metadata without storing hidden reasoning.
- Update documentation when a public contract, schema, security rule, environment variable, or milestone status changes.

Before completion:

1. Run formatting, type checking, linting, relevant unit/integration tests, and required end-to-end tests.
2. Review the diff and repository status; include only task-related files.
3. Check for secrets, unsafe logging, missing RLS, unbounded uploads, and unsafe AI guidance.
4. Obtain architect and QA/security review when the change is substantial or security-sensitive.
5. Report actual tests, limitations, migration impact, and remaining blockers. Do not claim unverified success.

## Documentation and Git boundaries

- `REQUIREMENTS.md` is the product and quality baseline.
- `ARCHITECTURE.md` defines system boundaries and decision principles.
- `DATABASE_DESIGN.md` defines the proposed schema, RLS, and storage model.
- `IMPLEMENTATION_PLAN.md` is the milestone source of truth.
- `DEVELOPMENT_WORKFLOW.md` describes local setup, change flow, testing, and review.
- University assignment material belongs only under `docs/university/`; do not invent prior work, responses, or test results.

Never commit secrets, local environment files, generated credentials, private user images, or production data. Do not create billable resources, deploy, push, merge, force-push, rewrite history, or delete branches without explicit project-owner authorization.
