import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { bearer } from "better-auth/plugins";
import { createAuthMiddleware } from "better-auth/api";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { syncUserWithApp } from "../services/userService.js";

/**
 * Better Auth instance configured for Token-Based (Bearer) authentication.
 * Docs:
 *  - Express: https://better-auth.com/docs/integrations/express
 *  - Prisma:  https://better-auth.com/docs/adapters/prisma
 *  - Google:  https://better-auth.com/docs/authentication/google
 *  - Bearer:  https://better-auth.com/docs/plugins/bearer
 */
export const auth = betterAuth({
  baseURL: env.betterAuthUrl,
  secret: env.betterAuthSecret,

  // Token-based authentication plugin
  plugins: [
    bearer(),
  ],

  // Prisma adapter connected to PostgreSQL
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // Domain allowlist check per Better Auth 1.7 docs
  user: {
    validateUserInfo: ({ user, source }) => {
      if (source.oauth?.providerId !== "google") return;
      const emailDomain = user.email?.split("@")[1]?.toLowerCase();
      if (!emailDomain || !env.allowedDomains.includes(emailDomain)) {
        logger.warn(`Login blocked — domain not allowed: ${user.email}`);
        return {
          error: "email_not_allowed",
          errorDescription: "Only institute email domains are allowed to sign in",
        };
      }
    },
  },

  // Google OAuth configuration
  socialProviders: {
    google: {
      clientId: env.googleClientId,
      clientSecret: env.googleClientSecret,
      prompt: "select_account",
    },
  },

  // 7-day token expiration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
    updateAge: 60 * 60 * 24,     // refresh if older than 1 day
  },

  // Trusted origins for CORS
  trustedOrigins: [
    env.frontendUrl,
    "https://ride-sharing-website.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
  ],

  // Hooks to sync user with existing app table and pass token to frontend on OAuth redirect
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path.startsWith("/callback")) {
        const newSession = ctx.context.newSession;
        if (newSession?.session?.token && newSession.user) {
          try {
            await syncUserWithApp(newSession.user);
          } catch (syncErr) {
            logger.error("Failed to sync user with app database:", syncErr);
          }

          // In token-based auth, redirect back to frontend with the Bearer token in the URL query
          const redirectUrl = new URL(`${env.frontendUrl}/auth/callback`);
          redirectUrl.searchParams.set("token", newSession.session.token);
          throw ctx.redirect(redirectUrl.toString());
        }
      }
    }),
  },
});

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
