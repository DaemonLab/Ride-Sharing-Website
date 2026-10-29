import assert from "node:assert/strict";
import { test } from "node:test";
import nodemailer from "nodemailer";

Object.assign(process.env, {
  DATABASE_URL: "postgresql://test:test@127.0.0.1:1/test",
  GOOGLE_CLIENT_ID: "test", GOOGLE_CLIENT_SECRET: "test",
  BETTER_AUTH_SECRET: "test-secret-for-email-tests-only-123456789",
  BETTER_AUTH_URL: "http://localhost:3000", FRONTEND_URL: "http://localhost:5173",
  ALLOWED_DOMAINS: "example.com", NODE_ENV: "test",
  EMAIL_USER_SENDER: "sender@example.com", EMAIL_APP_PASSWORD: "test",
  EMAIL_USER_RECEIVER: "ershavait@gmail.com",
});

const { sendContactEmail } = await import("../src/services/supportService.js");
const input = { name: "Student", email: "student@example.com", subject: "Help", message: "My message" };

test("contact mail includes the message, configured recipient and sender reply address", async (t) => {
  const calls: nodemailer.SendMailOptions[] = [];
  t.mock.method(nodemailer, "createTransport", () => ({
    async sendMail(mail: nodemailer.SendMailOptions) { calls.push(mail); },
  }));
  await sendContactEmail(input);
  assert.equal(calls[0].to, "ershavait@gmail.com");
  assert.deepEqual(calls[0].replyTo, { name: input.name, address: input.email });
  assert.match(String(calls[0].text), /My message/);
  assert.equal(calls[1].to, input.email);
  t.mock.restoreAll();
});

test("failed automatic reply does not reject an already delivered contact message", async (t) => {
  let sent = 0;
  t.mock.method(nodemailer, "createTransport", () => ({
    async sendMail() { if (++sent === 2) throw new Error("Reply unavailable"); },
  }));
  await assert.doesNotReject(sendContactEmail(input));
  assert.equal(sent, 2);
  t.mock.restoreAll();
});

test("support delivery failure is reported without sending an automatic confirmation", async (t) => {
  let sent = 0;
  t.mock.method(nodemailer, "createTransport", () => ({
    async sendMail() { sent++; throw new Error("SMTP unavailable"); },
  }));
  await assert.rejects(sendContactEmail(input), /SMTP unavailable/);
  assert.equal(sent, 1);
  t.mock.restoreAll();
});
