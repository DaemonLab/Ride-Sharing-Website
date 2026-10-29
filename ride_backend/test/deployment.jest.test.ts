import { validateDeploymentConfig } from "../src/config/deployment.js";

const production = {
  NODE_ENV: "production", PORT: "10000", FRONTEND_URL: "https://app.example.com/",
  BETTER_AUTH_URL: "https://app.example.com", BETTER_AUTH_SECRET: "test-only-long-secret-12345678901234567890",
  COOKIE_SECURE: "true", ALLOWED_DOMAINS: "IITI.AC.IN",
};
test("production URLs and Render port are normalized", () => {
  expect(validateDeploymentConfig(production)).toMatchObject({
    port: 10000, frontendUrl: "https://app.example.com", allowedDomains: ["iiti.ac.in"],
  });
});
test.each([
  { BETTER_AUTH_URL: undefined }, { BETTER_AUTH_URL: "http://localhost:3000" },
  { FRONTEND_URL: "https://app.example.com/profile" }, { FRONTEND_URL: "https://user:pass@app.example.com" },
  { COOKIE_SECURE: "false" }, { BETTER_AUTH_SECRET: "weak" }, { PORT: "invalid" },
  { PORT: "65536" }, { ALLOWED_DOMAINS: " , " },
  { MULTI_INSTANCE: "true" }, { REDIS_URL: "https://redis.example.com" },
  { BETTER_AUTH_URL: "https://other.example.com" },
])("bad production configuration fails before starting: %o", (patch) => {
  expect(() => validateDeploymentConfig({ ...production, ...patch })).toThrow();
});
test("local defaults remain supported", () => {
  expect(validateDeploymentConfig({ ...production, NODE_ENV: "development", BETTER_AUTH_URL: undefined }))
    .toMatchObject({ betterAuthUrl: "http://localhost:10000" });
});
