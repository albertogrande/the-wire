# Deep Research — Weekly News Agent

An autonomous editor-in-chief that publishes, every Monday:

1. **A weekly issue** — ONE opinionated essay on what mattered most last
   week (Monday→Sunday), connecting stories across topics and across
   previous issues. Plus a short "Also this week" footer and a falsifiable
   "One thing to watch."
2. **A deep dive** — a ~2,000–3,500-word thesis-driven piece on the week's
   most consequential story, picked by the agent.

**Beats** (where the agent looks — never how output is organized): AI, tech,
Claude Code, devtools, DevRel, dev marketing, product engineering, economy,
politics. The agent is the editor: it decides each week what's relevant,
what gets cut, and what the essay argues. Voice: Lee Robinson's clarity ×
The Pragmatic Engineer's depth — short clear sentences carrying real
reporting, numbers, and direct takes.

**It compounds.** The agent maintains `reports/MEMORY.md` — running threads,
a predictions ledger with explicit confidences and a running **Brier
scorecard** (the publication grades its own calls in public), and a coverage
index. `reports/TASTE.md` accumulates the reader's preferences. Issues link
back to earlier issues and build on them instead of restarting.

**It listens.** A **daily scout** captures each day's signals — news *and*
HN/Reddit/X discussions — into `signals/`, so the Monday editor works from
seven days of live capture instead of what's still searchable. Comments you
leave on the report issues get answered in the next issue's **Mailbag**
section and folded into TASTE.md.

Runs entirely on a **Claude Max subscription** via Claude Code — no API
credits consumed.

## How it works

- **`.claude/skills/weekly-news/SKILL.md`** — the weekly playbook: load
  memory → research fan-out across beats → edit (decide the week's
  narrative) → write the essay → pick the deep-dive topic → update memory.
- **`.claude/skills/deep-dive/SKILL.md`** — the deep-dive playbook: one
  topic researched deep (history, players, incentives, numbers, contrarian
  takes) → thesis-driven essay.
- **`.claude/skills/daily-scout/SKILL.md`** — the scout playbook: 4–8 quick
  searches/fetches over the last 24h (including the HN front page via the
  Algolia API), 5–15 dated one-liners appended to `signals/<week>.md`.
- **`.github/workflows/weekly-news.yml`** — Monday 06:00 UTC cron collects
  reader comments from recent report issues, runs both skills in one
  session, then deterministic steps commit everything and open one GitHub
  Issue per piece (`weekly-news` / `deep-dive` labels).
- **`.github/workflows/daily-scout.yml`** — daily 18:00 UTC cron runs the
  scout and commits new signals.

## One-time setup

1. On your own machine, logged into Claude Code with your Max account:

   ```bash
   claude setup-token
   ```

2. Add the printed token as a repo secret named `CLAUDE_CODE_OAUTH_TOKEN`
   (**Settings → Secrets and variables → Actions**).

3. Merge to `main` — scheduled workflows only run from the default branch.

## Running on demand

- **Actions tab → Weekly News Report → Run workflow**:
  - `mode: weekly` — full Monday run (essay + deep dive)
  - `mode: deep-dive-only` — just a deep dive; set `topic` to choose the
    subject, or leave empty to let the agent pick.
- **In any Claude Code session** in this repo:
  - `/weekly-news` — generate the weekly issue
  - `/deep-dive` or `/deep-dive <topic>` — generate a deep dive
  - `/daily-scout` — capture today's signals

  Interactive runs write files without committing — you decide.

## Layout

```
reports/
  MEMORY.md            # editorial memory: threads, predictions + Brier scorecard, index
  TASTE.md             # the reader's accumulated preferences
  2026-W23.md          # weekly issues, one per ISO week
  deep-dives/
    2026-06-12-....md  # deep dives, dated
signals/
  2026-W24.md          # daily scout capture, one file per ISO week
```

Reports are also published as GitHub Issues:
[weekly issues](../../issues?q=label%3Aweekly-news) ·
[deep dives](../../issues?q=label%3Adeep-dive).
