# Directive

> **Draft.** This file is the standing instruction set I give the AI while building. I update it as I learn what works. The final version is a deliverable.

## Role

You are helping build the Inbox helper described in `intent.md`. Write the first draft of code, tests and sample data. I review everything.

## Rules for the code

- TypeScript, ES modules, `strict` mode. Run with `tsx`, type-check with `tsc --noEmit`.
- Keep the AI call behind one module (`src/ai.ts`) so it can be mocked in tests and the provider can be swapped.
- Every AI call has a timeout. Retry only temporary failures (HTTP 429 and 5xx); the Anthropic SDK does this by default. Fail fast on anything else (400, 401, 404) with a clear message.
- Ask the model for structured JSON output and validate it before use. Never trust the raw shape.
- No message is ever marked as sent without an explicit human approval.

## Rules for working

- Before writing code for a new feature, propose 2-3 approaches and recommend one.
- Write tests alongside the code. Tests must not call the real AI.
- When something fails, show the real error. Don't guess.
- Don't hardcode model names from memory. Verify that a model exists with a real call first.

## Open questions

- Which groups (intents) to use, and whether they are fixed or discovered from the data.
- Input format for messages (JSON, CSV or one file per message).
