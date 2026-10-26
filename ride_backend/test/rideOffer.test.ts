import { expect, jest, test } from "@jest/globals";

const prisma = {
  rides: { create: jest.fn<(...args: unknown[]) => Promise<unknown>>() },
};

jest.unstable_mockModule("../src/config/prisma.js", () => ({ prisma }));
jest.unstable_mockModule("../src/config/logger.js", () => ({
  logger: { info: jest.fn(), error: jest.fn() },
}));

const { addNewlyCreatedRide } = await import("../src/services/rideService.js");

test("a student can offer a booked ride with their authenticated domain ID", async () => {
  prisma.rides.create.mockResolvedValue({ rideID: 7 });

  await addNewlyCreatedRide({
    userID: 42,
    source: "Campus",
    destination: "Airport",
    date: "2099-08-25",
    time: "18:30",
    vehicleType: "cab",
    seatsAvailable: 2,
    totalCost: 250,
  });

  expect(prisma.rides.create).toHaveBeenCalledWith({
    data: {
      createdBy: 42,
      source: "Campus",
      destination: "Airport",
      date: "2099-08-25",
      time: "18:30",
      seatsAvailable: 2,
      totalSeats: 2,
      totalCost: 250,
      vehicleType: "cab",
      rideStatus: "Pending",
    },
  });
});
