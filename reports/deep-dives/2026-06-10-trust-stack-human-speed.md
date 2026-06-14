# The Trust Stack Was Built for Human-Speed Software

*Deep dive · 2026-06-10 · Two npm worms beat code review, signed provenance, and install-script scanning in one week. Here's why every layer failed, and what actually changes now.*

In the first week of June, two worms hit npm. [Miasma](https://www.wiz.io/blog/miasma-supply-chain-attack-targeting-redhat-npm-packages) poisoned 32 Red Hat packages — about 80,000 weekly downloads — using a compromised employee account. [IronWorm](https://www.bleepingcomputer.com/news/security/new-ironworm-malware-hits-36-packages-in-npm-supply-chain-attack/) hit 36 more, hunting 86 environment variables and 20 credential files, including OpenAI and Anthropic API keys. By June 8, Socket counted [471 malicious artifacts](https://socket.dev/blog/mini-shai-hulud-miasma-and-hades-worms-target-bioinformatics-and-mcp-developers-via-malicious) across npm and PyPI in the broader campaign. The worm even spread into [73 of Microsoft's own GitHub repos](https://securityaffairs.com/193367/malware/miasma-worm-compromises-73-microsoft-github-repositories.html), including Azure projects.

The headline isn't the scale. It's what got bypassed. Miasma never tricked a human reviewer: it used orphan commits that no one ever saw. It never forged a signature: it stole GitHub Actions OIDC tokens and published packages with *valid* SLSA provenance. And when scanners adapted, it moved execution from install scripts to a 157-byte `binding.gyp` file, sidestepping the tools built to watch install scripts.

Here's the thesis, stated plainly: **our supply-chain defenses were designed for a world where humans write code, humans review it, and attacks take months to build. None of that is true anymore.** Attacks now ship at copy-paste speed. Defenses still ship at committee speed. And AI is widening the gap from both ends — multiplying the code that needs reviewing while turning API keys into the most liquid stolen good on the market.

This builds on [last week's issue](../2026-W23.md), which covered the worms as news. This piece is about the system underneath.

## Eight years of the same lesson

Every generation of npm attack has defeated the defense built against the previous one. The timeline is worth seeing compressed:

- **2018 — event-stream.** A maintainer hands publish rights to a helpful volunteer. The volunteer ships a Bitcoin stealer. Lesson: don't trust handoffs.
- **2021 — ua-parser-js** (7M weekly downloads) hijacked via a stolen npm account. Response: mandatory 2FA for top maintainers.
- **2022 — colors.js / node-ipc.** The *legitimate, verified authors* sabotage their own packages. No provenance scheme addresses this.
- **2024 — XZ Utils.** "Jia Tan" spends 2.5 years earning maintainership, then lands an sshd backdoor in properly signed releases. Caught only because [one engineer noticed 500ms of ssh latency](https://www.cisa.gov/news-events/alerts/2024/03/29/reported-supply-chain-compromise-affecting-xz-utils-data-compression-library-cve-2024-3094).
- **September 2025 — Shai-Hulud**, the first self-replicating npm worm: 500+ packages, [a CISA alert](https://www.cisa.gov/news-events/alerts/2025/09/23/widespread-supply-chain-compromise-impacting-npm-ecosystem). Version 2.0 in November hit [~796 packages and exposed ~14,000 secrets across 487 orgs](https://www.wiz.io/blog/shai-hulud-2-0-ongoing-supply-chain-attack). Response: GitHub deprecates classic tokens, pushes OIDC trusted publishing.
- **May 2026 — Mini Shai-Hulud.** A group called TeamPCP hits TanStack, UiPath, and Mistral AI — ~200 packages with [518M cumulative downloads](https://thehackernews.com/2026/05/mini-shai-hulud-worm-compromises.html). First worm to publish packages with **valid SLSA Build L3 provenance**, by hijacking the project's own OIDC pipeline. Then TeamPCP open-sources the worm.
- **June 2026 — Miasma.** Per Wiz and [Snyk](https://snyk.io/blog/miasma-supply-chain-attack-malicious-code-redhat-cloud-services-npm-packages/) independently: a lightly reskinned copy of TeamPCP's open-sourced code. From open-sourcing to a new campaign against Red Hat took about three weeks.

That last gap is the story. Provenance took two years to go from launch to [12.6% adoption among top packages](https://medium.com/exaforce/npm-provenance-the-missing-security-layer-in-popular-javascript-libraries-b50107927008) (one study, late 2024 — the freshest number available, which is itself telling). The attack that defeats provenance took three weeks to clone. Defense moves at the speed of institutions. Offense now moves at the speed of `git clone`.

## How you mint a real signature for fake code

The mechanics matter, because they explain why the official fix misses.

npm's trusted publishing binds an OIDC identity to a **repository plus a workflow filename**. Not to a branch. Not to a reviewed commit. Miasma's attacker pushed orphan commits — commits attached to no branch, invisible in any PR — that rewrote the trusted workflow into a self-publishing job. GitHub minted the OIDC token, because repo and filename matched. npm attached valid SLSA provenance, because the pipeline was the real pipeline.

Snyk's one-liner is the precise diagnosis: provenance "confirms which pipeline produced the artifact, not whether the pipeline was behaving as intended." We built a system that proves *where* code came from and called it proof of *trustworthiness*. Those are different claims. The attacker exploited the difference.

The credential side has the same human-speed problem. Per [CybelAngel's reconstruction](https://cybelangel.com/blog/miasma-supply-chain-attack-the-seven-week-credential-trail/), the Red Hat employee's credentials showed up in infostealer logs on April 13 — including an MFA-bypassing session cookie. The attack came June 1. The stolen identity sat in the criminal supply chain for **48 days**, sold and repackaged, before anyone weaponized it. Today's "contained" incident is August's initial access.

## Why attackers want your `.env` now

IronWorm's target list is the part with new economics. Old npm malware mined crypto or stole wallets. IronWorm enumerates OpenAI and Anthropic API keys by name.

The reason is a functioning market. "LLMjacking" — [named by Sysdig in 2024](https://www.sysdig.com/blog/llmjacking-stolen-cloud-credentials-used-in-new-ai-attack) — has matured: stolen LLM credentials sell for $15–30 at the low end, one marketplace listing showed 417 OpenAI credentials averaging $450 each with a 23-day usable lifespan (single-sourced; treat the precision loosely), and victims can burn up to $100K a day in stolen compute. The [pricing dive](./2026-06-07-ai-coding-honest-pricing.md) argued that metering turned tokens into money. Criminals agree. An API key in your CI is no longer config. It's cash in an unlocked drawer.

And the volume of attacks is scaling like a software product, because it is one. Sonatype counted [454,648 new malicious open-source packages in 2025 alone](https://www.sonatype.com/blog/open-source-malware-index-q4-2025-automation-overwhelms-ecosystems) — over 1.2M cumulative — with a 476% Q4 surge driven by "automated npm attacks and self-replicating malware." One spam campaign published a malicious package every 7 seconds. The average npm project pulls [~79 transitive dependencies](https://arxiv.org/html/2512.14739v1). Multiply those numbers and "a human looks at the diff" stops being a control. It's a ritual.

## The fix that shipped vs. the hole that was exploited

GitHub responded fast. On June 9 it announced [npm v12](https://github.blog/changelog/2026-06-09-upcoming-breaking-changes-for-npm-v12/), due around July: install scripts disabled by default, Git and remote-URL dependencies blocked by default, an explicit `npm approve-scripts` allowlist. This is good. It's also overdue — pnpm has shipped this default since January 2025, and Bun always required opt-in. Only [~2.2% of npm packages](https://github.blog/changelog/2026-06-09-upcoming-breaking-changes-for-npm-v12/) declare install scripts (single-sourced study), so the cost is near zero.

But look at the mismatch. The fix kills install scripts. Miasma's third wave had *already moved past install scripts* — the "Phantom Gyp" variant executes through `binding.gyp` during native builds, three days after script-disabling became the consensus advice. And the hole that made the whole campaign possible — OIDC trusted publishing binding to a workflow file instead of a reviewed ref — has **no announced fix**. Third parties (Endor Labs, StepSecurity) are calling for branch and ref binding. The GitHub changelog doesn't even mention Miasma by name.

This is the pattern [Chainguard described](https://www.chainguard.dev/unchained/chainguard-artifacts-safe-from-miasma-phantom-gyp-npm-attack) bluntly: "Each iteration of the attack requires a new category of defense, not just updated blocklists." We keep fixing the previous attack.

## AI is five characters in this story at once

It's worth being precise about AI's role, because it's not one role.

**AI is the throughput.** Anthropic's [June report](https://www.anthropic.com/institute/recursive-self-improvement) says Claude now writes over 80% of the code merged into its own codebase, and a typical engineer merges 8x more code per day than in 2024. Whatever discount you apply to a vendor's self-report, the direction matches what high-adoption teams describe. Review capacity did not grow 8x.

**AI is the loot.** IronWorm's key-harvesting, above.

**AI is the camouflage.** IronWorm's malicious commits were authored as "claude," with timestamps backdated up to 13 years (per JFrog). In a repo where most commits *are* agent-authored, that's smart camouflage. Nobody double-checks the robot's name on the robot's commits.

**AI is the attack surface.** Adversa's [TrustFall research](https://www.securityweek.com/ai-coding-agents-could-fuel-next-supply-chain-crisis/) showed coding agents themselves are an initial-access vector — "the initial-access bar collapsed to 'clone and hit Enter.'" Some Miasma payloads reportedly trigger when an infected repo is opened in an AI-assisted editor (single-sourced framing; hold loosely). Snyk found malicious payloads in agent-skill marketplaces.

**And AI is the proposed defense.** Socket pitches AI scanning. It works — sometimes in minutes. The strongest evidence it works: the worms now embed fake system prompts in code comments, designed to derail LLM-assisted analysis. Attackers don't write prompt injection against defenses that don't bother them.

The same week all this landed, GitHub started [charging for AI code review](https://blog.codacy.com/github-copilot-code-review-used-to-be-included-from-june-1st-you-pay-twice) — credits plus Actions minutes. Pricing the review layer while the review layer is the active battleground is a choice. Microsoft owns GitHub, owns npm, was the defender of record, and was also a victim — its Durable Task project got hit in May and again in June. The re-compromise is the detail to remember: even the defender of record couldn't keep the same credentials clean for a month.

## The case that this is all fine

The contrarian case is real, so here it is at full strength.

Realized damage keeps being tiny. The September 2025 chalk/debug compromise sat on packages with 2.6 *billion* weekly downloads and netted the attacker under $1,000. Most Miasma versions were revoked within about two hours. Socket flagged a malicious Axios dependency [within 6 minutes](https://www.huntress.com/blog/axios-npm-compromise) of publication. One attacker in the TanStack campaign was literally defeated by a linter — ruff failed CI on the malicious code twice, and they gave up. The Mini Shai-Hulud payload shipped with a bug that made it non-functional in the UiPath and Mistral packages. Download counts aren't infection counts: lockfiles pin old versions, most downloads are CI mirrors, and malicious versions live for hours.

Meanwhile the structural fixes are shipping. Trusted publishing killed the long-lived-token class that powered the original Shai-Hulud. npm v12 closes install scripts in July. pnpm and Bun users were never exposed to the primary vector. Red Hat's own pipeline strips install scripts before deployment, which is why [console.redhat.com itself was never compromised](https://access.redhat.com/security/vulnerabilities/RHSB-2026-006) even when its npm packages were. And AI scanners can review every diff of every dependency on every publish — something humans never did. On this reading, June 2026 isn't the trust stack failing. It's the old, optional, human-speed parts being loudly retired while machine-speed replacements come online.

I buy about 60% of this. The detection-speed numbers are real and improving. Here's the 40% I don't buy. First, secrets stolen inside the detection window are *permanent* — Shai-Hulud 2.0's 14,000 exposed secrets don't get un-exposed when the package is revoked, and the 48-day credential-resale lag means each "contained" incident funds the next one. Second, "caught in two hours" still means thousands of CI runs executed the payload. Third, the binding.gyp pivot came three days after the consensus fix. The immune system is fast. The pathogen's mutation rate is faster, because the pathogen is open-source software with motivated maintainers.

## What to actually do

For a team running modern JS/TS with AI agents in the loop, this week's homework, in priority order:

1. **Disable install scripts now.** Don't wait for npm v12 in July. Use pnpm, or `ignore-scripts=true` in `.npmrc`, with an explicit allowlist for the few packages that need them. Cost: near zero. Coverage: the primary worm vector (but not binding.gyp on machines that build native modules — know which ones do).
2. **Treat AI API keys like payment credentials.** Scoped, capped, short-lived, rotated on schedule, never in `.env` files an install script can read. If a key can spend $100K of compute, secure it like it's $100K.
3. **Pin with lockfiles and add a cooldown.** Most victims of these worms pulled a malicious version published hours earlier. A 3–7 day minimum-age policy for new dependency versions would have skipped every campaign this year.
4. **Audit your OIDC trust.** If you publish packages: check what your trusted-publishing config actually binds to. Workflow filename alone is not enough — that's the Miasma hole. Watch for (and adopt) ref binding the day GitHub ships it.
5. **Assume agent-authored commits get verified, not trusted.** "claude" as a commit author is now camouflage. Review gates should key on what changed, never on who the author string says wrote it.

## What would change my mind

Three things. If GitHub ships branch/ref binding for trusted publishing and a year passes without a provenance-bypass campaign, the "configuration bug, not architecture failure" camp wins and this piece overstated the rot. If the chalk/debug pattern holds — billions of exposed downloads, three-figure attacker profits — for another two worm generations, then the economics genuinely don't work for attackers and the immune-system view is right. And if AI dependency-scanning drives time-to-detection reliably under the time-to-first-CI-run — call it under five minutes, ecosystem-wide — then machine-speed defense has actually closed the loop, and the trust stack will have been rebuilt for machine-speed software the only way it was ever going to be: by machines.

Until then, the honest summary is one sentence: we automated writing code years before we automated trusting it, and June 2026 is what that gap looks like.
