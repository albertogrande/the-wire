# Deep-Dive Backlog

Evergreen topic ideas for the daily dive — the "interesting topics" pool,
drawn from any day the news doesn't earn the slot. Modeled on the standing
backlog The Pragmatic Engineer keeps (~100 ideas, demand-tested over time).

**Format tags** (the columnist picks one): `how-it-works` · `x-vs-y` ·
`architecture` · `postmortem` · `what-every-engineer-should-know` ·
`economics` · `news-to-framework` · `n-lessons` · `reference` ·
`practical-guide`. Parenthetical = suggested columnist affinity, not a rule
(Analyst · Contrarian · Builder · **Operator** = the Claude Code desk).

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
- [x-vs-y] Open weights vs closed APIs: the real total cost once you price
  inference, ops, and eval (Analyst)
- [how-it-works] Model distillation: what training on another model's outputs
  actually copies, and what the license lets you do with it (Analyst)
- [news-to-framework] Why training data is the moat and the liability at once —
  copyright exposure as the reason no frontier model ships its corpus (Contrarian)

- [how-it-works] The KV cache: why context length, not parameter count,
  decides what fits in your VRAM — with the linear-growth math (Builder)
- [practical-guide] Quantization without tears: dynamic 4-bit, KV-cache
  quantization, and what actually loses quality vs what doesn't (Analyst)

## Live — Claude Code & agent engineering

*The Operator's home pool — Claude Code workflows and max-performance. The
weekly Claude Code edition (Thursdays) draws from here and the scout's Claude
Code Watch.*

- [practical-guide] The daily-driver loop: structuring a Claude Code session
  so the agent finishes more before it derails (Operator)
- [reference] A CLAUDE.md that earns its tokens: what to put in, what to cut,
  for a large repo (Operator)
- [practical-guide] The permission allowlist that stops the prompts without
  going full YOLO (Operator)
- [how-it-works] Hooks that catch the agent's mistakes before they land —
  lint, test, and format gates as guardrails (Operator)
- [practical-guide] Subagent orchestration that saves wall-clock time, not
  just tokens (Operator)
- [n-lessons] What the top Claude Code workflows have in common — patterns
  lifted from power users (Operator)
- [reference] MCP servers worth wiring into Claude Code, and what each one
  actually buys you (Operator)
- [practical-guide] Skills vs slash commands vs CLAUDE.md: where each piece of
  automation belongs (Operator)
- [how-it-works] Driving Claude Code headless from CI: the unattended-agent
  workflow pattern (Operator)
- [practical-guide] Reading your context window: /context, the status line, and
  what's actually eating your tokens (Builder)
- [postmortem] When a compaction summary drops the thing you needed — designing
  CLAUDE.md compaction rules and checkpoints that survive the save (Builder)
- [architecture] The anatomy of an MCP server: transport, tool schemas, and
  what a call really costs (Builder)
- [x-vs-y] MCP vs A2A: the tool rung vs the agent rung — what each protocol
  actually wires together, and why one got adopted and one got shrugged at (Builder)
- [how-it-works] The ReAct loop, from the inside: reflection → action →
  observation, the memory it needs, and what the framework actually adds (Builder)
- [x-vs-y] JSON tool calls vs code actions: why writing actions as code composes
  better than emitting tool-name-and-args JSON (Analyst)
- [practical-guide] Writing a skill that triggers reliably — the description is
  the product (Builder)
- [postmortem] Failure modes of agent loops: runaway turns, context rot, and
  silent tool errors (Analyst)
- [x-vs-y] One big agent vs many small ones: where the orchestration overhead
  stops paying off (Analyst)
- [n-lessons] What a week of letting an agent write 80% of the code actually
  taught us (Builder)
- [reference] The Claude Code env vars that actually change behavior —
  CLAUDE_CODE_DISABLE_1M_CONTEXT, CLAUDE_AUTOCOMPACT_PCT_OVERRIDE,
  MAX_THINKING_TOKENS, and the rest, with what each one buys (Operator)
- [practical-guide] Externalized memory across /clear: designing a PROGRESS.md
  handoff file an agent can dump to and reload without losing the "why" (Operator)

## Live — devtools & systems

- [how-it-works] Why your test suite is slow: the real cost model of a CI run (Analyst)
- [x-vs-y] Monorepo vs polyrepo once AI agents are the main committer (Contrarian)
- [postmortem] Anatomy of a dependency-confusion attack, end to end (Analyst)
- [what-every-engineer-should-know] OIDC, OAuth, sessions, and tokens — the auth
  vocabulary every engineer keeps confusing (Builder)
- [how-it-works] How a package registry serves a billion downloads a day (Analyst)
- [architecture] How a fast build cache actually works (and why yours misses) (Builder)
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

## Used

- [what-every-engineer-should-know] What a benchmark number actually measures —
  and how to read a model card without being fooled (Contrarian) — 2026-06-13,
  reports/deep-dives/2026-06-12-reading-a-coding-benchmark.md
- [practical-guide] Designing a subagent fan-out that doesn't blow your token
  budget (Builder) — 2026-06-13,
  reports/deep-dives/2026-06-13-subagent-fan-out-budget.md
- [contrarian] "Open source AI" — what the license actually grants you
  (Contrarian) — 2026-06-16,
  reports/deep-dives/2026-06-16-open-weights-is-not-open-source.md
- [news-to-framework] Can a local model do your daily coding? open-weight vs
  runnable, the memory-budget chain (Builder) — 2026-06-17,
  reports/deep-dives/2026-06-17-local-coding-model-memory-budget.md
- [what-every-engineer-should-know] Prompt caching: what gets cached, the TTL,
  and the cost math that makes or breaks an agent (Analyst) — 2026-06-18,
  reports/deep-dives/2026-06-18-prompt-caching-hit-rate.md
- [reference] What "agent" actually means in 2026, stripped of marketing
  (Contrarian) — 2026-06-19,
  reports/deep-dives/2026-06-19-agent-is-a-control-flow-decision.md
- [how-it-works] How Claude Code's context compaction works, and when it costs
  you (Builder) — 2026-06-20,
  reports/deep-dives/2026-06-20-claude-code-compaction-save-point.md
- [how-it-works] Mixture-of-experts, explained from the routing up (Analyst) —
  2026-06-21, reports/deep-dives/2026-06-21-mixture-of-experts-active-parameters.md
- [how-it-works] Git worktrees under an agent: why isolation beats a shared
  checkout (Builder) — 2026-06-23,
  reports/deep-dives/2026-06-23-git-worktrees-agent-isolation.md
- [how-it-works] How speculative decoding makes models faster without changing
  outputs (Analyst) — 2026-06-24,
  reports/deep-dives/2026-06-24-speculative-decoding-idle-compute.md
- [practical-guide] Context-budget hygiene: keeping a long session from rotting
  before the task is done (Operator) — 2026-06-25,
  reports/deep-dives/2026-06-25-context-budget-sixty-percent.md
- [what-every-engineer-should-know] Idempotency: the one property that saves
  every retry path (Builder) — 2026-06-26,
  reports/deep-dives/2026-06-26-agent-retries-idempotent-writes.md
