import pool from "../config/db.js";


export async function getRideMembers(body) {
    const { rideID } = body;
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
    const values = [rideID];

    try {
        const response = await pool.query(query , values);
        return response.rows;
    } catch (error) {
        throw new Error(error);
    }  
}


export async function addMessage(body) {
    const {
        rideID,
        rideOwner,
        messageBy,     
        message,
        time,
        date
    } = body;
    const query = `
    INSERT INTO groupChat
    (rideID , rideOwner , messageBy , message , messageTime , messageDate)
    VALUES
    ($1 , $2 , $3 , $4 , $5 , $6)
    `;
    const values = [rideID , rideOwner , messageBy , message , time , date];
    try {
        await pool.query(query , values);
    } catch (error) {
        throw new Error(error);
    }
}


export async function getOlderMessages(body) {
    const {rideID } = body;
    const query = `
    SELECT * FROM groupChat 
    WHERE rideID = $1
    `
    try {
        const response = await pool.query(query , [rideID]);
        return response.rows;
    } catch (error) {
        throw new Error(error);
    }
    
}