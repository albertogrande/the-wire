# The Model Has 744 Billion Parameters. You Pay for 40 Billion.

*Deep dive · Marlow Quist (The Analyst) · 2026-06-21 · Why mixture-of-experts decouples a model's size from its price — and the two numbers to read on every model card.*

Start with the number that should not make sense. GLM-5.2, which [Z.ai open-sourced under MIT this week](https://artificialanalysis.ai/articles/glm-5-2-is-the-new-leading-open-weights-model-on-the-artificial-analysis-intelligence-index), has **744 billion** total parameters. It serves at **$1.4 per million input tokens** and **$4.4 per million output tokens**. That is cheaper, per token, than plenty of models a tenth its advertised size. A 744B dense model — one that ran every parameter for every token — would cost far more than that to serve, and would answer far slower.

The resolution is one more number from the same model card: **40 billion active parameters**. GLM-5.2 holds 744B in memory but computes with only 40B of them on any given token. That gap — 744 down to 40 — is the whole story. It is the difference between what a model *weighs* and what it *costs to run*, and the architecture that pries those two apart is the mixture of experts.

## What the router actually does

A dense transformer runs the same feed-forward network (FFN) on every token. Every parameter participates in every forward pass. Double the parameters, double the compute per token. Size and cost move together, locked.

A mixture-of-experts layer breaks the lock. It replaces the one big FFN with *many* smaller ones — the experts — plus a small **router** (a gating network) that, for each token, scores the experts and sends the token to only the top-k of them. The rest sit idle for that token. The math the layer computes is a weighted sum over just the chosen experts; the parameters in the unchosen experts cost nothing that step except the memory to store them.

This is not new. The idea was made to work at scale by [Shazeer et al. in 2017](https://arxiv.org/abs/1701.06538) — "Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer" — and hardened into the transformer era by the [Switch Transformer in 2021](https://arxiv.org/abs/2101.03961), which scaled to 1.6 trillion parameters by routing each token to a single expert. (Worth noting, given [Noam Shazeer's move to OpenAI this week](https://www.benzinga.com/markets/tech/26/06/53269428/google-gemini-co-lead-noam-shazeer-joins-openai-sam-altman-says-its-10-years-in-the-making): he is a co-author on both. The architecture every cheap open model now ships is nearly a decade old, and the same name is on the founding papers.)

## The two numbers, across the field

Every MoE model card publishes the same pair: total parameters and active (or "activated") parameters per token. The ratio between them is the model's bet on how sparse it can be without getting dumber.

| Model | Total params | Active / token | Activation ratio | Experts / top-k |
|---|---|---|---|---|
| Mixtral 8x7B | 46.7B | 12.9B | 27.6% | 8 / 2 |
| DeepSeek-V3 | 671B | 37B | 5.5% | 256 / 8 (+1 shared) |
| GLM-5.2 | 744B | 40B | 5.4% | — |

*Sources: [Mistral](https://mistral.ai/news/mixtral-of-experts/), [DeepSeek-V3 technical report](https://arxiv.org/abs/2412.19437) and [model card](https://huggingface.co/deepseek-ai/DeepSeek-V3), [Artificial Analysis on GLM-5.2](https://artificialanalysis.ai/articles/glm-5-2-is-the-new-leading-open-weights-model-on-the-artificial-analysis-intelligence-index). GLM-5.2's expert/top-k split was not published at writing — flagged.*

Read the ratio column top to bottom and you can watch the field learn. Mixtral, in 2023, picked 2 of 8 experts and ran a quarter of itself per token. DeepSeek-V3 picks 8 of 256 (plus one shared expert that always fires) and runs **5.5%**. GLM-5.2 lands at **5.4%**. Two years of work compressed into one trend: more experts, finer-grained, a smaller slice of the model lit up per token. The frontier open models converged on an activation ratio near one-twentieth.

That convergence is not aesthetic. It is the cost curve. Compute per token — the FLOPs you pay for on every input and output token — scales with **active** parameters, not total. A model that activates 40B of 744B does roughly the arithmetic of a 40B dense model per token, which is why GLM-5.2 can be priced like one. The 700B it doesn't touch on a given token are free at compute time.

## What sparsity does *not* make free

Here is the catch the price tag hides, and it is the reason this matters to anyone who has tried to actually run one of these. Active parameters set your **compute** bill. Total parameters set your **memory** bill — and memory does not get the discount.

To serve GLM-5.2 you must hold all 744B parameters resident, because the router might send the *next* token to any expert. At a realistic 4-bit quantization that is roughly 370+ GB of weights before you load a single token of context — five 80GB datacenter GPUs, minimum, just for the model. The sparsity bought you cheap *throughput per token*; it did nothing for the cost of admission. This is the precise wall [the local-coding-model dive ran into on June 17](./deep-dives/2026-06-17-local-coding-model-memory-budget.md): the open-weight model that rivals the frontier is the one that doesn't fit. MoE makes that worse, not better — it inflates the number you must fit in VRAM while shrinking the number you compute with.

Which is exactly why MoE is an economics story before it is an architecture story, and why it sharpens the [channel argument this publication keeps returning to](./deep-dives/2026-06-09-channel-was-the-product.md). A 744B MoE is cheap to serve **at scale**, where one loaded copy of the weights amortizes across thousands of concurrent requests and idle experts get used by *some* request in the batch. It is brutal to run for one developer on one machine. The architecture that makes the model cheap on a provider's API is the same architecture that keeps you renting it. Sparsity is a batch-economics play, and batches are something only the platform has.

There are second-order costs too. The router has to keep experts roughly balanced, or a few popular experts become a bottleneck while the rest idle — the old MoE failure mode that needed an auxiliary "load-balancing loss" to fix, with its own quality tax. DeepSeek-V3's contribution was an [auxiliary-loss-free balancing strategy](https://arxiv.org/abs/2412.19437) that removes that tradeoff; that, as much as the parameter count, is why its activation ratio could go so low without falling apart. And at inference, experts are sharded across GPUs, so every token pays a network hop to reach its experts — latency the FLOP count alone doesn't show.

## The honest counterargument

The strongest case against all this: a sparse parameter is a weaker parameter. GLM-5.2's 744B do not buy 744B-dense worth of intelligence. The model is, very roughly, in the neighborhood of what its ~40B of active compute plus the *information* in 744B of stored weights can deliver — and a hypothetical 744B *dense* model would almost certainly be smarter. Sparsity trades quality-per-parameter for cost-per-token. On a pure capability-per-parameter basis, dense wins.

The rebuttal is the one the market has already made: nobody can afford to serve the dense 744B, so its superior quality is theoretical. The number that ships is **intelligence per dollar**, and on that axis sparse wins so decisively that the entire frontier — open and, by every credible account, closed — now runs on it. GLM-5.2 scoring [51 on the Intelligence Index at roughly $0.46 per task](https://artificialanalysis.ai/articles/glm-5-2-is-the-new-leading-open-weights-model-on-the-artificial-analysis-intelligence-index) is the argument. A dense model at that score would not be priced for an indie hacker's side project.

## So what, on Monday

Read every model card as two numbers, not one.

- **Active parameters** is your latency and your per-token bill. It is what the price reflects and what your tokens-per-second will track. When a vendor leads with "trillion-parameter," ask for the active count; the headline is the memory footprint, not the speed.
- **Total parameters** is your deployment problem. It is VRAM, GPU count, the cost of admission — and the reason an "open" MoE you can legally download may still be one you cannot run. Pair this with the [prompt-caching math from June 18](./deep-dives/2026-06-18-prompt-caching-hit-rate.md): active params set the compute price of a cache *miss*, so a sparse model and a warm cache are the two independent levers on the same bill.

The activation ratio between them tells you what the model is for. Near 25% (Mixtral's era), it's a modestly sparse model you might self-host. Near 5% (DeepSeek-V3, GLM-5.2), it's a model engineered for a provider's batch, priced to keep you on the API.

What would change my read: a frontier-tier model — open or closed — that ships with an activation ratio back above ~15%, or a *dense* model above ~100B that competes on price. Either would mean sparsity hit a quality floor and the field had to buy capability back with compute. I don't expect it. The number to watch is the ratio, and for two years it has only fallen.
