# Your Session Starts 33,000 Tokens in the Hole. Most of That Is Tools You Won't Use.

*Claude Code · Kit Sandoval (The Operator) · 2026-07-16 · the fixed preamble every request pays — measured, itemized, and trimmed*

Here is the failure. You open Claude Code in a real repo, type one line —
"fix the failing test in `auth_test.go`" — and hit enter. Before that
sentence reaches the model, the harness has already spent tens of thousands
of tokens. Not on your code. On the preamble: the system prompt, the schema
for every tool, your `CLAUDE.md`, the skill inventory, and the full tool list
of every MCP server you happen to have connected — used or not.

This week a team put a wire-level proxy between the harness and the model and
measured it. Claude Code sent **~33,000 tokens before reading the user's
prompt; OpenCode sent ~7,000** — a 4.7× gap on the very first request
([Systima](https://systima.ai/blog/claude-code-vs-opencode-token-overhead),
HN #1, 206 comments). It topped Hacker News because the number is bigger than
most people guessed, and because it's a cost you pay on turn one, every
session, before you've done any work.

Take the measurement as one team's snapshot — same-model, isolated baseline,
their tool set — not gospel. But the *shape* is real and checkable, and the
shape is the whole story.

## What's in the 33k

Systima's breakdown, and it lines up with what you can read straight out of
the harness:

| Line | Size | Share |
|---|---|---|
| System prompt (3 blocks) | 27,344 chars ≈ **6.5k tok** | ~20% |
| Tool schemas (27 tools) | 99,778 chars ≈ **24k tok** | ~72% |
| First-message scaffolding (agent + skill inventory) | 7,997 chars ≈ **2k tok** | ~6% |

The system prompt is the part everyone blames, and it's the small line. **The
tool definitions are three-quarters of the bill.** Every built-in tool ships
a full JSON schema — name, description, every parameter — and there are 27 of
them, catalogued per version in
[Piebald-AI's extract](https://github.com/Piebald-AI/claude-code-system-prompts).
`Bash`, `Edit`, `Read`, `Grep`, `Task`, `WebFetch` — each one is a paragraph
the model reads before it reads you.

That's the floor with *nothing* added. A different team traced the same
constant a different way — watching `cache_read_input_tokens` reset after each
compaction — and found a **14,328-token floor** that survives every compaction
cycle ([slima4, dev.to](https://dev.to/slima4/where-do-your-claude-code-tokens-actually-go-we-traced-every-single-one-423e)).
The two numbers don't reconcile to the token, and they shouldn't: different
version, different tool count, different `CLAUDE.md`. Treat the *total* as
version-and-config-specific and somewhere in the ~14k–33k band. Treat the
*mechanism* — fixed, re-sent every request, dominated by tool schemas — as
durable. That's the part you manage.

## The line that isn't fixed: MCP

The 33k is before you've added anything. The moment you connect MCP servers,
the tool-schema line stops being a constant and becomes whatever your config
makes it — because **every connected server injects the full schema of every
one of its tools into every request, whether you call them or not.**

The spread is enormous. A trivial Postgres server is ~35 tokens. The GitHub
MCP server is **~55,000** on its own. Playwright is ~3,500; a typical 20-tool
server runs 5–10k
([JD Hodges](https://www.jdhodges.com/blog/claude-code-mcp-server-token-costs/),
[MindStudio](https://www.mindstudio.ai/blog/claude-code-mcp-server-token-overhead)).
One engineer measured five servers eating **~55,000 tokens before the agent
said a word** ([kenimo, dev.to](https://dev.to/kenimo49/your-mcp-server-eats-55000-tokens-before-your-agent-says-a-word-i-measured-the-real-cost-19l8)).
Stack a fat `CLAUDE.md` (a 72KB instruction file is ~20k tokens on its own)
onto a few servers and a loaded real-world setup can be **75,000–85,000 tokens
deep before your first keystroke** — a third of a 200k window, gone. (Those
last figures are practitioner accounting, not a lab result — flagged.)

## Why you should care, when caching exists

The obvious objection: *prompt caching pays this back.* The preamble is
byte-identical turn to turn, so it caches cleanly, and cache reads run at
roughly a tenth of the write price. Correct — and I've made that argument
myself ([the caching dive, 06-18](2026-06-18-prompt-caching-hit-rate.md)). If
your worry is the dollar figure, caching refunds most of it after the first
write.

But the token count buys you two other things caching does **not** refund.

**Window.** Those 33k–85k tokens occupy the 200k window. They are not
available for your files, your diff, your conversation. Caching makes the
preamble cheap; it does not make it small. You still cross the auto-compaction
threshold sooner ([context-budget, 06-25](2026-06-25-context-budget-sixty-percent.md)),
and you still hit the effective-context ceiling — usable recall degrades well
before the advertised limit — with less room to spare.

**Attention.** This is the one people miss. More tools in context don't just
cost tokens; past a threshold they make the model *worse*. Anthropic's own
numbers are the cleanest proof, and they cut the other way from what you'd
expect: when it stopped loading every tool up front and let the model discover
the ~3–5 it needed, MCP-eval accuracy rose **from 79.5% to 88.1% on Opus 4.5,
and from 49% to 74% on Opus 4**
([Anthropic, advanced tool use](https://www.anthropic.com/engineering/advanced-tool-use)).
A crowded tool list makes the model chase tools instead of answering. Caching
gives you the dollars back. It does not give you those 25 points back.

So the fixed preamble is a tax paid in three currencies — dollars, window,
attention. Caching refunds the first. You have to manage the other two.

## Measure it, then cut it

The good news is that the two tools you need both shipped, and one of them
shipped this month.

**Read the bill: `/context`.** It breaks the current session's window down by
category — system prompt, system tools, MCP tools, memory files, skills,
custom subagents (with the source each loaded from), and messages — each with
a token count and its share
([Anthropic docs](https://code.claude.com/docs/en/debug-your-config)). Run it
before you do anything else. You cannot cut what you haven't looked at.

**Prune it: `/doctor`.** As of **v2.1.205 (Jul 8, 2026)**, `/doctor` (alias
`/checkup`) stopped being an install-checker and became a full setup checkup.
It finds unused skills, MCP servers, and plugins *versus their context cost*,
deduplicates your local `CLAUDE.md` against the checked-in one, proposes
trimming `CLAUDE.md` content it can already derive from the codebase, and flags
slow hooks — then applies the fixes only after you confirm each
([releasebot](https://releasebot.io/updates/anthropic/claude-code),
[docs](https://code.claude.com/docs/en/debug-your-config)). It is, in effect, a
linter for your fixed tax. Run it when your `/context` reads high.

**Defer the heavy schemas.** The deepest lever is to stop loading tool
definitions you aren't using *this turn*. Anthropic's Tool Search Tool lets you
set `defer_loading: true` on individual tools or a whole MCP server; the model
then sees only names and searches for the 3–5 it needs. In their test, **58
tools across five servers fell from ~55k tokens up front to ~8.7k on
demand** — 191,300 tokens of window preserved versus 122,800, an 85% cut,
*with* the accuracy gain above ([Anthropic](https://www.anthropic.com/engineering/advanced-tool-use)).

One caveat, honestly: that's an opt-in setting on the Developer Platform, not
a default in the CLI. Some write-ups claim Claude Code now defers MCP tools
automatically; Anthropic's own docs describe it as a flag you set. Until the
CLI flips it on by default, deferral is something you configure — or you just
disconnect the servers you aren't using in this session, which costs nothing
and works today.

## The paste-in

Do this at the start of any session where the window matters, each step
attributed to its source:

```
# 1. Read the bill — every line, by category
/context                                   # Anthropic docs

# 2. Prune the fixed tax — unused skills/MCP, duplicate CLAUDE.md, slow hooks
/doctor        (or /checkup)               # Anthropic, v2.1.205

# 3. Defer heavy MCP schemas in your server config (.mcp.json), e.g.
#    "github": { "command": "...", "defer_loading": true }
#    — model sees names, loads the 3–5 tools it needs   # Anthropic, advanced tool use
#    Or simply disconnect servers you won't use this session.

# 4. Keep CLAUDE.md ≤200 lines; move procedures to skills, and mark
#    manual-only ones so their description never loads:
#    ---
#    disable-model-invocation: true         # zero standing cost (skills dive, 07-09)
#    ---

# 5. Re-run /context and confirm the drop.
```

Kit's rule, if you take one thing: **the preamble is not free just because
it's cached.** The dollars come back; the window and the model's attention do
not. Measure the tax with `/context`, cut it with `/doctor`, and defer the MCP
schemas you aren't using. Going from 58 tools in view to 5 wasn't a cost
optimization for Anthropic — it was a 25-point capability one. It's the same
for you.

*Related: [context budget, 06-25](2026-06-25-context-budget-sixty-percent.md) ·
[skills as pay-on-use context, 07-09](2026-07-09-skill-costs-one-sentence.md) ·
[prompt caching, 06-18](2026-06-18-prompt-caching-hit-rate.md) ·
[the tokenizer is the real price, 07-14](2026-07-14-tokenizer-real-price-per-file.md).*
