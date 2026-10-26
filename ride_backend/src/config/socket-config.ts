import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import type { RequestHandler } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth.js";
import { toAuthenticatedUser } from "../middleware/authMiddleware.js";
import { env } from "./env.js";

let io: Server;

export function initSocket(server: HttpServer, sessionMiddleware?: RequestHandler) {
  io = new Server(server, {
    cors: {
      origin: env.trustedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.engine.use((req: any, res: any, next: any) => {
    const resolveAuth = async (sessionError?: unknown) => {
      if (sessionError) return next(sessionError);
      try {
        const authSession = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
        req.authUser = authSession
          ? toAuthenticatedUser(authSession.user)
          : (req.session?.user ?? null);
        next();
      } catch (error) {
        next(error);
      }
    };

    if (sessionMiddleware) {
      sessionMiddleware(req, res, resolveAuth);
      return;
    }
    void resolveAuth();
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.IO not initialised — call initSocket() first");
  return io;
}
