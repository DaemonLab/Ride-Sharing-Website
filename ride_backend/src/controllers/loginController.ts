import { Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";
import { logger } from "../config/logger.js";
import { env } from "../config/env.js";

/**
 * GET /auth/google — initiates Google OAuth via Better Auth and redirects to Google consent screen
 */
export const loginRedirect = async (_req: Request, res: Response): Promise<void> => {
  try {
    const callbackURL = `${env.frontendUrl}/auth/callback`;
    const result = await auth.api.signInSocial({
      body: {
        provider: "google",
        callbackURL,
      },
    });

    if (result?.url) {
      res.redirect(result.url);
    } else {
      res.redirect(`${env.frontendUrl}/signin?status=error&message=${encodeURIComponent("Failed to initiate Google sign-in")}`);
    }
  } catch (err) {
    logger.error("Error initiating Google sign-in:", err);
    res.redirect(`${env.frontendUrl}/signin?status=error&message=${encodeURIComponent("Authentication error")}`);
  }
};

/**
 * GET /auth/google/callback — forward to Better Auth Google callback handler
 */
export const googleCallback = (req: Request, res: Response) => {
  const queryString = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  res.redirect(`${env.betterAuthUrl}/api/auth/callback/google${queryString}`);
};

/**
 * GET /auth/status — returns current auth status using token-based session
 */
export const getStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      res.status(401).json({ isAuthenticated: false, user: null });
      return;
    }

    res.status(200).json({
      isAuthenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        picture: session.user.image ?? null,
        isAdmin: (session.user as any).isAdmin ?? false,
      },
    });
  } catch (err) {
    logger.error("Error in getStatus:", err);
    res.status(401).json({ isAuthenticated: false, user: null });
  }
};

/**
 * POST /auth/logout — revoke session/token via Better Auth
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    await auth.api.signOut({
      headers: fromNodeHeaders(req.headers),
    });
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    logger.error("Logout error:", err);
    res.status(500).json({ success: false, error: "Logout failed" });
  }
};
