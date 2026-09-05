import { rideCreateSchema, rideFilterSchema } from "../src/validation/rideSchemas.js";

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

  test("accepts partial filters", () => {
    expect(rideFilterSchema.parse({ source: " campus " })).toEqual({
      source: "campus",
      destination: "",
      date: "",
      time: "",
    });
  });
});

