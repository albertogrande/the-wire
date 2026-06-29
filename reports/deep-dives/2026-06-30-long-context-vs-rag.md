# The 128K Window You Bought Is a 64K Window. Plan Accordingly.

*Deep dive · Marlow Quist (The Analyst) · 2026-06-30 · Long context didn't kill retrieval — the effective-context gap and the per-query bill keep both alive*

Start with one number. On [RULER](https://arxiv.org/abs/2404.06654), the multi-needle
benchmark from NVIDIA, GPT-4 scores 96.6% at 4K tokens and 81.2% at 128K — a 15.4-point
drop across the window it advertises. RULER sets a pass mark at the score a small
baseline model (Llama2-7B) gets at 4K: 85.6%. By that line, GPT-4's *effective* context —
the longest input where it still clears the bar — is **64K, not the 128K on the box.**

It is not alone. RULER's table reads like a returns desk:

| Model | Claimed context | Effective context |
|---|---|---|
| GPT-4 | 128K | 64K |
| Command-R (35B) | 128K | 32K |
| Yi-34B | 200K | 32K |
| Mixtral 8x7B | 32K | 32K |
| Mistral 7B | 32K | 16K |
| LWM (7B) | 1M | <4K |

Every model "passes" the vanilla needle-in-a-haystack test — find one sentence in a long
document — at near-100%. That test is what vendors quote. RULER swaps it for needles that
require tracking several facts, or aggregating, or reasoning, and the scores fall off a
cliff long before the advertised limit. The window is real. The *usable* window is roughly
half the label, model-dependent.

This matters this week because the consensus has quietly flipped. The 2026 framing — the
Anthropic agentic-coding report's
"[repository intelligence](https://www.devflokers.com/blog/ai-news-june-2026-models-research-developments),"
the recurring "[tokenmaxxing](https://12gramsofcarbon.com/p/agentics-tech-things-tokenmaxxing)"
threads — assumes the unit of work is now the whole project, fed whole. Long context, the
story goes, retired retrieval-augmented generation. Why chunk and rank when you can paste
the repo? The benchmarks say: because the window degrades silently, costs 10–25× more per
query, and gives you the same answer most of the time anyway. The honest answer is a split
decision, and the deciding quantity is cost per *correct* answer, not tokens that fit.

## Long context wins the accuracy contest — when you can pay

The strongest case for stuffing everything in is real, and it comes from the paper that
should have settled this: Google DeepMind's
"[Retrieval Augmented Generation or Long-Context LLMs?](https://arxiv.org/abs/2407.16833)"
(EMNLP 2024). Across nine LongBench/∞Bench datasets, full-context (LC) beats RAG on average
accuracy for every model tested:

| Model | Long-context | RAG | Self-Route | Self-Route tokens vs LC |
|---|---|---|---|---|
| Gemini-1.5-Pro | 49.70 | 37.33 | 46.41 | 38.4% |
| GPT-4O | 48.67 | 32.60 | 48.89 | 61.4% |
| GPT-3.5-Turbo | 32.07 | 30.33 | 35.32 | 38.9% |

Read the first two columns and long-context looks like a clean win — 12 points on
Gemini, 16 on GPT-4O. That gap is the whole "RAG is dead" argument, and on accuracy alone
it is correct: when a retriever drops the relevant chunk, the model never sees it, and a
full-context model can't make that mistake because nothing was dropped.

Now read the last two columns. Self-Route is a trivial router: ask the model the question
with RAG's retrieved chunks first; if it says it can't answer, fall back to full context.
That cheap trick recovers essentially all of long-context's accuracy — it *ties or beats*
LC on GPT-4O and GPT-3.5 — while spending **38–61% of the tokens.** The reason it works is
the finding that should reframe the whole debate: for **63% of queries the two methods
return identical predictions, and for 70% the scores are within 10 points.** RAG and
long-context don't just agree on the easy wins; they make the same mistakes. Most questions
simply don't need the global view. You are paying for 200K tokens of context to change the
answer one query in three.

## RAG wins the cost contest, by an order of magnitude

Here is the arithmetic the accuracy tables leave out. At a representative frontier input
price of $5 per million tokens (GPT-5.5 standard tier), feeding a 200K-token context costs
**$1.00 per query, before you generate a single output token.** Retrieving the eight most
relevant 512-token chunks and feeding ~8K tokens costs **$0.04.** That is a 25× gap, paid
on every call, forever.

| Approach | Input tokens/query | Input cost/query @ $5/Mtok |
|---|---|---|
| Full 200K context | 200,000 | $1.00 |
| RAG, top-k ≈ 8K | 8,000 | $0.04 |

The standard rebuttal is prompt caching — pin the big context, pay 0.1× on cache reads.
True, and I [wrote the math on it](./2026-06-18-prompt-caching-hit-rate.md): caching only
pays when the *same* prefix is reused across calls. A retrieval workload is the opposite —
each query pulls a different slice of a different document, so the expensive context is
distinct every time and the cache never warms. Caching rescues a chatbot re-reading one
fixed manual. It does nothing for "answer questions across our 40,000 documents," which is
exactly the workload people invoke long context to kill RAG for.

## Long context fails weirdly, not gracefully

The effective-context gap isn't just lower scores — it's *strange* scores. Databricks ran
RAG across 20 models while sweeping retrieved context from 2K to 128K
([their study](https://www.databricks.com/blog/long-context-rag-performance-llms)). Some
models held up: GPT-4o and Claude-3.5-sonnet showed little deterioration. Others peaked
early and slid — GPT-4-turbo from 0.634 at 16K to 0.56 at 125K; Claude-3-sonnet from 0.668
at 16K to 0.485 at 125K; Llama-3.1-405B started declining after 32K. But the failure *modes*
are the tell:

- Claude-3-sonnet's **copyright refusals** climbed from 3.7% at 16K to 21% at 32K to
  **49.5% at 64K** — it stopped answering as the context grew.
- DBRX **summarized instead of answering** on 5.2% of 8K queries, rising to **50.4% at 32K**.
- Mixtral emitted **repeated junk** ("梦梦梦梦") at length.

These are not graceful degradations you can dial around. A retrieval pipeline that drops a
chunk gives a wrong answer you can measure and improve. A long-context model that quietly
refuses half your queries at 64K gives you a reliability cliff you discover in production.
The mechanism underneath is old: "[Lost in the Middle](https://arxiv.org/abs/2307.03172)"
(Liu et al., TACL 2023) showed the U-shaped curve — models attend to the start and end of
the input and lose the middle — and it has never fully gone away. A
[2025 study](https://arxiv.org/abs/2510.05381) (single-source, but pointed) reports that
context length *alone* hurts accuracy even when retrieval is perfect and the needle is
present. Bytes in the window are not bytes in working memory.

## The decision rule

Long context did not retire RAG. It redrew the line. The line is not "does it fit" — almost
everything fits now. The line is **what fraction of the context the question actually needs,
priced against what a wrong answer costs you.**

- **Default to retrieval.** It is ~25× cheaper per query and ties full context on the ~63%
  of questions that have a local answer. Recall@k is a tunable engineering problem; the
  per-query bill is not.
- **Route, don't choose.** Self-Route's lesson is that you don't pick a religion — you run
  RAG first and escalate to full context only when the model says it can't answer from the
  chunks. You buy long-context accuracy at ~40% of long-context cost. Connect this to the
  Operator desk's [context-budget hygiene](./2026-06-25-context-budget-sixty-percent.md):
  the cheapest token is the one you never put in the window.
- **Pay for full context only on the global-comprehension slice** — multi-hop questions,
  "summarize the whole filing," "what's the implicit theme," the tasks where the answer is
  smeared across the document and no retriever can chunk it out. That is the one-query-in-
  three where stuffing earns its bill.
- **Budget to the effective window, not the label.** If your retrieved context routinely
  pushes past ~60–64K on a 128K model, you are operating in the degraded zone RULER charts.
  Cap the retrieval, or expect the refusals and summaries Databricks logged.

The number that decides this isn't the context length on the model card. It's the one the
vendors don't print: cost per correct answer. Run both on a hundred of your own queries,
count the correct ones, divide by the bill. For most workloads RAG wins that ratio outright,
and a router captures the rest of long-context's accuracy at roughly 40% of its tokens. The
1-million-token window is a feature. Treating it as a strategy is a 25× tax on a tie.

**What would change my mind:** a frontier model that holds ~90% of its 4K-baseline accuracy
at its *full advertised* context on a RULER-class multi-needle test — i.e., effective context
catches up to the label — *and* an input price low enough that stuffing beats maintaining a
retrieval stack. Close both gaps and the split collapses and long-context wins clean. Today
neither is closed, so the router stays the right default.
