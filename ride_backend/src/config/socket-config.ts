import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import type { RequestHandler } from "express";
import { env } from "./env.js";

let io: Server;

export function initSocket(server: HttpServer, sessionMiddleware?: RequestHandler) {
  io = new Server(server, {
    cors: {
      origin: env.frontendUrl,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Share the Express session with Socket.IO so authenticated users
  // can be identified from socket.request.session.user
  if (sessionMiddleware) {
    io.engine.use((req: any, res: any, next: any) => sessionMiddleware(req, res, next));
  }

  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.IO not initialised — call initSocket() first");
  return io;
}

