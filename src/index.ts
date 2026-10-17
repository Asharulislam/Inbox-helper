import "dotenv/config";
import { triageMessage } from "./ai.js";
import { groupResults, loadMessages, processInbox } from "./inbox.js";

const path = process.argv[2] ?? "data/messages.json";

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY is not set. Add it to .env.");
  process.exit(1);
}

const messages = await loadMessages(path);
console.log(`Loaded ${messages.length} messages from ${path}\n`);

const results = await processInbox(messages, triageMessage, (done, total) => {
  process.stdout.write(`\rProcessing ${done}/${total}...`);
});
console.log("\n");

for (const [group, items] of groupResults(results)) {
  console.log(`=== ${group} (${items.length}) ===\n`);
  for (const r of items) {
    if (!r.ok) continue;
    const warning = r.triage.suspicious ? "  ⚠️ SUSPICIOUS: check before replying" : "";
    console.log(`[${r.message.id}] ${r.message.from} — ${r.message.subject || "(no subject)"}${warning}`);
    console.log(`Why: ${r.triage.reason}`);
    console.log(r.triage.draft ? `Draft:\n${r.triage.draft}` : "Draft: (no reply)");
    console.log();
  }
}

const failed = results.filter((r) => !r.ok);
if (failed.length > 0) {
  console.log(`=== failed (${failed.length}) ===\n`);
  for (const r of failed) {
    if (!r.ok) console.log(`[${r.message.id}] ${r.error}`);
  }
}

console.log(`\nDone: ${results.length - failed.length} drafted, ${failed.length} failed. Nothing has been sent.`);
