# Portability Is Not a Purchase. It's an Eval Discipline.

*Deep dive · 2026-06-22 · The export ban made "go multi-provider" the reflex. A gateway swaps your URL in an afternoon. It can't swap your prompts, your tools, or your evals.*

Here is the scenario that stopped being hypothetical this month. It is a Friday evening. The model your product is built on goes dark — not deprecated, not rate-limited, *switched off*. Not by your vendor, and not for anything you did. On June 12, [Commerce ordered Anthropic to suspend Fable 5 and Mythos 5](https://www.anthropic.com/news/fable-mythos-access) for every foreign national, the company couldn't geofence its own staff, and both models went away for everyone. The trigger was a third party — Amazon, an investor and a competitor — and a reported jailbreak. We walked through the politics in [this week's issue](../2026-W25.md) and the futility of the controls themselves in an [earlier dive](./2026-06-15-cannot-export-control-a-model.md).

This piece is about the engineering answer, because the week produced one. The reflex, repeated in every vendor blog post since, is "go multi-provider." Put a gateway in front of your model calls. Wire up a fallback. Stop being a single point of failure.

That advice is right and badly incomplete. A gateway gives you portability the way a spare tire gives you a second car: technically true, useful in an emergency, and nothing like the thing you actually depend on. The switch is the easy half. The behavior is the hard half, and you cannot buy the hard half. You have to build it, before you need it, and keep it running.

## The easy half: your API surface is already portable

Start with the good news, because it's real and it's most of what the blog posts mean.

The industry standardized on one API shape. Almost every provider — and every gateway in front of them — speaks the OpenAI request/response format. So changing providers is, mechanically, a base-URL-and-key swap. [LiteLLM](https://docs.litellm.ai/), the self-hosted proxy, and [OpenRouter](https://openrouter.ai/), the managed gateway, both expose a single OpenAI-compatible endpoint across hundreds of models. You point your client at one URL and route behind it.

The model-agnostic coding harness is the same idea one layer up. [OpenCode](https://opencode.ai/docs/models/) — the MIT-licensed terminal agent that [passed Claude Code on GitHub stars this week](https://saiyampathak.substack.com/p/opencode-just-overtook-claude-code), ~172,000 to ~124,000, with a reported 7.5M monthly developers — uses the Vercel AI SDK and [Models.dev](https://models.dev) to support **75+ providers** from one interface. You set a model with a `provider_id/model_id` string (`anthropic/claude-opus-4-8`, `lmstudio/...`, your own custom endpoint), switch at runtime with `/models`, and the harness handles the rest. It runs local models through Ollama and LM Studio. It even feeds compiler diagnostics back to whatever model you picked after every edit, so the model self-corrects regardless of which one it is.

Notice *why* OpenCode crossed Claude Code on stars this quarter. It wasn't a better agent loop. Per [reporting on the milestone](https://saiyampathak.substack.com/p/opencode-just-overtook-claude-code), it was the quarter Anthropic blocked third-party tools from authenticating to Pro and Max subscriptions (January) and sent OpenCode legal demands (March). Developers were already buying option value against their vendor's platform decisions. The export ban just added a second reason — option value against their vendor's *government* — to a hedge they'd started building months ago.

So the surface is portable, and the tooling to exploit that is mature, free, and popular. If portability were a syntax problem, the ban would be a non-event: swap the URL, keep coding. It isn't a non-event, because it isn't a syntax problem.

## The hard half: behavior doesn't transfer

Here is the sentence that should be on a sticky note next to every "go multi-provider" slide. From a practitioner writing on exactly this question: ["There is no such thing as prompt portability right now."](https://vivekhaldar.com/articles/portability-of-llm-prompts/)

The API contract is standardized. The model's *behavior* under that contract is not. The same prompt that produces tight, on-task output from one model produces verbose, off-topic output from another. Instruction-following quirks differ. System-prompt conventions differ. The optimal phrasing, the ordering, the number of examples — all model-specific, and small changes in any of them have large effects on the output. The comparison the author reaches for is pre-compiler programming: today you still write bespoke "assembly" for each model. Migration, in his words, "is not a find-and-replace operation. It is a systematic adaptation process."

Three places this bites, concretely, on the Friday your model goes dark:

**Prompts.** Every non-trivial prompt in your system was tuned — explicitly or by trial and error — against one model's quirks. Drop in a replacement and you are not running your system; you are running an untested one. The behavior regressions are silent. Nothing throws. The output just gets worse in ways your users notice before your monitoring does.

**Tool calling.** This is where agents live, and it's the least portable layer. Gateways normalize the tool-call *schema* to OpenAI's function-calling format, so the request shape transfers. The *reliability* does not. As OpenRouter's own docs concede, ["function calling on Llama-3.3 is weaker than on GPT-5"](https://openrouter.ai/docs/guides/features/tool-calling) — same schema, different hit rate on whether the model calls the right tool with valid arguments. And under the hood, the ecosystem still ships **five separate adapters** — Vercel AI SDK, OpenAI, Anthropic, LangChain, Gemini — precisely because the formats aren't truly one format. An agent that reliably chains six tool calls on one model may drop the fourth on another, and "drops the fourth tool call 8% of the time" is not something you discover in an afternoon migration.

**Your warmed cache, and your unit economics.** Prompt caching is per-provider and per-prefix. We covered the mechanics in the [caching dive](./2026-06-18-prompt-caching-hit-rate.md): the discount only lands on a byte-identical prefix you've already paid to write. Switch providers and every warmed cache is gone. You start cold, at the *write* price, on a model whose pricing you modeled less carefully because it was the backup. The fallback that looked free in the architecture diagram has a cost-per-token you haven't measured and a cache hit rate of zero on day one.

Put the three together and the shape is clear. The gateway moved your *requests* to a new provider in minutes. Moving your *system* — the tuned prompts, the reliable tool chains, the cost model — takes the thing you don't have in an outage: time to re-tune and re-measure.

## So the real hedge is an eval you keep running

If behavior is the part that breaks, then portability is an *eval* property, not a *gateway* property. The distinction is the whole argument.

A wired fallback answers "can I send requests elsewhere?" An *exercised* fallback answers "will my system still work elsewhere?" Only the second one helps on Friday. The discipline that gets you there is unglamorous and you have to adopt it before the emergency:

- **Abstract at the harness layer now.** Whether that's OpenCode, a LiteLLM proxy, or your own thin client, get the hard-coded provider out of your application code while it's a refactor and not a fire drill. This is the cheap part. Do it first.
- **Keep a second provider continuously eval'd, not just configured.** Run your real eval suite — the one built from your tasks, post-cutoff, the kind the [benchmark dive](./2026-06-12-reading-a-coding-benchmark.md) argued you need anyway — against your fallback on every change. Not "GLM-5.2 scores well on public benchmarks." *Your* prompts, *your* tools, *your* pass rate, this week. If you can't show your fallback passing today, you don't have a fallback. You have a hope.
- **Treat each prompt as a model-specific asset.** Version the prompt per model. Accept that the fallback's prompts will diverge from the primary's. The fantasy of one prompt that runs everywhere is what makes migrations fail; budget for two.
- **Measure the fallback's cost cold.** No warmed cache, write-price prefixes, real token counts. Know the number before you're paying it under duress.

This is more work than buying an OpenRouter subscription. That's the point. The ban didn't reveal that we lacked a gateway. It revealed that "multi-provider" had become a procurement checkbox standing in for an engineering practice nobody was funding.

## The strongest case against doing any of this

Now the honest part, because the counterargument is good and a lot of teams should listen to it.

**Portability is a tax on capability.** Abstracting to the common denominator means you can't use the first-party features that make the frontier worth paying for. Anthropic's prompt caching breakpoints, extended thinking, computer use, the agentic tuning baked into Claude Code itself — none of that survives a translation to "the OpenAI-compatible subset every provider supports." A model-agnostic harness is, by construction, a lowest-common-denominator harness. One hands-on comparison this week clocked OpenCode as [~78% slower than Claude Code](https://medium.com/@chewloongnian/opencode-just-dethroned-claude-code-with-172-000-stars-i-ran-both-and-its-78-slower-508961c12959) on the same work — a single data point, and slower for reasons that include its LSP-diagnostic loop, but directionally it shows the trade. Portability has a performance and a feature cost, paid every day, against a switch-off risk that pays out rarely.

**And you probably never switch.** Switching costs are real and inertia is rational. Most teams that build elaborate provider-abstraction layers use exactly one provider for years, having spent real engineering effort insuring against an event that doesn't come. That is textbook premature optimization. The disciplined version above — continuous evals on a fallback — is *more* expensive than the gateway, so the counterargument hits it hardest.

Both points are correct. Here's why I'd still build the hedge, narrowed.

The ban changed the *probability and the controller* of the bad event, and that's what premature-optimization math leaves out. Before this month, "my model becomes unavailable" was a tail risk your vendor managed and mostly prevented; you were insuring against their downtime. Now it's a risk a third party can trigger — an investor's tip, a Commerce letter, a Friday — with no SLA and no appeal. When you don't control the trigger and there's no notice, the value of a *tested* exit goes up even if the annual odds stay low. This is the [channel thread](./2026-06-09-channel-was-the-product.md) turned around: the vendors spent the quarter making the channel the moat; portability is the buyer's only counter-move, and it's worth what it costs precisely because they've made the channel matter.

The resolution isn't "abstract everything." It's tiered. Use the frontier's first-party features where the capability earns the lock-in — your core, latency-sensitive, quality-critical path. Keep the *fallback* path simple, portable, and eval'd, covering the workflows you cannot have go dark. You pay the lowest-common-denominator tax only on the slice you're insuring, not the whole system. Most teams are currently at one of two corners — fully locked in with no exit, or a gateway with an untested fallback they'll never validate. Both lose on Friday.

## What this is not

It is not "switch to open weights." GLM-5.2 shipping [open under MIT this week](https://artificialanalysis.ai/articles/glm-5-2-is-the-new-leading-open-weights-model-on-the-artificial-analysis-intelligence-index) — top open-weight model on the intelligence index, level with GPT-5.5 on agentic work — is the strongest fallback argument open weights have ever had, because no one can switch off a model you've already downloaded. But "downloaded" and "runnable" are different budgets. As the [local-model dive](./2026-06-17-local-coding-model-memory-budget.md) showed, GLM-5.2's 744B parameters don't fit a workstation; the open frontier escapes the channel only if it escapes your VRAM, and it mostly doesn't. An open-weight fallback is a real hedge for some workloads and a fantasy for others. Eval it like any other fallback, on your hardware, before you count on it.

And it is not a solved problem you can wait out. The optimistic read is that someone ships true prompt portability — a cross-provider standard, atomic per-model prompts in extended model cards, a translation layer that preserves behavior. Maybe. But every incentive cuts against it. Behavioral lock-in *is* the product; a vendor who made your prompts portable would be handing you the exit. Don't architect around a standard that the people who'd have to write it are paid not to.

## So what — for Monday morning

**Do:** get the provider out of your application code this week (harness or proxy — cheap, do it first). Then pick the one or two workflows you cannot let go dark and stand up an *eval'd* fallback for them — a second provider or an open-weight model that passes your real task suite today, with its cold cost measured. "Wired up" is not "tested."

**Watch:** the gap between the frontier's first-party agentic features (caching, thinking, computer use, harness tuning) and the portable common denominator. If it keeps widening, the portability tax rises and the tiered split matters more, not less. Watch too whether any vendor blinks and ships a customer-facing bring-your-own-model path — [this week's issue](../2026-W25.md) bet 60% that one will within the quarter.

**Ignore:** the claim that a multi-provider gateway makes you portable. It makes you *syntactically* portable, which is necessary and nowhere near sufficient. Portability is a property of your evals, not your vendor list.

**Prediction (65% confident):** through Q1 2027, prompt-and-tool portability stays a manual re-eval problem. No cross-provider standard or vendor feature emerges that lets a non-trivial agent's prompt-plus-toolset move between two frontier providers and reproduce its eval scores within a small margin without per-model retuning. Gateways keep normalizing API *syntax*; *behavior* still requires bespoke adaptation. What would change my mind: a frontier vendor publishing per-model "atomic prompts" with reproducible cross-model eval parity, or a widely-adopted open standard for behavior-preserving prompt/tool translation — shipped, not announced.
