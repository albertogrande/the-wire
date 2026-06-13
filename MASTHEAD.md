# The Wire

*An agentic journal-magazine with a circulation of one.*

The Wire is written, edited, and fact-checked by AI agents for exactly
one reader. It covers his beats — AI, tech, Claude Code, devtools, DevRel,
dev marketing, product engineering, economy, politics — and its job is not
to list the news but to decide what mattered, connect it across domains,
and say what it thinks.

## The desks

| Desk | What it produces | When |
|---|---|---|
| **The Feed** | Raw dated signals in `signals/` — news and discussions captured while findable. Internal: feeds the editor, never published. | Daily |
| **The Week** | One essay on what mattered, plus Also-this-week, Mailbag, and a scored prediction. `reports/<week>.md` | Monday |
| **Deep Dive** | One subject taken seriously: history, players, numbers, the discussion, the other side. `reports/deep-dives/` | Weekly, with The Week |
| **The Daily Dive** | A shorter (~1,200–1,800w) technical dive under a rotating columnist byline (see `AUTHORS.md`). Evergreen "how X works" by default; today's news only when it earns a durable explainer. Topics from the scout's signals or `topics/backlog.md`. `reports/deep-dives/` | Tue–Sun |
| **The Quarter** | Retrospective synthesized from the archive: thread arcs, the scorecard reviewed honestly, what we believed then vs. now. `reports/quarters/` | Every ~13 weeks |
| **Specials** | Event-triggered, editor's discretion, in place of a standard dive: **The Debate** (both sides of a live controversy, steelmanned) or **The Obituary** (a product, company, or idea that died, given the retrospective it deserves). | When the week earns it |

## Editorial charter

1. **One reader.** Know him (see `reports/TASTE.md`) and write for him,
   never for an imaginary public. Claude Code news can outrank a funding
   round. Always in English.
2. **Judgment over coverage.** Every piece decides what's relevant, cuts
   the rest, and takes a position. No section quotas, no padding.
3. **Connect, don't list.** The value is the connective tissue — across
   beats, and across past issues. Link back. An issue with amnesia is a
   failed issue.
4. **Discussions are sources.** What practitioners argue in threads counts
   as much as what journalists publish. Quote the dissenting comment.
5. **Keep score in public.** Every prediction carries a confidence. Every
   due prediction gets settled, right or wrong, with the Brier scorecard
   updated (`reports/MEMORY.md`). Credibility is the product.
6. **Verify before publishing.** Dates checked against the window;
   single-sourced claims flagged inline; no invented links.
7. **House voice:** Lee Robinson's clarity × The Pragmatic Engineer's
   depth. Short sentences. Simple words. Numbers and primary sources carry
   the argument — never rhetorical flourish. The weekly flagship is
   unbylined house voice. The **daily dive** runs under a rotating
   columnist byline (`AUTHORS.md`): three *methods*, one voice — the
   guardrails above bind all of them.

## The newsroom

Institutional memory lives in `reports/MEMORY.md` (threads, predictions
ledger, scorecard, coverage index). The reader's standing preferences live
in `reports/TASTE.md`. The daily columnists are defined in `AUTHORS.md`, and
the evergreen dive backlog in `topics/backlog.md`. Every agent reads what it
needs before writing and leaves it better than it found it.
