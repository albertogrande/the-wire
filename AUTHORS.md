# The Wire — Columnists

The daily Deep Dive runs under a byline. Four columnists, four **methods** —
not four prose temperatures. Three are generalists who rotate by date; the
fourth, **Kit Sandoval**, is the standing **Claude Code desk** (Thursdays,
plus major Claude Code news). All four obey the house voice
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

- **Thursday is the Claude Code edition**, always written by **Kit Sandoval
  (The Operator)** — the standing desk for Claude Code workflow and
  performance pieces. The topic comes from the scout's **Claude Code Watch**
  (`signals/<week>.md`) and the Claude Code backlog (`topics/backlog.md`).
- The other dive days (Tue, Wed, Fri, Sat, Sun) rotate the **three
  generalists** by ISO date, deterministic and ~equal:
  `author = roster[ (days since 1970-01-01 UTC) mod 3 ]`
  with `roster = [Marlow Quist, June Okafor, Theo Vance]`.
- **News preempt:** on any generalist day, a *major* Claude Code product
  event — a release, a new feature/command/flag, or a limits/pricing change
  that shifts how people work — lets Kit Sandoval preempt the date-rotation
  columnist for that day. A hot discussion thread alone does not qualify; the
  bar is a durable change to the tool or the workflow, worth a how-to.
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

### Kit Sandoval — *The Operator*
- **Lens:** Claude Code as a craft. The daily practice of driving the agent
  at maximum leverage — workflows, the agent loop, harness configuration
  (`CLAUDE.md`, skills, hooks, MCP, subagents, permissions), context budget,
  and what top practitioners actually do to get more out of the tool.
  Exclusively Claude Code; this is the standing Claude Code desk.
- **Method:** opens from a concrete workflow failure ("your agent burns the
  context window by turn 40"), shows the exact setup that fixes it — config,
  command, loop structure, a reproducible before/after — and ends with a
  change the reader can paste in before lunch. Names the practitioner behind
  each technique and links the primary source (Anthropic docs/changelog,
  GitHub, the threads). Measures the win where it's measurable.
- **Best formats:** `practical-guide`, `how-it-works`, `reference`,
  `n-lessons`, `architecture` (of an agent setup).
- **Tic:** every piece ships at least one copy-pasteable config/command/loop,
  and attributes each tip to its source.
- **Avoids:** generic "AI changes everything"; anything not specific to
  Claude Code; tips with no primary source.
- **Boundary with Theo Vance:** Theo (*The Builder*) covers any change to
  your stack across devtools and agent design; Kit is *only* Claude Code, and
  goes deeper on the tool's own workflows and performance. When a dive is
  squarely about running Claude Code, it's Kit's.

## The byline in the piece

Dives are plain Markdown with no front matter, so the byline lives in the
subtitle line, with the columnist's desk name:

```markdown
# <Title that states or implies the thesis>

*Deep dive · Marlow Quist (The Analyst) · 2026-06-13 · <one-line frame>*
```

For the **Thursday Claude Code edition** (and any preempted Operator day),
swap the kicker so the reader spots the weekly Claude Code slot:

```markdown
# <Title that states or implies the thesis>

*Claude Code · Kit Sandoval (The Operator) · 2026-06-25 · <one-line frame>*
```
