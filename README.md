# Inbox Helper

Takes a pile of candidate messages, groups them by what each person wants, and drafts a short reply to each. **A human reviews every draft. Nothing is ever sent automatically.**

Built in 5 days, AI-first, with Claude Haiku 5.5 (`claude-haiku-5-5`). See [`intent.md`](intent.md) for the goal, [`logs/`](logs/) for the daily build log and [`unlearning.md`](unlearning.md) for what changed in how I work.

**Live demo:** https://inbox-helper.onrender.com
The free server sleeps when idle, so the first request can take 30–60 seconds to wake it up.

## Run it locally

### 1. Requirements

- Node.js 20 or newer
- A Claude API key from the [Claude Console](https://platform.claude.com/)

### 2. Install

```bash
cd backend
npm install
```

### 3. Add your API key

Create `backend/.env`:

```
ANTHROPIC_API_KEY=your-claude-key
```

This file is ignored by git. Never commit it.

### 4. Start the web app

```bash
npm run server
```

Open http://localhost:3000, click **Download sample**, upload that file and click **Process**. After about 2–3 seconds per message you'll see the drafts grouped by intent, with suspicious messages marked ⚠️.

### Or use the terminal

All commands run from inside `backend/`:

```bash
npm run inbox                           # the 20 sample messages in data/messages.txt
npm run inbox -- ../data/inbox.txt      # 24 real-style messages
npm run inbox -- ../data/attacks.txt    # 8 security test messages
```

## Commands

Run from inside `backend/`.

| Command | What it does |
|---|---|
| `npm run server` | Starts the web app on http://localhost:3000 |
| `npm run dev` | Same, but restarts when you save a file |
| `npm run inbox -- <file>` | Processes a messages file in the terminal |
| `npm test` | Runs the tests (no real AI calls, no cost) |
| `npm run typecheck` | Checks the TypeScript types |

## Input format

A `.txt` file with **up to 30 messages**, separated by a line of `---`. Each message starts with a `From:` line and an optional `Subject:` line:

```
From: Priya Nair <priya.nair@example.com>
Subject: Interview time

Hi, Tuesday at 10am clashes with my job. Would Wednesday work instead?

---
From: tom.becker@example.com

hey any update on my application? its been 3 weeks
```

Files are checked before any AI call. Empty files, files without a `From:` line (random text), messages with no words and files with more than 30 messages are rejected with a clear error.

## Groups

Every message goes into exactly one group: `scheduling`, `application_status`, `offer_and_salary`, `withdrawal`, `documents`, `general_question` or `not_a_candidate` (spam, no reply drafted).

Each draft comes with a one-sentence **reason** for its group, so the reviewer can spot mistakes.

## Safety

- **Nothing is sent.** The tool only produces drafts for a human.
- **Drafts don't invent facts.** Dates, salaries and decisions become placeholders like `[PROPOSED TIME]`. Actions are never described as already done, deadlines aren't promised, and contact-detail changes are never confirmed without verification.
- **Prompt injection.** The candidate's message is wrapped in `<message>` tags and treated only as data. Any `<` and `>` the candidate types are escaped, so a message can't close the tag itself. Messages that try to give the AI instructions or get it to confirm an offer are marked ⚠️ **Suspicious** for the reviewer.
- **The API key stays on the server.** The browser never sees it.
- **The page shows candidate and AI text as plain text,** never as HTML, so a message can't run code in the reviewer's browser.

[`data/attacks.txt`](data/attacks.txt) has 8 test messages (asking for the API key or the system prompt, a fake CEO, a fake `</message>` tag, a phishing link and more) that were used to check these defences.

## Project layout

```
backend/
  src/
    ai/prompt.ts        the system prompt and how each message is wrapped
    ai/triage.ts        the Claude call
    inbox/parse-text.ts reads the .txt format
    inbox/validate.ts   file checks (30 max, blank, random text)
    inbox/process.ts    loads, processes and groups messages
    types.ts            groups and data shapes
    cli.ts              the terminal command
    server.ts           the web server and API
  tests/                tests (run with npm test)
frontend/
  index.html            the one-page UI
data/                   sample message files
logs/                   daily build log (day-1.md … day-5.md)
intent.md               what the tool is for
directive.md            standing instructions for the AI while building
unlearning.md           what I unlearned
```

## Deployment (Render)

One Render web service hosts both the API and the page:

| Setting | Value |
|---|---|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Environment variable | `ANTHROPIC_API_KEY` |

The server serves `frontend/index.html` at `/`, so the page and the API share one address and no CORS setup is needed. Because the Root Directory is `backend`, a change only in `frontend/` doesn't redeploy automatically. Use **Manual Deploy → Deploy latest commit** in Render.

The live demo has no per-user rate limit. Its cost is capped by the prepaid balance on the Claude account.

## Troubleshooting

- **"ANTHROPIC_API_KEY is not set"**: create `backend/.env` with your key (or set it in Render).
- **"Invalid API key"**: check the key and that your Claude Console account has credit.
- **The page says "Could not process the file"**: the message after it explains why, e.g. the file format.
- **`EADDRINUSE` when starting the server**: another server is already using port 3000. Stop it, or run `PORT=3001 npm run server`.

## Known limitations

- The AI doesn't always make the same decision for the same message on different runs (seen with two security test messages).
- `general_question` is a broad catch-all: 9 of the 24 real-style messages ended up there.
- Gibberish that starts with `From:` passes the file checks; the AI then replies asking what the person needs.
- There's no approve / edit / send step in the UI yet. Drafts are for reading and copying.
