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

---

## How it turned out (added at the end of Day 5)

The sections above are my Day 1 intent, left unchanged. This is how the result compares.

| Day 1 intent | Result |
|---|---|
| A command-line tool | ✅ The CLI exists, **and** I added a one-page web app, deployed on Render |
| A web UI is out of scope | Changed my mind on Day 5: upload a .txt file, see drafts grouped by intent |
| A human can approve, edit or reject each draft | ❌ **Not built.** The page shows every draft for a human to read and copy, but has no approve / edit / reject buttons. I chose to leave them out to finish the parser, validation, server and deployment in time. |
| Output shows each draft's review status | ❌ Not built (no review step) |
| Tests cover the review step | ❌ No review step to test. Tests cover parsing, file validation, processing, grouping and the prompt wrapper (23 tests, no real AI calls) |
| Groups such as scheduling, status, salary, withdrawal, other | ✅ A fixed list of 7 groups, plus a ⚠️ suspicious flag for manipulation attempts (not planned on Day 1) |
| A file of candidate messages | ✅ A plain `.txt` format with `---` separators, up to 30 messages, checked before any AI call |
| Survive a slow or overloaded AI service | ✅ Timeouts, automatic retries for temporary errors, clear error messages, and one failed message doesn't stop the rest |
| Nothing is sent automatically | ✅ Nothing is ever sent |

## What's left

1. **Review step:** approve, edit or reject each draft in the page, with approval blocked while a `[PLACEHOLDER]` is still in the text. This is the biggest gap against the Day 1 intent.
2. **Sending approved replies:** start with an "Open in email" button (a `mailto:` link) that opens the reviewer's own email app with the draft filled in, so a human still presses Send. SMTP or an email API (Resend, SendGrid) only after the review step exists, with credentials kept as secrets and protection against spam.
3. **Cost protection for the live demo:** a per-IP limit and a global daily cap. Right now the only limit is the prepaid balance on the Claude account.
4. **Stable decisions:** the AI sometimes groups or flags the same message differently on different runs. Measure how often by running the same files several times, then tighten the prompt where decisions flip.
5. **Better groups:** `general_question` caught 9 of 24 real-style messages. Let the AI suggest a more specific group when it picks it, and add new groups based on that evidence.
6. **Smaller fixes:** a draft once stated an unconfirmed status ("We are reviewing it"); gibberish that starts with `From:` passes the file checks; the page's "Original message" label is easy to confuse with an email's own `-----Original Message-----` line.
