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

export async function addMessage({ rideID, user_id, name, message, timestamp }) {
  const time = timestamp?.toTimeString().split(" ")[0] || new Date().toTimeString().split(" ")[0];
  const date = timestamp?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0];

  const query = `
    INSERT INTO groupChat
    (rideID, rideOwner, messageBy, message, messageTime, messageDate)
    VALUES ($1, $2, $3, $4, $5, $6)
  `;
  const values = [rideID, name, user_id, message, time, date];

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
  u.name  
  FROM groupChat gc
  JOIN users u ON gc.messageBy = u.id
  WHERE gc.rideID = $1
  ORDER BY gc.messageDate DESC, gc.messageTime DESC
`;

  try {
    const response = await pool.query(query, [rideID]);
    return response.rows;
  } catch (error) {
    throw new Error(error);
  }
}