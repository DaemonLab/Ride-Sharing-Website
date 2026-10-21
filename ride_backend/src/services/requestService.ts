import { prisma } from "../config/prisma.js";
import { Prisma } from "@prisma/client";
import { logger } from "../config/logger.js";
import { completeExpiredRides } from "./rideService.js";

// Small helper to create an error with a statusCode attached.
// errorHandler in errorMiddleware.ts reads (error as any).statusCode to set the HTTP status.
function createError(message: string, statusCode = 400) {
  const error = new Error(message);
  (error as any).statusCode = statusCode;
  return error;
}

/**
 * Send a ride request.
 * - If an Accepted/Pending request already exists, return its status.
 * - If previously Rejected/Left, blocks re-requesting (returns the existing status).
 * Returns a status string describing the outcome:
 *   "RequestMade" | "Accepted" | "Pending" | "Rejected" | "Left"
 *
 * Wrapped in a $transaction to prevent a race condition where two concurrent
 * requests could both pass the seat-availability check before either is committed.
 */
export async function handleUserSentRequest({ rideID, requestBy }: { rideID: number; requestBy: number }) {
  // A direct request must not bypass lazy expiry performed by listing endpoints.
  await completeExpiredRides();
  try {
    return await prisma.$transaction(async (tx) => {
    // Check for an existing request for this ride by this user
    const existing = await tx.requests.findFirst({ where: { rideID, requestBy } });

    if (existing) {
      if (existing.requestStatus === "Accepted") return "Accepted";
      if (existing.requestStatus === "Pending")  return "Pending";
      if (existing.requestStatus === "Rejected") return "Rejected";
      if (existing.requestStatus === "Left")     return "Left";
    }

    // Look up the ride inside the same transaction for consistency
    const ride = await tx.rides.findUnique({
      where: { rideID },
      select: { createdBy: true, rideStatus: true, seatsAvailable: true },
    });

    if (!ride) throw createError(`Ride ${rideID} not found`, 404);
    if (ride.createdBy === requestBy) throw createError("You cannot join your own ride");
    if (ride.rideStatus !== "Pending") throw createError("This ride is no longer accepting requests");
    if (ride.seatsAvailable <= 0) throw createError("This ride has no available seats");

    await tx.requests.create({
      data: {
        rideID,
        createdBy: ride.createdBy,
        rideStatus: ride.rideStatus,
        requestBy,
        requestStatus: "Pending",
      },
    });

    logger.info(`Ride request created: rideID=${rideID} requestBy=${requestBy}`);
      return "RequestMade";
    });
  } catch (error) {
    // The unique [rideID, requestBy] constraint is the final guard against
    // duplicate concurrent submissions. The winning transaction created the
    // pending request, so the second caller receives an idempotent response.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return "Pending";
    }
    throw error;
  }
}

/**
 * Accept or Reject a received request.
 * - Verifies the caller is the ride owner.
 * - If Accepted, decrements seatsAvailable inside a transaction.
 * Note: flag validation is done at the controller boundary before reaching here.
 */
export async function handleUserReceivedRequest({
  rideID, requestBy, flag, ownerID,
}: { rideID: number; requestBy: number; flag: "Accepted" | "Rejected"; ownerID: number }) {
  await completeExpiredRides();
  await prisma.$transaction(async (tx) => {
    const ride = await tx.rides.findUnique({ where: { rideID }, select: { createdBy: true, rideStatus: true, seatsAvailable: true } });
    if (!ride) throw createError(`Ride ${rideID} not found`, 404);
    if (ride.createdBy !== ownerID) throw createError("Only the ride owner can handle requests", 403);
    if (ride.rideStatus !== "Pending" || (ride.seatsAvailable <= 0 && flag === "Accepted")) {
      throw createError("This ride is no longer accepting requests");
    }

    const request = await tx.requests.findFirst({ where: { rideID, requestBy } });
    if (!request) throw createError("Pending request not found", 404);

    // Claim the pending request first. updateMany makes the state transition
    // conditional, so two concurrent decisions cannot both consume a seat.
    const requestUpdate = await tx.requests.updateMany({
      where: { id: request.id, requestStatus: "Pending" },
      data: { requestStatus: flag },
    });
    if (requestUpdate.count !== 1) throw createError("Pending request not found", 409);

    if (flag === "Accepted") {
      const seatUpdate = await tx.rides.updateMany({
        where: { rideID, seatsAvailable: { gt: 0 }, rideStatus: "Pending" },
        data: { seatsAvailable: { decrement: 1 } },
      });
      if (seatUpdate.count !== 1) throw createError("This ride has no available seats");
    }
    logger.info(`Request ${flag}: rideID=${rideID} requestBy=${requestBy} ownerID=${ownerID}`);
  });
}

/**
 * Get all Pending requests sent by the user for rides that are still Pending.
 */
export async function getSentRequests({ requestBy }: { requestBy: number }) {
  return prisma.requests.findMany({
    where: {
      requestBy,
      requestStatus: "Pending",
      ride: { rideStatus: "Pending" },
    },
    include: { ride: true },
  });
}

/**
 * Get all Pending requests received on rides created by the user.
 */
export async function getReceivedRequests({ createdBy }: { createdBy: number }) {
  return prisma.requests.findMany({
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
}


