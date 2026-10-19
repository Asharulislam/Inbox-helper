import type { Message } from "../types.js";

// A line made only of 3 or more dashes separates messages.
// "-----Original Message-----" and a "--" signature line don't count.
const SEPARATOR = /^-{3,}\s*$/;
const HEADER = /^(from|subject):\s*(.*)$/i;

export function parseTextMessages(text: string): Message[] {
  const sections: string[][] = [[]];
  for (const line of text.replace(/\r\n?/g, "\n").split("\n")) {
    if (SEPARATOR.test(line)) sections.push([]);
    else sections.at(-1)!.push(line);
  }

  const messages: Message[] = [];
  for (const lines of sections) {
    if (lines.every((l) => l.trim() === "")) continue;

    // Headers are only read at the top of a message, before the first normal line.
    while (lines.length > 0 && lines[0]!.trim() === "") lines.shift();
    let from = "";
    let subject = "";
    while (lines.length > 0) {
      const match = HEADER.exec(lines[0]!);
      if (!match) break;
      const value = match[2]!.trim();
      if (match[1]!.toLowerCase() === "from") from = value;
      else subject = value;
      lines.shift();
    }

    messages.push({
      id: `t${String(messages.length + 1).padStart(2, "0")}`,
      from: from || "(unknown sender)",
      subject,
      body: lines.join("\n").trim(),
    });
  }
  return messages;
}
