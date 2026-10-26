import "dotenv/config";
import { createHash } from "node:crypto";

// Check that all required env variables exist at startup.
// If any are missing, the server crashes immediately with a clear message
// instead of failing silently later when the variable is first used.
const required = [
  "DATABASE_URL",
  "SESSION_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "REDIRECT_URL",
  "FRONTEND_URL",
  "ALLOWED_DOMAINS",
  "EMAIL_USER_SENDER",
  "EMAIL_APP_PASSWORD",
  "EMAIL_USER_RECEIVER",
];

for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required env variable: ${key}`);
}

const configuredAuthSecret = process.env.BETTER_AUTH_SECRET;
if (configuredAuthSecret && configuredAuthSecret.length < 32) {
  throw new Error("BETTER_AUTH_SECRET must be at least 32 characters long.");
}
const betterAuthSecret =
  configuredAuthSecret ||
  createHash("sha256").update(`rideshare-better-auth:${process.env.SESSION_SECRET}`).digest("hex");
const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");
const trustedOrigins = [
  frontendUrl,
  "https://ride-sharing-website.vercel.app",
  ...(process.env.NODE_ENV === "production" ? [] : ["http://localhost:5173"]),
  ...(process.env.TRUSTED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, "")),
].filter(Boolean);

// Single env object — import this wherever you need config values.
// No need to call getEnvironment() everywhere.
export const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL!,
  databaseSsl: process.env.DATABASE_SSL !== "false",
  sessionSecret: process.env.SESSION_SECRET!,
  betterAuthSecret,
  frontendUrl,
  googleClientId: process.env.GOOGLE_CLIENT_ID!,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUrl: process.env.REDIRECT_URL!,
  allowedDomains: process.env.ALLOWED_DOMAINS!.split(",").map((d) => d.trim()),
  authBaseUrl: (process.env.BETTER_AUTH_URL || new URL(process.env.REDIRECT_URL!).origin).replace(
    /\/+$/,
    "",
  ),
  trustedOrigins: [...new Set(trustedOrigins)],
  emailSender: process.env.EMAIL_USER_SENDER!,
  emailPassword: process.env.EMAIL_APP_PASSWORD!,
  emailReceiver: process.env.EMAIL_USER_RECEIVER!,
  cookieSecure: process.env.COOKIE_SECURE === "true",
  cookieSameSite: (process.env.COOKIE_SAME_SITE || "lax") as "lax" | "strict" | "none",
};

// Fail fast in production if the session cookie would be sent over plain HTTP.
// COOKIE_SECURE is not in the `required` array above because it legitimately
// defaults to false in local development — but it must be true in production.
if (env.nodeEnv === "production" && !env.cookieSecure) {
  throw new Error(
    "COOKIE_SECURE must be set to 'true' in production. " +
      "Add COOKIE_SECURE=true to your environment variables.",
  );
}

// When the frontend and backend are on different domains (Vercel + Render),
// session cookies require SameSite=None. Without it, browsers silently block
// the cookie on cross-origin requests and every /auth/status call returns 401.
if (env.nodeEnv === "production" && env.cookieSameSite !== "none") {
  throw new Error(
    "COOKIE_SAME_SITE must be set to 'none' in production when frontend and backend " +
      "are on different domains (e.g. Vercel + Render). " +
      "Add COOKIE_SAME_SITE=none to your environment variables.",
  );
}
