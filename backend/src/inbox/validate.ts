import type { Message } from "../types.js";

export const MAX_MESSAGES = 30;

const FROM_LINE = /^from:/im;
// At least one word of two or more letters, in any language.
const HAS_WORDS = /\p{L}{2,}/u;

// Checks that an uploaded text file looks like a messages file before any AI call is made.
// Returns an error message for the user, or null if the file is fine.
export function validateInbox(text: string, messages: Message[]): string | null {
  if (text.trim() === "") return "The file is empty.";
  if (messages.length === 0) return "No messages found in the file.";
  if (!FROM_LINE.test(text)) {
    return "This doesn't look like a messages file: no message starts with a \"From:\" line. Download the sample to see the format.";
  }
  if (messages.length > MAX_MESSAGES) {
    return `The file has ${messages.length} messages. The limit is ${MAX_MESSAGES} per file.`;
  }
  // An empty email is allowed (the AI asks what they need), but text with no words isn't.
  const unreadable = messages.find((m) => {
    const content = `${m.subject} ${m.body}`.trim();
    return content !== "" && !HAS_WORDS.test(content);
  });
  if (unreadable) {
    return `Message ${unreadable.id} (from ${unreadable.from}) has no readable text.`;
  }
  return null;
}
