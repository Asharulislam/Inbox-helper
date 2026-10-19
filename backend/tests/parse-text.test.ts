import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parseTextMessages } from "../src/inbox/parse-text.js";

test("splits messages on --- and reads From and Subject", () => {
  const messages = parseTextMessages("From: Ann <ann@example.com>\nSubject: Hi\n\nHello there\n---\nFrom: Bob\nSecond message");
  assert.equal(messages.length, 2);
  assert.deepEqual(messages[0], { id: "t01", from: "Ann <ann@example.com>", subject: "Hi", body: "Hello there" });
  assert.deepEqual(messages[1], { id: "t02", from: "Bob", subject: "", body: "Second message" });
});

test("a message without headers gets an unknown sender", () => {
  const [m] = parseTextMessages("hi is the role still open?");
  assert.equal(m!.from, "(unknown sender)");
  assert.equal(m!.subject, "");
  assert.equal(m!.body, "hi is the role still open?");
});

test("skips empty sections and extra blank lines", () => {
  const messages = parseTextMessages("\n\nfirst\n---\n\n   \n---\n---\nsecond\n\n\n");
  assert.deepEqual(
    messages.map((m) => m.body),
    ["first", "second"],
  );
  assert.deepEqual(
    messages.map((m) => m.id),
    ["t01", "t02"],
  );
});

test("signature lines and forwarded-email markers are not separators", () => {
  const text = "Thanks\n--\nOlivia\n-----Original Message-----\nFrom: Recruiting Team\nHi Olivia";
  const messages = parseTextMessages(text);
  assert.equal(messages.length, 1);
  assert.ok(messages[0]!.body.includes("-----Original Message-----"));
});

test("a From: line inside the body stays in the body", () => {
  const [m] = parseTextMessages("From: Chloe\nSee below\n\nFrom: Recruiting Team\nYour interview is confirmed");
  assert.equal(m!.from, "Chloe");
  assert.ok(m!.body.includes("From: Recruiting Team"));
});

test("handles Windows line endings", () => {
  const messages = parseTextMessages("From: Ann\r\nHello\r\n---\r\nBye\r\n");
  assert.deepEqual(
    messages.map((m) => [m.from, m.body]),
    [
      ["Ann", "Hello"],
      ["(unknown sender)", "Bye"],
    ],
  );
});

test("parses the sample inbox.txt into 24 messages", async () => {
  const messages = parseTextMessages(await readFile("../data/inbox.txt", "utf8"));
  assert.equal(messages.length, 24);
  assert.ok(messages.every((m) => m.body.length > 0));
  assert.equal(messages.at(-1)!.subject, "no sender");
  assert.equal(messages.at(-1)!.from, "(unknown sender)");
});
