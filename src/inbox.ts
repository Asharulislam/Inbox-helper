import { readFile } from "node:fs/promises";
import { z } from "zod";
import { parseTextMessages } from "./parse-text.js";
import { GROUPS, MessageSchema, type Group, type Message, type Result, type Triage } from "./types.js";

export type TriageFn = (message: Message) => Promise<Triage>;

// .txt files use the plain-text format (see parse-text.ts); anything else is read as JSON.
export async function loadMessages(path: string): Promise<Message[]> {
  const raw = await readFile(path, "utf8");
  if (path.toLowerCase().endsWith(".txt")) return parseTextMessages(raw);
  return z.array(MessageSchema).parse(JSON.parse(raw));
}

// Processes messages one at a time. A failed message is recorded as an error
// instead of stopping the whole run.
export async function processInbox(
  messages: Message[],
  triage: TriageFn,
  onProgress?: (done: number, total: number) => void,
): Promise<Result[]> {
  const results: Result[] = [];
  for (const message of messages) {
    try {
      results.push({ message, ok: true, triage: await triage(message) });
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      results.push({ message, ok: false, error });
    }
    onProgress?.(results.length, messages.length);
  }
  return results;
}

// Groups successful results in the fixed GROUPS order, leaving out empty groups.
export function groupResults(results: Result[]): Map<Group, Result[]> {
  const grouped = new Map<Group, Result[]>();
  for (const group of GROUPS) {
    const inGroup = results.filter((r) => r.ok && r.triage.group === group);
    if (inGroup.length > 0) grouped.set(group, inGroup);
  }
  return grouped;
}
