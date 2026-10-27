import { beforeEach, afterEach, expect, jest, test } from "@jest/globals";

const members = jest.fn<() => Promise<Array<{ id: string; name: string }>>>();
const addMessage = jest.fn<() => Promise<void>>();
const oldMessages = jest.fn<() => Promise<unknown[]>>();
const listeners = new Map<string, (...args: any[]) => any>();
let connect: (socket: any) => void;
const staleRecipient = { data: { userID: "former-member" }, leave: jest.fn(), emit: jest.fn() };
const currentRecipient = { data: { userID: "owner" }, leave: jest.fn(), emit: jest.fn() };
const io = {
  use: jest.fn(),
  on: (_event: string, handler: typeof connect) => { connect = handler; },
  in: () => ({ fetchSockets: async () => [staleRecipient, currentRecipient] }),
};
jest.unstable_mockModule("../src/config/socket-config.js", () => ({ getIO: () => io }));
jest.unstable_mockModule("../src/services/chatService.js", () => ({
  getRideMembers: members, addMessage, getOlderMessages: oldMessages,
}));
jest.unstable_mockModule("../src/lib/auth.js", () => ({ auth: { api: {} } }));
jest.unstable_mockModule("../src/config/logger.js", () => ({ logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() } }));
const { registerChatHandlers } = await import("../src/chat.js");
const socket = {
  id: "socket", user: { id: "owner" }, data: { expiresAt: Date.now() + 60_000 },
  join: jest.fn(), emit: jest.fn(), use: jest.fn(), disconnect: jest.fn(),
  on: (event: string, handler: (...args: any[]) => any) => listeners.set(event, handler),
};
beforeEach(() => {
  members.mockResolvedValue([{ id: "owner", name: "Owner" }]);
  addMessage.mockResolvedValue(undefined);
  oldMessages.mockResolvedValue([]);
  registerChatHandlers();
  connect(socket);
});
afterEach(() => { listeners.get("disconnect")!(); });

test("null socket payloads emit errors rather than unhandled rejections", async () => {
  for (const event of ["joinRoom", "getOlderMessages", "chat message"]) {
    await expect(listeners.get(event)!(null)).resolves.toBeUndefined();
  }
  expect(addMessage).not.toHaveBeenCalled();
  expect(socket.emit).toHaveBeenCalledWith("chat error", "Invalid ride ID");
});
test("a former member receives no new chat messages", async () => {
  await listeners.get("chat message")!({ rideId: "7", message: "Hello" });
  expect(staleRecipient.leave).toHaveBeenCalledWith("7");
  expect(staleRecipient.emit).not.toHaveBeenCalled();
  expect(currentRecipient.emit).toHaveBeenCalledWith("chat message", expect.objectContaining({ message: "Hello", user_id: "owner" }));
});
test("nonmembers cannot join, read history, or send messages", async () => {
  members.mockResolvedValue([]);
  await listeners.get("joinRoom")!({ rideId: "7" });
  await listeners.get("getOlderMessages")!({ rideId: "7" });
  await listeners.get("chat message")!({ rideId: "7", message: "Hello" });
  expect(oldMessages).not.toHaveBeenCalled();
  expect(addMessage).not.toHaveBeenCalled();
  expect(socket.join).not.toHaveBeenCalledWith("7");
});
