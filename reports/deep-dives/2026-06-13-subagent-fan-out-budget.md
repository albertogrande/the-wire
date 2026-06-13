# Fan-Out Has a Token Bill, and You Sign It

*Deep dive · Theo Vance (The Builder) · 2026-06-13 · Nested sub-agents just shipped 5 deep. Here's what each one actually costs, and when one context is cheaper.*

You ask Claude Code to "audit the auth flow and the payment flow and the rate limiter for the same race condition." It spawns three sub-agents, one per flow, and they run at once. Two minutes later you have a clean answer. You also have a token bill that is roughly four times what the same work would have cost in a single conversation. Nobody told you that part.

On June 10, Claude Code [v2.1.172](https://releasebot.io/updates/anthropic/claude-code) shipped nested sub-agents: "Sub-agents can now spawn their own sub-agents (up to 5 levels deep)." The same release added a plugin search bar and smarter Bedrock region handling. It lands on top of a quieter change from May 6, when Anthropic [doubled the 5-hour limits](https://9to5google.com/2026/05/06/claude-code-is-getting-higher-usage-limits-doubled-for-most-users/) for paid tiers. More depth, more headroom. The product is pushing you toward fan-out.

Here is the thesis, in plain words: **a sub-agent is a fresh context window, and a fresh context window is not free. Fan-out trades latency for tokens. It is worth it when the work is genuinely parallel and the sub-agent returns a small answer. It is a tax you pay for nothing when the work is sequential or the answer is large.** The new depth limit makes both the win and the waste bigger. So the skill that matters now is knowing which one you're buying.

## Why a sub-agent costs what it costs

Start with the mechanic, because the cost falls straight out of it.

When Claude delegates, [the docs are explicit](https://code.claude.com/docs/en/sub-agents): "Each subagent runs in its own context window with a custom system prompt, specific tool access, and independent permissions." That is the whole point. The sub-agent does noisy work — reads files, runs greps, scans logs — in a window you never see, and hands back only a summary. Your main conversation stays clean.

But "its own context window" means it starts from scratch. Anthropic's [interactive context-window page](https://code.claude.com/docs/en/context-window) walks through one spawn step by step. The sub-agent "loads CLAUDE.md and the same MCP and skill setup, but starts without your conversation history." It gets "its own system prompt." Then it reads the files it needs. At the end, "only the subagent's final text response comes back to your context."

The numbers on that page are the ones to internalize. In their worked example: "The subagent read 6,100 tokens of files. You got a 420-token result. That's the context savings." Read it the other way and it's the cost. The 6,100 tokens were spent. They're billed. They just landed in a window you didn't watch. You paid for a 6,100-token research job to get a 420-token answer, and the 420 tokens are all you can see.

Now run three of those at once. Each re-loads CLAUDE.md. Each re-loads the MCP and skill setup. Each pays for its own system prompt and its own file reads. None of them share. A practitioner on Hacker News [named the failure mode](https://news.ycombinator.com/item?id=47386363) back in March, building a tool to fight it: Claude Code sub-agents "often re-read the same files and rebuild the same context from scratch." That is not a bug. It is what isolation means. The isolation you wanted for clean context is the same isolation that makes every worker re-pay the entry fee.

## The multiplier, from the primary source

Anthropic published the figure in its [multi-agent research write-up](https://www.anthropic.com/engineering/built-multi-agent-research-system): "In our data, agents typically use about 4× more tokens than chat interactions, and multi-agent systems use about 15× more tokens than chats." Same post: "token usage by itself explains 80% of the variance" in how well a multi-agent run performs. Tokens are the cost and most of the result.

So the ladder, from their own data, is roughly: a chat turn is 1×, a single agent doing tool work is ~4×, and a system that fans out to workers is ~15×. The jump from agent to fan-out is not small. You are not paying a little extra for parallelism. You are paying multiples.

Where does the 15× go? Three places, all from the mechanic above. The orchestrator's own context, which grows every time a worker reports back — a three-agent pipeline returning 2,000 tokens each adds 6,000 tokens per cycle to the lead agent's window. The workers' re-loaded setup, paid N times for N workers. And the workers' file reads, the 6,100-token jobs behind every 420-token answer, multiplied by however many you spawned.

Nesting compounds it. A practitioner [breakdown of v2.1.172](https://ofox.ai/blog/claude-code-nested-subagents-2026/) puts deep nesting (depth 3–5) at "Cumulative ~5-7× single-thread" token consumption (single-sourced multiplier; hold the exact ratio loosely — the *direction* is confirmed by Anthropic's 4×/15× spread). Every level is another set of windows, each re-paying its entry fee.

## The orchestrator-vs-worker split

This is the architecture the cost is forcing on you, so it's worth naming.

Anthropic describes its own system as an "orchestrator-worker pattern, where a lead agent coordinates the process while delegating to specialized subagents that operate in parallel." The lead doesn't do the heavy reading. It plans, delegates, and synthesizes. The workers do the expensive, throwaway work in their own windows and return conclusions.

The split exists because of the token math. The orchestrator's context is the one you keep small and coherent — it holds the plan and the synthesis. Worker context is disposable; you burn it and throw it away. The design is a way to spend tokens where they don't pollute the window that has to stay good.

Which tells you when fan-out is the wrong call. If a task won't flood your main context with stuff you'll never reference again, there is nothing for a worker to throw away, and the entry fee buys you nothing.

## When NOT to fan out

The honest part. Fan-out is the wrong choice more often than the demos suggest.

Don't fan out when the work is **sequential**. If step two needs step one's output, parallel workers can't help — they'd block on each other or, worse, each redo the shared setup. The [nested-subagents guide](https://ofox.ai/blog/claude-code-nested-subagents-2026/) is blunt: a sequence "belongs in a single sub-agent with `maxTurns: 20`, not five nested calls."

Don't fan out when the **answer is large**. The savings come from a small return — 420 tokens out of 6,100. If a worker has to hand back most of what it read (a full file, a long transcript), you paid the isolation tax and got none of the context savings. You'd have been cheaper reading it inline.

Don't fan out when **one agent in one context would just do it**. If the leaf would call one tool, or the parent could produce the answer with two reads, spawning a worker is pure overhead — a system prompt, a CLAUDE.md re-load, and a round trip to wrap a single grep. The rule of thumb from the same guide: if the summary you expect back is under ~500 tokens, or the parent could've gotten it directly, don't spawn.

And watch the recursion. v2.1.172 lets sub-agents spawn sub-agents, but the [docs note](https://code.claude.com/docs/en/sub-agents) the `Agent` tool is withheld from nested workers "by default to prevent recursion." Override that across the board and you've built a spending machine where every worker can hire more workers. The doubled rate limits give that machine more room to run before it hits a wall. This is the same shape as the runaway-bill problem in the [autonomy dive](./2026-06-12-autonomy-before-brakes.md): a proactive system, a metered resource, and no hard floor between them. Five levels of fan-out is a lot of floors to not have.

## Scoping a worker so it returns a conclusion, not a dump

The single highest-leverage habit. The worker's value is its summary; everything else is exhaust. So write the prompt to control the summary.

Tell the worker what to return, not just what to do. "Find every call site of `getSession` and return the file:line list and whether each handles the null case — do not paste the function bodies." That instruction is the difference between a 420-token answer and a 6,000-token answer landing back in your orchestrator. The docs' own model agents do this structurally: the built-in `Explore` agent "reads excerpts rather than whole files," and Explore and Plan "skip" the CLAUDE.md load entirely "for a smaller context." Borrow the discipline. A worker that returns "the conclusion, not the file dumps" is the entire economic case for spawning it.

Two more cheap wins. Route workers to a cheaper model — the docs list "routing tasks to faster, cheaper models like Haiku" as a first-class cost control, and putting Opus at a leaf node is "paying the top-tier rate for work that Haiku handles at a fraction." And give the worker only the tools it needs, so it can't wander into expensive territory you didn't intend.

## Budgeting heuristics you can actually apply

Concrete enough to use on Monday:

- **Price the spawn before you spawn.** Rough rule: a worker costs its re-loaded setup (CLAUDE.md + MCP + system prompt — for the general-purpose agent the system prompt alone is ~900 tokens, per the context-window page) plus its file reads. If that total is smaller than what those file reads would do to your main window, spawn. If not, read inline.
- **Fan out for breadth, stay single for depth.** N independent questions across the codebase → N workers, in parallel, returning short answers. One question that unfolds step by step → one context.
- **Cap the width before the depth.** Five 5-wide levels is up to 3,125 leaf windows. The damage is the *product*. Most real work wants depth 1–2 and a handful of workers, not a tree.
- **Demand a small return, in the prompt, every time.** If you can't say in one sentence what the worker should hand back, you're not ready to spawn it.
- **Measure it.** Run `/cost` (or `/usage`) after a fan-out session and after the same task done single-context. The 4×/15× spread is Anthropic's average; yours is checkable, and the only number that governs your bill.

## So what for Monday morning

**Do:** use fan-out for genuinely parallel breadth — independent searches, multi-file audits, the kind of work that would otherwise flood your window with stuff you'll never re-read. Scope each worker to return a conclusion under ~500 tokens, route it to Haiku, and hand it only the tools it needs. That's the configuration where isolation pays for itself.

**Watch:** nesting and width together. The new 5-deep limit and the doubled rate limits both widened the spend surface this month. Keep the `Agent` tool off nested workers unless you have a reason, and check `/cost` after fan-out sessions until you trust your own multiplier.

**Ignore:** the instinct to parallelize everything because you now can. Sequential work, large returns, and one-tool leaves are all cheaper in a single context. Fan-out is a tool for breadth, not a default. The token bill is yours, and you sign it whether or not you watched the window where it was spent.
