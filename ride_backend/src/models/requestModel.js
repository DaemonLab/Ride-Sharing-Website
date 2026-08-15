import { prisma } from "../config/prisma.js";

/**
 * Send a ride request.
 * - If an Accepted/Pending request already exists, return its status.
 * - Otherwise, look up ride details and insert a new Pending request.
 */
export async function handleUserSentRequest({ rideID, requestBy }) {
  try {
    // Check for an existing request for this ride by this user
    const existing = await prisma.requests.findFirst({
      where: { rideID, requestBy },
    });

    if (existing) {
      if (existing.requestStatus === "Accepted") return "Accepted";
      if (existing.requestStatus === "Pending") return "Pending";
      // Rejected — allow re-request by deleting the old one first
      await prisma.requests.delete({ where: { id: existing.id } });
    }

    // Look up the ride to get createdBy and rideStatus
    const ride = await prisma.rides.findUnique({
      where: { rideID },
      select: { createdBy: true, rideStatus: true },
    });

    if (!ride) throw new Error(`Ride ${rideID} not found`);

    await prisma.requests.create({
      data: {
        rideID,
        createdBy: ride.createdBy,
        rideStatus: ride.rideStatus,
        requestBy,
        requestStatus: "Pending",
      },
    });

    return "RequestMade";
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Accept or Reject a received request.
 * - Updates requestStatus on the request row.
 * - If Accepted, decrements seatsAvailable on the ride (in a transaction).
 */
export async function handleUserReceivedRequest({ rideID, requestBy, flag }) {
  try {
    await prisma.$transaction(async (tx) => {
      // Update the request status
      await tx.requests.updateMany({
        where: { rideID, requestBy },
        data: { requestStatus: flag },
      });

      // If accepted, decrement seats
      if (flag === "Accepted") {
        await tx.rides.update({
          where: { rideID },
          data: { seatsAvailable: { decrement: 1 } },
        });
      }
    });
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Get all Pending requests sent by the user (requestBy)
 * for rides that are still Pending.
 */
export async function getSentRequests({ requestBy }) {
  try {
    return await prisma.requests.findMany({
      where: {
        requestBy,
        requestStatus: "Pending",
        ride: { rideStatus: "Pending" },
      },
      include: { ride: true },
    });
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Get all Pending requests received on rides created by the user (createdBy).
 */
export async function getReceivedRequests({ createdBy }) {
  try {
    return await prisma.requests.findMany({
      where: {
        createdBy,
        requestStatus: "Pending",
        ride: { rideStatus: "Pending" },
      },
      include: {
        ride: true,
        requester: { select: { id: true, name: true, email: true, picture: true } },
      },
    });
  } catch (error) {
    throw new Error(error.message);
  }
}