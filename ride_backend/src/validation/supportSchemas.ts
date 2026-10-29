import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(100).regex(/^[^\r\n]*$/),
  email: z.string().trim().email().max(254),
  subject: z.string().trim().min(1).max(200).regex(/^[^\r\n]*$/),
  message: z.string().trim().min(1).max(5000),
});

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]!);
}
