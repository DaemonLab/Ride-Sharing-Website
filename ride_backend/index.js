// import dotenv from "dotenv";
// dotenv.config();

// import app from "./src/app.js";

// const PORT = process.env.SERVER_PORT || 3000;

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server } from "socket.io";
import app from "./src/app.js";

const PORT = process.env.SERVER_PORT || 3000;

// Create HTTP server with Express app
const server = http.createServer(app);

// Attach Socket.io to the HTTP server
const io = new Server(server, {
  cors: {
    origin: "*", //  For development only. Set proper domain in production.
    methods: ["GET", "POST"]
  }
});

// Handle socket connections
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinRide", (rideID) => {
    socket.join(rideID);
    console.log(`User ${socket.id} joined ride room ${rideID}`);
  });

  socket.on("sendMessage", (messageData) => {
    const { rideID } = messageData;
    io.to(rideID).emit("newMessage", messageData);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
