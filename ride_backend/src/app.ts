import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { env } from "./config/env.js";
import apiRoutes from "./routes/index.js";
import loginRoutes from "./routes/loginRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import { authenticate } from "./middleware/authMiddleware.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import { allowedOrigins } from "./config/origins.js";
import { loginRateLimit, apiRateLimit } from "./middleware/rateLimits.js";

const app = express();
app.disable("x-powered-by");
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Cache-Control", "no-store");
  next();
});

if (env.cookieSecure) app.set("trust proxy", 1);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/+$/, "");
      if (allowedOrigins.has(cleanOrigin)) {
        return callback(null, origin);
      }
      return callback(Object.assign(new Error("Origin not allowed by CORS"), { statusCode: 403 }));
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["set-auth-token"],
  })
);

// Better Auth endpoint — mounts all Better Auth APIs (Express v5 uses *splat)
app.use("/api/auth/sign-in", loginRateLimit);
app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

app.get("/health", (_req, res) => res.json({ status: "OK" }));

// Public routes (login bridge, callback, logout, status, support)
app.use("/auth", loginRoutes);
app.use(supportRoutes);

// Protected API routes — require Bearer token
app.use(authenticate);
app.use(apiRateLimit);
app.use(apiRoutes);

// Catch-all for unmatched routes
app.use((_req, res) => res.status(404).json({ success: false, message: "Route not found" }));

// Centralized error handler
app.use(errorHandler);

export default app;
