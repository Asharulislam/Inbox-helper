# Day 1 — 2026-10-14

## Goal for today

Set up the project and prove I can call an AI model from code.

## What I did

- Created the Node project with `@google/genai` and `dotenv`.
- Added `.env` for the API key and a `.gitignore` that keeps it (and `node_modules/`, logs) out of git.
- Pushed to GitHub and found that `data/`, `log/`, `src/` and `tests/` were missing. Cause: git doesn't track empty folders. Fix: `.gitkeep` placeholder files.
- Switched the project from JavaScript to TypeScript (`typescript`, `tsx`, `tsconfig.json`, npm scripts).
- Wrote `src/test-key.ts` to check that the Gemini key works.
- Drafted `intent.md`, `directive.md` and this log.

## What broke

1. **`npm run test-key` hung with no output.** The script had no timeout and didn't print errors, so a failing request looked like a frozen terminal.
   - Fix: added a check for a missing key, a "calling Gemini..." message, a 30-second timeout, and a `try/catch` that prints the real error.
2. **`gemini-2.5-flash` returned 404**: "no longer available to new users". The model I'd copied into the script had been retired for new keys.
   - Fix: switched to `gemini-3.8-flash`, the model named in the error message. Lesson: read the error and verify model names with a real call instead of trusting memory or old examples.
3. **`gemini-3.8-flash` returned 503**: "high demand, try again later". It worked on a retry a few seconds later.
   - Not fixed in code. Instead, see the decision below.

## Decision: switched from Gemini to Claude

The Gemini free tier was unreliable for this project: a retired model (404), "high demand" errors (503) and requests that hung. I switched to Claude Haiku 5.5 (`claude-haiku-5-5`), the cheapest current Claude model, on a paid key, and removed Gemini from the project completely. The Anthropic SDK retries 429 and 5xx errors by default, so I didn't need my own retry code.

## AI usage

- Used Claude Code to set up the project, TypeScript config and `.gitignore`, and to diagnose the hang.
- <!-- TODO: your own notes, e.g. where you checked the AI's output or had to correct it -->

## Old habits I noticed

<!-- TODO: in your own words. Any moment you started doing something the old way (googling, writing code by hand, staring at the error) and what you did instead. -->

## Plan for Day 2

- Generate realistic, messy sample candidate messages.
- Decide the groups and the input format (see open questions in `directive.md`).
- Build `src/ai.ts` with retry logic, and the first grouping step with tests.
