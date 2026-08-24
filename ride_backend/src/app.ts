import express from "express";
import session from "express-session";
import cors from "cors";
import { env } from "./config/env.js";
import { PrismaStore } from "./config/prismaStore.js";
import apiRoutes from "./routes/index.js";
import loginRoutes from "./routes/loginRoutes.js";
import { authenticate } from "./middleware/authMiddleware.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

// Extend the express-session types so TypeScript knows about req.session.user
declare module "express-session" {
  interface SessionData {
    user: {
      id: number;
      googleId: string;
      email: string;
      name: string | null;
      picture: string | null;
      isAdmin: boolean | null;
    };
    refreshToken?: string;
  }
}

const app = express();

// Trust the first reverse proxy (needed for secure cookies on Render/Railway)
if (env.cookieSecure) app.set("trust proxy", 1);

// Allow requests from the frontend origin with cookies
app.use(cors({ origin: env.frontendUrl, credentials: true }));

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

// Session middleware — stores session data in the "session" table via Prisma
const sessionMiddleware = session({
  name: "rideshare.sid",
  rolling: true, // reset expiry on every request (keeps active users logged in)
  secret: env.sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: new PrismaStore(),
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    secure: env.cookieSecure,
    httpOnly: true,               // JS on the page cannot read this cookie
    sameSite: env.cookieSameSite, // CSRF protection
  },
});

app.use(sessionMiddleware);

// Expose session middleware on app.locals so Socket.IO can share it
// (Socket.IO needs the same session to identify who is sending a chat message)
app.locals.sessionMiddleware = sessionMiddleware;

app.get("/health", (_req, res) => res.json({ status: "OK" }));

// Public auth routes (login, callback, logout, status) — no auth required
app.use("/auth", loginRoutes);

// All routes below this line require a valid session
app.use(authenticate);
app.use(apiRoutes);

// Catch-all for unmatched routes
app.use((_req, res) => res.status(404).json({ success: false, message: "Route not found" }));

// Centralised error handler — receives errors via next(error)
app.use(errorHandler);

export default app;

