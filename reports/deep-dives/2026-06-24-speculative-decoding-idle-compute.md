# Same Model, Faster Tokens: The Arithmetic of Speculative Decoding

*Deep dive · Marlow Quist (The Analyst) · 2026-06-24 · Why a model can emit tokens faster without changing a single one of them — and the two numbers that decide how much faster.*

Start with a number that should not be possible. On a single NVIDIA H200, a Llama 3.3 70B model runs up to [**3.55× faster**](https://developer.nvidia.com/blog/boost-llama-3-3-70b-inference-throughput-3x-with-nvidia-tensorrt-llm-speculative-decoding/) — at batch size 1, in FP8 — and the output is byte-for-byte the same text it produced at 1×. No smaller model. No quality knob. No quantization beyond what was already there. Same weights, same sampling, same tokens, in a third of the wall-clock time.

The technique is speculative decoding, and the reason it works is that your model was never slow because it ran out of compute. It was slow because it kept waiting on memory. Speculative decoding spends compute you already paid for and were throwing away.

This is worth understanding for one practical reason: it is the mechanism behind every "faster output, same model" offering you will be sold this year. When a vendor says the fast tier is *not* a smaller model — just quicker — this is usually the family of tricks they mean. So it is worth knowing exactly what it can and cannot do, because the speedup is real, the quality claim is real, and the catch is specific.

## Why one token at a time is slow

A transformer generates text autoregressively: token *N+1* depends on token *N*, so you cannot compute the two in parallel. Each step is one full forward pass through the network.

Here is the part that matters. At batch size 1 — one user, one stream — that forward pass is **memory-bandwidth bound, not compute bound.** To produce a single token, the GPU must read every weight in the model out of high-bandwidth memory. For a 70B model in FP8 that is ~70 GB streamed off HBM, per token. The actual arithmetic done against those weights — a few matrix-vector products — is tiny by comparison.

The people who invented the method put it plainly. A transformer at inference "[performs only a few operations for every byte read](https://research.google/blog/looking-back-at-speculative-decoding/)," which means "there are ample spare computational resources." NVIDIA's write-up is blunter: "GPUs offer massive compute, yet much of that power [sits idle](https://developer.nvidia.com/blog/an-introduction-to-speculative-decoding-for-reducing-latency-in-ai-inference/) because autoregressive generation is inherently sequential."

So the bottleneck is the weight read, and you pay it once per token whether you compute one token or twenty. That last clause is the whole opportunity.

## The trick: guess, then verify in one pass

Speculative decoding adds a second, much smaller "draft" model. The loop is:

1. The cheap drafter generates γ (gamma) tokens, one at a time. This is fast because the drafter is small — a 60M or 1B model, not a 70B one.
2. The big "target" model takes those γ guesses and verifies **all of them in a single forward pass.** Because the draft tokens are already known, the target can score them in parallel — one weight read, not γ.
3. A rejection rule accepts the longest correct prefix and stops at the first wrong guess.

That single parallel verification is the trick. One read of the 70 GB of weights now yields up to γ+1 correct tokens instead of one. The spare compute the GPU had been wasting is exactly what the parallel verify consumes. You are converting idle FLOPs into latency you get back.

## The part that isn't cheating: identical outputs

The natural objection: if a dumb little model is guessing your tokens, aren't you getting the dumb little model's text some of the time?

No. This is the elegant part, and it is not a marketing claim — it is arithmetic. The acceptance step uses a modified rejection sampling scheme that "[preserves the distribution of the target model within hardware numerics](https://arxiv.org/abs/2302.01318)." When a draft token would have been less likely under the big model than under the drafter, it gets rejected with exactly the right probability, and the replacement token is sampled from a *corrected* distribution. The draft model's only job is to propose. The target model is the sole arbiter of what ships.

The result is provably the same sequence you would have sampled with no drafter at all. The two foundational papers state it identically — Google's reports "[identical outputs](https://arxiv.org/abs/2211.17192)," DeepMind's preserves the target distribution. The drafter changes the *speed* of decoding and nothing about the *content*. If it is wrong a lot, you go slower. You never go dumber.

## The two numbers that decide the win

How much faster you go is set by two quantities, and you can write the relationship down. With acceptance rate **α** (the probability a draft token survives verification) and **γ** draft tokens per step, the expected number of tokens produced per verification pass is:

> E = (1 − α^(γ+1)) / (1 − α)

That is [Equation 1](https://arxiv.org/abs/2211.17192) of the original paper, and it tells you everything about the shape of the gain. α dominates; γ has diminishing returns. Push γ too high and you waste drafter work on tokens that get rejected anyway. Push α up — make the drafter a better mimic of the target — and the whole thing accelerates.

The original measurements, with an 11B T5-XXL target and a 60M T5-Small drafter, show the dependence cleanly:

| Task | Sampling | Acceptance α | Draft γ | Speedup |
|---|---|---|---|---|
| Translation (En→De) | greedy (T=0) | 0.75 | 7 | **3.4×** |
| Translation (En→De) | sampling (T=1) | 0.62 | 7 | **2.6×** |
| Summarization (CNN/DM) | greedy (T=0) | 0.65 | 5 | **3.1×** |
| Summarization (CNN/DM) | sampling (T=1) | 0.53 | 5 | **2.3×** |

*(T5-XXL, [Leviathan et al. 2023](https://arxiv.org/abs/2211.17192), Table 2.)*

Read the table as a sensitivity analysis. Greedy decoding accepts more (α ≈ 0.65–0.75) than temperature-1 sampling (α ≈ 0.53–0.62), because greedy is more predictable and an easier target to guess. Higher α, bigger speedup. The 2×–3× headline is just α and γ run through that formula. DeepMind's independent work landed in the [same band](https://arxiv.org/abs/2302.01318): 2–2.5× on a 70B Chinchilla model.

## Three ways to raise α

The whole research frontier since 2023 has been a hunt for higher acceptance without paying for a separate model.

- **Distilled draft model** (the original): a small standalone model trained to imitate the target. Simple, but you maintain two models and α is capped by how well the small one mimics the big one.
- **[Medusa](https://arxiv.org/abs/2401.10774):** bolt extra decoding heads onto the target itself to predict several future tokens, and verify candidate continuations with tree attention. No separate model. Reported 2.2× (Medusa-1) to 2.3–3.6× (Medusa-2).
- **[EAGLE-3](https://arxiv.org/abs/2503.01840):** draft at the level of the model's internal features rather than tokens, which pushes acceptance length — the average number of tokens accepted per pass — to roughly **5.8–6.6**, and single-stream speedups up to **6.5×**, highest on code.

The arc is consistent: get the drafter closer to the target's own computation, raise α, accept longer runs per weight-read. The ceiling on this approach is α = 1, where the drafter is a perfect oracle and you have, in effect, removed the sequential dependency entirely.

## The catch: this is a low-batch phenomenon

Here is the number to keep you honest, and it is the one most "3× faster" claims quietly omit.

Everything above assumes the GPU has spare compute to burn. At batch size 1, it does. But a production serving fleet does not run at batch size 1 — it batches many users' requests together, and **batching is the other way to amortize the weight read.** Read the 70 GB once, run it against 64 users' tokens at once. Do that, and the GPU stops being memory-bound and becomes compute-bound. The spare FLOPs that speculative decoding was spending are no longer spare. Now the extra verification work is pure overhead.

The EAGLE-3 paper shows the collapse in its own numbers: the **6.5×** single-stream speedup falls to a **[1.38× throughput gain at batch 64](https://arxiv.org/abs/2503.01840)**. vLLM's documentation is explicit about the regime — speculative decoding is for "[medium-to-low QPS](https://docs.vllm.ai/en/latest/features/speculative_decoding/)... memory-bound workloads," with the gain rated "high" at low query rates and sliding to "medium" as load climbs.

So the speedup you actually see depends on whether you are the only one in the queue. An interactive coding session, a single agent loop, a local model on your own GPU — batch 1, memory-bound, the trick pays in full. A saturated inference endpoint at peak — already compute-bound, the trick barely moves. The same 70B model is "3.5× faster" or "1.4× faster" depending entirely on a number that has nothing to do with the model: the batch size it is being served at.

## So what

Three things for a working engineer.

**Do** treat "faster output, same model" as a literal, checkable claim, not spin. Speculative decoding makes identical-output the default, by rejection sampling, not by luck. If a vendor's fast tier degraded quality, that would be a *different* technique (a smaller model, heavier quantization) — and you can tell the difference, because this one is mathematically incapable of changing the tokens.

**Watch** the acceptance number, α, or its cousin "acceptance length," if a serving stack exposes it. It is the single quantity that predicts your latency win, and it drops with temperature and with how out-of-distribution your prompts are. A drafter tuned on chat will accept less on code, and vice versa.

**Ignore** the headline multiple unless it states the batch size. A "6.5× faster" benchmark at batch 1 and a "1.4× faster" benchmark at batch 64 can describe the exact same system. The honest version of the speedup is a pair of numbers — α and the batch size — and a system that won't tell you the second one is quoting you the best case.

What would change the read: if someone makes speculative decoding pay at high batch — recovers a real multiple at batch 64+ where the GPU is already compute-bound — then it stops being a single-user latency trick and becomes a throughput win for the whole fleet, and the economics of serving change with it. So far the data says that ceiling is firmly in place. The speed is free only while the compute was going to waste anyway.
