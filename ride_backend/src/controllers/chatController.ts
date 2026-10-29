import type { Request, Response } from "express";
import {
  getRideMembers,
  addMessage,
  getOlderMessages,
} from "../services/chatService.js";
import { asyncHandler } from "../utils/index.js";
import { rideIdBodySchema } from "../validation/idSchemas.js";

// Re-export service methods for any external consumers
export { getRideMembers, addMessage, getOlderMessages };

/**
 * POST /chat/rideMembers
 * Returns the member list for a ride group.
 */
export const getRideMembersHttp = asyncHandler(async (req: Request, res: Response) => {
  const { rideID } = rideIdBodySchema.parse(req.body);
  const members = await getRideMembers({ rideID });
  if (!members.some((member) => member.id === req.session.user!.id)) {
    res.status(403).json({ success: false, message: "Only ride members can view this group" });
    return;
  }
  res.status(200).json({ success: true, data: members });
});
