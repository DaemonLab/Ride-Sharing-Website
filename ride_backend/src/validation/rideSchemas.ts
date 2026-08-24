import { z } from "zod";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

// Schema for POST /rides/addRide
// Validates the request body and transforms field names to backend format
export const rideCreateSchema = z
  .object({
    from:     z.string().trim().min(1).max(255),
    to:       z.string().trim().min(1).max(255),
    date:     z.string().regex(datePattern, "Date must be YYYY-MM-DD"),
    time:     z.string().regex(timePattern, "Time must be HH:mm"),
    seats:    z.coerce.number().int().min(1).max(20),
    price:    z.preprocess(
      (v) => (v === "" || v === undefined || v === null ? undefined : Number(v)),
      z.number().finite().min(0).max(100_000).optional(),
    ),
    vehicle:  z.enum(["rickshaw", "cab", "other"]),
  })
  .superRefine((value, ctx) => {
    const departure = new Date(`${value.date}T${value.time}:00`);
    if (Number.isNaN(departure.getTime()) || departure <= new Date()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["date"],
        message: "Ride departure must be in the future",
      });
    }
  });

// Schema for POST /rides/filteredAvailableRides
export const rideFilterSchema = z.object({
  source:      z.string().trim().max(255).optional().default(""),
  destination: z.string().trim().max(255).optional().default(""),
  date:        z.string().regex(datePattern, "Date must be YYYY-MM-DD").optional().or(z.literal("")).default(""),
  time:        z.string().regex(timePattern, "Time must be HH:mm").optional().or(z.literal("")).default(""),
});

