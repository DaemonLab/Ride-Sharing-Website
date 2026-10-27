export function validateDeploymentConfig(input: Record<string, string | undefined>) {
  const nodeEnv = input.NODE_ENV || "development";
  const production = nodeEnv === "production";
  const port = Number(input.PORT || input.SERVER_PORT || "3000");
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT (or SERVER_PORT) must be an integer between 1 and 65535");
  }
  function origin(name: string, value: string | undefined) {
    if (!value) throw new Error(`Missing required env variable: ${name}`);
    let url: URL;
    try { url = new URL(value); } catch { throw new Error(`${name} must be a valid HTTP(S) origin`); }
    if (!["http:", "https:"].includes(url.protocol) || url.pathname !== "/" || url.search || url.hash || url.username || url.password) {
      throw new Error(`${name} must contain only an HTTP(S) origin, without paths, queries, or credentials`);
    }
    if (production && (url.protocol !== "https:" || /^(localhost|127\..*|\[::1\])$/.test(url.hostname) || url.hostname.endsWith(".localhost"))) {
      throw new Error(`${name} must be a public HTTPS origin in production`);
    }
    return url.origin;
  }
  const frontendUrl = origin("FRONTEND_URL", input.FRONTEND_URL);
  const betterAuthUrl = origin("BETTER_AUTH_URL", input.BETTER_AUTH_URL || (production ? undefined : `http://localhost:${port}`));
  const betterAuthSecret = input.BETTER_AUTH_SECRET || input.SESSION_SECRET;
  if (!betterAuthSecret) throw new Error("Missing required env variable: BETTER_AUTH_SECRET (or SESSION_SECRET)");
  if (production && betterAuthSecret.trim().length < 32) throw new Error("BETTER_AUTH_SECRET must contain at least 32 characters in production");
  const cookieSecure = input.COOKIE_SECURE === "true";
  if (production && !cookieSecure) throw new Error("COOKIE_SECURE must be set to 'true' in production");
  const allowedDomains = (input.ALLOWED_DOMAINS || "").split(",").map(d => d.trim().toLowerCase()).filter(Boolean);
  if (!allowedDomains.length || allowedDomains.some(d => !/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/.test(d))) {
    throw new Error("ALLOWED_DOMAINS must contain comma-separated email domains (for example iiti.ac.in)");
  }
  return { nodeEnv, port, frontendUrl, betterAuthUrl, betterAuthSecret, cookieSecure, allowedDomains };
}
