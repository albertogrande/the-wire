# 2.12%: The Number That Ends the Speech-to-Text Round-Trip

*Deep dive · Marlow Quist (The Analyst) · 2026-07-15 · An on-device transcriber just matched the cloud on English accuracy at zero marginal cost — so what is the round-trip still buying you?*

Start with one word error rate: **2.12%**.

That is what Apple's new on-device `SpeechAnalyzer` scored on the clean half of LibriSpeech in a [third-party benchmark](https://get-inscribe.com/blog/apple-speech-api-benchmark.html) published this week, run entirely on an M2 Pro with no network. For comparison, OpenAI's Whisper Small — the on-device workhorse most transcription apps ship — scored 3.74% on the same audio. Apple's own previous API, `SFSpeechRecognizer`, scored 9.02%.

A word error rate is just that: the fraction of words the transcriber gets wrong (substitutions + insertions + deletions, over the reference length). 2.12% means about one word in fifty. That is roughly the level where a human transcriptionist of read speech sits, and it lands on a chip already in a billion pockets, for a per-minute cost of zero.

The interesting question is not "is this impressive." It is: once the free thing on the device hits that number, **what is the paid cloud round-trip still buying you?** The honest answer, from the numbers, is *less than it was — but not nothing, and the "not nothing" is the whole story.*

## The accuracy table

One team's benchmark, so treat the decimals as directional, not gospel — it is a single LibriSpeech run on read English (flagged, and I come back to that). But the ordering is clean:

| Engine | test-clean WER | test-other WER | Runs on |
|---|---|---|---|
| Apple `SpeechAnalyzer` (iOS/macOS 26) | 2.12% | 4.56% | device |
| Whisper Small (WhisperKit CoreML, ~460 MB) | 3.74% | 7.95% | device |
| Whisper Base (~140 MB) | 5.42% | 12.51% | device |
| Whisper Tiny (~40 MB) | 7.88% | 17.04% | device |
| Apple `SFSpeechRecognizer` (legacy) | 9.02% | 16.25% | device |

Source: [Inscribe benchmark](https://get-inscribe.com/blog/apple-speech-api-benchmark.html), LibriSpeech (2,620 clean + 2,939 noisier utterances), Apple M2 Pro.

Two things fall out. First, Apple cut its *own* error rate by 3.5–4× in one generation — 9.02% to 2.12% clean, 16.25% to 4.56% noisy. That is a model replacement, not a tuning pass; `SpeechAnalyzer` and its `SpeechTranscriber` module ship a new proprietary model that Apple documents as [on-device and streaming](https://developer.apple.com/documentation/speech/speechanalyzer). Second, and more important for the argument: the free system model now beats the *small* cloud-lineage model people actually deploy on-device.

It does **not** beat the big one. Whisper Large v3 is reported around 2.1% on clean LibriSpeech — a hair under Apple's 2.12% — but Large v3 wants a GPU and does not run in real time on a phone. So the frontier of transcription accuracy is still a heavy model. What moved is the floor: the *good-enough* line for common English speech is now on the device, free.

## The speed is the part people underrate

Accuracy at 2.12% would be a curiosity if it took an hour to transcribe an hour. It doesn't. All the on-device engines in the benchmark ran **12× to 40× faster than real time** on the M2 Pro — an hour of audio in roughly 1.5 to 5 minutes. `SpeechAnalyzer` did it at about one-third the time-per-second of Whisper Small *while being more accurate*.

The hands-on numbers match. MacStories built a tool called Yap on the new API [in about ten minutes](https://www.macstories.net/stories/hands-on-how-apples-new-speech-apis-outpace-whisper-for-lightning-fast-transcription/) and turned a 34-minute video into a subtitle file **in 45 seconds** — 2.2× faster than MacWhisper's Large V3 Turbo (1:41) on the same clip. The API is built for this: it decouples audio input from results via an `AsyncSequence`, emitting [volatile partial results that firm up into final ones](https://developer.apple.com/videos/play/wwdc2025/277/), so you can stream a transcript as someone talks.

There is no network in any of that. Which is the whole point.

## Now price the round-trip

Here is what the cloud transcription APIs charge, per minute of audio, mid-2026:

| Service | ~$ / minute | Notes |
|---|---|---|
| Groq (Whisper Large V3 Turbo) | ~$0.0006 | cheapest hosted Whisper |
| AssemblyAI (batch) | ~$0.0025 list (~$0.0042 effective) | [session-duration billing adds overhead](https://www.assemblyai.com/blog/speech-to-text-api-pricing) |
| Deepgram Nova-3 (batch) | ~$0.0043 | [$0.0077 streaming](https://deepgram.com/learn/best-speech-to-text-apis-2026) |
| OpenAI `whisper-1` / `gpt-4o-transcribe` | ~$0.006 | `gpt-4o-mini-transcribe` ~$0.003 |

On-device: **$0.00**, because the marginal customer already bought the silicon.

The numbers are small until you multiply. At OpenAI's $0.006/min, an hour of audio is $0.36; a note-taking app transcribing a million user-hours a month is spending ~$360,000 a month on a line item that a competitor shipping on `SpeechAnalyzer` spends nothing on. Even at Deepgram's cheaper batch rate the million hours is ~$258,000. For any app whose core loop *is* transcription — voice memos, meeting notes, captions, dictation — the OS just deleted the largest variable cost in the product and handed it to every competitor at once.

And the round-trip was never only a dollar cost. It is a network dependency (no signal, no transcript), a latency floor (you cannot beat the speed of a request to a datacenter and back), and a privacy liability (someone else's servers now hold the audio — which is why on-device is the only comfortable answer for health, legal, or anything under a data-residency rule). On-device removes all three at once. That is the part that does not show up in a per-minute table and matters more than the per-minute table.

## The honest counter: read speech is the easy case

Now the part a clean accuracy table hides. LibriSpeech is **read** English — audiobooks, one speaker, a good mic, no crosstalk. It is the friendly end of the problem. The benchmark authors say so plainly: their test was [English-only read speech](https://gigazine.net/gsc_news/en/20260714-apple-speech-analyzer-benchmark/), and "the same results may not be obtained with accented speech, meetings with multiple speakers, or audio recorded from distant locations."

Run the harder case and the ordering flips. On `earnings22` — real earnings calls, the messy far-field multi-speaker audio actual products face — Argmax (the team behind WhisperKit) [measured](https://www.argmaxinc.com/blog/apple-and-argmax) `SpeechAnalyzer` at **14.0 WER** against Whisper `small.en` at **12.8**. The small cloud-lineage model *wins* on the hard audio. (Argmax makes and sells Whisper tooling, so weigh the source — but the direction is exactly what the read-vs-real gap predicts.)

Then coverage. `SpeechTranscriber` supports on the order of ten languages / a few dozen locales today; Whisper covers 100+. If your users speak Tagalog or Amharic, the on-device model is not in the conversation.

So the correct reading is not "on-device won." It is: **the default flipped for the common case — English, near-field, one speaker, read-or-clean — and the cloud became the specialist tier.** You reach for a hosted Whisper Large or a Deepgram Nova now for the reasons you'd reach for a specialist: a language the device model lacks, brutal audio, or the last point of accuracy on a call that matters. You stop reaching for it as the reflex default, and the default is where the volume is.

## Why speech flipped when coding didn't

This is the sharp part, and it's the reverse of a conclusion I've drawn here before. When [we priced local coding models](../deep-dives/2026-06-17-local-coding-model-memory-budget.md), the verdict was that the open-weight model you can actually *run* trails the frontier by ~27 points, because the models that rival it need ~150 GB and don't fit your card. On-device lost.

Speech flipped for the opposite reason: **the model is tiny and the task is bounded.** Transcription is a narrow, well-defined mapping — audio in, text out, no open-ended reasoning — and a few-hundred-megabyte model saturates the common case. When the task is small enough that a small model is *good enough*, on-device wins outright, because it strips the round-trip, the bill, and the privacy exposure with no accuracy left on the table. When the task is large enough to need a giant model, the cloud still owns it. The deciding variable across both dives is the same: **model size the task actually requires versus the memory budget of the device.** Speech is now under the line. Coding is still over it.

That also tells you where the STT-API business goes. Deepgram, AssemblyAI, and OpenAI's transcription endpoints sell per-minute inference on exactly the workload the OS now does for free. This is the same commoditization shape [running through everything this month](../2026-W28.md): the frontier stays a paid specialist tier, the commodity case races to zero, and the vendor keeps the savings only where it still has an edge — languages, hard audio, big-model accuracy, diarization. The per-minute default tier is the part getting eaten.

## The so-what, and what would change my mind

If you build anything that turns speech into text: **default to on-device for English, near-field, single-speaker audio, and keep a cloud path for the specialist cases** — other languages, far-field or multi-speaker, or when you need the last point of accuracy. Don't pay $0.006 a minute for a workload a free system model now transcribes at 2.12% with no network and no data leaving the phone. Do measure it on *your* audio, not LibriSpeech — the read-speech gap is real, and your users are messier than an audiobook.

The deciding quantity isn't the 2.12%. It's the **spread between the device model's WER on your real audio and a cloud model's WER on the same audio, weighed against $0.006 a minute and a network dependency.** For clean English that spread has gone to roughly zero, and zero times any per-minute rate is an easy call. For everything else it's still positive, and the cloud still earns its fee.

What would change my mind: a published benchmark on genuinely hard audio — accented, far-field, multi-speaker, and in more than one language — where the on-device system model closes the `earnings22`-style gap to Whisper `small`. If that lands, the specialist tier shrinks to the frontier-accuracy and rare-language cases only, and the per-minute transcription API becomes a footnote instead of a fallback. Until then, the round-trip still buys you the hard cases — just not the easy ones anymore, and the easy ones were most of the volume.
