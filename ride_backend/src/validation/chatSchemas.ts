import { z } from "zod";
import { rideIdSchema } from "./idSchemas.js";

export const chatRoomSchema = z.object({
  rideId: rideIdSchema,
});
export const chatMessageSchema = chatRoomSchema.extend({
  message: z.string().trim().min(1).max(2000),
});
