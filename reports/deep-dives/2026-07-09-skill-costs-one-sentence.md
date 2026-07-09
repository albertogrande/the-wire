# A Skill Costs You One Sentence Until You Use It

*Claude Code · Kit Sandoval (The Operator) · 2026-07-09 · Why the right unit of automation isn't the prompt or the CLAUDE.md line — it's the deferred body you pay for only on use.*

Here's the failure. Your `CLAUDE.md` is 300 lines. Maybe a third of it is real
always-true fact: the build command, the test runner, the two directories that
lie about what they contain. The rest has crept in — a deploy checklist, the
five steps for a schema migration, a "how we write a PR description" procedure.
Every single turn, the model re-reads all 300 lines. Past about 200, adherence
measurably drops (Anthropic's own guidance, and the number we [built a whole
dive around](./2026-06-25-context-budget-sixty-percent.md)). So you're paying a
standing token bill, every turn, for a migration procedure you run twice a
week — and it's crowding out the facts you need every turn.

The fix is not a shorter `CLAUDE.md`. It's moving that procedure somewhere it
costs nothing until the moment you use it. That place is a skill, and the
mechanism is worth understanding exactly, because it changes how you should lay
out your whole harness.

## What you actually pay for

A [skill](https://code.claude.com/docs/en/skills) is a directory with a
`SKILL.md` inside — YAML frontmatter plus markdown instructions. The
frontmatter's one recommended field is `description`. That's the whole surface
you need to grasp, because of how the content loads.

Anthropic calls it [progressive
disclosure](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills),
and it's a three-tier model:

1. **Always loaded.** The agent "pre-loads the `name` and `description` of every
   installed skill into its system prompt." One line per skill, every session.
2. **Loaded on trigger.** "If Claude thinks the skill is relevant... it will
   load the skill by reading its full `SKILL.md` into context." Not before.
3. **Loaded on demand.** Bundled files — a `reference.md`, a script — get read
   only when a subtask needs them.

The docs put the operating rule in one sentence: *"Unlike CLAUDE.md content, a
skill's body loads only when it's used, so long reference material costs almost
nothing until you need it."*

So a skill is capability bought on credit against your context budget. The
description is the interest you pay standing; the body is the principal, deferred
until use. That is the exact inverse of a `CLAUDE.md` line, which bills you every
turn whether the task touches it or not.

The numbers make the trade concrete. The skill *listing* — all those
always-loaded descriptions — is capped at **1% of the model's context window**
by default (the `skillListingBudgetFraction` setting). Each entry's
`description` plus `when_to_use` is truncated at **1,536 characters** in that
listing. Overflow the budget and Claude Code drops the descriptions of the
skills you invoke *least* first — so the ones you actually use keep their full
text. Run `/doctor` to see how many are being shortened or dropped. Contrast
that with a bloated `CLAUDE.md`: no budget, no graceful degradation, just a
quietly worse model every turn.

| | Where it lives | Standing cost (every turn) | On-use cost |
|---|---|---|---|
| `CLAUDE.md` fact | memory file | the whole line, always | — |
| Skill (default) | `.claude/skills/x/SKILL.md` | one description, capped 1,536 chars | full body when invoked |
| Skill (`disable-model-invocation`) | same | **zero** — description not even loaded | full body when *you* invoke |

That last row is the one power users miss. Set `disable-model-invocation: true`
and the description isn't loaded into context at all — the model can't trigger
it, only you can with `/name`. For a `/deploy` or `/commit` you always fire by
hand, that's free capability: it costs nothing standing and nothing until you
type the slash. Anthropic recommends it for exactly those side-effecting
workflows — "You don't want Claude deciding to deploy because your code looks
ready."

## The description is the router, not the summary

Because tier one is all the model sees until it decides, the `description` isn't
documentation. It's the routing function. The troubleshooting section says it
plainly: if the skill won't trigger, *"check the description includes keywords
users would naturally say."* If it triggers too often, *"make the description
more specific."* You are tuning a classifier with a sentence.

The practitioner version of this, which I'll flag as single-sourced — it's a
[dev.to workflow
writeup](https://dev.to/galian/claude-code-workflow-best-practices-that-ship-code-na),
not Anthropic — is that a skill's **"gotchas" section outperforms its
happy-path**. The claim: telling the model how the task usually goes *wrong*
changes behavior more than listing the steps to do it right. It matches what the
skills docs say about the body — "State what to do rather than narrating how or
why" — and it matches how the model fails in practice, which is rarely by not
knowing the steps and often by walking into the same trap. Treat it as a
hypothesis to test on your own skills, not gospel.

And there's now a way to test it that isn't vibes. The
[`skill-creator`](https://claude.com/blog/improving-skill-creator-test-measure-and-refine-agent-skills)
plugin runs a real eval loop: it generates should-trigger and should-not-trigger
prompts, measures the hit rate, and proposes description edits when the skill
activates on the wrong requests. It also benchmarks pass-rate *with* the skill
versus *without*, alongside the token and time overhead — which is the honest
question. A skill that lifts your pass rate 5 points while adding 8,000 standing
tokens might be a bad trade. Measure it.

## Where each piece belongs

The reader's standing question — [skills vs slash commands vs
`CLAUDE.md`](https://code.claude.com/docs/en/skills) — got simpler this year,
because custom commands *merged into skills*. A file at
`.claude/commands/deploy.md` and a skill at `.claude/skills/deploy/SKILL.md`
both create `/deploy` and behave the same; the skill form just adds a directory
for supporting files and the frontmatter that controls who invokes it. So
there's really a two-way split, decided by the loading question:

- **`CLAUDE.md`** — facts true *every* turn. The build command. The lie about
  `/legacy`. Anything the model needs to not get wrong before it knows what
  you're asking. You pay for these always, so keep the list short.
- **A skill** — a procedure or reference used *some* turns. The docs give the
  exact tripwire: *"when a section of CLAUDE.md has grown into a procedure
  rather than a fact."* When you notice a checklist in your memory file, that's
  the signal to cut it out and make it a skill.

The test is loading, not length. A five-line deploy checklist belongs in a skill
not because it's long but because it's *conditional* — you touch it 5% of turns,
so paying for it the other 95% is pure waste.

## Composition got real in v2.1.199

Until this month, skills didn't compose. You could invoke one per message.
[v2.1.199, July 2](https://code.claude.com/docs/en/changelog), changed that:
*"Stacked slash-skill invocations like `/skill-a /skill-b do XYZ` now load all
leading skills (up to 5), not just the first."* Type `/code-review /fix-issue
123` and both skills load, each receiving `123` as its arguments. Before, only
the first loaded and the rest arrived as literal text the model had to squint
at.

The rule has a sharp edge worth knowing: expansion takes the first skill plus up
to five more, and *"stops at the first token that isn't an inline user-invocable
skill."* A forked-subagent skill (`context: fork`) ends the run there, and so
does a skill whose own arguments start with a slash — `/loop` is the named
example. Everything from that token on becomes argument text for the skills that
did expand. So order matters: put the pure inline skills first, the forking or
slash-argument one last.

This is the Unix-pipe move, finally available for procedures. `/plan /test
/commit` as one front-loaded stack, each a small composable step, none of them
carried in your `CLAUDE.md`.

## The lifecycle gotchas

Two things about a loaded skill will bite you if you don't know them.

First, **an invoked skill stays in context for the rest of the session.** Claude
Code renders the `SKILL.md` into one message and doesn't re-read the file on
later turns. Every line of the body is a *recurring* cost once it's in — which is
why the docs cap the body itself (keep `SKILL.md` under **500 lines**, push
reference material to bundled files that load on demand). Write the body as
standing instructions that apply throughout the task, not one-time steps, because
the model treats them as standing whether you meant them that way or not.

Second, **compaction can drop your older skills.** When context fills and the
session summarizes, Claude Code re-attaches the most recent invocation of each
skill — but only the first **5,000 tokens** of each, under a combined **25,000
token** budget, filled from the most recently invoked backward. Invoke many
skills in a long session and the early ones fall off entirely after a compaction.
If a skill "stops working" mid-session, that's often why — re-invoke it. (One
relief landed in v2.1.202: re-invoking a skill whose rendered content is
unchanged now adds a short "already loaded" note instead of a second full copy,
so re-invocation isn't the token disaster it was.)

## What to do before lunch

Pick the longest procedure in your `CLAUDE.md` — the one that's a checklist, not
a fact. Cut it out and drop it here:

```yaml
---
# ~/.claude/skills/migrate/SKILL.md
name: migrate
description: Write and run a database schema migration for this repo. Use when
  the user asks to add a column, change a table, or create a migration.
disable-model-invocation: false
allowed-tools: Bash(npm run migrate:*)
---

## Gotchas (read first)
- Migrations run in a transaction; a `CREATE INDEX CONCURRENTLY` will break it.
  Use a separate non-transactional migration for those.
- We never drop a column in the same deploy that stops writing to it. Two deploys.

## Steps
1. Generate the migration file: `npm run migrate:new -- <name>`
2. Write up and down. The down must actually reverse the up.
3. Run `npm run migrate:up` against the local db and confirm it applies.
```

Three things to notice, each attributable. The **description leads with the
trigger phrases** a user would actually type ("add a column," "create a
migration") — that's the router, per the docs' troubleshooting rule. The
**gotchas come before the steps** — the single-sourced dev.to bet, cheap to test
here. And `allowed-tools` pre-approves just the migration command so the skill
runs without a permission prompt, without granting anything broader (it doesn't
*restrict* tools — it only skips the prompt for the ones listed).

Then check your work with two numbers. Run `/context` to confirm your `CLAUDE.md`
got smaller and the skills listing didn't blow past its 1% budget. Run
`/doctor` to confirm no descriptions are being dropped. If they are, set the
skills you rarely use to `"name-only"` in `skillOverrides`, or raise
`skillListingBudgetFraction` to `0.02`.

The frame to keep: your context window is the scarce resource, and every
mechanism in Claude Code is really a decision about *when* something is loaded.
`CLAUDE.md` is always-on. Hooks fire on events — [the real guardrail when a
permission string can't read
intent](./2026-07-02-hooks-are-the-real-guardrail.md). Skills are pay-on-use.
The skill is the only one of the three that lets you add capability without
adding a standing bill. Use it for everything that isn't true every single turn —
and write the description like the router it is.
