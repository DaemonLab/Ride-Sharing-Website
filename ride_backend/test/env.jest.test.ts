import { env } from "../src/config/env.js";

describe("environment configuration", () => {
  test("loads and exposes required environment variables", () => {
    expect(env).toBeDefined();
    expect(typeof env.port).toBe("number");
    expect(typeof env.nodeEnv).toBe("string");
    expect(Array.isArray(env.allowedDomains)).toBe(true);
  });
});

