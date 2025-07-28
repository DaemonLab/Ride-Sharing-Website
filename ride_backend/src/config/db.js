import pkg from "pg";
import dotenv from "dotenv";
import { logger } from "./logger.js";

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
  max: 5, // Reduce max connections for cloud DB
  idleTimeoutMillis: 300000, // 5 minutes
  connectionTimeoutMillis: 10000, // 10 seconds
  query_timeout: 30000, // 30 seconds
  keepAlive: true,
  keepAliveInitialDelayMillis: 0,
  statement_timeout: 30000, // 30 seconds
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
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

    logger.info('Database tables initialized');
  } catch (err) {
    logger.error('Error initializing database tables:', err);
  }
};

export default pool;