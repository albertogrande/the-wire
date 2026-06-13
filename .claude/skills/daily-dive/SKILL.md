---
name: daily-dive
description: Write The Wire's DAILY deep dive (~1,200–1,800 words) under a rotating columnist byline. Picks a topic from today's scout signals or the evergreen backlog (evergreen wins by default; news must earn its slot), writes it in the day's columnist voice, and saves to reports/deep-dives/. Use when asked to run the daily dive.
---

# Daily Dive

You write The Wire's daily columnist piece. Read `MASTHEAD.md` (the charter),
`AUTHORS.md` (the roster and rotation), `reports/TASTE.md` (the reader), and
`reports/MEMORY.md` (threads, coverage index, predictions) before writing —
and leave them better than you found them.

This is the **shorter, daily** sibling of the weekly `deep-dive`. The Monday
flagship still gives a story the full ~2,500–3,500-word house-voice
treatment. Your job is one sharp, technical argument in **~1,200–1,800
words**, under a named columnist's byline. Same publication, smaller canvas,
distinct voice.

The governing rule, learned from the best technical newsletters: **news is
the hook, an evergreen concept is the subject.** Default to a durable "how X
works" piece. A news peg only takes the slot when it lets you write the
timeless explainer underneath it — never a hot take that expires in a week.

## Step 0 — Who's writing, and in what mode

Compute the day (UTC) deterministically:

```bash
DOW=$(date -u +%u)                 # 1=Mon … 7=Sun
TODAY=$(date -u +%Y-%m-%d)
IDX=$(( ( $(date -u +%s) / 86400 ) % 3 ))   # 0,1,2 → roster index
```

- **Monday (`DOW=1`)**: do nothing — the weekly flagship owns Monday. Exit
  and say so.
- **Tue–Sun (`DOW` 2–7)**: the columnist is `roster[IDX]` where
  `roster = [Marlow Quist, June Okafor, Theo Vance]` (the order in
  `AUTHORS.md`). One dive, that columnist's voice.

Honor explicit overrides when given (a named columnist or a named topic) —
they win over the date math.

## Step 1 — Choose the topic

Two pools. **Evergreen wins by default**; news must out-argue it.

**Pool A — News-pegged.** Read today's `## <TODAY>` block in
`signals/$(date -u +%G-W%V).md` (the scout's capture). A signal qualifies
only if it can become a *durable* explainer — a "how it works / why it
matters in twelve months" piece — not a reaction.

**Pool B — Evergreen backlog.** Read `topics/backlog.md`. These are the
"interesting topic" dives. Pick the one that best fits the day's columnist
and the reader's taste.

**Selection rule:**
1. Default to evergreen. A news peg takes the slot only if it clears a high
   bar *and* yields a durable explainer.
2. Score candidates on: **uniqueness** (can the reader get this synthesis in
   one place elsewhere? — highest weight) × **durability** (useful in 12
   months?) × **reader-fit** (`TASTE.md`) × **fit to today's columnist's
   lens** (`AUTHORS.md`).
3. **Never repeat** a piece in MEMORY.md's coverage index unless the story
   moved materially — if it did, frame as an update and link the original.

**Pick a format** for the piece (tag it for the backlog/memory):
`how-it-works` · `x-vs-y` · `architecture` (how [company] built X — the
news→evergreen bridge) · `postmortem` · `what-every-engineer-should-know` ·
`economics` · `news-to-framework` · `n-lessons` · `reference` ·
`practical-guide`. Lean toward the day's columnist's best formats.

## Step 2 — Research deep, not wide

Lighter than the weekly sweep, same standards. For the one topic:

- **The mechanism / the numbers**: the 2–4 quantities or technical facts the
  argument turns on. Find primaries — model cards, docs, benchmarks, filings,
  source — not commentary about them.
- **History** when it matters: how did we get here?
- **The discussion**: what practitioners actually argued — HN (Algolia API),
  Reddit, X, GitHub issues. Quote the dissenting comment, linked.
- **The other side**: find the strongest counter and engage it.

WebFetch **at least 3 primary sources** and read them properly. Verify every
load-bearing number; flag anything single-sourced inline. This is a
tech-dev publication — keep the claims **technical and checkable**.

## Step 3 — Write, in the columnist's voice

Write in the assigned columnist's method (`AUTHORS.md`) — Quist quantifies,
Okafor inverts a consensus, Vance builds. All three obey the house voice:
short sentences, simple words, depth from numbers and primary sources, **no
Stratechery register** (the reader rejected it). Thesis stated early in plain
words and earned with reporting; the strongest counterargument addressed
honestly; end with what would change your mind (or, for Vance, the
do / watch / ignore).

Save to `reports/deep-dives/<YYYY-MM-DD>-<slug>.md` (slug = 3–6 lowercase
hyphenated words). Plain Markdown, **no front matter** — the byline is the
subtitle line:

```markdown
# <Title that states or implies the thesis>

*Deep dive · <Columnist> (<Desk>) · <date> · <one-line frame of the question>*

<~1,200–1,800 words. Subheads fine but not required at this length. Inline
links on key claims; no sources section.>
```

- Link back to issues/dives that touched the topic, e.g.
  `as noted in [W23](../2026-W23.md)`.
- Always land the "so what" for a working engineer: what to do, watch, or
  stop worrying about.

## Step 4 — Update memory and the backlog

`reports/MEMORY.md`:
- Append to the **coverage index** (date, title, topic, columnist, format).
- If a piece makes a falsifiable call, add it to the **predictions ledger**
  with an explicit confidence %.
- Keep the file under ~150 lines.

`topics/backlog.md`: if the topic came from the backlog, move it to **Used**
with `— <date>, reports/deep-dives/<file>`. Add any fresh ideas the research
surfaced.

Mirror into the site's data files (the published site reads these):
- A falsifiable call → append to `_data/predictions.yml` (`id`,
  `made: "Dive · <date>"`, `made_link`, `text`, `confidence`, `due`,
  `status: open`).
- A piece advancing a running thread → update `_data/threads.yml`.

If the reader has stated a preference for one columnist's voice (in session
or via issue comments), record the durable lesson in `reports/TASTE.md` —
which voice landed and why — and prune one-off reactions.

## Step 5 — Save

Write the files only. Do **not** commit, push, or open issues — in CI the
workflow publishes; in an interactive session, tell the user what you wrote
and where, and let them decide.
