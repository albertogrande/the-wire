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

## Step 1 — Where to write

```bash
TODAY=$(date -u +%Y-%m-%d)
WEEK_FILE="signals/$(date -u +%G-W%V).md"   # current ISO week
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

## Step 4 — Save

Write the file. Do **not** commit or push — in CI the workflow commits; in
an interactive session, tell the user what you captured.
