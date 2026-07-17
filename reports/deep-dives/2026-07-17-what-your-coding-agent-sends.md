# It Uploaded the Files You Told It Not to Open

*Deep dive · Theo Vance (The Builder) · 2026-07-17 · Your coding agent is a networked program holding your keys — here's how to see what it actually sends.*

Open a terminal in a repo. There's a `.env` with a database URL and an API key. There's a `secrets/` folder your `.gitignore` covers. You start your coding agent, and you ask it to rename one function. Small task.

Now answer a question: what left your machine? Not in theory — on the wire, in bytes, to which hosts. Most of us can't. We read the marketing page, we trust the vendor, and we type. The agent runs with your shell, your credentials, and read access to every file in the tree. It also opens network connections. The gap between "I asked it to rename a function" and "here is the list of bytes that left" is where this week's story lives.

## Someone put a proxy in front and looked

On July 13 an independent researcher ran xAI's Grok coding CLI through [mitmproxy](https://mitmproxy.org/) — install the proxy, trust its CA cert, route the tool through `localhost`, read the request bodies — and [published the capture](https://gist.github.com/cereblab/dc9a40bc26120f4540e4e09b75ffb547). Two things showed up that the product page did not.

First, file contents went out **unredacted**, including a `.env` full of secrets, on two separate endpoints: the live model call (`POST /v1/responses`) and an archival one (`POST /v1/storage`). Second, and worse, the CLI uploaded the **entire repository** — not just the files the agent read. On a 12 GB test repo that was 5.1 GiB shipped in 73 chunks of ~75 MB, every one returning HTTP 200, landing in a Google Cloud Storage bucket named `grok-code-session-traces`. Files the agent had been explicitly told not to open were recovered verbatim from the captured git bundles.

Read that charitably and it's a session-restore or crash-trace feature — "session-traces" reads like checkpointing. Read it as the developer whose `.env` just left the building and it's the same fact: your secrets and your excluded files went to a bucket you didn't choose, and nothing on the surface told you. This is one researcher's teardown, single-sourced, and xAI hasn't publicly answered the specifics — so treat the exact chunk counts and bucket name as one capture, not gospel. But the *shape* is the point, and it's checkable: anyone can rerun the proxy.

The coda is the interesting part. Two days later, on July 16, xAI [open-sourced Grok Build](https://github.com/xai-org/grok-build) — the whole terminal agent, Apache 2.0, 99.6% Rust. Its README describes the crates and, in its own words, treats "internal system prompts, detailed agent loop logic, or network/telemetry call specifics" as implementation details it won't spell out. The proxy answered the question the README declined to. Now the source can, too.

## Three channels, and only one is unavoidable

Strip the drama and every coding agent has exactly three ways to talk to the network. Knowing which is which is the whole skill.

**The model request.** This one you can't remove — it *is* the product. To get a completion, the agent sends your prompt plus whatever it has pulled into context: file contents, diffs, tool outputs. Anthropic's own [data-usage docs](https://code.claude.com/docs/en/data-usage) say it plainly — Claude Code "sends data over the network. This data includes all user prompts and model outputs," TLS 1.2+. The provider sees your code because your code is the input. What you *can* control is how much: Claude Code sends what's in context, not (by default) a mirror of your working tree. The Grok capture is this channel turned maximal — the whole tree, read-or-not.

**Telemetry and diagnostics.** Separate pipe, separate rules, and this is where careful and careless diverge. Claude Code's metrics are on by default on the direct Claude API and — per the [monitoring docs](https://code.claude.com/docs/en/monitoring-usage) — "never include your code, prompts, or file paths"; `DISABLE_TELEMETRY=1` turns them off. Error reports (on for Pro/Max sign-ins on v2.1.198+, direct API only) redact known secret, path, and email patterns before anything leaves; `DISABLE_ERROR_REPORTING=1`. The `/feedback` command ships your conversation *including code* to Google Cloud Storage — but only when you run it. One thing you can't fold into the master switch: before every `WebFetch`, the tool sends the target **hostname** (not the URL or page) to `api.anthropic.com` against a safety blocklist, on every provider. That's the honest version — even the buttoned-up agent has a default-on ping you should know about. The difference from the Grok case is that all of it is documented and redacted; you don't need a proxy to learn it, but a proxy confirms it.

**Third parties through tools.** Every MCP server you wire in and every web tool the agent calls is its own trust boundary. Hand a database MCP your query, it sees your query; hand a search tool your error text, it sees your error text. The [State of MCP Security 2026](https://www.canopii.dev/State%20of%20MCP%20Security%202026.pdf) is early mapping of exactly this surface, and it grows every time you paste a server into your config. The model-request framing hides these because they don't go to your model provider at all.

## Go look — the ten-minute version

You don't have to trust any of the above, including me. Put a proxy in front and read one turn. Claude Code is a Node program that honors standard proxy and CA env vars, and Anthropic says it's "compatible with most popular VPNs and LLM proxies." So:

```bash
# 1. Run mitmproxy in one terminal (it prints its CA path on first run)
mitmproxy   # or mitmweb for a browser UI

# 2. In another terminal, route your agent through it
export HTTPS_PROXY=http://127.0.0.1:8080
export NODE_EXTRA_CA_CERTS="$HOME/.mitmproxy/mitmproxy-ca-cert.pem"
claude        # or: grok, cursor-agent, codex, opencode …
```

Then ask for one trivial edit and read the flows. Three questions decide everything:

1. **How many hosts?** One model endpoint, or a model endpoint *and* a storage endpoint? A second upload host is the tell the Grok capture turned on.
2. **What's in the body?** Just the files you touched, or files you never opened? Grep the captured bodies for a string that lives only in your `.env` or your `secrets/` dir. If it's on the wire, you'll see it.
3. **What's the size shape?** A rename should be kilobytes. Megabytes of upload on a small edit means something is mirroring your tree.

Fifteen minutes, once per tool, and you replace "I trust them" with "I watched it." For the tools that are open — Grok Build (Apache 2.0), [OpenCode](https://opencode.ai/) (MIT) — you can skip the proxy and grep the source for the endpoint list instead.

## The knobs, and the ones the docs don't hide

For Claude Code specifically, three facts are worth pinning up. Set `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1` and you fold telemetry, error reporting, the bug command, and the feedback survey into one off switch (the WebFetch hostname check is the documented exception — it has its own `skipWebFetchPreflight`). On a personal Pro/Max plan, your Claude Code data *can* train future models if that setting is on; on commercial, API, Bedrock, and Vertex terms it is not used for training by default, 30-day retention, ZDR available. And your transcripts sit in `~/.claude/projects/` **in plaintext** for 30 days by default — the loudest data flow is often the one that never leaves the disk. None of these are scandals. They're defaults, and defaults are exactly what an audit is for.

## Why this is turning into a moat

Here's the part that travels past your terminal. The harness layer is commoditizing — that's the running channel-war thread ([W25](../2026-W25.md)), with OpenCode and now Grok Build shipping the whole agent as open source. When the tool itself is a commodity, the thing you can still compete on is trust, and trust is legibility. xAI open-sourced its CLI *days after* an independent teardown of what that CLI sends. Whether or not that was the reason, it's the right move: you adopt the agent you can read.

That's the same logic as [ship-the-endpoint-not-the-magic-file](../deep-dives/2026-07-04-docs-for-agents-distribution.md) from two weeks ago — being legible is distribution. A coding agent runs with more privilege than almost anything else you install: your shell, your keys, your source. "Source-available" stops being an ideology and starts being a procurement checkbox. My bet: the open challengers keep going open, and the closed leaders answer with data-flow docs and telemetry switches rather than source — Claude Code stays closed-source through Q1 2027 while publishing exactly the kind of disclosure I quoted above (**72%**). Legibility is the battlefield; they'll just fight it with documents instead of a repo.

## Do / watch / ignore

**Do** — proxy every coding agent you run, once, on a throwadown repo with a canary secret in a `.env`. Fifteen minutes buys you the host list and the answer to "does it upload files I didn't open." Then set your traffic knobs deliberately (`CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1` if you want the quiet default) and treat any secret that has ever been in an agent's working directory as *potentially egressed* — rotate on that assumption, don't keep live prod keys in a repo you point an agent at.

**Watch** — a second host in the capture, an upload sized like your whole tree, and MCP servers you forgot you connected (run `/context` and `/doctor`; each server is a trust boundary, as the [context-tax dive](../deep-dives/2026-07-16-context-tax-before-your-prompt.md) counted the *tokens* and this counts the *recipients*). Watch, too, for the closed leaders open-sourcing — that's the tell the trust competition got real.

**Ignore** — the reflex that open means safe and closed means spyware. Grok Build is open *and* was captured uploading your repo; Claude Code is closed *and* redacts telemetry by default. Neither the license nor the marketing page answers the question. Only the wire does. This is the same discipline as [auditing what your agent commits](../deep-dives/2026-07-08-agent-audit-trail-unattended-commits.md) — generation went unattended, so the trail has to be independent of the thing you're checking.

What would change my mind: a shipped, on-by-default, cross-tool convention — a manifest an agent declares and a runtime enforces — that lists its egress hosts and honors a per-file "do not send" boundary the way `.gitignore` lists what not to commit. Until that exists, the boundary is a proxy you run yourself. Monday morning: `mitmproxy`, one canary secret, one rename. Go look.
