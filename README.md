# The Observer

*An agentic journal-magazine with a circulation of one.*

The Observer is written, edited, and fact-checked by AI agents for exactly
one reader, covering his beats: AI, tech, Claude Code, devtools, DevRel,
dev marketing, product engineering, economy, politics. It runs entirely on
a **Claude Max subscription** via Claude Code — no API credits.

Full identity, desks, and editorial charter: [MASTHEAD.md](MASTHEAD.md).

## What it publishes

- **The Week** (Mondays) — one opinionated essay on what mattered last
  Monday→Sunday, connecting stories across beats and past issues. Plus a
  short "Also this week" footer, a **Mailbag** answering reader comments,
  and a confidence-tagged prediction.
- **Deep Dive** (with The Week) — one subject taken seriously. The editor
  may swap in a special when the week earns it: **The Debate** (both sides
  steelmanned) or **The Obituary** (something died; honest retrospective).
- **The Quarter** (every ~13 weeks, on demand) — retrospective from the
  archive: thread arcs, the Brier scorecard reviewed honestly, then-vs-now.
- **The Wire** (daily, internal) — the scout's raw signals in `signals/`,
  capturing news and HN/Reddit/X discussions while they're findable.

**It compounds.** `reports/MEMORY.md` holds running threads, a predictions
ledger with confidences and a running **Brier scorecard** (the publication
grades its own calls in public), and a coverage index. `reports/TASTE.md`
accumulates the reader's preferences. Comments on report issues get
answered in the next Mailbag.

## How it works

- `.claude/skills/weekly-news/` — The Week's playbook: load memory, taste,
  signals, and reader comments → research fan-out (discussions are
  first-class sources) → edit → write → commission the second piece →
  update memory.
- `.claude/skills/deep-dive/` — the columnist desk (standard dive, The
  Debate, The Obituary).
- `.claude/skills/the-quarter/` — the retrospective desk.
- `.claude/skills/daily-scout/` — the wire desk.
- `.github/workflows/weekly-news.yml` — Monday 06:00 UTC: collects reader
  comments, runs The Week + the second piece in one session, commits, and
  opens one GitHub Issue per piece (`weekly-news` / `deep-dive` /
  `the-quarter` labels). `workflow_dispatch` modes: `weekly`,
  `deep-dive-only` (+ optional `topic`), `quarter`.
- `.github/workflows/daily-scout.yml` — daily 18:00 UTC, commits signals.
- `_config.yml` + `index.md` — the magazine's face: a GitHub Pages site
  rendering the archive (masthead, The Week, dives, quarters, newsroom).

## One-time setup

1. On your machine, logged into Claude Code with your Max account:
   `claude setup-token` → copy the token.
2. Add it as a repo secret named `CLAUDE_CODE_OAUTH_TOKEN`
   (**Settings → Secrets and variables → Actions**).
3. Merge to `main` — scheduled workflows only run from the default branch.
4. Enable the site: **Settings → Pages → Deploy from a branch → `main` /
   `/ (root)`**. The archive renders at `https://<user>.github.io/<repo>/`.

## Running on demand

- **Actions tab → The Observer → Run workflow** with the mode you want.
- In any Claude Code session: `/weekly-news`, `/deep-dive [topic]`,
  `/the-quarter`, `/daily-scout`. Interactive runs write files without
  committing — you decide.

## Layout

```
MASTHEAD.md            # identity, desks, editorial charter
index.md, _config.yml  # GitHub Pages site
reports/
  MEMORY.md            # threads, predictions + Brier scorecard, coverage index
  TASTE.md             # the reader's accumulated preferences
  2026-W23.md          # The Week, one per ISO week
  deep-dives/          # dives and specials, dated
  quarters/            # The Quarter, e.g. 2026-Q2.md
signals/               # The Wire: daily capture, one file per ISO week
```
