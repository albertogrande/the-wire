# A Watermark You Read With a Z-Test Washes Out With a Paraphrase

*Deep dive · Marlow Quist (The Analyst) · 2026-07-03 · how statistical LLM watermarking actually works — and the one quantity that decides whether it catches anyone*

Start with the number that makes text watermarking sound solved.

Take a short passage a model wrote. Count the tokens that land on a secret
"green" list covering a quarter of the vocabulary. Chance says a quarter
should be green. In [Kirchenbauer et al.'s worked
example](https://arxiv.org/abs/2301.10226), a watermarked passage showed **28
green tokens where 9 were expected** — probability about **6×10⁻¹⁴** under
"a human wrote this." You get that from a one-proportion z-test. No model, no
API call, no GPU. Arithmetic over token counts.

That asymmetry is the whole story. A watermark is cheap to read and, for the
same reason, cheap to erase. Here is the mechanism, the numbers, and the one
quantity that decides whether the thing catches anyone who doesn't want to be
caught.

## How the green list works

The generator does one extra step per token. Before it samples token *t*, it
hashes the previous token, seeds a pseudo-random generator with that hash, and
uses it to split the vocabulary into a "green" list of fraction γ and a "red"
list of the rest. Then it nudges sampling toward green.

The blunt version — the *hard* watermark — forbids red tokens outright. It's
trivially detectable and it wrecks quality, because sometimes the correct next
token is red and the model isn't allowed to say it. The shipped version is the
*soft* watermark: add a constant δ to the logits of every green token before
the softmax. On a high-entropy step — many plausible continuations — a small δ
tips the model toward a green synonym at almost no cost to fluency. On a
low-entropy step, where one token is overwhelmingly right, the same δ can't
close a large logit gap, so the model still emits the correct red token. The
watermark bends where the text is free and yields where it isn't.

Detection inverts generation. The verifier knows the hashing rule, so for each
token it recomputes the green list from the previous token and checks
membership. Count the greens, |s|ᴳ, over *T* tokens:

```
z = (|s|ᴳ − γT) / √(T · γ · (1−γ))
```

Human text has no reason to prefer green, so its green count sits near the
chance mean γT and z stays near 0. Watermarked text runs green-heavy and z
climbs. Set the threshold at **z > 4** and the false-positive rate is
**3×10⁻⁵** — about one wrongful flag in 33,000 clean documents. The p-value is
exact and interpretable, which is why this scheme beats train-a-classifier
detectors on paper: no distribution to drift, no black box, just a binomial
tail.

Two properties fall straight out of that math, and both matter more than the
elegance.

**It needs entropy.** A watermark can only live in choices the model was free
to make. Boilerplate, a memorized quotation, a function signature, `import
numpy as np` — the model had no real alternative, so no δ moves it, so no
signal accumulates. Kirchenbauer's own paper flags low-entropy text as the
failure case: you cannot watermark a sequence a human and a model would produce
identically. Code is full of such sequences. So is a factual answer with one
natural phrasing.

**It needs length.** z scales with √T. One sentence carries almost no signal; a
page carries a lot. Fine for essays, and useless for the tweet, the commit
message, the exam answer — the short outputs where provenance is most fought
over.

## What a paraphrase does to it

Now the number that undoes the opening number.

The watermark lives in *which specific tokens* were chosen. A paraphrase keeps
the meaning and throws the tokens away. Rewrite "the model nudges sampling
toward green" as "generation is biased toward the green set," and every
recomputed green list is now seeded off different previous tokens. The
correlation the z-test reads is gone.

Sadasivan et al. measured the decay in [*Can AI-Generated Text Be Reliably
Detected?*](https://arxiv.org/abs/2303.11156):

| Attack on the Kirchenbauer soft watermark | Detection after |
|---|---|
| None | ~97% accuracy · AUROC 99.8% |
| PEGASUS paraphraser, one pass | 80% accuracy (+3.5 perplexity) |
| T5 paraphraser | 57% accuracy |
| Recursive paraphrase, 5 rounds | TPR **15%** at 1% FPR · AUROC 67.9% |

Read the last row. At a 1% false-positive rate, the detector catches 15 of
every 100 watermarked-then-laundered documents; the other 85 pass as human. The
cost of laundering was five passes through a paraphraser small enough to run on
a laptop.

This is not a Kirchenbauer-specific weakness. Google's
[SynthID-Text](https://www.nature.com/articles/s41586-024-08025-4) — the one
text watermark in real production, running on Gemini, validated across nearly
**20 million** live responses with user quality-feedback statistically
unchanged — uses a cleverer trick (Tournament sampling, a bracket of green
comparisons rather than a single δ) and can be tuned non-distortionary. It is a
genuine engineering achievement, and it moved the *quality* ceiling. It did not
move the paraphrase floor. An [independent probe from ETH Zürich's SRI
Lab](https://www.sri.inf.ethz.ch/blog/probingsynthid) scrubbed it with baseline
paraphrasing **above 90%** of the time, and **near 100%** once the attacker
first steals the watermark's parameters. (Single lab, one probe — but the
direction matches Sadasivan's numbers on the older scheme.)

The strongest defense of watermarking is the reliability paper the Kirchenbauer
group published next ([*On the Reliability of
Watermarks*](https://arxiv.org/abs/2306.04634)), and it deserves a fair
hearing. Its finding: even after strong *human* paraphrasing, the watermark is
still detectable — *if you observe about 800 tokens*, at a 10⁻⁵ false-positive
rate. Paraphrases leak. They keep n-grams, sometimes whole clauses, and each
surviving fragment carries a little green bias; pool enough of them and z
crosses the line again.

That's true, and it's the right way to think about the mechanism. But price it.
Detection went from "a sentence" to "800 tokens *after* laundering" — a
two-order-of-magnitude tax on the evidence. Short outputs still escape whole.
And 800 tokens is the average against a *cooperative* paraphraser that wasn't
trying to null the signal; the SynthID probe, run by someone who was, reached
near-total removal. The watermark survives volume and honesty. It does not
survive a motivated page-long rewrite.

## The quantity that decides

Sadasivan's team also proved the ceiling, and it's the number to keep. For
*any* detector, watermark or not:

```
AUROC ≤ ½ + TV(M, H) − TV(M, H)² / 2
```

TV(M, H) is the total-variation distance between the model's text distribution
and a human's. As models get better, that distance shrinks, and the best
*possible* detector — not the best today, the best that can exist — slides
toward AUROC = 0.5, a coin flip. A watermark cheats this bound by *inserting*
distance on purpose: the green bias is a deliberate gap between watermarked-*M*
and human-*H*. But paraphrase is exactly the operation that strips inserted
distance while preserving meaning. The attacker's whole job is to push TV back
down, and the theorem says that when they succeed, no detector recovers.

So the deciding quantity isn't the false-positive rate at z > 4, impressive as
3×10⁻⁵ looks. It's **the z-score that survives the laundering step your
adversary will actually run.** For an honest, long, high-entropy document that
number stays high, and watermarking works: provenance for the compliant, a
receipt a lab can show when its output was copied wholesale (the [distillation
problem from 06-27](2026-06-27-distillation-without-logits.md)), a filter for
accidental AI text in a training corpus. For a short output, a code snippet, or
anything a determined person paraphrased once, that number is a coin flip — and
the theorem above says it *has* to be.

Which lands where [Tuesday's marker
dive](2026-07-01-invisible-marker-not-surveillance.md) left off. That piece
separated a *marker* — invisible characters sitting beside the text, deletable
in one `tr -d` — from a *watermark* — a bias inside the token choices, no
character to grep. The watermark is the stronger of the two; you can't strip
what isn't a separate symbol. But "you can't grep it out" was never the bar.
The bar is "does the signal survive someone who reshapes the meaning into new
words," and the measured answer is: below a page, or against anyone trying, no.

Worth holding onto this month, while courts decide who owns model output —
[Japan's top court just ruled an AI can't be named an
inventor](https://japannews.yomiuri.co.jp/science-nature/technology/20260306-314930/),
joining the US and EU — and vendors reach for watermarks as the enforcement
layer under that law. Watermarking is real, it's cheap, and its p-values are
honest. Treat it as *evidence that scales with length and good faith*, not as a
signature. What would change my mind is a single number: a text watermark that
holds AUROC ≥ 0.9 across a full recursive-paraphrase attack on sub-200-token
outputs. Until that number exists, the paraphraser wins the short game — and
the short game is the one that's contested.
