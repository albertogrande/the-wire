# The List Price Is Per Token. Your Bill Is Per File.

*Deep dive · Theo Vance (The Builder) · 2026-07-14 · Why the per-token sticker
price picks the wrong model for a coding agent — and how to measure the price
you'll actually pay.*

You're wiring up an agent that reads and writes a lot of code. Two models are
in the running. One lists at $3 per million input tokens, the other at $5. You
pick the $3 model, because three is less than five, and you move on.

That's the wrong comparison. Not because the prices are wrong — they're printed
correctly — but because the unit is wrong. You pay per token. You don't write
tokens. You write files. And the number of tokens a file becomes is set by the
model's tokenizer: a piece of software you didn't choose, can't see, and — for
code — that runs meaningfully heavier on some models than others.

The list price is one factor. The tokenizer is the other. Multiply them, or
you're comparing half the bill.

## Same file, different integer

Take one TypeScript file. 2,888 characters — a normal-sized module. Run it
through different tokenizers and you get different token counts for the exact
same bytes. A July benchmark from Playcode measured that file three ways:
[681 tokens on GPT-5.x's encoder, 898 on Claude's previous tokenizer, and 1,178
on Claude's current one](https://playcode.io/blog/real-price-of-frontier-models).
Same file. **1.73× more tokens on Claude than on GPT**, before you multiply by a
single dollar. (One file, one benchmark — treat the exact ratio as a data point,
not a constant.)

Across languages the same run put the Claude-to-GPT ratio at 1.73× for
TypeScript, 1.58× for Rust, 1.52× for JavaScript, 1.50× for Python. English
prose is much closer — [Anthropic's tokenizer runs roughly 15–20% over GPT's on
plain English](https://venturebeat.com/ai/hidden-costs-in-ai-deployment-why-claude-models-may-be-20-30-more-expensive-than-gpt-in-enterprise-settings),
and the gap widens on code. Code is where tokenizers diverge, and code is what
an agent moves all day.

Here's the same file turned into what it costs to *send*, at today's list rates:

| Encoder | Tokens (2,888-char TS file) | Input $/Mtok (list) | Cost to send this file once |
|---|---|---|---|
| GPT-5.x (`o200k`) | 681 | ~$1.25 | $0.00085 |
| Claude, previous tokenizer | 898 | $5.00 (Opus 4.8) | $0.00449 |
| Claude, current tokenizer | 1,178 | $5.00 (Opus 4.8) | $0.00589 |

The token column and the price column move in the *same* direction here, so
they compound. A "5 vs 1.25" sticker gap is really closer to 7× once the
tokenizer does its work — on this file, on this benchmark. Your files will
differ. That's the whole point: you have to run *yours*.

## Why code tokenizes worse

A tokenizer is a compression table. It learns, from a training corpus, which
byte sequences to merge into a single token — byte-pair encoding. The merges
that survive are the frequent ones. So common English words are one token;
rare strings get chopped into pieces.

The providers built different tables.
[OpenAI publishes theirs as `tiktoken`](https://github.com/openai/tiktoken) —
`o200k_base` (~200k vocabulary) for the current family, `cl100k_base` (~100k)
before it. Gemini uses a 256k-vocabulary SentencePiece model. Claude's
tokenizer is proprietary and unpublished. As one teardown put it, across the
three, ["the merge tables, vocabulary sizes, and handling of code, whitespace,
and non-Latin scripts all diverge"](https://dev.to/gabrielanhaia/tokenizer-quirks-claude-gpt-and-gemini-dont-count-the-same-text-the-same-way-1522).

Code is the adversarial case for all of them, but not equally. Source is dense
with the things BPE handles worst: runs of indentation whitespace, punctuation
(`{ } ( ) ; => :`), and `camelCase`/`snake_case` identifiers that no corpus saw
often enough to keep whole. `o200k` added a batch of code-friendly merges over
`cl100k` — that same teardown clocks it at "ten to twenty percent fewer tokens"
on a 50-line file. Whoever spent the vocabulary budget on code wins on code.
You don't get to see who did; you only get to measure the result.

## The change nobody re-measured

Here's the part that catches teams who *did* do the math — six months ago.

Anthropic's own docs now carry a warning: the tokenizer introduced with Opus
4.7 and used by Fable 5, Mythos 5, and Sonnet 5 produces
["approximately 30% more tokens than on earlier models"](https://platform.claude.com/docs/en/build-with-claude/token-counting)
for the same text. That's not a price change. The per-token rate can hold
steady and your bill still climbs a third, because each request is now a third
more tokens. Simon Willison
[measured a system prompt at 1.46× on the newer tokenizer](https://simonwillison.net/2026/Apr/20/claude-token-counts/)
— 7,335 tokens where the old one read 5,039.

We flagged the direction when Sonnet 5 shipped default in Claude Code
([W27](../2026-W27.md), the "cost-neutral" tokenizer). This is what it means at
the keyboard: **a token count you cached before spring is now low by roughly a
third, and any spreadsheet built on it is wrong.** A model-version bump is a
re-pricing event even when the price page doesn't change.

## You can't estimate this offline (for Claude)

For GPT and Gemini you can count locally: `tiktoken` and the Gemini SDK both run
on your machine, free, no round-trip. For Claude there is no downloadable
tokenizer. The only way to get the number Anthropic will bill is to ask
Anthropic, through the
[`count_tokens` endpoint](https://platform.claude.com/docs/en/build-with-claude/token-counting):

```bash
curl https://api.anthropic.com/v1/messages/count_tokens \
  --header "x-api-key: $ANTHROPIC_API_KEY" \
  --header "anthropic-version: 2023-06-01" \
  --header "content-type: application/json" \
  --data '{"model":"claude-opus-4-8","messages":[{"role":"user","content":"<your file here>"}]}'
# -> { "input_tokens": 1178 }
```

It's free and separately rate-limited (2,000+ requests/minute), so you can run
it over a whole fixture. Two things to know. It returns an **estimate** — "the
actual number of input tokens used when creating a message may differ by a small
amount." And it counts under the tokenizer of the exact `model` string you pass,
so `claude-opus-4-8` and an older Sonnet give different answers for the same
bytes. Pass the model you'll actually run.

The discipline that keeps you honest is one line:
[never trust a count from a tokenizer you don't call in production, and
reconcile against the `usage` field of a real request](https://dev.to/gabrielanhaia/tokenizer-quirks-claude-gpt-and-gemini-dont-count-the-same-text-the-same-way-1522) —
"those are the integers the invoice is built from." Send one real message with
your fixture, read back `usage.input_tokens`, and check the estimate against it.
The invoice, not the estimator, is ground truth.

## Weigh the tokenizer. Don't worship it.

Here's the honest counter, because the tokenizer is a factor, not a verdict.
Cheaper-per-token is not the same as cheaper-per-*solved-task*, and three things
push back on a naive "pick the lighter tokenizer" rule:

- **Output tokens.** They're priced separately (often 4–5× the input rate) and a
  heavier *input* tokenizer doesn't touch them. If your workload is output-heavy,
  the input multiplier matters less.
- **Prompt caching.** A repeated prefix — your system prompt, the files that
  don't change between turns — can be cached and billed at a fraction, regardless
  of how it tokenizes ([the caching dive](./2026-06-18-prompt-caching-hit-rate.md)).
  The tokenizer sets the price of the *uncached* bytes.
- **Turns to done.** A model that one-shots a task at 1.7× the input rate still
  beats one that needs three tries at the cheap rate. Correctness per attempt can
  swamp the tokenizer entirely.

So the ladder is **cost-per-token → cost-per-file → cost-per-solved-task**, and
only the last rung pays your invoice. The tokenizer decides one rung: the input
bill on content you can't cache. Weigh it against the rest; don't let it be the
whole decision — and don't ignore it because the sticker looked cheap.

This is the same lesson as last week's issue, one layer down. The invoice, not
the sticker, decides ([the Chinese-models dive](./2026-07-13-chinese-models-commodity-tier.md)
made the point at the level of *which* model; this makes it at the level of
*how many tokens* that model charges you). The meter keeps hidden terms —
caching, [imaging your code to dodge the count](./2026-07-04-code-as-image-token-tax.md),
and now the tokenizer. Add it to the list of reasons the pricing page is a
starting point, not an answer.

## So what — do / watch / ignore

**Do:** before you commit a model to a code-heavy agent, build a 20-file fixture
from your *actual* repo — the real indentation, the real identifiers — and count
it against the exact model ID on every provider you're weighing. Convert to
dollars-per-fixture, not dollars-per-token. Reconcile one run against
`usage.input_tokens`. That number, times your daily request volume, is the
comparison the pricing page couldn't give you. It's an afternoon of work and it
will change at least one model choice.

**Watch:** model-version bumps re-tokenize silently — Anthropic already shipped
a ~30% jump under a stable price. Treat every version change as a re-pricing
event: recount, don't reuse the old numbers. And watch for anyone shipping an
offline Claude tokenizer; until then, counting Claude is an API round-trip and
your CI cost-estimates need network.

**Ignore:** the per-token headline read in isolation, and the reflex that a lower
sticker means a lower bill. Ignore prose token benchmarks when your workload is
code — measure the thing you actually send, in the language you actually ship.

What would change my mind: if Anthropic publishes a downloadable, offline
tokenizer *and* the ~30% inflation gets walked back, half of this evaporates —
you'd count locally and the cross-vendor gap on code would narrow. I don't
expect either before Q1 2027. Until then, the price you compare is the one you
measured, on your files, against the exact model — or it's not the price you'll
pay.
