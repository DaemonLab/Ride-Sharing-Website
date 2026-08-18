import { getIO } from "./config/socket-config.js";
import { getRideMembers, addNewMessage, getPreviousMessages } from "./controllers/chatController.js";
import type { IncomingMessage } from "node:http";
import type { SessionData } from "express-session";

interface SessionIncomingMessage extends IncomingMessage {
  session?: SessionData;
}

export function registerChatHandlers(): void {
  const io = getIO();

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    const req = socket.request as SessionIncomingMessage;
    const sessionUser = req.session?.user;

    if (!sessionUser) {
      socket.disconnect(true);
      return;
    }

    // Join ride room
    socket.on("joinRoom", async ({ rideId }) => {
      console.log(`User ${socket.id} joined room ${rideId}`);

      try {
        const members = await getRideMembers({ rideID: rideId });
        if (!members.some((member) => member.id === sessionUser.id)) {
          socket.emit("chat error", "You are not a member of this ride group");
          return;
        }
        socket.join(String(rideId));
        socket.emit("ride members", members);
      } catch (err) {
        console.error("Error fetching members:", err);
      }
    });

    socket.on("getOlderMessages", async ({ rideId }) => {
      try {
        const members = await getRideMembers({ rideID: rideId });
        if (!members.some((member) => member.id === sessionUser.id)) {
          socket.emit("chat error", "You are not a member of this ride group");
          return;
        }
        socket.join(String(rideId));
        const messages = await getPreviousMessages({ rideID: rideId });
        socket.emit("older messages", messages);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    });

    // New message
    socket.on("chat message", async ({ rideId, message }) => {
      try {
        const members = await getRideMembers({ rideID: rideId });
        const member = members.find((candidate) => candidate.id === sessionUser.id);
        if (!member || typeof message !== "string" || !message.trim()) {
          socket.emit("chat error", "You are not allowed to send messages to this group");
          return;
        }

        const trimmedMessage = message.trim().slice(0, 2000);
        await addNewMessage({
          rideID: rideId,
          user_id: member.id,
          name: member.name,
          message: trimmedMessage,
        });

        io.to(String(rideId)).emit("chat message", {
          rideId,
          user_id: member.id,
          name: member.name,
          message: trimmedMessage,
          timestamp: new Date(),
        });
      } catch (err) {
        console.error("Error saving message:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}
