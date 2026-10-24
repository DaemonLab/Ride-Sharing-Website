import { expect, jest, test } from "@jest/globals";

type RideRecord = { createdBy: number; rideStatus: string } | null;
type UpdateResult = { count: number };

const transaction = {
  rides: {
    findUnique: jest.fn<(args: unknown) => Promise<RideRecord>>(),
    updateMany: jest.fn<(args: unknown) => Promise<UpdateResult>>(),
  },
  requests: {
    updateMany: jest.fn<(args: unknown) => Promise<UpdateResult>>(),
  },
};

const prisma = {
  $executeRaw: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
  $transaction: jest.fn<(callback: (tx: typeof transaction) => Promise<unknown>) => Promise<unknown>>(
    async (callback) => callback(transaction),
  ),
};

jest.unstable_mockModule("../src/config/prisma.js", () => ({ prisma }));
jest.unstable_mockModule("../src/config/logger.js", () => ({ logger: { info: jest.fn(), error: jest.fn() } }));

const { leaveRide } = await import("../src/services/rideService.js");

test("leaving an accepted ride releases exactly one passenger seat", async () => {
  transaction.rides.findUnique.mockResolvedValue({ createdBy: 1, rideStatus: "Pending" });
  transaction.requests.updateMany.mockResolvedValue({ count: 1 });
  transaction.rides.updateMany.mockResolvedValue({ count: 1 });

  await expect(leaveRide({ rideID: 7, userID: 2 })).resolves.toEqual({ rideID: 7, requestStatus: "Left" });

  expect(transaction.requests.updateMany).toHaveBeenCalledWith({
    where: { rideID: 7, requestBy: 2, requestStatus: "Accepted" },
    data: { requestStatus: "Left" },
  });
  expect(transaction.rides.updateMany).toHaveBeenCalledWith({
    where: { rideID: 7, rideStatus: "Pending" },
    data: { seatsAvailable: { increment: 1 } },
  });
});

test("a duplicate leave cannot release another seat", async () => {
  transaction.rides.findUnique.mockResolvedValue({ createdBy: 1, rideStatus: "Pending" });
  transaction.requests.updateMany.mockResolvedValue({ count: 0 });

  await expect(leaveRide({ rideID: 7, userID: 2 })).rejects.toThrow("not an accepted member");
  expect(transaction.rides.updateMany).not.toHaveBeenCalled();
});
