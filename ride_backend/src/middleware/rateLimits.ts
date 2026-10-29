import { rateLimit, type Store, type Options } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { sharedState } from "../config/redis.js";

export function sharedStore(prefix: string): Store | undefined {
  if (!sharedState) return undefined;
  const client = sharedState.rate;
  let store: RedisStore | undefined;
  let options: Options;
  const getStore = () => {
    if (!store) {
      store = new RedisStore({ prefix: `rideshare:${prefix}:`, sendCommand: (...args: string[]) => client.sendCommand(args) as Promise<number | string | boolean | (number | string | boolean)[]> });
      store.init(options);
    }
    return store;
  };
  return {
    init: value => { options = value; },
    increment: key => getStore().increment(key),
    decrement: key => getStore().decrement(key),
    resetKey: key => getStore().resetKey(key),
  };
}

// In-memory limits apply per server process. Use a shared store before scaling
// the backend across multiple instances.
export const contactRateLimit = rateLimit({
  store: sharedStore("contact"),
  windowMs: 15 * 60_000, limit: 5, standardHeaders: "draft-8", legacyHeaders: false,
  message: { success: false, message: "Too many contact requests. Please try again later." },
});
export const loginRateLimit = rateLimit({
  store: sharedStore("login"),
  windowMs: 15 * 60_000, limit: 30, standardHeaders: "draft-8", legacyHeaders: false,
  message: { success: false, message: "Too many sign-in attempts. Please try again later." },
});
export const apiRateLimit = rateLimit({
  store: sharedStore("api"),
  windowMs: 60_000, limit: 120, standardHeaders: "draft-8", legacyHeaders: false,
  keyGenerator: (req) => req.currentUser!.id,
  message: { success: false, message: "Too many requests. Please try again shortly." },
});
