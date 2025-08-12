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

      try {
        const messages = await getPreviousMessages({ rideID: rideId });
        console.log("Raw messages from database:", messages); // Debug log

        // Transform messages to match the expected format
        const formattedMessages = messages.map((msg, index) => {
          console.log(`Processing message ${index}:`, {
            messageDate: msg.messageDate,
            messageTime: msg.messageTime,
            messageBy: msg.messageBy,
            message: msg.message
          });

          let timestamp;
          try {
            if (msg.messageDate && msg.messageTime) {
              // Handle different possible formats
              let dateStr, timeStr;

              if (msg.messageDate instanceof Date) {
                dateStr = msg.messageDate.toISOString().split('T')[0];
              } else {
                dateStr = msg.messageDate.toString().split('T')[0];
              }

              if (msg.messageTime instanceof Date) {
                timeStr = msg.messageTime.toTimeString().split(' ')[0];
              } else {
                timeStr = msg.messageTime.toString();
              }

              const combinedDateTime = `${dateStr}T${timeStr}`;
              console.log(`Combined datetime: ${combinedDateTime}`);

              const dateObj = new Date(combinedDateTime);
              if (isNaN(dateObj.getTime())) {
                throw new Error('Invalid date created');
              }

              timestamp = dateObj.toISOString();
            } else {
              console.log('Missing date or time, using current timestamp');
              timestamp = new Date().toISOString();
            }
          } catch (dateError) {
            console.error('Error parsing timestamp for message:', {
              error: dateError.message,
              messageDate: msg.messageDate,
              messageTime: msg.messageTime
            });
            timestamp = new Date().toISOString();
          }

          return {
            rideId: msg.rideID,
            user_id: msg.messageBy,
            name: msg.name,
            message: msg.message,
            timestamp: timestamp
          };
        });

        // console.log("Formatted messages:", formattedMessages); // Debug log
        socket.emit("older messages", formattedMessages);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    });

    // New message
    socket.on("chat message", async ({ rideId, user, message }) => {
      try {
        const addedMessage = await addNewMessage({
          rideID: rideId,
          user_id: user.id,
          message,
          timestamp: new Date()
        });

        io.to(rideId).emit("chat message", {
          rideId,
          user_id: user.id,
          name: user.name,
          message,
          timestamp: new Date().toISOString()
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