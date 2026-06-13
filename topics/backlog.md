# Deep-Dive Backlog

Evergreen topic ideas for the daily dive — the "interesting topics" pool,
drawn from any day the news doesn't earn the slot. Modeled on the standing
backlog The Pragmatic Engineer keeps (~100 ideas, demand-tested over time).

**Format tags** (the columnist picks one): `how-it-works` · `x-vs-y` ·
`architecture` · `postmortem` · `what-every-engineer-should-know` ·
`economics` · `news-to-framework` · `n-lessons` · `reference` ·
`practical-guide`. Parenthetical = suggested columnist affinity, not a rule.

**Workflow:** when a topic is written, move it under *Used* with its date and
file. Add ideas freely (scout, weekly editor, or the reader). Keep the live
list deep — aim for ~40+ unused ideas at all times. An idea that the news
overtakes becomes a `news-to-framework` piece instead — that's fine.

## Live — AI & models

- [how-it-works] How a context window actually works: attention cost, the
  lost-in-the-middle effect, and where recall degrades (Analyst)
- [x-vs-y] Long-context vs RAG: when each wins, with real recall numbers (Analyst)
- [how-it-works] What a tool call costs: tokens, latency, and round-trips in
  an agent loop (Builder)
- [what-every-engineer-should-know] Prompt caching: what gets cached, the TTL,
  and the cost math that makes or breaks an agent (Analyst)
- [how-it-works] How speculative decoding makes models faster without changing
  outputs (Analyst)
- [x-vs-y] Open weights vs closed APIs: the real total cost once you price
  inference, ops, and eval (Analyst)
- [how-it-works] Mixture-of-experts, explained from the routing up (Analyst)
- [reference] What "agent" actually means in 2026, stripped of marketing (Contrarian)

## Live — Claude Code & agent engineering

- [how-it-works] How Claude Code's context compaction works, and when it costs
  you (Builder)
- [how-it-works] Git worktrees under an agent: why isolation beats a shared
  checkout (Builder)
- [architecture] The anatomy of an MCP server: transport, tool schemas, and
  what a call really costs (Builder)
- [practical-guide] Writing a skill that triggers reliably — the description is
  the product (Builder)
- [postmortem] Failure modes of agent loops: runaway turns, context rot, and
  silent tool errors (Analyst)
- [x-vs-y] One big agent vs many small ones: where the orchestration overhead
  stops paying off (Analyst)
- [n-lessons] What a week of letting an agent write 80% of the code actually
  taught us (Builder)

## Live — devtools & systems

- [how-it-works] Why your test suite is slow: the real cost model of a CI run (Analyst)
- [x-vs-y] Monorepo vs polyrepo once AI agents are the main committer (Contrarian)
- [postmortem] Anatomy of a dependency-confusion attack, end to end (Analyst)
- [what-every-engineer-should-know] OIDC, OAuth, sessions, and tokens — the auth
  vocabulary every engineer keeps confusing (Builder)
- [how-it-works] How a package registry serves a billion downloads a day (Analyst)
- [architecture] How a fast build cache actually works (and why yours misses) (Builder)
- [what-every-engineer-should-know] Idempotency: the one property that saves
  every retry path (Builder)
- [postmortem] The class of outage that's always DNS, and why (Analyst)
- [how-it-works] What an LLM gateway actually does: proxying, failover, caching,
  cost caps, and where the latency hides (Builder)
- [architecture] Why LLM observability runs on a columnar database — the trace
  store, not the dashboard, is the asset (Analyst)

## Live — DevRel, dev marketing, product engineering

- [reference] What DevRel is actually for at an AI-tools company in 2026 (Builder)
- [reference] Developer experience as a measurable thing, not a vibe (Builder)
- [n-lessons] What makes developer documentation get linked vs ignored (Builder)
- [reference] The product engineer: who owns the gap between design and prod (Builder)
- [x-vs-y] Bottom-up vs top-down adoption for a developer tool — the real
  funnel math (Analyst)
- [what-every-engineer-should-know] How open-source-as-distribution actually
  pays back (Contrarian)

## Live — economy & the AI business

- [economics] The unit economics of an AI coding subscription, line by line (Analyst)
- [economics] What an inference dollar buys in 2026, and where the margin sits (Analyst)
- [economics] Reading an AI company's S-1: the three numbers that matter (Analyst)
- [news-to-framework] When a model price cut is a moat move, not a gift (Contrarian)
- [economics] The cost curve of training vs serving — which one is the business (Analyst)
- [what-every-engineer-should-know] The capex behind the API: GPUs, power, and
  why the constraint is the grid (Analyst)

## Live — politics & policy (technical lens)

- [news-to-framework] How export controls actually shape which models you can
  run (Contrarian)
- [what-every-engineer-should-know] What the EU AI Act asks of a team shipping
  an agent, in plain terms (Builder)
- [news-to-framework] Provenance and attestation: what "signed software" can and
  can't promise (Analyst)
- [contrarian] "Open source AI" — what the license actually grants you (Contrarian)

## Used

- [what-every-engineer-should-know] What a benchmark number actually measures —
  and how to read a model card without being fooled (Contrarian) — 2026-06-13,
  reports/deep-dives/2026-06-13-reading-a-coding-benchmark.md
- [practical-guide] Designing a subagent fan-out that doesn't blow your token
  budget (Builder) — 2026-06-13,
  reports/deep-dives/2026-06-13-subagent-fan-out-budget.md
