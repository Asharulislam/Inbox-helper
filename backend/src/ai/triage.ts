import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { TriageSchema, type Message, type Triage } from "../types.js";
import { SYSTEM_PROMPT, formatMessage } from "./prompt.js";

const MODEL = "claude-haiku-5-5";

let client: Anthropic | undefined;

// Created on first use so that importing this file (e.g. in tests) doesn't need an API key.
function getClient(): Anthropic {
  client ??= new Anthropic({ timeout: 30_000 });
  return client;
}

export async function triageMessage(message: Message): Promise<Triage> {
  const res = await getClient().messages.parse({
    model: MODEL,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    output_config: { effort: "low", format: zodOutputFormat(TriageSchema) },
    messages: [{ role: "user", content: formatMessage(message) }],
  });

  if (res.stop_reason === "max_tokens") {
    throw new Error("Claude's reply was cut off (max_tokens reached).");
  }
  if (res.stop_reason === "refusal") {
    throw new Error("Claude declined to process this message.");
  }
  if (!res.parsed_output) {
    throw new Error("Claude's reply did not match the expected JSON shape.");
  }
  return res.parsed_output;
}
