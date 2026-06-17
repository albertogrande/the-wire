# Prompt Caching Pays 90% Off — If You Win the Bet

*Deep dive · Marlow Quist (The Analyst) · 2026-06-18 · The advertised discount is real; almost nobody collects it, and the reason is one number.*

Anthropic says prompt caching cuts your input cost by 90%. The read price is
`0.1x` base — a flat, documented, 90% discount, [in the docs](https://platform.claude.com/docs/en/docs/build-with-claude/prompt-caching).
OpenAI advertises [up to 90% off](https://developers.openai.com/api/docs/guides/prompt-caching)
cached input. DeepSeek goes further: a cache hit on V4 Flash costs
`$0.0028/M` against a `$0.14/M` miss — a [98% cut](https://tokenmix.ai/blog/deepseek-api-pricing).

Then you read the threads. On r/ClaudeAI, the Anthropic Discord, and HN, the
same complaint keeps surfacing: developers turn caching on, see
`cache_creation_input_tokens` in the response, and watch their bill move 5–15%,
not 90% ([summary here](https://www.aimagicx.com/blog/prompt-caching-claude-api-cost-optimization-2026);
single-sourced aggregation, but it matches what I see in my own logs).

Both numbers are true. One quantity reconciles them, and it is not on any
pricing page: your **cache hit rate**. Prompt caching is not a discount you
switch on. It is a bet you place on every request, and the house edge runs
against you unless you set it up to win.

## What you are actually buying

A cache hit does not store your text. It stores the model's computed
key-value state — the KV tensors — for a *prefix* of your prompt. On the next
request, if the leading tokens are byte-identical to a cached prefix, the
model skips recomputing attention over them and charges you the read price
instead of the input price. That is the whole mechanism, and it dictates every
rule that follows.

The prefix must match exactly, from the first token. Change one token early
in the prompt — a timestamp, a reordered tool definition, a user id spliced
into the system message — and every token after it is a cache miss, because
the KV state downstream depends on everything upstream. This is the
attention-cost story the backlog keeps circling, seen from the billing side:
the same quadratic dependency that makes long context expensive is what makes
caching fragile. Cached state is positional. It cannot survive an edit above
it.

Here is the spread that decides everything, across the four providers a working
engineer actually reaches for:

| Provider | Cache write | Cache read | Min to cache | Default TTL | Control |
|---|---|---|---|---|---|
| Anthropic | 1.25x (5-min) / 2x (1-hr) | 0.1x (−90%) | 512–4,096 tok by model | 5 min, refresh-on-use | manual breakpoints (≤4) |
| OpenAI | 1.0x (no surcharge) | up to 0.1x | 1,024 tok | ~5–10 min, up to 1 hr | automatic |
| Google Gemini | implicit: none | discounted line item | 2,048–4,096 tok | implicit, auto | implicit + explicit ($1/M·hr storage) |
| DeepSeek | 1.0x (no surcharge) | ~0.02x (−98%) | automatic prefix | best-effort | automatic |

Two columns matter more than the rest: the write multiplier and who controls
the breakpoint. Anthropic charges you `1.25x` to *create* a cache entry and
gives you manual breakpoints. OpenAI, Gemini, and DeepSeek charge no write
premium and place the breakpoints for you. That difference is the whole
strategic choice, and I will come back to it.

## The math that makes it a bet, not a discount

Take a coding agent — the reader's daily case. Each turn re-sends the entire
conversation: a stable prefix (system prompt, tool schemas, the chunk of
codebase you pinned) plus the growing transcript. Say the stable prefix is
50,000 tokens and the session runs 20 turns.

| Strategy | Prefix input tokens billed | vs no-cache |
|---|---|---|
| No cache | 20 × 50k = 1,000,000 | — |
| Cache, all 20 turns hit | 50k×1.25 + 19×50k×0.1 = 157,500 | **−84%** |
| Cache, every turn misses | 20 × 50k×1.25 = 1,250,000 | **+25%** |

The top row is the advertised dream. The bottom row is the part nobody prints:
when the cache misses, you do not pay the normal price — you pay the *write*
price, `1.25x`, every time. A caching setup that never hits is strictly worse
than no caching at all. That `+25%` is the house edge, and it is exactly why
the bills barely move for people who flip the switch without restructuring the
prompt.

So when does the bet pay? Solve for the break-even reuse count `N`. One write
costs `1.25`; each later read costs `0.1`; no-cache costs `1.0` per use:

```
1.25 + (N − 1)·0.1 = N   →   N = 1.28
```

Reuse a cached prefix just **twice** inside the TTL and you are ahead. At the
1-hour TTL (`2x` write) break-even is `N ≈ 2.1` — reuse three times. The bet is
cheap to win. The catch is never the break-even arithmetic. It is whether the
prefix stays byte-identical *and* whether the reuse lands inside the TTL window.

## The two ways you lose

**Invalidation.** Anything that mutates the front of your prompt voids the
cache. The usual culprits, in order of how often I find them: a system prompt
that interpolates the current time; tool definitions serialized in
nondeterministic key order; conversation history injected *above* a static
system block instead of below it; a per-user string prepended for
"personalization." Each one moves the first differing token earlier and turns a
90% read into a 125% write. The fix is structural: order the prompt
**stable → dynamic**, never the reverse, and put the cache breakpoint right at
the seam.

**Eviction.** Anthropic's default TTL is 5 minutes, refreshed free each time
the entry is used. That refresh is the feature that makes it work — a busy
agent loop keeps the cache warm for nothing. But a human in the loop kills it.
Read the diff, think, get coffee, come back in eight minutes: the entry is gone,
and your next turn pays the write price to rebuild it. For bursty interactive
work, the 5-minute window is the real product constraint, not the discount. The
`1-hour` TTL exists for exactly this — you pay `2x` on the write to buy
eviction insurance — and it is usually worth it the moment your turns are more
than a few minutes apart.

## The other side: just let it be automatic

The obvious counter: why pay Anthropic's write premium and hand-place
breakpoints when OpenAI, Gemini, and DeepSeek cache automatically with no
surcharge? DeepSeek's disk cache is on by default for every request; OpenAI
caches any prompt over 1,024 tokens with zero config; Gemini 2.5-and-newer do
implicit caching out of the box.

That is a real advantage, and for a static prompt it wins outright — no write
tax, no breakpoint to misplace. But automatic means you do not control the
breakpoint, and the providers say so: DeepSeek's cache is
[best-effort and does not guarantee a hit](https://api-docs.deepseek.com/guides/kv_cache);
a partial prefix match counts for nothing. When your prompt has a stable 50k
core followed by volatile content, automatic caching may break the prefix at
the wrong place and cache less than you'd pin by hand. Anthropic's `1.25x` is
the price of *placing the cut yourself* — declaring "everything above this line
is stable, cache it as one unit." On a long agent prompt with a known stable
core, that control is worth more than the surcharge costs. On a short or fully
static prompt, it is dead weight. Match the tool to the prompt shape, not to the
discount headline.

## So what for Monday morning

This connects straight to the bill the reader is now paying. When flat-rate AI
tooling [ended industry-wide](./2026-06-07-ai-coding-honest-pricing.md) and the
[June 15 subscription split](../2026-W25.md) moved programmatic usage to a
metered pool, caching stopped being an optimization and became the largest
single lever on what an agent costs you. A fan-out of sub-agents
([the token bill you sign](./2026-06-13-subagent-fan-out-budget.md)) multiplies
that lever: every child that reuses a cached system prefix pays `0.1x` for it
instead of full freight.

Concretely:

- **Do** order every prompt stable → dynamic and set the breakpoint at the
  seam. Verify it worked: read `cache_read_input_tokens` against
  `cache_creation_input_tokens` in the usage block. If creation dwarfs read,
  your prefix is churning and you are paying the penalty, not the discount.
- **Watch** the TTL against your turn cadence. Interactive, gappy sessions:
  buy the 1-hour cache. Tight autonomous loops: the free 5-minute refresh
  already covers you.
- **Ignore** the 90% on the pricing page as a planning number. Plan with your
  measured hit rate. The honest figure for a well-structured agent is a
  60–84% cut on the cached segment; the honest figure for "I turned it on" is
  roughly zero, and sometimes less.

The decisive quantity was never the discount. A `0.1x` read and a `1.25x`
write define a bet whose break-even is reuse `N ≈ 1.28` — trivially winnable.
What you are actually managing is the probability the bet lands: prefix
stability times TTL coverage. Get those to 1, and the 90% is yours. Leave them
to chance, and you are paying a 25% surcharge to feel optimized. Measure the
hit rate, or you are not caching — you are gambling with the house's
multiplier.
