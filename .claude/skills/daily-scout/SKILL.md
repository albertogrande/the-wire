---
name: daily-scout
description: Quick daily signals capture — sweep the last 24h across the publication's beats (news + HN/Reddit/X discussions) and append dated one-liners to signals/<week>.md for the weekly editor to use. Use when asked to run the scout or capture today's signals.
---

# The Feed — Daily Scout

You run The Wire's feed desk (see `MASTHEAD.md`). You are the scout,
not the editor. Your job takes minutes, not an hour:
capture what happened and what people argued in the **last ~24 hours**, as
raw dated one-liners. No essays, no synthesis — Monday's editor does that.
The value is capture: discussions and signals that are easy to find today
are often hard to find by Monday.

Your capture has two readers now: the **weekly editor** on Monday, and the
**daily dive** an hour after you run, which scans today's signals for a
piece worth writing. So today's block earns its keep the same day — capture
crisply.

You also run a standing **Claude Code Watch** (Step 2b): a dedicated daily
sweep for the tool the reader lives in. It feeds the daily dive's weekly
**Claude Code edition** (Thursdays, written by The Operator), so it can't be
left to dilute into the general beat sweep.

## Step 1 — Where to write

```bash
TODAY=$(TZ=Europe/Madrid date +%Y-%m-%d)                  # Madrid calendar date
WEEK_FILE="signals/$(TZ=Europe/Madrid date +%G-W%V).md"   # current ISO week (Madrid)
```

Create the file if missing, with the header:

```markdown
# Signals — week <WEEK_ID>

Raw daily capture. One line per signal. Input for the weekly editor.
```

Read the existing file first — never duplicate a signal already captured.

## Step 2 — Sweep (keep it fast)

Cover the beats: AI, tech, Claude Code, devtools, DevRel, dev marketing,
product engineering, economy, politics. Budget: **4–8 searches/fetches
total**, not per beat.

- 2–4 WebSearch queries for the last 24h across whichever beats look alive
  today (vary day to day; don't run the same queries every day).
- WebFetch the Hacker News front page via the Algolia API —
  `https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=30` —
  and note the stories relevant to the beats, especially ones with hot
  comment threads (high comment count relative to points).
- If something big is clearly unfolding (outage, controversy, launch),
  one extra fetch to pin down what's actually claimed.

## Step 2b — Claude Code Watch (always run)

A dedicated, standing capture for **Claude Code** — separate from the beat
sweep above, because the reader runs the tool daily and the daily dive has a
weekly Claude Code edition (Thursdays) that feeds on this. Budget **2–4 extra
searches/fetches** for this pass. Sweep a *fixed* source set (unlike the
rotating beat queries):

- Anthropic's Claude Code **docs / changelog / release notes** and the
  `@anthropic-ai/claude-code` releases — new versions, features, commands,
  flags, settings, hooks, model changes.
- The **Claude Code GitHub repo** — recent releases, and issues/discussions
  with traction.
- **Practitioner channels** — r/ClaudeAI and r/ClaudeCode (Reddit), Hacker
  News (Algolia query for `Claude Code`), and notable X/blog posts from power
  users.

Capture, in order of value to the reader:
1. **Features / changes** — a command, flag, setting, hook, MCP, subagent, or
   model change that alters how you work.
2. **Workflows & max-performance** — how practitioners structure loops,
   context budget, `CLAUDE.md`, skills, permissions, and multi-agent setups to
   get more out of the tool.
3. **Tips & recommendations** — concrete, reproducible practitioner advice.
4. **Discussion** — what people argue about (gotchas, regressions, wins).

## Step 3 — Append

Add **5–15 lines** under a `## <TODAY>` heading. Format, one line each:

```markdown
- [<short headline or thread title>](<url>) — <one clause: what + why it might matter> (<beat>)
```

Rules:
- Discussions are first-class: an HN thread blowing up about pricing is a
  signal even if no outlet wrote it up. Link the thread.
- Note trajectory when visible: "second day of backlash", "follow-up to
  Mon's launch".
- A quiet day is fine — 3 lines beats 15 padded ones. Zero genuinely new
  signals: append `## <TODAY>` with `- (quiet day)` so the editor knows the
  scout ran.
- No takes beyond a clause. No verification beyond the obvious — the weekly
  editor verifies before publishing.

Then, **inside the same `## <TODAY>` block**, append the Claude Code Watch
(Step 2b) as a dedicated subsection:

```markdown
### Claude Code Watch

- [<headline or thread>](<url>) — <what + why it matters> (<feature|workflow|tip|discussion>)
```

Rules for the subsection:
- **Always write the `### Claude Code Watch` heading**, even on a quiet day —
  then a single `- (nothing notable)` line so the dive knows the watch ran.
- 0–6 lines. Tag each with `feature`, `workflow`, `tip`, or `discussion`.
- This subsection is for the **practice of the tool** — features, workflows,
  tips, the practitioner discussion. Leave broad Claude Code business or
  politics items (funding, export controls) up in the main list.

## Step 4 — Save

Write the file. Do **not** commit or push — in CI the workflow commits; in
an interactive session, tell the user what you captured.
