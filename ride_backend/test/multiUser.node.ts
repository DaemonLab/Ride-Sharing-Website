import assert from "node:assert/strict";
import { test } from "node:test";
import { once } from "node:events";
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { serializeSignedCookie } from "better-call";
import { io as connect } from "socket.io-client";

// Fake configuration guarantees these simulations never contact the real DB.
Object.assign(process.env, {
  DATABASE_URL: "postgresql://test:test@127.0.0.1:1/test", NODE_ENV: "test",
  FRONTEND_URL: "http://localhost:5173", BETTER_AUTH_URL: "http://localhost:3000",
  BETTER_AUTH_SECRET: "test-cookie-secret-1234567890123456789012345", ALLOWED_DOMAINS: "example.com",
  GOOGLE_CLIENT_ID: "test", GOOGLE_CLIENT_SECRET: "test", EMAIL_USER_SENDER: "test@example.com",
  EMAIL_APP_PASSWORD: "test", EMAIL_USER_RECEIVER: "test@example.com", REDIS_URL: "", MULTI_INSTANCE: "false",
});

test("three-user HTTP and WebSocket isolation with real signed cookie validation", { timeout: 20_000 }, async (t) => {
  const users = ["owner", "member", "outsider"].map(id => ({
    id, name: id, email: `${id}@example.com`, emailVerified: true, image: null,
    createdAt: new Date(), updatedAt: new Date(),
  }));
  const sessions = users.map(user => ({ id: `session-${user.id}`, token: `token-${user.id}`, userId: user.id,
    expiresAt: new Date(Date.now() + 60_000), createdAt: new Date(), updatedAt: new Date(),
  }));
  const memoryAuth = betterAuth({
    baseURL: "http://localhost:3000", secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: ["http://localhost:5173"],
    database: memoryAdapter({ user: users, session: sessions, account: [], verification: [] }),
    advanced: { defaultCookieAttributes: { httpOnly: true, sameSite: "lax" } },
  });
  const { auth } = await import("../src/lib/auth.js");
  const { prisma } = await import("../src/config/prisma.js");
  t.mock.method(auth.api, "getSession", (input: any) => memoryAuth.api.getSession(input));
  t.mock.method(auth.api, "signOut", (input: any) => memoryAuth.api.signOut(input));
  const ride = { rideID: 7, createdBy: "owner", rideStatus: "Pending", creator: users[0],
    requests: [{ requestBy: "member", requester: users[1] }], source: "Campus", destination: "Station" };
  // Prisma model methods are generated proxy properties, so replace them in
  // this isolated test process rather than inspecting property descriptors.
  (prisma.rides as any).findUnique = async () => ride;
  (prisma.requests as any).findMany = async () => [{ requestBy: "member" }];
  (prisma.user as any).findMany = async () => users.slice(0, 2);
  (prisma.groupChat as any).findMany = async () => [];
  (prisma.groupChat as any).create = async () => ({});

  const { default: app } = await import("../src/app.js");
  const { initSocket, revokeRideAccess } = await import("../src/config/socket-config.js");
  const { registerChatHandlers } = await import("../src/chat.js");
  const server = app.listen(0, "127.0.0.1");
  const io = initSocket(server);
  registerChatHandlers();
  const sockets: ReturnType<typeof connect>[] = [];
  t.after(async () => {
    sockets.forEach(socket => socket.disconnect());
    await new Promise<void>(resolve => io.close(() => resolve()));
    await prisma.$disconnect();
  });
  await once(server, "listening");
  const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
  const cookies = await Promise.all(sessions.map(session =>
    serializeSignedCookie("better-auth.session_token", session.token, process.env.BETTER_AUTH_SECRET!).then(value => value.split(";")[0])));
  for (let i = 0; i < users.length; i++) {
    const status = await fetch(`${base}/auth/status`, { headers: { Cookie: cookies[i] } });
    assert.equal(status.status, 200);
    assert.equal((await status.json()).user.id, users[i].id);
    const group = await fetch(`${base}/rides/7/group`, { headers: { Cookie: cookies[i] } });
    assert.equal(group.status, i === 2 ? 403 : 200);
  }
  assert.equal((await fetch(`${base}/auth/status`, { headers: { Cookie: "better-auth.session_token=forged" } })).status, 401);
  for (const path of ['/request/sendRequest', '/request/handleRequest', '/chat/rideMembers']) {
    for (const body of [undefined, { rideID: true }, { rideID: 2_147_483_648 }]) {
      const response = await fetch(`${base}${path}`, {
        method: 'POST', headers: { Cookie: cookies[0], Origin: 'http://localhost:5173',
          'X-Requested-With': 'XMLHttpRequest', 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      assert.equal(response.status, 400);
      assert.equal((await response.json()).message, 'Please check the information you entered and try again.');
    }
  }
  assert.equal((await fetch(`${base}/rides/2147483648/group`, { headers: { Cookie: cookies[0] } })).status, 400);

  for (const cookie of cookies) {
    const socket = connect(base, { transports: ["websocket"], extraHeaders: { Cookie: cookie, Origin: "http://localhost:5173" }, autoConnect: false, reconnection: false });
    sockets.push(socket);
    const connected = Promise.race([once(socket, "connect"), once(socket, "connect_error").then(([error]) => { throw error; })]);
    socket.connect();
    await connected;
  }
  for (const socket of sockets.slice(0, 2)) {
    const joined = once(socket, "ride members");
    socket.emit("joinRoom", { rideId: 7 });
    await joined;
  }
  const denied = once(sockets[2], "chat error");
  sockets[2].emit("joinRoom", { rideId: 7 });
  assert.match(String((await denied)[0]), /not a member/);
  revokeRideAccess(7, "member");
  let leakedMessages = 0;
  sockets[1].on("chat message", () => leakedMessages++);
  sockets[2].on("chat message", () => leakedMessages++);
  const delivered = once(sockets[0], "chat message");
  const acknowledged = await sockets[0].timeout(3000).emitWithAck("chat message", { rideId: 7, message: "Private coordination" });
  assert.deepEqual(acknowledged, { ok: true });
  await delivered;
  await new Promise(resolve => setTimeout(resolve, 150));
  assert.equal(leakedMessages, 0);
  assert.deepEqual(await sockets[2].timeout(3000).emitWithAck('chat message', { rideId: 7, message: 'Denied' }), { ok: false });
  (prisma.groupChat as any).create = async () => { throw new Error('Simulated write failure'); };
  assert.deepEqual(await sockets[0].timeout(3000).emitWithAck('chat message', { rideId: 7, message: 'Not saved' }), { ok: false });
  const disconnected = once(sockets[0], "disconnect");
  const logout = await fetch(`${base}/auth/logout`, {
    method: "POST", headers: { Cookie: cookies[0], Origin: "http://localhost:5173", "X-Requested-With": "XMLHttpRequest" },
  });
  assert.equal(logout.status, 200);
  assert.match(logout.headers.get("set-cookie") ?? "", /Max-Age=0/i);
  await disconnected;
  assert.equal((await fetch(`${base}/auth/status`, { headers: { Cookie: cookies[0] } })).status, 401);
  assert.equal((await fetch(`${base}/auth/status`, { headers: { Cookie: cookies[1] } })).status, 200);
});
