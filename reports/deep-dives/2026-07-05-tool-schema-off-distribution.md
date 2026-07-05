# Your Tool Calls Broke on the Upgrade. It's the Schema, Not the Model.

*Deep dive · Theo Vance (The Builder) · 2026-07-05 · why a smarter model invents keys your validator rejects — and the two moves that stop it*

You changed one string. `claude-opus-4-7` became `claude-opus-4-8` in your config. Or Sonnet 5 became the default model under you when [v2.1.197 shipped June 30](https://code.claude.com/docs/en/changelog), and you didn't touch a line. Nothing else moved. And your agent's custom edit tool started failing about one call in five.

The failures look unhinged. On July 4 [Armin Ronacher pulled the logs](https://lucumr.pocoo.org/2026/7/4/better-models-worse-tools/) on his editor's edit tool and found Opus 4.8 and Sonnet 5 filling the `edits[]` array with fields nobody defined: `requireUnique`, `oldText2`, `newText2`, `matchCase`, `forceMatchCount`, `children`, `notes`, `cost`. Invented keys. The tool has a schema. The schema has none of these. The call gets rejected, the turn is wasted, and the agent burns a retry — or worse, gives up. Older Claude models called the same tool cleanly. The newer, better-scoring ones don't.

Here is the part that should change how you think about it. The values were right. In the invalid calls, `oldText` and `newText` — the actual code the model wanted to change — were byte-correct. The garbage appeared *after* the nested object closed. The model knew exactly which edit to make. It got lost writing down the *shape* of the edit.

That's not a dumber model. That's a schema the model no longer expects.

## What a tool call actually is

A tool call is not a function invocation. It's the model sampling tokens that happen to form JSON, one token at a time, and your runtime parsing that JSON and validating it against a schema. The model has no compiler telling it your struct. It has a *prior* — a learned sense of what a tool call to "an edit tool" usually looks like — and it samples toward that prior.

Post-training is where that prior gets set. And the prior for this model generation was shaped hard on one harness: Claude Code. Its edit tools are flat — `old_string`, `new_string`, a `replace_all` boolean — and, critically, its executor is *forgiving*. Ronacher's read is that the harness "silently filters out unexpected keys" and accepts parameter aliases. So the model learned two things at once: an edit is flat, and extra keys are free — nobody ever punished it for adding one.

Now point that model at a schema that is a nested array of objects, with a strict validator that rejects anything it didn't declare. The shape is off-distribution, and the validator is unforgiving in exactly the place the training harness was forgiving. The model reaches for the flat, elaborate edit it knows, sprays plausible-looking keys after the required ones, and your validator — correctly — throws.

The [Berkeley Function Calling Leaderboard](https://gorilla.cs.berkeley.edu/leaderboard.html) has been saying the quiet part for two years: schema quality moves function-calling accuracy more than model choice — a well-shaped schema is worth on the order of 10–20 points across models. You just felt that as a version regression instead of reading it as a number.

## The fix is two moves, in order

**1. Stop hoping. Constrain the emission.**

Anthropic ships the switch for this: [`strict: true`](https://platform.claude.com/docs/en/agents-and-tools/tool-use/strict-tool-use) on a tool definition. It compiles your `input_schema` into a grammar and constrains token sampling to schema-valid outputs — grammar-constrained sampling. The model *cannot emit a token* that would open an undeclared key. `requireUnique` never gets sampled, because the grammar has no path to it.

```python
tools=[{
    "name": "apply_edits",
    "strict": True,                       # <- the whole fix, line one
    "input_schema": {
        "type": "object",
        "properties": {
            "path":     {"type": "string"},
            "old_text": {"type": "string"},
            "new_text": {"type": "string"},
        },
        "required": ["path", "old_text", "new_text"],
        "additionalProperties": False,    # <- the whole fix, line two
    },
}]
```

This is not a prompt-engineering nudge. It's the difference OpenAI measured when it shipped the same technique: [Structured Outputs](https://openai.com/index/introducing-structured-outputs-in-the-api/) took schema adherence from **under 40%** on a hard eval (gpt-4-0613) to **100%** (gpt-4o-2024-08-06). Ronacher saw the same thing on Opus 4.8 — turning on strict tool invocation *eliminated* the invented-key failures. It's the one control here that gives a guarantee instead of a probability.

**2. Flatten the schema toward the shape the model was trained on.**

Strict mode makes any schema safe to *validate*. It doesn't make an awkward schema *cheap*. Grammar-constrained sampling that fights the model's prior on every token spends more tokens and can drag latency. The nested array of objects is the expensive shape. If your edit tool can be flat — a `path`, an `old_text`, a `new_text`, maybe a `replace_all` — make it flat. You are aiming the schema at the harness the model already knows, so the grammar and the prior pull the same direction instead of against each other.

## The catch nobody puts on the box

Here's where builders get it wrong: they reach for strict mode, love it, and wrap the *entire* turn in it. Don't.

Constraining the emission is free. Constraining the *reasoning* is not. The [EMNLP 2024 study "Let Me Speak Freely?"](https://arxiv.org/abs/2408.02442) measured what happens when you force a model to think inside a rigid format. On GSM8K, GPT-3.5-Turbo fell from **76.6% to 49.3%** under JSON-mode; Claude-3-Haiku collapsed from **86.5% to 23.4%**. A two-step "reason in prose, then format" pipeline beat JSON-mode across the board. (Pure classification sometimes *improved* under constraint — narrowing the answer space helps when there's no chain of thought to strangle.)

So the shape you want is: **let the model reason in free text, then emit the tool call under grammar.** Think first, constrain last. This also explains the strangest line in Ronacher's write-up — in his repro, *removing thinking blocks halved the failures.* The interleaved reasoning was tangling with the emission and talking the model into elaborating the schema. Reasoning and emission want to be separate steps, not braided together. Strict mode constrains only the JSON; keep the thinking out of its way.

One more honest note on the tool: strict supports a [JSON-Schema subset](https://platform.claude.com/docs/en/build-with-claude/structured-outputs), it wants `additionalProperties: false`, and it compiles your schema to a grammar cached for 24 hours — so the first call after a schema change pays a compile. And don't put secrets in property names or enum values; the schema cache is stored separately from your message content and isn't covered by the same retention promises.

## Be tolerant on the way in, too

Strict mode fixes the *model's* side. Fix your side as well, because the values told you how.

Ronacher's calls had byte-correct `oldText` and `newText`. If his executor had done what Claude Code's does — drop the keys it doesn't recognize, log them, and run the edit anyway — that 20% failure rate would have been near zero. This is just [Postel's law](https://en.wikipedia.org/wiki/Robustness_principle) for tool inputs: be strict in what you require, liberal in what you accept. Strip unknown keys, emit a warning metric so you *see* the drift, and execute on the fields you understand. Belt (strict sampling) and suspenders (tolerant parsing). Either alone would have saved the turn; together they make the tool boring.

## An upgrade is a portability event

Step back and the pattern is familiar. When you switch providers, [prompt and tool behavior don't move for free](./2026-06-22-portability-is-not-a-purchase.md) — you re-eval. A model *upgrade* is the same event wearing a friendlier name. The version bump silently re-tuned the prior your tool calls depend on, and tool-calling reliability is not portable across versions any more than it is across vendors.

This is the same brake family we keep landing on. [Idempotency](./2026-06-26-agent-retries-idempotent-writes.md) makes a retried write safe; [a PreToolUse hook](./2026-07-02-hooks-are-the-real-guardrail.md) makes a dangerous command impossible; strict tool use makes a malformed call impossible. In every case the rule is the same: the boundary between the model and your side effects gets enforced by *your code*, because the model's behavior is a moving target and the next release will move it again. An [agent is a model in a loop](./2026-06-19-agent-is-a-control-flow-decision.md); the loop is where you put the guarantees the model can't give you.

## Do / watch / ignore

**Do —** turn on `strict: true` for every mutating tool before your next session (the edit tool first). Flatten those schemas toward the flat, distribution-close shape the model was trained on. Make your executor drop-and-log unknown keys instead of rejecting the whole call. Keep the model's reasoning in prose and constrain only the final JSON.

**Watch —** every model upgrade, including the ones that happen *to* you when a default swaps under your feet. Keep a 20-call eval of your real tool calls and run it on every version bump; the regression is version-specific and will show up there before it shows up in prod. Watch your rejected-tool-call rate as a first-class metric — it's the smoke detector for this whole class of bug.

**Ignore —** the "newer model is dumber" narrative. Opus 4.8 and Sonnet 5 knew the exact edit; they scored the same values byte-for-byte. What changed was the distance between your schema and their prior, and whether your validator forgives the gap. Close the distance, enforce the boundary in code, and the smarter model does the smarter thing.

You already shipped the upgrade. Now spend ten minutes making the tool boring, and get the capability you paid for.
