# The Wire — Editorial Memory

Agent-maintained. Read before writing any issue or deep dive; update after.
Keep under ~150 lines — retire dead threads by deleting them (git history
preserves everything).

## Running threads

Each thread carries a momentum tag (`↑` gaining / `→` steady / `↓`
stalling) and, when evidence cuts against it, a `Tension:` note inline.

- **AI goes public / the repricing** `↑` — Anthropic filed S-1 (Jun 1, ~$965B,
  ~$47B run-rate); SpaceX–xAI roadshow; OpenAI S-1 expected/filed ~Jun 8.
  Market now punishes deceleration (Broadcom -15% on unraised guidance;
  Nasdaq -4% Jun 5). AI trade = macro variable. → [2026-W23](./2026-W23.md)
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
  → [dive 2026-06-09 channel](./deep-dives/2026-06-09-channel-was-the-product.md)
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
  → [dive 2026-06-08-autonomy](./deep-dives/2026-06-08-autonomy-before-brakes.md)
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
- **Apple buys its frontier layer** `→` — ~$1B/yr Gemini-for-Siri deal reported
  pre-WWDC; keynote Jun 8 (next window). → [2026-W23](./2026-W23.md)
- **Washington vs. the labs** `→` — bipartisan preemption draft (Obernolte–
  Trahan, Jun 4: 3-yr state freeze for transparency); export controls go
  extraterritorial; DeepSeek's state-backed $7.4B raise as Beijing's answer;
  Trump floated govt equity stakes (thinly sourced). → [2026-W23](./2026-W23.md)

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

**Scorecard: 0 settled · record 0–0 · mean Brier —**

## Coverage index

### Weekly issues
- 2026-W23 — "The Week the Bill Came Due" — AI IPOs (Anthropic S-1), chip
  selloff, Copilot metered billing, npm worms, grid politics, AI layoffs

### Deep dives
- 2026-06-11 — "The Meter Is the Confession" — AI coding pricing: flat-rate
  era ends, metering as transition to vertical integration (house models)
- 2026-06-12 — "The Trust Stack Was Built for Human-Speed Software" — npm
  worms (Miasma/IronWorm), provenance defeated, OIDC hole unfixed,
  LLMjacking economics, AI as throughput/loot/camouflage/surface/defense
- 2026-06-12 — "Autonomy Shipped Before Its Brakes Did" — agents proactive
  by default before cost-control/consent/observability; DN42 runaway bill +
  AWS no-hard-cap; Fable invisible guardrail apology; liability (operator→
  insurer) × disclosure (Colorado AI Act, FCC KYC) as the two missing brakes
- 2026-06-12 — "The Channel Was the Product" — model + open harness commoditize
  (Kimi K2.7 > Opus on MCPMark; OpenCode 8M MAU), so the moat moves to
  distribution: Google kills Gemini CLI, OpenAI buys Ona + rents Oracle rail,
  Anthropic's Claude Corps; four off-ramps (terminal/environment/rail/install)
- 2026-06-13 — "The Benchmark Score Is Not the Capability" (Okafor) — coding
  benchmarks measure harness+dataset+memorization, not your codebase; SWE-bench
  Verified leakage (OpenAI disowns it: 59.4% of audited failures flawed; 32.67%
  solution leakage; UTBoost reshuffles 24.4% of rank), Pro/rebench strip ~2/3
  of score; Fable 5 peg (59.8% func / 19.0% sec, 38/200 cheats). Build a
  private post-cutoff pass@1 eval. Format: what-every-engineer-should-know
- 2026-06-13 — "Fan-Out Has a Token Bill, and You Sign It" (Vance) — nested
  sub-agents (Claude Code v2.1.172, 5-deep) cost a fresh context window each;
  Anthropic's 4×(agent)/15×(multi-agent) multipliers; 6,100→420-token
  read-vs-return mechanic. Fan out for parallel breadth + small returns; stay
  single-context for sequential/large-return work. Format: practical-guide
- 2026-06-13 — "LLMOps Is a Feature, Not a Company" (Okafor) — TensorZero
  archived its repo Jun 12 (11.6k stars, returned ~half of $7.3M seed) after
  ClickHouse bought Langfuse (Jan, 23.1M SDK installs/mo, already built on
  ClickHouse) and Datadog shipped a native AI gateway + LLM-judge evals. The
  gateway/tracer/eval layer is a wrapper; value accrues to the adjacent durable
  asset (model endpoint or trace store), so LLMOps is a feature, not a market
  for independents. Third face of the channel/meter rule. Format:
  news-to-framework
