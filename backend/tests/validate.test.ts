import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parseTextMessages } from "../src/inbox/parse-text.js";
import { MAX_MESSAGES, validateInbox } from "../src/inbox/validate.js";

const check = (text: string) => validateInbox(text, parseTextMessages(text));

test("rejects an empty or blank file", () => {
  assert.equal(check(""), "The file is empty.");
  assert.equal(check("   \n\n  "), "The file is empty.");
});

test("rejects a file with only separators", () => {
  assert.equal(check("---\n---\n"), "No messages found in the file.");
});

test("rejects random text with no From: line", () => {
  assert.match(check("asdkjh qwe zxcvb 2938\nlkjsdf") ?? "", /doesn't look like a messages file/);
  assert.match(check("2 eggs\n1 cup of flour\nmix well") ?? "", /doesn't look like a messages file/);
});

test(`rejects more than ${MAX_MESSAGES} messages`, () => {
  const text = Array.from({ length: MAX_MESSAGES + 1 }, (_, i) => `From: person${i}\nHello`).join("\n---\n");
  assert.equal(check(text), `The file has ${MAX_MESSAGES + 1} messages. The limit is ${MAX_MESSAGES} per file.`);
});

test(`accepts exactly ${MAX_MESSAGES} messages`, () => {
  const text = Array.from({ length: MAX_MESSAGES }, (_, i) => `From: person${i}\nHello`).join("\n---\n");
  assert.equal(check(text), null);
});

test("rejects a message with no readable words", () => {
  assert.equal(check("From: Ann\nHello\n---\nFrom: Bob\n12345 !!! ???"), "Message t02 (from Bob) has no readable text.");
});

test("accepts an empty email (sender only)", () => {
  assert.equal(check("From: Ann\nHello\n---\nFrom: Oliver Grant"), null);
});

test("accepts words in other languages", () => {
  assert.equal(check("From: Lukas\nGuten Tag, ich ziehe meine Bewerbung zurück."), null);
  assert.equal(check("From: Yuki\nこんにちは"), null);
});

test("accepts the sample inbox.txt", async () => {
  assert.equal(check(await readFile("data/inbox.txt", "utf8")), null);
});
