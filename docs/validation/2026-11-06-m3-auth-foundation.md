# M3 Supabase authentication and authorization validation

Date: November 6, 2026

## Outcome

M3 delivers a disposable local Supabase environment, a forward-only application migration, generated TypeScript database types, explicit table/column grants, Row Level Security, email-confirmed authentication, PKCE password recovery, protected private routes, profile settings, versioned account export, and a retryable account-deletion coordinator. The public fixture dashboard moved to `/demo`; `/dashboard` now renders only records authorized for a freshly verified user.

No hosted Supabase project, storage bucket, AI provider, deployment, or billable resource was created.

## Implemented security boundary

- `profiles`, `projects`, and `deletion_jobs` are created by `202611050001_m3_auth_foundation.sql`.
- Anonymous roles receive no private-table grants.
- Authenticated roles receive only explicit column privileges; lifecycle, ownership, and server-authored columns cannot be forged.
- RLS isolates profile and project reads/writes by `auth.uid()`.
- Project writes derive the owner and lock an active profile row so deletion and writes serialize at the database boundary.
- The security-definer deletion RPC fixes its `search_path`, derives the caller from `auth.uid()`, creates one idempotent deletion job, and marks the profile deleting.
- The secret-key client is isolated in a `server-only` module and is used only for terminal Auth deletion.
- Protected pages call `getUser()` for fresh identity verification. The proxy uses signed claims for the broad route check and a fresh user lookup before redirecting away from sign-in, preventing stale-token redirect loops after deletion.
- Supabase session-refresh cookies retain the library-supplied private/no-store response headers, including on public routes.
- Password recovery carries a short-lived signed intent through the PKCE callback, which issues an HttpOnly proof bound to the verified user. Both the page and action require that proof, so a normal authenticated session cannot rotate a password through the recovery UI.
- The recovery proof is an application-level authorization boundary for this app's page and Server Action; it does not change Supabase Auth's direct API password policy.
- Internal redirects validate both the original and normalized path; external, protocol-relative, backslash, and dot-segment normalization bypasses fall back safely.

## Verified account behavior

- Registration requires a Mailpit confirmation link before the private dashboard is available.
- Used confirmation and recovery links do not authenticate a second browser.
- Sign in, sign out, password reset, password update, and replacement-password sign in work locally.
- Recovery requests return the same response for account and non-account addresses.
- Export returns a no-store, attachment-delivered, versioned JSON document with the authorized profile and every owned project page. Pagination orders by creation time and unique ID.
- Account deletion requires the current password and the literal `DELETE` confirmation.
- Deletion first marks the account, blocks new writes, removes application data, records retryable failure state when needed, and removes the Auth identity last.
- A browser holding pre-deletion cookies can no longer enter a private route and does not enter a redirect loop.

## Verification commands

The final M3 source state is validated with:

```text
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run db:reset
npm run test:db
npm run test:integration
npm run test:e2e
npm run test:e2e:auth
npm audit --audit-level=moderate
```

Observed targeted results during implementation:

- pgTAP database policy suite: 21 assertions passed.
- Local two-user Supabase integration: 3 tests passed.
- Vitest unit/component suite: 24 tests passed across 9 files.
- Public Playwright suite: 10 tests passed across desktop Chromium and a Pixel 7 profile.
- Auth Playwright lifecycle: 1 complete account journey passed.

## Review and visual verification

The required security and architecture reviews identified and drove fixes for a normalized-path open redirect, discarded Supabase refresh cache headers, non-unique export pagination, and password changes authorized by an ordinary session. Regression tests cover each corrected boundary. Remaining follow-ups are limited to M4 storage cleanup/job-claim design and stronger controlled-race/failure-retry fixtures.

The in-app browser controller could not initialize in this Windows session. Full-page Playwright captures of the landing page, public demo, and mobile sign-in page were inspected instead; hierarchy, fixture disclosure, responsive stacking, focusable controls, clipping, and horizontal overflow were clean. The production Playwright suite separately passed axe accessibility and overflow checks.

## M4 boundary

Project creation remains disabled in the UI even though the ownership primitive exists. M4 owns project CRUD forms, private Storage buckets and policies, asset validation, signed reads, quota/cleanup behavior, and extension of export/deletion to asset metadata and objects. Hosted environment creation, migration deployment, and secret configuration still require explicit project-owner approval.
