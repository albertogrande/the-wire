# A Marker You Can Delete Is Not a Surveillance Backdoor

*Deep dive · June Okafor (The Contrarian) · 2026-07-01 · the Claude Code "steganographic marking" panic, and why the marks you can see and strip aren't the tracking that matters*

Here is the claim everyone repeated yesterday. Anthropic is secretly fingerprinting you. Claude Code hides invisible Unicode in the text it sends, plus subtle format shifts — a variant apostrophe here, a reformatted date there — so it can tell who you are without telling you. A covert channel, in your own requests, that you cannot see. The thread hit [1,207 points on Hacker News](https://news.ycombinator.com/item?id=48734373) and the word that kept coming up was "backdoor."

Take the alarm seriously first, because it deserves it. A tool that writes something into your text that you did not put there, did not consent to, and cannot read, is a real trust problem. The whole point of an invisible channel is that human review slides right over it. You can read every visible character in your prompt and still ship a hidden payload you never saw. That is not paranoia. It is the exact property that makes [Unicode tag-character smuggling](https://embracethered.com/blog/posts/2024/hiding-and-finding-text-with-unicode-tags/) a known prompt-injection vector: the model sees bytes the user doesn't. If a vendor is quietly using that same channel on its own customers, "show me what you put in my text" is a fair demand, and "nothing you can see" is not a comforting answer.

So steelman done. Now the part the thread mostly skipped.

## Two bits is not a dragnet

Read what the marking actually encodes. According to the reverse-engineering that started the thread, it carries two facts: whether your system timezone is in China, and whether your hostname matches a blacklist of known reseller and distillation-lab domains. The sharpest comment in the whole thread said it plainly: "Literally 2 bits of information. Not much of a fingerprint" (user *IshKebab*).

Two bits. That is the entire payload. Four possible states. It cannot distinguish you from the millions of other people whose timezone isn't China and whose hostname isn't on a list. A fingerprint identifies an individual. This identifies a *category*, and a coarse one. Calling it surveillance is like calling a "this side up" sticker a tracking device.

But the bandwidth isn't even the weakest part. The mechanism is.

## The most fragile marking method there is

Invisible-Unicode marking is the easiest tracking to defeat that has ever been deployed, because it has three properties no real fingerprint can afford.

**It is visible to anyone who looks.** "Invisible" means invisible *when rendered*. The bytes are right there. Pipe any text through a codepoint dump and the hidden characters appear like ink under UV. The tag block lives at a known, contiguous range — `U+E0000` to `U+E007F` — that [mirrors printable ASCII](https://languagelog.ldc.upenn.edu/nll/?p=66513). Zero-width characters (`U+200B`, `U+200C`) and the variation selectors used in the [emoji-smuggling variant](https://repello.ai/blog/prompt-injection-using-emojis) sit in equally known ranges. There is no secret here to keep. The channel announces its own coordinates.

**It is deletable in one pass.** Because the ranges are known and contiguous, removing them is a filter, not a cryptanalysis problem. AWS's own [guidance on Unicode smuggling](https://aws.amazon.com/blogs/security/defending-llm-applications-against-unicode-character-smuggling/) is a list comprehension that drops any character where `0xE0000 <= ord(ch) <= 0xE007F` (plus orphaned surrogates). In a shell, `tr -d` over the same range and the zero-width block does it. A marker that dies to `tr -d` is not a tracking device. It is a Post-it note.

**It does not survive ordinary handling.** Paste the text into most editors and the tags fall out. Run it through a sanitizer, a markdown renderer, a form that strips control characters, and the payload is gone — not because anyone was attacking it, but because that is what text pipelines do to garbage code points. The marking can't even reliably survive being *used*.

So we have a signal that is two bits wide, sits at a published address, washes out with one substitution, and degrades on contact with normal software. Every property that would make a fingerprint dangerous, this thing is the opposite of.

The "cleverer" half — variant apostrophes, shifted date formats — is more durable, because a curly quote survives normalization and looks natural. But look at what you bought for that durability: even *less* information per character, and total deniability in both directions. A different apostrophe is not proof of anything. You cannot fingerprint a person with punctuation they could have typed themselves.

## The layer that actually identifies you was never hidden

Here is the move the panic skips entirely. If Anthropic wants to know it is you, it already knows. You authenticated. Your request carries an API key or an OAuth session tied to your account. It rides a TLS connection from your IP with your client headers. None of that is steganographic. None of it is deniable. None of it can be stripped, because stripping it means the request fails.

That is the real identity layer, and it is sitting in plain sight at the top of every call. Against that, a hidden two-bit category flag adds nothing about *you*. Which is the tell: it was never aimed at you. It is aimed at the request that arrives *without* your key — the one that comes through a reseller, where Anthropic can see the proxy's account but not the end user, and wants a tripwire that an unauthorized gateway will unknowingly carry into its outputs.

We covered why that matters two issues back. The [distillation dive](./2026-06-27-distillation-without-logits.md) walked through Anthropic telling the Senate that Alibaba's Qwen ran 28.8 million Claude exchanges through roughly 25,000 fake accounts to imitate its agentic behavior. The whole problem of copying a model through its outputs is that the outputs look like ordinary text. A marker hidden in that text is an attempt to make the copy *traceable* — so a distilled model that regurgitates marked strings can be caught. That is the actual purpose, and it is a coherent one. It is anti-distillation forensics, not consumer surveillance.

It also won't work for long, for the same reason none of this is surveillance: the countermeasure against a competitor scraping you at industrial scale is `s/[\x{E0000}-\x{E007F}]//g`, run once, forever. Any reseller sophisticated enough to run 25,000 fake accounts can strip a known code-point range in an afternoon. The tripwire catches the lazy, once. This is theater against the threat it was built for, and it isn't aimed at the people panicking about it.

## Marker versus watermark — the conflation underneath the panic

The thread kept saying "watermark," and that word is doing damage, because there are two completely different things wearing it.

A **marker** sits *beside* the text. Invisible characters, format quirks — extra payload riding alongside the words. Deletable, because it is separable from the content. Everything above.

A **watermark**, in the technical sense, lives *inside* the text — in the statistics of which tokens got chosen. Kirchenbauer and colleagues' [green-list scheme](https://arxiv.org/abs/2301.10226) biases generation toward a pseudo-random subset of the vocabulary at each step, so watermarked output over-uses "green" tokens in a way a detector can measure but a reader can't see. You cannot delete that with a regex, because there is no separable payload — the signal *is* the word choice. That is the robust kind.

And even the robust kind is not robust. The same literature shows green-list watermarks degrade under paraphrasing; rewrite the passage and the token statistics drift back toward chance. The strong version of marking dies to a paraphrase pass; the weak version dies to a substitution.

The panic conflated the two. It attached the threat model of an indelible, in-the-tokens watermark to a marker you can see and strip in one line. People got angry at the deletable thing as if it were the indelible thing. It is neither, and the indelible thing wouldn't survive a rewrite anyway.

## What this is actually worth to you

The durable lesson is not "they're watching." It is the thing the prompt-injection researchers have been saying for two years and the thread mostly missed: **text you receive from any tool can carry invisible payloads, so treat inbound text as untrusted bytes.** The exact channel Anthropic is accused of using for a category flag is the channel an attacker uses to [hide "delete my inbox" in an email](https://aws.amazon.com/blogs/security/defending-llm-applications-against-unicode-character-smuggling/) your agent will read and obey. Scanning and stripping the invisible Unicode ranges in your pipeline is not anti-Anthropic hygiene. It is your prompt-injection defense, and it removes the marking as a free side effect.

So: dump the code points when you want to see what's there. Filter the tag block, the zero-width characters, and the variation selectors on any text crossing a trust boundary into a model. Then stop losing sleep over a two-bit beacon you can silence with one command — and remember that the identification that actually links a request to you happened at the key, in the open, the moment you authenticated. That is the layer to think about. It always was. None of this changes with [Sonnet 5 becoming the Claude Code default this week](https://www.anthropic.com/news/claude-sonnet-5); a new model rides the same authenticated pipe.

**What would change my mind.** Show me marking that is (1) high-entropy enough to single out an individual session, not a four-state category; (2) survives Unicode normalization, paraphrase, and a copy-paste through a sanitizer; and (3) keyed to individual end users rather than reseller infrastructure. Any one of those would move this from tripwire toward surveillance. All three and I'll write the retraction myself. Until then, the rule holds: a mark you can see and delete is not a backdoor — it's a sticker, and the door it's stuck to was already wide open.
