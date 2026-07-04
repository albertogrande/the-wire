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
the hook, an evergreen concept is the subject.**

**Start with the best story of the day, honestly.** The reader's durable
feedback (`reports/TASTE.md`, 2026-07-04) is: pick the genuinely most
interesting/important topic first — across *all* the beats, not just AI — and
write *that*. Then **extend into adjacent domains only when the story asks for
it.** Cross-domain context (tech × economics / energy / politics /
geopolitics) is a payoff you earn when the reporting naturally pulls there —
the way the 2026-06-29 silicon piece did (Nvidia margin → OpenAI's chip →
power → China) — **not a quota to hit.** Do not bolt "…and here's the
political angle" onto a story that doesn't have one; a forced cross-domain
piece is worse than a clean single-subject one. The reader called this out
explicitly: **don't force AI-plus-politics; let the story decide how far it
travels.**

What the reader *did* reject: a week of narrow single-mechanism "how X works"
explainers that read as samey, and dives reverse-engineered from a Hacker News
thread of the day. A hot HN thread is only ever the **hook** — never the
subject; if it doesn't open onto a larger force the piece can actually report
out, it doesn't run. The fix is **better topic selection and natural
extension**, not a formula.

## Step 0 — Who's writing, and in what mode

Compute the day in **Europe/Madrid** (the publication's clock) deterministically:

```bash
DOW=$(TZ=Europe/Madrid date +%u)                       # 1=Mon … 7=Sun (Madrid)
TODAY=$(TZ=Europe/Madrid date +%Y-%m-%d)               # Madrid calendar date
IDX=$(( ( $(date -u -d "$TODAY" +%s) / 86400 ) % 3 ))  # 0,1,2 → generalist index
```

- **Monday (`DOW=1`)**: do nothing — the weekly flagship owns Monday. Exit
  and say so.
- **Thursday (`DOW=4`)**: the **Claude Code edition**. Columnist is **Kit
  Sandoval (The Operator)**, the standing Claude Code desk (`AUTHORS.md`).
  Pick the topic from the Claude Code pool (Step 1, "Claude Code edition").
- **Other dive days (`DOW` 2,3,5,6,7)**: the columnist is `roster[IDX]` where
  `roster = [Marlow Quist, June Okafor, Theo Vance]` (the order in
  `AUTHORS.md`). One dive, that columnist's voice — **unless preempted** (next).
- **News preempt:** before settling on a generalist, scan the latest
  `### Claude Code Watch` block in this week's signals
  (`signals/$(TZ=Europe/Madrid date +%G-W%V).md`). If it carries a *major*
  Claude Code product event — a release, a new feature/command/flag, or a
  limits/pricing change that shifts how people work (not merely a hot thread) —
  hand the day to **Kit Sandoval** and write the Claude Code edition instead.
  The bar is a durable change worth a workflow piece.

Honor explicit overrides when given (a named columnist or a named topic) —
they win over the date math.

## Step 1 — Choose the topic

**Claude Code edition (Thursday, or a preempt):** skip the A/B pools below and
choose from the **Claude Code pool** instead — the latest `### Claude Code
Watch` blocks in this week's signals plus the "Claude Code & agent
engineering" section of `topics/backlog.md`. Bias toward what the reader
asked for: **workflows, getting maximum performance, new features/commands,
agent-loop patterns, and the practitioner tips** behind them. Evergreen still
wins by default *within* Claude Code — a durable "how to run X / why this
workflow wins" beats a changelog reaction — but a major Claude Code release
can be the news peg when it yields a real how-to. Then go to Step 2.

Otherwise (generalist day), use the two pools below. **Evergreen wins by
default**; news must out-argue it.

**Pool A — News-pegged.** Read the latest `## <date>` block (the scout's most
recent capture) in `signals/$(TZ=Europe/Madrid date +%G-W%V).md`. A signal qualifies
only if it can become a *durable* explainer — a "how it works / why it
matters in twelve months" piece — not a reaction.

**Pool B — Evergreen backlog.** Read `topics/backlog.md`. These are the
"interesting topic" dives. Pick the one that best fits the day's columnist
and the reader's taste.

**Selection rule:**
1. **Best story of the day first.** Pick the single most interesting/important
   topic on offer, judged on its own merit — the thing you'd most want to read
   today. It can be a clean single-subject piece. Cross-domain reach is a
   tie-breaker and a bonus, **not** an entry requirement: when two candidates
   are close, prefer the one whose story naturally travels across beats — but
   never manufacture a crossover the story doesn't have. Do **not** default to
   "AI + politics."
2. **Extend only as far as the story pulls.** Once the topic is chosen, add
   adjacent context (who pays, who benefits, the energy / market / policy /
   China angle) *if and only if* the reporting genuinely leads there. A tight
   one-domain dive beats a padded one.
3. **A Hacker News thread is a hook, not a subject.** Do not build a dive
   whose whole reason to exist is "a thread trended and here's why it's
   wrong/right." A thread earns the slot only when it opens onto a larger
   force — an incentive, a policy move, a structural shift — that the piece
   actually reports out.
4. Score candidates on: **interest/importance today** (highest weight) ×
   **uniqueness** (can the reader get this synthesis in one place elsewhere?) ×
   **durability** (useful in 12 months?) × **reader-fit** (`TASTE.md`) × **fit
   to today's columnist's lens** (`AUTHORS.md`). Natural cross-domain reach
   raises the score; a forced one lowers it.
5. **Don't re-run the same idea in new clothes.** Before committing, scan the
   last ~7 entries in MEMORY.md's coverage index: if three of them already
   orbit one thesis (e.g. the 06-27→07-04 "you can't control a readable-output
   capability" cluster), pick a candidate that opens a *different* front.
   Never repeat a piece unless the story moved materially — if it did, frame
   as an update and link the original.

**Beat balance — the devtools / dev-marketing guarantee.** The reader wants
The Wire to *cover the devtools and dev-marketing space*, not just AI and its
crossovers. **At least one dive per calendar week (Tue–Sun) must be squarely a
devtools or dev-marketing / DevRel piece** — a new tool or release, a
practitioner workflow, an evergreen "how this part of the stack works," or the
business of developer products (adoption, docs, distribution). Before starting,
check this week's dives in MEMORY.md's coverage index: if none has filled the
devtools/dev-marketing slot and the week is running out of days, this slot wins
today. (Thursday's Claude Code edition is adjacent but does **not** discharge
this guarantee — it's the tool itself, not the broader devtools/dev-marketing
space.)

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
- **Follow it across domains**: the point of the piece is the connective
  tissue. Chase the fact into a second and third domain — who pays, who
  benefits, what it does to energy / the market / policy / China — and get a
  primary source in *each* domain, not just the technical one. This is what
  makes the piece feel reported rather than explained.
- **History** when it matters: how did we get here?
- **The discussion**: what practitioners actually argued — HN (Algolia API),
  Reddit, X, GitHub issues. Quote the dissenting comment, linked.
- **The other side**: find the strongest counter *for each angle* — the piece
  carries several points of view, not one verdict — and engage them.

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

For the **Claude Code edition**, swap the kicker to `Claude Code` so the
reader spots the weekly slot:
`*Claude Code · Kit Sandoval (The Operator) · <date> · <frame>*`. End on a
copy-pasteable config/command/workflow, each tip attributed to its source.

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
- A piece advancing a running thread → update its entry in `_data/threads.yml`.
  A piece **opening a new** thread → add a new block too (`slug`, `title`,
  `momentum`, `summary`, optional `tension`, `issues`); every thread in
  `reports/MEMORY.md` must have a matching entry in `_data/threads.yml`.

If the reader has stated a preference for one columnist's voice (in session
or via issue comments), record the durable lesson in `reports/TASTE.md` —
which voice landed and why — and prune one-off reactions.

## Step 5 — Save

Write the files only. Do **not** commit, push, or open issues — in CI the
workflow publishes; in an interactive session, tell the user what you wrote
and where, and let them decide.
