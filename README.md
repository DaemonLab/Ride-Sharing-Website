# 🚗 Campus Ride-Sharing Platform

A modern, secure, full-stack campus ride-sharing and carpooling web application built for college communities (IIT Indore). Students can offer rides, find existing carpools, manage join requests with real-time feedback, and communicate in dedicated group chats.

---

## 🌟 Key Features

- **🔐 Domain-Restricted Google OAuth 2.0**: Ensures only verified institutional emails (`@iiti.ac.in`) can sign up and access the platform.
- **🛡️ Server-Side Session Management**: Stateful session persistence backed by PostgreSQL (`session` table) with HTTP-only, SameSite cookies.
- **⚡ Atomic Ride Request Lifecycle**: Prevents race conditions and over-booking using Prisma database transactions (`prisma.$transaction`).
  - Strict re-request guards against spamming after rejection or leaving.
  - Real-time seat decrement on approval.
- **💬 Real-Time Ride Group Chat**: WebSockets via **Socket.IO** shared over the same authenticated Express session.
- **🔍 Smart Search & Filtering**: Multi-criteria search (origin, destination, date, time window) with client-side and server-side filtering.
- **📱 Responsive, Modern UI**: Designed with glassmorphism aesthetics, TailwindCSS, and fluid tab animations using Framer Motion.
- **📧 Contact & Support System**: Automated dual-email delivery (inquiry notification to admin + auto-reply confirmation to student) powered by Nodemailer.

---

## 🏗️ Architecture & Project Structure

The project follows clean separation of concerns with layered architecture:

```
Ride-Sharing-Website/
├── ride_backend/                 # Node.js + Express + TypeScript Backend
│   ├── prisma/
│   │   └── schema.prisma         # Prisma ORM Schema & PostgreSQL Models
│   ├── src/
│   │   ├── config/               # Env validation, Logger (Winston), Prisma, Socket.IO
│   │   ├── controllers/          # Request handlers & HTTP responses
│   │   ├── middleware/           # Auth guard, Error handling, Session middleware
│   │   ├── routes/               # Modular Express route registries
│   │   ├── services/             # Core business logic & database queries
│   │   ├── utils/                # Async handler wrappers, domain validator
│   │   ├── validation/           # Zod input schemas for runtime validation
│   │   ├── app.ts                # Express app setup & middleware pipeline
│   │   ├── chat.ts               # Socket.IO event handlers
│   │   └── server.ts             # HTTP server & WebSocket bootstrap
│   └── test/                     # Jest test suites
│
└── ride_frontend/                # React 18 + Vite + TypeScript Frontend
    ├── src/
    │   ├── api/                  # Axios HTTP client calls & response normalization
    │   ├── components/           # Reusable UI components (Modals, Pickers, Chat)
    │   ├── hooks/                # Custom React hooks (useAuth, useRides, useRideRequests)
    │   ├── pages/                # Route views (Home, Find, Offer, Profile, Chat, BookRide)
    │   ├── services/             # Frontend service abstraction layer
    │   ├── types/                # Shared TypeScript interfaces & types
    │   └── App.tsx               # Root component & route definitions
```

---

## 🗄️ Database Schema

Managed via **Prisma ORM** on PostgreSQL:

```mermaid
erDiagram
    users ||--o{ rides : "creates"
    users ||--o{ requests : "sends"
    users ||--o{ groupChat : "sends"
    rides ||--o{ requests : "has"
    rides ||--o{ groupChat : "contains"

    users {
        int id PK
        string google_id UK
        string email
        string name
        string picture
        boolean isadmin
    }

    rides {
        int rideID PK
        int createdBy FK
        string source
        string destination
        string date
        string time
        int seatsAvailable
        int totalSeats
        float totalCost
        string vehicleType
        string rideStatus
    }

    requests {
        int id PK
        int rideID FK
        int createdBy
        int requestBy FK
        string rideStatus
        string requestStatus
    }

    groupChat {
        int id PK
        int rideID FK
        int messageBy FK
        string rideOwner
        string message
        string messageTime
        string messageDate
    }

    session {
        string sid PK
        json sess
        datetime expire
    }
```

---

## 🔌 API Endpoints Summary

### Authentication (`/auth`)
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/auth/google` | No | Initiates Google OAuth flow |
| `GET` | `/auth/google/callback` | No | Handles OAuth callback & session creation |
| `GET` | `/auth/status` | No | Returns authenticated user session info |
| `POST` | `/auth/logout` | Yes | Destroys session and clears cookie |

### Rides (`/rides`)
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/rides/availableRides` | Yes | Get all active, future rides with available seats |
| `POST` | `/rides/filteredAvailableRides` | Yes | Search rides matching source/dest/date/time |
| `POST` | `/rides/addRide` | Yes | Post a new ride offering |
| `GET` | `/rides/upcomingRides` | Yes | Get pending rides user created or joined |
| `GET` | `/rides/completedRides` | Yes | Get completed past rides |
| `GET` | `/rides/:rideID/group` | Yes | Fetch confirmed group members for a ride |
| `POST` | `/rides/:rideID/cancel` | Yes | Cancel ride (Ride Owner only) |
| `POST` | `/rides/:rideID/leave` | Yes | Leave ride & release seat (Passenger only) |

### Join Requests (`/request`)
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/request/sendRequest` | Yes | Submit request to join a ride |
| `POST` | `/request/handleRequest` | Yes | Accept or reject request (Ride Owner only) |
| `GET` | `/request/requestsSent` | Yes | List pending requests sent by user |
| `GET` | `/request/requestsReceived` | Yes | List pending requests on user's rides |

### Support & Contact
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/contact` | No | Submit contact/support message |
| `GET` | `/health` | No | Health check endpoint |

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js (ES Modules)
- **Language**: TypeScript
- **Framework**: Express.js
- **Database / ORM**: PostgreSQL + Prisma ORM
- **Session Store**: Prisma session store (`express-session`)
- **Real-Time Communication**: Socket.IO
- **Validation**: Zod
- **Email Service**: Nodemailer
- **Testing**: Jest + ts-jest

### Frontend
- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Routing**: React Router v7
- **Styling**: TailwindCSS + Vanilla CSS (Glassmorphism)
- **Animations**: Framer Motion + Lucide React icons
- **State & HTTP**: Custom React Hooks + Axios

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL database
- Google Cloud Console OAuth 2.0 Credentials
- Gmail App Password (for Nodemailer support emails)

---

### 1. Clone the Repository
```bash
git clone https://github.com/DaemonLab/Ride-Sharing-Website.git
cd Ride-Sharing-Website
```

---

### 2. Backend Setup
```bash
cd ride_backend
npm install
```

Create `.env` inside `ride_backend/`:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://username:password@localhost:5432/rideshare?schema=public"
DATABASE_SSL=false
SESSION_SECRET="your-super-secure-session-secret"
FRONTEND_URL="http://localhost:5173"
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
REDIRECT_URL="http://localhost:3000/auth/google/callback"
ALLOWED_DOMAINS="iiti.ac.in,gmail.com"
EMAIL_USER_SENDER="your-email@gmail.com"
EMAIL_APP_PASSWORD="your-app-password"
EMAIL_USER_RECEIVER="admin-support@rideshare.com"
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
```

Run database migrations:
```bash
npm run prisma:migrate
npm run prisma:generate
```

Start the backend server:
```bash
npm run dev
```

---

### 3. Frontend Setup
```bash
cd ../ride_frontend
npm install
```

Create `.env` inside `ride_frontend/`:
```env
VITE_BACKEND_URL="http://localhost:3000"
```

Start Vite development server:
```bash
npm run dev
```

The frontend will run at `http://localhost:5173`.

---

## 🧪 Testing

Run backend Jest test suites:
```bash
cd ride_backend
npm test
```

Type-check both workspaces:
```bash
# Backend
cd ride_backend && npm run typecheck

# Frontend
cd ride_frontend && npm run build
```

---

## 🛡️ Security & Reliability Highlights

1. **Zero Client Trust for Identity**: All user identities are resolved on the server from `req.session.user.id`. The frontend cannot spoof identity in request bodies.
2. **Atomic Concurrency**: Transactions prevent race conditions during concurrent ride booking requests.
3. **HTTP-only Cookies**: Protect session identifiers from cross-site scripting (XSS) extraction.
4. **Input Validation**: All incoming requests pass strict Zod schemas before hitting business logic.
