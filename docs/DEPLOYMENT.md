# Deploying RideShare

## Runtime and project directories

Use Node.js **24.x**. The installed Vite/Prisma versions do not support Node 18.
Commit both lockfiles and use `npm ci` for reproducible installs.

Configure two separate projects/services from the repository:

| Setting | Frontend (Vercel) | Backend (Render) |
| --- | --- | --- |
| Root directory | `ride_frontend` | `ride_backend` |
| Install | `npm ci` | included in build command below |
| Build | `npm run build` | `npm ci && npm run build` |
| Output | `dist` | executable `dist/index.js` |
| Start | managed static hosting | `npm start` |
| Health check | `/` | `/ready` |

Include devDependencies during builds: frontend TypeScript and Vite are build
tools. Do not use `npm ci --omit=dev` for the frontend build. Do not serve the
backend as a Vercel function; it is a persistent HTTP/WebSocket process.

## Environment configuration

Set these on the **backend**, without accidentally copying quote characters:

```env
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
BETTER_AUTH_URL=https://your-backend.onrender.com
BETTER_AUTH_SECRET=<strong random secret, at least 32 characters>
COOKIE_SECURE=true
ALLOWED_DOMAINS=iiti.ac.in
DATABASE_URL=<PostgreSQL runtime connection string>
DIRECT_URL=<PostgreSQL direct connection string for migrations>
DATABASE_SSL=true
GOOGLE_CLIENT_ID=<Google OAuth client ID>
GOOGLE_CLIENT_SECRET=<Google OAuth client secret>
EMAIL_USER_SENDER=<Gmail sender address>
EMAIL_APP_PASSWORD=<Gmail app password>
EMAIL_USER_RECEIVER=<support recipient address>
```

Render supplies PORT automatically; the server binds to 0.0.0.0 on that port.
DIRECT_URL falls back to DATABASE_URL, but use a direct endpoint when runtime
traffic uses a transaction pooler. Set DATABASE_SSL=false only for a database
that does not require TLS, such as local development.

On **Vercel**, set `VITE_BACKEND_URL=https://your-backend.onrender.com` for the
intended Production/Preview environment before building. Rebuild/redeploy after
changing it: Vite embeds this value into the browser bundle. Do not include an
`/api` suffix and never put database passwords or OAuth secrets in VITE_ variables.
Build validation rejects missing backend URLs, malformed origins, and hosted
builds pointed at localhost or HTTP. Local development still defaults to port 3000.

FRONTEND_URL must match the browser origin exactly, including the hostname used
for Google callbacks. Arbitrary Vercel preview domains are intentionally not
trusted; use a separate backend/configuration for an authenticated preview.

## Google OAuth

In the matching Google Cloud OAuth client, register this exact redirect URI:

```text
https://your-backend.onrender.com/api/auth/callback/google
```

For local development, separately register:

```text
http://localhost:3000/api/auth/callback/google
```

The older `/auth/google/callback` value in previous setup instructions is not the
URI the current Better Auth integration sends to Google. Also check the OAuth
consent screen's publishing status and test users. Keep the auth secret stable
across deployments; rotating it invalidates existing signed cookies/OAuth state.

## Database: fresh versus existing

There is now a committed initial migration at
`ride_backend/prisma/migrations/20261027000000_initial/migration.sql`.

For a **new, empty database**, run from `ride_backend`:

```sh
npm run db:migrate:deploy
npm run build
npm run deploy:check
```

For the **existing configured database**, a read-only comparison on 27 October
2026 found drift in seven foreign keys and four updatedAt defaults. The proposed
transactional reconciliation is [align-existing-database.sql](align-existing-database.sql).
It has not been applied. Do not run the fresh initial migration on existing
tables: Prisma can reject this with P3005, or a repeated CREATE TABLE can fail.

1. Back up the intended database and review the reconciliation SQL against its
   current schema. The script recreates foreign keys with the checked-in schema's
   cascade behavior and removes updatedAt defaults; it does not drop tables/data.
2. Have the database owner apply the reviewed reconciliation transaction.
3. Verify that the schema comparison reports no differences:

   ```sh
   npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code
   ```

4. Only after verifying the schema and checking any existing migration history,
   baseline the initial migration instead of executing its CREATE statements:

   ```sh
   npx prisma migrate resolve --applied 20261027000000_initial
   npm run db:migrate:deploy
   npm run deploy:check
   ```

Do not use `migrate reset`, `db push --accept-data-loss`, or `migrate dev` on
production. Future deployments should run `npm run db:migrate:deploy` as a release
step after this one-time baseline; the build itself does not modify the database.
If the platform lacks a release/pre-deploy step, run the migration once through
its shell or CI before starting the new app version.

`npm run deploy:check` is read-only and needs a successful build first. It checks
runtime configuration plus all scalar columns in the seven Prisma models,
without logging user data. `/health` is liveness; `/ready` also tests database
connectivity. Readiness does not replace migration/schema verification.

## Mail and hosting limits

The contact form uses Gmail SMTP. Render free services block outbound ports 465
and 587, and Render blocks port 25 on all services. Contact delivery therefore
requires a hosting plan that permits Gmail SMTP, or an implementation using an
HTTPS email provider. SMTP calls now have bounded connection/socket timeouts;
these prevent indefinite hangs but do not bypass hosting restrictions.

Free service cold starts can also delay the first login or API request. Before
scaling to multiple backend instances, add shared rate-limit storage and a
Socket.IO adapter; current limits and room revocation are process-local.

## Release checks and failure diagnosis

- `npm ci`: lockfile mismatch or unsupported Node => select Node 24 and commit
  synchronized package.json/package-lock.json files.
- `npm run build`: missing VITE_BACKEND_URL => set it in the frontend build
  environment. Missing TypeScript/Vite => include build devDependencies.
- Startup missing-env error => populate every required backend variable above.
  Startup DB error => verify network allowlists, connection strings, SSL, and
  schema baseline/migrations. No environment secrets are required for builds.
- Google `redirect_uri_mismatch` => match BETTER_AUTH_URL and the exact registered
  callback. Login/CORS failure => match FRONTEND_URL to the current browser origin.
- API calls to localhost, mixed-content errors, or stale configuration => fix the
  Vercel build environment and redeploy the frontend.
- Direct `/profile`, `/find`, or `/auth/callback` returns 404 => ensure the frontend
  project's root is ride_frontend so Vercel reads its SPA rewrite configuration.
- `/ready` returns 503 => inspect backend database connectivity. The response
  intentionally does not expose the connection string or internal error.
- Check a fresh login in Chrome, Safari and Brave, an authorized two-user ride
  flow, WebSocket reconnect, and actual support delivery on the deployed host.

References: [Render Node versions](https://render.com/docs/node-version),
[Render free-service restrictions](https://render.com/docs/free),
[Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite),
[Prisma baselining](https://www.prisma.io/docs/orm/prisma-migrate/workflows/baselining).
