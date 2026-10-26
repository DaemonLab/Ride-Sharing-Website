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

const app = express();

if (env.cookieSecure) app.set("trust proxy", 1);

// Allowed origins for CORS
const allowedOrigins = new Set([
  env.frontendUrl,
  "https://ride-sharing-website.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/+$/, "");
      if (allowedOrigins.has(cleanOrigin) || cleanOrigin.endsWith(".vercel.app")) {
        return callback(null, origin);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["set-auth-token"],
  })
);

// Better Auth endpoint — mounts all Better Auth APIs (Express v5 uses *splat)
app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

app.get("/health", (_req, res) => res.json({ status: "OK" }));

// Public routes (login bridge, callback, logout, status, support)
app.use("/auth", loginRoutes);
app.use(supportRoutes);

// Protected API routes — require Bearer token
app.use(authenticate);
app.use(apiRoutes);

// Catch-all for unmatched routes
app.use((_req, res) => res.status(404).json({ success: false, message: "Route not found" }));

// Centralized error handler
app.use(errorHandler);

export default app;
