import { Router } from "express";
import { sendContactRequest } from "../controllers/supportController.js";
import { contactRateLimit } from "../middleware/rateLimits.js";

const router = Router();
router.post("/contact", contactRateLimit, sendContactRequest);

export default router;
