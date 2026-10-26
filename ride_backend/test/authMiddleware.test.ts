import { expect, jest, test } from "@jest/globals";

const getSession = jest.fn<(...args: unknown[]) => Promise<any>>();

jest.unstable_mockModule("../src/auth.js", () => ({
  auth: { api: { getSession } },
}));

const { authenticate, toAuthenticatedUser } = await import("../src/middleware/authMiddleware.js");

test("accepts a Better Auth session and maps its ID to the existing domain user ID", async () => {
  getSession.mockResolvedValue({
    user: { id: "42", email: "student@iiti.ac.in", name: "Student", image: "photo.png" },
  });
  const req = { headers: { cookie: "better-auth.session_token=token" } } as never;
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as never;
  const next = jest.fn();

  await authenticate(req, res, next);

  expect((req as { authUser?: { id: number; picture: string | null } }).authUser).toMatchObject({
    id: 42,
    picture: "photo.png",
  });
  expect(next).toHaveBeenCalledWith();
});

test("rejects sessions whose user ID cannot identify a ride-domain user", () => {
  expect(
    toAuthenticatedUser({ id: "not-an-integer", email: "student@iiti.ac.in", name: "Student" }),
  ).toBeNull();
});
