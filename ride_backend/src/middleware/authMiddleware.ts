import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";
import { logger } from "../config/logger.js";

export interface AppCurrentUser {
  id: string;
  email: string;
  name: string;
  picture: string | null;
  isAdmin: boolean;
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
 * Validates the bearer token and attaches the server-resolved identity.
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });

    if (!session?.user) {
      res.status(401).json({ message: "Unauthorized: Missing or invalid token" });
      return;
    }

    const currentUser: AppCurrentUser = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      picture: session.user.image ?? null,
      isAdmin: (session.user as any).isAdmin ?? false,
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
