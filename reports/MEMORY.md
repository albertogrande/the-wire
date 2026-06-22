# The Wire — Editorial Memory

Agent-maintained. Read before writing any issue or deep dive; update after.
Keep under ~150 lines — retire dead threads by deleting them (git history
preserves everything).

## Running threads

Each thread carries a momentum tag (`↑` gaining / `→` steady / `↓`
stalling) and, when evidence cuts against it, a `Tension:` note inline.

- **AI goes public / the repricing** `↑` — Anthropic filed S-1 (Jun 1, ~$965B,
  ~$47B run-rate); SpaceX–xAI roadshow; OpenAI confidential S-1 confirmed Jun
  8–9 (~$1T target, Goldman+Morgan Stanley, listing late 2026). Market punishes
  deceleration (Broadcom -15%; Nasdaq -4% Jun 5). AI trade = macro variable.
  Tension: W24 added a new risk-factor line — a flagship model can be
  administratively switched off overnight (Fable 5 export ban).
  W25: the economics tightened in the open — OpenAI's leaked financials (per
  Fortune/Ars, unverified) show ~$21B operating loss on ~$13B 2025 revenue; FT
  reported enterprises reining in AI spend; Anthropic's subscription split (Jun
  15) repriced programmatic usage. Frontier sold below cost while a free MIT
  substitute (GLM-5.2) shipped — supply shock + cost squeeze on the legible US
  leader in one week. → [2026-W23](./2026-W23.md),
  [2026-W24](./2026-W24.md), [2026-W25](./2026-W25.md)
- **The AI coding subsidy died** `↑` — Copilot token billing live Jun 1 (10–50x
  bills, Opus multiplier 7.5x→27x, paid code review); Cursor seat split;
  Anthropic Agent SDK credit split lands Jun 15. Flat-rate AI tooling is
  ending industry-wide. Dive thesis: meter = boundary, not business; end
  state is vertical integration ("unlimited, on our models").
  → [2026-W23](./2026-W23.md),
  [dive 2026-06-07](./deep-dives/2026-06-07-ai-coding-honest-pricing.md)
- **The channel war / off-ramps** `↑` — model + open harness both commoditizing
  (Kimi K2.7-Code beats Opus 4.8 on MCPMark 81.1/76.4 at ~1/10 price; OpenCode
  8M MAU, MIT). So spend moved to distribution: Google kills Gemini CLI for
  closed `agy` (May 19→Jun 18; enterprise keeps it); OpenAI buys Ona surface +
  rents Oracle Universal Credits rail ($638B RPO); Anthropic $150M Claude Corps
  seeds install base. Four off-ramps: terminal/environment/rail/install base
  (+political). Sequel to the pricing dive: meter made substitutes real, channel
  is the fight once they exist. Dive thesis: the moat is the channel, not weights.
  W24: the political off-ramp went live — export controls hit the closed/legible
  US leader (Anthropic) while open weights (Kimi/GLM/MiMo) walk free, confirming
  the channel — not the weights — is what's actually contestable.
  W25: the *user's* off-ramp examined hands-on — running a model locally escapes
  the channel only if it fits your VRAM; the open models that rival the frontier
  (~150GB) don't, so the channel still holds for serious work.
  W25: the MoE angle reinforces it — sparsity (GLM-5.2 744B/40B, ~5.4% active) makes
  open models cheap to *serve at batch scale* (provider's economics) but inflates the
  must-fit-in-VRAM number, so the architecture that cheapens the API is the same one
  that keeps you renting it.
  W25 (confirmed live): the channel thesis got a real-world test — the state switched
  off the legible closed leader and users routed to substitutes within days
  (GLM-5.2 MIT, local-model Ask HN surge, OpenCode passing Claude Code on stars
  ~172k/124k). The hedge users reach for is the *harness* (model-agnostic OpenCode),
  not the model — provider-portability became risk management, not just cost/latency.
  → [2026-W25](./2026-W25.md),
  [dive 2026-06-09 channel](./deep-dives/2026-06-09-channel-was-the-product.md),
  [dive 2026-06-15](./deep-dives/2026-06-15-cannot-export-control-a-model.md),
  [dive 2026-06-17](./deep-dives/2026-06-17-local-coding-model-memory-budget.md),
  [dive 2026-06-21](./deep-dives/2026-06-21-mixture-of-experts-active-parameters.md)
- **Supply chain vs. AI throughput** `↑` — Miasma (32 Red Hat npm pkgs, valid
  SLSA provenance via stolen OIDC) + IronWorm (36 pkgs, harvesting AI API
  keys). Provenance + install-script scanning both defeated. Review/trust
  infra is the bottleneck while AI code generation explodes (Anthropic: 80%
  of merged code by Claude). Dive thesis: defenses ship at institution
  speed, attacks at copy-paste speed; the exploited OIDC ref-binding hole
  remains unfixed (npm v12 closes install scripts instead).
  → [2026-W23](./2026-W23.md),
  [dive 2026-06-10](./deep-dives/2026-06-10-trust-stack-human-speed.md)
- **Autonomy before its brakes** `↑` — Agents shipped proactive-by-default
  (Fable 5 "relentlessly proactive," Claude Code nested sub-agents 5-deep +
  doubled 5h limits, FablePool) before the cost-control/consent/observability
  layer. Canaries: DN42 agent ran $6,531 AWS bill in ~24h (AWS cut to $1,894);
  Anthropic apologized for invisible Fable distillation guardrail ("stealth
  throttling"), now visible fallback to Opus 4.8. Liability (operator eats it;
  AWS has no hard cap by design; insurer is end state) + disclosure (Colorado
  AI Act delayed to Jan 1 2027 but kept its disclosure core; FCC KYC FNPRM) =
  undisclosed automation becoming a regulated category.
  W25: the definitional angle — "agent" is a control-flow dial (model controls the
  loop), not a product; agency's cost is exactly the brakes problem (nondeterminism,
  per-step token re-read, blast radius). Market votes low-agency: MCP (tool rung)
  adopted, A2A (multi-agent rung) enterprise-announced but developer-shrugged.
  W25 (builder lens): the hands-on brake is context compaction — Claude Code's
  lossy auto-save fires on a hidden threshold; control when it fires / what it keeps
  (/clear, /compact, CLAUDE.md preserve-rules) or it summarizes away your state and
  re-bills the prompt cache each event.
  → [dive 2026-06-08-autonomy](./deep-dives/2026-06-08-autonomy-before-brakes.md),
  [dive 2026-06-19](./deep-dives/2026-06-19-agent-is-a-control-flow-decision.md),
  [dive 2026-06-20](./deep-dives/2026-06-20-claude-code-compaction-save-point.md)
- **Platforms eat the layer** `↑` — the LLMOps tool layer (gateway, tracing,
  eval, prompt store) is being absorbed from both ends: ClickHouse bought
  Langfuse (Jan, already built on ClickHouse; 23.1M SDK installs/mo) to own the
  trace store; Datadog ships a native AI gateway + LLM-judge evals; model
  vendors expose traces/evals natively. TensorZero archived its repo Jun 12 and
  returned ~half its $7.3M seed despite Fortune-10 use and 11.6k stars. Thesis:
  a wrapper around someone else's durable asset (model endpoint / analytics DB)
  is a feature, not a company. Third face of the channel/meter rule.
  → [dive 2026-06-11 llmops](./deep-dives/2026-06-11-llmops-not-a-company.md)
- **Who pays for AI's power** `→` — PJM uncapped capacity auction imminent;
  dueling studies on data centers vs. household bills; 1GW
  bring-your-own-power deals (Vantage–Liberty). Sleeper populist-politics
  story. → [2026-W23](./2026-W23.md)
- **Washington vs. the labs / safety as a weapon** `↑` — escalated hard in W24.
  Amazon's Jassy (Anthropic's biggest investor *and* a model competitor) told
  Treasury's Bessent that Fable 5 yields cyberattack info; Commerce export-banned
  Fable 5 + Mythos 5 for ALL foreign nationals (incl. Anthropic's own foreign-born
  staff) Jun 12 — first time the US switched off a public commercial model.
  David Sacks (who's called Anthropic "fear-mongers") ran it; Amodei refused to
  patch ("narrow, not a full jailbreak"); AWS took service impacts. The danger
  narrative Anthropic authored became a weapon used against it. Tension: the ban
  is theater — three open frontier coding models (Kimi K2.7, GLM 5.2, MiMo)
  shipped the same week, so the capability is downloadable.
  W25 (fallout consummated): the models stayed dark all week while the demand
  routed around the ban in real time — GLM-5.2 open-released MIT (Jun 16, top
  open-weight on AA Index, level w/ GPT-5.5 on GDPval), an "Ask HN: replaced
  Claude w/ a local model?" thread hit 540pts, and OpenCode passed Claude Code
  on stars (~172k/124k). The ban contained exactly one thing: Anthropic's own
  market. Commerce then punted on blacklisting DeepSeek (100+ other firms added)
  — can't aim at the open artifact. Wired named SK Telecom's Mythos demo as the
  thin trigger. Earlier context: Obernolte–Trahan preemption draft;
  extraterritorial chip controls; DeepSeek's $7.4B state-backed raise.
  → [2026-W23](./2026-W23.md), [2026-W24](./2026-W24.md), [2026-W25](./2026-W25.md),
  [dive 2026-06-15](./deep-dives/2026-06-15-cannot-export-control-a-model.md)
- **The maintainer revolt** `↑` (new) — open-source maintainers organizing
  against AI-slop contributions: Grinberg's "I Am Not a Reverse Centaur"
  (issue-first gate before reviewing agent PRs), tombedor's "demonstrate human
  effort," "automating myself out of development." Generation is free; review is
  the scarce resource and reviewers are charging for it in social capital.
  OpenAI opened Codex to OSS maintainers the same week (tone-deaf timing).
  → [2026-W24](./2026-W24.md)

## Predictions ledger

Brier per prediction: (confidence − outcome)², outcome 1 if it happened.
Lower is better; 0.25 = coin-flip guessing.

| Made | Prediction | Conf. | Due | Status |
|---|---|---|---|---|
| 2026-W23 | GitHub partially walks back Copilot pricing (extends promo credits past Aug, restores fallback model, or cuts Opus multiplier) within 30 days, without reversing metering itself | 70% | ~2026-07-05 | OPEN |
| Dive 2026-06-11 | At least two of {GitHub, Cursor, Anthropic} ship an "unlimited on our own/house models" flat tier (subsidy internalized, frontier stays metered) | 65% | by 2027-Q1 | OPEN |
| Dive 2026-06-12 | GitHub/npm ship branch/ref binding for OIDC trusted publishing (the actual Miasma hole) — and a worm generation defeats npm v12's script-off default before that ships | 55% | by 2026-Q4 | OPEN |
| Dive 2026-06-12 (autonomy) | A major cloud or agent platform ships an enforced hard per-task/per-agent spend ceiling (not a budget alert) that the agent cannot cross | 45% | by 2027-Q2 | OPEN |
| Dive 2026-06-12 (autonomy) | "Agent liability" insurance appears OR a cloud publishes a runaway-agent forgiveness policy, mandating spend caps/observability as a condition | 55% | by 2027-Q2 | OPEN |
| Dive 2026-06-12 (channel) | The top frontier-vs-best-open-model spread on a major agentic benchmark (e.g. SWE-bench/MCPMark/Terminal-Bench) stays inside ~5 pts — i.e. no lab reopens a durable capability gap, confirming the channel (not the model) is the moat | 70% | by 2027-Q1 | OPEN |
| Dive 2026-06-13 (benchmark) | A contamination-resistant benchmark (SWE-bench Pro / SWE-rebench or successor) does NOT reproduce SWE-bench Verified's top-5 model ordering — decontamination changes rank, not just absolute scores | 65% | by 2027-Q1 | OPEN |
| Dive 2026-06-13 (llmops) | No venture-funded *independent* LLM gateway/observability/eval company reaches a standalone outcome (IPO or $1B+ while independent) — the next two notable outcomes in the space are absorptions by a model vendor / data-or-monitoring platform, or wind-downs | 65% | by 2027-Q2 | OPEN |
| 2026-W24 | The Fable 5/Mythos 5 foreign-national export restriction is materially narrowed or rescinded (carve-out for Anthropic's own US-based staff, or tightened definition) without the "jailbreak" being publicly resolved | 65% | ~2026-08-14 | OPEN |
| Dive 2026-06-15 | By end of 2026, no US export-control action successfully restricts an *open-weight* model's distribution — controls stay confined to closed/hosted API models and to compute/chips | 75% | 2026-12-31 | OPEN |
| Dive 2026-06-16 (open-source) | No top-tier agentic-benchmark model ships meeting OSAID 1.0 in full (weights + data information + complete training code under an OSI license); "open source AI" releases stay open-weight-only | 80% | by 2027-Q1 | OPEN |
| Dive 2026-06-17 (local) | A sub-35B open-weight coding model fits a single 24GB card *with* usable 128K context AND lands within ~10 pts of that quarter's top frontier model on a contamination-resistant agentic bench (SWE-rebench/SWE-bench Pro) | 35% | by 2027-Q1 | OPEN |
| Dive 2026-06-19 (agent) | Multi-agent / A2A-style agent-to-agent coordination does NOT become the default shipped production-agent pattern; single-context loops + tool-calling (MCP rung) stay dominant, and A2A stays enterprise-announced rather than developer-used (no broad practitioner-usage signal) | 75% | by 2027-Q1 | OPEN |
| Dive 2026-06-18 (caching) | Anthropic ships automatic/implicit prompt caching (a hit without a manually placed breakpoint) on at least one default API path, converging toward OpenAI/DeepSeek/Gemini's zero-config model — because the realized-vs-advertised hit-rate gap is a cost-perception liability | 55% | by 2027-Q1 | OPEN |
| Dive 2026-06-20 (compaction) | Claude Code surfaces auto-compaction control as a documented, first-class setting (a configurable threshold or a "manual/safe-point-only" compaction mode in /config or official docs) rather than the current undocumented env-var + reverse-engineered buffer | 55% | by 2027-Q1 | OPEN |
| Dive 2026-06-21 (MoE) | The next frontier-tier open-weight model release (intelligence-index top ~5) ships with an activation ratio at or below ~6% (active ÷ total params), continuing the Mixtral 27.6% → DeepSeek/GLM ~5.4% sparsification trend; none re-ships above ~15% | 70% | by 2027-Q1 | OPEN |
| 2026-W25 | At least one major commercial AI vendor (Anthropic/OpenAI/Google/Microsoft) ships or formally announces a customer-facing multi-provider / bring-your-own-model fallback in a first-party developer product — pricing in the switch-off risk the export ban made concrete | 60% | ~2026-09-20 | OPEN |
| Dive 2026-06-22 (portability) | Prompt+tool portability stays a manual re-eval problem — no cross-provider standard or vendor feature lets a non-trivial agent's prompt+toolset move between two frontier providers and reproduce eval scores within a small margin without per-model retuning; gateways normalize API syntax, behavior still needs bespoke adaptation | 65% | by 2027-Q1 | OPEN |

**Scorecard: 0 settled · record 0–0 · mean Brier —**
(Nothing due in W25. W23 Copilot-walkback call due ~Jul 5 — still open, no reversal
yet. W24 export-ban-narrowing call due ~Aug 14. Settle in a later issue.)

## Coverage index

### Weekly issues
- 2026-W23 — "The Week the Bill Came Due" — AI IPOs (Anthropic S-1), chip
  selloff, Copilot metered billing, npm worms, grid politics, AI layoffs
- 2026-W24 — "Safety Was the Moat. This Week It Became the Weapon." — Anthropic
  ships Fable 5 (Jun 9) days after a "brake-pedal" plea; Amazon's Jassy triggers
  a Commerce export ban on Fable 5/Mythos 5 for all foreign nationals (Jun 12);
  open Chinese models (Kimi/GLM/MiMo) make the ban theater; OpenAI S-1 (~$1T);
  WWDC Gemini Siri; maintainer revolt
- 2026-06-22 — "Portability Is Not a Purchase. It's an Eval Discipline." (house, Monday
  long dive) — the buyer's counter-move to the switch-off. A gateway/model-agnostic
  harness (OpenCode 75+ providers via AI SDK/Models.dev, ~172k stars) buys *syntactic*
  portability (OpenAI-compatible base-URL swap); *semantic* portability doesn't transfer —
  prompts re-tune ("no such thing as prompt portability"), tool-calling reliability varies
  (same schema, Llama<GPT-5), warmed cache lost on switch. Real hedge = a continuously
  *eval'd* fallback, not a wired one; tiered (lock-in on core, portable+eval'd on the
  can't-go-dark slice). Counter: portability = lowest-common-denominator tax + you may
  never switch — rebutted by the ban changing who controls the trigger. Lever on channel
  thread; siblings: caching, local-model, export-control, benchmark dives.
- 2026-W25 — "You Can Switch Off a Model. You Can't Switch Off the Capability." —
  ban fallout: Fable/Mythos stay dark; GLM-5.2 open-released MIT (top open-weight,
  level w/ GPT-5.5 on GDPval); Ask HN local-model surge; OpenCode passes Claude
  Code on stars; OpenAI leaked ~$21B loss; FT enterprise pullback; Anthropic
  subscription split — capability relocates, channel thread confirmed live

### Deep dives
- 2026-06-11 — "The Meter Is the Confession" — AI coding pricing; metering as
  transition to vertical integration (house models)
- 2026-06-12 — "The Trust Stack Was Built for Human-Speed Software" — npm worms
  (Miasma/IronWorm), provenance defeated, OIDC hole unfixed, LLMjacking
- 2026-06-12 — "Autonomy Shipped Before Its Brakes Did" — proactive agents before
  cost-control/consent/observability; DN42 bill; liability × disclosure
- 2026-06-12 — "The Channel Was the Product" — model+harness commoditize; moat
  moves to distribution; four off-ramps (terminal/environment/rail/install)
- 2026-06-13 — "The Benchmark Score Is Not the Capability" (Okafor) — coding
  benchmarks measure harness+dataset+memorization; SWE-bench Verified leakage;
  build a private post-cutoff pass@1 eval
- 2026-06-13 — "Fan-Out Has a Token Bill, and You Sign It" (Vance) — nested
  sub-agents cost a fresh context each; 4×/15× multipliers; fan out for parallel
  breadth + small returns, stay single-context for sequential/large-return work
- 2026-06-13 — "LLMOps Is a Feature, Not a Company" (Okafor) — TensorZero archived
  after ClickHouse–Langfuse + Datadog native gateway/evals; the layer is a
  wrapper, value accrues to the adjacent durable asset. Third face of channel/meter
- 2026-06-16 — "The Open Model You're Running Is a Binary, Not a Source" (Okafor) —
  "open source AI" is almost always open-*weight*; the license decides what you may do.
  Spectrum: Apache/MIT (Qwen3, DeepSeek-R1) → Kimi "Modified MIT" (attribution >100M
  MAU) → Llama community license (700M-MAU cap, OSI: not open source). Even Apache
  weights aren't OSAID-complete (no data info / training recipe). contrarian/wee-sk
- 2026-06-17 — "The Coding Model You Can Run Isn't the One That Wins" (Vance) —
  local coding; open-weight is a license, runnable is a memory budget. Binding
  constraint is VRAM × KV cache: 4-bit quant ≈ bf16 (60.9 vs 61.8 Aider Polyglot),
  but context eats VRAM linearly (70B@128K = ~40GB cache) and frontier-rivals
  (DeepSeek-V3.2, MiniMax M3 ~80%) need ~150GB. Runnable-and-trailing (~61%, 27pt
  gap) vs competitive-and-unrunnable. practical-guide. Sibling to open-weights +
  export-control dives.
- 2026-06-18 — "Prompt Caching Pays 90% Off — If You Win the Bet" (Quist) — the
  advertised discount (Anthropic 0.1x read; OpenAI/DeepSeek auto) is real but rarely
  collected; deciding quantity is hit rate. Cache needs a byte-identical prefix; one
  edit above the breakpoint voids everything below, and a miss pays the 1.25x *write*
  price → a never-hitting cache is +25% worse than none. Break-even N≈1.28 (5-min)/2.1
  (1-hr); enemy is invalidation × TTL. Order prompts stable→dynamic. wee-sk/economics.
  Lever on metering thread.
- 2026-06-15 — "You Cannot Export-Control a Model" (house) — the Fable 5/Mythos 5
  export ban is the 1990s crypto wars repeated: controlling the trained artifact
  (weights = numbers) fails because the capability is open-weight (Kimi/GLM/MiMo)
  and "code is speech" (Bernstein) is settled. Crypto controls' real legacy was
  weakened "export-grade" ciphers → FREAK/Logjam 15 yrs later. The only AI lever
  with teeth is compute/chips, upstream of the weights; model-level controls just
  tax the honest closed US lab + its own foreign staff. Format: precedent-mapping
- 2026-06-20 — "Compaction Is a Lossy Save. Choose When It Fires." (Vance) — how
  Claude Code compaction works + how to control it. Microcompaction (lossless: "hot
  tail" inline, older tool results parked to disk by reference) vs full compaction
  (model call → structured-checklist summary replaces history; lossy). Hidden ceiling
  <200K (community-measured ~33K reserve, fires ~83.5%, not officially documented).
  Builder footnote: full compaction = total prefix change = guaranteed prompt-cache
  miss + write tax. Levers: /clear, /compact <instr>, /rewind summarize, CLAUDE.md
  preserve-rules, subagents+/btw, /context+status line. Tokens-saved is a vanity
  metric — optimize for what survives. how-it-works/practical-guide. Lever on
  autonomy-before-brakes; sibling to fan-out + caching dives.
- 2026-06-21 — "The Model Has 744 Billion Parameters. You Pay for 40 Billion." (Quist)
  — mixture-of-experts from the routing up, pegged to GLM-5.2 (744B total / 40B active,
  MIT). Total params = memory/VRAM bill; active params = compute/per-token bill; MoE
  decouples them. Activation ratio fell 27.6% (Mixtral 8x7B) → 5.5% (DeepSeek-V3, 256/8)
  → 5.4% (GLM-5.2) over two years. Sparsity is a batch-economics play (cheap to serve at
  scale, brutal to run locally) → sharpens channel thread; MoE inflates the must-fit-in-VRAM
  number. Shazeer (→OpenAI this week) co-authored both founding MoE papers (2017, Switch).
  how-it-works/economics. Sibling to local-model + caching dives; lever on channel thread.
- 2026-06-19 — "'Agent' Is a Control-Flow Decision, Not a Product" (Okafor) — strips
  the marketing: an agent is one thing — the model controls the loop (Willison's
  "tools in a loop," Sept 2025); everything else sold as an agent is a workflow with
  an LLM in it. Agency is a 6-rung dial (smolagents), not a brand; vendors (Anthropic,
  HF) say "keep it low." Market confirms: MCP (tool rung) adopted, A2A (multi-agent
  rung) enterprise-announced / developer-shrugged (HN today 55pts). Each rung up sells
  determinism, tokens, blast radius. Decompose by rung; climb slowly. Format:
  reference / what-every-engineer-should-know. Lever on autonomy-before-brakes thread.
