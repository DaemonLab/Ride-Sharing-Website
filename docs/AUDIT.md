# Phase 0: Repository Audit

## Scope and reference

- Repository: current working tree on `refactor/architecture-and-auth`.
- The requested reference is still the placeholder `[PATH / REPO URL / DESCRIPTION OF REFERENCE]`. No external target conventions can be extracted yet.
- The existing `README.md` describes the current layout and claimed behavior. It is useful as repository documentation, but is not a separate target reference.
- No application code, dependency, schema, or configuration was changed for this audit.

### Clarification received after the audit

- Preserve the student flow: one student offers a ride booked elsewhere, other students request to join, the offerer accepts or rejects, and participants use ride chat.
- Offering and joining are activities, not account roles. No separate rider/driver account roles or new admin role are needed.
- The revised task identifies `README.md` as the initial structure reference; its layout matches the current repository. No external reference was supplied.
- The implementation keeps the existing Google OAuth sign-in as the auth behavior being replaced by Better Auth. It does not add passwords.

## Stack and entry points

| Area | Current implementation |
|---|---|
| Backend | Node.js, TypeScript (ES modules), Express 5 |
| Data | PostgreSQL through Prisma 7 and `@prisma/adapter-pg` |
| Authentication/session | Google OAuth via `google-auth-library`, `express-session`, custom Prisma-backed session store |
| Realtime | Socket.IO sharing Express sessions |
| Validation/logging/email | Zod, Winston, Nodemailer |
| Backend tests | Jest configuration and three test files; package scripts currently do not expose test/typecheck commands |
| Frontend | React 18, TypeScript, Vite, React Router, Axios, TailwindCSS |

Backend startup is `ride_backend/index.ts`: it checks the database, cleans expired session rows, creates the HTTP server, initializes Socket.IO/chat handlers, then listens. `ride_backend/src/app.ts` configures CORS, body parsing, sessions, route mounting, 404, and error middleware. Frontend starts at `ride_frontend/src/main.tsx`; route definitions live in `ride_frontend/src/App.tsx`.

## Current structure

```text
.
├── README.md
├── ride_backend/
│   ├── index.ts
│   ├── prisma/                 # PostgreSQL Prisma schema
│   ├── src/
│   │   ├── app.ts
│   │   ├── chat.ts
│   │   ├── config/             # env, Prisma, session store, logger, Socket.IO
│   │   ├── controllers/
│   │   ├── middleware/         # auth and error handlers
│   │   ├── routes/
│   │   ├── services/           # domain logic and Prisma access are combined
│   │   ├── utils/
│   │   └── validation/
│   └── test/
└── ride_frontend/
    └── src/
        ├── api/
        ├── components/
        ├── context/
        ├── hooks/
        ├── pages/
        ├── services/
        └── types/
```

The backend already separates routes, controllers, and services, but services directly use Prisma; there is no repository/data-access layer. The frontend has both API and service layers. Configuration, validation, logging, and centralized error handling exist in some form. A reference-specific target tree cannot be determined until the reference is supplied.

## Authentication and access control

- User registration/login is Google OAuth only. `GET /auth/google` initiates the flow; the callback exchanges and verifies the Google ID token, checks email/domain allowlisting, then finds or creates a `users` row by Google subject. There is no local password creation, password hashing, or password login.
- Identity is kept in an `express-session` session object and persisted to PostgreSQL `session` rows using `PrismaStore`. The cookie is HTTP-only, has a seven-day max age, and takes `secure`/`sameSite` settings from environment configuration. Expired rows are checked on reads and periodically deleted.
- The callback stores the Google refresh token in the application session when one is returned. The app does not appear to use it later; retaining a long-lived provider credential increases impact if the database is exposed.
- `authenticate` is mounted before the API route registry in `src/app.ts`, so rides, chat HTTP endpoints, requests, and user profile endpoints require a session. Login/status/logout, health, and contact/support are mounted outside that guard. The latter are plausibly intentionally public; the reference/API policy has not been supplied.
- There is a global `isAdmin` middleware and an `isadmin` database field, but no admin route is mounted and no admin UI is apparent. The product’s actual participant model is students offering and joining rides; distinct `rider` and `driver` roles are not represented. Clarify whether role distinctions are required before role/schema work.
- Controllers generally derive the actor ID from `req.session.user`, rather than trusting a body-supplied user ID. Ride ownership checks are delegated to services for cancellation, leaving, grouping, and request decisions. Chat sockets require an authenticated session and check ride membership before joining or reading messages.
- OAuth state/PKCE behavior is not evident in the application’s manually implemented authorization URL flow; inspect provider protections before replacing it. CORS permits any origin ending in `.vercel.app`, which may authorize unrelated preview/deployment origins with credentialed requests. Allowing originless requests is also intentional in code but broadens non-browser access; API sessions still need a cookie.
- The error path for OAuth callback failures redirects the exception message to the frontend. This can expose internal/provider details. The callback logs session ID and authorization-code length (not the code itself).

## Domain features found

- Create and search rides; list upcoming/completed rides; cancel an offered ride or leave a ride.
- Send and accept/reject join requests, with transaction-oriented seat/request lifecycle logic and Zod ride schemas.
- Ride group membership and ride-associated group chat using HTTP and Socket.IO.
- User profile and public contact/support email flow.
- No implemented payment processing, ratings/reviews, driver location tracking, dispatch/matching service, or manual complete-trip endpoint was found. Past rides are automatically marked completed by `completeExpiredRides()` during ride/request operations; there is no explicit completion route.

## Configuration, validation, errors, and tests

- Backend `src/config/env.ts` validates required variables at import time and checks production cookie settings. It uses manual checks rather than a single typed schema. `ride_backend/.env.example` provides placeholders; no `.env` file was listed at the repository root/backend listing.
- The backend has Zod ride schemas, async-handler helpers, a centralized error middleware, and a Winston logger. Validation coverage across all endpoints and consistent error shapes require a route-by-route review during implementation.
- Frontend has an ESLint configuration and `lint` script; backend package scripts expose build/dev/Prisma but not test, lint, or typecheck. Existing tests cover ride schemas, ride lifecycle, and environment validation; they do not currently show signup/login or full HTTP integration coverage.
- No test/build commands were run during this read-only audit.

## Initial risks and quality findings

1. The external reference and desired target conventions are absent, so restructuring decisions cannot yet be mapped faithfully.
2. Roles are ambiguous: the current schema uses an admin boolean but represents ride creators and joiners through relationships, not separate driver/rider accounts.
3. Existing users are Google-only, with `google_id` required and email not unique in the Prisma schema. Migration to Better Auth needs an explicit account-linking strategy and data-preserving schema plan; there are no password hashes to port.
4. Replacing authentication affects HTTP routes, Socket.IO session identity, frontend auth state, and existing session rows. Session invalidation and rollout must be planned explicitly.
5. Credentialed CORS includes a broad Vercel subdomain suffix rule. OAuth callback errors disclose exception text through redirects. These merit focused review in the hardening phase.
6. README endpoint/feature descriptions may not exactly match route implementation (for example available rides are served at `GET /rides/`, and no completion route was found). API contract changes need deliberate review.
7. There are no visible data-layer repositories, and some service modules combine business rules with Prisma queries. Restructuring should preserve transaction and ownership semantics.

## Remaining implementation assumptions

- Keep the existing ride/request/chat paths and response shapes; no explicit contract changes were requested.
- Keep Google OAuth only. Reconfirm this if the product should add another sign-in method later.
