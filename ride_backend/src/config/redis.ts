import { createClient } from "redis";
import { env } from "./env.js";
import { logger } from "./logger.js";

const makeClient = () => createClient({ url: env.redisUrl, disableOfflineQueue: true, socket: { connectTimeout: 5000 } });
export const sharedState = env.redisUrl ? { rate: makeClient(), pub: makeClient(), sub: makeClient() } : undefined;
for (const client of Object.values(sharedState ?? {})) client.on("error", () => logger.error("Redis connection error"));
export const sharedStateReady = () => !sharedState || Object.values(sharedState).every(client => client.isReady);
export async function connectSharedState() {
  if (!sharedState) return;
  let timeout: ReturnType<typeof setTimeout>;
  try {
    await Promise.race([
      Promise.all(Object.values(sharedState).map(client => client.connect())),
      new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error("Redis startup timeout")), 10_000); }),
    ]);
  } catch (error) {
    for (const client of Object.values(sharedState)) if (client.isOpen) client.destroy();
    throw error;
  } finally { clearTimeout(timeout!); }
}
export async function closeSharedState() {
  if (sharedState) await Promise.all(Object.values(sharedState).map(async client => { if (client.isOpen) await client.close(); }));
}
