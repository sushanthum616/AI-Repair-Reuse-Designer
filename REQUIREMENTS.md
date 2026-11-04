# Software requirements

## 1. Purpose

AI Repair & Reuse Designer helps authenticated users make informed decisions about damaged everyday items. A user creates a private project, uploads photographs, receives evidence-aware repair or reuse ideas, customizes an idea, follows a versioned plan, records progress, and provides feedback.

The system supports decision-making; it does not certify an item's safety, structural integrity, repairability, or fitness for use.

## 2. Product principles

1. **AI suggests. You decide.** Users can compare, edit, save, or reject every suggestion.
2. **Safety before completion.** Uncertainty and hazardous categories trigger clarification, refusal of procedural guidance, or referral to qualified help.
3. **Privacy by default.** Accounts, projects, images, plans, conversations, and progress are private unless a later approved feature explicitly changes that.
4. **Traceable advice.** Stored results identify the provider/model, schema and prompt versions, source assets, safety classification, and creation time.
5. **Honest capability.** Fixtures and unavailable integrations are clearly labeled; mock data is never represented as live inference.

## 3. Users and primary journey

The initial release supports one role: an authenticated end user who manages only their own data. Administrative operations are server-only and narrowly scoped.

Primary journey:

Register → verify/sign in → create project → upload damaged-item image → validate image → request analysis → compare repair/reuse ideas → customize and version a plan → follow steps → save progress → ask contextual questions → provide feedback.

## 4. Functional requirements

### Identity and account

- FR-001: Users can register, sign in, sign out, recover access, and maintain a profile through Supabase Auth.
- FR-002: Protected routes and server operations require an authenticated session.
- FR-003: A user can export or delete their account data through a documented, retryable deletion workflow.
- FR-004: Account deletion blocks new work and removes database records, private storage objects, retained assistant content, and pending AI work according to the retention policy.

### Projects and assets

- FR-010: Users can create, read, update, archive, restore, and delete their own projects.
- FR-011: A project records item description, material hints, damage description, intended use, skill level, available tools, budget, and constraints without requiring every optional field.
- FR-012: Users can upload and preview supported image formats through private storage.
- FR-013: The server verifies content type, file signature, byte size, decoded dimensions, and ownership before an asset becomes eligible for AI analysis.
- FR-014: The system removes image metadata where practical and stores object keys rather than durable signed URLs.
- FR-015: Failed or abandoned uploads are cleaned up safely and retryably.

### AI analysis and recommendations

- FR-020: A user can request real image analysis when a configured provider and valid credentials are available.
- FR-021: Analysis returns structured observations, uncertainty, detected risks, clarifying questions when needed, and several distinct repair/reuse ideas.
- FR-022: Each idea includes a summary, suitability, estimated difficulty/time/cost ranges, required skills/tools/materials, risks, reversibility, and sustainability considerations.
- FR-023: Provider responses must pass a versioned schema and safety policy before being shown or stored as usable guidance.
- FR-024: The system records run status, provider/model, prompt/schema versions, latency, token or unit usage, and a sanitized failure category.
- FR-025: Timeouts and uncertain provider outcomes remain distinguishable from confirmed failures; retries are capped and idempotent.
- FR-026: When AI is unavailable, the UI reports the dependency state and does not substitute fabricated analysis.

### Customization and plans

- FR-030: Users can compare ideas and choose one as the basis for a repair plan.
- FR-031: Users can change goals, style, budget, skill level, tools, materials, and constraints before requesting a revised plan.
- FR-032: Every accepted revision creates an immutable plan version with ordered steps and a parent-version reference.
- FR-033: Concurrent version creation cannot overwrite or duplicate version numbers.
- FR-034: Steps include required inputs, instructions, expected observation, stop conditions, risks, and optional media references.
- FR-035: Users can bookmark an exact idea or plan version.

### Progress, assistance, and feedback

- FR-040: Users can mark steps not started, in progress, blocked, skipped, or complete and add private notes.
- FR-041: Progress is attached to the exact plan version and step; remixing does not silently transfer incompatible progress.
- FR-042: Users can pause and resume projects and see repair history.
- FR-043: A project-scoped assistant can answer questions using bounded project and selected-plan context.
- FR-044: Assistant messages pass the same safety screening as generated analysis and instructions.
- FR-045: Users can submit ratings, outcome status, and optional comments linked to the exact run, idea, or plan version.
- FR-046: Optional concept images are labeled illustrative and never presented as proof of feasibility, safety, or completed work.

### Usage controls and operations

- FR-050: AI quota is reserved atomically before provider calls and settled after completion or recoverable failure.
- FR-051: Rate limits work across multiple application instances; memory-only counters are insufficient for enforcement.
- FR-052: Duplicate submissions use an idempotency key and return the existing operation when appropriate.
- FR-053: Slow work has a durable operation record. The system must not launch untracked work after an HTTP response ends.
- FR-054: Users can see useful operation states and retry eligible failures without duplicating charges or versions.

## 5. Safety requirements

- SR-001: Safety screening applies to image analysis, recommendations, customization, step generation, assistant responses, and concept-generation prompts.
- SR-002: High-risk electrical, mains-powered, gas, structural/load-bearing, chemical, battery-cell, pressure, fire-safety, medical, vehicle-safety, and unknown hazardous-material tasks cannot receive procedural DIY instructions.
- SR-003: Hidden conditions cannot be declared safe from a photograph. Material uncertainty and ambiguous damage trigger clarification or professional referral.
- SR-004: Approved guidance includes protective measures, ventilation or curing constraints where relevant, and explicit stop conditions.
- SR-005: Model-produced URLs, commands, tool instructions, and embedded image text are untrusted data. The AI provider receives no arbitrary network or execution tools.
- SR-006: Safety policy decisions are versioned and auditable without retaining hidden model reasoning.

## 6. Security and privacy requirements

- SEC-001: All exposed private tables have RLS enabled with explicit SELECT, INSERT, UPDATE, and DELETE policies and write `WITH CHECK` constraints.
- SEC-002: Child rows cannot be attached to a project owned by another user; ownership is enforced in database constraints or equivalent verified functions, not only in application code.
- SEC-003: Storage buckets are private. Object paths are scoped by user, project, and asset identifiers; signed access is short-lived and authorized server-side.
- SEC-004: Request-scoped authenticated Supabase clients are the default. Service-role access is isolated to explicit administrative workflows with prior authorization checks.
- SEC-005: Inputs and AI outputs use shared runtime schemas. Rich text is rendered safely; no unsanitized HTML is accepted.
- SEC-006: Logs exclude credentials, authorization headers, private image data, signed URLs, full prompts, and sensitive user content.
- SEC-007: Secrets remain server-side and are supplied through environment management, never repository files or browser variables.
- SEC-008: CSRF, open redirect, session fixation, insecure direct object reference, upload abuse, and replay risks are covered in implementation and tests.
- SEC-009: Dependency and platform security advisories are reviewed before production release.

## 7. Non-functional requirements

- NFR-001 Accessibility: Core journeys target WCAG 2.2 AA, keyboard operation, visible focus, semantic structure, readable contrast, and meaningful status announcements.
- NFR-002 Responsiveness: Core flows support phone, tablet, and desktop layouts without horizontal overflow.
- NFR-003 Performance: Page and API budgets are defined and measured in M9. Image processing and AI work must not block unrelated navigation.
- NFR-004 Reliability: Mutating operations are idempotent where retries are plausible; external failures produce actionable states.
- NFR-005 Maintainability: TypeScript strict mode, modular boundaries, generated database types, versioned migrations, and shared validation are required.
- NFR-006 Observability: Structured logs and metrics use correlation IDs and sanitized error categories. AI latency, failure, usage, and policy outcomes are measurable.
- NFR-007 Portability: Local development runs in WSL2 Ubuntu; the planned production target is Vercel plus Supabase.
- NFR-008 Cost control: No billable resources are created without approval. Usage limits and budget alerts are configured before production AI access.
- NFR-009 Data lifecycle: Retention, export, deletion, backup, and recovery procedures are documented before launch.

## 8. Validation strategy

- Unit tests cover validation, domain policy, safety classification, versioning, quota logic, and provider adapters.
- Integration tests cover Route Handlers/services, Supabase migrations, RLS, storage policies, and failure recovery.
- Two-user isolation tests attempt direct cross-user database and storage access.
- Component tests cover forms, upload states, result comparison, and accessible interaction.
- Playwright tests cover authentication, project creation, upload, analysis-state handling, versioned plans, progress, and deletion.
- Real-provider smoke tests require credentials and explicit spending authorization; deterministic tests remain the default CI path.

## 9. Out of scope for the initial release

- Public social feeds or unrestricted sharing
- Marketplace transactions or contractor booking
- Automated purchasing of materials
- Safety certification, professional inspection, warranties, or guaranteed outcomes
- Native mobile applications
- Microservices or autonomous repair-control hardware
- Model training on user content without a separate explicit consent and governance process

## 10. Open product decisions

- Supported launch regions, languages, age requirements, and legal terms
- Exact image formats, limits, retention duration, and account-export format
- AI provider and model selections after representative evaluation
- Durable execution mechanism if measured Vercel/provider limits require asynchronous processing
- Whether concept-image generation ships in the initial public release
