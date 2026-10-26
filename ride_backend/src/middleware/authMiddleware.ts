import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth.js";

export type AuthenticatedUser = {
  id: number;
  googleId: string;
  email: string;
  name: string | null;
  picture: string | null;
  isAdmin: boolean | null;
};

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthenticatedUser;
    }
  }
}

export function toAuthenticatedUser(user: {
  id: string | number;
  email: string;
  name: string;
  image?: string | null;
}): AuthenticatedUser | null {
  const id = Number(user.id);
  if (!Number.isSafeInteger(id) || id <= 0) return null;
  return {
    id,
    googleId: "",
    email: user.email,
    name: user.name ?? null,
    picture: user.image ?? null,
    isAdmin: null,
  };
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const legacyUser = req.session?.user;

  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    const user = session ? toAuthenticatedUser(session.user) : null;
    if (user) {
      req.authUser = user;
      next();
      return;
    }
    if (legacyUser) {
      req.authUser = legacyUser;
      next();
      return;
    }
    res.status(401).json({ success: false, message: "Unauthorized" });
  } catch (error) {
    if (legacyUser) {
      req.authUser = legacyUser;
      next();
      return;
    }
    next(error);
  }
};

// Rejects non-admin users with 403.
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if ((req.authUser?.isAdmin ?? req.session?.user?.isAdmin) === true) {
    next();
  } else {
    res.status(403).json({ message: "Forbidden: Admins only" });
  }
};
