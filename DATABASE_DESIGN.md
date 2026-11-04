# Initial database design

## 1. Principles

- Supabase PostgreSQL is the source of truth; Supabase Auth owns credentials and sessions.
- User content is private by default and all exposed private tables use Row Level Security.
- UUID primary keys, UTC `timestamptz`, explicit check constraints, and versioned migrations are required.
- Store storage object keys, not signed URLs. Store AI provenance and usage, not hidden reasoning.
- Prefer normalized relational columns for ownership, lifecycle, ordering, and policy lookups. Use `jsonb` only for bounded, schema-versioned provider details or flexible snapshots.
- Every child relationship must preserve project ownership. Policies alone do not prevent forged cross-owner parent IDs; use composite ownership constraints or equivalent verified database functions.

The column lists below are proposed, not migration-ready SQL. M3 will turn them into tested migrations and generated TypeScript types.

## 2. Core entities

### `profiles`

- `id uuid primary key references auth.users(id) on delete cascade`
- `display_name text`, `avatar_path text`, `locale text`, `skill_level text`
- `preferences jsonb not null default '{}'`
- `created_at`, `updated_at timestamptz`

One private profile per authenticated user.

### `projects`

- `id uuid primary key`, `owner_id uuid not null references auth.users(id)`
- `title text not null`, `description text`, `item_type text`, `materials text[]`
- `damage_description text`, `intended_use text`, `skill_level text`
- `budget_minor integer`, `currency_code text`, `constraints jsonb`
- `status text` constrained to `draft | active | paused | completed | archived | deleting`
- `selected_plan_version_id uuid null` added after plan tables exist
- `created_at`, `updated_at`, `archived_at`, `deleted_at`
- `unique (owner_id, id)` to support ownership-preserving child keys

Index `(owner_id, updated_at desc)` and active lifecycle states.

### `project_assets`

- `id uuid primary key`, `project_id uuid`, `owner_id uuid`
- composite foreign key `(owner_id, project_id) -> projects(owner_id, id)`
- `purpose text` constrained to `source | progress | concept | other`
- `storage_bucket text`, `object_key text unique`
- `status text` constrained to `pending | validating | ready | rejected | deleting | deleted`
- `media_type text`, `byte_size bigint`, `width integer`, `height integer`, `sha256 text`
- `validation_version text`, `rejection_code text`, `created_at`, `validated_at`, `deleted_at`

Checks require positive size/dimensions when ready. Index `(owner_id, project_id, status)`.

## 3. AI operations and usage

### `ai_runs`

- `id uuid primary key`, `project_id uuid`, `owner_id uuid`, optional `source_asset_id uuid`
- ownership-preserving composite foreign key to `projects`
- `operation text` constrained to known operations such as `analyze`, `generate_plan`, `assistant`, `concept_image`
- `status text` constrained to the lifecycle documented in `ARCHITECTURE.md`
- `idempotency_key text`, unique per owner and operation scope
- `provider text`, `model text`, `prompt_version text`, `schema_version text`, `policy_version text`
- `request_fingerprint text`, `safety_classification text`, `safety_reasons text[]`
- `input_units bigint`, `output_units bigint`, `estimated_cost_minor bigint`, `currency_code text`
- `latency_ms integer`, `attempt_count integer`, `provider_operation_id text`
- `error_code text`, `error_detail_safe text`, `created_at`, `started_at`, `finished_at`

Do not store credentials, full prompts, image bytes, signed URLs, or hidden reasoning. Index owner/project/status and unresolved provider operations.

### `usage_reservations`

- `id uuid primary key`, `owner_id uuid`, `ai_run_id uuid unique`
- `period_start date`, `units_reserved bigint`, `status text`
- `expires_at`, `created_at`, `settled_at`

Reservation is atomic with quota evaluation. Unique constraints prevent double reservation.

### `usage_events`

- `id uuid primary key`, `owner_id uuid`, `ai_run_id uuid`
- `event_type text` constrained to `reserve | consume | release | adjust`
- `units bigint`, `metadata jsonb`, `created_at`
- unique provider settlement key where available

The event ledger supports reconciliation and audit; current allowance may be maintained by a transaction-safe database function or derived summary.

## 4. Ideas and immutable plans

### `repair_ideas`

- `id uuid primary key`, `project_id uuid`, `owner_id uuid`, `source_run_id uuid`
- `rank integer`, `title text`, `summary text`, `approach text`
- `difficulty text`, estimated time/cost ranges, `skills text[]`, `tools text[]`, `materials jsonb`
- `risks jsonb`, `safety_classification text`, `reversibility text`, `sustainability_notes text`
- `content_schema_version text`, `created_at`

Ideas are provenance-bearing snapshots and are not edited in place.

### `plan_versions`

- `id uuid primary key`, `project_id uuid`, `owner_id uuid`, optional `source_idea_id uuid`
- optional `parent_version_id uuid`
- `version_number integer not null`, `title text`, `summary text`
- `customization_snapshot jsonb`, `safety_classification text`, `status text`
- `created_by_run_id uuid null`, `created_at`
- unique `(project_id, version_number)`
- unique `(owner_id, project_id, id)` where needed for ownership-preserving children

Version allocation occurs transactionally and retries unique conflicts. Published versions are immutable.

### `plan_steps`

- `id uuid primary key`, `plan_version_id uuid`, `project_id uuid`, `owner_id uuid`
- ownership-preserving foreign keys to plan and project
- `position integer not null`, `title text`, `instructions text`
- `tools jsonb`, `materials jsonb`, `expected_observation text`, `stop_conditions text[]`, `risks jsonb`
- `estimated_minutes integer`, `created_at`
- unique `(plan_version_id, position)`

Steps are immutable with their plan version.

### `step_progress`

- `id uuid primary key`, `owner_id uuid`, `project_id uuid`, `plan_version_id uuid`, `plan_step_id uuid`
- `status text` constrained to `not_started | in_progress | blocked | skipped | completed`
- `notes text`, `started_at`, `completed_at`, `updated_at`
- unique `(owner_id, plan_version_id, plan_step_id)`

Constraints verify that the step belongs to the specified plan version and project.

### `saved_ideas`

- `id uuid primary key`, `owner_id uuid`, `project_id uuid`
- exactly one of `repair_idea_id` or `plan_version_id` is set
- `created_at`
- uniqueness prevents duplicate bookmarks

## 5. Assistant and feedback

### `assistant_threads`

- `id uuid primary key`, `owner_id uuid`, `project_id uuid`, optional `plan_version_id uuid`
- `title text`, `status text`, `created_at`, `updated_at`

### `assistant_messages`

- `id uuid primary key`, `thread_id uuid`, `owner_id uuid`, `project_id uuid`
- `role text` constrained to `user | assistant | system_notice`
- `content text`, optional `ai_run_id uuid`, `safety_classification text`
- `created_at`, `redacted_at`

Retention and maximum context windows are explicit. Messages do not contain provider hidden reasoning.

### `feedback`

- `id uuid primary key`, `owner_id uuid`, `project_id uuid`
- optional `ai_run_id`, `repair_idea_id`, `plan_version_id`
- `rating smallint` checked from 1 to 5, `outcome text`, `comment text`
- `created_at`, `updated_at`

A check requires at least one exact subject reference. Policy prevents referencing another user's subject.

### `deletion_jobs`

- `id uuid primary key`, `owner_id uuid`, optional `project_id uuid`
- `scope text`, `status text`, `attempt_count integer`, `next_attempt_at timestamptz`
- `last_error_code text`, `created_at`, `completed_at`

Tracks retryable cleanup of private storage and pending operations after database state enters deleting.

## 6. Row Level Security policy model

Enable RLS and revoke broad grants before exposing tables through Supabase APIs.

- `profiles`: `auth.uid() = id` for private CRUD.
- `projects`: `auth.uid() = owner_id` for each operation; inserts and updates include `WITH CHECK`.
- Child tables: `auth.uid() = owner_id` plus an ownership-preserving parent relationship. Inserts/updates verify the parent project and all referenced subject rows share that owner/project.
- Usage tables and deletion jobs: read access is limited to safe user-visible fields or routed through narrow functions; direct writes are server-controlled.
- Anonymous users receive no access to private application tables.

Every policy is tested for SELECT, INSERT, UPDATE, and DELETE with two users. Tests include forged owner IDs, valid owner plus foreign project IDs, foreign nested references, archived/deleting projects, and direct REST/database access.

### Write-authority matrix

Ownership does not imply permission to set every column. Use table grants, column privileges, RLS, triggers, and narrowly scoped database functions/RPCs so authenticated clients can write only user-authored fields.

| Data area | Authenticated-client writes | Server-controlled writes |
|---|---|---|
| `profiles`, `projects` | User-editable profile/project fields and allowed lifecycle actions | Ownership, deletion coordination, and administrative timestamps |
| `project_assets` | Create a pending upload request and user captions where supported | Object key allocation, validation status, checksum/version, media metadata, rejection reason, ready/deleting/deleted transitions |
| `ai_runs` | Request/cancel through a narrow service operation only | Status, provider/model, prompt/schema/policy versions, safety outcome, usage, latency, attempts, provider IDs, and errors |
| `repair_ideas`, `plan_versions`, `plan_steps` | Select/bookmark or submit customization input through services | Generated provenance-bearing records, immutable versions, ordering, safety fields, and publication state |
| `step_progress`, `saved_ideas`, `feedback` | Own progress, notes, bookmarks, ratings, and comments subject to ownership checks | Moderation/deletion fields and derived metadata |
| `assistant_threads`, `assistant_messages` | Own thread actions and messages with role `user` only | Messages with role `assistant` or `system_notice`, AI-run link, safety classification, retention/redaction state |
| `usage_reservations`, `usage_events`, `deletion_jobs` | No direct writes | All writes through authorized server workflows or narrow verified functions |

Tests attempt to forge asset `ready` state and checksum, AI provider/model/policy/safety/usage fields, immutable idea/plan contents, foreign or duplicate version numbers, and assistant/system message roles. They also verify that user-writable columns remain usable without granting server-authored fields.

Security-definer functions are exceptional. They set a fixed `search_path`, validate `auth.uid()`, expose the smallest operation possible, and receive dedicated tests.

## 7. Storage design

Use a private bucket, initially named `project-assets`, with an object key like:

```text
{owner_id}/{project_id}/{asset_id}/{sanitized_variant_name}
```

Storage policies parse and validate the path and verify project/asset ownership. Upload authorization uses a short-lived target for a pending asset; after finalization, clients cannot overwrite that key. Replacements receive a new asset ID/key and repeat validation. AI runs snapshot the validated checksum/version used for analysis. Read access uses short-lived signed URLs only after authorization. Original filenames are metadata for display after sanitization and are not trusted as object paths.

Deletion is an application workflow: mark records deleting, block new use, remove objects, reconcile failures through `deletion_jobs`, then finalize database deletion. Orphan detection runs before launch and periodically afterward.

## 8. Migration and test rules

- Each schema change is a forward migration with matching policy/constraint tests.
- Generate TypeScript database types after migrations and fail CI on unexpected drift.
- Use local Supabase for migration, RLS, function, and storage-policy testing.
- Seed only synthetic, non-sensitive fixtures.
- Production migrations require backup/rollback review and explicit deployment permission.

## 9. Open database decisions

- Exact quota units and period rules
- Retention periods for source images, conversations, logs, and deletion audit records
- Whether projects require soft deletion before irreversible purge
- Durable job mechanism and claim/lease columns if asynchronous execution is selected
- Data export schema and regional storage requirements
