// Read-only: verify configuration and all scalar model columns without logging data.
import { env } from "../dist/src/config/env.js";
import { prisma } from "../dist/src/config/prisma.js";

try {
  await Promise.all([
    prisma.user.findFirst(), prisma.session.findFirst(), prisma.account.findFirst(),
    prisma.verification.findFirst(), prisma.rides.findFirst(),
    prisma.requests.findFirst(), prisma.groupChat.findFirst(),
  ]);
  console.log(`Configuration and database models verified (${env.nodeEnv}).`);
  console.log(`Google callback: ${env.betterAuthUrl}/api/auth/callback/google`);
  console.log(`Frontend origin: ${env.frontendUrl}`);
} catch (error) {
  console.error(`Deployment check failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
