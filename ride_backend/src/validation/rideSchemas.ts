import { z } from "zod";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

function isCalendarDate(value: string) {
  if (!datePattern.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}

const calendarDate = z.string().refine(isCalendarDate, "Date must be a valid YYYY-MM-DD calendar date");

// Schema for POST /rides/addRide
// Validates the request body and transforms field names to backend format
export const rideCreateSchema = z
  .object({
    from:     z.string().trim().min(1).max(255),
    to:       z.string().trim().min(1).max(255),
    date:     calendarDate,
    time:     z.string().regex(timePattern, "Time must be HH:mm"),
    seats:    z.coerce.number().int().min(1).max(20),
    price:    z.preprocess(
      (v) => (v === "" || v === undefined || v === null ? undefined : Number(v)),
      z.number().finite().min(0).max(100_000).optional(),
    ),
    vehicle:  z.enum(["rickshaw", "cab", "other"]),
  })
  .superRefine((value, ctx) => {
    if (value.from.toLocaleLowerCase() === value.to.toLocaleLowerCase()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["to"],
        message: "Starting point and destination cannot be the same",
      });
    }
    const departure = new Date(`${value.date}T${value.time}:00`);
    if (Number.isNaN(departure.getTime()) || departure <= new Date()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["date"],
        message: "Ride departure must be in the future",
      });
    }
  });

// Schema for GET /rides. Query-string values arrive as strings, so page values
// are coerced here instead of being trusted by the controller or database layer.
export const rideSearchQuerySchema = z.object({
  from: z.string().trim().max(255).optional().default(""),
  to: z.string().trim().max(255).optional().default(""),
  date: calendarDate.optional().or(z.literal("")).default(""),
  time: z.string().regex(timePattern, "Time must be HH:mm").optional().or(z.literal("")).default(""),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(24).default(6),
});

export type RideSearchQuery = z.infer<typeof rideSearchQuerySchema>;

