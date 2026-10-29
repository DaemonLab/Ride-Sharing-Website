import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { bearer } from "better-auth/plugins";
import { createAuthMiddleware } from "better-auth/api";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { allowedOrigins } from "../config/origins.js";

/**
 * Better Auth instance using HttpOnly cookie sessions.
 * Single source of truth: Better Auth's `User` model is the only user model.
 */
export const auth = betterAuth({
  baseURL: env.betterAuthUrl,
  secret: env.betterAuthSecret,

  plugins: [bearer()],

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  user: {
    additionalFields: {
      isAdmin: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
    validateUserInfo: ({ user, source }) => {
      if (source.oauth?.providerId !== "google") return;
      const emailDomain = user.email?.split("@")[1]?.toLowerCase();
      if (!user.emailVerified || !emailDomain || !env.allowedDomains.includes(emailDomain)) {
        logger.warn(`Login blocked — domain not allowed: ${user.email}`);
        return {
          error: "email_not_allowed",
          errorDescription: "Only institute email domains are allowed to sign in",
        };
      }
    },
  },

  socialProviders: {
    google: {
      clientId: env.googleClientId,
      clientSecret: env.googleClientSecret,
      prompt: "select_account",
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
    updateAge: 60 * 60 * 24,     // refresh if older than 1 day
  },

  trustedOrigins: [...allowedOrigins],


  advanced: {
    // OAuth starts with a top-level backend visit. Lax cookies are sent on
    // Google's top-level GET callback without relying on third-party cookies.
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: new URL(env.betterAuthUrl).protocol === "https:",
    },
  },

  onAPIError: {
    errorURL: `${env.frontendUrl}/signin?message=Google+sign-in+failed.+Please+try+again.`,
  },

  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path.startsWith("/callback")) {
        const token = ctx.context.newSession?.session?.token;
        if (token) {
          const redirectUrl = new URL(`${env.frontendUrl}/auth/callback`);
          // URL fragments are not sent to web servers or in Referer headers.
          redirectUrl.hash = new URLSearchParams({ token }).toString();
          throw ctx.redirect(redirectUrl.toString());
        }
      }
    }),
  },

});

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
