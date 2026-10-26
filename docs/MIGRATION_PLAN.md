# Phase 1: Migration Plan

## Scope and constraints

- Product behavior stays the same: a student offers a ride booked in another app, other students request to join, the offerer accepts/rejects, and ride participants use the existing chat.
- Every existing protected feature remains authenticated. Offering/joining are user activities, not separate account roles. No admin role or driver/rider role plugin is planned.
- Authentication remains Google OAuth only. No password sign-up or password migration is planned; the existing app has no password hashes.
- The target structure reference supplied in the revised task is the architecture in `README.md`. It is the only available reference and describes almost exactly the current folder structure. There is no additional external reference.
- No route or response contract should change without approval. Preserve the current ride/request/chat API paths and client behavior during this work.
- The current working branch is `refactor/architecture-and-auth`. Existing uncommitted changes must remain untouched; the backend `.env.example` is currently deleted in the working tree and is not part of this plan's changes.

## Current vs. target structure

| Current | Target convention from README |
|---|---|
| `ride_backend/index.ts` | `ride_backend/index.ts` — server/bootstrap entry point (README calls this `server.ts`; preserve the actual established entry point unless separately approved) |
| `ride_backend/src/app.ts` | `ride_backend/src/app.ts` — Express setup and middleware pipeline |
| `ride_backend/src/config/` | `ride_backend/src/config/` — environment, logger, Prisma, Socket.IO |
| `ride_backend/src/routes/` | `ride_backend/src/routes/` — modular route registries |
| `ride_backend/src/controllers/` | `ride_backend/src/controllers/` — HTTP handlers |
| `ride_backend/src/services/` | `ride_backend/src/services/` — business logic and database queries (current README convention) |
| `ride_backend/src/middleware/` | `ride_backend/src/middleware/` — auth and error handling |
| `ride_backend/src/validation/` | `ride_backend/src/validation/` — Zod schemas |
| `ride_backend/src/utils/` | `ride_backend/src/utils/` — shared helpers |
| `ride_backend/prisma/` | `ride_backend/prisma/` — Prisma schema and migrations |
| `ride_backend/test/` | `ride_backend/test/` — Jest tests |
| `ride_frontend/src/api/`, `services/`, `hooks/`, `components/`, `pages/`, `types/`, `context/` | Keep the existing frontend separation. Add Better Auth client under `ride_frontend/src/lib/` (or the established API client location if implementation review finds a closer fit). |

The repo already follows the README's routes → controllers → services separation. Its services also contain Prisma access, as the README explicitly permits. Since the reference has no repository layer, Phase 3 will not add one or move files solely to create churn. Any narrowly scoped structural cleanup must preserve behavior and be listed separately before implementation. The README's claimed `server.ts` differs from the actual `index.ts`; entry-point renaming is not needed for the target conventions and is excluded.

### Target tree

```text
.
├── docs/
│   ├── AUDIT.md
│   └── MIGRATION_PLAN.md
├── ride_backend/
│   ├── index.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── app.ts
│   │   ├── chat.ts
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validation/
│   └── test/
└── ride_frontend/
    └── src/
        ├── api/
        ├── components/
        ├── context/
        ├── hooks/
        ├── lib/                 # Better Auth browser client
        ├── pages/
        ├── services/
        └── types/
```

## File-by-file mapping

Paths remain in place to match the README convention and keep Phase 3 behavior-neutral. Auth-related files are listed with their planned Phase 4 disposition.

| Existing path | Target path / disposition |
|---|---|
| `ride_backend/index.ts` | `ride_backend/index.ts` — keep bootstrap; replace old session cleanup hookup after Better Auth is active |
| `ride_backend/src/app.ts` | `ride_backend/src/app.ts` — retain middleware pipeline; mount Better Auth handler before JSON parsing; retain app routes |
| `ride_backend/src/config/env.ts` | `ride_backend/src/config/env.ts` — retain and add Better Auth secret/base URL validation in Phase 2/4 |
| `ride_backend/src/config/logger.ts` | Same — keep |
| `ride_backend/src/config/prisma.ts` | Same — keep the shared Prisma client and PostgreSQL adapter |
| `ride_backend/src/config/prismaStore.ts` | Same temporarily; remove only after HTTP and Socket.IO auth no longer depend on Express sessions |
| `ride_backend/src/config/socket-config.ts` | Same — replace Express session sharing with Better Auth session lookup after integration |
| `ride_backend/src/middleware/authMiddleware.ts` | Same path during transition; replace implementation with Better Auth session resolution, then remove legacy-only helpers after verification |
| `ride_backend/src/middleware/errorMiddleware.ts` | Same — retain centralized error path |
| `ride_backend/src/controllers/loginController.ts` | Keep during transition; remove after Better Auth Google sign-in and logout/status client flows pass |
| `ride_backend/src/routes/loginRoutes.ts` | Keep during transition; replace/remove legacy OAuth endpoints after frontend cutover |
| `ride_backend/src/routes/index.ts` | Same — retain API registry |
| `ride_backend/src/routes/rideRoutes.ts` | Same — preserve routes and behavior |
| `ride_backend/src/routes/requestRoutes.ts` | Same — preserve routes and behavior |
| `ride_backend/src/routes/chatRoutes.ts` | Same — preserve routes and behavior |
| `ride_backend/src/routes/userRoutes.ts` | Same — preserve routes and behavior |
| `ride_backend/src/routes/supportRoutes.ts` | Same — public support remains public unless existing product policy says otherwise |
| `ride_backend/src/controllers/*.ts` except login controller | Same — retain the existing HTTP/controller boundary |
| `ride_backend/src/services/*.ts` | Same — preserve Prisma transactions and ownership rules |
| `ride_backend/src/validation/rideSchemas.ts` | Same — retain Zod validation |
| `ride_backend/src/utils/*` | Same — retain shared utilities |
| `ride_backend/prisma/schema.prisma` | Same — extend the existing user model and add Better Auth account/session/verification models; preserve ride/request/chat foreign keys |
| `ride_backend/test/*.ts` | Same — extend with smoke/integration coverage |
| `ride_frontend/src/main.tsx`, `App.tsx` | Same — retain app routing and provider placement |
| `ride_frontend/src/components/AuthProvider.tsx` | Same during transition; then adapt to Better Auth `useSession` and remove only when replacement is verified |
| `ride_frontend/src/context/AuthContext.ts` | Same during transition; remove if no longer used after cutover |
| `ride_frontend/src/hooks/useAuth.ts` | Same during transition; adapt to Better Auth session client or remove if redundant |
| `ride_frontend/src/api/authApi.ts`, `src/services/authService.ts` | Same during transition; replace old status/logout/Google redirect calls with Better Auth client actions |
| `ride_frontend/src/api/axiosInstance.ts` | Same — retain credentialed API requests and align cookie/origin settings |
| `ride_frontend/src/pages/SignIn.tsx` | Same — retain sign-in UI and route users through Better Auth Google sign-in |
| `ride_frontend/src/components/ProtectedRoute.tsx` | Same — keep route guard based on Better Auth session state |
| `ride_frontend/src/lib/authClient.ts` | New — Better Auth React client |
| Other frontend API, service, hook, component, page, and type files | Same — no expected behavior or path changes |
| `README.md` | Same — update only in Phase 5 after implementation and exact environment variables are known |
| `ride_backend/.env.example` | Restore/update as part of Phase 5 only after inspecting the user's existing deletion and confirming desired env conventions; never replace a user change silently |
| `ride_frontend/.env.example` | Same — retain and update only if needed |

## Better Auth integration design

### Version and docs consulted

- npm package page reports `better-auth` version **1.7.13** as the latest published version at plan time. Better Auth is not currently installed in this repository. Recheck version and docs immediately before implementation because this package changes frequently.
- The root docs page was fetched. `https://www.better-auth.com/llms.txt` was also attempted but the browser tool could not parse its `text/markdown` content type.
- Current official docs used:
  - [Prisma adapter](https://better-auth.com/docs/adapters/prisma) — Prisma 7/PostgreSQL adapter and generated Prisma schema flow.
  - [Express integration](https://better-auth.com/docs/integrations/express) — Express 5 catch-all handler and middleware ordering.
  - [React client installation](https://better-auth.com/docs/installation) — `createAuthClient` and React client package.
  - [Session management](https://better-auth.com/docs/concepts/session-management) — cookie-backed server sessions and expiration behavior.
  - [OAuth and Google provider](https://better-auth.com/docs/concepts/oauth) — Google provider, client sign-in, and rejecting disallowed identities before a session is issued.
  - [Rate limiting](https://better-auth.com/docs/concepts/rate-limit) — built-in auth endpoint limits and per-path rules.
  - [Database concepts](https://better-auth.com/docs/concepts/database) and [CLI](https://better-auth.com/docs/concepts/cli) — schema generation/checking. With Prisma, generate schema then use Prisma migrations; Better Auth CLI does not apply Prisma migrations.
  - [npm package](https://www.npmjs.com/package/better-auth) — current published version.

### Planned design

- **Database:** Use `better-auth` plus the documented `@better-auth/prisma-adapter` with the existing singleton Prisma 7 client and PostgreSQL provider. Do not switch databases or bypass the current Prisma migration workflow.
- **Existing IDs:** Configure Better Auth's documented ID generator to let PostgreSQL auto-increment IDs for the `user` model and use UUIDs for other auth records. Configure its user model to the existing Prisma `users` model. This keeps every integer ride/request/chat foreign key intact and avoids a parallel identity table.
- **Auth methods:** Keep Google OAuth as the only sign-in method. Do not enable email/password by default; no password data exists to migrate and adding a new login method changes product behavior. Preserve the current allowed-email-domain policy using Better Auth's documented pre-session OAuth user validation. Do not rely on Google's `hd` parameter alone as an authorization check.
- **Sessions:** Use Better Auth's database-backed, cookie-based sessions in a separate `authSession` model/table so the existing Express `session` table remains available during transition. Configure `baseURL`, a server-only secret, exact `trustedOrigins`, secure production cookies, and cross-site cookie settings consistent with the deployed frontend/backend domains. `BETTER_AUTH_SECRET` can be set explicitly; for rollout compatibility the app derives a separate SHA-256 key from `SESSION_SECRET` if it is omitted. Do not store Google refresh tokens in the application session unless an implemented feature requires them.
- **Express:** Mount the Better Auth catch-all before `express.json()` as required by the current Express 5 integration docs. Keep CORS allowlisted to explicit application origins and `credentials: true`; remove the broad `.vercel.app` suffix allowance after confirming required deploy origins.
- **Frontend:** Install the documented React client in the frontend and replace the existing redirect/status/logout implementation while retaining the sign-in page, global auth context behavior, and protected route behavior. Continue sending credentials on API requests.
- **Authorization:** No Better Auth role/admin plugin. Student account has no global driver/rider role. Keep ride ownership and request membership checks in the existing services/controllers, deriving the existing integer domain user ID from the Better Auth user ID. Preserve the existing participant checks for chat HTTP and Socket.IO.
- **Socket.IO:** Resolve the Better Auth session using the handshake request headers through the server API. Keep unauthenticated connection rejection and room membership checks. Verify handshake cookie behavior across actual configured origins before retiring Express-session support.
- **Session endpoint:** Replace `/auth/status` with the documented client/session API, but keep a compatibility adapter at `/auth/status` only if needed to avoid a frontend/API contract break during rollout. Remove it only after all clients are migrated and tested.

## Data model and existing-user migration

### Existing state

- Current `users` has integer auto-increment IDs, a unique `google_id`, email, name, picture, and optional `isadmin`.
- `rides.createdBy`, `requests.requestBy`, and chat sender IDs reference those integer user IDs. Those references must remain valid.
- Current `session` rows are Express-session JSON blobs. There are no password hash fields or local password accounts.
- Email is not declared unique in the existing domain table. Use stable Google subject (`google_id`), not email alone, to associate existing accounts.

### Proposed additive migration

1. Generate the Better Auth Prisma schema from the pinned auth configuration using the official CLI. Review and merge its required models/fields into the existing schema; do not replace the existing schema wholesale.
2. Keep the existing `users.id` integer sequence, all user IDs, and ride/request/chat foreign keys. Make `google_id` nullable for users created by Better Auth, add Better Auth's required email-verification/timestamp fields, and enforce unique email as required by the auth user model. Check for duplicate emails before adding that unique index.
3. Add the generated Better Auth `account`, `authSession`, and `verification` tables. Keep the current Express `session` table and model during transition; do not drop or rewrite it.
4. Backfill one Google account per existing user using exact `google_id` → Better Auth `account.accountId`, `providerId = "google"`, and the unchanged integer `users.id` as `account.userId`. Do not match users by email alone. Do not copy old refresh tokens.
5. New Google sign-ins create a user row in the existing `users` table with an auto-increment integer ID and a Google account row; existing ride services continue receiving that integer ID.
6. The new middleware accepts Better Auth sessions and, temporarily, existing Express sessions. After the Better Auth path and client are verified, remove the old session fallback and invalidate old sessions; retain the old table until rollback is no longer needed.
7. Before applying the schema/backfill to any shared or production database, take/verify a backup, test against a staging copy, compare duplicate-email counts and account/user mappings, and confirm the deployment/rollback plan. No production migration is run by this code change.

**Approval required before applying a shared/production migration:** The account backfill and unique-email constraint affect stored user data. Confirm the target database, backup/restore process, duplicate-email handling, migration history/baseline (this repository currently has no tracked Prisma migration directory), and deployment window before applying it. The schema and application code can be reviewed without running a migration.

## Ordered steps, risks, rollback, and verification

Each implementation phase is a separate commit on the current task branch, with a clear message. Do not include unrelated working-tree changes in commits. Preserve the pre-existing `.env.example` deletion and ask before touching it. Run validation only after the corresponding phase is approved.

| Step | Work | Main risks | Rollback | Verification checklist |
|---|---|---|---|---|
| Phase 0 — Audit (complete) | Document current app, auth, features, and gaps. | Docs may not match every runtime behavior. | Read-only; no app rollback needed. | Audit file created; implementation inspected; no tests run. |
| Phase 1 — Plan (current) | Record target conventions, mappings, Better Auth design, migration, ordered checks. | Target is the repository README, not a separate external reference; some route guarantees need API contract confirmation. | Revert only the plan document. | Check every proposed path against repository; cite current docs; explicitly list destructive/data risks. |
| Phase 2 — Safety net | Add backend test/lint/format/typecheck scripts; add focused coverage for Google domain/session policy, offer/request/accept/chat access, and existing automatic completion behavior. | Google OAuth depends on an external provider; tests isolate/mock it. The existing env-example deletion complicates setup docs. | Revert phase commit; tests/tooling are additive. | Backend build/typecheck/lint/Jest; frontend lint/build; verify no behavior changes. |
| Phase 3 — Structure | Preserve README-aligned folders; make only behavior-neutral extractions justified by code inspection. Current layers are already separated, so no mass moves are planned. | Broad moves risk import breakage and semantic drift without a distinct target tree. | Revert one small batch at a time; no database changes. | Per batch: typecheck/build/tests; compare route methods/paths and JSON shapes before/after. |
| Phase 4a — Auth schema/config | Recheck current Better Auth docs/version, pin package versions, configure auth and generate Prisma schema; review additive migration. | Prisma schema generation or migration may conflict with existing `users`/`session` models; provider account linking is sensitive. | Do not apply production migrations until approval; rollback a staging migration from backup or forward-fix. | CLI schema check; Prisma validate/generate; inspect SQL; staging-only migration; no existing row/FK loss. |
| Phase 4b — Auth runtime/client | Mount Express handler, configure Google/domain validation, React client, cookie/origins, API middleware, Socket.IO session lookup, and auth endpoint rate limits. Keep old auth code until replacement passes. | Cookie/CORS errors can lock out users; explicitly list preview origins in `TRUSTED_ORIGINS`; socket auth may differ from HTTP. | Revert server/client together; retain old routes/session store until success. | Google sign-in/status/logout; protected and public routes; rejected origins; ride owner/request checks; authenticated chat; cross-origin production-like cookie test. |
| Phase 4c — User cutover | Backfill/link users only after explicit migration approval; provision new users idempotently; stop accepting old sessions; remove old code only after tests. | Duplicate/missing user mappings could orphan ride history; old session invalidation signs users out. | Restore verified backup or use a reviewed forward repair; retain legacy tables until post-cutover signoff. | Counts/mappings for users, rides, requests, chat; each sample account can see existing profile/history; all old sessions rejected; new sessions accepted. |
| Phase 5 — Hardening | Auth endpoint rate limits, consistent errors, docs/env examples, remove unused auth packages and legacy session table only after signoff. | Removing compatibility paths or tables can affect deployed clients or rollback ability. | Keep old schema/table for a defined retention window; revert app-only changes. | Dependency scan; env validation; lint/typecheck/build/tests; README setup follows actual config. |
| Phase 6 — Report | Summarize completed work, tree, verification, and open issues. | Incomplete deployment-specific verification. | Not applicable. | Report actual commands/results and identify any production checks not run. |

## Verification contract

- Assert current endpoints and response shapes remain compatible unless separately approved.
- Critical product coverage: authenticated offer ride; another student requests to join; offerer accepts/rejects; only participants can access ride chat; ownership/membership checks reject unauthorized access.
- Authentication coverage: Google OAuth callback/domain policy, session restoration, logout, invalid/expired session, cookie and origin behavior. There is no local password flow to test or migrate.
- There is no explicit ride-completion API in the current route registry; do not create one as part of preserving behavior.
- Confirm user IDs and historical ride/request/chat ownership survive migration without changing the existing integer keys.

## Decisions / approvals still required

1. Confirm whether deployed Google OAuth sign-in is the intended long-term auth method. This plan assumes yes and excludes passwords.
2. Confirm the exact allowed email domains. Existing configuration is environment-driven; retain its current behavior until the actual deployed values are confirmed.
3. Confirm production frontend/backend origins for trusted origins and cross-site cookies.
4. Approve a concrete existing-user data backfill and deployment/rollback procedure before applying any schema migration to production.
5. Confirm whether `/auth/status` and current API response shapes are consumed by any external clients beyond this frontend.
