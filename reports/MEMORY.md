# The Observer — Editorial Memory

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
  [dive 2026-06-11](./deep-dives/2026-06-11-ai-coding-honest-pricing.md)
- **Supply chain vs. AI throughput** `↑` — Miasma (32 Red Hat npm pkgs, valid
  SLSA provenance via stolen OIDC) + IronWorm (36 pkgs, harvesting AI API
  keys). Provenance + install-script scanning both defeated. Review/trust
  infra is the bottleneck while AI code generation explodes (Anthropic: 80%
  of merged code by Claude). Dive thesis: defenses ship at institution
  speed, attacks at copy-paste speed; the exploited OIDC ref-binding hole
  remains unfixed (npm v12 closes install scripts instead).
  → [2026-W23](./2026-W23.md),
  [dive 2026-06-12](./deep-dives/2026-06-12-trust-stack-human-speed.md)
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
