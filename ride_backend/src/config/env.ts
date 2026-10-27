import "dotenv/config";

// Check that all required env variables exist at startup.
const required = [
  "DATABASE_URL",
  "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET",
  "FRONTEND_URL", "ALLOWED_DOMAINS",
  "EMAIL_USER_SENDER", "EMAIL_APP_PASSWORD", "EMAIL_USER_RECEIVER",
];

for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required env variable: ${key}`);
}

const port = Number(process.env.PORT || process.env.SERVER_PORT) || 3000;
const betterAuthUrl = process.env.BETTER_AUTH_URL || `http://localhost:${port}`;
const betterAuthSecret = process.env.BETTER_AUTH_SECRET || process.env.SESSION_SECRET;

if (!betterAuthSecret) {
  throw new Error("Missing required env variable: BETTER_AUTH_SECRET (or SESSION_SECRET)");
}

export const env = {
  port,
  nodeEnv:            process.env.NODE_ENV || "development",
  databaseUrl:        process.env.DATABASE_URL!,
  databaseSsl:        process.env.DATABASE_SSL !== "false",
  // Better Auth (v1.7) — token-based auth
  betterAuthUrl,
  betterAuthSecret,
  frontendUrl:        (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, ""),
  googleClientId:     process.env.GOOGLE_CLIENT_ID!,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  allowedDomains:     process.env.ALLOWED_DOMAINS!.split(",").map(d => d.trim().toLowerCase()).filter(Boolean),
  emailSender:        process.env.EMAIL_USER_SENDER!,
  emailPassword:      process.env.EMAIL_APP_PASSWORD!,
  emailReceiver:      process.env.EMAIL_USER_RECEIVER!,
  cookieSecure:       process.env.COOKIE_SECURE === "true",
  cookieSameSite:     (process.env.COOKIE_SAME_SITE || "lax") as "lax" | "strict" | "none",
};

if (env.nodeEnv === "production" && !env.cookieSecure) {
  throw new Error(
    "COOKIE_SECURE must be set to 'true' in production. " +
    "Add COOKIE_SECURE=true to your environment variables."
  );
}
