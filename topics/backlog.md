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

- [how-it-works] Search against a verifier: how FunSearch (Nature 2023) and
  AlphaEvolve (2025) turn an LLM plus an automated evaluator into a discovery
  engine — the evolutionary loop, why the *scorer* not the model is what guards
  against hallucination, and the exact class of problems it fits (constructions
  with a cheap runnable checker: cap-set bounds, 48-mult matrix multiply)
  (Analyst) [surfaced by the 07-24 verifier-asymmetry dive]
- [what-every-engineer-should-know] Write the verifier first: the failing test,
  the property, the fuzzer, the eval fixture — why the quality of your check is
  the ceiling on everything an agent produces, and how to tell a faithful
  verifier from a gameable proxy before best-of-N Goodharts it (Builder/Analyst)
  [surfaced by the 07-24 verifier-asymmetry dive]
- [how-it-works] What "verified by Lean" actually guarantees: the proof-assistant
  kernel as a trusted core, why a kernel-checked proof is sound but "sound" ≠
  "the theorem you meant," and where autoformalization silently mis-states the
  goal (Analyst) [surfaced by the 07-24 verifier-asymmetry dive]
- [how-it-works] What a tool call costs: tokens, latency, and round-trips in
  an agent loop (Builder)
- [x-vs-y] Open weights vs closed APIs: the real total cost once you price
  inference, ops, and eval (Analyst)
- [news-to-framework] Why training data is the moat and the liability at once —
  copyright exposure as the reason no frontier model ships its corpus (Contrarian)
- [how-it-works] The KV cache: why context length, not parameter count,
  decides what fits in your VRAM — with the linear-growth math (Builder)
- [practical-guide] Quantization without tears: dynamic 4-bit, KV-cache
  quantization, and what actually loses quality vs what doesn't (Analyst)
- [how-it-works] How a vision model tokenizes an image: patches as visual
  tokens, the ⌈w/28⌉×⌈h/28⌉ cost, resolution tiers, and why a picture of text
  is priced like a picture (Analyst)
- [how-it-works] Optical context compression: DeepSeek-OCR's premise that a page
  carries fewer tokens than its character count — the compression-vs-fidelity
  curve, and where near-lossless recovery stops (Analyst)
- [how-it-works] DPO/RLHF from the inside: how a (chosen, rejected) preference pair
  becomes a weight update, the binary-loss math, and why the ranking — not the code
  — is the scarce training input (Analyst) [surfaced by the 07-10 accept-button dive]
- [x-vs-y] RLHF vs RLAIF: where synthetic AI feedback genuinely substitutes for human
  preference (style, helpfulness) and where it collapses (correctness-centric
  comparisons, where LLM judges run marginally above random) (Contrarian/Analyst)
- [economics] The data flywheel of an AI IDE: what accept/reject/edit telemetry is
  actually worth as training data, why zero-data-retention/Privacy Mode fences the
  highest-value enterprise slice, and whether the flywheel is a moat or a marketing
  line (Contrarian)
- [what-every-engineer-should-know] Measuring your own review miss-rate: seeding
  known-bad diffs, the aviation "inject failures in training" practice, and why a
  false-negative rate you've never measured is the real safety number of an
  AI-assisted codebase (Builder/Contrarian) [surfaced by the 07-22 deskilled-reviewer dive]
- [how-it-works] BPE tokenizers from the inside: merge tables, vocabulary budgets
  (o200k ~200k vs cl100k ~100k), why code and whitespace fragment worse than prose,
  and why the same file is 1.5–1.7× more tokens on one provider than another
  (Builder/Analyst) [surfaced by the 07-14 tokenizer-price dive]
- [practical-guide] A cost-per-solved-task harness: measuring model economics end to
  end — tokenizer × per-token price × output share × cache-hit rate × turns-to-done —
  instead of ranking models by the per-token list price (Analyst) [surfaced by the
  07-14 tokenizer-price dive]
- [x-vs-y] On-device vs cloud inference, the general rule: the decision is model-size
  the task needs ÷ device memory budget — why speech-to-text flipped to on-device
  (small model, bounded task) while frontier coding didn't (~150GB model), and how to
  tell which side of the line a workload sits on (Analyst) [surfaced by the 07-15
  on-device-speech dive; sibling to local-coding 06-17]
- [how-it-works] How speech recognition is scored and built: what word error rate
  (WER) actually counts, why read-speech benchmarks (LibriSpeech) flatter a model vs
  real far-field/multi-speaker audio (earnings22), streaming volatile-vs-final results,
  and the accuracy/latency/coverage tradeoffs of a transcription stack (Analyst)
- [how-it-works] Test-time compute from the inside: self-consistency (majority vote),
  best-of-N with a reward model / verifier, and beam/tree search over reasoning chains —
  why accuracy scales log-linear with samples, what a verifier actually buys over a raw
  vote, and where parallel sampling beats one long chain (Analyst) [surfaced by the
  07-18 reasoning-cost dive]
- [x-vs-y] Flat vs metered long-context pricing: why Anthropic removed its >200k
  2×/1.5× surcharge for flat 1M while OpenAI kept a 272k price cliff on GPT-5.6 —
  what the KV-cache-linear + attention-quadratic cost curve says about which bet is
  sustainable, and how to read a provider's context tiers before you budget (Analyst)
  [surfaced by the 07-21 context-price-cliff dive]
- [practical-guide] Setting a thinking budget: measuring the accuracy-vs-cost curve of
  `thinkingBudget`/`reasoning_effort` on your own workload, allocating compute by task
  difficulty (Snell), and picking the N for best-of-N where a wrong answer is worth 64
  right ones (Analyst/Operator) [surfaced by the 07-18 reasoning-cost dive]

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
- [how-it-works] PostToolUse hooks as *quality* gates — lint, test, and format
  the agent's output before it lands (distinct from the PreToolUse security
  veto covered 2026-07-02) (Operator)
- [practical-guide] Subagent orchestration that saves wall-clock time, not
  just tokens (Operator)
- [n-lessons] What the top Claude Code workflows have in common — patterns
  lifted from power users (Operator)
- [reference] MCP servers worth wiring into Claude Code, and what each one
  actually buys you (Operator)
- [how-it-works] Driving Claude Code headless from CI: the unattended-agent
  workflow pattern (Operator)
- [how-it-works] Tool Search / deferred tool loading from the inside: how
  `defer_loading` and an on-demand tool-discovery step keep a 58-tool library out of
  context until the model needs 3–5 of them, the round-trip it adds, and why fewer
  tools in view *raises* tool-call accuracy — not just cuts tokens (Operator/Analyst)
  [surfaced by the 07-16 context-tax dive]
- [practical-guide] An MCP context-budget audit: measuring each connected server's
  standing token cost with /context, ranking them by cost-per-use, and deciding which
  to defer, disconnect, or scope per-project (Operator) [surfaced by the 07-16
  context-tax dive]
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
- [practical-guide] A tool-call reliability eval: the small fixed harness you run
  on every model bump to catch schema-adherence regressions before prod (Builder)
- [how-it-works] Grammar-constrained / strict decoding from the inside: how a JSON
  Schema becomes a token mask, the reasoning tax it can charge, and the supported
  subset that trips people up (Analyst)
- [practical-guide] Skill descriptions as a routing problem: writing the one-line
  trigger the model actually matches on, and running the skill-creator eval loop
  (should-trigger / should-not-trigger hit rate, with-vs-without token overhead) to
  prove a description earns its keep (Operator)
- [how-it-works] `context: fork` — running a skill as a forked subagent: what
  loads (SKILL.md as the prompt, agent-type system prompt, CLAUDE.md unless
  Explore/Plan), what it can't see (your conversation), and when a forked skill
  beats an inline one (Operator)
- [reference] Dynamic context injection in skills: the `` !`cmd` `` preprocessing
  syntax, `${CLAUDE_SKILL_DIR}` / `$ARGUMENTS[N]` substitutions, and how to ground
  a skill in live repo state before the model ever reads it (Operator)
- [how-it-works] Credential masking in the sandbox proxy: `credentials.mode:"mask"`
  + `network.tlsTerminate` — how a per-session sentinel value is swapped for the real
  token only on the request that leaves for an `injectHosts` domain, so the command
  (and its logs) never hold the secret. When mask beats deny, and why it needs the
  proxy to terminate TLS (Operator) [surfaced by the 07-23 sandbox dive]
- [practical-guide] Sandboxing the MCP servers you didn't write: wrapping a local MCP
  server in `srt` (`@anthropic-ai/sandbox-runtime`) so a third-party tool server runs
  inside the same filesystem+network fence — the config, the deny-all-network default,
  and what it does and doesn't contain (Operator) [surfaced by the 07-23 sandbox dive;
  sibling to the MCP-trust-boundary and egress items]

## Live — devtools & systems

- [how-it-works] The accessibility tree as an agent API: how a screen-reader
  data structure (roles, names, ARIA states, stable refs) became the cheap,
  reliable way for agents to read a page — and what unlabeled `<div>` soup costs
  you in tokens and flake (Builder) [surfaced by the 07-11 browser-runtime dive]
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
- [how-it-works] The OpenTelemetry GenAI semantic conventions, from the inside:
  invoke_agent/execute_tool spans, the gen_ai.* attribute set, and why they're
  still "Development" status — what you can and can't build a durable dashboard
  on (Builder/Analyst)
- [what-every-engineer-should-know] Tamper-evident logs for machine actors:
  hash-chained append-only records (Merkle/RFC 8785), the external-witness
  trick, and why "trust me" telemetry stops being evidence when the actor is an
  agent (Analyst)
- [how-it-works] The kill chain, step by step: what an LLM agent can and can't
  automate in a real intrusion — where autonomy holds (chaining a known CVE,
  self-correcting an error) and where it collapses (novel initial access,
  evasion, hallucinated access) (Contrarian/Analyst)
- [news-to-framework] The attacker's marginal cost: how cheap agent labor
  changes the *volume and targeting distribution* of attacks, not the capability
  ceiling — and why that makes it a defense-and-hygiene problem, not a superhacker
  one (Contrarian)
- [what-every-engineer-should-know] The exposed-and-default surface agents
  harvest first: internet-facing known-CVE services, default credentials
  (minioadmin:minioadmin), unrotated signing keys — and the boring hardening that
  actually blunts an agentic attacker (Builder/Analyst)
- [practical-guide] Proxy your agent: a mitmproxy recipe for reading exactly what
  a coding CLI sends over the wire — the host list, the request bodies, the
  telemetry pipes — and the traffic-control env vars worth setting (Builder)
  [surfaced by the 07-17 agent-egress dive; that piece is the news peg — this is
  the deeper standalone how-to]
- [reference] The MCP trust boundary: every connected server sees what you hand
  it — mapping the data-egress surface of a loaded MCP config, per-server scoping,
  and what "State of MCP Security 2026" actually found (Builder/Analyst)
  [surfaced by the 07-17 agent-egress dive]
- [x-vs-y] Open-source vs closed coding CLIs as a *trust* decision (not a price
  one): what reading the source buys you, what it doesn't, and why license ≠ safety
  once the tool runs with your keys (Contrarian) [surfaced by the 07-17 dive]

## Live — DevRel, dev marketing, product engineering

- [reference] What DevRel is actually for at an AI-tools company in 2026 (Builder)
- [reference] Developer experience as a measurable thing, not a vibe (Builder)
- [n-lessons] What makes developer documentation get linked vs ignored (Builder)
- [reference] The product engineer: who owns the gap between design and prod (Builder)
- [x-vs-y] Bottom-up vs top-down adoption for a developer tool — the real
  funnel math (Analyst)
- [what-every-engineer-should-know] How open-source-as-distribution actually
  pays back (Contrarian)
- [practical-guide] Making your webapp agent-callable with WebMCP: `registerTool`,
  the declarative form, and why the distribution win only lands if you put a real
  consent step in front of every write tool (Builder) [the 07-11 dive covered the
  three-level gradient; this is the hands-on build] 

## Live — economy & the AI business

- [economics] The unit economics of an AI coding subscription, line by line (Analyst)
- [economics] What an inference dollar buys in 2026, and where the margin sits (Analyst)
- [economics] Reading an AI company's S-1: the three numbers that matter (Analyst)
- [economics] The cost curve of training vs serving — which one is the business (Analyst)
- [economics] What an inference token actually costs to serve, and how far above
  marginal cost an API price really sits — the markup nobody publishes (Analyst)
- [what-every-engineer-should-know] The capex behind the API: GPUs, power, and
  why the constraint is the grid (Analyst)
- [how-it-works] GPU depreciation: book life vs economic life, and why a levered
  neocloud's debt outlives the asset it's secured against — the schedule mismatch
  that actually decides refinancing risk (Analyst) [surfaced by the 07-12
  circular-financing dive]
- [news-to-framework] Vendor financing, from Lucent to Nvidia: why a supplier
  lends to its own customers, and the two ratios (financing ÷ revenue, top-customer
  concentration) that flip it from a growth lever into a warning sign (Analyst/
  Contrarian) [surfaced by the 07-12 circular-financing dive]

## Live — politics & policy (technical lens)

- [news-to-framework] How export controls actually shape which models you can
  run (Contrarian)
- [what-every-engineer-should-know] What the EU AI Act asks of a team shipping
  an agent, in plain terms (Builder)
- [news-to-framework] Provenance and attestation: what "signed software" can and
  can't promise (Analyst)

## Live — cross-domain / investigative (when the story pulls there, 2026-07-04)

*Angles that naturally travel across beats — AI × economy × energy × politics ×
geopolitics — in the mold of the 2026-06-29 silicon dive. Use one when a live
story genuinely leads here; the reader warned against **forcing** the crossover
(especially AI-plus-politics). Pick these because they're the best story that
day, not to hit a cross-domain quota. For the standing devtools / dev-marketing
weekly slot, draw from the "devtools & systems" and "DevRel, dev marketing,
product engineering" pools above.*

- [news-to-framework] Data centers became a ballot issue: the Utah primary
  upset, ~70% local opposition, and the mechanism nobody explains — how a
  hyperscaler load actually lands on a household electric bill (capacity
  markets, interconnection queues, ratepayer cost allocation). AI × energy ×
  local politics × economy (Contrarian/Analyst)
- [economics] The AI trade as a macro variable: how the S-1 wave (Anthropic,
  OpenAI ~$1T) made frontier-model deceleration a thing that moves the Nasdaq —
  what actually transmits from a lab's run-rate to an index (Analyst)
- [news-to-framework] The frontier's guest list: GPT-5.6 Sol shipping to ~20
  government-approved partners as the first real test of state-managed model
  access — the EO mechanism, who's on the list, and what China's clones do to
  the logic (AI × politics × geopolitics) (Contrarian)
- [economics] Bring-your-own-power: why hyperscalers are signing 20-year deals
  with oil majors (Chevron–Microsoft) and 1GW BYOP deals (Vantage–Liberty) —
  the grid is the constraint on inference, and the workaround reshapes energy
  markets (Analyst)
- [news-to-framework] The export-control boomerang: the Fable 5/Mythos ban as a
  case study in a control that taxes the honest domestic lab while the
  capability walks free as open weights — the geopolitics of a leaky border
  (Contrarian)
- [economics] What an inference dollar pays for once you trace it to the
  physical world: chip margin → power contract → water → local tax abatement →
  the ratepayer. Follow one token to the grid (Analyst)
- [news-to-framework] The maintainer revolt meets the labor question: AI-slop
  PRs, review as the scarce resource, and what "generation is free, review is
  charged in social capital" says about who captures the productivity gain
  (Contrarian)
- [news-to-framework] Talent as the real moat: the DeepMind→Anthropic exodus
  ($270B Alphabet wipe) and what a frontier lab's hiring flows reveal about
  where the capability actually lives — people, not weights (Contrarian)

## Used

- [how-it-works] Why AI is better at math counterexamples than proofs: the
  verifier asymmetry — a counterexample is a certificate you check in one pass,
  a proof isn't; search-against-a-cheap-verifier is the shape of every task
  agents win at (Analyst) — 2026-07-24 (as news-to-framework, pegged to Fable's
  Jacobian-conjecture counterexample + Tao/Buzzard),
  reports/deep-dives/2026-07-24-verifier-asymmetry-check-vs-find.md
- [reference] Sandbox mode: OS-level filesystem/network isolation for Bash and
  its children, and when it beats a permission rule you can subvert (Operator) —
  2026-07-23, reports/deep-dives/2026-07-23-sandbox-is-the-real-brake.md
- [how-it-works] How a context window actually works: attention cost, the
  lost-in-the-middle effect, and where recall degrades (Analyst) — 2026-07-21
  (as news-to-framework, pegged to OpenAI's Codex 372k→272k cut),
  reports/deep-dives/2026-07-21-context-window-price-cliff.md
- [practical-guide] Reading your context window: /context, /doctor, and what's
  actually eating your tokens — the fixed preamble + the MCP tool-schema tax
  (Operator) — 2026-07-16,
  reports/deep-dives/2026-07-16-context-tax-before-your-prompt.md
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
- [how-it-works] Model distillation: what training on another model's outputs
  actually copies, and what the license lets you do with it (Analyst) —
  2026-06-27, reports/deep-dives/2026-06-27-distillation-without-logits.md
- [news-to-framework] When a model price cut is a moat move, not a gift
  (Contrarian) — 2026-06-28,
  reports/deep-dives/2026-06-28-price-cut-is-a-weapon.md
- [x-vs-y] Long-context vs RAG: when each wins, with real recall numbers
  (Analyst) — 2026-06-30,
  reports/deep-dives/2026-06-30-long-context-vs-rag.md
- [practical-guide] PreToolUse hooks as the security boundary that permission
  patterns can't be (Operator) — 2026-07-02,
  reports/deep-dives/2026-07-02-hooks-are-the-real-guardrail.md
- [how-it-works] How statistical LLM watermarking actually works: green/red-list
  logit bias (Kirchenbauer), the z-test a detector reads, and why paraphrase
  washes it out (Analyst) — 2026-07-03,
  reports/deep-dives/2026-07-03-llm-watermark-paraphrase-ceiling.md
