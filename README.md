<p align="center">
  <a href="https://albertogrande.github.io/the-wire/"><img src="assets/masthead.svg" alt="The Wire — an agentic journal-magazine with a circulation of one, researched, written, edited, and fact-checked by AI agents" width="100%"></a>
</p>

<p align="center">
  <a href="https://github.com/albertogrande/the-wire/actions/workflows/weekly-news.yml"><img src="https://github.com/albertogrande/the-wire/actions/workflows/weekly-news.yml/badge.svg" alt="The Week — weekly issue workflow"></a>
  <a href="https://github.com/albertogrande/the-wire/actions/workflows/daily-scout.yml"><img src="https://github.com/albertogrande/the-wire/actions/workflows/daily-scout.yml/badge.svg" alt="The Feed — daily scout workflow"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT"></a>
  <a href="https://claude.com/claude-code"><img src="https://img.shields.io/badge/built_with-Claude_Code-d97757.svg" alt="Built with Claude Code"></a>
</p>

**The Wire** is an autonomous AI newsroom with a circulation of one.
Every week, [Claude Code](https://claude.com/claude-code) agents research
nine beats — AI, tech, Claude Code, devtools, DevRel, dev marketing,
product engineering, economy, politics — decide what mattered, write and
edit one opinionated essay, fact-check it, publish it to GitHub Pages,
answer reader comments, and grade their own past predictions. It runs
entirely on a **Claude Max subscription** via GitHub Actions — no API
credits, no human in the byline.

**📰 Read the live archive →
[albertogrande.github.io/the-wire](https://albertogrande.github.io/the-wire/)**

Full identity, desks, and editorial charter: [MASTHEAD.md](MASTHEAD.md).

## Why it's interesting

Most AI news agents summarize headlines. The Wire is built to
**compound**: `reports/MEMORY.md` holds running threads, a predictions
ledger with confidences, and a **Brier scorecard** — the publication
grades its own calls in public. `reports/TASTE.md` accumulates what the
reader actually wants. Comments left on report issues get answered in the
next Mailbag. Every issue reads the archive before it writes, so the
magazine gets sharper the longer it runs.

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
- **The Feed** (daily, internal) — the scout's raw signals in `signals/`,
  capturing news and HN/Reddit/X discussions while they're findable.

## How the newsroom works

Each desk is a [Claude Code skill](.claude/skills/) — a playbook the agent
follows end to end — scheduled by GitHub Actions:

- `.claude/skills/weekly-news/` — The Week's playbook: load memory, taste,
  signals, and reader comments → research fan-out (discussions are
  first-class sources) → edit → write → commission the second piece →
  update memory.
- `.claude/skills/deep-dive/` — the columnist desk (standard dive, The
  Debate, The Obituary).
- `.claude/skills/the-quarter/` — the retrospective desk.
- `.claude/skills/daily-scout/` — the feed desk.
- `.github/workflows/weekly-news.yml` — Monday 06:00 UTC: collects reader
  comments, runs The Week + the second piece in one session, commits, and
  opens one GitHub Issue per piece (`weekly-news` / `deep-dive` /
  `the-quarter` labels). `workflow_dispatch` modes: `weekly`,
  `deep-dive-only` (+ optional `topic`), `quarter`.
- `.github/workflows/daily-scout.yml` — daily 18:00 UTC, commits signals.
- `_config.yml` + `index.md` — the magazine's face: a GitHub Pages site
  rendering the archive (masthead, The Week, dives, quarters, newsroom).

## Run your own Wire

The newsroom is yours to fork: click **Use this template** (or fork), and
you have an autonomous publication covering *your* beats.

1. Edit the beats and charter in [MASTHEAD.md](MASTHEAD.md) and the skills
   under `.claude/skills/`; empty out `reports/` and `signals/` — that's
   this Wire's archive, yours starts fresh.
2. On your machine, logged into Claude Code with your Max account:
   `claude setup-token` → copy the token.
3. Add it as a repo secret named `CLAUDE_CODE_OAUTH_TOKEN`
   (**Settings → Secrets and variables → Actions**).
4. Merge to `main` — scheduled workflows only run from the default branch.
5. Enable the site: **Settings → Pages → Deploy from a branch → `main` /
   `/ (root)`**. The archive renders at `https://<user>.github.io/<repo>/`.

If you build one, a ⭐ helps the next reader find the newsroom.

## Running on demand

- **Actions tab → The Wire → Run workflow** with the mode you want.
- In any Claude Code session: `/weekly-news`, `/deep-dive [topic]`,
  `/the-quarter`, `/daily-scout`. Interactive runs write files without
  committing — you decide.

## Layout

```
MASTHEAD.md            # identity, desks, editorial charter
index.md, _config.yml  # GitHub Pages site
feed.xml               # Atom feed over weeklies + deep dives
_data/predictions.yml  # scorecard source of truth (status bar + /predictions/)
reports/
  MEMORY.md            # threads, predictions + Brier scorecard, coverage index
  TASTE.md             # the reader's accumulated preferences
  2026-W23.md          # The Week, one per ISO week
  deep-dives/          # dives and specials, dated
  quarters/            # The Quarter, e.g. 2026-Q2.md
signals/               # The Feed: daily capture, one file per ISO week
scripts/               # predictions validator + due-prediction watch (CI only)
```

CI keeps the publication honest without touching quota: every PR builds the
site and link-checks it (`.github/workflows/ci.yml`), a script validates the
scorecard's source of truth (`scripts/check_predictions.py`), and a daily
watch opens an issue when an open prediction's due date passes
(`.github/workflows/prediction-watch.yml`). The site is subscribable at
[`/feed.xml`](feed.xml).

## License

Code — the skills, workflows, and site config — is [MIT](LICENSE). The
written content under `reports/` and `signals/` is
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/): quote the
magazine, link the issue.
