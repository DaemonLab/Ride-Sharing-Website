import { expect, jest, test } from "@jest/globals";

const getRideMembers = jest.fn<(...args: unknown[]) => Promise<Array<{ id: number }>>>();
jest.unstable_mockModule("../src/services/chatService.js", () => ({
  getRideMembers,
  addMessage: jest.fn(),
  getOlderMessages: jest.fn(),
}));

const { getRideMembersHttp } = await import("../src/controllers/chatController.js");

test("only a ride participant can retrieve the chat group", async () => {
  getRideMembers.mockResolvedValue([{ id: 1 }, { id: 2 }]);
  const req = { body: { rideID: 7 }, authUser: { id: 3 } } as never;
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as never;
  const next = jest.fn();

  await getRideMembersHttp(req, res, next);

  expect(res.status).toHaveBeenCalledWith(403);
  expect(res.json).toHaveBeenCalledWith({
    success: false,
    message: "Only ride members can view this group",
  });
});
