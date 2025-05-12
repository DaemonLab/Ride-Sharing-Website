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
        const response = await pool.query(query, values);
        return response.rows;
    } catch (error) {
        throw new Error(error.message);
    }
}

export async function getUserById(id) {
    const query = `
    SELECT
    *
    FROM users
    WHERE id = $1
    `;
    const values = [id];
    try {
        const response = await pool.query(query, values);
        return response.rows[0];
    }
    catch (error) {
        throw new Error(error.message);
    }
}

export async function findByGoogleId(googleId) {
    const result = await pool.query(
        'SELECT * FROM users WHERE google_id = $1',
        [googleId]
    );
    return result.rows[0];
}

export async function create(userData) {
    const result = await pool.query(
        `INSERT INTO users 
       (google_id, email, name, picture, access_token, refresh_token, token_expiry)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
        [
            userData.googleId,
            userData.email,
            userData.name,
            userData.picture,
            userData.accessToken,
            userData.refreshToken,
            userData.tokenExpiry
        ]
    );
    return result.rows[0];
}

export async function update(id, userData) {
    let query = 'UPDATE users SET ';
    const params = [];
    const values = [];

    if (userData.accessToken) {
        params.push(`access_token = $${values.length + 1}`);
        values.push(userData.accessToken);
    }

    if (userData.refreshToken) {
        params.push(`refresh_token = $${values.length + 1}`);
        values.push(userData.refreshToken);
    }

    if (userData.tokenExpiry) {
        params.push(`token_expiry = $${values.length + 1}`);
        values.push(userData.tokenExpiry);
    }

    if (userData.name) {
        params.push(`name = $${values.length + 1}`);
        values.push(userData.name);
    }

    if (userData.picture) {
        params.push(`picture = $${values.length + 1}`);
        values.push(userData.picture);
    }

    if (params.length === 0) {
        return null;
    }

    query += params.join(', ');
    query += ` WHERE id = $${values.length + 1} RETURNING *`;
    values.push(id);

    const result = await pool.query(query, values);
    return result.rows[0];
}
