# "Agent" Is a Control-Flow Decision, Not a Product

*Deep dive · June Okafor (The Contrarian) · 2026-06-19 · What you actually buy — and build — when you ship an "agent."*

Here is the consensus everyone repeats in 2026. We have entered the agent era. Software that calls a model is an agent; building agents is the thing you now do; and the roadmap question on every team is "how do we make this more agentic." The word is on every launch this week — a [YC company shipping "agents that test your app"](https://tester.army), Microsoft's [Work IQ](https://dev.to/pwd9000/microsoft-build-2026-top-announcements-from-a-devops-lens-419k) exposing enterprise context "to agents," a whole protocol stack — MCP, [A2A](https://en.wikipedia.org/wiki/Agent2Agent), x402 — being assembled so agents can find tools, find each other, and pay each other. Agents are a category you buy and a thing you become.

Let me give that its full strength, because the core of it is real. The autonomous loop genuinely unlocks tasks that no fixed program can handle. Hugging Face's `smolagents` docs have the canonical example: a surf-trip site can hard-code two buttons — *search the knowledge base* or *contact sales* — and handle 90% of requests with zero AI. But the request "I can come Monday, but I forgot my passport so I might be delayed to Wednesday — can you still take me and my gear out Tuesday with cancellation insurance?" [does not fit any predetermined branch](https://huggingface.co/docs/smolagents/en/conceptual_guides/intro_agents). Resolving it means consulting a weather API, a maps API, an availability dashboard, and a knowledge base, in an order nobody can write down in advance. *Letting the model decide that order* is the thing the loop buys you. That capability is new, it is valuable, and the tool-calling APIs, MCP servers, and orchestration frameworks that make it reliable are real engineering. None of that is marketing.

And yet the word "agent" is doing two jobs in that consensus, and hiding the seam between them. My counter-thesis is plain. **An agent, stripped of marketing, is exactly one thing: a system where the model controls the loop — it decides the next step, in a loop, until the task is done. Everything else sold as an agent is a workflow with an LLM in it. And "how much agency does this need" is a dial you should turn up as little as possible, not a brand you adopt wholesale.** The marketing collapses a spectrum into a label, and that collapse costs you real money and real reliability.

Two claims sit under that. Take them in order.

## "Agent" is a dial, and the vendors selling it tell you to leave it low

The most useful definition of "agent" is also the least marketable, which is why it took the industry until late 2025 to accept it. Simon Willison spent years [dismissing the term as hopelessly ambiguous](https://simonw.substack.com/p/i-think-agent-may-finally-have-a) before landing, on 18 September 2025, on the one sentence enough people could agree on: **"An LLM agent runs tools in a loop to achieve a goal."** He published it the same day as a post titled, pointedly, ["Agents: OpenAI need to get their story straight"](https://simonwillison.net/2025/Sep/18/) — because even the labs selling agents could not keep their own definitions consistent. When the vendors disagree on what the product *is*, the word is doing brand work, not technical work.

Read the definition closely and notice what is load-bearing: **the loop, and who controls it.** Not "uses tools" — a single function call uses a tool and controls nothing. Not "is autonomous" — autonomy is the consequence, not the mechanism. The mechanism is that the model, not your code, decides whether to continue and what to do next.

That makes "agent" a point on a continuum, and the people who build the frameworks say so out loud. Hugging Face publishes the spectrum as a table — six rungs of how much your program flow obeys the model:

| Rung | What the model controls | Name |
|---|---|---|
| ☆☆☆ | Nothing — output is just processed | Simple processor |
| ★☆☆ | One if/else branch | Router |
| ★★☆ | Which function runs, with which args | Tool call |
| ★★☆ | Whether the loop continues | **Multi-step agent** |
| ★★★ | Whether to start *another* agent | Multi-agent |
| ★★★ | Writing its own code/tools | Code agent |

Only the fourth rung and below are agents in Willison's sense — the loop is the model's to control. The first three are workflows; the model influences a step, but your code owns the flow. Hugging Face's advice is explicit and runs directly against the consensus: *"for the sake of simplicity and robustness, it's advised to regularize towards not using any agentic behaviour."* [Use an agent only](https://huggingface.co/docs/smolagents/en/conceptual_guides/intro_agents) when "the pre-determined workflow falls short too often."

Anthropic — which sells agents and writes the SDK for them — says the same. Its [engineering guidance](https://www.anthropic.com/engineering/building-effective-agents) draws the line in one paragraph: **workflows** are "systems where LLMs and tools are orchestrated through predefined code paths"; **agents** are "systems where LLMs dynamically direct their own processes and tool usage." And the recommendation: *"find the simplest solution possible, and only increase complexity when needed."* For many applications "optimizing single LLM calls with retrieval and in-context examples is usually enough." That is the agent vendor telling you not to build an agent if a workflow will do.

So the dial is the truth and the brand is the distortion. When a product calls itself an agent, it has told you nothing about which rung it sits on — and most production "agents" sit on the bottom three. A support bot that routes to one of four canned flows is a router wearing the costume. A "research agent" that runs a fixed search-then-summarize pipeline is two tool calls in a trench coat. Calling them agents is not a lie, exactly; it is a category error sold as a capability.

## The market is already voting down the high-agency rungs

If "more agentic is better" were true, adoption would climb the ladder. It is doing the opposite: uptake is heaviest at the *low*-agency rungs and thin at the top.

Look at the protocol stack the consensus points to as proof of the agent era. MCP — which lives on the *tool-call* rung, the third one, the workflow rung — is everywhere: every major lab adopted it, and SDK downloads run in the tens of millions a month. A2A — which lives on the *multi-agent* rung, agents coordinating other agents, the top of the ladder — was [donated by Google to the Linux Foundation](https://en.wikipedia.org/wiki/Agent2Agent) in June 2025 with 100-plus companies announcing support. Backing is not usage. The honest practitioner signal showed up on Hacker News today: ["Ask HN: Is anyone using the A2A protocol?"](https://news.ycombinator.com/item?id=48571086) — 55 points, 29 comments, two months of lukewarm. The enterprise logos adopted the agent-to-agent layer; the developers shrugged. The market wanted the rung that connects a model to a tool, and has so far declined the rung that turns models loose on each other.

That is not an accident, and it is not developers being slow. It is them pricing the cost of each rung correctly. Every step up the dial buys flexibility and sells away three things an engineer needs:

- **Determinism.** A router gives the same answer twice. A multi-step loop may take four steps today and seven tomorrow. You traded a testable function for a distribution of behaviors.
- **Cost.** A loop re-reads its growing context on every turn — that is the whole mechanism — so each extra step pays for all the tokens before it. Multi-agent fans that bill out further: each sub-agent runs a fresh context window, and the returns are easy to underestimate, as we [counted in the fan-out dive](./2026-06-13-subagent-fan-out-budget.md). The top rung is the most expensive place to stand.
- **A blast radius.** The more the model owns the loop, the more it can do before anyone checks — the gap we covered when [autonomy shipped before its brakes](./2026-06-08-autonomy-before-brakes.md). A runaway router misroutes one request. A runaway loop runs up a [five-figure bill overnight](./2026-06-08-autonomy-before-brakes.md).

None of that says don't use agents. It says the surf-trip request is worth the loop and the support-ticket router is not, and the engineer's job is to know which one is in front of them — a judgment the word "agent" actively prevents, because it flattens both into the same thing.

## So what, Monday morning

Stop asking "is this an agent?" It's the wrong question and it has no useful answer. Ask the dial questions instead.

- **Evaluating a product.** Make the vendor name the rung. "Your agent — does the model decide the control flow, or does it pick a branch in a flow you wrote?" If it's a router or a single tool call, fine — but price it as a workflow and don't pay agent premiums or accept agent nondeterminism for it.
- **Building one.** Start at the bottom of the ladder and climb only when the lower rung "falls short too often." Most teams that think they need a multi-step agent need a router plus two tool calls — cheaper, testable, and debuggable. Reach for the loop when the *order* of steps genuinely can't be written down in advance. Reach for multi-agent later still, and only with a number that justifies it.
- **Reading the room.** When a roadmap says "make it more agentic," translate it to "move it up the agency dial," then ask what that specific move buys and what it costs in determinism, tokens, and blast radius. Usually the honest answer is "less than it sounds, and more than we budgeted."

**What would change my mind.** If the top rung stops being the expensive, thinly-used end of the dial — if multi-agent coordination becomes the default shipped pattern *and* beats single-loop agents on a real reliability benchmark, not a demo — then "agent" would be earning its billing as a category rather than a control-flow choice. I'd watch A2A-style horizontal coordination for that: the day a majority of production systems run agents talking to agents, and can show it pays, the dial framing is too modest. Right now every signal — the vendors' own "keep it simple," the spectrum docs' "regularize toward no agency," the protocol stack's MCP-yes / A2A-shrug split — runs the other way. The agent era is real. It is just one rung of it, and you should climb to it slowly.
