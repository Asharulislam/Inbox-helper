# Intent

## What I am building

**Inbox helper**: a command-line tool that takes a pile of candidate messages, groups them by what each person wants, and drafts a short reply to each one. A human reviews every draft before anything is sent.

## Who it is for

A recruiter or hiring coordinator with a backlog of candidate messages who wants to answer them faster without sending anything they haven't read.

## What "done" looks like

- Input: a file of candidate messages (sample data generated for this project).
- Each message is put into one group by what the person wants, for example: interview scheduling, application status, salary or offer questions, withdrawal, other.
- Each message gets a short, polite draft reply that fits its group.
- A human reviews every draft and can approve, edit or reject it. **Nothing is sent automatically.**
- Output: drafts grouped by intent, with their review status.

## Constraints

- Built in 5 days, AI-first. The AI writes the first draft of code, tests and data; I review, check and iterate.
- Uses Claude Haiku 5.5 (`claude-haiku-5-5`) via `@anthropic-ai/sdk` for grouping and drafting.
- Must survive a slow or overloaded AI service (timeouts, retries, clear errors).
- TypeScript on Node.js.

## Out of scope

- Actually sending email or connecting to a real inbox.
- A web UI. The review step happens in the terminal.

## How I will know it works

- Tests cover grouping, drafting and the review step, with the AI call mocked.
- A run on the sample data puts each message in a sensible group, and the drafts need few edits.
- When the AI is busy or fails, the tool says so and does not crash or hang.
