import { expect, jest, test } from "@jest/globals";

const executeRaw = jest.fn<(...args: unknown[]) => Promise<unknown>>().mockResolvedValue(1);
jest.unstable_mockModule("../src/config/prisma.js", () => ({
  prisma: { $executeRaw: executeRaw },
}));
jest.unstable_mockModule("../src/config/logger.js", () => ({
  logger: { info: jest.fn(), error: jest.fn() },
}));

const { completeExpiredRides } = await import("../src/services/rideService.js");

test("expired pending rides transition to Completed without changing cancelled rides", async () => {
  await completeExpiredRides();

  const query = (executeRaw.mock.calls[0][0] as TemplateStringsArray).join("?");
  expect(query).toContain(`SET "rideStatus" = 'Completed'`);
  expect(query).toContain(`"rideStatus" NOT IN ('Completed', 'Cancelled')`);
});
