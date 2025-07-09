import pool from "../config/db.js";
import { logger } from "../config/logger.js";

export async function getPendingRides(body) {
  const query = `
        SELECT *
        FROM rides r
        INNER JOIN users u ON u.id = r.createdBy
        WHERE r.rideStatus = $1
        AND 
        u.email <> $2
        AND r.seatsAvailable > $3
        `;
  const values = ["Pending", body.email, 0];
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
  const { src, dest, email } = body;
  let query = `
      SELECT 
      * FROM rides
      INNER JOIN users u ON u.id = r.createdBy 
      WHERE ride_status = $1
      AND createdBy <> $2
      AND seatsAvailable > $3`;
  let values = ["Pending", email, 0];
  let index = 4;

  if (src !== null) {
    if (src.length !== 0 && src.trim() !== "") {
      query += ` AND source = $${index}`;
      values.push(src.trim());
      index++;
    }
  }
  if (dest !== null) {
    if (dest.length !== 0 && dest.trim() !== "") {
      query += ` AND destination = $${index}`;
      values.push(dest.trim());
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
  const response = pool.query(query1, [email]);
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
