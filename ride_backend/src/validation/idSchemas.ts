import { z } from "zod";

// PostgreSQL Int IDs must fit a signed 32-bit integer. Accept route strings
// and JSON numbers, but never coerce booleans, arrays, or blank strings.
export const rideIdSchema = z.union([z.string().regex(/^\d+$/), z.number()])
  .transform(Number).pipe(z.number().int().positive().max(2_147_483_647));

export const rideIdBodySchema = z.object({ rideID: rideIdSchema });
export const handleRequestSchema = rideIdBodySchema.extend({
  requestBy: z.string().trim().min(1).max(128),
  flag: z.enum(["Accepted", "Rejected"]),
});
