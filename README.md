# Inbox helper

Takes a pile of candidate messages, groups them by what each person wants, and drafts a short reply to each. A human reviews every draft before it is sent.

> Work in progress. A 5-day AI-first build. See `intent.md` for the goal and `logs/` for daily progress.

## Requirements

- Node.js 20 or newer (built on 24)
- A Claude API key from the [Claude Console](https://platform.claude.com/)

## Setup

```bash
npm install
```

Create a `.env` file in the project root:

```
ANTHROPIC_API_KEY=your-claude-key
```

## Commands

| Command | What it does |
|---|---|
| `npm run inbox` | Groups and drafts replies for `data/messages.json` (or pass a path: `npm run inbox -- path/to/file.json`) |
| `npm test` | Runs the tests (no real AI calls) |
| `npm run test-key` | Checks that your Claude key works |
| `npm run dev` | Runs `src/index.ts` and restarts on save |
| `npm run build` | Compiles TypeScript to `dist/` |
| `npm start` | Runs the compiled app |
| `npm run typecheck` | Checks types without building |

## Project layout

```
src/        source code
tests/      tests
data/       sample candidate messages
logs/       daily build log (deliverable)
log/        runtime logs (not committed)
intent.md   what the tool is for and what "done" means
directive.md  standing instructions for the AI while building
```

## Troubleshooting

- **"ANTHROPIC_API_KEY is not set"**: add the key to `.env`.
- **"Invalid API key"**: check the key in `.env` and that your Claude Console account has credit.
