import assert from "node:assert/strict";
import { test } from "node:test";
import { once } from "node:events";
import { createServer } from "node:http";
import { createClient } from "redis";
import { RedisStore } from "rate-limit-redis";
import { Server } from "socket.io";
import { io as connect } from "socket.io-client";
import { createAdapter } from "@socket.io/redis-adapter";

// Explicitly opt in with a disposable Redis service. No institute/server
// availability is assumed, and normal local tests do not contact Redis.
test("two workers share rate counters, room revocation, and disconnects", {
  skip: !process.env.TEST_REDIS_URL, timeout: 15_000,
}, async (t) => {
  const clients = Array.from({ length: 6 }, () => createClient({ url: process.env.TEST_REDIS_URL, socket: { reconnectStrategy: false, connectTimeout: 3000 } }));
  clients.forEach(client => client.on("error", () => {}));
  const servers: Server[] = [];
  const sockets: ReturnType<typeof connect>[] = [];
  t.after(async () => {
    sockets.forEach(socket => socket.disconnect());
    await Promise.all(servers.map(io => new Promise<void>(resolve => io.close(() => resolve()))));
    await Promise.all(clients.map(async client => { if (client.isOpen) await client.close(); }));
  });
  await Promise.all(clients.map(client => client.connect()));
  const prefix = `rideshare:test:${crypto.randomUUID()}:`;
  const stores = clients.slice(0, 2).map(client => new RedisStore({
    prefix, sendCommand: (...args: string[]) => client.sendCommand(args) as any,
  }));
  stores.forEach(store => store.init({ windowMs: 60_000 } as any));
  assert.equal((await stores[0].increment("same-user")).totalHits, 1);
  assert.equal((await stores[1].increment("same-user")).totalHits, 2);
  await stores[0].resetKey("same-user");

  for (let i = 0; i < 2; i++) {
    const server = createServer();
    const io = new Server(server, { adapter: createAdapter(clients[2 + i * 2], clients[3 + i * 2]) });
    servers.push(io);
    io.on("connection", socket => { socket.join("user:member"); socket.join("7"); });
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const socket = connect(`http://127.0.0.1:${(server.address() as { port: number }).port}`, { transports: ["websocket"], autoConnect: false });
    sockets.push(socket);
    const connected = once(socket, "connect"); socket.connect(); await connected;
  }
  assert.equal((await servers[0].in("7").fetchSockets()).length, 2);
  servers[0].in("user:member").socketsLeave("7");
  assert.equal((await servers[0].in("7").fetchSockets()).length, 0);
  const disconnected = once(sockets[1], "disconnect");
  servers[0].in("user:member").disconnectSockets(true);
  await disconnected;
});
