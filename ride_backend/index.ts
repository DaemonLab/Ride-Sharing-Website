import http from "node:http";
import app from "./src/app.js";
import { initSocket } from "./src/config/socket-config.js";
import { registerChatHandlers } from "./src/chat.js";
import { prisma } from "./src/config/prisma.js";
import { logger } from "./src/config/logger.js";
import { env } from "./src/config/env.js";

async function startServer() {
  try {
    // Verify the database is reachable before accepting requests
    await prisma.$queryRaw`SELECT 1`;
    logger.info("Database connected.");

    // Purge expired Better Auth sessions on startup and every 6 hours
    async function cleanupExpiredSessions() {
      const deleted = await prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
      if (deleted.count > 0) logger.info(`Session cleanup: removed ${deleted.count} expired session(s).`);
    }
    await cleanupExpiredSessions();
    const cleanupTimer = setInterval(() => {
      cleanupExpiredSessions().catch((error) => logger.error("Session cleanup failed:", error));
    }, 6 * 60 * 60 * 1000); // every 6 hours

    const server = http.createServer(app);

    const io = initSocket(server);
    registerChatHandlers();

    await new Promise<void>((resolve, reject) => {
      server.once("error", reject);
      server.listen(env.port, "0.0.0.0", resolve);
    });
    logger.info(`Server listening on port ${env.port}`);

    // Graceful shutdown — finish in-flight requests before exiting
    let shuttingDown = false;
    const shutdown = () => {
      if (shuttingDown) return;
      shuttingDown = true;
      clearInterval(cleanupTimer);
      const deadline = setTimeout(() => process.exit(1), 10_000);
      deadline.unref();
      io.close(() => {
        prisma.$disconnect().then(() => process.exit(0)).catch(() => process.exit(1));
      });
    };
    process.once("SIGTERM", shutdown);
    process.once("SIGINT", shutdown);
  } catch (error) {
    logger.error(`Startup failed: ${(error as Error).message}`);
    process.exit(1);
  }
}

startServer();
