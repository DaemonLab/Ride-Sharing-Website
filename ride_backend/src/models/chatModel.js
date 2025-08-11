import pool from "../config/db.js";

export async function getRideMembers({ rideID }) {
  const query = `
    SELECT u.id, u.name
    FROM users u
    WHERE u.id IN (
      SELECT r."createdBy"
      FROM rides r
      WHERE r."rideID" = $1

      UNION

      SELECT req."requestBy"
      FROM requests req
      WHERE req."rideID" = $1
        AND req."requestStatus" = 'Accepted'
    )
  `;
  try {
    const response = await pool.query(query, [rideID]);
    return response.rows;
  } catch (error) {
    throw new Error(error);
  }
}

export async function addMessage({ rideID, user_id, message, timestamp }) {
  const now = timestamp ? new Date(timestamp) : new Date();
  
  // Format time as HH:MM:SS
  const time = now.toTimeString().split(" ")[0];
  
  // Format date as YYYY-MM-DD
  const date = now.toISOString().split("T")[0];

  // Assuming rideOwner should be the ride's creator's user ID
  // You may need to fetch rideOwner from the rides table if not provided
  // For now, just use user_id for both as a fallback
  const rideOwner = user_id;

  const query = `
    INSERT INTO "groupChat"
    ("rideID", "rideOwner", "messageBy", "message", "messageTime", "messageDate")
    VALUES ($1, $2, $3, $4, $5, $6)
  `;
  const values = [rideID, rideOwner, user_id, message, time, date];

  try {
    await pool.query(query, values);
  } catch (error) {
    throw new Error(error);
  }
}

export async function getOlderMessages({ rideID }) {
  const query = `
    SELECT 
      gc.*,
      u.name,
      gc."messageBy" as user_id
    FROM "groupChat" gc
    JOIN users u ON gc."messageBy" = u.id
    WHERE gc."rideID" = $1
    ORDER BY gc."messageDate" ASC, gc."messageTime" ASC
  `;
  try {
    const response = await pool.query(query, [rideID]);
    return response.rows;
  } catch (error) {
    throw new Error(error);
  }
}