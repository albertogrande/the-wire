# The Loop Deskills the Human It Depends On

*Deep dive · June Okafor (The Contrarian) · 2026-07-22 · The agent writes most of the code and the human reviews it — but review is the exact skill automation erodes.*

Here is the sentence everyone says, and I mean everyone — vendors, regulators,
your staff engineer, me last quarter: **keep a human in the loop.** The agent
writes the code, the human reviews it, the review is the safety net. You get the
speed and you keep the brakes. It is the answer to every autonomy worry we have
raised in this publication, from [unattended commits](./2026-07-08-agent-audit-trail-unattended-commits.md)
to the [accept button](./2026-07-10-accept-button-is-the-moat.md). Ship fast,
review carefully, and the risk is managed.

I want to take that seriously before I break it, because it is not wrong on its
face. Code review is real. Tests are real. A competent engineer reading a diff
catches things — off-by-ones, a dropped null check, a migration that will lock a
table in production. The loop demonstrably works most of the time. "Human in the
loop" is also the entire regulatory story: the Colorado AI Act, the draft
pre-release review regimes, every enterprise governance deck — all of them end
at a person who is supposed to be looking. It is the responsible position. If you
had to pick one control to keep, you would keep this one.

The problem is that "human in the loop" is not a property of the system. It is a
claim about the human — specifically about two things, attention and skill — and
those are the two things automation quietly takes away. The loop, left to run on
its own, trains the person in it to stop looking. And it does this fastest
exactly when the agent gets good, which is now.

## Three numbers that point the same way

Start with the study that prompted this piece. Valerio Capraro and colleagues
gave people trivia questions about visual details in films, and gave some of them
an AI assistant. Accuracy [fell from 27% to 9%](https://thenextweb.com/news/ai-advice-suppresses-critical-thinking-wrong-answers-study) —
to roughly a third. Fine, you say: the AI was wrong, garbage in. But watch the
second number. Confidence rose from 30% to 76%. Willingness to say "I don't know"
collapsed from 44% to 3%. People got worse *and surer*, at the same time, in the
same direction. Paying them for accuracy barely moved it — admit-ignorance went
to 8%, not back to 44% ([preprint](https://osf.io/preprints/psyarxiv/5y6m4_v1)).
The design is adversarial on purpose: the questions were ones the model tends to
get wrong, so this is not "rational delegation to a reliable tool." It is a clean
picture of what happens to a person's own error-correction when an assistant is
present. It switches off. And confidence moves opposite to accuracy, which is the
worst possible failure mode, because confidence is the signal you use to decide
whether to look harder.

Trivia is not engineering, so bring it home. In 2025 METR ran a randomized
controlled trial on the population that is supposed to be immune to this: sixteen
experienced open-source developers, working on their own mature repositories
(averaging 22k-plus stars, a million-plus lines), 246 real issues, using Cursor
Pro with Claude 3.5/3.7 Sonnet. When allowed AI, they took
[**19% longer**](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/).
Slower. And here is the part that matters for review: before the study they
predicted AI would speed them up 24%; after finishing — after being measurably
slowed — they still believed it had sped them up 20% ([paper](https://arxiv.org/abs/2507.09089)).
A roughly 40-point gap between what they felt and what a stopwatch said, in
experts, on their own code. METR now labels the result historical, and it should
be caveated hard: n is 16, the models are a generation old, and it measured
*authoring*, not reviewing. But the finding that survives every caveat is not the
slowdown. It is the calibration failure. These engineers could not read their own
productivity off their own experience. Neither can you read your own review
quality off how thorough it feels.

The third number is that none of this is new. Lisanne Bainbridge wrote it down in
1983, in a four-page paper called ["Ironies of Automation"](https://en.wikipedia.org/wiki/Ironies_of_Automation)
that is now one of the most cited in human factors. Automate the routine work and
you leave the human two jobs: monitor the machine, and take over for the rare
hard case the machine cannot handle. Humans are bad at the first — sustained
passive monitoring is the task we are worst at — and the second job requires
skills that *decay through disuse*, because the automation has taken away the
daily practice that kept them sharp. So the operator is least prepared for the
hard case at exactly the moment it arrives. Bainbridge's conclusion is the one
nobody quotes: automated systems need their humans *more* trained, not less.

Raja Parasuraman and Dietrich Manzey pinned the mechanism in a
[2010 review](https://journals.sagepub.com/doi/10.1177/0018720810376055).
"Automation complacency" — under-attending to an automated process because it is
usually right — produces both omission and commission errors when the aid is
imperfect. Three findings are load-bearing here. It appears in **experts**, not
just novices. It **cannot be trained or instructed away**. And it gets worse
under multiple-task load — which is the entire condition of an engineer running
three agent sessions while reviewing a fourth. This is why the trivia study's
incentive arm barely moved the needle. You cannot pay or exhort your way out of
complacency. It is not a discipline failure. It is how attention allocates itself
against a reliable-seeming automation.

## Why the brake wears out as the engine gets stronger

Now put the pieces together, because the second-order effect is the whole point.

Model a human reviewer as what they are: a classifier with a false-negative rate
— the fraction of real defects they wave through. The comfortable assumption
behind "human in the loop" is that this rate is fixed, a property of the
reviewer. It is not. It moves, and it moves against you, for two reasons the
literature names directly. First, **complacency scales with reliability**: the
more often the agent is right, the less the reviewer attends, so the miss rate
rises as the agent improves (Parasuraman/Manzey). Second, **skill decays with
disuse**: the reviewer who now approves diffs instead of writing them loses the
fluency that made the review sharp (Bainbridge).

So the system's real defect rate is not the agent's benchmark score. It is
roughly `agent_error_rate × reviewer_miss_rate` — and the second term grows as
the first shrinks. Every point of capability the agent gains is partly given back
by a reviewer who checks a little less, a little worse. You cannot read the safety
of the system off the model's SWE-bench number, because the human term is moving
in the opposite direction and — this is the uncomfortable part — **nobody is
measuring it.** We benchmark the agent to three decimal places. We have no number
at all for how well the human catches what it gets wrong, or how that number
trends over six months of use.

This is why "human in the loop" is not a safety feature. It is a skill, and
skills decay. And the decay is fastest precisely now, when Anthropic reports that
[~80% of its own merged code](./2026-07-08-agent-audit-trail-unattended-commits.md)
is agent-written and Copilot-style accept rates hover around a third. The human
reviewer has gone from one check among many to the *only* brake on the large
majority of code that ships — at the same time as the volume, the smoothness, and
the plausibility of what they are reviewing all rise. The brake is being worn down
at the exact rate the engine gets stronger. That is the irony Bainbridge saw in a
power plant in 1983, arriving now in your pull-request queue.

## What to actually do about it

The fix is not "review more carefully." Complacency laughs at that; it is the one
intervention the research says does not work. The fix is to *engineer the human's
attention and skill* the way aviation and nuclear did, because they hit this wall
forty years ago.

**Make the human produce, not just approve.** An accept button is not review;
it is a rubber stamp with good UX. Write the hard parts yourself sometimes — the
tricky concurrency, the security-sensitive path — to keep the skill live. A
reviewer who could not have written the code cannot really review it.

**Fight the reliability cue.** The smoother the agent, the more you must force
verification the model of your own attention will not supply. Concretely: make the
agent produce a *failing* test first, so approval is gated on a red-to-green you
can see, not on prose that reads clean. Predict the diff before you read it; if
you can't, you are not reviewing, you are watching.

**Measure your own miss rate.** This is the aviation answer — inject failures.
Seed known-bad diffs into the review stream and count how many you catch. If you
have never once verified the verifier, you do not know your false-negative rate,
which means you do not know the safety of your system. It is the one number that
matters and the one nobody has.

**And what would change my mind?** A deployment measurement, not a lab one. Show
me a controlled study of AI-assisted *code review* — not authoring — where the
human catch-rate on injected defects holds steady, or rises, as the agent's
reliability rises, in experienced engineers, over months of real use. If the
reviewer's miss rate is flat under increasing automation, then the second term is
not moving, my whole argument collapses, and "human in the loop" really is a
durable control. I would genuinely like to see that number. But every measurement
we do have — the trivia study, the METR trial, forty years of human factors — runs
the other way. Until someone puts a stopwatch on the reviewer instead of the model,
"we keep a human in the loop" is not a safety claim. It is a hope about a faculty
we are actively spending down.
