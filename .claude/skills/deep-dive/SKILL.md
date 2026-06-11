---
name: deep-dive
description: Write a standalone deep-dive essay (~2,000–3,500 words) on the week's most consequential tech/AI story — or on a topic the user names as an argument. Researches the topic's history, players, incentives, and contrarian takes, then writes an opinionated thesis-driven piece to reports/deep-dives/. Use when the user asks for a deep dive, optionally with a topic.
---

# Deep Dive

One topic, taken seriously. Where the weekly issue gives a story a paragraph,
the deep dive gives it the full treatment: background, structure, incentives,
numbers, the strongest case against your own read, and a thesis the reader
can disagree with productively.

## Step 1 — Choose the topic

- **If a topic was given as an argument**: that's the topic. Sharpen it into
  an answerable question (e.g. "Copilot pricing" → "Can AI coding tools
  survive honest pricing?").
- **If no topic was given:**
  - Running right after the `weekly-news` skill in the same session: take the
    deep-dive pick that skill just made, and reuse its research.
  - Standalone: read `reports/MEMORY.md` and the latest issue, run 3–5
    orientation searches over the last week, and pick the 1–2 most
    consequential stories yourself. Your judgment; optimize for "the piece
    the reader will still find useful in three months."

Always check MEMORY.md's coverage index first: don't repeat a past dive
unless the story moved materially — and if it did, frame the piece as an
update and link the original.

## Step 2 — Research the topic deep, not wide

This is a different research shape than the weekly sweep. For the one topic:

- **History**: how did we get here? Search beyond the current week.
- **Players and incentives**: who wins, who pays, who's bluffing?
- **Numbers**: the 3–5 quantities the argument actually turns on — find
  primary figures, not commentary about figures.
- **The other side**: actively search for the strongest contrarian take and
  steelman it before rebutting it.

WebFetch **at least 5 primary sources** (announcements, filings, papers,
first-party posts) and read them properly. Verify numbers against primaries;
flag anything single-sourced.

## Step 3 — Write

**Voice**: same publication as the weekly — Stratechery's structural
analysis × Pragmatic Engineer's practitioner grounding. Thesis-driven: the
piece argues something, states it early, and earns it. Address the strongest
counterargument honestly. End with what would change your mind.

**Format** of `reports/deep-dives/<YYYY-MM-DD>-<slug>.md` (date = day of
writing; slug = 3–6 lowercase hyphenated words):

```markdown
# <Title that states or strongly implies the thesis>

*Deep dive · <date> · <one-line frame of the question>*

<~2,000–3,500 words. Structure up to you — subheads encouraged at this
length. Inline links on key claims; no sources section.>
```

- Link back to weekly issues that touched the topic, e.g.
  `as noted in [W23](../2026-W23.md)`.
- For working engineers, always land the "so what": what should the reader
  do, watch, or stop worrying about?

## Step 4 — Update memory

Update `reports/MEMORY.md`:
- Append the dive to the **coverage index** (date, title, topic).
- If the piece makes a falsifiable call, add it to the **predictions ledger**.
- Keep the file under ~150 lines.

## Step 5 — Save

Write the dive and the MEMORY.md update. Do **not** commit, push, or open
issues — in CI the workflow publishes; in an interactive session, tell the
user where the files are and let them decide.
