import { prisma } from "../config/prisma.js";
import { logger } from "../config/logger.js";

/**
 * Mark past rides as Completed, then return all future Pending rides
 * with their creator's user info.
 *
 * The complex date+time comparison must stay as $queryRaw because
 * Prisma doesn't natively support casting a string column to timestamp.
 */
export async function getPendingRides() {
  try {
    // 1. Mark expired rides as Completed
    await prisma.$executeRaw`
      UPDATE rides
      SET "rideStatus" = 'Completed'
      WHERE ("date"::timestamp + "time"::interval) <= NOW()
      AND "rideStatus" != 'Completed'
    `;

    // 2. Fetch all future pending rides with creator details
    const rows = await prisma.$queryRaw`
      SELECT r.*, u.name, u.email, u.picture
      FROM rides r
      INNER JOIN users u ON u.id = r."createdBy"
      WHERE r."rideStatus" = 'Pending'
        AND r."seatsAvailable" > 0
        AND ("date"::timestamp + "time"::interval) > NOW()
    `;

    logger.info("Fetched pending rides successfully");
    return rows;
  } catch (error) {
    logger.error(`Error fetching pending rides: ${error.message}`);
    throw new Error(error.message);
  }
}

/**
 * Get filtered pending rides by date, source, destination.
 */
export async function getFilteredPendingRides({ source, destination, date }) {
  try {
    const where = {
      rideStatus: "Pending",
      seatsAvailable: { gt: 0 },
      date,
    };

    if (source && source.trim()) where.source = source.trim();
    if (destination && destination.trim()) where.destination = destination.trim();

    const rides = await prisma.rides.findMany({
      where,
      include: { creator: true },
    });

    logger.info("Filtered pending rides fetched successfully");
    return rides;
  } catch (error) {
    logger.error(`Error fetching filtered pending rides: ${error.message}`);
    throw new Error(error.message);
  }
}

/**
 * Add a newly created ride.
 * Looks up the user by email, then creates the ride record.
 */
export async function addNewlyCreatedRide(body) {
  const { email, source, destination, date, time, vehicleType, seatsAvailable, totalCost } = body;

  try {
    // Find the user by email to get their ID
    const user = await prisma.users.findFirst({ where: { email } });
    if (!user) throw new Error(`User with email ${email} not found`);

    await prisma.rides.create({
      data: {
        createdBy: user.id,
        source,
        destination,
        date,
        time,
        seatsAvailable,
        totalSeats: seatsAvailable,
        totalCost,
        vehicleType,
        rideStatus: "Pending",
      },
    });

    logger.info("Newly created ride added successfully");
  } catch (error) {
    logger.error(`Error adding newly created ride: ${error.message}`);
    throw new Error(error.message);
  }
}

/**
 * Get upcoming (Pending) rides that the user created or joined.
 * Uses $queryRaw for the complex GROUP BY + EXISTS subquery.
 */
export async function getUpcomingRides({ userID }) {
  try {
    const rows = await prisma.$queryRaw`
      SELECT
        r."rideID",
        r."createdBy",
        r.source,
        r.destination,
        r.date,
        r.time,
        r."seatsAvailable",
        r."totalCost",
        r."vehicleType",
        u1.name AS "creatorName",
        r."rideStatus",
        STRING_AGG(u2.name, ', ') AS "ridePartnerNames"
      FROM rides r
      INNER JOIN users u1 ON r."createdBy" = u1.id
      LEFT JOIN requests req
        ON req."rideID" = r."rideID"
        AND req."requestStatus" = 'Accepted'
      LEFT JOIN users u2 ON req."requestBy" = u2.id
      WHERE r."rideStatus" = 'Pending'
        AND (
          r."createdBy" = ${userID}
          OR EXISTS (
            SELECT 1 FROM requests req2
            WHERE req2."rideID" = r."rideID"
              AND req2."requestBy" = ${userID}
              AND req2."requestStatus" = 'Accepted'
          )
        )
      GROUP BY
        r."rideID", r."createdBy", r.source, r.destination, r.date, r.time,
        r."seatsAvailable", r."totalCost", r."vehicleType",
        r."rideStatus", u1.name
    `;
    return rows;
  } catch (error) {
    logger.error(`Error fetching upcoming rides: ${error.message}`);
    throw new Error(error.message);
  }
}

/**
 * Get completed rides that the user created or joined.
 */
export async function getCompletedRides({ userID }) {
  try {
    const rows = await prisma.$queryRaw`
      SELECT
        r."rideID",
        r."createdBy",
        r.source,
        r.destination,
        r.date,
        r.time,
        r."seatsAvailable",
        r."totalCost",
        r."vehicleType",
        u1.name AS "creatorName",
        r."rideStatus",
        STRING_AGG(u2.name, ', ') AS "ridePartnerNames"
      FROM rides r
      INNER JOIN users u1 ON r."createdBy" = u1.id
      LEFT JOIN requests req
        ON req."rideID" = r."rideID"
        AND req."requestStatus" = 'Accepted'
      LEFT JOIN users u2 ON req."requestBy" = u2.id
      WHERE r."rideStatus" = 'Completed'
        AND (
          r."createdBy" = ${userID}
          OR EXISTS (
            SELECT 1 FROM requests req2
            WHERE req2."rideID" = r."rideID"
              AND req2."requestBy" = ${userID}
              AND req2."requestStatus" = 'Accepted'
          )
        )
      GROUP BY
        r."rideID", r."createdBy", r.source, r.destination, r.date, r.time,
        r."seatsAvailable", r."totalCost", r."vehicleType",
        r."rideStatus", u1.name
    `;
    return rows;
  } catch (error) {
    logger.error(`Error fetching completed rides: ${error.message}`);
    throw new Error(error.message);
  }
}
