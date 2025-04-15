import express from "express";
import pool from "./config/db.js";
import cors from "cors";
import bodyParser from "body-parser";
import rideRoutes from "./routes/rideRoutes.js";    
import chatRoutes from "./routes/chatRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.use("/rides", rideRoutes); 
app.use("/chat", chatRoutes); 
app.use("/request", requestRoutes); 
app.use("/user", userRoutes); 




async function connectDB() {
  try {
    await pool.connect();
    console.log("PostgreSQL connected");
  } catch (err) {
    console.error("Database connection error:", err);
  }
}

connectDB();

export default app;