# The Window Says 1,050,000. The Bill Starts at 272,000.

*Deep dive · Marlow Quist (The Analyst) · 2026-07-21 · OpenAI quietly cut Codex's context window from 372k to 272k. The number it cut *to* is the one that was always real.*

On July 19, OpenAI shipped a Codex update that shrank a number. The bundled model metadata for GPT-5.6 went from a 372,000-token context window to 272,000 — a 27% cut, [merged as a routine metadata backport](https://github.com/openai/codex/pull/33972/files), no blog post, no changelog line worth the name. It surfaced because a user watched his window get smaller and [posted it to Hacker News](https://news.ycombinator.com/item?id=48965850), where it stuck near the top for a day.

The obvious read is that OpenAI nerfed the tool. It didn't. It stopped walking you off a cliff.

Here is the number that explains the whole thing. GPT-5.6 Sol is [advertised at a 1,050,000-token context window](https://openrouter.ai/openai/gpt-5.6-sol), priced at $5 per million input tokens and $30 per million output. But requests above **272,000 input tokens** are billed at 2× input and 1.5× output — and not just on the overflow. The multiplier reprices the *entire request*. Cross 272k by one token and your $5/$30 session becomes a $10/$45 one, retroactively, on every token in it.

Codex's harness was set to 372,000. So for months it fed the model context up to a hundred thousand tokens past the price cliff — and passed the surcharge straight to users who never saw the line. [OpenAI itself flagged the overcharge](https://x.com/kunchenguid/status/2076720168160596243): harnesses pinned at 372k "will cause you to lose quota more quickly than it should." The July 19 change didn't cut a capability. It moved the harness default back to the number where the base price still holds.

## Three windows, one word

The lesson is that "context window" has quietly become three different numbers, and the marketing only ever quotes the first.

| Number | GPT-5.6 Sol | What it actually is |
|---|---|---|
| 1,050,000 | advertised (API) | the billboard |
| 400,000 | Codex total window | 272k input + 128k reserved output |
| 272,000 | base-price ceiling | above it, 2× input / 1.5× output on the **whole** request |
| 372,000 | old Codex default | walked you 100k past the cliff, silently |
| ~2k–32k | effective recall | where the model still reliably *uses* what you sent |

The billboard number sells the model. The price-cliff number decides your bill. The effective number decides whether any of it mattered. They are drifting apart, and Codex's edit is the first time a vendor has quietly conceded which one to trust.

## Why the cliff exists

Long context is not linearly expensive. Two curves sit underneath it.

The first is the **KV cache**: every token in the prompt leaves behind a key and value vector the model must hold in GPU memory for the rest of the request. That memory grows linearly with the prompt. A 372k prompt pins 1.37× the KV cache of a 272k one — which is 1.37× fewer concurrent requests the GPU can batch, straight off the top of the serving margin.

The second is **attention itself**, which is quadratic. Each token attends to every token before it, so the prefill compute for a prompt of length *n* scales with *n²*. Run the ratio: 372,000² / 272,000² ≈ **1.87**. One Hacker News commenter put it exactly — "with purely quadratic attention, the cost of the token at 372K is 87% more than the token at 272K." That 87% is not a rounding error. It is the reason a step-function surcharge above a fixed threshold tracks a real cost curve rather than pure rent.

This is why Codex's compaction is good, and why a serious practitioner reached for it in the same thread: *"Long context can be more of a curse than a benefit... write up a detailed design doc"* and let the agent work from that, not from 300k of raw repo. He is describing the [retrieve-don't-stuff discipline](../deep-dives/2026-06-30-long-context-vs-rag.md) The Wire measured three weeks ago. The economics say the same thing the accuracy benchmarks do.

## The window you paid for, the window you got

Because the third number — effective recall — is the one that turns this from a billing story into an engineering one.

Advertised context is a claim about what fits, not what works. [NoLiMa](https://arxiv.org/html/2502.05167v1), which tests retrieval that needs a latent association rather than a literal keyword match, found that **10 of 12** models scoring above 90% on short context fell to *half* that score or worse by 32K tokens — and that most models' genuinely reliable length was often measured in the low thousands. RULER, the NVIDIA benchmark whose title asks "what's the real context size of your long-context language models," reaches the same verdict a different way: the claimed window and the usable one are not the same object.

So the old Codex default was charging you a 2× multiplier for tokens sitting in the exact region where the model's recall of them was already decaying. You paid double, on the whole session, for context the model half-ignored. Read that way, the cut is pro-user: it stops the silent overcharge for the median coding session, which rarely needs 272k of any provider's tokens, let alone 372k.

It is anti-user for exactly one population — the people whose workflows genuinely live past the cliff. The original poster is one: *"the lack of long context is the main reason that I still end up using Anthropic... 372 was not perfect, but it was so much better and a godsend."* That is the honest counterargument, and it points somewhere specific.

## Two labs, opposite bets

Anthropic used to have this exact cliff. On the Claude 1M-token beta, prompts above **200,000** tokens were billed at 2× input / 1.5× output — same shape, same whole-request repricing. Then [Anthropic removed it](https://tokencost.app/blog/anthropic-long-context-flat-pricing) on March 13, 2026, and now prices its flagship 1M window flat: no threshold, no multiplier, one rate from token 1 to token 1,000,000 ([The New Stack](https://thenewstack.io/claude-million-token-pricing/) covered the move).

So the two leading closed labs have made opposite bets on the same cost curve. OpenAI keeps long context a premium tier and lets the surcharge do the rationing. Anthropic eats the serving cost and sells the flat window as a feature — the thing that keeps the long-context user from leaving. Neither is charity or malice. They are two answers to one question: *is the 1.87× attention cost of a long prompt something you meter, or something you absorb to win the workload?* OpenAI meters it. Anthropic, betting the long-context user is the sticky one, absorbs it.

One caveat before you port that comparison into a spreadsheet: the windows are not measured in the same unit. Tokens are a per-provider quantity — [the same file costs more tokens on one tokenizer than another](../deep-dives/2026-07-14-tokenizer-real-price-per-file.md). A commenter in the thread claimed GPT-5.6 Sol is roughly 2× as token-efficient as Anthropic's models on code (single-sourced, so treat it as directional), which would make a 272k Sol budget worth something closer to 500k Claude-equivalent tokens. "1M vs 272k" is not the spread it looks like until you normalize for what a token buys.

## What this is, and what it isn't

It would be easy to file this next to the meter's other hidden terms — the [tokenizer that turns list price into a per-file bill](../deep-dives/2026-07-14-tokenizer-real-price-per-file.md), the [reasoning tokens billed at 172× for the last points of accuracy](../deep-dives/2026-07-18-reasoning-tokens-cost-per-answer.md). It belongs to the same family, but it is a different animal. Those are multipliers that scale with every token. This is a *step function* your tool crosses without telling you, and the fix is not a model choice — it's a config number. That is what makes it worse in practice and easier to solve: worse because a cliff is invisible until the bill arrives, easier because you close it by editing one integer.

**So what for Monday morning.** Find out what context limit your harness advertises, then find out where your provider's price cliff sits, and make the first number not exceed the second. For GPT-5.6 in a custom loop, that means 272k, not 372k; Codex now does it for you, but Cursor, Windsurf, and every hand-rolled wrapper may not, and the difference is 2×/1.5× on your whole session. Budget to the effective window, not the billboard: compact, hand the agent a design doc, retrieve the three files it needs instead of the three hundred it can hold. And when you compare "1M context" across vendors, normalize twice — once for the price cliff, once for the tokenizer.

What would change my mind: a lab that ships a model whose *effective* recall — RULER-grade, not needle-in-a-haystack — holds past its price cliff, and prices that range flat. Then the cliff really would be rent, and the flat-pricing lab would be the only honest one in the room. Today the cliff still tracks a real cost curve, and the honest number on the GPT-5.6 billboard is the small one. The deciding quantity was never how many tokens the window holds. It's the cost per *correct* answer at the context length you actually use — and past a few tens of thousands of tokens, both terms of that ratio move the wrong way.

*Prediction: OpenAI's flagship coding model keeps a long-context price surcharge — a fixed input-token threshold above which the request reprices — through Q1 2027, rather than moving to flat pricing across its advertised window the way Anthropic did. Confidence 72%.*
