import "dotenv/config";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import { triageMessage } from "./ai/triage.js";
import { groupResults, processInbox } from "./inbox/process.js";
import { parseTextMessages } from "./inbox/parse-text.js";
import { validateInbox } from "./inbox/validate.js";

const PORT = Number(process.env.PORT ?? 3000);

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY is not set. Add it to .env.");
  process.exit(1);
}

function sendJson(res: ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString("utf8");
}

async function handleProcess(req: IncomingMessage, res: ServerResponse): Promise<void> {
  let text: unknown;
  try {
    text = JSON.parse(await readBody(req)).text;
  } catch {
    return sendJson(res, 400, { error: "Send JSON like {\"text\": \"...\"}." });
  }
  if (typeof text !== "string") return sendJson(res, 400, { error: "\"text\" must be a string." });

  const messages = parseTextMessages(text);
  const problem = validateInbox(text, messages);
  if (problem) return sendJson(res, 400, { error: problem });

  const results = await processInbox(messages, triageMessage);
  const drafts = [...groupResults(results).values()].flat().flatMap((r) => (r.ok ? [{ ...r.message, ...r.triage }] : []));
  const failed = results.flatMap((r) => (r.ok ? [] : [{ ...r.message, error: r.error }]));
  sendJson(res, 200, { drafts, failed });
}

// The page and the API are served from the same address, so no CORS setup is needed.
const server = createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/api/health") {
      sendJson(res, 200, { ok: true });
    } else if (req.method === "POST" && req.url === "/api/process") {
      await handleProcess(req, res);
    } else if (req.method === "GET" && req.url === "/") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(await readFile("../frontend/index.html"));
    } else {
      sendJson(res, 404, { error: "Not found." });
    }
  } catch (err) {
    console.error(err);
    if (!res.headersSent) sendJson(res, 500, { error: "Something went wrong on the server." });
  }
});

server.listen(PORT, () => console.log(`Inbox helper server running on http://localhost:${PORT}`));
