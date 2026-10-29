import { env } from "./env.js";

// Keep HTTP, OAuth, and WebSocket origin checks consistent.
export const allowedOrigins = new Set([
  env.frontendUrl,
  ...(env.nodeEnv === "production" ? [] : [
    "http://localhost:5173", "http://localhost:3000",
    "http://127.0.0.1:5173", "http://127.0.0.1:3000",
  ]),
]);
