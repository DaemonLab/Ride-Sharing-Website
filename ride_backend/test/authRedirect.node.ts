import assert from "node:assert/strict";
import { test } from "node:test";
import type { Request, Response } from "express";

// No database or Google credentials are used by these regression tests.
Object.assign(process.env, {
  DATABASE_URL: "postgresql://test:test@localhost:5432/test",
  GOOGLE_CLIENT_ID: "test-client",
  GOOGLE_CLIENT_SECRET: "test-secret",
  BETTER_AUTH_SECRET: "test-secret-for-auth-regressions-only-123456789",
  BETTER_AUTH_URL: "https://api.example.com",
  FRONTEND_URL: "https://app.example.com",
  ALLOWED_DOMAINS: "example.com",
  EMAIL_USER_SENDER: "test@example.com",
  EMAIL_APP_PASSWORD: "test",
  EMAIL_USER_RECEIVER: "test@example.com",
  NODE_ENV: "test",
});

const { auth } = await import("../src/lib/auth.js");
const { loginRedirect } = await import("../src/controllers/loginController.js");

function responseRecorder() {
  const headers = new Map<string, unknown>();
  let location = "";
  return {
    headers,
    get location() { return location; },
    response: {
      setHeader(name: string, value: unknown) { headers.set(name, value); },
      redirect(url: string) { location = url; },
    } as unknown as Response,
  };
}

test("login forwards all state cookies before redirecting to Google", async (t) => {
  const cookies = [
    "__Secure-better-auth.state=signed-state; HttpOnly; Secure; SameSite=Lax",
    "extra=value; Expires=Wed, 28 Oct 2026 00:00:00 GMT; HttpOnly; Secure",
  ];
  const headers = new Headers();
  for (const cookie of cookies) headers.append("set-cookie", cookie);
  const signIn = t.mock.method(auth.api, "signInSocial", async () => ({
    headers,
    response: { url: "https://accounts.google.com/o/oauth2/v2/auth?state=test" },
  }));
  const res = responseRecorder();
  await loginRedirect({} as Request, res.response);
  assert.deepEqual(res.headers.get("Set-Cookie"), cookies);
  assert.equal(res.headers.get("Cache-Control"), "no-store");
  assert.match(res.location, /^https:\/\/accounts.google.com\//);
  const input = signIn.mock.calls[0].arguments[0];
  assert.equal(input.returnHeaders, true);
  assert.equal(input.body.callbackURL, "https://app.example.com/auth/callback");
  assert.match(input.body.errorCallbackURL, /^https:\/\/app.example.com\/signin/);
});

test("login initiation failures return to the frontend", async (t) => {
  t.mock.method(auth.api, "signInSocial", async () => {
    throw new Error("Simulated provider failure");
  });
  const res = responseRecorder();
  await loginRedirect({} as Request, res.response);
  assert.match(res.location, /^https:\/\/app.example.com\/signin\?/);
});

test("OAuth callback errors return to sign-in rather than a protected API route", async () => {
  const response = await auth.handler(new Request(
    "https://api.example.com/api/auth/callback/google?error=access_denied",
  ));
  assert.equal(response.status, 302);
  assert.match(response.headers.get("location")!, /^https:\/\/app.example.com\/signin\?/);
});

test("OAuth cookies support top-level callbacks without disabling state validation", () => {
  assert.equal(auth.options.advanced?.defaultCookieAttributes?.sameSite, "lax");
  assert.equal(auth.options.advanced?.defaultCookieAttributes?.secure, true);
  assert.notEqual(auth.options.account?.skipStateCookieCheck, true);
  assert.equal(auth.options.advanced?.defaultCookieAttributes?.httpOnly, true);
  assert.equal(auth.options.hooks?.after, undefined);
  assert.equal(auth.options.plugins?.some(plugin => plugin.id === 'bearer'), undefined);
});

test("HTTP security boundaries reject untrusted origins, bad input, and contact flooding", async (t) => {
  const { default: app } = await import("../src/app.js");
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  t.after(() => new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));
  const address = server.address() as { port: number };
  const base = `http://127.0.0.1:${address.port}`;
  const untrusted = await fetch(`${base}/health`, { headers: { Origin: "https://attacker.vercel.app" } });
  assert.equal(untrusted.status, 403);
  assert.equal(untrusted.headers.get("access-control-allow-origin"), null);
  const trusted = await fetch(`${base}/health`, { headers: { Origin: "https://app.example.com" } });
  assert.equal(trusted.status, 200);
  assert.equal(trusted.headers.get("access-control-allow-origin"), "https://app.example.com");
  assert.equal(trusted.headers.get("cache-control"), "no-store");
  assert.equal(trusted.headers.get("x-powered-by"), null);
  assert.equal((await fetch(`${base}/user/profile`)).status, 401);
  for (let attempt = 0; attempt < 5; attempt++) {
    const response = await fetch(`${base}/contact`, {
      method: "POST", headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
      body: JSON.stringify({ name: { malicious: true } }),
    });
    assert.equal(response.status, 400);
    assert.equal((await response.json()).message, "Please check the information you entered and try again.");
  }
  const limited = await fetch(`${base}/contact`, { method: "POST", headers: { "X-Requested-With": "XMLHttpRequest" } });
  assert.equal(limited.status, 429);
  const malformed = await fetch(`${base}/contact`, {
    method: "POST", headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" }, body: "{bad json",
  });
  assert.equal(malformed.status, 400);
  assert.equal((await malformed.json()).message, "Please check the information you entered and try again.");
  assert.equal((await fetch(`${base}/auth/logout`, { method: "POST" })).status, 403);
  assert.equal((await fetch(`${base}/auth/status`, { headers: { Authorization: "Bearer raw-session-token" } })).status, 401);
});
