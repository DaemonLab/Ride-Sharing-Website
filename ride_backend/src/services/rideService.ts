import { prisma } from "../config/prisma.js";
import { logger } from "../config/logger.js";
import type { RideSearchQuery } from "../validation/rideSchemas.js";
import { buildAvailableRideWhere, getPagination } from "../utils/rideSearch.js";

// Helper for error with status code
function createError(message: string, statusCode = 400) {
  const error = new Error(message);
  (error as any).statusCode = statusCode;
  return error;
}

export async function completeExpiredRides() {
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

export async function getRideGroup({ rideID, userID }: { rideID: number; userID: string }) {
  const ride = await prisma.rides.findUnique({
    where: { rideID },
    include: {
      creator: { select: { id: true, name: true, email: true, image: true } },
      requests: {
        where: { requestStatus: "Accepted" },
        include: { requester: { select: { id: true, name: true, email: true, image: true } } },
      },
    },
  });
  if (!ride) throw createError("Ride not found", 404);

  const isAcceptedMember = ride.requests.some((r) => r.requestBy === userID);
  if (ride.createdBy !== userID && !isAcceptedMember) {
    throw createError("Only ride members can view this group", 403);
  }

  const formatMember = (m: { id: string; name: string | null; email: string; image: string | null }) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    picture: m.image,
  });

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
    members: [formatMember(ride.creator), ...ride.requests.map((r) => formatMember(r.requester))],
  };
}

export async function cancelRide({ rideID, ownerID }: { rideID: number; ownerID: string }) {
  await completeExpiredRides();
  return prisma.$transaction(async (tx) => {
    const ride = await tx.rides.findUnique({ where: { rideID } });
    if (!ride) throw createError("Ride not found", 404);
    if (ride.createdBy !== ownerID) throw createError("Only the ride owner can cancel this ride", 403);
    if (ride.rideStatus !== "Pending") throw createError("Only pending rides can be cancelled");

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

export async function leaveRide({ rideID, userID }: { rideID: number; userID: string }) {
  await completeExpiredRides();
  return prisma.$transaction(async (tx) => {
    const ride = await tx.rides.findUnique({
      where: { rideID },
      select: { createdBy: true, rideStatus: true },
    });
    if (!ride) throw createError("Ride not found", 404);
    if (ride.createdBy === userID) throw createError("The ride owner must cancel the ride instead");
    if (ride.rideStatus !== "Pending") throw createError("Only pending rides can be left");

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
        creator: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: [{ date: "asc" }, { time: "asc" }, { rideID: "asc" }],
    });

    const formattedItems = items.map((r) => ({
      ...r,
      creator: {
        id: r.creator.id,
        name: r.creator.name,
        email: r.creator.email,
        picture: r.creator.image,
      },
    }));

    const { skip: _skip, ...pagination } = meta;
    return { items: formattedItems, meta: pagination };
  });
}

export async function addNewlyCreatedRide(data: {
  userID: string;
  source: string;
  destination: string;
  date: string;
  time: string;
  vehicleType: string;
  seatsAvailable: number;
  totalCost?: number | null;
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
    throw error;
  }
}

async function getUserRidesByStatus(userID: string, rideStatus: string) {
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

export async function getUpcomingRides({ userID }: { userID: string }) {
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
    throw error;
  }
}

export async function getCompletedRides({ userID }: { userID: string }) {
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
    throw error;
  }
}
