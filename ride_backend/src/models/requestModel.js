import pool from "../config/db.js";

export async function handleUserSentRequest(body) {
  const { rideID, requestBy } = body;

  const rideDetailsQuery = `SELECT "createdBy", "rideStatus", "seatsAvailable" FROM rides WHERE "rideID" = $1`;
  const rideDetailsResult = await pool.query(rideDetailsQuery, [rideID]);

  if (rideDetailsResult.rows.length === 0) {
    return { success: false, message: "This ride does not exist." };
  }

  const { createdBy, rideStatus, seatsAvailable } = rideDetailsResult.rows[0];

  if (createdBy === requestBy) {
    return {
      success: false,
      message: "You cannot request to join your own ride.",
    };
  }

  if (rideStatus !== "Pending" || seatsAvailable <= 0) {
    return {
      success: false,
      message: "This ride is no longer available for requests.",
    };
  }

  // Check if a request already exists
  const queryForReqCheck = `
        SELECT "requestStatus" FROM requests
        WHERE "rideID" = $1 AND "requestBy" = $2
      `;
  const reqCheckResult = await pool.query(queryForReqCheck, [
    rideID,
    requestBy,
  ]);

  if (reqCheckResult.rows.length > 0) {
    const { requestStatus } = reqCheckResult.rows[0];
    if (requestStatus === "Accepted") {
      return {
        success: false,
        message: "You are already a passenger on this ride.",
      };
    }
    if (requestStatus === "Pending") {
      return {
        success: false,
        message: "Your request for this ride is already pending.",
      };
    }
  }

  const requestEntryQuery = `
  INSERT INTO requests
  ("rideID", "requestBy", "requestStatus", "createdBy", "rideStatus")
  VALUES ($1, $2, 'Pending', $3, 'Pending')
  ON CONFLICT ("rideID", "requestBy") DO UPDATE SET "requestStatus" = 'Pending'
`;
  await pool.query(requestEntryQuery, [rideID, requestBy, createdBy]);
  return { success: true, message: "Request sent successfully." };
}

export async function handleUserReceivedRequest(body) {
  const { rideID, requestBy, flag } = body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const checkRequestQuery = `
      SELECT "rideID", "requestStatus" 
      FROM requests 
      WHERE "rideID" = $1 AND "requestBy" = $2 AND "requestStatus" = 'Pending'
      FOR UPDATE
    `;
    
    const requestResult = await client.query(checkRequestQuery, [rideID, requestBy]);
    
    if (requestResult.rows.length === 0) {
      throw new Error('No pending request found or request has already been processed');
    }

    const updateRequestQuery = `
      UPDATE requests
      SET "requestStatus" = $1
      WHERE "rideID" = $2 AND "requestBy" = $3
      RETURNING *
    `;
    
    await client.query(updateRequestQuery, [flag, rideID, requestBy]);

    if (flag === "Accepted") {
      const updateSeatsQuery = `
        UPDATE rides 
        SET "seatsAvailable" = "seatsAvailable" - 1
        WHERE "rideID" = $1 AND "seatsAvailable" > 0
        RETURNING "seatsAvailable", "totalSeats"
      `;
      
      const seatUpdateResult = await client.query(updateSeatsQuery, [rideID]);
      
      if (seatUpdateResult.rows.length === 0) {
        throw new Error('No seats available or ride not found');
      }
    }

    await client.query('COMMIT');
    return { success: true, message: `Request ${flag.toLowerCase()}d successfully` };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in handleUserReceivedRequest:', error);
    throw error; // Re-throw to be handled by the controller
  } finally {
    client.release();
  }
}

// pending requests jo maine dusre ko maari
// requestBy
export async function getSentRequests(body) {
  const { requestBy } = body;
  const query = `
      SELECT 
        req."rideID" as "requestID", req."requestStatus",
        r."rideID", r.source, r.destination, r.date, r.time, r."totalCost",
        creator.name as "creatorName"
      FROM requests req
      INNER JOIN rides r ON req."rideID" = r."rideID"
      INNER JOIN users creator ON r."createdBy" = creator.id
      WHERE req."requestBy" = $1

    `;
  const values = [requestBy];
  try {
    const response = await pool.query(query, values);
    return response.rows;
  } catch (error) {
    throw new Error(error.message);
  }
}

// requests(pending or not) jo dusro ne muje maari
// createdBy
export async function getReceivedRequests(body) {
  const { createdBy } = body;
  const query = `
        SELECT 
          req."rideID" as "requestID", req."requestStatus", req."requestBy",
          requester.name as "requestByName",
          r."rideID", r.source, r.destination, r.date, r.time
        FROM requests req
        INNER JOIN rides r ON req."rideID" = r."rideID"
        INNER JOIN users requester ON req."requestBy" = requester.id
        WHERE r."createdBy" = $1 
        AND req."requestStatus" = $2

    `;
  const values = [createdBy, "Pending"];
  try {
    const response = await pool.query(query, values);
    return response.rows;
  } catch (error) {
    throw new Error(error.message);
  }
}