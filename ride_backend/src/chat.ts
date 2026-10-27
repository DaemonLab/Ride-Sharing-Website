import { getIO } from "./config/socket-config.js";
import { getRideMembers, addMessage, getOlderMessages } from "./services/chatService.js";
import { logger } from "./config/logger.js";
import { auth } from "./lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";
import { chatRoomSchema, chatMessageSchema } from "./validation/chatSchemas.js";

export function registerChatHandlers() {
  const io = getIO();

  // Socket middleware: authenticate via Bearer token directly with Better Auth
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.headers?.authorization as string | undefined)?.replace(/^Bearer\s+/i, "");

      if (typeof token !== "string" || !token || token.length > 4096) {
        return next(new Error("Authentication error: No token provided"));
      }

      const headers = {
        authorization: `Bearer ${token}`,
      };

      const session = await auth.api.getSession({
        headers: fromNodeHeaders(headers),
      });

      if (!session?.user) {
        return next(new Error("Authentication error: Invalid or expired token"));
      }

      (socket as any).user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        picture: session.user.image ?? null,
      };
      socket.data.userID = session.user.id;
      socket.data.expiresAt = new Date(session.session.expiresAt).getTime();

      next();
    } catch (err) {
      logger.error("Socket authentication error:", err);
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const sessionUser = (socket as any).user;

    if (!sessionUser) {
      logger.warn(`Unauthenticated socket connection rejected: ${socket.id}`);
      socket.disconnect(true);
      return;
    }

    logger.info(`User connected to socket: ${socket.id} (userID: ${sessionUser.id})`);
    socket.join(`user:${sessionUser.id}`);
    const expiryTimer = setTimeout(() => socket.disconnect(true), Math.max(0,
      Math.min(socket.data.expiresAt - Date.now(), 2_147_483_647)));
    expiryTimer.unref();
    let windowStart = Date.now();
    let eventCount = 0;
    socket.use((_packet, next) => {
      if (Date.now() - windowStart >= 60_000) { windowStart = Date.now(); eventCount = 0; }
      if (++eventCount > 60) {
        socket.emit("chat error", "Too many chat requests. Please reconnect later.");
        socket.disconnect(true);
        return;
      }
      next();
    });

    // Join ride room
    socket.on("joinRoom", async (payload: unknown) => {
      const parsed = chatRoomSchema.safeParse(payload);
      if (!parsed.success) {
        socket.emit("chat error", "Invalid ride ID");
        return;
      }
      const numericRideId = parsed.data.rideId;

      try {
        const members = await getRideMembers({ rideID: numericRideId });
        if (!members.some((member) => member.id === sessionUser.id)) {
          socket.emit("chat error", "You are not a member of this ride group");
          return;
        }
        socket.join(String(numericRideId));
        socket.emit("ride members", members);
        logger.info(`User ${sessionUser.id} joined chat room for ride ${numericRideId}`);
      } catch (err) {
        logger.error(`Error fetching members for ride ${numericRideId}:`, err);
        socket.emit("chat error", "Failed to fetch ride members");
      }
    });

    // Fetch older messages
    socket.on("getOlderMessages", async (payload: unknown) => {
      const parsed = chatRoomSchema.safeParse(payload);
      if (!parsed.success) {
        socket.emit("chat error", "Invalid ride ID");
        return;
      }
      const numericRideId = parsed.data.rideId;

      try {
        const members = await getRideMembers({ rideID: numericRideId });
        if (!members.some((member) => member.id === sessionUser.id)) {
          socket.emit("chat error", "You are not a member of this ride group");
          return;
        }
        socket.join(String(numericRideId));
        const messages = await getOlderMessages({ rideID: numericRideId });
        socket.emit("older messages", messages);
      } catch (err) {
        logger.error(`Error fetching older messages for ride ${numericRideId}:`, err);
        socket.emit("chat error", "Failed to fetch chat history");
      }
    });

    // New message
    socket.on("chat message", async (payload: unknown) => {
      const parsed = chatMessageSchema.safeParse(payload);
      if (!parsed.success) {
        socket.emit("chat error", "Invalid ride ID");
        return;
      }
      const numericRideId = parsed.data.rideId;
      const { message } = parsed.data;

      try {
        const members = await getRideMembers({ rideID: numericRideId });
        const member = members.find((candidate) => candidate.id === sessionUser.id);
        if (!member) {
          socket.emit("chat error", "You are not allowed to send messages to this group");
          return;
        }

        const trimmedMessage = message.trim().slice(0, 2000);
        const timestamp = new Date();

        await addMessage({
          rideID: numericRideId,
          user_id: member.id,
          name: member.name,
          message: trimmedMessage,
          timestamp,
        });

        // Recheck recipients too: an old room subscription must not grant
        // access after a passenger leaves or a ride is cancelled.
        const recipients = await io.in(String(numericRideId)).fetchSockets();
        const memberIDs = new Set(members.map((candidate) => candidate.id));
        for (const recipient of recipients) {
          if (!memberIDs.has(recipient.data.userID)) {
            await recipient.leave(String(numericRideId));
            continue;
          }
          recipient.emit("chat message", {
            rideId: String(numericRideId),
            user_id: member.id,
            name: member.name ?? "Anonymous",
            message: trimmedMessage,
            timestamp: timestamp.toISOString(),
          });
        }
      } catch (err) {
        logger.error(`Error saving message for ride ${numericRideId}:`, err);
        socket.emit("chat error", "Failed to send message");
      }
    });

    socket.on("disconnect", () => {
      clearTimeout(expiryTimer);
      logger.info(`Client disconnected from socket: ${socket.id}`);
    });
  });
}
