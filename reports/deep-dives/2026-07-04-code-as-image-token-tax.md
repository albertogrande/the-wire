# The 60% Discount for Imaging Your Code Is a Lossy Compression Bet

*Deep dive · June Okafor (The Contrarian) · 2026-07-04 · why encoding source as PNGs to dodge text-token pricing trades a token cut for silent errors on the exact characters code depends on*

Here is the claim everyone repeated on Hacker News this week. Text tokens are
expensive. Image tokens are cheap. So render your source files as pictures,
send those instead, and let the model read them back with OCR. [pxpipe](https://github.com/teamchong/pxpipe)
does exactly this — a local proxy that wraps your context into PNGs before it
hits the API — and it posts a headline number to match: **59–74% off** your
Fable 5 bill, 215 points and climbing. The framing is a jailbreak. You found a
pricing seam. The meter charges by the text token, images are billed on a
different, cheaper schedule, and you just arbitraged the gap.

The steelman is real, so let me make it at full strength before I break it.
Token bills genuinely hurt right now. [Sonnet 5 shipped at $2/$10 per Mtok](https://www.anthropic.com/news/claude-sonnet-5)
this week and [Fable 5 came back into Claude Code](https://www.anthropic.com/news/redeploying-fable-5)
the day after; text input is the line item that scales with everything you do.
And optical compression is not a crank idea. [DeepSeek-OCR](https://arxiv.org/html/2510.18234v1)
is a serious 2025 research direction built on exactly this premise: a page of
text carries less information than its character count implies, so you can pack
it into far fewer *vision* tokens and read it back. On Anthropic's own
high-resolution tier, [a single image is capped at 4,784 visual tokens](https://platform.claude.com/docs/en/docs/build-with-claude/vision)
no matter how much text you cram onto it. Put those two facts together and the
hack looks not just clever but inevitable: of course you'd trade a 40,000-token
text block for a 2,700-token picture of the same block.

So the consensus isn't stupid. It's just measuring the wrong thing.

## Image tokens are not cheaper. They're compressed.

Start with the pricing, because the whole "arbitrage" story rests on a mistake
about it. Anthropic does **not** charge a lower per-token rate for visual
tokens. [The docs are explicit](https://platform.claude.com/docs/en/docs/build-with-claude/vision):
Claude views an image in 28×28-pixel patches, each patch is one visual token,
the cost is `⌈width/28⌉ × ⌈height/28⌉` tokens, and to get a dollar figure you
"multiply the token count by the per-token price of the model" — the same
per-token price as text. There is no cheaper schedule. A visual token and a
text token cost the same.

What changes is how much text rides on each token. pxpipe wraps at 1928-pixel
columns and claims a dense page holds ~48,000 text tokens' worth of content in
~2,700 image tokens. That second number isn't marketing — it checks out against
the primary source. A 1928-pixel-wide image is ⌈1928/28⌉ = 69 patches across; a
1920×1080 image costs 69×39 = **2,691 visual tokens**, which is exactly the
figure in Anthropic's own cost table. So the picture is real and the token count
is real. The "60% discount" is real too.

But now name what it actually is. 48,000 text tokens rendered into 2,691 visual
tokens is a **17.8× compression ratio**. You did not find a pricing loophole.
You bought lossy compression and paid for it in fidelity. And the moment you
call it compression, the OCR literature tells you exactly what you traded.

## The compression ratio that saves 60% is the one that loses characters

This is the part the "arbitrage" framing hides. Optical compression has a
fidelity curve, and it is steep. DeepSeek-OCR measured it on the Fox benchmark:
at **10× compression, decoding precision is ~97%**; push to **20×, and it falls
to ~60%**. The steepest drop is between 10× and 20×. That's the regime where
near-lossless text recovery stops being a safe assumption.

Look at where pxpipe operates. **17.8×.** Not near the safe 10× shoulder — deep
in the 10-to-20× fall-off, closer to the 60% end than the 97% end. The savings
and the damage are not two separate dials. They are the *same dial*. The reason
imaging your code cuts 60% of the tokens is precisely the reason it starts
dropping characters: you shrank the text until each glyph rides on almost no
pixels, and the model has to guess.

| Compression (text tok ÷ vision tok) | Fidelity (DeepSeek-OCR, Fox) |
|---|---|
| ~10× | ~97% |
| ~18× (pxpipe's operating point) | between — falling |
| ~20× | ~60% |

pxpipe's author knows this, to their credit, and the README says so out loud.
Their own test: exact 12-character hex strings inside dense imaged content came
back **0 out of 15 on Opus, 13 out of 15 on Fable 5**. The instruction is to
"keep byte-critical data — IDs, hashes, secrets — in text." Which is a
remarkable thing to have to write under a tool whose whole pitch is *put your
content in images*. (Those recall figures are the tool's own, single-sourced to
its README; I'd want an independent run before betting a pipeline on them.)

## For code, the loss mode is the worst one there is

Here's why "keep the exact values as text" quietly repeals the pitch when the
content is source code.

Prose degrades gracefully. If the model reads "the quick brown fox" as "the
quick brwon fox," a language model's error-correction on coherent text — [the
thing that makes VLM-OCR beat dedicated OCR on real sentences](https://www.f22labs.com/blogs/ocr-vs-vlm-vision-language-models-key-comparison/)
— silently repairs it, and the meaning survives. That's the workload optical
compression was built for: documents you need the *gist* of.

Code is the opposite workload. A variable named `user_idx` is not
error-correctable into `user_id`; they're different symbols and one is a bug. A
hash, a version pin, an env-var name, an API key, a hex constant, an off-by-one
literal — these are high-entropy strings with no linguistic prior for the model
to lean on, which is exactly the case where [dedicated OCR beats the language
model](https://medium.com/@mohnisha/ocr-vs-llm-based-text-extraction-0c0757531aed)
and the language model confabulates. And the failure is **silent**. The model
doesn't return an error. It returns confident, plausible, wrong text —
`0/15` on the hex strings, with no flag that it guessed. You get a diff that
looks right and a build that fails, or worse, one that doesn't.

So the counter-thesis, stated plainly: **imaging your source is a discount on
the wrong axis.** It cuts cost per token on a workload whose real metric is cost
per *correct* answer, and for code the two move in opposite directions. The 60%
you save on tokens buys you a nonzero rate of undetectable character errors in
the one kind of content that can't absorb them. On prose you'll never notice. On
code you'll notice in production.

## What the framework actually is

Strip the arbitrage story and here's the durable rule, which will still hold
when this week's tool is forgotten:

**Optical compression is a real technique with a real ceiling, and the ceiling
is set by how precisely the model must read the tokens back.** It's the mirror
image of the [long-context-vs-RAG tradeoff](2026-06-30-long-context-vs-rag.md)
and the [caching bet](2026-06-18-prompt-caching-hit-rate.md): a genuine token
win that only pays on the slice of your context where approximate recall is
fine. Bulk documentation the model needs to skim — compress it, image it, 10×
is safe and the gist survives. Anything you need read *character-exact* — code,
config, identifiers, secrets — keep as text, because there the compression
ratio that saves you money is the same ratio that corrupts the answer.

The tell that this is a workaround and not a feature: it exists only because
text tokens are [priced the way they are](2026-06-28-price-cut-is-a-weapon.md).
The moment the token bill bites, users route around it — pxpipe, [encoding
tricks, the whole emerging arms race](../2026-W27.md) between model pricing and
client-side hacks. That pressure is legitimate. But routing around a price by
degrading fidelity isn't free; it just moves the cost from a line item you can
see to an error rate you can't.

## So what, Monday morning

Don't image your source to save tokens. The savings are real and the bugs are
silent, and for code that's a bad trade at any discount.

Do reach for optical compression where it belongs: large, low-stakes reference
prose the model only needs the shape of, at conservative ratios near 10×, never
18×. And keep every exact string — IDs, hashes, versions, code, secrets — as
text, always, even inside an otherwise-imaged block. That's not a pxpipe caveat.
It's the shape of the technique. If you're going to spend engineering effort on
the token bill, spend it on the [context you're carrying at all](2026-06-25-context-budget-sixty-percent.md);
that lever moves cost *and* accuracy the same direction, which imaging never
will.

**What would change my mind:** show me a client-side imaging layer that holds
**≥99% exact-string recall on code** — not prose — while still cutting tokens
more than half, i.e. one that escapes the compression-fidelity curve instead of
riding down it. Or show me a provider that prices a text-in-image path *below*
its text tokens, turning this from a lossy compression bet into a genuine
pricing arbitrage. Until one of those exists, "render your code as a picture" is
a way to pay less for answers you can trust less — and on code, trust is the
whole product.
