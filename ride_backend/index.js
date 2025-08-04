import dotenv from "dotenv";
import { logger } from "./src/config/logger.js";
import { initSocket } from "./src/config/socket-config.js";
import http from 'node:http';
import { registerChatHandlers } from "./src/chat.js";
dotenv.config();

import app from "./src/app.js";
const server =  http.createServer(app);
const io = initSocket(server);

registerChatHandlers();

const PORT = process.env.SERVER_PORT || 3000;

server.listen(PORT, () => logger.log("info", `Server running on port ${PORT}`));