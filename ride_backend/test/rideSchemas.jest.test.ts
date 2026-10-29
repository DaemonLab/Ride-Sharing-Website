import { rideCreateSchema, rideSearchQuerySchema } from "../src/validation/rideSchemas.js";
import { buildAvailableRideWhere, getPagination } from "../src/utils/rideSearch.js";

describe("Zod API schemas", () => {
  test("normalizes a valid create payload", () => {
    const value = rideCreateSchema.parse({
      from: " Campus ",
      to: "Airport",
      date: "2099-08-25",
      time: "18:30",
      seats: "2",
      price: "250",
      vehicle: "cab",
    });

    expect(value).toMatchObject({ from: "Campus", seats: 2, price: 250, vehicle: "cab" });
  });

  test("returns a validation error for malformed input", () => {
    expect(() => rideCreateSchema.parse({ from: "", seats: 0 })).toThrow();
  });

  test("rejects impossible dates and duplicate route endpoints", () => {
    const baseRide = { from: "Campus", to: "Airport", date: "2099-02-28", time: "09:00", seats: 1, vehicle: "cab" };
    expect(() => rideCreateSchema.parse({ ...baseRide, date: "2099-02-30" })).toThrow();
    expect(() => rideCreateSchema.parse({ ...baseRide, to: "campus" })).toThrow();
  });

  test("defaults an empty list query and accepts a from-only search", () => {
    expect(rideSearchQuerySchema.parse({ from: " Campus " })).toEqual({
      from: "Campus", to: "", date: "", time: "", page: 1, pageSize: 6,
    });
  });

  test("rejects invalid pagination and date/time values", () => {
    expect(() => rideSearchQuerySchema.parse({ page: "0" })).toThrow();
    expect(() => rideSearchQuerySchema.parse({ pageSize: "25" })).toThrow();
    expect(() => rideSearchQuerySchema.parse({ date: "2026/10/21" })).toThrow();
    expect(() => rideSearchQuerySchema.parse({ date: "2026-02-30" })).toThrow();
    expect(() => rideSearchQuerySchema.parse({ time: "25:00" })).toThrow();
  });
});

describe("ride search helpers", () => {
  test("builds a source-only Prisma predicate without other search restrictions", () => {
    const query = rideSearchQuerySchema.parse({ from: "palasia" });
    expect(buildAvailableRideWhere(query)).toEqual({
      rideStatus: "Pending",
      seatsAvailable: { gt: 0 },
      source: { contains: "palasia", mode: "insensitive" },
    });
  });

  test("builds a normal ±60 minute time window", () => {
    const where = buildAvailableRideWhere(rideSearchQuerySchema.parse({ time: "09:00" }));
    expect(where.OR).toEqual([{ time: { gte: "08:00", lte: "10:00" } }]);
  });

  test("splits time filtering when the window crosses midnight", () => {
    const where = buildAvailableRideWhere(rideSearchQuerySchema.parse({ time: "00:30" }));
    expect(where.OR).toEqual([
      { time: { gte: "23:30" } },
      { time: { lte: "01:30" } },
    ]);
  });

  test("clamps pages beyond the final page and handles an empty result", () => {
    expect(getPagination(9, 10, 23)).toMatchObject({ page: 3, totalPages: 3, skip: 20, hasNextPage: false });
    expect(getPagination(1, 10, 0)).toMatchObject({ page: 1, totalPages: 0, skip: 0, hasNextPage: false });
  });
});

