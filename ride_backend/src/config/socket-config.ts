import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { allowedOrigins } from "./origins.js";

let io: Server | undefined;

export function revokeRideAccess(rideID: number, userID?: string) {
  if (userID) io?.in(`user:${userID}`).socketsLeave(String(rideID));
  else io?.in(String(rideID)).socketsLeave(String(rideID));
}

export function disconnectUser(userID: string) {
  io?.in(`user:${userID}`).disconnectSockets(true);
}

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: [...allowedOrigins],
      methods: ["GET", "POST"],
      credentials: true,
      allowedHeaders: ["Authorization", "Content-Type"],
    },
    maxHttpBufferSize: 16 * 1024,
    allowRequest: (req, callback) => {
      const origin = req.headers.origin;
      callback(null, !origin || allowedOrigins.has(origin));
    },
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.IO not initialised — call initSocket() first");
  return io;
}
