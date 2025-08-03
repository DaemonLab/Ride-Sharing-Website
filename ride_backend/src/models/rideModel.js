import pool from "../config/db.js";
import { logger } from "../config/logger.js";

export async function getPendingRides(body) {
  const query = `
        SELECT *
        FROM rides r
        INNER JOIN users u ON u.id = r."createdBy"
        WHERE r."rideStatus" = $1
        AND r."seatsAvailable" > $2
        `;
  const values = ["Pending", 0];
  try {
    const response = await pool.query(query, values);
    logger.info("Checked database successfully");
    return response.rows;
  } catch (error) {
    logger.error(`Error fetching pending rides: ${error.message}`);
    throw new Error(error.message);
  }
}

export async function getFilteredPendingRides(body) {
  const { source, destination, date} = body;
  let query = `
      SELECT 
      * FROM rides r
      INNER JOIN users u ON u.id = r."createdBy"
      WHERE "rideStatus" = $1
      AND "seatsAvailable" > $2
      AND date = $3`;
  let values = ["Pending", 0, date];
  let index = 4;

  if (source !== null) {
    if (source.length !== 0 && source.trim() !== "") {
      query += ` AND source = $${index}`;
      values.push(source.trim());
      index++;
    }
  }
  if (destination !== null) {
    if (destination.length !== 0 && destination.trim() !== "") {
      query += ` AND destination = $${index}`;
      values.push(destination.trim());
      index++;
    }
  }
  try {
    const response = await pool.query(query, values);
    logger.info("Database checked successfully");
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
    totalCost,
  } = body;
  const query1 = `
    SELECT id FROM users WHERE email = $1`;
  const response = await pool.query(query1, [email]);
  const userID = response.rows[0].id;

  const query = `
      INSERT INTO rides 
      (createdBy,source, destination, date, time, seatsAvailable, totalCost, vehicleType, rideStatus) 
      VALUES 
      ($1 , $2 , $3 , $4 , $5 , $6 , $7 , $8 , $9)`;
  const values = [
    userID,
    source,
    destination,
    date,
    time,
    seatsAvailable,
    totalCost,
    vehicleType,
    "Pending",
  ];
  try {
    await pool.query(query, values);
    logger.info("Newly created ride added successfully");
  } catch (error) {
    logger.error(`Error adding newly created ride: ${error.message}`);
    throw new Error(error.message);
  }
}


// upcoming rides (khudki banai ho + dusre ne banai ho)
export async function getUpcomingRides(body) {
  const { userID } = body;
  const values = [userID];

  const query = `
  SELECT 
    r."rideID", 
    r."createdBy", 
    r.source, 
    r.destination, 
    r.date, 
    r.time, 
    r."seatsAvailabel", 
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
    r."seatsAvailabel", r."totalCost", r."vehicleType", 
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
      r."createdBy", 
      r.source, 
      r.destination, 
      r.date, 
      r.time, 
      r."seatsAvailabel", 
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
      r."seatsAvailabel", r."totalCost", r."vehicleType", 
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

