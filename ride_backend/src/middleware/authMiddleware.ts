import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";
import { syncUserWithApp } from "../services/userService.js";
import { logger } from "../config/logger.js";

export interface AppCurrentUser {
  id: number;
  googleId: string;
  email: string;
  name: string | null;
  picture: string | null;
  isAdmin: boolean;
  authId: string;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: AppCurrentUser;
      user?: AppCurrentUser;
      session: {
        user: AppCurrentUser;
        [key: string]: any;
      };
    }
  }
}

/**
 * Token-based authenticate middleware (Bearer token).
 * Validates the token with Better Auth, resolves/syncs the database user,
 * and attaches currentUser to the request.
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      res.status(401).json({ message: "Unauthorized: Missing or invalid token" });
      return;
    }

    const appUser = await syncUserWithApp(session.user);
    if (!appUser) {
      res.status(401).json({ message: "Unauthorized: User not found in database" });
      return;
    }

    const currentUser: AppCurrentUser = {
      id: appUser.id,
      googleId: appUser.google_id,
      email: appUser.email,
      name: appUser.name,
      picture: appUser.picture,
      isAdmin: appUser.isadmin ?? false,
      authId: session.user.id,
    };

    req.currentUser = currentUser;
    req.user = currentUser;
    req.session = { user: currentUser };

    next();
  } catch (err) {
    logger.error("Authentication middleware error:", err);
    res.status(401).json({ message: "Authentication failed" });
  }
};

/**
 * isAdmin middleware.
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.currentUser?.isAdmin) {
    res.status(403).json({ message: "Forbidden: Admins only" });
    return;
  }
  next();
};
