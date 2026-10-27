# Workspace security and correctness review — 27 October 2026

Reviewed the Express routes/controllers/services, Better Auth flow, Socket.IO
handlers, Prisma models, React authentication/data flows, and deployment config.
This is a source review with automated regression checks, not a penetration test
or a guarantee that every possible defect has been found.

## Changes

- OAuth starts through a top-level backend navigation and forwards every state
  cookie. State verification remains enabled. Cookies use SameSite=Lax, with
  Secure on HTTPS. OAuth errors redirect to frontend sign-in.
- OAuth session handoff uses a URL fragment rather than a query string, reducing
  exposure in server access logs and HTTP referrers. The frontend consumes and
  removes it, supports the previous callback format during rollout, and waits for
  confirmed authentication before opening the profile. Auth checks are stable.
- HTTP CORS, OAuth trusted origins, and WebSocket upgrade checks share an exact
  origin allowlist. Production allows FRONTEND_URL; local development also allows
  localhost:5173 and localhost:3000. Arbitrary Vercel tenants are no longer trusted.
- Google login requires a verified email from a configured institute domain.
  Domain configuration is normalized to lowercase.
- Authenticated API responses are not cached. Backend and Vercel frontend add
  anti-sniffing, frame denial, and no-referrer headers.
- Contact submissions have type, length, email, and header-injection validation;
  names are HTML-escaped in mail. Added per-IP contact/login limits and a per-user
  API request limit. JSON parser errors retain their proper HTTP status.
- Chat events validate arbitrary payloads before destructuring, limit message
  length and packet size, limit event frequency, expire connected sessions,
  revoke room membership on leaving/cancellation, disconnect on logout, and check
  recipients against current ride membership before broadcasting. History is
  bounded to the latest 200 messages. Reconnect rejoins the ride; connection
  errors are visible in the UI.
- Profile responses expose only intended fields and map the avatar correctly.
  Frontend user IDs use strings consistently with Better Auth.
- Ride cancellation uses a conditional status update. Ride creation validation
  and automatic completion interpret departures in Asia/Kolkata, including when
  the database/server runs in UTC. Periodic cleanup errors are caught.
- Applied compatible dependency security updates, upgraded Nodemailer to 10.2.1,
  updated Lucide to restore missing declarations and tree shaking, and removed
  unused Google auth/session packages. Added reproducible backend test scripts;
  frontend production builds now include TypeScript checking.

## Verification

- Frontend: `npm run lint`, `npm run build` (includes TypeScript).
- Backend: `npm run build`, `npm test` (Jest plus Node auth/HTTP regressions).
- Dependency advisories: `npm audit` in each package.
- Local server health and unauthenticated/CORS boundary checks.
- No tracked .env credential files; targeted secret-pattern scan of application
  sources and documentation did not find matching private keys/API tokens.

Regression tests use mocks and temporary local HTTP servers; they do not create
rides, send mail, migrate the database, or alter real users.

## Deployment and remaining limits

- Deploy frontend and backend together. Set FRONTEND_URL to the exact frontend
  origin, BETTER_AUTH_URL to the backend origin, and register
  `<backend-origin>/api/auth/callback/google` in the Google OAuth client. Set
  COOKIE_SECURE=true in production and keep a strong stable BETTER_AUTH_SECRET.
- Validate a fresh Google login on actual Safari and Brave after deployment.
  Provider consent, SMTP delivery, and full multi-user ride flows still require
  end-to-end testing against dedicated test accounts.
- Bearer tokens remain in localStorage to support the existing cross-site
  Vercel/Render architecture. Same-origin hosting with HttpOnly sessions would
  reduce token exposure to injected JavaScript. Fragments are also readable by
  scripts on the callback page until consumed.
- Rate-limit stores and socket room/session revocation are local to one backend
  process. Multiple instances require shared rate storage and a Socket.IO adapter.
- Chat returns only the latest 200 messages; older-history pagination is not
  implemented. Existing database schema changes were not deployed or migrated.
- Dependency audit results are point-in-time findings and need regular rechecks.
