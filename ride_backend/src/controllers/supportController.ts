import type { Request, Response } from "express";
import { sendContactEmail } from "../services/supportService.js";
import { asyncHandler } from "../utils/index.js";
import { contactSchema } from "../validation/supportSchemas.js";

/**
 * POST /contact
 * Handles contact form submissions.
 */
export const sendContactRequest = asyncHandler(async (req: Request, res: Response) => {
  await sendContactEmail(contactSchema.parse(req.body));

  res.status(200).json({ success: true, message: "Contact form submitted successfully" });
});
