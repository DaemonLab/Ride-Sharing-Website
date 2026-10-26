# Phase 0 — Codebase Audit

> **Status:** Read-only inspection completed — no code changed.  
> **Date:** 2026-10-26  
> **Branch:** `pratham` (current working branch)  
> **Other branches:** `main`, `shavait`, `updated-ui`

---

## 1. Technology Stack (Confirmed)

| Layer | Technology | Version |
|-------|-----------|---------|
| **Runtime** | Node.js | — |
| **Backend Framework** | Express | 5.1.0 |
| **Language** | TypeScript | 5.9.3 (backend), ~5.5 (frontend) |
| **Database** | PostgreSQL (Neon) | via `@prisma/adapter-pg` 7.9.1 |
| **ORM** | Prisma Client | 7.9.1 |
| **Auth** | Google OAuth 2.0 + express-session | `google-auth-library` 9.15.1 |
| **Session Store** | Custom PrismaStore (Prisma → `session` table) | Hand-rolled |
| **Real-time** | Socket.IO | 4.8.1 |
| **Validation** | Zod | 4.4.3 |
| **Logging** | Winston | 3.17.0 |
| **Email** | Nodemailer | 9.0.5 |
| **Frontend** | React 18 + Vite 8 + React Router 7 | — |
| **Frontend HTTP** | Axios | 1.20.0 |
| **Frontend CSS** | TailwindCSS | 3.4.1 |
| **Deployment** | Vercel (frontend) + Render (backend) | — |

---

## 2. Current Folder Structure

### Backend (`ride_backend/`)

```
ride_backend/
├── index.ts                        # Entry point — HTTP server, socket init, DB check
├── package.json
├── tsconfig.json
├── jest.config.js
├── prisma.config.js                # Prisma CLI config (DIRECT_URL for migrations)
├── .env / .env.example
├── .gitignore
│
├── prisma/
│   └── schema.prisma               # 5 models: session, users, rides, requests, groupChat
│
├── src/
│   ├── app.ts                      # Express app — CORS, session, route mounting, error handler
│   ├── chat.ts                     # Socket.IO event handlers (joinRoom, chat message, getOlderMessages)
│   │
│   ├── config/
│   │   ├── env.ts                  # Env validation (fail-fast) + typed env object
│   │   ├── logger.ts               # Winston logger (console + file in dev)
│   │   ├── prisma.ts               # PrismaClient singleton (with PrismaPg adapter)
│   │   ├── prismaStore.ts          # Custom express-session store backed by Prisma
│   │   └── socket-config.ts        # Socket.IO init + session sharing
│   │
│   ├── controllers/
│   │   ├── loginController.ts      # Google OAuth flow + session management
│   │   ├── rideController.ts       # Ride CRUD endpoints
│   │   ├── requestController.ts    # Join request send/accept/reject
│   │   ├── chatController.ts       # HTTP chat endpoint (ride members)
│   │   ├── userController.ts       # User profile
│   │   └── supportController.ts    # Contact form
│   │
│   ├── middleware/
│   │   ├── authMiddleware.ts       # authenticate() + isAdmin()
│   │   └── errorMiddleware.ts      # Central error handler (Zod, domain, 500)
│   │
│   ├── routes/
│   │   ├── index.ts                # Central route registry (protected routes)
│   │   ├── loginRoutes.ts          # /auth/* (public)
│   │   ├── rideRoutes.ts           # /rides/*
│   │   ├── requestRoutes.ts        # /request/*
│   │   ├── chatRoutes.ts           # /chat/*
│   │   ├── userRoutes.ts           # /user/*
│   │   └── supportRoutes.ts        # /contact (public)
│   │
│   ├── services/
│   │   ├── rideService.ts          # Ride business logic (search, create, cancel, leave, complete)
│   │   ├── requestService.ts       # Join request business logic
│   │   ├── chatService.ts          # Chat persistence (add/fetch messages, ride members)
│   │   ├── userService.ts          # User CRUD (findByGoogleId, create, update)
│   │   └── supportService.ts       # Contact email sender + auto-reply
│   │
│   ├── utils/
│   │   ├── index.ts                # Barrel export
│   │   ├── asyncHandler.ts         # try/catch wrapper for async route handlers
│   │   ├── email.ts                # Domain allowlist check (isEmailAllowed)
│   │   └── rideSearch.ts           # Prisma where-clause builder + pagination helper
│   │
│   ├── validation/
│   │   └── rideSchemas.ts          # Zod schemas for ride create & search
│   │
│   └── types/                      # (empty — dead directory)
│
└── test/
    ├── env.jest.test.ts
    ├── rideLifecycle.jest.test.ts
    └── rideSchemas.jest.test.ts
```

### Frontend (`ride_frontend/`)

```
ride_frontend/
├── index.html / package.json / vite.config.ts / tailwind.config.js
├── .env / .env.example
│
└── src/
    ├── App.tsx                     # Router + AuthProvider + lazy routes
    ├── main.tsx                    # React root
    ├── index.css
    │
    ├── api/                        # Raw HTTP calls (axios)
    │   ├── axiosInstance.ts         # Shared axios (withCredentials, 401 interceptor)
    │   ├── authApi.ts              # /auth/status, /auth/logout
    │   ├── rideApi.ts              # /rides/*
    │   ├── requestApi.ts           # /request/*
    │   └── userApi.ts              # /user/profile
    │
    ├── services/                   # Business logic layer
    │   ├── authService.ts          # checkAuthStatus, logoutUser, redirectToGoogleLogin
    │   ├── rideService.ts          # Ride operations
    │   ├── requestService.ts       # Request operations
    │   └── userService.ts          # User profile
    │
    ├── hooks/                      # React hooks
    │   ├── useAuth.ts
    │   ├── useProfile.ts
    │   ├── useRideRequests.ts
    │   ├── useRideSearch.ts
    │   └── useRides.ts
    │
    ├── context/
    │   └── AuthContext.ts
    │
    ├── components/
    │   ├── AuthProvider.tsx         # Global auth state
    │   ├── ProtectedRoute.tsx      # Route guard
    │   ├── Header.tsx / Footer.tsx
    │   ├── Button.tsx / ConfirmModal.tsx
    │   ├── CustomDatePicker.tsx / CustomTimePicker.tsx / CustomVehicleSelect.tsx
    │   └── RideChat.tsx            # Socket.IO chat component
    │
    ├── pages/                      # 13 page components
    │   ├── Home.tsx, Find.tsx, Offer.tsx, Profile.tsx, SignIn.tsx
    │   ├── About.tsx, Contact.tsx, Safety.tsx
    │   ├── BookRide.tsx, BookingSuccess.tsx
    │   ├── GroupMembers.tsx, Chats.tsx, NotFound.tsx
    │
    └── types/
        └── index.ts                # Shared types (Ride, User, AuthContextType, etc.)
```

---

## 3. Reference Repository Conventions (IITISOC-InteriorAI-Studio)

### Folder Layout

```
backend/
├── src/
│   ├── app.ts                      # Express app setup (middleware stack, CORS, Clerk)
│   ├── server.ts                   # Entry point (DB connect, server.listen)
│   ├── config/                     # db.ts, redis.ts, cloudinary.ts, promptEnhancer.ts
│   ├── controllers/                # *.controller.ts — req/res + next(error)
│   ├── middleware/                  # auth.ts, error.ts, logger.ts, rate-limit.ts
│   ├── routes/                     # *.routes.ts + index.ts (central registry)
│   ├── queues/                     # BullMQ job queues
│   └── workers/                    # Background workers
├── prisma/                         # schema.prisma + migrations/
├── prisma.config.ts
├── Dockerfile / docker-compose.yml
└── package.json
```

### Key Conventions Extracted

| Convention | Reference Approach | Current Code |
|-----------|-------------------|-------------|
| **File naming** | `*.controller.ts`, `*.routes.ts` | `*Controller.ts`, `*Routes.ts` |
| **Entry point** | `src/server.ts` (inside `src/`) | `index.ts` (root, outside `src/`) |
| **Layering** | Routes → Controllers → Prisma (direct) | Routes → Controllers → Services → Prisma ✅ |
| **Error handling** | `next(error)` → central error handler (Zod + Prisma + generic) | Same pattern ✅ |
| **Auth middleware** | `requireAuthAndSyncUser` (Clerk → syncs to DB) | `authenticate` (session check only) |
| **Request logger** | Dedicated `requestLogger` middleware | Winston logger (no HTTP request middleware) |
| **Rate limiting** | Redis-backed `express-rate-limit` | **Missing** ❌ |
| **Validation** | Zod inline in controllers | Zod in separate `validation/` folder |
| **Config** | `dotenv.config()` in app.ts | Centralized `env.ts` with fail-fast ✅ |
| **Logging** | `console.log` | Winston ✅ (better) |

> **Note:** The reference uses **Clerk** for auth. Our target is **Better Auth**, so we use the reference for structure/naming conventions only — not for auth code.

---

## 4. Current Authentication Deep Dive

### End-to-End Flow

```
1. User clicks "Sign In"
2. Browser navigates to GET /auth/google
3. Backend redirects to Google OAuth consent URL
4. User consents → Google redirects to GET /auth/google/callback?code=...
5. Backend: callbackClient.getToken(code) → tokens
6. Backend: verifyIdToken → extracts email, sub, name, picture
7. Backend: isEmailAllowed(email) → domain allowlist check
8. Backend: findByGoogleId(sub) or create() → users table
9. Backend: req.session.user = { id, googleId, email, name, picture, isAdmin }
10. Backend: req.session.save() → PrismaStore.set() → session table
11. Backend: res.redirect(frontendUrl + "/profile?status=success")
12. Frontend AuthProvider: detects ?status=success → calls /auth/status
13. GET /auth/status → returns { isAuthenticated: true, user: req.session.user }
14. AuthProvider: sets user + isAuthenticated state
15. ProtectedRoute: renders Outlet (no redirect)
```

### User Creation

- **Where:** `loginController.ts` → `userService.create()` / `userService.update()`
- **How:** On first Google OAuth login, a row is inserted into `users` with `google_id`, `email`, `name`, `picture`
- **No password:** Users never set a password. Auth is entirely Google OAuth.

### Password Hashing

**None.** No passwords are stored. The `users` table has no password column.

### Session Management

| Aspect | Implementation |
|--------|---------------|
| **Store** | Custom `PrismaStore` class (manual `get`/`set`/`destroy` via Prisma) |
| **Session table** | `session { sid, sess (JSON), expire }` in PostgreSQL |
| **Cookie name** | `rideshare.sid` |
| **Cookie maxAge** | 7 days, rolling=true |
| **Security** | `httpOnly: true`, `secure: COOKIE_SECURE`, `sameSite: COOKIE_SAME_SITE` |
| **Cleanup** | Expired sessions purged on startup + every 6 hours via `setInterval` |
| **Session data** | `req.session.user = { id, googleId, email, name, picture, isAdmin }` |
| **Refresh token** | Stored in `req.session.refreshToken` but **never used** |

### Where Auth is Checked

| Location | Mechanism |
|----------|-----------|
| `app.ts:90` | `app.use(authenticate)` — blanket middleware before all protected routes |
| `authMiddleware.ts` | `authenticate`: checks `req.session?.user` → 401 if missing |
| `authMiddleware.ts` | `isAdmin`: checks `req.session?.user?.isAdmin === true` → 403 |
| `chat.ts:12` | Socket.IO: checks `req.session?.user` on connection → disconnect if missing |
| Socket.IO events | Each event re-checks ride membership via `getRideMembers()` |

### Route Protection Map

| Route | Auth Required | Admin Required |
|-------|:---:|:---:|
| `GET /health` | ❌ | ❌ |
| `GET /auth/google` | ❌ | ❌ |
| `GET /auth/google/callback` | ❌ | ❌ |
| `GET /auth/status` | ❌ | ❌ |
| `POST /auth/logout` | ❌ | ❌ |
| `POST /contact` | ❌ | ❌ |
| `GET /rides` | ✅ | ❌ |
| `POST /rides/addRide` | ✅ | ❌ |
| `GET /rides/upcomingRides` | ✅ | ❌ |
| `GET /rides/completedRides` | ✅ | ❌ |
| `GET /rides/:rideID/group` | ✅ | ❌ |
| `POST /rides/:rideID/cancel` | ✅ | ❌ |
| `POST /rides/:rideID/leave` | ✅ | ❌ |
| `POST /request/sendRequest` | ✅ | ❌ |
| `POST /request/handleRequest` | ✅ | ❌ |
| `GET /request/requestsSent` | ✅ | ❌ |
| `GET /request/requestsReceived` | ✅ | ❌ |
| `POST /chat/rideMembers` | ✅ | ❌ |
| `GET /user/profile` | ✅ | ❌ |
| Socket.IO connection | ✅ | ❌ |

---

## 5. Database Schema Summary

### Models

| Model | Purpose | Key Fields |
|-------|---------|-----------|
| `session` | Express session storage | `sid` (PK), `sess` (JSON), `expire` |
| `users` | User accounts | `id` (auto), `google_id` (unique), `email`, `name`, `picture`, `isadmin` |
| `rides` | Ride offerings | `rideID`, `createdBy` (FK→users), `source`, `destination`, `date` **(VARCHAR)**, `time` **(VARCHAR)**, `seatsAvailable`, `totalSeats`, `totalCost`, `vehicleType`, `rideStatus` |
| `requests` | Join requests | `id`, `rideID` (FK), `createdBy`, `requestBy` (FK→users), `rideStatus`, `requestStatus`. Unique on `[rideID, requestBy]` |
| `groupChat` | Chat messages | `id`, `rideID` (FK), `rideOwner` **(redundant)**, `messageBy` (FK→users), `message`, `messageTime` **(VARCHAR)**, `messageDate` **(VARCHAR)** |

### Schema Issues

1. **`date` and `time` are VARCHAR** — Forces raw SQL with `::date::interval` casting. Should be a single `DateTime` column.
2. **`rideStatus`/`requestStatus`/`vehicleType` are VARCHAR strings, not enums** — No DB-level constraint.
3. **`requests.createdBy` is redundant** — Duplicates `rides.createdBy` and must stay in sync manually.
4. **`groupChat.rideOwner` is redundant** — Stores sender name as VARCHAR (duplicates `users.name`).
5. **No `role` column on users** — `isadmin` is a nullable boolean. No `rider`/`driver` distinction.
6. **All FKs use `onDelete: Cascade`** — Deleting a user silently cascades to all their rides/requests/chats.

---

## 6. Domain Features Inventory

| Feature | Backend | Frontend | Status |
|---------|---------|----------|--------|
| Google OAuth Login | `loginController.ts` | `SignIn.tsx` → `authService.ts` | ✅ Working |
| Session Auth | `authMiddleware.ts` + `PrismaStore` | `AuthProvider.tsx` + `ProtectedRoute.tsx` | ✅ Working |
| Ride Search (paginated, filtered) | `rideService.searchAvailableRides()` | `Find.tsx` + `useRideSearch.ts` | ✅ Working |
| Ride Create | `rideService.addNewlyCreatedRide()` | `Offer.tsx` | ✅ Working |
| Ride Cancel (owner only) | `rideService.cancelRide()` | `Profile.tsx` | ✅ Working |
| Ride Leave (member only) | `rideService.leaveRide()` | `Profile.tsx` | ✅ Working |
| Auto-Complete Expired Rides | `rideService.completeExpiredRides()` (raw SQL) | — | ✅ Working (lazy) |
| Join Request | `requestService.handleUserSentRequest()` | `BookRide.tsx` | ✅ Working |
| Accept/Reject Request | `requestService.handleUserReceivedRequest()` | `Profile.tsx` | ✅ Working |
| Sent/Received Requests | `requestService.getSent/ReceivedRequests()` | `Profile.tsx` | ✅ Working |
| Group Chat (Socket.IO) | `chat.ts` + `chatService.ts` | `RideChat.tsx` + `Chats.tsx` | ✅ Working |
| Ride Group Members | `rideService.getRideGroup()` | `GroupMembers.tsx` | ✅ Working |
| User Profile | `userController.getUserProfile()` | `Profile.tsx` | ✅ Working |
| Contact Form (email) | `supportService.sendContactEmail()` | `Contact.tsx` | ✅ Working |
| Admin Panel | ❌ Not implemented | ❌ Not implemented | 🔲 Stub only |
| Driver/Rider roles | ❌ Not implemented | ❌ Not implemented | 🔲 Missing |
| Payments | ❌ Not implemented | ❌ Not implemented | 🔲 Missing |
| Ratings/Reviews | ❌ Not implemented | ❌ Not implemented | 🔲 Missing |

---

## 7. Security & Quality Problems

### 🔴 Critical

| # | Issue | Location | Risk |
|---|-------|----------|------|
| 1 | **Secrets possibly in git history** | `git log --all -- "*.env"` shows 5 historical commits touching env files | Credential leak — keys should be rotated |
| 2 | **No rate limiting on any endpoint** | All routes (especially `/auth/google*`) | DoS, brute-force, OAuth callback abuse |
| 3 | **No CSRF protection beyond SameSite** | `SameSite=None` in production (cross-site cookies) | CSRF on state-mutating endpoints |

### 🟠 High

| # | Issue | Location | Risk |
|---|-------|----------|------|
| 4 | **Session not regenerated after login** | `loginController.ts:94` (session.save after setting user) | Session fixation attack |
| 5 | **No input sanitization on chat** | `chat.ts:82` (message.trim().slice(0, 2000)) | XSS if frontend renders raw HTML |
| 6 | **Refresh token stored but never refreshed** | `loginController.ts:87` | Sessions silently expire when Google access token expires |
| 7 | **Hardcoded CORS/Socket.IO origin lists** | `app.ts:33-38`, `socket-config.ts:11-16` | New domains require code changes, not just config |

### 🟡 Medium

| # | Issue | Location | Risk |
|---|-------|----------|------|
| 8 | **`isAdmin` middleware exported but never mounted** | `authMiddleware.ts:14` | Admin flag in DB has no effect |
| 9 | **`completeExpiredRides()` called on every request** | `rideService.ts` (5 call sites) | Raw SQL execution on every ride/request operation |
| 10 | **No HTTP request logging middleware** | Missing | Hard to debug production issues |
| 11 | **Duplicated `createError` helper** | `rideService.ts:8`, `requestService.ts:8` | Should be in `utils/` |
| 12 | **`supportController.ts` uses manual validation** | `supportController.ts:17-27` | Inconsistent with Zod pattern used elsewhere |
| 13 | **`asyncHandler` wraps `Function` type** | `asyncHandler.ts:6` | Loses TypeScript type safety |
| 14 | **`types/` directory is empty** | `src/types/` | Dead folder |
| 15 | **No pagination on requests endpoints** | `requestService.ts:117-143` | Could be slow for power users |

---

## 8. Existing Tests

| Test File | What It Tests | Type |
|-----------|--------------|------|
| `env.jest.test.ts` | Env config loads, `port`/`nodeEnv`/`allowedDomains` are present | Unit (smoke) |
| `rideLifecycle.jest.test.ts` | `leaveRide()` releases seat; duplicate leave throws | Unit (mocked Prisma) |
| `rideSchemas.jest.test.ts` | Zod create/search schemas; `buildAvailableRideWhere`; `getPagination` | Unit (pure) |

**Gaps:** No tests for auth flow, `requestService`, `chatService`, `supportService`, or any HTTP integration tests.

---

## 9. Roles Analysis

| Role | Current State | Action |
|------|--------------|--------|
| **user** | All authenticated users — can create AND join rides | Keep as default |
| **admin** | `isadmin` column exists, `isAdmin` middleware exported, but **never enforced** | Wire up in Phase 4 |
| **rider** | Not distinguished from driver at the data or permission level | **Decision needed ↓** |
| **driver** | Not distinguished | **Decision needed ↓** |

> ⚠️ **Decision needed:** Do you want to introduce separate `rider` and `driver` roles with different permissions? Currently all users can both offer and join rides. Better Auth supports role plugins natively, so this is easy to add — but it would require a data migration (assigning roles to existing users).

---

## 10. Current vs. Reference Gap Table

| Category | Current | Reference | Action Needed |
|----------|---------|-----------|--------------|
| File naming | `camelCase` controllers/routes | `kebab-case` (`.controller.ts`, `.routes.ts`) | Rename in Phase 3 |
| Entry point | `index.ts` (root, outside `src/`) | `src/server.ts` | Move in Phase 3 |
| Auth library | Google OAuth + express-session (hand-rolled) | Clerk → **Better Auth (our target)** | Replace in Phase 4 |
| Request logger | None | `requestLogger` middleware | Add in Phase 3 |
| Rate limiting | None | Redis-backed `express-rate-limit` | Add in Phase 5 |
| Error handler | Zod + statusCode + 500 | Zod + Prisma errors + statusCode | Enhance in Phase 3 |
| Services layer | Present ✅ | Not present (controllers → Prisma) | **Keep current** (better) |
| Centralized config | `env.ts` with fail-fast ✅ | `dotenv.config()` inline | **Keep current** (better) |
| Logging | Winston ✅ | `console.log` | **Keep current** (better) |
| Existing tests | 3 unit test files | None | Expand in Phase 2 |
| Docker | None | Dockerfile + docker-compose | Optional |

---

## 11. Frontend Auth Chain (for Phase 4 Better Auth migration)

The auth chain currently flows through 7 files:

```
SignIn.tsx
  → authService.redirectToGoogleLogin()
    → window.location.href = backendUrl + /auth/google

AuthProvider.tsx  (mounts on every page load)
  → checkAuthStatus()
    → authService.checkAuthStatus()
      → authApi.getAuthStatus()
        → axiosInstance.get("/auth/status")
          → backend: req.session.user → { isAuthenticated, user }

ProtectedRoute.tsx
  → useAuth() → isAuthenticated → Outlet or <Navigate to="/signin" />

axiosInstance.ts (401 interceptor)
  → non-/auth/status 401 → window.location.href = /signin
```

With Better Auth, this entire chain changes:
- The frontend will use `better-auth/react` client (`useSession()` hook replaces `useAuth()`)
- `AuthProvider` will wrap Better Auth's `SessionProvider`
- The OAuth redirect will be handled by Better Auth's client (`signIn.social({ provider: "google" })`)
- `axiosInstance` will no longer need the 401 interceptor (Better Auth manages session refresh)
- `ProtectedRoute` will use `useSession()` instead of `useAuth()`

---

*Phase 0 complete — no code changed. Proceeding to write `docs/AUDIT.md` to the workspace.*
