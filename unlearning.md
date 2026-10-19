# What I unlearned

The old habits I dropped while building the Inbox Helper over 5 days, working AI-first. Each entry comes from that day's log in [`logs/`](logs/).

## Day 1 — 2026-10-14

### Starting with the UI or the backend architecture

- **Old habit:** on day 1 of a project I usually start by planning the UI, or by designing the backend and the database.
- **What I did instead:** I skipped UI, backend and database design and aimed straight for a basic working prototype of the inbox helper.
- **What happened:** by the end of Day 1 I had a working AI call from code and no UI or database at all. The full prototype (messages in, groups and drafts out) wasn't finished on Day 1 and carries over to Day 2.

## Day 2 — 2026-10-16

### Verifying data by hand instead of writing tests

- **Old habit:** checking that the data and code work by running the program and looking at the output myself, and skipping automated tests.
- **What I did instead:** had the AI write automated tests that verify the data and the logic: the sample file loads and has all its messages, a file with missing fields is rejected, every message gets processed, one failing message doesn't stop the run, and results are grouped correctly. The tests use a fake AI, so they run in about 2 seconds with no API cost.
- **What happened:** all 6 tests pass. But the tests only check the code, not the quality of the drafts. The two real problems that day (m04's false claim and m17's wrong group) were found by reading the output, not by the tests. Automated tests and reading the AI's output are both needed.

## Day 3 — 2026-10-17

### Ignoring security

- **Old habit:** normally I don't think about security in my projects.
- **What I did instead:** I focused on security: I treated m14 (a message trying to trick the AI into confirming a $250,000 offer) as a real problem to fix, not just a funny test case. The tool now marks such messages ⚠️ SUSPICIOUS for the reviewer, and the draft confirms nothing.
- **What happened:** the AI never followed the injected instructions, thanks to the rule that the candidate's message is only data. But the first version hid the attempt by silently skipping the message. Now it's visible to the human, which is safer: the person who decides can see that someone tried to manipulate the system.

## Day 4 — 2026-10-19

### Trusting one successful run

- **Old habit:** if the code worked once, I'd consider it done.
- **What I did instead:** re-ran both files (20 normal messages + 8 attacks) after every change and compared the results with the previous run, message by message.
- **What happened:** a07 (the phishing-link message) got a different decision on a re-run, even though none of my changes were about links: it went from `general_question` with a neutral reply to `not_a_candidate` with no reply. With AI, the same input doesn't always give the same output, so one good run doesn't prove the behaviour is stable.

## Day 5 — 2026-10-19

<!-- Not written yet. Add the Day 5 habit to logs/day-5.md first, then copy it here. -->
