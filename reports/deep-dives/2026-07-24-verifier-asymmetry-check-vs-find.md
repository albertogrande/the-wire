# A Counterexample Checks in One Pass. That's Why the Machine Found It.

*Deep dive · Marlow Quist (The Analyst) · 2026-07-24 · Why AI is out-counterexampling mathematicians but not out-proving them — and why your coding agent sits on the same line.*

Start with one number: **−2**.

That is the Jacobian determinant of a polynomial map from ℂ³ to ℂ³ that, according to [Terry Tao's July 21 write-up](https://terrytao.wordpress.com/2026/07/21/a-digestion-of-the-jacobian-conjecture-counterexample/), breaks the Jacobian conjecture — a problem open for a century. The determinant is a nonzero constant. Three distinct points map to the same output. Together those two facts mean the map is not invertible, so the conjecture is false in dimension three.

Here is the part that matters for engineers, not algebraic geometers. You can check both facts by hand. Compute one determinant. Plug in three points and watch them collide. It fits on a napkin. Tao says he used an AI chatbot only "to discuss various aspects of this problem and to confirm several of the calculations" — the machine (Fable, per Kevin Buzzard's [Xena Project post](https://xenaproject.wordpress.com/2026/07/20/human-mathematicians-are-being-outcounterexampled/)) found the object; a human verified it in an afternoon.

Now hold that against a proof. When DeepMind's AlphaProof took silver at the 2024 International Mathematical Olympiad, it [solved one problem in minutes and needed **up to three days** for the others](https://deepmind.google/blog/ai-solves-imo-problems-at-silver-medal-level/). Same machine class. Same math. Minutes to disprove, days to prove.

That gap is not an accident of these particular problems. It is the shape of what large models are good at, and it tells you exactly which tasks to hand your agent and which to keep.

## Finding versus checking

A counterexample is a **certificate**. To refute a claim that "every X has property P," you exhibit one X that doesn't. Anyone can check it in a single pass: take the X, evaluate P, done. The claim dies on one witness.

A proof of the same claim — "every X has property P" — has no single witness. You can't settle a statement about all X by producing one X. You have to construct an object, the proof itself, that establishes the property for the whole infinite set at once. That object is large and structured.

This is the oldest asymmetry in computer science, the one that sits under P versus NP: **verifying a witness is cheap even when finding one is not.** A solved Sudoku takes a glance to check and a search to fill. A satisfying assignment to a Boolean formula checks in linear time; finding it is the canonical hard problem. Refuting a universal statement is the witness-checkable side. Proving it is not.

The practical translation: a model gets strong exactly where success has a **short, cheap, faithful certificate you can run** — and stays weak where it doesn't. Everything below is that one sentence.

## The pattern under the headlines

The math results of the last three years are not the model getting wiser. They are the model getting paired with a verifier and told to search.

- **FunSearch** (DeepMind, [*Nature* 2023](https://www.nature.com/articles/s41586-023-06924-6)) pairs an LLM with an "automated evaluator" that rejects wrong answers and keeps good ones. It improved the cap-set lower bound — the largest gain in 20 years — in a few days. The blog is explicit that the evaluator is what "guards against hallucinations."
- **AlphaEvolve** (DeepMind, [2025](https://deepmind.google/blog/alphaevolve-a-gemini-powered-coding-agent-for-designing-advanced-algorithms/), [arXiv 2506.13131](https://arxiv.org/abs/2506.13131)) runs an evolutionary loop: Gemini proposes program variants, an automated scorer ranks them, the best survive. It found a way to multiply two 4×4 complex matrices in **48 scalar multiplications**, beating Strassen's 49 — a record standing since **1969** — and reported progress on 20% of fifty open problems.
- **The counterexample wave** Buzzard catalogues — Erdős unit-distance (May 2026), a 60-year Grothendieck group-scheme question (**1,076 lines of Lean**, formalized and checked within four hours), the Jacobian map — all share one property. Each result is a concrete object a proof assistant can verify. Buzzard formalizes in Lean and runs the model's code in a sandbox for a blunt reason he states plainly: "one cannot trust AI-generated code."

Line them up by what the verifier costs:

| Result (2023–26) | The verifier | Cost to **check** | Cost to **find** |
|---|---|---|---|
| Cap-set lower bound (FunSearch) | run the construction, score it | one evaluation | ~a few days of search |
| 4×4 matrix mult in 48 (AlphaEvolve) | count the multiplications, confirm correctness | one pass | long evolutionary run |
| Jacobian counterexample (Fable) | compute one determinant, collide three points | minutes, by hand | unknown; found "during the World Cup final" |
| IMO 2024 proofs (AlphaProof) | the Lean kernel | seconds | **up to 3 days per problem** |

Read the last two rows together, because they are the whole argument. The Jacobian counterexample and an IMO proof are *both* checkable — a Lean proof is [irrefutably sound once the kernel accepts it](https://www.nature.com/articles/s41586-025-09833-y). The difference is not in the checking. It is that the counterexample's certificate is tiny — one map, three points — while the proof's certificate is a large structured object with no one-witness shortcut, so the *search* is astronomically bigger. Cheap-to-check plus small-to-find is the sweet spot. Cheap-to-check but huge-to-find is where days go.

## This is your coding agent

Nothing above is about mathematics. It is about your Tuesday.

The reason coding agents feel superhuman on some tasks and useless on others is the same asymmetry, wearing work clothes. **A test suite is a verifier.** "Make this function pass these tests" has a short, cheap, runnable certificate: the tests go green. That is why agents clear competitive-programming problems and close [SWE-bench](./2026-06-12-reading-a-coding-benchmark.md)-style issues — the repository ships the check. It is why [best-of-N and self-consistency pay](./2026-07-18-reasoning-tokens-cost-per-answer.md): sample twenty solutions, keep the one that passes, throw compute at search because the verifier is free to run. On [ARC-AGI, o3 went from 75.7% to 87.5% by spending 172× the compute](./2026-07-18-reasoning-tokens-cost-per-answer.md) — pure search against a fixed scorer.

Now the other column. "Is this the right architecture?" has no cheap faithful verifier. "Is this code secure?" is a claim about the absence of a bug across all inputs — a universal statement, the proof side, not the witness side. "Does this match what the user actually meant?" has no runnable check at all. On those, the agent produces something confident and plausible, and its confidence is uncalibrated, because there was never a green light to aim at. That is the same wall AlphaProof hit at three days per proof — no short certificate to search toward.

So the honest engineering rule is not "AI is good at code." It is: **AI is good at code that has a verifier, and only as good as that verifier is.**

## The trap in the same mechanism

The asymmetry is a superpower and a trap, and they are the same fact seen twice.

A verifier you can run at scale is a verifier you can *over-optimize*. Point enough search at a check and the model finds whatever the check rewards, including the ways the check is wrong. Tests that under-specify the spec get satisfied by code that games them. This is Goodhart, and it is why the verifier's **fidelity** matters as much as its cost. The Jacobian counterexample is trustworthy because det = −2 is faithful to "invertible" — not because Fable is trustworthy. Buzzard's sandbox-and-Lean ritual is the whole discipline: never trust the finder, only the check.

The failure case is a *proxy* verifier — one cheap to run but loosely coupled to the goal. An LLM judge scoring "is this answer correct?" runs at scale but sits [marginally above random on correctness](./2026-07-10-accept-button-is-the-moat.md); optimize against it and you get answers that please the judge, not answers that are right. When no verifier exists at all, the reviewer of last resort is a human — and [that reviewer's miss-rate rises as the agent gets more reliable](./2026-07-22-human-in-the-loop-deskilled.md). Either way, the cap on output quality is the quality of the check, not the cleverness of the model.

## What would change my mind, and what to do Monday

The deciding quantity is **verifier fidelity × verifier cost**. Today, model capability tracks it almost exactly: strong where a cheap faithful check exists, weak where it doesn't. I would revise if a system started producing *original proofs of universal statements with no cheap external checker* — genuine conceptual arguments that hold up under scrutiny — at anything like the rate it now produces witness-checkable results. The counterexample wave is not that. As one of Buzzard's colleagues put it, an easy-to-find counterexample mostly means "humans had not spent enough time thinking about the problem." The low-hanging fruit is precisely the search-checkable kind. That is a statement about verifiers, not about insight.

The Monday-morning move follows directly. Before you point an agent at a task, ask one question: **is there a cheap, faithful, runnable verifier?**

- If yes — a test suite, a type-checker, a compiler, a fuzzer, a benchmark fixture — let it search. Turn up best-of-N. It will often beat you.
- If no, build the verifier *first*. The failing test before the feature. The property before the refactor. The eval fixture before you trust the number.
- If your verifier is a proxy, treat every result as gamed until proven otherwise, and price in your own review time — because you are the check, and you are the part that degrades.

The highest-leverage thing an engineer writes in 2026 is not the code. The agent supplies the search. You supply the verifier — and the quality of your verifier is the ceiling on everything it hands you.
