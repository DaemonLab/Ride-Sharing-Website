import pool from "../config/db.js";
import { logger } from "../config/logger.js";
import { DateTime } from 'luxon';

export async function updateCompletedRides() {
  const now = DateTime.now().toISO();
  const query = `
    UPDATE rides 
    SET "rideStatus" = 'Completed'
    WHERE "rideStatus" = 'Upcoming' 
    AND (date || ' ' || time)::timestamp < $1
    RETURNING "rideID", source, destination, date, time
  `;

  try {
    const result = await pool.query(query, [now]);
    if (result.rowCount > 0) {
      logger.info(`Updated ${result.rowCount} rides to completed status`);
    }
    return result.rows;
  } catch (error) {
    logger.error(`Error updating completed rides: ${error.message}`);
    throw error;
  }
}

export async function getPendingRides(body) {
  const query = `
        SELECT 
            r."rideID", r.source, r.destination, r.date, r.time, r."seatsAvailable", r."totalSeats", 
            r."totalCost", r."vehicleType", r."rideStatus",
            u.id as "creatorId", u.name as "creatorName"
        FROM rides r
        INNER JOIN users u ON u.id = r."createdBy"
        WHERE r."rideStatus" = 'Pending'
        AND r."seatsAvailable" > 0
        `;
  try {
    const response = await pool.query(query);
    logger.info("Checked database successfully for pending rides");
    return response.rows;
  } catch (error) {
    logger.error(`Error fetching pending rides: ${error.message}`);
    throw new Error(error.message);
  }
}


export async function getFilteredPendingRides(body) {
  const source = body.source || body.from || "";
  const destination = body.destination || body.to || "";
  const date = body.date || "";

  let query = `
      SELECT 
        r."rideID", r.source, r.destination, r.date, r.time, r."seatsAvailable", r."totalSeats", 
        r."totalCost", r."vehicleType", r."rideStatus",
        u.id as "creatorId", u.name as "creatorName"
      FROM rides r
      INNER JOIN users u ON u.id = r."createdBy"
      WHERE "rideStatus" = $1
      AND "seatsAvailable" > $2`;

  let values = ["Pending", 0];
  const conditions = [];

  if (date && date.trim() !== "") {
    conditions.push(`date = $${values.length + 1}`);
    values.push(date.trim());
  }

  if (source && source.trim() !== "") {
    conditions.push(`source ILIKE $${values.length + 1}`);
    values.push(`%${source.trim()}%`);
  }

  if (destination && destination.trim() !== "") {
    conditions.push(`destination ILIKE $${values.length + 1}`);
    values.push(`%${destination.trim()}%`);
  }

  if (conditions.length > 0) {
    query += " AND (" + conditions.join(" OR ") + ")";
  }

  try {
    const response = await pool.query(query, values);
    logger.info("Database checked successfully for filtered rides");
    return response.rows;
  } catch (error) {
    logger.error(`Error fetching filtered pending rides: ${error.message}`);
    throw new Error(error.message);
  }
}

// mobile number ka input baar baar lena h ya signup ke time save krke rkhna h
export async function addNewlyCreatedRide(body) {
  const {
    email,
    source,
    destination,
    date,
    time,
    vehicleType,
    seatsAvailable,
    totalCost
  } = body;
  const query1 = `
    SELECT id FROM users WHERE email = $1`;
  const response = await pool.query(query1, [email]);
  const userID = response.rows[0].id;

  const query = `
      INSERT INTO rides 
      ("createdBy", source, destination, date, time, "seatsAvailable", "totalSeats", "totalCost", "vehicleType", "rideStatus") 
      VALUES 
      ($1, $2, $3, $4, $5, $6, $6, $7, $8, $9)`;
  const values = [
    userID,
    source,
    destination,
    date,
    time,
    seatsAvailable, // seatsAvailable
    totalCost,
    vehicleType,
    "Pending",
  ]; // totalSeats will be set to seatsAvailable on creation
  try {
    const result = await pool.query(`${query} RETURNING *`, values);
    const createdRide = result.rows[0];
    logger.info("Ride added successfully");
    return createdRide;
  } catch (error) {
    logger.error(`Error adding newly created ride: ${error.message}`);
    throw new Error(error.message);
  }
}

export async function getThisRideById(rideID) {
  const query = `
    SELECT 
      r."rideID", r.source, r.destination, r.date, r.time, r."seatsAvailable", r."totalSeats", 
      r."totalCost", r."vehicleType", r."rideStatus",
      u.id as "creatorId", u.name as "creatorName"
    FROM rides r
    INNER JOIN users u ON u.id = r."createdBy"
    WHERE r."rideID" = $1
  `;
  const response = await pool.query(query, [rideID]);
  return response.rows[0];
}

// upcoming rides (khudki banai ho + dusre ne banai ho)
export async function getUpcomingRides(body) {
  const { userID } = body;
  const values = [userID];

  const query = `
  SELECT 
    r."rideID", 
    r."createdBy" as "creatorID", 
    r.source, 
    r.destination, 
    r.date, 
    r.time, 
    r."seatsAvailable", r."totalSeats", 
    r."totalCost", 
    r."vehicleType",
    u1.name AS "creatorName",
    r."rideStatus",
    STRING_AGG(u2.name, ', ') AS "ridePartnerNames"
  FROM rides r

  INNER JOIN users u1 
    ON r."createdBy" = u1."id"

  LEFT JOIN requests req 
    ON req."rideID" = r."rideID"
    AND req."requestStatus" = 'Accepted'

  LEFT JOIN users u2 
    ON req."requestBy" = u2."id"

  WHERE r."rideStatus" = 'Pending'
    AND (
      r."createdBy" = $1
      OR EXISTS (
        SELECT 1
        FROM requests req2
        WHERE req2."rideID" = r."rideID"
          AND req2."requestBy" = $1
          AND req2."requestStatus" = 'Accepted'
      )
    )

  GROUP BY 
    r."rideID", r."createdBy", r.source, r.destination, r.date, r.time, 
    r."seatsAvailable", 
    r."totalCost", r."vehicleType", 
    r."rideStatus", u1.name
`;

  try {
    const response = await pool.query(query, values);
    return response.rows;
  } catch (error) {
    throw new Error(error.message);
  }
}

// completed rides (khudki banai ho + dusre ne banai ho)
export async function getCompletedRides(body) {
  const { userID } = body;

  const query = `
    SELECT 
      r."rideID", 
      r."createdBy" as "creatorID", 
      r.source, 
      r.destination, 
      r.date, 
      r.time, 
      r."seatsAvailable", r."totalSeats",
      r."totalCost", 
      r."vehicleType",
      u1.name AS "creatorName",
      r."rideStatus",
      STRING_AGG(u2.name, ', ') AS "ridePartnerNames"
    FROM rides r

    INNER JOIN users u1 
      ON r."createdBy" = u1."id"

    LEFT JOIN requests req 
      ON req."rideID" = r."rideID"
      AND req."requestStatus" = 'Accepted'

    LEFT JOIN users u2 
      ON req."requestBy" = u2."id"

    WHERE r."rideStatus" = 'Completed'
      AND (
        r."createdBy" = $1
        OR EXISTS (
          SELECT 1
          FROM requests req2
          WHERE req2."rideID" = r."rideID"
            AND req2."requestBy" = $1
            AND req2."requestStatus" = 'Accepted'
        )
      )

    GROUP BY 
      r."rideID", r."createdBy", r.source, r.destination, r.date, r.time, 
      r."seatsAvailable", -- FIX: Corrected typo from "seatsAvailabel"
      r."totalCost", r."vehicleType", 
      r."rideStatus", u1.name
  `;

  const values = [userID];

  try {
    const response = await pool.query(query, values);
    return response.rows;
  } catch (error) {
    throw new Error(error.message);
  }
}

