import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY is not set. Add it to .env or export it in your shell.");
  process.exit(1);
}

console.log("Key found, calling Claude...");

// The SDK already retries 429 and 5xx errors twice with backoff.
const client = new Anthropic({ timeout: 30_000 });

try {
  const res = await client.messages.create({
    model: "claude-haiku-5-5",
    max_tokens: 1024,
    output_config: { effort: "low" },
    messages: [{ role: "user", content: "Say hello in one sentence." }],
  });
  for (const block of res.content) {
    if (block.type === "text") console.log(block.text);
  }
  console.log(`(tokens: ${res.usage.input_tokens} in, ${res.usage.output_tokens} out)`);
} catch (err) {
  if (err instanceof Anthropic.AuthenticationError) {
    console.error("Invalid API key. Check ANTHROPIC_API_KEY in .env.");
  } else if (err instanceof Anthropic.APIError) {
    console.error(`Claude API error ${err.status}:`, err.message);
  } else {
    console.error("Request failed:", err);
  }
  process.exit(1);
}
