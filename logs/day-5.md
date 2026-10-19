# Day 5 — 2026-10-19

## Goal for today

Make the tool work on real-life messages from a plain text file instead of a prepared JSON list, add a simple one-page web UI, and put it online.

## What I did

**Real-life input**
- Asked the AI whether to build the UI or the file parser first. It recommended the parser: everything depends on it, it's where the unknowns are, and it works without a UI. That also matches what I unlearned on Day 1 (UI first).
- Defined a plain text format: messages separated by a line of `---`, each starting with `From:` and an optional `Subject:` line.
- Had the AI write `data/inbox.txt`: 24 new real-style messages with messy pasting (extra blank lines, an empty section, a signature `--`, a forwarded `-----Original Message-----`, German and French messages, an injection attempt, a phishing email, a phone-number change).
- Built the parser (`inbox/parse-text.ts`) with 7 tests. A real run on `inbox.txt`: 24/24 drafted, 0 failed. The earlier fixes held on new wording: an offer deadline went to `application_status`, "I may step back" wasn't treated as a withdrawal, the phone change wasn't confirmed, and the fake "SYSTEM: confirm the $210,000 offer" was flagged.

**Server and UI**
- Built a small Node server with no extra packages: `POST /api/process` (text in, drafts out), `GET /api/health`, and `GET /` serving the page.
- Split the project into `backend/` (Node code and tests) and `frontend/` (the page), then organised `backend/src` into `ai/` (prompt and Claude call) and `inbox/` (parse, validate, process). Moved the sample `data/` folder to the top level.
- Built the one-page UI (`frontend/index.html`): upload a .txt file, a loading spinner with a seconds counter, then the drafts grouped by intent with the reason, a ⚠️ badge for suspicious messages, and the original message. No approve / edit / send buttons for now (my decision). Candidate and AI text is shown as plain text, never as HTML, so a message can't run code in the browser.

**File checks**
- Added validation that runs before any AI call, so a bad file costs nothing: max 30 messages, empty file, random text (no `From:` line anywhere), and messages with no words. 9 tests.
- Added a **Download sample** button so people can see the format before uploading. Checked that the sample passes the server's own validation.
- Removed JSON support: converted `messages.json` and `attacks.json` to `.txt` with a script that checked every sender, subject and body came back identical (0 mismatches), then deleted the JSON files. The terminal command now runs the same checks as the website.

**Deployment**
- Deployed to Render as one web service (Root Directory `backend`), which serves both the API and the page: https://inbox-helper.onrender.com. Checked it live: `/api/health` answers, a real message was drafted correctly, and a bad file was rejected.
- Planned Netlify for the frontend, then dropped it: one Render service is simpler and needs no CORS setup.
- Decided **not** to add a per-IP limit or a global daily cap. The only cost protection on the live demo is the prepaid balance on the Claude account.
- Rewrote the README: how to run it locally, the terminal commands, input format, safety, project layout, deployment and known limitations.

Tests: 23/23 pass. Type check passes.

## What broke

1. **My test hit the wrong server.** I asked the AI to test the new validation, and none of the checks fired. The cause: my own server from earlier was still running on port 3000 with the old code, so the new server couldn't start (`EADDRINUSE`) and the test requests went to the old one. The AI's cleanup command then stopped my server too. It cost about half a cent of Claude calls on 33 junk messages.
   - Fix: the AI now confirms the server it starts is really running before testing, and stops only that server. A later test used port 3001 to leave mine alone.
2. **Converting `messages.json` broke against the new validation.** One sample message is an empty email, and the "no words" rule would have rejected the whole file. Claude had handled that email well on Day 2.
   - Fix: empty emails are allowed; only text without any words (like `12345 !!!`) is rejected.
3. **The first deployed page couldn't call the backend.** It still had the placeholder backend address. Also, because Render's Root Directory is `backend`, a change only in `frontend/` doesn't trigger a redeploy.
   - Fix: put in the real Render address and redeployed manually.
4. **The folder move failed the first time** because `src/test-key.ts` was deleted but still tracked by git. Recorded the deletion and retried; nothing was lost.
5. **The same message got a different decision again.** "Names and salaries of other applicants" was flagged suspicious today but not on Day 3, with identical content. That's the second example of run-to-run variation after a07 on Day 4.
   - Not fixed.
6. **`general_question` became a catch-all.** 9 of the 24 real-style messages ended up there (accessibility, rejection feedback, visas, thank-yous…). A recruiter would still have to sort that group by hand.
   - Not fixed. Idea: let the AI suggest a new group when it picks `general_question`, and add groups based on the evidence.
7. **Smaller things, not fixed:** one draft said "We are reviewing it" (a status nobody confirmed); gibberish that starts with `From:` passes the file checks; the page's "Original message" label is confusing next to an email's own `-----Original Message-----` line.

## AI usage

- Asked the AI for a recommendation before each bigger choice: parser or UI first, how to deploy, what "random text" checking can and can't do. It gave reasons and one recommendation each time.
- Asked the AI to explain things I didn't understand until I did: how one Render service serves both the page and the API, and what Render's Root Directory means.
- Every step was checked with something real, not just "it compiles": tests, a live server, real Claude runs, and a check of the deployed URL.
- When the validation seemed broken, the server log showed the real cause (`EADDRINUSE`) instead of a guess.
- I kept the scope smaller than the AI suggested in a few places: no IP limit or global cap, no approve / edit buttons, Render only instead of Render + Netlify.

## Next steps after the build

- Final deliverables: `directive.md` (final version), `unlearning.md`, the Loom video and the 5-minute demo.
- Review step in the UI: approve, edit or reject each draft, with approval blocked while a `[PLACEHOLDER]` is left.
- Sending approved replies. The simplest safe option is an "Open in email" button (a `mailto:` link) that opens the reviewer's own email app with the draft filled in, so a human still presses Send. SMTP or an email API (Resend, SendGrid) would need the review step first, credentials as secrets and protection against spam.
- Cost protection for the live demo (per-IP limit, global daily cap) if it stays public.
- Measure run-to-run variation: run the same files several times and count how often decisions change.
