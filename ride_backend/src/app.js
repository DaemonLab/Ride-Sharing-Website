import express from "express";
import session from "express-session";
import connectPg from "connect-pg-simple"
import pool, { initDb } from "./config/db.js";
import cors from "cors";
import bodyParser from "body-parser";
import rideRoutes from "./routes/rideRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import loginRoutes from "./routes/loginRoutes.js";
import dotenv from "dotenv";
import { authenticate, isAdmin } from "./middleware/authMiddleware.js";
import { logger } from "./config/logger.js";

dotenv.config();

var PgSession = connectPg(session);
const app = express();
initDb();
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true })); // Allow CORS from the frontend URL
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  rolling: true, // Reset the cookie maxAge on every request
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
  },
  store: new PgSession({
    pool: pool, // Use the existing pool from db.js
    tableName: 'session',
    ttl: 7 * 24 * 60 * 60, // Set TTL for sessions (7 days)
    createTableIfMissing: true, // Create the table if it doesn't exist
  }),
  secret: process.env.SESSION_SECRET || "default_secret",
  resave: false,
  saveUninitialized: false,
}));


app.use("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});
app.use("/auth", loginRoutes);

app.use(authenticate);
app.use("/rides", rideRoutes);
app.use("/request", requestRoutes);
app.use("/chat", chatRoutes);
app.use("/user", userRoutes);

async function connectDB() {
  try {
    await pool.connect();
    logger.log("info", "PostgreSQL connected");
  } catch (err) {
    logger.log("error", "Database connection error:", err);
  }
}

connectDB();

export default app;