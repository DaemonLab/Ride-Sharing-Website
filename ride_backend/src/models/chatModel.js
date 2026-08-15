import { prisma } from "../config/prisma.js";

/**
 * Get all members of a ride (creator + accepted requesters).
 */
export async function getRideMembers({ rideID }) {
  try {
    // Get creator
    const ride = await prisma.rides.findUnique({
      where: { rideID },
      select: { createdBy: true },
    });
    if (!ride) return [];

    // Get accepted requesters
    const acceptedRequests = await prisma.requests.findMany({
      where: { rideID, requestStatus: "Accepted" },
      select: { requestBy: true },
    });

    const memberIds = [ride.createdBy, ...acceptedRequests.map((r) => r.requestBy)];

    return await prisma.users.findMany({
      where: { id: { in: memberIds } },
      select: { id: true, name: true },
    });
  } catch (error) {
    throw new Error(error);
  }
}

/**
 * Persist a chat message to the groupChat table.
 */
export async function addMessage({ rideID, user_id, name, message, timestamp }) {
  const ts = timestamp ? new Date(timestamp) : new Date();
  const messageTime = ts.toTimeString().split(" ")[0];
  const messageDate = ts.toISOString().split("T")[0];

  try {
    await prisma.groupChat.create({
      data: {
        rideID,
        rideOwner: name,
        messageBy: user_id,
        message,
        messageTime,
        messageDate,
      },
    });
  } catch (error) {
    throw new Error(error);
  }
}

/**
 * Fetch all messages for a ride, ordered newest-first, with sender name.
 */
export async function getOlderMessages({ rideID }) {
  try {
    const messages = await prisma.groupChat.findMany({
      where: { rideID },
      include: {
        sender: { select: { name: true } },
      },
      orderBy: [{ messageDate: "desc" }, { messageTime: "desc" }],
    });

    // Flatten sender.name onto each row for backward-compat with controllers
    return messages.map((m) => ({ ...m, name: m.sender?.name }));
  } catch (error) {
    throw new Error(error);
  }
}