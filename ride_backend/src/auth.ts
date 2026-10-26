import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { isAllowedGoogleUser } from "./auth-policy.js";

export const auth = betterAuth({
  appName: "RideShare",
  baseURL: env.authBaseUrl,
  basePath: "/api/auth",
  secret: env.betterAuthSecret,
  trustedOrigins: env.trustedOrigins,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  socialProviders: {
    google: {
      clientId: env.googleClientId,
      clientSecret: env.googleClientSecret,
      prompt: "select_account",
    },
  },
  user: {
    modelName: "users",
    fields: { image: "picture" },
    validateUserInfo: ({ user, source }) => {
      if (source.oauth?.providerId !== "google") return;
      if (!isAllowedGoogleUser(user.email)) {
        return {
          error: "email_not_allowed",
          errorDescription: "Use an allowed student email address to sign in.",
        };
      }
    },
  },
  session: {
    modelName: "authSession",
    expiresIn: 7 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  account: {
    encryptOAuthTokens: true,
    accountLinking: {
      enabled: true,
      disableImplicitLinking: true,
      trustedProviders: ["google"],
      allowDifferentEmails: false,
    },
  },
  rateLimit: {
    enabled: env.nodeEnv === "production",
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/social": { window: 60, max: 5 },
      "/callback/google": { window: 60, max: 10 },
    },
  },
  advanced: {
    useSecureCookies: env.cookieSecure,
    defaultCookieAttributes: {
      httpOnly: true,
      secure: env.cookieSecure,
      sameSite: env.cookieSameSite,
    },
    database: {
      generateId: ({ model }) =>
        model === "user" || model === "users" ? false : crypto.randomUUID(),
    },
  },
});
