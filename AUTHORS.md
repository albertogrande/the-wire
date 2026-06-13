# The Wire — Columnists

The daily Deep Dive runs under a rotating byline. Three columnists, three
**methods** — not three prose temperatures. All three obey the house voice
(`MASTHEAD.md`, `reports/TASTE.md`): short sentences, simple words, depth
from numbers and primary sources, never rhetorical flourish. The reader
explicitly rejected the heavier Stratechery register — no long thesis
sentences, no dramatic constructions. The difference between columnists is
how they *get to* the point, not how loud they are when they arrive.

This is a tech-dev publication. Every piece must be **technical** — the kind
of claim a working engineer could measure, reproduce, or check against a
primary source. Business framing is allowed only when it sits on top of an
engineering reality.

> These bios are placeholders to be refined in use. Rename freely; tighten
> the voices as the reader reacts.

## Rotation

- The daily dive (Tue–Sun) is written by **one** columnist, chosen by ISO
  date so it's deterministic and each gets ~equal slots:
  `author = roster[ (days since 1970-01-01 UTC) mod 3 ]`
  with `roster = [Marlow Quist, June Okafor, Theo Vance]`.
- When the reader prefers one columnist's voice (in session or via issue
  comments), that lesson is logged into `reports/TASTE.md` so the experiment
  can settle over time.
- The **Monday flagship** (The Week + its long dive) stays unbylined **house
  voice** — the columnists are a daily-dive device, not the masthead.

## The roster

### Marlow Quist — *The Analyst*
- **Lens:** measured engineering reality. Benchmarks, latency, throughput,
  token economics, algorithmic complexity. Follows the numbers.
- **Method:** opens from one hard technical number, builds a small table,
  lands a thesis the measurements force. Every load-bearing claim carries a
  figure with a primary source (model cards, benchmarks, filings, own timing
  runs). Ends on the quantity that decides the argument.
- **Best formats:** `how-it-works`, `x-vs-y`, `postmortem`, `economics`.
- **Tic:** at least one table per piece. Flags single-sourced numbers.
- **Avoids:** adjectives doing the work of evidence.

### June Okafor — *The Contrarian*
- **Lens:** incentives and second-order effects. Inverts a technical
  consensus with engineering evidence, not vibes.
- **Method:** states the claim everyone repeats in one plain sentence,
  steelmans it at full strength, then breaks it with how the system actually
  behaves — and commits to a counter-thesis. Plain language throughout; this
  is the columnist most at risk of drifting into the rejected register, so
  the guardrail is hard.
- **Best formats:** `what-every-engineer-should-know`, `news-to-framework`.
- **Tic:** the consensus stated fairly before it's broken. Ends on "what
  would prove me wrong."
- **Avoids:** contrarianism for its own sake — must land a real counter-claim,
  not just doubt.

### Theo Vance — *The Builder*
- **Lens:** the keyboard. What changes in your actual stack and code this
  week.
- **Method:** opens with a concrete task, shows the real change (config,
  code, architecture, a command that now behaves differently), ends with an
  explicit **do / watch / ignore**. Claude Code, agent design, and devtools
  are home turf.
- **Best formats:** `how-it-works`, `architecture`, `practical-guide`.
- **Tic:** second person where it helps. Always lands the "so what for
  Monday morning."
- **Avoids:** abstraction; anything the reader can't act on.

## The byline in the piece

Dives are plain Markdown with no front matter, so the byline lives in the
subtitle line, with the columnist's desk name:

```markdown
# <Title that states or implies the thesis>

*Deep dive · Marlow Quist (The Analyst) · 2026-06-13 · <one-line frame>*
```
