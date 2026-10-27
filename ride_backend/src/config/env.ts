import "dotenv/config";
import { validateDeploymentConfig } from "./deployment.js";

// Check that all required env variables exist at startup.
const required = [
  "DATABASE_URL",
  "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET",
  "FRONTEND_URL", "ALLOWED_DOMAINS",
  "EMAIL_USER_SENDER", "EMAIL_APP_PASSWORD", "EMAIL_USER_RECEIVER",
];

for (const key of required) {
  if (!process.env[key]?.trim()) throw new Error(`Missing required env variable: ${key}`);
}

const deployment = validateDeploymentConfig(process.env);

export const env = {
  ...deployment,
  databaseUrl:        process.env.DATABASE_URL!,
  databaseSsl:        process.env.DATABASE_SSL !== "false",
  // Better Auth (v1.7) — token-based auth
  googleClientId:     process.env.GOOGLE_CLIENT_ID!,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  emailSender:        process.env.EMAIL_USER_SENDER!,
  emailPassword:      process.env.EMAIL_APP_PASSWORD!,
  emailReceiver:      process.env.EMAIL_USER_RECEIVER!,
  cookieSameSite:     (process.env.COOKIE_SAME_SITE || "lax") as "lax" | "strict" | "none",
};
