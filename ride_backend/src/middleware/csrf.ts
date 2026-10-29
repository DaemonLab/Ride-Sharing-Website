import type { RequestHandler } from "express";
import { allowedOrigins } from "../config/origins.js";

// Browser forms cannot add this custom header. Cross-origin scripts require a
// preflight, and are rejected by the origin allowlist. Better Auth handles its
// own CSRF validation separately, before this middleware.
export const requireCsrfHeader: RequestHandler = (req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const origin = req.get("origin");
  if (req.get("X-Requested-With") !== "XMLHttpRequest" || (origin && !allowedOrigins.has(origin))) {
    res.status(403).json({ success: false, message: "Invalid request origin or CSRF header" });
    return;
  }
  next();
};
