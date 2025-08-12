// Ride Sharing/ride_backend/index.js

import dotenv from "dotenv";
import { logger } from "./src/config/logger.js";
import { initSocket } from "./src/config/socket-config.js";
import http from 'node:http';
import { registerChatHandlers } from "./src/chat.js";
dotenv.config();

import http from "http"; // 1. Import the native http module
import { initSocket } from "./src/config/socket-config.js"; // 2. Import your socket initializer
import { registerChatHandlers } from "./src/chat.js"; // 3. Import your chat event handlers
import app from "./src/app.js"; // Your existing Express app

const PORT = process.env.SERVER_PORT || 3000;

// 4. Create an HTTP server instance using your Express app
const httpServer = http.createServer(app);

// 5. Initialize Socket.IO by passing it the httpServer
// This correctly attaches Socket.IO's required handlers (like /socket.io/)
initSocket(httpServer);

// 6. Now that Socket.IO is initialized, register your custom chat event handlers
registerChatHandlers();

// 7. IMPORTANT: Start the httpServer, not the Express app directly
httpServer.listen(PORT, () => logger.log("info", `Server with Socket.IO running on port ${PORT}`));
