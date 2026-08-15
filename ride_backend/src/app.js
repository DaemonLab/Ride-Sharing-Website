import dotenv from "dotenv";
dotenv.config(); // Must run FIRST — before any code that reads process.env

import express from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import pool from "./config/db.js";
import cors from "cors";
import bodyParser from "body-parser";
import rideRoutes from "./routes/rideRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import loginRoutes from "./routes/loginRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import { authenticate } from "./middleware/authMiddleware.js";
import { logger } from "./config/logger.js";

var PgSession = connectPg(session);

const app = express();

// Schema is managed by Prisma — no initDb() needed

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true })); // Allow CORS from the frontend URL
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  rolling: true, // Reset the cookie maxAge on every request
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
    // 'lax' lets the browser send this cookie on cross-origin Axios/fetch calls
    // (frontend localhost:5173 → backend localhost:3000)
    sameSite: 'lax',
  },
  store: new PgSession({
    pool: pool,
    tableName: 'session',
    ttl: 7 * 24 * 60 * 60, // 7 days
    createTableIfMissing: true,
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
app.use("/rides", rideRoutes);// completed mark krne ke liye time se dekh rhe h , jab time khtm ho jye toh apne aap completed mark ho jye
app.use("/chat", chatRoutes);
app.use("/request", requestRoutes);
app.use("/user", userRoutes);
app.use(supportRoutes)

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