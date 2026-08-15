import pkg from "pg";
import dotenv from "dotenv";
import { logger } from "./logger.js";

dotenv.config();

const { Pool } = pkg;

/**
 * Raw pg Pool — kept ONLY for connect-pg-simple (session store).
 * All application data queries now go through Prisma (src/config/prisma.js).
 *
 * Uses DATABASE_URL (the Neon pooler connection string).
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
  max: 5,
  idleTimeoutMillis: 300000,
  connectionTimeoutMillis: 10000,
});

pool.on("error", (err) => {
  logger.error("Unexpected error on idle pg client", err);
});

export default pool;