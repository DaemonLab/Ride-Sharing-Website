import { env } from "../config/env.js";

// Returns true if the email's domain is in the allowed-domains list.
// Used to restrict login to IIT Indore addresses only.
export const isEmailAllowed = (email: string): boolean => {
  const emailDomain = email?.split("@")[1]?.toLowerCase();
  return env.allowedDomains.includes(emailDomain);
};

