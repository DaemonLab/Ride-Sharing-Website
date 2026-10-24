import session from "express-session";
import { prisma } from "./prisma.js";

// Custom session store — replaces connect-pg-simple.
// express-session calls these 3 methods to read/write/delete sessions.
// Data is stored in the existing "session" table via Prisma.
export class PrismaStore extends session.Store {

  // Called on every incoming request — loads the session by its cookie ID
  async get(sid: string, callback: (err: any, session?: session.SessionData | null) => void) {
    try {
      const row = await prisma.session.findUnique({ where: { sid } });
      if (!row || row.expire < new Date()) {
        return callback(null, null); // not found or expired -> "not logged in"
      }
      callback(null, row.sess as unknown as session.SessionData);
    } catch (err) {
      callback(err);
    }
  }

  // Called after any response that modified the session — saves/updates the session row
  async set(sid: string, sess: session.SessionData, callback?: (err?: any) => void) {
    const expire = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    try {
      await prisma.session.upsert({
        where:  { sid },
        update: { sess: sess as object, expire },
        create: { sid, sess: sess as object, expire },
      });
      callback?.();
    } catch (err) {
      callback?.(err);
    }
  }

  // Called on logout — removes the session row so the cookie is invalidated
  async destroy(sid: string, callback?: (err?: any) => void) {
    try {
      await prisma.session.delete({ where: { sid } });
      callback?.();
    } catch (err) {
      callback?.(err);
    }
  }
}

