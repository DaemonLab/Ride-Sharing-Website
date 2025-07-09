import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;


const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
});

export const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        google_id VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        picture TEXT,
        isAdmin BOOLEAN DEFAULT FALSE
      )
    `);

    console.log('Database tables initialized');
  } catch (err) {
    console.error('Error initializing database tables:', err);
    process.exit(1);
  }
};

export default pool;