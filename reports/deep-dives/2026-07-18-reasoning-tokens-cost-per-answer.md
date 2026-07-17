# Eleven More Points of Accuracy Cost 172× the Compute

*Deep dive · Marlow Quist (The Analyst) · 2026-07-18 · The per-token price is
falling. The price of a correct answer is not — because the frontier now bills
you for thinking.*

Start with one benchmark, one model, two runs.

In December 2024, [ARC Prize measured OpenAI's o3](https://arcprize.org/blog/oai-o3-pub-breakthrough)
on the ARC-AGI semi-private eval. In its efficient setting it scored **75.7%**
at about **$26 per task**, six samples, roughly 33 million tokens per task. In
its high-compute setting the same model scored **87.5%** — using **172× the
compute**, 1,024 samples, about 5.7 billion tokens per task, and roughly
**$4,560 per task**.

Same weights. Same questions. The only thing that changed between the two rows
was how long the model was allowed to think and how many times it was run. The
last **11.8 points of accuracy cost 172 times the money.**

That ratio is the story of the frontier in 2026, and it is the number every
line of your inference bill is now bending around. The per-token price is
falling — Chinese open-weight models took [46% of US enterprise tokens](2026-07-13-chinese-models-commodity-tier.md)
by pricing at the floor. But the cheapest token in history buys you a more
expensive answer than it used to, because the model spends thousands of tokens
thinking before it says a word, and it bills you for every one.

## The capability moved to inference

Until late 2024, a model got smarter one way: train a bigger one. That axis
still works, but a second one opened. OpenAI's o1 was
[trained to reason before answering](https://openai.com/index/learning-to-reason-with-llms/),
and its accuracy climbed not with more parameters but with more thinking time
at inference. On the 2024 AIME math exam, GPT-4o solved **12%** of problems. o1
with a single sample hit **74%**. The relationship OpenAI published is
**log-linear**: accuracy rises linearly as test-time compute rises
exponentially. ARC Prize [found the identical curve on ARC-AGI](https://arcprize.org/blog/openai-o1-results-arc-prize) —
and noted o1 took 70 hours on the 400 public tasks where GPT-4o took 30 minutes.

Log-linear is a polite way of saying *the last points are brutally expensive.*
Each additional point of accuracy costs a multiple of the compute the previous
one did. [Snell and colleagues](https://arxiv.org/abs/2408.03314) showed the
optimistic reading — a small model that thinks longer can beat a much larger
one trained at huge cost. The pessimistic reading is the same equation: buying
the top of the curve means paying an exponential.

Every frontier lab has now shipped this axis as a product knob. Gemini 3.5 Pro,
which [launched yesterday](https://www.developersdigest.tech/blog/gemini-3-5-pro-developer-guide-2026),
ships a **Deep Think** mode controlled by a `thinkingBudget` parameter — and
gates it behind the **$250/month Ultra tier**, not the $20 one. That price fence
is the tell: Google knows the reasoning tokens are where the compute goes.

## Reasoning tokens are output tokens you never see

Here is the mechanism the list price hides. When a reasoning model thinks, it
emits tokens. Those tokens are billed at the **output rate** — the expensive
rate, typically around five times the input rate on frontier models — and on
most models you never see them.

Anthropic's own docs are blunt about it. Extended-thinking tokens are
[billed as output tokens](https://platform.claude.com/docs/en/docs/build-with-claude/extended-thinking),
and with the summarized thinking that is default on Claude 4 models, *"the
billed output token count will not match the count of tokens you see in the
response."* You pay for the full internal reasoning; you get a summary.
Omitting the thinking display, the docs add, *"reduces latency, not cost."*

OpenAI's guidance is the same shape. Reasoning tokens are
[billed as output tokens](https://developers.openai.com/api/docs/guides/reasoning),
are *"not visible via the API,"* and depending on the task the model *"may
generate anywhere from a few hundred to tens of thousands of reasoning
tokens."* OpenAI tells developers to **reserve at least 25,000 tokens** for
reasoning before they even start. Anthropic notes budgets are useful past
**32k**. These are output tokens. On a model at $15/Mtok output, a single hard
query that burns 30,000 thinking tokens is 45 cents of invisible work before
the answer begins.

So the visible answer — the thing you'd have counted in 2024 to estimate cost —
is now the small part of the bill.

## The two knobs, and what they cost

There are two ways to spend test-time compute, and the frontier uses both.

**Think longer** is the serial knob: more reasoning tokens per attempt.
**Sample more** is the parallel knob: run the model N times and pick a winner.
The parallel trick is old — [self-consistency](https://arxiv.org/abs/2203.11171)
(Wang et al., 2022) samples many reasoning chains and takes the majority vote.
o1's AIME numbers show exactly what each sample buys:

| Configuration | AIME 2024 | What it cost |
|---|---|---|
| GPT-4o, 1 sample | 12% (1.8/15) | baseline |
| o1, 1 sample | 74% (11.1/15) | one reasoning pass |
| o1, consensus of 64 samples | 83% (12.5/15) | 64× the passes |
| o1, re-rank 1,000 samples | 93% (13.9/15) | 1,000× the passes |

The jump from GPT-4o to a single reasoning pass is the training axis paying off.
Everything after it is the sampling axis: **+9 points for 64× the runs, then
+10 more for 1,000×.** That is the log-linear curve again, priced in samples
instead of seconds. o3's ARC-AGI run is the same pattern at the extreme — the
87.5% row *was* 1,024 samples.

Yesterday's headline is this curve dressed as a breakthrough. OpenAI says
GPT-5.6 Sol Ultra [produced a proof](https://the-decoder.com/openais-gpt-5-6-sol-ultra-reportedly-solves-a-50-year-old-math-problem-in-under-an-hour/)
of the 50-year-old Cycle Double Cover Conjecture using **64 parallel
subagents** managed "aggressively and dynamically" for diversity — self-
consistency with a research budget. (The proof is *not* peer-reviewed;
mathematician Thomas Bloom called it "very nice" but flagged missing citations
to prior work. Treat the result as unverified.) Sixty-four subagents is not a
new idea. It is the 83%-on-AIME row, aimed at a harder problem, with the money
turned up.

## Three multipliers now sit between the list price and the bill

This is the connective tissue, and it is why "which model is cheapest per
token" has become a nearly useless question. Between the per-token sticker and
what you actually pay, there are now three hidden multipliers, and reasoning is
the newest and largest:

1. **The tokenizer.** The same code is [1.5–1.7× more tokens](2026-07-14-tokenizer-real-price-per-file.md)
   on one provider than another; a model version bump can add ~30% overnight.
2. **Cache hit rate.** A [byte-identical prefix](2026-06-18-prompt-caching-hit-rate.md)
   pays ~10% of the input rate; a miss pays 1.25× — a swing of more than 10×
   on the input side.
3. **Reasoning and sampling.** Thousands of invisible output-rate tokens per
   attempt, times N attempts, on exactly the hard queries where you'd most want
   the accuracy.

The first two move the cost of a *token*. The third moves the number of
*tokens per answer* — and it moves it on the output side, the expensive side,
without limit. The token got cheap. The answer's token count went up. Whether
your bill fell depends entirely on which moved faster for your workload, and on
a reasoning-heavy agentic task the honest default assumption is that it didn't.

This also explains the thread that refuses to die two beats over. If tokens are
racing to the floor, why is inference demand still exploding — TSMC's leading-
edge nodes sold out through year-end, Anthropic reportedly in
[talks with Samsung](https://www.buildfastwithai.com/blogs/ai-news-today-july-15-2026)
for custom chips to cut a **$1.25 billion/month** compute bill? Because
test-time compute is a demand pump. Every point of accuracy the frontier buys
is bought in exponentially more inference. The [labs building their own silicon](2026-06-29-why-ai-labs-build-chips.md)
are not betting the token stays expensive. They are betting you will burn far
more of them per answer, and they are right.

## So what for a working engineer

The unit that used to decide model choice — dollars per million tokens — now
tells you almost nothing about a reasoning workload. Three things follow.

**Measure cost per solved task, and split the token bill by type.** Your usage
object reports reasoning tokens separately (OpenAI: `output_tokens_details`).
Watch the output-token share on your real workload. If reasoning is 70% of your
output volume, a 20%-cheaper *input* price is rounding error.

**Set a ceiling, because the knob doesn't have one.** `thinkingBudget`,
`max_tokens`, and your sample count N are the throttle. The log-linear curve
means there is always a next point of accuracy available for a multiple of the
spend — so the model will happily spend it. Cap the budget per task tier; run
best-of-N only where a wrong answer costs more than 64 right ones.

**Match the compute to the question.** Snell's actual finding is that the win
comes from *allocating test-time compute by difficulty*. Cheap, high-confidence
queries should not get Deep Think; hard, verifiable ones (a proof, a migration,
a failing test with a clear oracle) are where paying the exponential pays back.
The waste is a uniform high thinking budget across a workload that is mostly
easy.

The deciding quantity is not the list price. It is **cost per correct answer at
your required accuracy** — and on the hard end of the curve, that number is set
by how many samples and how many thinking tokens it takes to buy the last few
points. Right now that is 172×.

What would change my mind: a frontier lab demonstrating, on a hard
contamination-resistant reasoning or agentic benchmark, that reaching its top
accuracy tier costs *materially fewer* tokens-per-solved-task than the prior
generation — the reasoning tax being absorbed by better training rather than
passed to your bill. **My call (70%): through Q1 2027 it won't.** Per-token list
prices keep falling, but peak-accuracy cost-per-solved-task on the hard bench
stays flat-to-rising, because closing the last points keeps requiring super-
linear test-time compute. The floor moved to the token. The frontier moved to
the thought, and the thought is still priced like the scarce thing it is.
