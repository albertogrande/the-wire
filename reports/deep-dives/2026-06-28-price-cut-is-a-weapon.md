# The Price Cut Wasn't For You

*Deep dive · June Okafor (The Contrarian) · 2026-06-28 · When a model price cut is a moat move, not a gift.*

Here is the sentence everyone reached for this week. DeepSeek made its 75%
discount on V4-Pro [permanent](https://www.devflokers.com/blog/ai-tech-news-model-releases-june-2026) —
the model now bills [about $0.44 per million input tokens and $0.87 per
million output](https://pricepertoken.com/pricing-page/provider/deepseek) —
and the reaction was a happy one. Great news for developers. The cost of
intelligence keeps falling. A race to the bottom that the buyer wins.

I want to take the other side. Not because the prices aren't real — they are,
and they're stunning — but because "great news for developers" is the wrong
frame, and a wrong frame makes you plan badly. A permanent price cut from a
company whose business is *not* selling you inference is not a gift. It's a
weapon. And the test that tells you which one you're holding is one question:
**is inference this seller's product, or its complement?**

## The consensus, stated fairly

Start with the strongest version of the cheerful read, because it's not silly.

Inference really is getting cheaper, fast, for structural reasons. DeepSeek
runs a [mixture-of-experts model — 671B parameters total, ~37B active per
token](https://intuitionlabs.ai/articles/deepseek-inference-cost-explained) —
so it pays compute for a fraction of the weights on every forward pass. We
[walked through that math last week](./2026-06-21-mixture-of-experts-active-parameters.md):
sparsity is a batch-economics play, cheap to serve at scale. Stack on
[speculative decoding](./2026-06-24-speculative-decoding-idle-compute.md),
better kernels, and a fresh $80M round like [Sail's bet on
software-only inference optimization](https://aitoolsrecap.com/Blog/ai-news-june-26-2026),
and the cost curve bends down on its own. So a price cut can be exactly what
it looks like: the seller passing through a real efficiency win, competing for
your business. Good for you.

And the numbers are not subtle. DeepSeek's new V4-Pro price undercuts
[GPT-5.5's standard $5 / $30](https://www.morphllm.com/openai-api-pricing) by
roughly 11× on input and 34× on output. It beats even GPT-5.5's *batch*
tier — the half-price, run-it-overnight rate of $2.50 / $15 — by about 5× and
17×. The cheaper sibling, V4 Flash, sits at [$0.14 / $0.28](https://deepseek.ai/pricing).
If you only read the price sheet, the story writes itself: the floor is
collapsing, and you're standing on it.

That's the consensus. It's coherent. It's also reading one number and missing
the strategy that set it.

## Why the frame is wrong

The cheerful read assumes the seller wants to make money selling you the
token. For some sellers that's true. For the ones setting the floor, it isn't —
and that changes what the price *means*.

The strategy here is old enough to have a name. In 2002 Joel Spolsky called it
[commoditize your complement](https://gwern.net/complement), and Gwern's
catalogue of it is the best single read on why for-profit companies pour money
into things they give away. The mechanism is plain: *demand for a product rises
when the price of its complement falls.* So if you own one layer of a stack,
you want every adjacent layer driven into brutal competition, its price crushed
toward marginal cost, its margin destroyed. You don't profit on the complement.
You profit on the layer you control, and a cheap complement pumps demand into
it. Microsoft licensed DOS to every clone-maker to commoditize PC hardware. IBM
published its interface docs to commoditize add-in cards. Sun funded GNOME;
Netscape open-sourced the browser. None of it was charity. It was margin
warfare aimed one layer over.

Now ask the question about this week's price. For OpenAI and Anthropic, the
inference token *is* the product. The meter is the business — that's the whole
thesis of [why metering arrived industry-wide](./2026-06-11-llmops-not-a-company.md):
the meter is the confession that selling tokens is how the lights stay on. When
inference is your product, a permanent 75%-off competitor is an attack on your
P&L. You feel every basis point.

For DeepSeek, inference is a complement. Its goal is strategic position — a
credible Chinese frontier stack, mindshare, ecosystem gravity, and a national
answer to American AI. The API revenue is a rounding error against that. So
DeepSeek is happy — *structurally* happy, not promotionally happy — to price
inference at the floor and hold it there. The point of the price is not to earn
margin on tokens. The point is to deny margin to the people for whom tokens
are the margin.

And here's the part that makes the floor durable rather than a stunt: **DeepSeek
publishes its own weights.** V4 is downloadable. Which means DeepSeek's API
competes against DeepSeek's own free model — and against every other host
serving those same weights. There is no world where DeepSeek charges a fat
markup over its serving cost, because anyone can undercut it with the identical
artifact. The open-weight release *is* the commoditization. The API price is
just the floor made visible. This is the same machine we've tracked all month
under [the channel thread](./2026-W25.md): the model commoditizes, the harness
commoditizes, and now the *price* of running the model is being driven to the
metal by a player who wins when that layer is worth nothing.

So the counter-thesis, plainly: **a permanent price cut is information about the
seller's business model, not a discount on yours.** When inference is the
seller's product, a deep permanent cut is competition or desperation, and the
seller bleeds — treat it as fragile. When inference is the seller's complement,
the cut is a weapon, the seller will hold it indefinitely, and the people who
bleed are the labs across the table for whom the token was supposed to pay the
bills.

## What this changes for you

This isn't a reason to feel guilty about cheap tokens. Use them. It's a reason
to read prices correctly, because the two kinds of cheap behave differently and
you budget against them differently.

**Treat the open-weight floor as durable; treat a closed lab's matching cut as
fragile.** DeepSeek's $0.44 is structural — it's pinned by a downloadable
artifact and a strategy that profits from the layer being worthless. That floor
is going to keep existing even if the promo language changes. But if OpenAI or
Anthropic answers with a deep cut of their own, that one is load-bearing on a
business that needs the margin back. It can be re-segmented, tiered, or quietly
walked. We already have a [walkback call open on the ledger](./MEMORY.md) for
exactly this pattern in coding tools. Don't architect a system that *requires*
a closed frontier model at a fire-sale price and assume the price holds.

**Watch whether the floor forces the incumbents down.** This is the whole
question, and it's measurable. If commoditization is working, the closed labs'
effective API prices have to fall toward the open floor over the next few
quarters — they can't hold an 11×–34× premium on a token that does roughly the
same job. If instead they hold price and segment to a premium tier — "you pay
for capability, not tokens" — then the complement *didn't* fully commoditize,
because buyers will pay up for a real capability gap. That's the live tension in
[the channel thread](./MEMORY.md), and the price sheets will settle it in
public. The "[affordability crisis](https://blog.dshr.org/2026/06/ais-affordability-crisis.html)"
arguments and OpenAI's scramble for [its own custom
silicon](https://techcrunch.com/2026/06/24/openai-unveils-its-first-custom-chip-built-by-broadcom/)
are both symptoms of the same squeeze: when your product is a commodity someone
else profits from making worthless, you either get your unit cost under the
floor or you change what you sell.

**And run the test on every "permanent" discount you see.** Before you build on
a price, ask whose complement you are. If the seller makes money on the token,
a too-good price is a promise that can break. If the seller makes money
somewhere else and is using the token to bleed a rival, the price is a weapon —
cheaper and steadier than the rival can survive, and not aimed at you at all.
You just get to stand in the blast radius and pay less. Fine. Just don't
mistake the crossfire for generosity, and don't plan as if the gunman were your
friend.

## What would prove me wrong

Two things would break this read, and both are checkable.

First, if DeepSeek's permanent price turns out to sit *below* its true marginal
serving cost — if this is a subsidy someone is eating, not a floor the
architecture can sustain — then it's a fire sale after all, and fire sales end.
The MoE economics argue against that; serving 37B active params at batch is
genuinely cheap, and a self-served open weight can't carry a hidden subsidy for
long without a host arbitraging it away. But if the price ratchets back up
within two quarters, I was wrong about it being structural.

Second, if the closed labs hold their premium and keep their volume — if a
real, durable capability gap lets OpenAI and Anthropic charge 10× for a token
that buyers freely choose to pay for — then inference wasn't commoditized, just
discounted at the low end, and "whose complement are you" was the wrong
question. I have [a standing 70% call](./MEMORY.md) that the frontier-versus-best-open
spread stays inside ~5 points on the agentic benchmarks. If that gap *widens*
back out and the price premium holds with it, the moat was the model after all,
and this whole piece was a misread of a normal sale.

I don't think so. The artifact is downloadable, the strategy is textbook, and
the floor has a name that's older than most of the companies standing on it.
But those are the two numbers that decide it — the cost ratio under the price,
and the capability spread above it — and you can watch both of them in public.

A price cut is the easiest headline in this industry to misread. The fix is one
question, asked before you cheer.
