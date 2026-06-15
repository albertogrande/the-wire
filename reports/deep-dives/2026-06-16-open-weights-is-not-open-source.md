# The Open Model You're Running Is a Binary, Not a Source

*Deep dive · June Okafor (The Contrarian) · 2026-06-16 · "Open" tells you almost nothing about an AI model; the license — and whether it caps you — tells you the rest.*

Here is the consensus everyone repeats this week. The closed labs are wobbling — Anthropic's top models got [switched off by export control](./2026-06-15-cannot-export-control-a-model.md), the subscription split landed, and the hot HN thread today is ["has anyone replaced Claude with a local model for daily coding?"](https://news.ycombinator.com/item?id=48531000) (540 points, 277 comments). Meanwhile [OpenCode passed Claude Code on GitHub stars](https://www.abhs.in/blog/opencode-160k-github-stars-7-5m-developers-ai-coding-agent-june-2026) — 160K to 122K, 7.5M monthly devs, MIT-licensed. So the move is obvious: go open source. Download the weights. Now the model is yours, it's free, and no one can take it away.

I want to give that its full strength before I take it apart, because most of it is true. Qwen3's dense models ship under [Apache 2.0](https://qwenlm.github.io/blog/qwen3/). DeepSeek-R1's weights are [MIT](https://ollama.com/library/deepseek-r1), and DeepSeek explicitly says you may use them commercially, modify them, and even distill them to train your own model. For a model under one of those two licenses, the freedom is real and close to total: self-host it, fine-tune it, ship it in a product, sell that product, and never ask anyone for permission. No meter. No kill switch. For the export-control reader, that is the whole point — an Apache-2.0 model on your own hardware is the copy political weather cannot delete. For nearly every engineer reading this, those rights are all the freedom they will ever actually exercise.

And yet "open source" is doing two jobs in that sentence, and hiding the seam between them. My counter-thesis is plain. **Almost everything sold as "open source AI" is open-*weight*, not open-source — you got the binary, not the source. And "open-weight" splits again by license, from genuinely unrestricted to capped-at-the-vendor's-discretion. So the question that tells you what you're allowed to do is never "is it open." It is "which license, and does it restrict me." Read the LICENSE file, not the press release.**

Two claims sit under that. Take them in order.

## "Open" is not one license — it's a spectrum, and one end has a leash

Line up the models people call "open" and read what each license actually grants. They are not the same document, and the differences are the ones that bite.

| Model | License | The catch |
|---|---|---|
| Qwen3 (dense) | Apache 2.0 | None of consequence — standard OSI-approved permissive license |
| DeepSeek-R1 | MIT | None; distillation explicitly permitted |
| Kimi K2 | "Modified MIT" | Display "Kimi K2" in your UI *if* you exceed 100M MAU or $20M/mo revenue |
| Llama 4 | Llama Community License | 700M-MAU hard cap, Acceptable Use Policy, EU limits, mandatory "Built with Llama" badge |

The top of that table is true open source in the only sense that matters legally: [Apache 2.0 and MIT](https://huggingface.co/blog/daya-shankar/open-source-llms) impose no restriction on who uses the model, for what, or at what scale. The bottom is something else wearing the same word.

Kimi K2 is the interesting middle. Moonshot calls it a ["Modified MIT License,"](https://github.com/moonshotai/Kimi-K2/blob/main/LICENSE) and for an individual, a homelab, or any normal business it behaves exactly like MIT — until "the software or any derivative product serves over 100 million monthly active users or generates over 20 million US dollars per month in revenue," at which point "you shall prominently display 'Kimi K2' on the user interface." That is a light leash. But it is a leash, and it is not in standard MIT. The word "MIT" on the tin is doing reassurance the license text walks back.

Llama is where the gap stops being subtle. The [Llama 4 Community License](https://www.llama.com/llama4/license/) caps you: cross 700 million monthly active users and you must "request a license from Meta, which Meta may grant in its sole discretion." It binds you to an [Acceptable Use Policy](https://www.byteplus.com/en/topic/577652) — a list of fields of endeavor you may not use the model for. And it makes you wear a "Built with Llama" badge. The Open Source Initiative, which wrote the definition of the term, has said plainly and repeatedly that [this is not open source](https://opensource.org/blog/metas-llama-license-is-still-not-open-source): it "fails at the Open Source Definition point 5, discriminates against users" and "point 6, restricts fields of endeavour." The OSI's word for what Meta is doing is *open-washing*.

So "open" tells you nothing until you have read which license. The same adjective covers a model you can do anything with and a model whose vendor reserves the right to revoke your scale at its sole discretion. An engineer who picks on the strength of the word "open" has read the marketing, not the grant.

## Even the genuinely-free ones aren't "open source" — they're open *weights*

Now the deeper half, the one that catches even Apache-2.0 purists.

Suppose you pick Qwen3 or DeepSeek-R1 — clean license, no cap, no AUP. Is *that* "open source AI"? By the only formal definition anyone has agreed on, no. Last year the OSI published the [Open Source AI Definition 1.0](https://opensource.org/ai/open-source-ai-definition), and to qualify, a model has to release three things: the weights, the **complete source code** used to train and run it (data-processing code, training code with hyperparameters, inference code, architecture), and **data information** — "sufficiently detailed information about the data used to train the system so that a skilled person can build a substantially equivalent system."

Notice what OSAID is willing to compromise on and what it isn't. It does *not* require shipping the raw training set — that was the concession that got the definition out the door, and the [reason critics said it was watered down](https://www.hpcwire.com/bigdatawire/2024/10/28/osi-open-ai-definition-stops-short-of-requiring-open-data/). But it still demands enough description of the data, plus the actual training code, that someone else could rebuild a substantially equivalent model. That is the line between a binary and a project. You can compile from source; you cannot compile from a press release.

Almost no frontier model clears it. Qwen and DeepSeek and Kimi ship the weights and a technical report. They do not ship the training corpus, the filtering pipeline, or a recipe complete enough to reproduce them. So what you downloaded — even under spotless Apache 2.0 — is a few hundred gigabytes of trained floating-point coefficients. A binary. You can run it, fine-tune it, quantize it, serve it. You cannot rebuild it, you cannot fully audit how it was made, and you cannot know what is baked into it, because the source of a model is its **data and its training recipe**, and that is exactly the part that stays closed.

This is not pedantry. The "source" you don't get is the part you need precisely when it matters most:

- **Provenance and compliance.** If a regulator, a customer, or a court asks what the model was trained on, the weights cannot answer. The training data is the answer, and you don't have it. The labs don't ship it because the training data is the [copyright liability](https://www.theregister.com/2024/10/25/opinion_open_washing/) and the competitive moat at the same time — the two strongest possible reasons to keep something closed.
- **Reproducibility.** "Open source" in normal software means anyone can rebuild the artifact from what's published. No one outside the lab can rebuild Qwen3 from what Alibaba published. The thing that makes open source *open source* — independent reconstruction — is missing.
- **Real auditing.** You can probe a binary's behavior. You cannot read its construction. Bias, memorized secrets, a poisoned slice of training data: open weights let you observe symptoms, never inspect the cause.

So there are two reductions stacked on top of each other, and the marketing word hides both. "Open source AI" almost always means "open-weight." And "open-weight" then splits, by license, into "you can really do anything" and "you can do things until we say stop." Strip the word away and you are left with two questions that actually have answers: *which license, and does it restrict me.*

## So what, on Monday morning

This is not an argument against open models. I run them; the export-control logic that makes a self-hosted Apache-2.0 model your dial-tone is [sound](./2026-06-15-cannot-export-control-a-model.md). It is an argument against reading the word instead of the document. Concretely:

**Open the LICENSE before you build, and ask three questions.** Is it a standard OSI license (Apache 2.0 / MIT) or a custom "community" license? Is there a restriction on scale, field, or geography (an MAU cap, an Acceptable Use Policy, an EU exclusion)? Does it impose branding or attribution, and at what threshold? For Qwen3 the answers are *standard / none / none*. For Llama they are *custom / yes-cap-plus-AUP-plus-EU / yes-badge*. Those are different products. Treat them as different products.

**For continuity, prefer Apache 2.0 or MIT, self-hosted.** If the reason you're holding an open model is that it can't be switched off under you, a discretionary scale cap is a switch — held by the vendor instead of by Commerce, but a switch. The strongest hedge is a permissively-licensed model on hardware you control.

**Don't confuse "I can run the weights" with "I can audit or reproduce the model."** If you need to know what's in the training data — for compliance, provenance, or a courtroom — open weights do not give you that, no matter how permissive the license. That gap is the whole reason OSAID exists.

**Mind the distillation clause now that it's load-bearing.** Training on a model's outputs is governed by its license, not its weights. MIT/Apache models like DeepSeek-R1 [permit distillation](https://huggingface.co/blog/daya-shankar/open-source-llms) outright; Kimi's attribution trigger and Llama's derivative-naming rules are the kind of clause that bites a team building on top. The license is the thing that reaches your codebase, not the gigabytes.

## What would prove me wrong

One clean test. If a frontier lab ships a genuinely OSAID-complete model at the top of a major agentic benchmark — weights *plus* data information *plus* full training code, under a standard OSI license — then "open source AI" would finally mean what the words say, and my "read the license, it's really only open-weight" framing collapses into "it's just open source, like any other software." I would also revise if the big "community" licenses converge on Apache/MIT — if Meta drops the 700M cap and the AUP.

I put low odds on either inside twelve months, for a structural reason, not a cynical one: the training data is simultaneously the legal liability and the competitive moat, so every incentive points at releasing the binary and keeping the source. Until that changes, "open source AI" is a binary you can run — and the only sentence that tells you what you may *do* with it is the one in the LICENSE file, not the one in the blog post.

**Prediction (80% confident):** By 2027-Q1, no model ranked in the top tier of a major agentic benchmark (SWE-bench / MCPMark / Terminal-Bench or successor) ships meeting OSAID 1.0 in full — weights, data information, and complete training code under an OSI-approved license. Releases marketed as "open source AI" remain open-weight-only. If one clears that bar, this framing needs rewriting and I'll say so.
