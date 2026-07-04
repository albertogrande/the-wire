# The Agent Reading Your Docs Won't Scroll. Ship the Endpoint, Not the Magic File.

*Deep dive · Theo Vance (The Builder) · 2026-07-04 · developer docs quietly became a distribution channel for agents — llms.txt is the passive bet, MCP is the one that's paying.*

Here's a task you probably ran this week without thinking about it. You told
your coding agent to add Stripe to a checkout, or to wire up a Postgres client,
or to call some API you'd never touched. The agent didn't open your browser. It
didn't read the marketing page, sit through the quickstart, or watch the
two-minute video. It went looking for the machine-readable version of the docs,
pulled what it needed, and wrote the code.

That moment is the whole story. For twenty years the winning move for a
developer tool was documentation as marketing — write docs so good a human finds
them, reads them, and adopts you. The human was the reader. The human is now
increasingly *not* the reader. The reader is a model, acting for the human, and
it has different eyes, a token budget, and no patience for your onboarding
funnel. The question every devtool now faces is narrow and practical: **what do
you ship so the agent can find you, understand you, and call you?**

Two answers are competing for that job. One is cheap and passive. The other is
work, and it's the one actually getting used.

## The passive bet: a file you drop and hope someone reads

The tidy answer is [`llms.txt`](https://llmstxt.org/), proposed by Answer.AI's
Jeremy Howard in September 2024. The pitch is clean: put a Markdown file at your
domain root that lays out your docs in a flat, link-rich, low-noise format an
LLM can slurp without fighting your nav bar, cookie banner, and 400KB of
JavaScript. A sitemap, but for models. There's a fuller `llms-full.txt` variant
that inlines the whole corpus.

It spread fast, mostly because it was free. When [Mintlify auto-generated the
file](https://www.mintlify.com/blog/what-is-llms-txt) for thousands of hosted
docs sites in November 2024, adoption spiked overnight — not because thousands
of teams decided it mattered, but because their docs host flipped it on. By late
2025 something like [844,000 sites](https://www.indexlab.ai/blog/llms-txt-does-it-actually-work-october-2025-updated)
had one.

And here is the number that should stop you before you spend a sprint on it:
there is still no solid evidence that any major model fetches it. Google's John
Mueller [said flatly](https://seranking.com/blog/llms-txt/) in mid-2025 that "no
AI system currently uses llms.txt," and Google likened it to the old `keywords`
meta tag — the discredited SEO relic you stuffed and search engines learned to
ignore. Publishers who went looking in their server logs mostly found the same
thing: crawlers aren't pulling the file, and there's no measurable lift in how
often a model cites you. A standard 844,000 sites implement and roughly nobody
consumes is not a channel. It's a hope.

The steelman, and it's real, comes from [Mintlify](https://www.mintlify.com/blog/the-value-of-llms-txt-hype-or-real):
the payoff isn't a crawler that indexes you ahead of time, it's the token bill
*when an agent is already on your page*. Structured docs mean the agent parses
less HTML to get the same answer — Mintlify cites "half the tokens, 1.5× faster"
for agent reads, and says Anthropic specifically asked them to ship
`llms-full.txt`. That's a genuine benefit. But notice what it is: an efficiency
gain at read time, not a discovery mechanism. It helps the agent that already
found you. It does nothing for the agent that hasn't.

## The active bet: an endpoint the agent actually calls

The other answer isn't a document. It's a running interface. A
[Model Context Protocol](https://www.anthropic.com/engineering/code-execution-with-mcp)
server exposes your product's capabilities as tools an agent can call directly —
not "here's prose describing our API" but "here's a `create_invoice` the agent
can invoke, with a typed schema it already understands." Anthropic shipped MCP in
November 2024. One year in, the SDKs cleared
[97 million monthly downloads](https://www.news.aakashg.com/p/master-ai-agent-distribution-channel)
across Python and TypeScript, with 10,000+ active servers. The companion
convention `AGENTS.md` — a plain instructions file agents read to learn how to
work in your repo — is on 60,000+ projects.

The contrast with `llms.txt` is the whole point. One is a file you publish and
pray gets read; the other is an endpoint whose download count tells you, to the
million, that it's being called. When distribution moves, it moves toward the
thing that executes, not the thing that describes.

This is where the story stops being a docs-formatting debate and becomes a
distribution one — and it gets there on its own, no forcing required. The
sharpest framing I've read on it is Aakash Gupta's: *"Your product's next million
users won't have eyes. They won't visit your website, sit through your
onboarding, or read your changelog. They'll be AI agents."* If your product
can't be parsed, authenticated, and executed by an agent, you're invisible in
the fastest-growing software channel. The retail-shelf → search-result →
app-store lineage has a new rung: the agent's tool inventory. If you're in the
index, you get queried. If you're not, for that workflow, you don't exist.

That's a dev-*marketing* claim, not a dev-*tools* one, and it's worth saying
plainly because it's where the money is. For a decade the growth playbook for a
developer product was: rank in Google, land on the Hacker News front page, get a
human to type `npm install`. The agent path routes around all three. Nobody
searches, nobody upvotes, nobody reads your launch post. The agent reaches for
whatever it can call, and it reaches for the same few tools every time because
they're the ones wired into its client. Being *callable* is the new being
*discoverable*.

## What I'd actually do Monday

I'm a builder, not a futurist, so here's the split I'd make with a real week of
budget.

**Do:** ship the MCP server if your product does anything an agent would want to
*call* — create a resource, run a query, fetch live state. This is where the
distribution actually moved, and the download numbers aren't ambiguous. Treat it
like you'd treat a public API launch, because that's what it is: version it,
authenticate it, write tight tool descriptions (the description *is* the
discovery surface — a vague one gets your tool skipped). Ship an `AGENTS.md` in
your repo; it's an afternoon and it changes how well an agent works inside your
codebase immediately.

**Do, cheaply:** generate `llms.txt` if your docs host does it for free. It costs
nothing, it can't hurt, and if the major models ever start honoring it you're
already there. Just don't put a sprint into it or report it as a growth lever —
you'd be reporting a placebo.

**Watch:** whether any frontier lab confirms it actually consumes `llms.txt` at
crawl or inference time. That single announcement flips the file from insurance
to infrastructure overnight, and it's the cleanest signal to watch in this whole
space. Watch the MCP registry the way you once watched package-registry
rankings — presence there is starting to behave like distribution.

**Ignore:** the "AEO will replace SEO, rewrite everything" content-marketing
noise. The durable move isn't a new acronym or a magic file. It's older and more
boring than that: make the thing an agent needs to use you *legible and
callable* — typed tools, honest schemas, docs structured for a reader that skims
by machine. That was good practice when the reader was human. It's survival now
that the reader isn't.

The deciding quantity isn't how many sites publish a file. It's how many agents
call your endpoint. One of those numbers is 844,000 and means nothing yet. The
other is 97 million and is the sound of a distribution channel changing under
your feet. Build for that one.
