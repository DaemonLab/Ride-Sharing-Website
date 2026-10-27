# Deployment and database status

No institute server, domain, hardware allocation, Redis service, or hosting
arrangement is confirmed. This guide records requirements and optional templates;
it is not evidence that a deployment or database migration has been completed.

## Cookie-session deployment

Use Node.js 24.x. Run `npm ci` in each package, then `npm run build`. Serve
`ride_frontend/dist` and the backend through one HTTPS origin. The frontend uses
relative URLs and does not store or send bearer tokens.

Required reverse-proxy routes:

| Public route | Backend route |
| --- | --- |
| `/api/auth/*` | `/api/auth/*` unchanged |
| `/backend/*` | remove `/backend`, e.g. `/backend/rides` becomes `/rides` |
| `/backend/socket.io` | `/socket.io`, with WebSocket upgrades |
| Other UI routes | frontend SPA fallback to index.html |

`deploy/nginx.example.conf` is an optional template with placeholder hostnames,
paths and certificates. Do not install it unchanged. Vite supplies the local proxy
on port 5173. For any split hosting arrangement, configure an equivalent supported
same-origin proxy first; a static SPA fallback alone is insufficient for APIs/chat.

Backend production variables:

```env
NODE_ENV=production
FRONTEND_URL=https://your-confirmed-public-origin
BETTER_AUTH_URL=https://your-confirmed-public-origin
BETTER_AUTH_SECRET=<stable random secret, at least 32 characters>
COOKIE_SECURE=true
ALLOWED_DOMAINS=iiti.ac.in
DATABASE_URL=<runtime PostgreSQL connection string>
DIRECT_URL=<direct PostgreSQL connection string for migration tools>
DATABASE_SSL=true
GOOGLE_CLIENT_ID=<OAuth client ID>
GOOGLE_CLIENT_SECRET=<OAuth client secret>
EMAIL_USER_SENDER=<support sender>
EMAIL_APP_PASSWORD=<app password>
EMAIL_USER_RECEIVER=<support recipient>
```

Frontend VITE_BACKEND_URL may be omitted or `/backend`; absolute origins are
rejected. Register `<BETTER_AUTH_URL>/api/auth/callback/google` in Google Cloud.
Locally this remains `http://localhost:3000/api/auth/callback/google`. Use
`npm start` for the built backend; it binds to PORT on 0.0.0.0. `/health` checks
liveness; `/ready` checks DB connectivity and configured shared-state readiness.

## Optional shared mode

Set MULTI_INSTANCE=true and REDIS_URL only after a shared Redis service and
multiple backend workers are confirmed. Use the same database, auth secret,
origins and Redis service on all workers. Redis-backed counters cover HTTP limits
and per-user chat event limits; its Socket.IO adapter coordinates room eviction,
broadcasts and logout disconnects. Chat uses WebSocket-only transport. Redis
failure makes affected requests unavailable and disconnects local sockets.

The code defaults to single-process operation without Redis. Multi-worker
verification is opt-in using a **disposable test Redis**:

```sh
# Set TEST_REDIS_URL in your shell, then:
node --import tsx --test test/redisIntegration.node.ts
```

A skipped Redis integration test is not a passing cross-worker test. This service
has not been provisioned on institute infrastructure.

## Existing database: reconciliation is pending

A read-only comparison found seven foreign keys and four updatedAt defaults that
differ from the schema. `docs/align-existing-database.sql` is a transactional
review plan, not an applied migration. The database's data classification is
unknown, so no live changes or migration-baseline writes were made.

Before applying anything, confirm the intended database, owner, backup/recovery
procedure, existing migration history, and an appropriate release window.

For a **new, empty database**, from ride_backend:

```sh
npm run db:migrate:deploy
npm run build
npm run deploy:check
```

For the **existing database**:

1. Obtain a backup and review the reconciliation SQL against its current schema.
   It recreates foreign keys and removes defaults; it does not drop tables/data.
2. The database owner applies the reviewed transaction.
3. Run the read-only comparison and require zero differences:

   ```sh
   npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code
   ```

4. After checking migration history and confirming the schema matches, baseline:

   ```sh
   npx prisma migrate resolve --applied 20261027000000_initial
   npm run db:migrate:deploy
   npm run deploy:check
   ```

Do not execute the initial CREATE TABLE migration against existing tables. Do not
use migrate reset, migrate dev, or db push --accept-data-loss on production.
Future schema changes use reviewed migrations and migrate deploy as a release
step. Builds and deploy:check do not modify the database.

## Remaining verification

The three-user simulation uses real signed-cookie validation and real local HTTP/
WebSocket connections, but in-memory sessions and mocked ride records. It does
not verify production Google OAuth, live booking transactions or Redis availability.
An independent penetration test and sustained workload testing remain outstanding.

Confirm SMTP network access before enabling support delivery; some hosting plans
block Gmail SMTP ports. No provider/college plan is assumed here.

References: [Better Auth cookies](https://better-auth.com/docs/concepts/cookies),
[Socket.IO Redis adapter](https://socket.io/docs/v4/redis-adapter),
[Prisma baselining](https://www.prisma.io/docs/orm/prisma-migrate/workflows/baselining).
