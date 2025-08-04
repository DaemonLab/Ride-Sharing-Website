
import { getIO } from "./config/socket-config.js";
import { getRideMembers, addNewMessage, getPreviousMessages } from "./controllers/chatController.js";

export function registerChatHandlers() {
  const io = getIO();

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Join ride room
    socket.on("joinRoom", async (rideId) => {
      socket.join(rideId);
      console.log(`User ${socket.id} joined room ${rideId}`);

      try {
        const members = await getRideMembers({ rideID: rideId });
        socket.emit("ride members", members);
      } catch (err) {
        console.error("Error fetching members:", err);
      }
    });


    socket.on("getOlderMessages", async (rideId) => {
      socket.join(rideId);
      // console.log(`User ${socket.id} joined room ${rideId}`);

      try {
        const messages = await getPreviousMessages({ rideID: rideId });
        socket.emit("older messages", messages);
      } catch (err) {
        console.error("Error fetching members:", err);
      }
    });

  

    // New message
    socket.on("chat message", async ({ rideId, user, message }) => {
      try {
        const addedMessage = await addNewMessage({
          rideID: rideId,
          user_id: user.id,
          name: user.name,
          message
        });

        io.to(rideId).emit("chat message", {
          rideId,
          user_id: user.id,
          name: user.name,
          message,
          timestamp: new Date()
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