# The Coding Model You Can Run Isn't the One That Wins

*Deep dive · Theo Vance (The Builder) · 2026-06-17 · What it actually takes to replace Claude with a local model on your own machine.*

Here is the task. Your top two Claude models got pulled for an
export-control "misunderstanding" on June 15. The same day, programmatic
API usage moved to a separate credit pool, so your agent loops now bill
against a meter you can watch drain. You open Ollama. You wonder, like the
540 people who upvoted [the Ask HN thread the next morning](https://news.ycombinator.com/item?id=48531000),
whether you could just run a model on your own box and stop renting the
frontier.

Good instinct. Wrong first question.

The question everyone asks is "is there a good open model?" Yes. There are
several, and some of them beat the frontier. The question that decides your
Monday morning is narrower: **can the open model that fits on *your* machine
do *your* job?** Those are two different models, and the gap between them is
the whole story.

## Open-weight is a license. Runnable is a memory budget.

We've covered the license half of this twice. "Open source AI" almost always
means open-*weight*, and the license — not the word — decides what you may do
([June Okafor, June 16](./2026-06-16-open-weights-is-not-open-source.md)).
And weights are just numbers, which is why
[you cannot export-control a model](./2026-06-15-cannot-export-control-a-model.md)
the way Commerce just tried to.

This piece is the other half. The license tells you what you're *allowed* to
run. Your hardware tells you what you *can* run. For daily coding, the second
constraint bites first, and it's a chain of four numbers on your own machine:
the VRAM the weights need, the VRAM your context burns, the speed you get
back, and how far the model that fits trails the model you were paying for.

Walk the chain.

## Number one: VRAM, and the mixture-of-experts trick

The model most people actually run for local coding right now is
**Qwen3-Coder-30B-A3B**. The name is the spec: 30 billion total parameters,
3 billion *active* per token. It's a mixture-of-experts model — it holds the
knowledge of a 30B but only fires a 3B-sized slice for each token.

At Unsloth's dynamic 4-bit quant it's
[about 18.6 GB on disk and needs ~18 GB of unified memory](https://unsloth.ai/docs/models/tutorials/qwen3-coder-how-to-run-locally)
to load. That fits a single 24 GB card or a 32 GB Mac with room to work. So
far, so easy.

Now look at the model that would actually replace Claude: Qwen3-Coder's big
sibling is **480B-A35B**, and it
[needs roughly 150 GB of unified memory even quantized](https://unsloth.ai/docs/models/tutorials/qwen3-coder-how-to-run-locally).
That is not your laptop. That is a small server. Hold that thought — it's the
punchline.

| Model | Total / active | VRAM @ 4-bit | Fits |
|---|---|---|---|
| Qwen3-Coder-30B-A3B | 30B / 3B | ~18 GB | a 24 GB card / 32 GB Mac |
| Qwen3-Coder-480B-A35B | 480B / 35B | ~150 GB | a server, not you |

## Number two: 4-bit is not the cliff you fear

The reflex is to assume quantization wrecks a model. It mostly doesn't, and
this is the most useful thing to internalize. Unsloth's dynamic
**UD-Q4_K_XL** quant of the 30B
[scored 60.9% on Aider Polyglot against 61.8% for the full bf16 weights](https://unsloth.ai/docs/models/tutorials/qwen3-coder-how-to-run-locally).
That's under a point of loss for a quarter of the memory. Quantizing the
*weights* is the cheapest trade you'll make. Stop agonizing over it.

So if the weights fit at 4-bit and barely lose quality, what's the catch?

## Number three: the KV cache is the tax nobody budgets for

Context is not free. Every token in your window lives in the KV cache, and
that cache sits in VRAM right next to the weights. It
[grows linearly with context length](https://github.com/ggml-org/llama.cpp/discussions/9784):
`2 × layers × kv_heads × head_dim × context × dtype_bytes`.

The numbers are brutal at the lengths agents actually use. A single Llama-3.1
70B request
[at 128K context burns ~40 GB of KV cache alone](https://www.spheron.network/blog/gpu-memory-requirements-llm/) —
more than the 30B's *entire* quantized weight footprint. Qwen3-Coder
advertises a 256K window. You will not get 256K on a 24 GB card, because the
cache for it doesn't fit beside the model.

This is the gotcha that surprises people: the weights load fine, and then the
first long agentic session OOMs halfway through. The fix isn't a smaller
model — it's a
[smaller cache](https://insiderllm.com/guides/kv-cache-optimization-guide/).
Quantizing the KV cache to 8-bit roughly halves it at negligible quality
cost; 4-bit cuts it 75% with task-dependent loss. In llama.cpp,
`q8_0` for the key and `q4_0` for the value is a sane start. Shrink the cache
*before* you shrink the model.

## Number four: speed, and why MoE makes local usable

Because only 3B parameters fire per token, a 30B-A3B is fast for its weight
class. On an
[RTX 4090 it does ~73 tokens/sec; an M4 Max clears 100 t/s; an M2 Max gets ~68](https://www.arsturn.com/blog/running-qwen3-coder-30b-at-full-context-memory-requirements-performance-tips).
Drop to a 12 GB RTX 3060 at 6-bit and it's ~12 t/s; pure CPU on 32 GB of RAM
lands at 12–15 t/s. The MoE design is the reason "30B" doesn't mean
"unbearably slow" — you pay 3B-sized compute per token. At 70 t/s with zero
network latency, the loop feels good.

So: weights fit, quantization is cheap, you can tame the cache, and it's
fast. Where's the problem?

## The honest counter: the model that fits is the model that trails

The problem is capability, and you have to look straight at it. On the same
Aider Polyglot benchmark where the 30B scores ~61%,
[GPT-5 and Claude Opus 4.5 sit near 88–89%](https://llm-stats.com/benchmarks/aider-polyglot).
That's a ~27-point gap on identical tasks. On
[SWE-bench Verified, Claude Mythos 5 and Fable 5 are at ~95%](https://www.codeant.ai/blogs/swe-bench-scores)
while the best *open* models hover around 80%.

Note the trap in that last sentence. The open models that close the gap —
DeepSeek-V3.2-Exp at
[~74.5% on Aider Polyglot](https://llm-stats.com/benchmarks/aider-polyglot),
MiniMax M3 around 80% on SWE-bench — are the giants. They're the 150-GB-class
weights, not the 18-GB one on your card. The cruel symmetry of local coding
in mid-2026: the open model you can *run* trails the frontier badly, and the
open model that *competes* you can't run.

One piece of good news cuts against the gloom: **tool-calling is no longer
the wall.** Local function-calling used to be the dealbreaker for agent
loops. Now GLM and Qwen3-class models score
[76.7% and 75.7% on the Berkeley Function Calling Leaderboard](https://gorilla.cs.berkeley.edu/leaderboard.html) —
close enough to the frontier that a well-defined MCP tool gets called
correctly most of the time. The 30B doesn't fail because it can't invoke
your tools. It fails on the hard part: reasoning across a big messy repo over
a long agentic chain without losing the plot.

And treat all these scores as a compass, not a map — benchmark numbers wobble
with harness and contamination, [as we keep noting](./2026-06-12-reading-a-coding-benchmark.md).
The ~27-point gap is real; the second decimal place is not.

## So when is local actually worth it?

Daily coding is not SWE-bench. A lot of your day is scoped edits, boilerplate,
test scaffolding, renames, "explain this function," local autocomplete. For
that 70%, a 30B at 70 t/s with no latency, no meter, and no risk of being
[export-banned overnight](./2026-06-15-cannot-export-control-a-model.md) is
genuinely good — and getting better-aligned with your wallet now that
[the flat-rate subsidy is dying](./2026-06-07-ai-coding-honest-pricing.md).
The DuckDuckGo founder's point this week — that
[AI adoption is more segmented than the hype](https://gabrielweinberg.com/p/people-are-consuming-ai-like-they)
implies — applies to your own toolchain. You don't need the frontier for
every keystroke. You need it for the hard 30%.

## do / watch / ignore

**Do** — measure your own chain before you trust anyone's leaderboard. Pick
the biggest model whose weights *and* KV cache fit your real working context,
not the marketing context. Use dynamic quants (UD-Q4_K_XL), and quantize the
KV cache (`q8_0` key) *before* you drop model size. Then run a private eval on
*your* repo — a handful of real tickets, pass@1, post-cutoff — exactly the
[private benchmark Okafor argued for](./2026-06-12-reading-a-coding-benchmark.md).
Route the scoped 70% to local; keep a frontier key for the hard 30%.

**Watch** — the KV cache at long context (it OOMs you, not the weights); the
active-parameter count when you pick a model (it sets your speed); and whether
a DeepSeek- or MiniMax-class model gets distilled down to fit a single 24–48 GB
card. The day a *competitive* open model fits your machine, the math flips.

**Ignore** — the "is it really open source" label fight; for running code on
your box, the license matters far less than the memory budget. And ignore the
hero numbers from models you can't load. Your constraint is your VRAM, not a
press release.

What would change my mind: a sub-35B open-weight coding model that fits a
single 24 GB card *with* a usable 128K context and lands within ~10 points of
that quarter's top frontier model on a contamination-resistant agentic bench.
Get there, and local stops being the fallback and becomes the default for
most daily work. We're not there. The gap between runnable and competitive is
still the whole story.
