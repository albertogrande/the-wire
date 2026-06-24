# Your 200K Window Has a 120K Speed Limit

*Claude Code · Kit Sandoval (The Operator) · 2026-06-25 · The usable context budget is smaller than the advertised one — drive below the line, and don't let compaction pick what survives.*

Here is the failure, because it's always the same failure. You're forty turns
into a migration. The agent has read the schema, traced the call sites, and
worked out which three tables have to move together. Your context bar reads
85%. Then auto-compaction fires. Claude writes itself a summary, the old
history is gone, and the summary kept the file paths but dropped the *reason*
you decided to move those three tables together. The next ten turns relitigate
a decision you already made. One developer who wrote this up
[lost three hours of refactoring](https://smart-webtech.com/blog/claude-code-workflows-and-best-practices/)
when compaction "erased all knowledge of migration decisions mid-session."

The reflex fix is to ask for a bigger window. That's the trap. The window is
not the budget, and a bigger window is usually a worse one. This is the
Operator's most useful unintuitive habit: treat roughly the first half of your
context window as the whole thing, and engineer the handoff yourself so the
agent never has to.

## The window is not the budget

Anthropic's own context-engineering guidance says it plainly:
[as the token count rises, the model's ability to accurately recall from that
context falls](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents).
They call it context rot, and the cause is structural — every token attends to
every other token, so an n-token prompt carries n² pairwise relationships, and
models are trained mostly on shorter sequences. Context is a finite resource
with diminishing returns, not a tank you fill to the brim.

The number that should change how you drive comes from the NoLiMa benchmark,
which Albert Sikkema flags in his
[case for shrinking the window back to 200K](https://albertsikkema.com/ai/development/tools/2026/04/23/smaller-context-window-better-claude-code.html):
**11 of 12 tested models dropped below 50% of their short-context accuracy at
just 32K tokens.** Not at the 200K limit. At 32K. That is the recall cliff you
are walking toward while the context bar still looks comfortably green. The
symptoms are the ones you blame on the model having a bad day: forgotten
instructions, goal drift, an edit that contradicts one from twenty turns ago.

So when the 1M-token window shipped, plenty of practitioners found it made
things *worse*, not better — it just let them pour more tokens past the cliff
before noticing. Sikkema's cost math is the other half: at Opus pricing of
about $5 per million input tokens, a 600K-token turn runs roughly **$3 a
message** against about **$0.70 at 140K**. Every turn. You pay four times as
much to reason worse.

This is the practitioner consensus the scout caught crystallizing this week:
multiple power users independently
[settling on the same ceiling](https://smart-webtech.com/blog/claude-code-workflows-and-best-practices/)
— don't let context exceed about 60% of capacity, and quality starts slipping
as early as 20–40%. Round it however you like. On a 200K window, 60% is 120K.
That's your real speed limit.

## Why the default save fails you

The compaction dive [last Saturday](./2026-06-20-claude-code-compaction-save-point.md)
covered the mechanism — microcompaction parks old tool results to disk
losslessly, full compaction replaces your history with a model-written
summary, and the lossy one fires on a hidden threshold below the cap. This is
the Operator's other half: where to set the dial, and how to drive so the dial
rarely matters.

Start with when the default fires. Robert Matsuoka
[measured it](https://hyperdev.matsuoka.com/p/how-claude-code-got-better-by-protecting):
Claude Code now triggers auto-compaction around 75% utilization, not the
historical 90%+, reserving roughly a 50K-token completion buffer so your
current task can finish before the summary runs. That's a genuine improvement
— but 75% of 200K is 150K, and you already know recall started failing back at
32K. The default protects you from running *out* of context. It does nothing
to protect you from reasoning inside the rotted part of it.

And the summary is the deeper problem. When compaction fires at 75–85%, Claude
summarizes a view that is *already degraded*. You are asking a model that has
started forgetting things to decide what's worth keeping. It will keep what
looks structurally important — paths, function names — and quietly drop the
load-bearing *why*. `/compact` condenses in memory and
[saves nothing to a file you can inspect](https://smart-webtech.com/blog/claude-code-workflows-and-best-practices/).
You don't get to see what it cut until you notice it's gone.

## Three moves that put you back in control

**1. Cap the window and lower the trigger.** Two environment variables, from
Sikkema's writeup. Set `CLAUDE_CODE_DISABLE_1M_CONTEXT=1` so the window stays
at 200K instead of inviting you past the cliff, and
`CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=70` so compaction fires near 140K — while the
context it's summarizing is still mostly intact. You want the summary written
from a clear head, not a tired one. This is the cheapest win on the list and
it's one line each.

**2. Do the handoff yourself.** The move that separates people who finish long
tasks from people who watch them rot: when you approach the line, don't
`/compact` — dump and clear. Have the agent write its current plan, decisions,
and open threads to a markdown file, run `/clear`, then start the next leg with
Claude reading that file. The
[recommended sequence](https://smart-webtech.com/blog/claude-code-workflows-and-best-practices/)
is exactly that — dump to markdown, `/clear`, resume from the file — and it
beats `/compact` for one reason: *you* chose what survived, in a file you can
read and edit, instead of delegating that choice to a degraded summarizer. A
`PROGRESS.md` with five bullets of decisions-and-why is worth more than 80K
tokens of transcript the model is about to compress badly anyway.

**3. Stop loading what you aren't using.** Three places the budget leaks before
you've done any work:

- **CLAUDE.md.** It loads in full at session start and sits in context even
  when it's irrelevant to the task. The official cost guidance is now explicit:
  [keep CLAUDE.md under 200 lines](https://code.claude.com/docs/en/costs),
  essentials only. Push the PR-review checklist and the migration runbook into
  [skills](https://code.claude.com/docs/en/skills), which load on demand only
  when invoked. The practitioner read on *why* is sharper than the line count
  alone: past about 200 lines, instruction adherence measurably drops — a long
  CLAUDE.md isn't just expensive, it gets *followed less*.
- **MCP servers.** Tool definitions are deferred by default now, so only names
  enter context until a tool is used — but a wired-up server you're not using
  is still overhead. Run `/context` to see what's eating space, `/mcp` to
  disable the dead ones, and prefer a CLI (`gh`, `aws`, `gcloud`) over an MCP
  server where one exists; it adds zero per-tool listing.
- **Verbose operations.** Running a test suite or reading a 10,000-line log
  inside your main thread dumps all of it into your budget. Delegate it to a
  [subagent](https://code.claude.com/docs/en/sub-agents): the noise stays in
  the subagent's context and only a summary returns. Anthropic's own number for
  a well-built explorer subagent is a
  [1,000–2,000 token distilled return](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
  against a multi-thousand-token job.

## The new safety net

When you do fumble — `/clear` the session and realize the markdown dump missed
something — there's finally a recovery. As of
[v2.1.191](https://github.com/anthropics/claude-code/releases) (shipped Monday),
`/rewind` can resume a conversation *from before `/clear` was run*. That closes
the one scary edge of the dump-and-clear workflow: a premature clear used to be
unrecoverable, so people hoarded context out of fear. Now the aggressive,
correct habit — clear early, clear often — has an undo. The same release cut
streaming CPU about 37% and trimmed long-session memory growth, which is the
quieter half of why short sessions feel better: less of everything to push
around.

## The honest counter

The pushback is fair: isn't manual context management just overhead the tool
was supposed to remove? Sometimes, yes. For a ten-minute task you'll never
approach 60% and none of this matters — don't perform hygiene theater on a
two-file change. And the bigger window isn't useless; if you genuinely need a
60K-token file *in* context to answer one question, 1M is there for it. The
claim is narrower: for **long, multi-step work** — the migrations, the
refactors, the multi-hour autonomous runs — the default of filling the window
and letting compaction sort it out reasons worse and costs more than driving
below the line and handing off on your terms. The win is measurable in both
directions: the recall cliff you avoid, and the roughly 4× per-turn cost you
don't pay at 140K versus 600K.

What would change my mind: if Anthropic ships compaction that's genuinely
*lossless* for decisions — a summarizer that fires early, writes its kept-set
to a file you can audit, and reliably preserves the *why* and not just the
*what* — then the manual dump-to-markdown handoff becomes redundant and the
60% rule loosens. The trend is pointed that way (the 75% trigger, the
completion buffer, `/rewind`). It isn't there yet. Until it is, the budget is
yours to manage.

---

**Paste-in, before lunch.** Add to your shell profile (attribution: Albert
Sikkema):

```bash
export CLAUDE_CODE_DISABLE_1M_CONTEXT=1      # keep the window at 200K
export CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=70    # compact near 140K, while context is still clean
```

The handoff, when `/context` shows you near 60% (attribution: the
[workflow consensus](https://smart-webtech.com/blog/claude-code-workflows-and-best-practices/)):

```text
> Write our current plan, the decisions we've made and why, and every open
  thread to PROGRESS.md. Be specific about the "why."
/clear
> Read PROGRESS.md and continue from there.
```

Then trim once and reap it every session: get CLAUDE.md under 200 lines
([official guidance](https://code.claude.com/docs/en/costs)), move the runbooks
to skills, `/mcp` off the servers you're not using, and delegate the verbose
jobs to subagents. **Do:** set the two env vars and adopt dump-and-clear today.
**Watch:** `/context`, not the green bar — 60% is the line. **Ignore:** the
1M-context upgrade for long agentic work; it's a wider road to the same cliff.
