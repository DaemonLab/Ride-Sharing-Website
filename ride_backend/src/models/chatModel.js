import pool from "../config/db.js";



export async function addMessage(body) {
    const {
        rideID,
        ridePublisherID,
        messageBy,    // id or email...if email, then fetch the id from the users table
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
    const values = [rideID , ridePublisherID , messageBy , message , time , date];
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