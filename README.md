# Deep Research — Weekly News Agent

An autonomous agent that publishes an **opinionated weekly tech briefing**
every Monday, covering the previous Monday→Sunday across **AI, tech,
devtools, DevRel, and product engineering**.

It is not a link dump: each report opens with a lead essay connecting the
week's stories across domains (AI × energy × economy × politics), followed by
quick hits with context and a take. Voice: Stratechery's structural analysis
meets The Pragmatic Engineer's practitioner lens.

Runs entirely on a **Claude Max subscription** via Claude Code — no API
credits consumed.

## How it works

1. **`.claude/skills/weekly-news/SKILL.md`** — the agent's playbook: compute
   the Mon–Sun window, fan out 12–18 web searches per area plus cross-domain
   sweeps, read the anchor sources, find the thread that connects the week,
   write the report to `reports/<year>-W<week>.md`.
2. **`.github/workflows/weekly-news.yml`** — cron trigger every Monday
   06:00 UTC (plus manual "Run workflow" button). Claude Code researches and
   writes the file; deterministic workflow steps then commit it and open a
   GitHub Issue with the full report so it's easy to read on mobile.

## One-time setup

1. On your own machine, logged into Claude Code with your Max account, run:

   ```bash
   claude setup-token
   ```

   This prints a long-lived OAuth token tied to your subscription.

2. In this repo: **Settings → Secrets and variables → Actions → New
   repository secret**, name it `CLAUDE_CODE_OAUTH_TOKEN`, paste the token.

3. Merge this branch to `main` — scheduled workflows only run from the
   default branch.

That's it. First report arrives next Monday, or trigger one now from the
**Actions** tab → *Weekly News Report* → *Run workflow*.

## Running it on demand

In any Claude Code session in this repo, just type:

```
/weekly-news
```

The report is written to `reports/` for you to read, commit, or discard.

## Reading the archive

- `reports/` — every report, versioned in git.
- The [`weekly-news` issues](../../issues?q=label%3Aweekly-news) — same
  reports as issues, comment-friendly.
