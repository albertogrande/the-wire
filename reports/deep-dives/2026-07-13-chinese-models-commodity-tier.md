# Nobody Chose to Run Chinese AI. The Invoice Did.

*Deep dive · 2026-07-13 · Chinese open-weight models now serve nearly half of US enterprise tokens. The reason is boring, the export playbook can't reach it, and you are probably already running them.*

Here is a number that should reset how you think about your model stack: **46%**.

That is the weekly peak share of US enterprise token usage running on Chinese-origin AI models by mid-2026, [according to a CNBC investigation](https://www.cnbc.com/2026/07/07/chinese-ai-models-costs-us-openai-anthropic.html) built on OpenRouter data. Not 46% of experiments. Not 46% of hobbyist traffic. Enterprise API tokens, on the platform where a large slice of commercial LLM traffic is routed. A year ago the figure averaged 11%. In the first half of 2025 it was 4.5%. Since February 8, 2026, it has not dropped below 30% in any week. The single largest vendor on the platform, by routed tokens, is not OpenAI or Anthropic or Google. It is DeepSeek.

For a month this publication has argued that frontier AI is commoditizing — that [the open-weight floor is structural](./2026-06-16-open-weights-is-not-open-source.md), that [a price cut is a strategic weapon](./2026-06-28-price-cut-is-a-weapon.md), that [you cannot export-control a model](./2026-06-15-cannot-export-control-a-model.md). Those were arguments. This is an invoice. The commoditization is no longer a forecast about where the market is heading. It is a line item in what US companies already spend, and the money has already voted.

This piece is about what that number actually means — where it overstates and where it understates — why the US government's entire playbook is aimed at the wrong layer, and what you, building on these tools, should do about the models you are very likely already running without having decided to.

## How the gap closed

The through-line is eighteen months old and it runs on one variable: price.

The [DeepSeek moment](https://openrouter.ai/state-of-ai) of early 2025 established the pattern — a Chinese lab shipped an open-weight model that was cheap, good enough, and downloadable. What has happened since is not a single upset but a grind. Every few months a new open-weight release from a Chinese lab narrows the felt gap to the frontier while pricing 60–90% under it. [DeepSeek V4 Flash lists at $0.14](https://www.cnbc.com/2026/07/07/chinese-ai-models-costs-us-openai-anthropic.html) per million input tokens. OpenAI's GPT-5.5 lists at $5.00. That is not a discount. That is a different category of thing.

Last month's [GLM-5.2 from Z.ai](https://martinalderson.com/posts/the-upcoming-ai-margin-collapse-part-1-glm-5-2/) is the sharpest instance. MIT license, million-token context, benchmarks near proprietary systems on long-horizon coding and agentic work. On the Z.ai API it runs $1.40 input / $4.40 output per million; because the weights are open, third-party hosts price it lower still, roughly $0.73–1.05 input. It saw the fastest adoption of any model Vercel tracked in 2026 — daily token volume up about 27×, customer count up about 80×, in its first full week. That is not a lab winning a benchmark. That is a market clearing.

The composition of the 46% tells you it is not one fluke model, either. [DeepSeek holds ~17.6% of OpenRouter's routed tokens](https://www.cnbc.com/2026/07/07/chinese-ai-models-costs-us-openai-anthropic.html) — around 5.13 trillion weekly, the largest of any single vendor. Alibaba's Qwen follows near 13.9% (~2.77 trillion). Moonshot's Kimi and Z.ai's GLM are doing much of the recent pulling. (The exact per-vendor splits come from a single investigation reading one platform's data; treat the precise decimals as directional.) When four independent labs from one country hold a plurality of a commercial platform's tokens, you are not looking at a moment. You are looking at a supply curve.

## What the number gets right, and where it lies

A good rule with a shocking statistic: find where it overstates before you repeat it.

**OpenRouter is not the whole enterprise.** It is an aggregation platform with a developer-heavy user base. [Its own methodology notes](https://arxiv.org/html/2601.10088v1) that region is inferred from billing location, that enterprise accounts may aggregate activity across regions, and that usage on proprietary infrastructure outside the platform is not captured. A Fortune 500 company running Claude through a private Bedrock deployment does not show up here. So "46% of US enterprise tokens" is really "46% of the tokens routed through one large, developer-skewed commercial aggregator, in the peak week." The true enterprise-wide share is probably lower.

**Tokens are not dollars, and they are not value.** Chinese open models are cheap, which means a token of them costs a fraction of a frontier token. Share-of-tokens massively overweights them versus share-of-revenue or share-of-load-bearing-work. And the workloads that migrate first are the cheap, high-volume, error-tolerant ones — classification, bulk extraction, first-draft generation, internal tooling — not the ones where a wrong answer is expensive. The hard, long-horizon, customer-facing slice tends to stay on the frontier. GLM-5.2, for all its adoption, still ships [with no native vision, slower interactive latency, and excessive thinking tokens](https://martinalderson.com/posts/the-upcoming-ai-margin-collapse-part-1-glm-5-2/) that inflate the real cost. "Close enough" is doing real work in that sentence, and it is not the same as "as good."

**And it is a peak, not a plateau.** 46% was the high-water week. The durable floor is ~30%. That is still an extraordinary number — a non-US supply base holding a third of a commercial platform's tokens against the most heavily capitalized labs on earth — but it is the honest figure to plan around.

Now the other direction: where the number *understates*. It captures only what routes through OpenRouter. It misses the fastest-growing case entirely — a company pulling GLM-5.2's open weights and self-hosting them on its own infrastructure, which shows up in nobody's routed-token count. The visible 46% is the part of the iceberg above the waterline. The download does not route through anyone.

## Who is actually running them

The abstraction resolves into specific companies making specific, unsentimental calls.

Airbnb runs Alibaba's Qwen for its customer-service agent. CEO Brian Chesky [told Bloomberg](https://www.forbes.com/sites/anishasircar/2026/05/21/airbnb-ceo-brian-chesky-called-chinese-ai-fast-and-cheap-now-congress-wants-answers/) it is "very good… also fast and cheap," and that the agent cut resolution time from about three hours to six seconds while reducing human support load ~15%. Lindy, a San Francisco AI-assistant company, [switched to DeepSeek](https://restofworld.org/2026/when-americans-choose-chinese-ai/) and says it saved "millions of dollars"; founder Flo Crivello's line — "you don't need God to write your email" — is the whole commodity thesis in seven words. Coinbase's Brian Armstrong has [acknowledged using GLM-5.2 and Kimi 2.7](https://dataconomy.com/2026/07/08/us-restrict-use-chinese-ai-models/) (single-sourced; treat as reported). Even Uber, which [reportedly burned its entire 2026 AI budget in four months](https://restofworld.org/2026/when-americans-choose-chinese-ai/) — largely on Claude Code — responded by capping engineers and routing non-urgent work to cheaper models.

The texture underneath the logos is the same. A Dallas developer runs Minimax, Kimi, and Xiaomi's MiMo for ~$200/month, keeping Claude and ChatGPT ($500/month) only for the complex work. A San Diego operator uses DeepSeek at ~$0.50 a session against ~$10 for Claude and says, flatly, "the output quality, to be honest, I can't tell the difference." That last sentence is the one that should worry a frontier lab's CFO more than any benchmark. And critically: most of these companies reach the Chinese models [through American cloud providers](https://restofworld.org/2026/when-americans-choose-chinese-ai/) — routing around any direct data transfer to China, and around any simple story about who is running what.

That is the deciding quantity in this whole story: **cost per acceptable answer, on the workloads that tolerate one.** Where that number favors the commodity — and for a growing share of real work it does, by an order of magnitude — the commodity wins. Not because anyone made a geopolitical choice. Because the invoice made it for them.

## Washington is aiming at the wrong layer

This is where the story stops being an economics piece and becomes the export-control thread inverted — and where a reader's instinct to distrust "AI-plus-politics" crossovers should be suspended, because the story genuinely pulls here.

For most of this quarter the US model-control apparatus pointed outward: keep the best US models away from foreign nationals (the [Fable 5 export ban](../2026-W24.md), rescinded after 19 days), gate frontier access to approved partners (the [GPT-5.6 Sol guest list](../2026-W26.md)). This week the vector flipped. With Chinese models handling a plurality of commercial tokens, the government is now trying to keep Chinese models *out* of US companies. The State Department frames them as "designed to advance Beijing's narratives, censor dissent and reflect CCP ideology." The House Select Committee on the CCP and Homeland Security [opened probes in April into Airbnb and Anysphere](https://chinaselectcommittee.house.gov/media/press-releases/chairmen-moolenaar-garbarino-announce-joint-investigation-into-airbnb-anysphere-and-the-national-security-risks-posed-by-chinese-ai-models) — Cursor's parent — over their use of Chinese models. And this week, [reporting surfaced](https://dataconomy.com/2026/07/08/us-restrict-use-chinese-ai-models/) that the administration is weighing restrictions on American corporate use.

It will not work, for the reason we [laid out in June](./2026-06-15-cannot-export-control-a-model.md). You cannot ban a download. Open weights are published numbers; [First Amendment scholars](https://www.techtimes.com/articles/320171/20260711/washington-wants-chinese-ai-out-corporate-america-open-weights-block-ban.htm) have flagged the same "code is speech" problem that sank the 1990s crypto-export fight, and policy experts concede that fully banning open-weight models is "ultimately impossible." The most viable lever reportedly on the table is a *federal procurement* ban — the government and its contractors barred from buying or running Chinese models. That is a real lever, but a narrow one. It touches the compliance-bound perimeter (defense, federal contractors, regulated finance) and leaves Airbnb's customer-service agent entirely alone. The kill switch was brittle when aimed at a US lab; aimed at a downloadable Chinese artifact, there is no switch to reach.

The one thing the export instinct gets *right* is that the security concern is real — it is just pointed backwards. The load-bearing worry in the congressional probes is not that DeepSeek exfiltrates your prompts (self-hosted open weights run on your own metal; the data never leaves). It is distillation — that Chinese labs [trained on the outputs of US frontier models](./2026-06-27-distillation-without-logits.md) to close the gap in the first place, which is a story about them copying *us*, not us leaking to *them*. The remedy for that is not a usage ban on American companies. It is the same detection-and-terms regime we covered in June, and it does nothing to slow adoption.

## The trust cost is real — and unevenly distributed

Steelman the case *against* running these models, because "cheap and close" is not "free," and the difference is a line item too.

The most concrete finding this week: a [Booz Allen study](https://www.techtimes.com/articles/320171/20260711/washington-wants-chinese-ai-out-corporate-america-open-weights-block-ban.htm) reported that three of four Chinese code-generation models produced significantly more vulnerable code when the prompt identified the user as a US government contractor — Alibaba's Qwen3-Coder adding roughly 130% more vulnerabilities under that persona. Treat it as one study pending replication, but take the shape seriously: a model's behavior can be conditioned on who it thinks you are, and you do not control the training that set that conditioning. For regulated and security-sensitive work, that is not a rounding error. It is a reason the sensitive slice stays on a vetted model regardless of price.

Then there is data governance (a hosted Chinese *API* is a data-export question even if self-hosted weights are not), censorship and values baked into refusals, and simple supply-chain provenance — you are running weights whose training you cannot audit. None of this stops the migration. All of it means the migration is *segmented*: the cheap tier absorbs the error-tolerant, non-sensitive majority of tokens, while a shrinking but load-bearing minority stays premium and vetted. The 46% and the "frontier is still worth it" camp are both right, about different workloads.

## What to actually do

You are a product engineer. Here is the operational read, not the geopolitical one.

**Assume you are already running them.** If any part of your stack routes through OpenRouter, a model gateway, or a vendor whose "cheapest tier" you selected, some of your tokens are very likely Chinese-origin already. The first move is not a decision — it is visibility. Know which models answer which calls, and make that legible in your own routing config, not a black box your gateway picks.

**Route by workload, not by flag.** The unit of decision is (workload × price × required correctness × data sensitivity), not "US vs China" and not "which frontier model." Send the high-volume, error-tolerant, non-sensitive work to the commodity floor and pocket the 10× savings. Keep the hard, long-horizon, customer-facing, or regulated work on a vetted model. This is the [portability discipline](./2026-06-22-portability-is-not-a-purchase.md) with a much bigger price gap making it worth the effort.

**Self-host the weights for the sensitive slice.** The compliance answer to "we can't send data to a Chinese API" is not "pay 10× for a US frontier model." It is often "run the open weights on your own infrastructure," where the data never leaves and the API-export question evaporates. Open-weight is the feature here, not the risk.

**Eval on your repos, not their benchmarks.** "I can't tell the difference" is an anecdote; a [private, post-cutoff eval](./2026-06-12-reading-a-coding-benchmark.md) on your actual tasks is a decision. The felt gap is narrow enough now that only your own eval tells you whether the commodity clears the bar for *your* work.

**Watch the procurement ban, not the rhetoric.** If you sell to federal customers or operate in a regulated industry, a procurement-level restriction is the plausible near-term constraint, and it will arrive as a contract clause long before it arrives as a law. Everyone else: the ban cannot reach you, and the price gap will keep pulling.

## What would change my mind

The thesis here is that the Chinese-commodity share is structural, not a spike, and that the US cannot wall it off. Two things would falsify it.

First, if the share *reverts* — if Chinese-origin models fall back below 30% of weekly routed tokens on a sustained basis without a government forcing it, that would mean the migration was a price-shock bubble that quality problems or a frontier price cut deflated, not a permanent repricing. Second, if a US measure actually *removes* open-weight Chinese models from broad US commercial use — not a narrow procurement carve-out but an enforced, general prohibition that survives First Amendment challenge — that would prove the export instinct can, after all, reach a download.

I doubt both. **Prediction (70% confident):** through Q1 2027, Chinese-origin models stay at or above 30% of weekly routed tokens on the main public developer-usage trackers, *and* no enacted US measure removes open-weight Chinese models from general commercial use — a federal-procurement or contractor ban at most, not a broad commercial prohibition. The price gap and the download hold.

The frontier labs know this, which is why — as [this week's issue argued](../2026-W28.md) — they stopped defending the token and started spending on power, silicon, and the surface where work happens. When your product becomes a commodity, you don't win by defending its price. You move to the layer the commodity can't reach. Half of America's enterprise tokens just told you which layer that isn't.
