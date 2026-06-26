# Distillation Without Logits: Why It Took 28.8 Million Queries

*Deep dive · Marlow Quist (The Analyst) · 2026-06-27 · How training on another model's outputs actually copies it — and why black-box access turns the copy into a volume game.*

Start with the number Anthropic gave the Senate this week: **28.8 million** exchanges with Claude, run through **nearly 25,000** fraudulent accounts, between **April 22 and June 5**, allegedly by Alibaba's Qwen lab ([CNBC](https://www.cnbc.com/2026/06/24/anthropic-alibaba-distillation-campaign.html)). The activity, Anthropic says, "focused on the model's most advanced functions, including software engineering and agentic reasoning."

That number is the whole story, and most of the coverage walked past it. Twenty-nine million queries is not how you steal a secret. It is how you average over the absence of one. The scale of the attack is a direct measurement of what the API would not hand over.

## Two distillations, and the line between them

"Distillation" gets used for two different procedures that share a name and almost nothing else.

The original — Hinton, Vinyals, and Dean, [2015](https://arxiv.org/abs/1503.02531) — trains a small *student* to match a large *teacher*'s full output distribution. Not the teacher's answer. Its **probabilities over every token in the vocabulary**, softened by a temperature `T` so the small numbers stop being rounding error. When a model rates "Paris" at 0.91, "Lyon" at 0.04, and "London" at 0.003, the ratio between those wrong answers encodes what the model knows about the question. Hinton called it the **dark knowledge**. A single softened forward pass carries it. In his MNIST experiment, a student trained *only* on soft targets at temperature 20 — never shown a single hard label — landed within a handful of test errors of the full network.

That is real knowledge transfer, and it is dense. One query, one full distribution, a lot of signal.

The second procedure is what you do when the teacher won't show you its distribution. You prompt it, you keep the text it emits, and you supervised-fine-tune your student on the resulting `(prompt → completion)` pairs. Kim and Rush named it **sequence-level knowledge distillation** in [2016](https://arxiv.org/abs/1606.07947); the literature now just calls it the black-box case. The teacher is "treated as an API: prompted to generate output sequences, which are then used to finetune the student via supervised learning." You are not matching a distribution. You are matching a sample. One path through it, collapsed to a one-hot target — the model's hedges, its second-choices, its calibrated uncertainty, all thrown away the instant it picked a token.

Here is the table that decides the rest of this piece.

| | Soft-target KD (Hinton) | Black-box / sequence-level (API) |
|---|---|---|
| What you copy | full distribution per token | one sampled output sequence |
| Access required | teacher logits / soft targets | output text only |
| Signal per query | vocabulary-wide (dark knowledge) | a single path, collapsed to hard labels |
| Queries to converge | few | many — you average over the missing distribution |
| Defeated by | not exposing logits | nothing technical; only detection + terms |

The two columns are not two flavors of the same attack. They are different bandwidths. And which column you're in is not your choice. It's the teacher's.

## What the labs actually expose

Anthropic's API returns **no logprobs at all** — there is no parameter to ask for them ([community confirms](https://github.com/anerli/anthropic-logprobs); it is absent from the [API surface](https://docs.anthropic.com/en/api/openai-sdk)). OpenAI is more generous and still stingy: `top_logprobs` returns at most the **top 20** tokens per position, never the full ~100,000-entry distribution.

So put the Alibaba campaign in the table. Against Claude, the left column is *physically unavailable*. There are no soft targets to harvest, because the endpoint never emits them. Whatever Qwen's lab was allegedly doing, it was the right column — sampling hard outputs and fitting to them.

Now the 28.8 million reads correctly. With soft targets you can approach the teacher in a few thousand examples, because each one is a wide distribution. With hard samples you are Monte-Carloing that distribution back, one collapsed draw at a time, and the variance only comes down with volume. The 25,000 accounts aren't a detail about fraud. They're the throughput you need to brute-force, through a straw, a signal the straw was built to withhold. **The scale is the receipt for the missing logit.**

This is also why the target was "software engineering and agentic reasoning" specifically. Those are exactly the capabilities where a single correct trajectory — a working diff, a clean tool-call sequence — is a usable training target on its own. You don't need the distribution to learn "this is what a good agent loop looks like." You need a few million examples of one.

## The cost asymmetry that makes it inevitable

Why would anyone run 25,000 fake accounts instead of just training a model? Because the arithmetic is lopsided in a way no terms-of-service clause can fix.

A frontier teacher costs nine figures to pretrain. A black-box student inherits the *behavior* for the price of the samples plus a fine-tune — a rounding error against the teacher's R&D. DeepSeek's R1 was reported to have reached GPT-o1-class reasoning for about **$5.6 million** in compute (a figure that is widely cited and just as widely [disputed](https://www.nbcnews.com/tech/tech-news/openai-says-deepseek-may-inapproriately-used-data-rcna189872) — treat it as order-of-magnitude, not gospel), and OpenAI's response was to allege exactly this mechanism: accounts tied to DeepSeek "developed code to access U.S. AI models and obtain outputs for distillation in programmatic ways," routed through obfuscation to hide the source. Anthropic made the [same accusation](https://www.cnbc.com/2026/02/24/anthropic-openai-china-firms-distillation-deepseek.html) against DeepSeek, Moonshot, and MiniMax in February.

The pattern repeats because the ratio holds. As long as a teacher costs ~100× what it costs to imitate its outputs, someone imitates the outputs. The terms forbid it; the economics fund it; and the gap between those two is where 28.8 million queries live.

## What the license actually protects — and what it can't

Read Anthropic's own [help page](https://support.claude.com/en/articles/12326764-can-i-use-my-outputs-to-train-an-ai-model) and the structure is admirably honest about its own limits. **"You own the Outputs generated from your Inputs."** And: **"Our Terms do not allow the use of Outputs to train models that are competitive with Anthropic's own."** You own the text. You're contractually barred from one use of it.

That is a contract, not a wall. There is no copyright claim doing the heavy lifting here — the output is yours — and there is no technical barrier on a hard sample, because any text a human can read, a trainer can fit to. The right column of my table has an empty "defeated by" cell for exactly this reason: nothing technical stops it. What's left is **detection plus terms plus, now, politics.** Anthropic caught the campaign behaviorally — 25,000 fake accounts and programmatic access patterns are a louder signal than the distillation itself — and the enforcement it's reaching for isn't an injunction. It's a [defense-bill amendment](https://www.cnbc.com/2026/06/24/anthropic-alibaba-distillation-campaign.html), drafted by Sens. Hagerty and Kim, to sanction firms that misuse U.S. model outputs.

Which lands this back on a thread this publication has tracked for a month. You [cannot export-control a model](./deep-dives/2026-06-15-cannot-export-control-a-model.md) once its weights are downloadable; here you cannot contract-control a capability once its outputs are readable. In both cases the artifact the lab can defend (weights, logits) is not the artifact that leaks (capability, behavior). And the leak feeds the open challengers directly: Qwen ships open-weight, so a behavior distilled out of Claude re-enters the commons the next release. The channel, not the model, stays the only contestable thing — and distillation is one more pipe into it.

## So what — and what would change my mind

For a working engineer, three things fall out of the table.

**If you sell a model behind an API, your distillation exposure is set by what you expose.** Logits are the dense leak; if you ship `top_logprobs`, you ship the left column to anyone patient. Anthropic's no-logprobs stance reads, in this light, less like a missing feature and more like a deliberate floor under the bandwidth of any copy. The cost of that choice is real — logprobs are genuinely useful for evals, routing, and confidence scoring — and it is a cost Anthropic is choosing to pay.

**If you build *on* a model, distillation is the cheapest legitimate trick you have — for the uses the terms allow.** The same procedure that's "adversarial" when aimed at cloning Claude is just *training a classifier* when you fine-tune a small open model on Claude-labeled sentiment, categorization, or extraction data — which the terms explicitly permit. The mechanism is neutral; only the target ("competitive with Anthropic's own") makes it a breach.

**Stop reading the scale of these campaigns as a measure of audacity.** It's a measure of inefficiency. A 28.8-million-query attack is what theft looks like when the thing worth stealing was never on the wire — only its shadow was, and you had to collect the shadow a few million times to recover the shape.

The deciding quantity, then, isn't the 28.8 million. It's the **ratio of imitation cost to pretraining cost.** While that sits near 1:100, output-distillation continues no matter what any usage policy says, and the only working defenses are the ones that change the ratio: starve the bandwidth (no logits), or raise the imitation cost (detection, fraud friction, sanctions). What would change my mind is a frontier lab shipping full or wide logprobs on a default path *and* keeping distillation rates flat — that would mean the dense leak doesn't matter and the hard-sample game was always good enough. I'd put that at maybe one-in-five. The straw, on this evidence, is doing its job. The other side just brought 25,000 of them.
