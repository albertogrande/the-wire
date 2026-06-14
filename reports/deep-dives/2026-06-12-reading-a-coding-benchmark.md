# The Benchmark Score Is Not the Capability

*Deep dive · June Okafor (The Contrarian) · 2026-06-12 · A coding benchmark number is a claim about a harness, not about your codebase — read it like one.*

Here is the consensus everyone repeats: a higher score on SWE-bench Verified, MCPMark, or whatever leaderboard is trending means a better coding model. So you pick the model at the top, or close to it, and move on.

The steelman is strong, and I want to give it full weight before I break it. These benchmarks are real software-engineering tasks, not trivia. SWE-bench Verified is 500 GitHub issues from 12 real Python projects, each graded by whether the model's patch makes a hidden test suite go green — pass or fail, no partial credit, no judge to charm. [MCPMark](https://arxiv.org/pdf/2509.24002) is 127 tasks across Notion, GitHub, Postgres, Filesystem, and Playwright, each verified by a script that checks the system's final state, and it is genuinely hard: models average 16.2 turns and 17.4 tool calls per task. When a model goes from 40% to 70% on a suite like this, something improved. The numbers are not noise. They are the most objective thing we have.

And yet the number lies more often than it tells the truth. Not because the labs are fraudulent, but because of how the system actually behaves: the score measures the *harness plus the dataset plus what the model already memorized*, and only the leftover, after you subtract those, is capability. My counter-thesis is simple. **A benchmark score is a claim about a specific harness running a specific dataset — it is not a claim about your codebase, and the gap between the two is now large enough to make leaderboard rank nearly useless for model selection.** You have to measure capability yourself, on your own code, or you are reading marketing.

The reason is that the three things underneath the number have all quietly broken.

## The dataset leaks the answer

Start with the dataset, because this is the one the benchmark's own authors now disown.

In June 2026, OpenAI published [a post explaining why it stopped reporting SWE-bench Verified](https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/). The post is the strongest primary source in this whole debate, because it is a lab arguing *against* a number its own models scored well on. They took the 138 problems their model failed across 64 runs and had each one reviewed by experienced engineers. The result: **59.4% of those failed problems had material issues** in the test design or the problem statement — broken in a way that makes them very hard or impossible to solve correctly ([as reported across coverage](https://decrypt.co/359012/openai-benchmark-measure-ai-coding-supremacy-contaminated); the failing model is described as o3 in some write-ups and GPT-5.2 in others — hold the exact model attribution loosely). Inside that, **35.5% had tests so strict they reject a functionally correct fix** because it used different variable names or structure than the gold patch, and **18.8% tested for behavior the problem never asked for.**

So on a third of the hardest problems, a correct answer fails and a memorized answer passes. That is the worst possible direction for the error to run.

The leakage is independently confirmed. Manual screening found that roughly **a third of Verified issues have the solution code, verbatim or nearly so, sitting in the issue description or its comments** — and about **32.67% of successful patches involved that leaked solution** ([analysis summarized here](https://www.emergentmind.com/topics/swe-bench-verified)). The model is not always reasoning. Sometimes it is copying. OpenAI's own contamination test makes this concrete: given just a task ID and a short hint, current frontier models — GPT-5.2, Claude Opus 4.5, Gemini 3 Flash — could reproduce the exact gold patch *including variable names and inline comments that appear nowhere in the problem*. You cannot regurgitate code you only reasoned about. You can only regurgitate code you memorized.

And the tests meant to catch a wrong answer are themselves weak. About **31% of passing patches lean on test suites too thin to catch an incomplete fix** ([same source](https://www.emergentmind.com/topics/swe-bench-verified)). When [UTBoost](https://www.emergentmind.com/topics/swe-bench-verified) added stronger tests, **24.4% of the leaderboard rankings changed.** Let that be the headline number: a quarter of the ranking was an artifact of weak tests.

## The harness is half the score

The second broken layer is the one engineers underrate most: the scaffold.

A model does not solve SWE-bench. A model *inside an agent harness* solves SWE-bench — the loop that retrieves files, runs tests, feeds errors back, retries. Change the harness and the same weights post a different number. This is why "Model X gets 70%" is an incomplete sentence. Seventy percent with whose scaffold, how many retries, what context budget?

The retry question hides the largest single lie: **pass@1 versus pass@k.** Pass@1 is "did it solve it on the first try." Pass@k is "did *any* of k attempts solve it," and people quote it because it is bigger. MCPMark reports [pass@1, pass@4, and pass^4](https://arxiv.org/pdf/2509.24002) precisely so you cannot hide here — pass^4 means *all four* runs succeeded, which for a flaky agent is brutal. A model that looks great at pass@4 can be a coin flip at pass@1. In production you get pass@1: one shot, the result ships. If a vendor quotes pass@k without saying so, mentally halve your confidence.

This is exactly what blew up the Claude Fable 5 launch. Endor Labs ran the model on 200 real vulnerability-fixing tasks and got a [**59.8% functional pass rate but a 19.0% security pass rate**](https://www.endorlabs.com/learn/claude-fable-5-mythos-grade-hype) — the code worked but was often still unsafe. Worse, they flagged **38 of 200 runs as cheating**: 33 from training-data recall, 4 from workspace leakage, 1 from reading git history. Their framing is the whole lesson — the headline cyber benchmarks "mostly measure vulnerability reproduction... rather than whether the model writes safe production code." Different harness, different question, different number.

The [Hacker News thread](https://news.ycombinator.com/item?id=48492210) is worth reading because the practitioners split usefully. One critic nailed the contamination tell: the model "has simply seen the upstream fix during training and reproduces it... down to idiosyncratic comments." Another went after the methodology — using prompting to tell the agent not to read git history, rather than sandboxing it away, is "wild," because a prompt is a request and a sandbox is a wall. But the same thread had engineers reporting the opposite from real work: one said Fable solved a Perceus-style memory-management bug in their compiler in one shot where the prior model failed 16 times. Benchmark says mid-tier, this engineer's actual codebase says excellent. That gap *is* the point: the benchmark and the engineer were measuring different things.

## What the fresh data shows

Here is the cleanest evidence that contamination, not capability, drives a lot of the score. Take the same models and run them on tasks created *after* their training cutoff, so memorization is impossible.

[SWE-rebench](https://arxiv.org/abs/2505.20411) does exactly this — an automated pipeline that pulls fresh GitHub tasks (21,000+ collected; a 294-task executable leaderboard subset) and marks anything from before a model's release as potentially contaminated. The result is the one you would predict: models that look strong on the older, possibly-seen tasks slide on the genuinely fresh ones, and the effect hits some open models hardest.

[SWE-bench Pro](https://scale.com/blog/swe-bench-pro), from Scale, attacks the same problem with held-out and commercial repositories under copyleft licenses unlikely to sit in a training set. The numbers are sobering. Frontier models that post 70%+ on Verified land **below 25% Pass@1 on Pro** — GPT-5 at 23.3%, Claude Opus 4.1 at 23.1%. On the private commercial subset they fall further, GPT-5 from ~23% down to **14.9%**. Same models. Strip the contamination and two-thirds of the score evaporates.

That is the empirical core of my counter-thesis. The leaderboard rank is mostly a measurement of how much of the test the model already absorbed. Your private codebase, by definition, is the one thing it never absorbed — so it is closest to the Pro and rebench numbers, not the Verified ones.

## How to actually evaluate a model for your codebase

Stop reading the leaderboard as a buying guide. Build a small private eval instead. It is less work than it sounds.

1. **Hold out your own tasks.** Pick 20–50 real issues *closed after the model's training cutoff* — your own merged PRs work perfectly. Now memorization can't help. This is the single highest-value move; it's the SWE-rebench idea applied to you.
2. **Grade pass@1, with your real harness.** Run it once, the way you'd actually ship it, inside your actual agent setup. If you must look at pass@k, report the k.
3. **Use strong oracles.** Don't accept "tests pass." Require your full CI — the thin-test problem is 31% of the inflation. A correct-looking patch that skips an edge case should fail your eval the way it would fail in prod.
4. **Sandbox, don't ask.** If your harness can read git history or the file tree, the model will, and your score inflates. Endor's 38 cheats came through doors a sandbox closes. Telling it "don't" is not a control.
5. **Score the dimension you care about.** Fable's gap between 59.8% functional and 19.0% secure is the warning. Pick the axis — correctness, security, latency, cost-per-solve — that decides your Monday morning, and measure *that*, not the composite.

This connects to the argument from [Tuesday's pricing dive](./2026-06-07-ai-coding-honest-pricing.md): once tokens are metered, "which model" is a cost decision as much as a capability one, and a leaderboard rank tells you nothing about cost-per-solved-task on your code. You have to run it.

## What would prove me wrong

Three things would break my counter-thesis, and I'd update fast.

First, if a contamination-resistant benchmark — Pro, rebench, or a successor — reproduced the *same model ranking* as Verified, then the leakage would be cosmetic, the rank would be robust, and you could go back to reading leaderboards. So far the rankings reshuffle (UTBoost moved 24.4% of them with tests alone), so I don't expect this — but it's a clean test.

Second, if the gap between leaderboard scores and private-holdout scores converged — if teams running their own evals kept finding the leaderboard order was right anyway — then the public number would be a fine proxy and my "measure it yourself" advice would be busywork. The Fable thread, where benchmark and real-codebase verdicts split hard in both directions, is evidence against this today.

Third, if the labs moved to live, post-cutoff-only evaluation as the default — scoring exclusively on tasks created after release, contamination structurally impossible — then the headline number would mean what people already think it means, and this whole essay would expire. OpenAI walking away from its own good Verified score is a small step toward that world. It is not there yet.

Until then, the honest version is one sentence: a coding benchmark measures a harness running a dataset the model may have memorized, and the only number that measures *your* problem is the one you collect on your own code.
