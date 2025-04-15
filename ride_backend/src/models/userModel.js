import pool from "../config/db.js";


export async function Details() {
    const query = `
    SELECT
    *
    FROM users
    WHERE id = $1
    `;
    const values = [1];
    try {
        const response = await pool.query(query , values);
        return response.rows;
    } catch (error) {
        throw new Error(error.message);
    }
    
}