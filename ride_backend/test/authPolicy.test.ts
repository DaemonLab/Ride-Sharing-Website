import { isAllowedGoogleUser } from "../src/auth-policy.js";

describe("Google sign-in policy", () => {
  test("accepts an address from the configured student domains", () => {
    expect(
      isAllowedGoogleUser(`student@${process.env.ALLOWED_DOMAINS!.split(",")[0].trim()}`),
    ).toBe(true);
  });

  test("rejects missing and unconfigured addresses", () => {
    expect(isAllowedGoogleUser(undefined)).toBe(false);
    expect(isAllowedGoogleUser("student@outside.invalid")).toBe(false);
  });
});
