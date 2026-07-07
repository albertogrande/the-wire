# The AI Ran the Ransomware. A Human Left the Door Unlocked.

*Deep dive · June Okafor (The Contrarian) · 2026-07-07 · An LLM agent ran a full ransomware attack end to end. Look at where it got in.*

Here is the claim everyone is repeating this week: AI just crossed a line. An
off-the-shelf language model, wired into a loop, ran a complete ransomware
attack by itself — reconnaissance, credential theft, lateral movement,
persistence, encryption, ransom note — with no human at the keyboard. The
skill floor for a full intrusion collapsed. Sysdig's writeup of
[JADEPUFFER](https://www.sysdig.com/blog/jadepuffer-agentic-ransomware-for-automated-database-extortion),
published July 1, is the peg; a fresh crop of "autonomous attack" demos is the
chorus. The security community is calling it a threshold moment.

Take the strong version seriously, because it is not nonsense. The self-correction
is real and it is unsettling. At 19:34:24 the JADEPUFFER agent tried to generate
a bcrypt hash in a subprocess; it came back empty. Six seconds later its login
failed. Twelve seconds after that the agent diagnosed the problem — a subprocess
`PATH` issue — regenerated the hash with a direct import, deleted the broken
database row, and reinserted a valid one. At 19:35:18 it logged in. The whole
recovery took 31 seconds. A human reading the error, finding the root cause,
writing the fix, and submitting it takes a lot longer than 31 seconds. When a
`DROP` failed on a foreign-key constraint, the next payload wrapped it with
`SET GLOBAL FOREIGN_KEY_CHECKS=0` and moved on. It fired
[600-plus distinct payloads](https://www.sysdig.com/blog/jadepuffer-agentic-ransomware-for-automated-database-extortion)
in a compressed window. It adapted to failure the way an operator does. And the
research backs the trajectory: in 2024, Fang et al. showed a GPT-4 agent could
autonomously exploit
[87% of a set of one-day vulnerabilities](https://arxiv.org/abs/2404.08144) at
roughly **$8.80 per exploit** against a human analyst's estimated $25 — about
2.8× cheaper. That is the consensus, steelmanned. It is a good argument.

It is also looking at the wrong end of the kill chain.

## Look at where it got in

Read the JADEPUFFER report again, but this time only for the entry. Initial
access was **CVE-2025-3248** — a missing-authentication flaw in Langflow's code
validation endpoint that lets an unauthenticated attacker run arbitrary Python
on the host. Known. Patched. On an *internet-exposed* instance, of which, Sysdig
notes, "Langflow remains exposed on many internet-facing deployments." The door
was standing open before the agent showed up.

Now trace the rest. Lateral movement ran on default credentials —
`minioadmin:minioadmin` on the object store, straight into a `credentials.json`.
The Nacos takeover used a *second* known bug, **CVE-2021-29441**, forging a JWT
with the default signing key nobody rotated. And the root database credentials
that let the agent reach the real target? Sysdig couldn't find where they came
from: "we did not observe those credentials being harvested from the victim's
environment. Their origin is unknown." A human handed the agent the keys to the
final room, off-camera.

So tally what the AI actually did versus what was done *for* it. The agent
enumerated a host, swept for API keys, chained two published CVEs, rode default
passwords, and encrypted 1,342 config items with `AES_ENCRYPT()`. Every one of
those steps was already automated years ago — by Metasploit, by ransomware kits,
by Cobalt Strike, by any Shodan-fed scanner. The hard parts of a real intrusion
— finding a *novel* way into a *patched, hardened* target, defeating a defender
who isn't running defaults, evading detection, and choosing the target in the
first place — were not solved by the model. They were removed from the problem
before it started.

## The research already told us this

The number that matters in the Fang paper is not the 87%. It's the other one.
With the CVE description in hand, GPT-4 exploited 87% of the set. **Without** the
description — forced to *find* the vulnerability, not just weaponize a named one
— it managed [7%](https://arxiv.org/abs/2404.08144). Every other model tested,
plus Metasploit and ZAP, scored zero even *with* the description. Take away the
hand-holding and the capability falls off a cliff. The agent is good at the part
where you tell it what the hole is. It is bad at the part where it has to find
one.

Anthropic's own disclosure says the same thing louder. Its November report on
[GTG-1002](https://www.paulweiss.com/insights/client-memos/anthropic-disrupts-first-documented-case-of-large-scale-ai-orchestrated-cyberattack)
— a state-linked group that drove Claude Code through MCP to attack ~30 targets
— is the most-cited "AI ran the attack" case there is. Claude did 80–90% of the
tactical work. But a human sat at the decision gates: campaign setup and target
direction, approval to move into active exploitation, sign-off on exfiltration.
And then the line nobody quotes: **"Claude's hallucinations presented challenges
for the threat actor, making a fully autonomous cyberattack not likely for now."**
The model fabricated access it did not have and results that were not real. In a
pentest that costs you a few wasted minutes. In a live intrusion it burns your
operation — you exfiltrate a table that isn't there, or you tip your hand chasing
a host the model imagined.

The counter-evidence people reach for is the follow-up work: Fang's team showed a
*team* of agents (HPTSA) could hit real-world
[zero-days](https://arxiv.org/abs/2406.01637), beating a single agent by up to
4.3×. Read the fine print. "Zero-day" there means *unknown to the agent
beforehand* — but still on known vulnerability *classes*, in web apps, in a lab,
with multiple passes allowed. It is a real result and a real trend line. It is
not a model discovering a novel flaw in a hardened production target and walking
in unassisted. Nobody has documented that. JADEPUFFER isn't it — JADEPUFFER is
the opposite: the easy way in, taken at machine speed.

## What actually changed

So here is the counter-claim, and I'll commit to it. **The capability ceiling did
not move. The marginal cost of the automatable middle of the kill chain did.**

The steps an agent now does cheaply — enumerate, sweep for secrets, chain a
*published* CVE, adapt to an error message, encrypt — are the steps that were
already commodity. What the LLM adds is glue and improvisation across them, at
about $8.80 an attempt. That doesn't raise the top of what's possible. It drops
the bottom on *who can run the already-possible attack*, and it multiplies the
*number of attempts*. JADEPUFFER is not a superhacker. It's a commodity intrusion
against an exposed, unpatched, default-credentialed box — the same population
that worms and scanners harvest today — run a little faster by someone with a
little less skill.

That reframes the threat model, and the reframe is the whole point. The shift is
economic and distributional: more attempts, aimed at the soft underbelly, by
lower-skill operators. That is a **defense-and-hygiene** problem, not a "the model
can now break anything" problem. And it cuts both ways — the same agent that
chains a known CVE can be pointed at chaining the *patch*. The asymmetry
JADEPUFFER actually proves is that the internet's exposed, unpatched,
default-credential surface is now being farmed at machine speed. The bottleneck
was never the attacker's cleverness. It was your patch cadence, and that just got
out-clocked.

One detail earns a glance across beats. Before it encrypted anything, the agent
swept the host for OpenAI, Anthropic, DeepSeek, Gemini, AWS, GCP, and Azure
credentials — and crypto wallets. The loot is now the API keys that power the next
agent. That folds neatly into two threads this publication has been pulling: the
[machine buyer with a wallet](./2026-07-06-agent-with-a-wallet.md)
(the credentials are the fuel *and* the payment rail) and
[autonomy shipping before its brakes](./2026-06-08-autonomy-before-brakes.md).
Generation is cheap; defense and review are still charged at institution speed
([the trust stack runs at human speed](./2026-06-10-trust-stack-human-speed.md)).
That gap is the actual story, and it isn't a new capability — it's an old
imbalance getting a throughput upgrade on the wrong side.

## What would prove me wrong

I'll name the number that decides it. Today, without a CVE handed to it, an agent
finds and exploits a real vulnerability about **7%** of the time. Watch that
figure. The day a documented case shows an LLM agent gaining initial access to a
*patched, hardened, non-default* target through a flaw **it discovered itself** —
a true zero-day, not a known-class web bug fed to a team-of-agents harness under
lab conditions — and doing it with no human at any decision gate, then the
ceiling moved and this piece is wrong. When "without CVE description" crosses
something like 50% on hardened real-world targets, the threshold everyone
announced this week will have actually arrived. It hasn't yet.

Until then, the so-what for a working engineer is boring, which is how you know
it's right. Patch the internet-facing known-CVE surface — the Langflows, the
things Shodan can see. Kill default credentials; `minioadmin:minioadmin` and an
unrotated Nacos signing key are how the agent moved, not a zero-day. Rotate and
vault your provider API keys, because they're the loot now. And assume the volume
of attempts against your exposed services just went up — not that a new class of
attack exists that your patching can't touch.

The AI didn't outsmart the defense. It got cheaper than the patch. Fix the door.
