import { env } from "./config/env.js";

export function isAllowedGoogleUser(email: string | undefined): boolean {
  const domain = email?.split("@").at(-1)?.toLowerCase();
  return Boolean(domain && env.allowedDomains.includes(domain));
}
