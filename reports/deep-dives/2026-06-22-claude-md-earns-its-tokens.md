# Your CLAUDE.md Is Loaded Every Turn. Most of It Shouldn't Be.

*Claude Code · Kit Sandoval (The Operator) · 2026-06-22 · why the file meant to make Claude smarter often makes it follow you less — and the four-tier setup that fixes it.*

Here's a failure you've hit. You put a rule in `CLAUDE.md`: "Run the single test, not the whole suite." Claude runs the whole suite anyway. So you add `IMPORTANT`. Next session it still runs the whole suite. The rule isn't being ignored because the model is dumb. It's being ignored because it's buried near the bottom of a 400-line file that loads into the context window before you type a single word — and a long list of standing orders is exactly how you get half of them tuned out.

The mental model most people carry is wrong. `CLAUDE.md` is not documentation that sits on disk until something needs it. Anthropic's own [memory docs](https://code.claude.com/docs/en/memory) are precise: the file "is loaded into the context window at the start of every session, consuming tokens alongside your conversation," and unlike auto memory — which caps at the first 200 lines — `CLAUDE.md` is "loaded in full regardless of length." Every line is in the prompt. Every turn. As tokens you pay for. Past a point, adding lines makes Claude follow you *less*, not more. The best-practices guide says it with an exclamation mark it otherwise never uses: ["Bloated CLAUDE.md files cause Claude to ignore your actual instructions!"](https://code.claude.com/docs/en/best-practices)

So the file you reach for to make the agent more reliable is, past about two screens, the thing making it less reliable. Let's fix that — not by writing a better `CLAUDE.md`, but by moving most of what's in yours somewhere it belongs.

## The tax, measured

Two facts make `CLAUDE.md` load-bearing, and they pull in opposite directions.

First, it's persistent in a way nothing else in your session is. When auto-compaction fires and rewrites your history into a summary — [the lossy save we covered Saturday](./2026-06-20-claude-code-compaction-save-point.md) — your project-root `CLAUDE.md` is re-read from disk and re-injected. It survives the event that throws away most of your context. That's a feature. It's also the reason the file is tempting to overstuff: it's the one channel that always sticks.

Second, it's expensive in the most literal sense, because it's not free advice — it's recurring rent. Samuel Lawrentz, who [cut his Claude Code bill roughly in half](https://samuellawrentz.com/blog/claude-code-token-optimization/), puts the arithmetic plainly: "If yours is 400 lines, those 400 lines are prepended to every single request." Not the first request. Every one. His own file, he admits, "had a section explaining what React is" — a fact the model has known since training, re-billed on every turn for months. His rule after the cleanup: keep it "under 150 lines, behavior only, no facts Claude already knows."

Put those together and you get the trap. The most durable instruction surface is also the most costly one, so people pour everything into it — and then watch adherence quietly degrade. Anthropic targets ["under 200 lines per CLAUDE.md file,"](https://code.claude.com/docs/en/memory) warning that "longer files consume more context and reduce adherence." That number is the ceiling, not the goal.

One more mechanism worth knowing, because it changes what `CLAUDE.md` is *for*: the content "is delivered as a user message after the system prompt, not as part of the system prompt itself." It's advice the model reads and tries to follow, with — their words — "no guarantee of strict compliance." So a `CLAUDE.md` line is a request, not a rule. Hold that thought; it decides where half your file should actually live.

## Why "give it everything" backfires

The instinct is reasonable. The model can't read your mind, so hand it the architecture, the API conventions, the full style guide, the deploy steps — then it never lacks context. I've written that file. You probably have too.

It backfires for the same reason a 60-item to-do list gets less done than a 6-item one. The docs name it as a top failure pattern — "the over-specified CLAUDE.md" — and the diagnosis is exact: "If your CLAUDE.md is too long, Claude ignores half of it because important rules get lost in the noise." The signal you care about (run the single test) is drowning in lines the model didn't need (what React is, a file-by-file tour of `src/`).

There's a popular non-fix worth killing here. People discover `@path` imports and split their giant file into tidy pieces — `@docs/style.md`, `@docs/architecture.md` — and feel lighter. They aren't. Imports are a filing-cabinet trick, not a diet: "imported files still load and enter the context window at launch." Same tokens, more files. The only thing that reduces always-on context is moving content to a channel that loads *on demand*.

## The four-tier setup

The fix is to stop treating `CLAUDE.md` as the one place instructions go, and route each kind of knowledge to the channel built for it. Anthropic's docs describe all four; almost nobody uses more than one.

**Tier 1 — `CLAUDE.md`: always-true behavior only.** This is for things that apply to *every* session and that Claude would get wrong without them. The docs give a clean include/exclude split: in goes bash commands Claude can't guess, code style that differs from defaults, test-runner preferences, repo etiquette, project-specific gotchas. Out goes anything Claude can infer from the code, standard language conventions, detailed API docs, and "file-by-file descriptions of the codebase." Make each line concrete enough to verify — "Use 2-space indentation," not "format code properly." For every line, run the doc's one-question test: *"Would removing this cause Claude to make mistakes? If not, cut it."*

**Tier 2 — `.claude/rules/`: conditional knowledge that loads only when relevant.** This is the lever people miss. A rule file with `paths` frontmatter loads into context *only when Claude touches a matching file*. Your "all API endpoints must validate input and use the standard error format" doesn't belong in every session — it belongs scoped to `src/api/**`. Move it to a rule and it costs zero tokens on the days you're working in the frontend.

**Tier 3 — Skills: procedures, loaded on demand.** If an entry is a multi-step workflow rather than a standing fact — how to cut a release, how to run a migration — it's a [skill](https://code.claude.com/docs/en/skills), not a `CLAUDE.md` section. Skills "load on demand without bloating every conversation." The release checklist you'll run twice a month shouldn't ride along on the bug fix you're doing right now.

**Tier 4 — HTML comments: notes for humans, zero tokens.** Block-level `<!-- ... -->` comments "are stripped before the content is injected into Claude's context." So the maintainer note explaining *why* a rule exists costs the model nothing. Use it freely; it's the one part of the file that's genuinely free.

And the thing that isn't a tier at all: enforcement. If a step "must happen every time with zero exceptions" — run the linter before commit, never touch `migrations/` — a `CLAUDE.md` plea is the wrong tool, because the file is advisory. Write a [hook](https://code.claude.com/docs/en/hooks-guide). Hooks "are deterministic and guarantee the action happens" regardless of what the model decides. Stop asking nicely for the things you can simply make true.

## So what for Monday morning

Run `/memory` to see every instruction file currently loading, then do one prune pass. For each line in `CLAUDE.md`, route it: always-true behavior stays; conditional knowledge moves to a `paths`-scoped rule; procedures become skills; the "why" becomes an HTML comment; the must-happens become hooks. Delete anything Claude already does right without being told — the docs are blunt that if it works without the line, the line is just noise. Aim for under ~150 lines. Then *test it*: watch whether behavior actually shifts. Treat the file like code, because it is — it's in every prompt you send.

A lean project `CLAUDE.md` looks like this, and almost nothing more:

```markdown
# Build & test
- Run a single test: `npm test -- <file>` — never the full suite (slow; ~4 min)
- Typecheck after a batch of edits: `npm run typecheck`

# Style
- ES modules only (import/export), never require()
- 2-space indentation; no default exports

# Repo etiquette
- Branch names: `feat/...`, `fix/...`. Never commit to main.
- IMPORTANT: when compacting, preserve the list of modified files and test commands

<!-- Keep this under ~150 lines. Conditional stuff → .claude/rules/.
     Procedures → skills. Must-happens → hooks. -->
```

The conditional rule that used to bloat it now lives on its own, loading only when earned:

```markdown
---
paths:
  - "src/api/**/*.ts"
---
# API rules
- Every endpoint validates input and returns the standard error shape
```

One prediction, so this is falsifiable. Right now the 200-line ceiling is prose guidance, and `/memory` lists your files without telling you what each one *costs*. I think that gap closes: by Q1 2027, Claude Code surfaces `CLAUDE.md` bloat as a first-class signal — a size warning, a per-file token readout in `/memory` or `/context`, or a `/doctor` check — moving "keep it under 200 lines" from a doc sentence into something the tool shows you (**55%**). The instrumentation always trails the advice; here the advice is already written down, which is usually the tell.

**Do** the prune pass today and route the four tiers. **Watch** adherence, not line count — the win is Claude following the five rules that matter, not a smaller file for its own sake. **Ignore** the urge to "give it everything," and the `@import` tidy-up that feels like a fix and isn't. The file compounds in value, the docs say, over time — but only if you keep paying down the tax, not adding to it.
