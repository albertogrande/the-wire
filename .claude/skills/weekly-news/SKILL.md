---
name: weekly-news
description: Research the previous full Monday–Sunday week of news across AI, tech, devtools, DevRel, and product engineering, then write an opinionated weekly report — a cross-domain lead essay plus quick hits — saved to reports/. Use when the user asks for the weekly news report or to run the news agent.
---

# Weekly News Report

You are writing a weekly tech briefing for one reader: a product engineer who
follows AI, devtools, and DevRel closely. The goal is **something interesting
to read**, not a news index. Every item earns its place by having context and
a take attached. The reader can get headlines anywhere; what they can't get
is the connective tissue between them.

## Step 1 — Compute the reporting window

The report always covers the **last completed Monday→Sunday week**, regardless
of which day it runs.

```bash
END=$(date -d "last sunday" +%Y-%m-%d)        # end of window (Sunday)
START=$(date -d "last sunday - 6 days" +%Y-%m-%d)  # start of window (Monday)
WEEK_ID=$(date -d "last sunday" +%G-W%V)      # ISO week id, e.g. 2026-W23
```

The output file is `reports/<WEEK_ID>.md`. If it already exists, stop and say
so — don't overwrite a published report unless explicitly asked.

## Step 2 — Research fan-out

Run WebSearch queries scoped to the window (mention the dates or "this week"
/ "past week" in queries; discard results whose events fall outside the
window — check publication dates, don't assume). Cover:

**Per-area sweeps:**
- AI: model releases, lab news (Anthropic, OpenAI, Google DeepMind, Meta,
  Mistral, open-source), benchmarks, agents, notable research
- Tech industry: big-tech moves, chips/semis, funding, M&A, earnings if notable
- Devtools: language/framework/runtime releases, IDEs and AI coding tools,
  infra, databases, npm/GitHub ecosystem news
- DevRel & developer community: platform/pricing changes hitting developers,
  conference news, community controversies, developer-experience shifts
- Product engineering: engineering org news, layoffs/hiring signals,
  practices and process debates, notable postmortems or engineering blogs

**Cross-domain sweeps (these feed the lead essay):**
- AI × energy: data center buildout, power deals, grid strain, nuclear/renewables
- AI × economy: capex, markets, jobs/labor impact, bubble discourse
- AI × politics: regulation, export controls, elections, geopolitics, chips policy
- Anything where two of this week's stories are secretly the same story

Aim for 12–18 searches total. Then **WebFetch the 5–8 sources** that will
anchor the lead essay — read them properly; don't write the essay off search
snippets alone.

## Step 3 — Find the thread

Before writing, decide: **what is the one story this week that connects the
most dots?** The lead essay is not "the biggest headline" — it's the angle
that makes three or four separate headlines make sense together (e.g. a model
release + a power-purchase deal + a regulatory move are one story about
compute as the new strategic resource). If the week genuinely lacks a
cross-domain thread, pick the most consequential single story and zoom out on
its second-order effects.

## Step 4 — Write the report

**Voice** — a blend of:
- *Stratechery*: build a thesis, explain incentives and structure, trace
  second-order effects. Frameworks over play-by-play.
- *Pragmatic Engineer*: ground it in what this means for working engineers —
  their tools, their jobs, their roadmaps.
- Opinionated: make calls. Say what's overhyped, what's underrated, who
  benefits, what you'd expect to happen next. Hedge only when honestly
  uncertain, and say *why*.
- Context over recency: a one-line "what happened" then spend the words on
  "why it matters" and "what it connects to."
- Inline links on key claims and primary sources, woven into the prose. No
  footnotes, no bibliography, no "Sources:" section. This is not a citations
  report.

**Structure** (target 1,500–2,500 words total):

```markdown
# <Sharp, thesis-bearing title — not "Weekly News Report">

*Week of <START> to <END> · <one-line subtitle teasing the thesis>*

<Lead essay, ~600–900 words. The cross-domain thread. 2–4 short sections or
flowing prose — whatever serves the argument. End with a clear stance.>

## AI
<3–5 quick hits. Each: bolded lede sentence with link, then 1–3 sentences of
context + take. Skip an area's weak items rather than padding.>

## Tech
<3–5 quick hits>

## Devtools
<3–5 quick hits>

## DevRel
<2–4 quick hits>

## Product Engineering
<2–4 quick hits>

## One thing to watch
<Short closer: a prediction or open question for next week, with a falsifiable
edge — something next week's report can score itself against.>
```

**Quality bar:**
- Every dated claim verified to fall inside the window.
- No item without a take. "X released Y" alone is below the bar.
- At least two quick hits should reference the lead essay's thread — the
  report should feel like one document, not six.
- Cut ruthlessly: a 1,600-word report that's all signal beats 2,500 words
  with filler.

## Step 5 — Save

Write the finished report to `reports/<WEEK_ID>.md`. Do **not** commit, push,
or open issues — in CI the workflow handles publication; in an interactive
session, tell the user where the file is and let them decide.
