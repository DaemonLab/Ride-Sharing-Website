import { prisma } from "../config/prisma.js";
import { logger } from "../config/logger.js";
import type { RideSearchQuery } from "../validation/rideSchemas.js";
import { buildAvailableRideWhere, getPagination } from "../utils/rideSearch.js";

// Small helper — attaches a statusCode to a plain Error so errorHandler
// can send the right HTTP status. Replaces the old RideLifecycleError class.
function createError(message: string, statusCode = 400) {
  const error = new Error(message);
  (error as any).statusCode = statusCode;
  return error;
}

export async function completeExpiredRides() {
  // Date and time are legacy VARCHAR columns. Keep this compatibility update in
  // one place until they are migrated to a single timestamp column.
  await prisma.$executeRaw`
    UPDATE rides
    SET "rideStatus" = 'Completed'
    WHERE (
      "date"::date
      + (SPLIT_PART("time", ':', 1) || ':' || SPLIT_PART("time", ':', 2) || ':00')::interval
    ) <= NOW()
      AND "rideStatus" NOT IN ('Completed', 'Cancelled')
  `;
}

export async function getRideGroup({ rideID, userID }: { rideID: number; userID: number }) {
  const ride = await prisma.rides.findUnique({
    where: { rideID },
    include: {
      creator: { select: { id: true, name: true, email: true, picture: true } },
      requests: {
        where: { requestStatus: "Accepted" },
        include: { requester: { select: { id: true, name: true, email: true, picture: true } } },
      },
    },
  });
  if (!ride) throw createError("Ride not found", 404);

  const isAcceptedMember = ride.requests.some((r) => r.requestBy === userID);
  if (ride.createdBy !== userID && !isAcceptedMember) {
    throw createError("Only ride members can view this group", 403);
  }

  return {
    rideID: ride.rideID,
    source: ride.source,
    destination: ride.destination,
    date: ride.date,
    time: ride.time,
    vehicleType: ride.vehicleType,
    totalSeats: ride.totalSeats,
    seatsAvailable: ride.seatsAvailable,
    totalCost: ride.totalCost ?? null,
    rideStatus: ride.rideStatus,
    members: [ride.creator, ...ride.requests.map((r) => r.requester)],
  };
}

export async function cancelRide({ rideID, ownerID }: { rideID: number; ownerID: number }) {
  await completeExpiredRides();
  return prisma.$transaction(async (tx) => {
    const ride = await tx.rides.findUnique({ where: { rideID } });
    if (!ride) throw createError("Ride not found", 404);
    if (ride.createdBy !== ownerID) throw createError("Only the ride owner can cancel this ride", 403);
    if (ride.rideStatus !== "Pending") throw createError("Only pending rides can be cancelled");

    // Single update — Prisma throws P2025 if not found, so no count check needed.
    await tx.rides.update({
      where: { rideID },
      data: { rideStatus: "Cancelled" },
    });

    await tx.requests.updateMany({
      where: { rideID, requestStatus: { in: ["Pending", "Accepted"] } },
      data: { requestStatus: "Rejected" },
    });
    return { rideID, rideStatus: "Cancelled" };
  });
}

export async function leaveRide({ rideID, userID }: { rideID: number; userID: number }) {
  await completeExpiredRides();
  return prisma.$transaction(async (tx) => {
    const ride = await tx.rides.findUnique({
      where: { rideID },
      select: { createdBy: true, rideStatus: true },
    });
    if (!ride) throw createError("Ride not found", 404);
    if (ride.createdBy === userID) throw createError("The ride owner must cancel the ride instead");
    if (ride.rideStatus !== "Pending") throw createError("Only pending rides can be left");

    // Claim the accepted request conditionally. This prevents a double-click or
    // concurrent leave requests from returning the same seat more than once.
    const requestUpdate = await tx.requests.updateMany({
      where: { rideID, requestBy: userID, requestStatus: "Accepted" },
      data: { requestStatus: "Left" },
    });
    if (requestUpdate.count !== 1) throw createError("You are not an accepted member of this ride", 404);

    const rideUpdate = await tx.rides.updateMany({
      where: { rideID, rideStatus: "Pending" },
      data: { seatsAvailable: { increment: 1 } },
    });
    if (rideUpdate.count !== 1) throw createError("Only pending rides can be left");
    return { rideID, requestStatus: "Left" };
  });
}

/**
 * Mark past rides as Completed (lazy expiry on each fetch), then return all
 * future Pending rides with their creator's profile info.
 *
 * The $executeRaw is required because Prisma cannot cast a VARCHAR date+time
 * column pair to a timestamp in a single expression.
 *
 * Time format defence: the `time` column may contain 'HH:MM', 'HH:MM:SS', or
 * legacy values like 'HH:MM:SS:xx'. We always extract only the HH and MM parts
 * via SPLIT_PART before building the interval, so malformed values never crash
 * the query (fixes: "invalid input syntax for type interval: '21:56:00:00'").
 */
/**
 * Returns one page of available rides. All search filtering happens in Prisma
 * so a URL can be shared without depending on browser-only filtering.
 */
export async function searchAvailableRides(query: RideSearchQuery) {
  await completeExpiredRides();
  const where = buildAvailableRideWhere(query);

  return prisma.$transaction(async (tx) => {
    const total = await tx.rides.count({ where });
    const meta = getPagination(query.page, query.pageSize, total);
    const items = await tx.rides.findMany({
      where,
      skip: meta.skip,
      take: meta.pageSize,
      include: {
        creator: { select: { id: true, name: true, email: true, picture: true } },
      },
      orderBy: [{ date: "asc" }, { time: "asc" }, { rideID: "asc" }],
    });

    const { skip: _skip, ...pagination } = meta;
    return { items, meta: pagination };
  });
}

/**
 * Add a newly created ride.
 * Uses userID directly from session — no redundant email lookup.
 */
export async function addNewlyCreatedRide(data: {
  userID: number; source: string; destination: string;
  date: string; time: string; vehicleType: string;
  seatsAvailable: number; totalCost?: number | null;
}) {
  try {
    await prisma.rides.create({
      data: {
        createdBy: data.userID,
        source: data.source,
        destination: data.destination,
        date: data.date,
        time: data.time,
        seatsAvailable: data.seatsAvailable,
        totalSeats: data.seatsAvailable,
        totalCost: data.totalCost ?? null,
        vehicleType: data.vehicleType,
        rideStatus: "Pending",
      },
    });
    logger.info("Newly created ride added successfully");
  } catch (error) {
    const err = error as Error;
    logger.error(`Error adding newly created ride: ${err.message}`);
    throw new Error(err.message);
  }
}

/**
 * Shared helper: get rides (upcoming or completed) that the user created or joined.
 * Replaces two nearly identical raw SQL blocks with a single typed Prisma query.
 */
async function getUserRidesByStatus(userID: number, rideStatus: string) {
  return prisma.rides.findMany({
    where: {
      rideStatus,
      OR: [
        { createdBy: userID },
        {
          requests: {
            some: { requestBy: userID, requestStatus: "Accepted" },
          },
        },
      ],
    },
    include: {
      creator: { select: { id: true, name: true } },
      requests: {
        where: { requestStatus: "Accepted" },
        include: { requester: { select: { id: true, name: true } } },
      },
    },
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });
}

/**
 * Get upcoming (Pending) rides that the user created or joined.
 */
export async function getUpcomingRides({ userID }: { userID: number }) {
  try {
    await completeExpiredRides();
    const rides = await getUserRidesByStatus(userID, "Pending");
    logger.info("Fetched upcoming rides successfully");
    return rides.map((ride) => ({
      rideID: ride.rideID,
      createdBy: ride.createdBy,
      source: ride.source,
      destination: ride.destination,
      date: ride.date,
      time: ride.time,
      seatsAvailable: ride.seatsAvailable,
      totalCost: ride.totalCost,
      vehicleType: ride.vehicleType,
      rideStatus: ride.rideStatus,
      creatorName: ride.creator.name,
      ridePartnerNames: ride.requests.map((r) => r.requester.name).filter(Boolean).join(", "),
    }));
  } catch (error) {
    const err = error as Error;
    logger.error(`Error fetching upcoming rides: ${err.message}`);
    throw new Error(err.message);
  }
}

/**
 * Get completed rides that the user created or joined.
 */
export async function getCompletedRides({ userID }: { userID: number }) {
  try {
    await completeExpiredRides();
    const rides = await getUserRidesByStatus(userID, "Completed");
    logger.info("Fetched completed rides successfully");
    return rides.map((ride) => ({
      rideID: ride.rideID,
      createdBy: ride.createdBy,
      source: ride.source,
      destination: ride.destination,
      date: ride.date,
      time: ride.time,
      seatsAvailable: ride.seatsAvailable,
      totalCost: ride.totalCost,
      vehicleType: ride.vehicleType,
      rideStatus: ride.rideStatus,
      creatorName: ride.creator.name,
      ridePartnerNames: ride.requests.map((r) => r.requester.name).filter(Boolean).join(", "),
    }));
  } catch (error) {
    const err = error as Error;
    logger.error(`Error fetching completed rides: ${err.message}`);
    throw new Error(err.message);
  }
}

