import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { allowedOrigins } from "./origins.js";
import { createAdapter } from "@socket.io/redis-adapter";
import { sharedState, sharedStateReady } from "./redis.js";

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
      allowedHeaders: ["Content-Type"],
    },
    maxHttpBufferSize: 16 * 1024,
    allowRequest: (req, callback) => {
      const origin = req.headers.origin;
      callback(null, !!origin && allowedOrigins.has(origin) && sharedStateReady());
    },
  });
  if (sharedState) {
    io.adapter(createAdapter(sharedState.pub, sharedState.sub));
    for (const client of Object.values(sharedState)) {
      client.on("reconnecting", () => io?.local.disconnectSockets(true));
      client.on("error", () => io?.local.disconnectSockets(true));
    }
  }

  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.IO not initialised — call initSocket() first");
  return io;
}
