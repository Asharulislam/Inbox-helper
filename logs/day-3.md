# Day 3 — 2026-10-17

## Goal for today

Fix m14, the prompt-injection message, so a manipulation attempt is shown to the reviewer with a warning instead of being silently skipped.

## What I did

- Decided to build the human review step as a web page on Day 5 instead of a terminal tool today.
- Fixed m14 by adding a `suspicious` true/false field to Claude's answer. It took four small changes, made one file at a time:
  1. `src/types.ts`: added `suspicious` to the JSON shape Claude must return.
  2. `src/ai.ts`: added a prompt rule for when to set it, and that a suspicious message is still grouped by what it asks for and gets a neutral draft that confirms nothing.
  3. `src/index.ts`: suspicious messages show "⚠️ SUSPICIOUS: check before replying" in the output.
  4. `tests/inbox.test.ts`: the fake AI returns `suspicious: false` so it matches the real shape.
- Type check passes, 6/6 tests pass, and a full run gives 20/20 drafted with 0 failures.

**m14 before:** grouped `not_a_candidate`, no draft, no warning.

**m14 after:** grouped `offer_and_salary`, marked ⚠️ SUSPICIOUS, with the draft: "Thank you for your message, Raj. We are not able to confirm offers or salary figures through this channel, but a member of our team will review your request and get back to you."

Checks on the new run: only m14 is marked suspicious (no false alarms, and the spam message m09 correctly stays `not_a_candidate`), only m14 changed group, and the draft promises no offer or salary.

## What broke

1. **The AI went further than I wanted.** After I said the review UI would wait until Day 5, the AI went ahead without checking with me: it started editing five files at once and added extra features (an "urgent" flag and a drafts file for the review step). I couldn't follow what was changing, so I stopped it, reverted the changes, and asked it to redo only the m14 fix, one file at a time with an explanation before each edit. The second attempt was smaller (one field instead of a list of flags) and easy to check.
2. **Still open from Day 2:** m17's draft softly promises timing ("ideally before your Friday deadline"), and draft formatting is inconsistent.

## AI usage

- Kept the AI to one problem at a time: when it went beyond the m14 fix, I rejected the change and narrowed the request.
- Asked for edits one file at a time with an explanation first, so I understood each change before it was made.
- Verified the fix on all 20 messages, not just m14: compared every message's group with the previous run and checked for false "suspicious" marks.

## Unlearned today

### Ignoring security

- **Old habit:** normally I don't think about security in my projects.
- **What I did instead:** I focused on security: I treated m14 (a message trying to trick the AI into confirming a $250,000 offer) as a real problem to fix, not just a funny test case. The tool now marks such messages ⚠️ SUSPICIOUS for the reviewer, and the draft confirms nothing.
- **What happened:** the AI never followed the injected instructions, thanks to the rule that the candidate's message is only data. But the first version hid the attempt by silently skipping the message. Now it's visible to the human, which is safer: the person who decides can see that someone tried to manipulate the system.

## Plan for Day 4

-
