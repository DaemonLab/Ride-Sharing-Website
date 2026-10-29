import { contactSchema, escapeHtml } from "../src/validation/supportSchemas.js";
import { chatRoomSchema, chatMessageSchema } from "../src/validation/chatSchemas.js";
import { rideIdBodySchema, handleRequestSchema } from "../src/validation/idSchemas.js";

test("HTTP ride IDs reject missing bodies, coercion tricks and database integer overflow", () => {
  for (const body of [undefined, null, {}, { rideID: true }, { rideID: [7] },
    { rideID: "" }, { rideID: "1e2" }, { rideID: 2_147_483_648 }]) {
    expect(rideIdBodySchema.safeParse(body).success).toBe(false);
  }
  expect(rideIdBodySchema.parse({ rideID: "7" })).toEqual({ rideID: 7 });
  expect(handleRequestSchema.safeParse({ rideID: 7, requestBy: "   ", flag: "Accepted" }).success).toBe(false);
});

test("contact input rejects wrong types, mail header injection, and oversized messages", () => {
  const valid = { name: "Student", email: "student@example.com", subject: "Question", message: "Hello" };
  expect(contactSchema.parse(valid)).toEqual(valid);
  for (const patch of [
    { name: {} }, { email: "victim@example.com,other@example.com" },
    { subject: "Hello\r\nBcc: victim@example.com" }, { message: "x".repeat(5001) },
  ]) expect(contactSchema.safeParse({ ...valid, ...patch }).success).toBe(false);
  expect(escapeHtml('<img src="x">&\'')).toBe("&lt;img src=&quot;x&quot;&gt;&amp;&#39;");
});

test("malformed socket payloads are rejected without throwing", () => {
  for (const payload of [undefined, null, [], "7", { rideId: {} }, { rideId: true }, { rideId: -1 }, { rideId: 2 ** 40 }]) {
    expect(chatRoomSchema.safeParse(payload).success).toBe(false);
  }
  expect(chatRoomSchema.parse({ rideId: "7" })).toEqual({ rideId: 7 });
  expect(chatMessageSchema.safeParse({ rideId: "7", message: " " }).success).toBe(false);
  expect(chatMessageSchema.safeParse({ rideId: "7", message: "x".repeat(2001) }).success).toBe(false);
});
