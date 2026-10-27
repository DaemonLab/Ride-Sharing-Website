import { rateLimit } from "express-rate-limit";

// In-memory limits apply per server process. Use a shared store before scaling
// the backend across multiple instances.
export const contactRateLimit = rateLimit({
  windowMs: 15 * 60_000, limit: 5, standardHeaders: "draft-8", legacyHeaders: false,
  message: { success: false, message: "Too many contact requests. Please try again later." },
});
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60_000, limit: 30, standardHeaders: "draft-8", legacyHeaders: false,
  message: { success: false, message: "Too many sign-in attempts. Please try again later." },
});
export const apiRateLimit = rateLimit({
  windowMs: 60_000, limit: 120, standardHeaders: "draft-8", legacyHeaders: false,
  keyGenerator: (req) => req.currentUser!.id,
  message: { success: false, message: "Too many requests. Please try again shortly." },
});
