import { getIO } from "./config/socket-config.js";
import { getRideMembers, addMessage, getOlderMessages } from "./services/chatService.js";
import { logger } from "./config/logger.js";
import { auth } from "./lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";
import { chatRoomSchema, chatMessageSchema } from "./validation/chatSchemas.js";
import { sharedState } from "./config/redis.js";

export function registerChatHandlers() {
  const io = getIO();

  // Socket middleware: validate the handshake's HttpOnly session cookie.
  io.use(async (socket, next) => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(socket.handshake.headers),
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
    socket.use(async (_packet, next) => {
      if (Date.now() - windowStart >= 60_000) { windowStart = Date.now(); eventCount = 0; }
      if (++eventCount > 60) {
        socket.emit("chat error", "Too many chat requests. Please reconnect later.");
        socket.disconnect(true);
        return;
      }
      try {
        if (sharedState) {
          const count = await sharedState.rate.eval(
            "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('PEXPIRE',KEYS[1],60000) end; return n",
            { keys: [`rideshare:chat:${sessionUser.id}`], arguments: [] },
          );
          if (Number(count) > 60) { socket.disconnect(true); return; }
        }
        const session = await auth.api.getSession({ headers: fromNodeHeaders(socket.handshake.headers) });
        if (!session?.user || session.user.id !== sessionUser.id) { socket.disconnect(true); return; }
      } catch { socket.disconnect(true); return; }
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
    socket.on("chat message", async (payload: unknown, acknowledge?: (result: { ok: boolean }) => void) => {
      let saved = false;
      let replied = false;
      const reply = (ok: boolean) => {
        if (!replied && typeof acknowledge === "function") { replied = true; acknowledge({ ok }); }
      };
      const parsed = chatMessageSchema.safeParse(payload);
      if (!parsed.success) {
        reply(false);
        socket.emit("chat error", "Invalid ride ID");
        return;
      }
      const numericRideId = parsed.data.rideId;
      const { message } = parsed.data;

      try {
        const members = await getRideMembers({ rideID: numericRideId });
        const member = members.find((candidate) => candidate.id === sessionUser.id);
        if (!member) {
          reply(false);
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
        saved = true;
        reply(true);

        // Recheck recipients too: an old room subscription must not grant
        // access after a passenger leaves or a ride is cancelled.
        const recipients = await io.in(String(numericRideId)).fetchSockets();
        const currentMembers = await getRideMembers({ rideID: numericRideId });
        const memberIDs = new Set(currentMembers.map((candidate) => candidate.id));
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
        reply(false);
        logger.error(`Error saving message for ride ${numericRideId}:`, err);
        socket.emit("chat error", saved ? "Your message was saved. Please reconnect to refresh the chat." : "Failed to send message");
      }
    });

    socket.on("disconnect", () => {
      clearTimeout(expiryTimer);
      logger.info(`Client disconnected from socket: ${socket.id}`);
    });
  });
}
