import http from "node:http";
import app from "./app.js";
import { prisma } from "./config/prisma.js";
import { env } from "./config/env.js";
import { initSocket } from "./config/socket-config.js";
import { registerChatHandlers } from "./chat.js";
import { logger } from "./config/logger.js";

export async function startServer() {
  await prisma.$queryRaw`SELECT 1`;
  const server = http.createServer(app);
  initSocket(server, app.locals.sessionMiddleware);
  registerChatHandlers();

  server.listen(env.port, () => logger.info(`Server running on port ${env.port}`));

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received; shutting down gracefully`);
    await new Promise<void>((resolve) => server.close(() => resolve()));
  };
  process.once("SIGTERM", () => void shutdown("SIGTERM"));
  process.once("SIGINT",  () => void shutdown("SIGINT"));
  return server;
}

if (process.env.NODE_ENV !== "test") {
  startServer().catch((error) => {
    logger.error("Unable to start server:", error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}

