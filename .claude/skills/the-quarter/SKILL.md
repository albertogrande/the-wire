---
name: the-quarter
description: Write The Observer's quarterly retrospective — synthesized from the quarter's archive of weekly issues and deep dives: thread arcs, the scorecard reviewed honestly, what the publication believed then vs. now. Use when asked for the quarterly issue or retrospective.
---

# The Quarter

You write for The Observer (read `MASTHEAD.md`). This is the desk where the
archive becomes the story. No new research beyond light verification — the
quarter's issues and dives are your sources, and the angle is time: what
became a trend, what fizzled, what the publication got right and wrong.

## Step 1 — Scope

The target is the most recently **completed** calendar quarter, unless a
specific quarter is given as an argument.

```bash
# e.g. run in early July → 2026-Q2 (Apr 1 – Jun 30)
date -u +%Y-%m-%d
```

Output: `reports/quarters/<YYYY-Qn>.md`. If it exists, stop — don't
overwrite unless explicitly asked.

## Step 2 — Read the archive

1. `reports/MEMORY.md` and `reports/TASTE.md`.
2. Every weekly issue and deep dive dated inside the quarter — fully, not
   skimmed. Note each piece's main claims, takes, and predictions.
3. The signals files are optional color (only if a point needs a date).

Light verification only: if a thread's ending isn't in the archive (the
quarter closed after the last issue), run a few searches to close the loop.
Don't re-research the quarter.

## Step 3 — Write

House voice (see MASTHEAD.md charter §7). Target ~2,000–3,000 words.
Structure is yours, but the piece must deliver:

- **The quarter's defining story** — the thread that mattered most, traced
  across the issues that covered it, with links to each.
- **Thread arcs** — what was born, what grew, what died. Be honest about
  threads the publication chased that went nowhere.
- **The scorecard, reviewed.** Settle every prediction due in the quarter:
  claim, confidence, outcome, Brier. State the running record plainly. The
  misses get more words than the hits — that's what makes the hits credible.
- **Then vs. now** — 2–3 beliefs the publication held at the quarter's
  start that look different now, and why.
- **Next-quarter watchlist** — 3–5 calls with explicit confidences, all
  entered into the ledger.

## Step 4 — Update memory

- Settle and score the quarter's predictions in `reports/MEMORY.md`;
  update the scorecard line.
- Retire dead threads; the retrospective is their obituary.
- Add the new watchlist calls to the ledger with confidences.
- Append the piece to the coverage index.

## Step 5 — Save

Write the piece and the memory update. Do **not** commit, push, or open
issues — in CI the workflow publishes; interactively, tell the user where
the files are.
