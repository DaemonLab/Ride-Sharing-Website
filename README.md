# Campus RideShare

A TypeScript ride-sharing application for a campus community. Students can offer
rides, search routes, request seats, manage bookings, and chat with ride members.

## Current status

This repository contains the application and local verification tools. An IIT
Indore deployment, institute domain, server specifications, Redis service, and
500-user capacity are **not confirmed**. No institute infrastructure has been
configured by these changes.

The current security update replaces browser bearer tokens with HttpOnly cookie
sessions. Production use requires a same-origin reverse proxy; this is a setup
requirement, not a claim that any hosting provider or college server is ready.
Existing browser tokens are removed during the update. Users must sign in again.

## Features

- Google sign-in restricted to verified emails from configured domains.
- Ride offers, paginated route/date/time search, and owner-controlled requests.
- Transactional acceptance, seat updates, cancellation, and leaving a ride.
- Ride membership checks for group details, chat history, and messages.
- Responsive React interface, profile pages, and contact form.
- Input validation, request throttling, CSRF headers, and error handling.

## Stack and structure

- Frontend: React 18, Vite, TypeScript, TailwindCSS, React Router, Socket.IO client.
- Backend: Node.js 24, Express 5, Better Auth, Prisma, PostgreSQL, Socket.IO.
- Optional shared infrastructure: Redis rate-limit stores and Socket.IO adapter.

```text
ride_frontend/src/   React pages, components, API clients, hooks and services
ride_backend/src/    Express routes, controllers, services, auth and validation
ride_backend/index.ts  HTTP/WebSocket startup and graceful shutdown
ride_backend/prisma/  Schema and initial migration
ride_backend/test/    Automated checks
scripts/load-test.mjs Bounded, read-only local load probe
```

User IDs are strings from Better Auth. PostgreSQL models are User, Session,
Account, Verification, rides, requests and groupChat. The current schema is in
`ride_backend/prisma/schema.prisma`; older numeric-user diagrams are obsolete.

## Local setup

Install Node.js 24.x, provide a PostgreSQL database, and configure a Google OAuth
client. Do not commit credentials.

1. Copy `ride_backend/.env.example` to `ride_backend/.env` and fill in the required
   database, OAuth, secret, allowed-domain and support-email values.
2. Local defaults are FRONTEND_URL=http://localhost:5173 and
   BETTER_AUTH_URL=http://localhost:3000, with COOKIE_SECURE=false.
3. Register `http://localhost:3000/api/auth/callback/google` in the Google OAuth
   client. It must match BETTER_AUTH_URL plus `/api/auth/callback/google`.
4. Install dependencies in both directories with `npm ci`.
5. For a **new empty database**, apply `npm run db:migrate:deploy` from the backend.
   For an existing database, first follow the deployment guide's baseline steps.
6. Run `npm run dev` in each directory, in separate terminals. Open
   `http://localhost:5173`.

The frontend uses `/backend` for application requests and `/backend/socket.io`
for WebSockets. Vite proxies these to port 3000 locally. It also proxies
`/api/auth` for Better Auth. Browser requests carry cookies and an
`X-Requested-With: XMLHttpRequest` header for mutations. Login does not put
session tokens in the callback URL or localStorage.

VITE_BACKEND_URL can be omitted or set to `/backend`. Absolute browser API URLs
are rejected by the build to prevent accidentally restoring cross-site cookies.

## Production requirements — hosting not selected

Serve the frontend and proxy the backend through the **same HTTPS origin**:

- `/api/auth/*` forwards unchanged to the backend.
- `/backend/*` forwards to the backend with `/backend` stripped.
- WebSocket upgrades on `/backend/socket.io` must reach backend `/socket.io`.
- Other frontend routes fall back to `index.html`.

Set FRONTEND_URL and BETTER_AUTH_URL to that public HTTPS origin and
COOKIE_SECURE=true. Register the resulting `/api/auth/callback/google` URL with
Google. A generic optional proxy example is in `deploy/nginx.example.conf`; it
must be adapted after the host, domain and certificate are confirmed. This is
not an installed or active college-server configuration.

If retaining Vercel/Render or another split-host setup, configure equivalent
same-origin proxy rules first. The SPA-only Vercel configuration does not by
itself proxy the backend, and Vercel rewrites alone do not provide the persistent
WebSocket proxy needed for chat. Choose a supported proxy/hosting arrangement
before deploying this cookie-session update.

### Optional multiple-instance mode

Single-process local development does not require Redis. To deploy more than
one backend process, set MULTI_INSTANCE=true and REDIS_URL to a shared Redis
service. Each worker must use the same database, auth secret, origins and Redis
service. The code uses Redis for HTTP rate limits and Socket.IO room operations;
WebSocket-only transport avoids polling sticky-session requirements. Startup
requires Redis connectivity when configured, and Redis loss rejects affected
requests and disconnects local sockets rather than silently falling back.

Redis availability and actual multi-server operation have not been confirmed or
verified on institute infrastructure. Do not mark this setup deployed based on
the presence of configuration code alone.

## Database status

A previous read-only comparison found foreign-key and updatedAt-default drift.
The review script is `docs/align-existing-database.sql`. It has **not been applied**,
and the configured database's data classification is unknown. No live schema or
student records were changed as part of this security update. Confirm ownership,
backup/recovery and the target environment before reconciling and baselining it.

See [deployment and database steps](docs/DEPLOYMENT.md).

## Verification

```sh
# Backend
cd ride_backend
npm run build
npm test
npm run deploy:check  # read-only; needs a build and configured database

# Frontend, from its directory
npm run lint
npm run test:deployment
npm run build
```

Automated checks and local simulations are not an independent penetration test.
Production OAuth, multiple real users, SMTP delivery, Redis-backed cross-worker
revocation, sustained load and the eventual hosting environment still need
verification. Run security tests against dedicated test accounts/data, not
unclassified student data.

The saved local load probe tested lightweight endpoints only. Its results are
not a verified capacity estimate for 500 concurrent students or the IIT server.

## Security and operational limits

- HttpOnly cookies reduce direct token theft but do not make XSS harmless.
- Shared rate-limit/socket behavior requires a working configured Redis service.
- Database reconciliation and baseline remain pending.
- Gmail SMTP requires outbound SMTP access; some hosting plans block it.
- No external penetration test or confirmed institute deployment has occurred.

Historical review: [security review](docs/SECURITY_REVIEW_2026-10-27.md).
That document describes an earlier revision; this README records the current
cookie-session update and its pending deployment requirements.
