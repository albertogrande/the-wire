# Your Agent Pushed That Commit While You Weren't Looking

*Deep dive · Theo Vance (The Builder) · 2026-07-08 · The committer went off-camera this week. Your audit trail is the brake that's left.*

You dispatch a background subagent to fix a flaky test. You close the
laptop. You open it an hour later and there is a draft PR you never watched
get written — commits, a push, a description, all of it done by a process
you weren't in the room for.

That is not a hypothesis. It is the default in Claude Code since
[v2.1.198](https://code.claude.com/docs/en/changelog) (July 1). The
changelog is two flat sentences: "Subagents now run in the background by
default, so Claude keeps working while they run," and "Background agents
launched from `claude agents` now commit, push, and open a draft PR when
they finish code work in a worktree, instead of stopping to ask."

Read those together and the shift is not that the agent writes more code.
It is that the agent now *writes it off-camera and hands you the finished
artifact*. The first time you see the work is the diff. Everything that
happened before the diff — the files it opened, the commands it ran, the
tool call it retried three times — happened while you weren't watching.

When the committer stops being a person you can watch, one thing becomes the
brake: the trail it leaves. This is a piece about building that trail, this
week, before the reviewer becomes the only bottleneck left.

## Three defaults flipped in one week

Look at what moved, in order:

- **v2.1.198** — subagents background by default; background agents
  auto-commit, push, and open a draft PR instead of asking.
- **[v2.1.200](https://code.claude.com/docs/en/changelog)** (July 3) —
  the default permission mode changed to **Manual** across the CLI, VS Code,
  and JetBrains; `AskUserQuestion` dialogs no longer auto-continue.
- **[v2.1.202](https://code.claude.com/docs/en/changelog)** (July 6) —
  added `workflow.run_id` and `workflow.name` OpenTelemetry attributes "so a
  workflow run's activity can be reconstructed from OTel data."

The harness moved the *writing* off-camera (198) and, in the same week, moved
the *deciding* back on-camera (200: Manual mode, no auto-continue). That's not
contradiction. It's the harness conceding the exact trade: if the agent is
going to act while you're gone, the moments where it needs a human should
stop and wait, and the moments where it acts should leave a record you can
reconstruct (202). The permission prompt and the audit trail are two halves
of the same admission — that the agent is now trusted to run, and untrusted
to run *unwitnessed*.

## The permission prompt is not the audit trail

It's tempting to think Manual mode fixes this. It doesn't, and the reason is
worth being precise about. A permission prompt gates the *next* action. It
asks "should I run this command?" and blocks until you answer. That's a real
guardrail — [we covered why the hook, not the string-match, is the version
that holds](2026-07-02-hooks-are-the-real-guardrail.md). But a prompt tells
you nothing about the hundred actions *already taken* in a background run you
weren't attached to. Consent at the gate is not evidence of what happened
past it.

And the guard you're implicitly trusting — worktree isolation, the thing that
keeps a background agent's writes off your main checkout — sprang two leaks in
the same eight days. v2.1.198's own notes fixed "subagents in background
sessions bypassing the worktree-isolation guard and writing to the shared
checkout." Then
[v2.1.203](https://github.com/anthropics/claude-code/releases) (July 7)
fixed "worktree-isolated subagents sometimes running shell commands in the
parent checkout instead of their own worktree." The isolation brake we leaned
on [when we said stop sharing one checkout](2026-06-23-git-worktrees-agent-isolation.md)
leaked twice in a week. That's not an argument against isolation. It's an
argument for an *independent record* — one that doesn't ask you to trust the
same harness whose guard just failed.

## What a real trail looks like — two layers

**Layer one is git, and it's free.** Small, attributed commits are your
primary audit log. A draft PR is a review checkpoint the agent opens *for*
you. The lever you actually control is granularity: an agent that squashes an
hour of work into one commit hands you an unreviewable wall; an agent
instructed to commit in small, single-purpose steps hands you a diff you can
read. Put that instruction in `CLAUDE.md`. The commit history is the cheapest
tamper-evident log you own, because every commit is already content-hashed and
chained to its parent — git has been doing this since 2005.

**Layer two is the gap between commits**, and git is silent there. The files
an agent read, the shell commands it ran, the tool call it retried after a
dropped ACK ([the retry that runs your write twice](2026-06-26-agent-retries-idempotent-writes.md))
— none of that lands in the commit. That's what OpenTelemetry's
[GenAI semantic conventions](https://opentelemetry.io/docs/specs/semconv/gen-ai/)
are for. They define agent-lifecycle spans — `invoke_agent`, `execute_tool` —
and attributes under the `gen_ai.*` prefix, including
`gen_ai.tool.call.arguments` and `gen_ai.tool.call.result`, plus duration and
token-usage metrics. An `invoke_agent` root span wraps each request; the
tool calls nest under it. Reconstruct that tree and you can see what the agent
*did*, not just what it left.

Claude Code already emits this. Turn it on:

```bash
# Capture what the agent did, not just the diff it left behind
export CLAUDE_CODE_ENABLE_TELEMETRY=1
export OTEL_METRICS_EXPORTER=otlp
export OTEL_LOGS_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
```

With that live, Claude Code ships the events that *are* the audit trail:
[`claude_code.tool_result`, `claude_code.tool_decision`,
`claude_code.commit.count`, `claude_code.pull_request.count`, and
`claude_code.permission_mode_changed`](https://code.claude.com/docs/en/monitoring-usage),
each carrying `session.id` and `user.id`. `tool_result` is the primitive: one
event per tool execution, the record of an action taken while you were gone.

One honest caveat, because it's load-bearing: the GenAI conventions are still
**Development** status (Semantic Conventions 1.40.0), attribute names are
still moving, and you opt into the current set with
`OTEL_SEMCONV_STABILITY_OPT_IN=gen_ai_latest_experimental`. Capture the data
now; don't hard-wire a dashboard to attribute names that will rename under you.
It's a moving target, not a stable contract — treat it like one.

## The trust problem with your own log

Here's the hole. An OTel trace is only as trustworthy as the process that
emitted it. The agent — or anyone who can reach the log after the fact — can
omit a span or backdate a record. A log the actor writes about itself is a
diary, not evidence.

That's the gap [Halo](https://github.com/bkuan001/halo-record), a Show HN
this week, aims at. Every agent action — tool call, model call, data access,
approval — becomes one record in an append-only, hash-chained log: SHA-256
over RFC 8785 canonical JSON, each record carrying the hash of the previous
one, so reordering or editing breaks the chain. An external witness holds
periodic chain fingerprints (a count and a head hash, nothing sensitive) to
prove nothing was deleted. The pitch: "any party can verify the log was never
altered, without trusting whoever produced it" — aimed at SOC 2, the EU AI
Act, and OWASP evidence.

It's early and single-source; don't ship it Monday. But the *shape* is right,
and it's the same shape as git's own object model — content-addressed,
chained, verifiable without trusting the author. When the committer is a
machine, "trust me" logs stop being evidence. The primitive that survives is
the one you can recompute.

## Why this is the story and not a footnote

Generation went unattended this week. Review didn't. Anthropic's own figure —
roughly 80% of the code it merges is now Claude-written, the number under
[the trust-stack dive](2026-06-10-trust-stack-human-speed.md) — means the
reviewer was already the bottleneck. Now the reviewer is also the *only human
who sees the work*, and the artifact they're handed is a PR from a bot they
didn't watch. The scarce resource isn't generation. It's the confidence to
approve, and that confidence is a direct function of the trail the agent left.

This is the maintainer-revolt question — who reviews the machine's output —
arriving at your own keyboard, minus the politics. The answer isn't to slow the
agent down. It's to make its work *legible after the fact*: small commits, a
captured trace, and eventually a log you can prove wasn't edited.

## Do, watch, ignore

**Do.** Turn on OTel export now and capture `tool_result` / `tool_decision`,
not just the final diff — the diff is the outcome, the events are the audit
trail. Instruct background agents (in `CLAUDE.md`) to commit in small,
attributed steps so the PR is reviewable. Treat every auto-opened PR as
**untrusted until reviewed** — never wire a bot PR to auto-merge. If you're
under SOC 2 or EU AI Act scope, start prototyping tamper-evident (hash-chained)
logging before it's a checkbox on an audit.

**Watch.** Whether Manual-mode-by-default plus auto-PR nets out to *more* or
*less* real oversight in your team's practice — the two defaults pull opposite
ways, and only your merge log will tell you which won. Watch the GenAI
conventions leave Development; that's when you can build durable dashboards on
the attribute names. Watch whether a harness ships signed or hash-chained run
records natively — the tell that "verifiable agent evidence" went from Show HN
to table stakes.

**Ignore.** The line that "agents self-verify now, so review is dead." Review
got *more* important the moment the committer stopped being a person you could
watch. The work didn't disappear. It moved from the writing to the reading —
and the reading is only as fast as the trail is clean.

Monday morning: export the four telemetry vars, add "commit in small steps" to
your `CLAUDE.md`, and open your next background-agent PR knowing it's untrusted
until you've read not just what it wrote, but what it did.
