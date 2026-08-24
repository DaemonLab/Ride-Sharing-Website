import { Request, Response, NextFunction } from "express";

// Rejects unauthenticated requests with 401.
// req.session.user is set by loginController after successful Google OAuth.
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  if (req.session?.user) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Rejects non-admin users with 403.
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.session?.user?.isAdmin === true) {
    next();
  } else {
    res.status(403).json({ message: "Forbidden: Admins only" });
  }
};

