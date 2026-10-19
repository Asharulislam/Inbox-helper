# Build log: summary

A short version of the 5 daily logs. Details in [`day-1.md`](day-1.md) to [`day-5.md`](day-5.md).

## Day 1 — 2026-10-14: setup and first AI call

- **Built:** Node + TypeScript project, `.env` kept out of git, first script calling an AI model.
- **Broke:** the script hung with no output (no timeout, errors not shown); the Gemini model I copied had been retired (404); the replacement was overloaded (503).
- **Decision:** switched from free Gemini to paid Claude Haiku 5.5, the cheapest Claude model. The SDK retries temporary errors by itself.
- **Unlearned:** starting with UI or backend design. I went straight for a working AI call.

## Day 2 — 2026-10-16: first working prototype

- **Built:** 20 messy sample messages, one Claude call per message returning a group, a reason and a draft as JSON, results printed by group. 6 tests with a fake AI. First run: 20/20 drafted.
- **Broke:** a draft claimed "we have removed you" when nobody had (fixed with a prompt rule); a message was put in the wrong group because of my own group definition (fixed); the injection message was silently skipped (fixed on Day 3).
- **Unlearned:** checking by hand instead of writing tests. But the real draft problems were found by reading the output, not by the tests. Both are needed.

## Day 3 — 2026-10-17: security

- **Built:** a ⚠️ suspicious flag so manipulation attempts are shown to the reviewer, not hidden. 8 attack messages (API key, system prompt, fake CEO, fake `</message>` tag, phishing link…) run before changing anything.
- **Broke:** no attack worked, but a fake `</message>` tag confused the model about where the message ended. Fixed in code by escaping `<` and `>`, with a test. The AI also edited five files and added features I hadn't asked for; I stopped it and had it redo the fix one file at a time.
- **Unlearned:** ignoring security.

## Day 4 — 2026-10-19: small fixes

- **Built:** three prompt fixes, one change each: no promising a candidate's deadline, no confirming contact-detail changes, and an exact draft format. Checked automatically across all drafts.
- **Broke:** the same message (a07) got a different decision on a re-run, with no related change. The AI isn't fully consistent.
- **Unlearned:** trusting one successful run.

## Day 5 — 2026-10-19: real input, web app, deployment

- **Built:** a plain `.txt` input format with a parser and 24 real-style messages; file checks before any AI call (max 30 messages, blank, random text); a one-page web app with a Download sample button; JSON support removed; backend/frontend split; deployed on Render (https://inbox-helper.onrender.com); README rewritten.
- **Broke:** my tests hit an old server still running on port 3000, and the cleanup stopped it; the first deployed page had a placeholder backend address; the same-message variation showed up again; `general_question` caught 9 of 24 real messages.
- **Left out (my decision):** approve / edit / reject buttons, sending, and cost limits on the live demo.

## In numbers

- 23 tests, none calling the real AI
- 3 sample files: 20 messages, 24 real-style messages, 8 attacks
- 7 groups + a suspicious flag
- 2 cases of the AI deciding differently on identical input
