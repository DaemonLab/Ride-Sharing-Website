import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { bearer } from "better-auth/plugins";
import { createAuthMiddleware } from "better-auth/api";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

/**
 * Better Auth instance configured for Token-Based (Bearer) authentication.
 * Single source of truth: Better Auth's `User` model is the only user model.
 */
export const auth = betterAuth({
  baseURL: env.betterAuthUrl,
  secret: env.betterAuthSecret,

  plugins: [
    bearer(),
  ],

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
      if (!emailDomain || !env.allowedDomains.includes(emailDomain)) {
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

  trustedOrigins: [
    env.frontendUrl,
    "https://ride-sharing-website.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
  ],

  advanced: {
    // In production (Vercel → Render), frontend and backend are on different domains.
    // OAuth state cookies must be SameSite=None; Secure so the browser sends them
    // on the cross-site Google → backend callback redirect.
    // In development (localhost) we fall back to Lax which works fine same-site.
    cookies: {
      session_token: {
        attributes: {
          sameSite: (env.nodeEnv === "production" ? "none" : "lax") as "none" | "lax",
          secure: env.cookieSecure,
        },
      },
    },
    crossSubdomainCookies: {
      enabled: false,
    },
  },

  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path.startsWith("/callback")) {
        const newSession = ctx.context.newSession;
        if (newSession?.session?.token) {
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
