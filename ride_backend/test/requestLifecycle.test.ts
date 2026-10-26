import { expect, jest, test } from "@jest/globals";

type RequestRecord = { id: number } | null;
type UpdateResult = { count: number };

const transaction = {
  rides: {
    findUnique: jest.fn<(...args: unknown[]) => Promise<any>>(),
    updateMany: jest.fn<(...args: unknown[]) => Promise<UpdateResult>>(),
  },
  requests: {
    findFirst: jest.fn<(...args: unknown[]) => Promise<RequestRecord>>(),
    create: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
    updateMany: jest.fn<(...args: unknown[]) => Promise<UpdateResult>>(),
  },
};

const prisma = {
  $executeRaw: jest.fn<(...args: unknown[]) => Promise<unknown>>().mockResolvedValue(0),
  $transaction: jest.fn(async (callback: (tx: typeof transaction) => Promise<unknown>) =>
    callback(transaction),
  ),
};

jest.unstable_mockModule("../src/config/prisma.js", () => ({ prisma }));
jest.unstable_mockModule("../src/config/logger.js", () => ({
  logger: { info: jest.fn(), error: jest.fn() },
}));

const { handleUserSentRequest, handleUserReceivedRequest } =
  await import("../src/services/requestService.js");

test("a student can request to join another student's available ride", async () => {
  transaction.requests.findFirst.mockResolvedValue(null);
  transaction.rides.findUnique.mockResolvedValue({
    createdBy: 1,
    rideStatus: "Pending",
    seatsAvailable: 2,
  });
  transaction.requests.create.mockResolvedValue({ id: 8 });

  await expect(handleUserSentRequest({ rideID: 7, requestBy: 2 })).resolves.toBe("RequestMade");
  expect(transaction.requests.create).toHaveBeenCalledWith({
    data: {
      rideID: 7,
      createdBy: 1,
      rideStatus: "Pending",
      requestBy: 2,
      requestStatus: "Pending",
    },
  });
});

test("the ride owner can accept a pending request and claim one seat", async () => {
  transaction.rides.findUnique.mockResolvedValue({
    createdBy: 1,
    rideStatus: "Pending",
    seatsAvailable: 2,
  });
  transaction.requests.findFirst.mockResolvedValue({ id: 8 });
  transaction.requests.updateMany.mockResolvedValue({ count: 1 });
  transaction.rides.updateMany.mockResolvedValue({ count: 1 });

  await expect(
    handleUserReceivedRequest({ rideID: 7, requestBy: 2, flag: "Accepted", ownerID: 1 }),
  ).resolves.toBeUndefined();
  expect(transaction.requests.updateMany).toHaveBeenCalledWith({
    where: { id: 8, requestStatus: "Pending" },
    data: { requestStatus: "Accepted" },
  });
  expect(transaction.rides.updateMany).toHaveBeenCalledWith({
    where: { rideID: 7, seatsAvailable: { gt: 0 }, rideStatus: "Pending" },
    data: { seatsAvailable: { decrement: 1 } },
  });
});

test("a different student cannot accept a request", async () => {
  transaction.rides.findUnique.mockResolvedValue({
    createdBy: 1,
    rideStatus: "Pending",
    seatsAvailable: 2,
  });

  await expect(
    handleUserReceivedRequest({ rideID: 7, requestBy: 2, flag: "Accepted", ownerID: 3 }),
  ).rejects.toThrow("Only the ride owner can handle requests");
  expect(transaction.requests.updateMany).not.toHaveBeenCalled();
});
