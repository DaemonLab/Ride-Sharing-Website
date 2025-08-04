
import { Server } from "socket.io";

let io; 

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", 
      methods: ["GET", "POST"],
      credentials: true
    }
  });
  return io; 
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized! Call initSocket(server) first.");
  }
  return io;
}
  