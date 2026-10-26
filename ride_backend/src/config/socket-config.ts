import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { env } from "./env.js";

let io: Server;

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: [
        env.frontendUrl,
        "https://ride-sharing-website.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
      ],
      methods: ["GET", "POST"],
      credentials: true,
      allowedHeaders: ["Authorization", "Content-Type"],
    },
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.IO not initialised — call initSocket() first");
  return io;
}
