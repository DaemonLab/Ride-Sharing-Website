import { z } from "zod";

export const chatRoomSchema = z.object({
  rideId: z.union([z.string().regex(/^\d+$/), z.number()])
    .transform(Number).pipe(z.number().int().positive().max(2_147_483_647)),
});
export const chatMessageSchema = chatRoomSchema.extend({
  message: z.string().trim().min(1).max(2000),
});
