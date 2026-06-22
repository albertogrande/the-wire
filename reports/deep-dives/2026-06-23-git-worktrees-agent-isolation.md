# Your Agents Don't Need a New Git. They Need to Stop Sharing One Checkout.

*Deep dive · Theo Vance (The Builder) · 2026-06-23 · Why parallel coding agents collide, and the twenty-year-old git feature that fixes it before you reach for a new VCS.*

Here is a bug you will hit the first time you run two coding agents at once.

Agent A is building an auth feature on a branch. Agent B is fixing a flaky test. They share one checkout — the directory you opened your editor in. Agent B decides it needs a clean tree, runs `git checkout main`, and the working directory and the index flip under Agent A mid-edit. Or simpler: both write `package.json`, last-writer-wins, and Agent A's new dependency vanishes. Or Agent B runs `npm install`, and now `node_modules` is in a state Agent A never asked for. Nobody crashed. You just have garbage, and no error message telling you why.

This is not an agent problem. It is a concurrency problem wearing an agent costume. A git checkout is **global mutable state**: one working directory, one index, one `HEAD`. Two writers, no lock. We have known how to break this kind of contention for decades — give each writer its own copy. The only question is how cheaply you can make the copies.

This week the question got a fashionable answer. **Oak** — a [Show HN that hit 128 points](https://news.ycombinator.com/item?id=48631726) — is "a Git alternative designed for agents." It throws out git's unit of work (commits and PRs) for [branch-per-session](https://oak.space/oak/oak), swaps SHA-1 for BLAKE3, and serves repos as content-addressed *lazy mounts* so an agent can start editing in seconds without a full clone. It's a real piece of engineering. But the top comment on its own launch thread asks the only question that matters: *"What's wrong with worktrees? To me that is exactly what mounting a branch would be. I use them a fair amount."*

That commenter is right, and it's worth knowing exactly why before you adopt a new VCS your agents have never seen in training.

## What a worktree actually is

A [git worktree](https://git-scm.com/docs/git-worktree) is a second working directory backed by the *same repository*. You create one with:

```bash
git worktree add ../project-feature-a -b feature-a
```

That makes a fresh directory at `../project-feature-a`, on a new branch `feature-a`. The trick is what it *doesn't* copy. The objects — every commit, tree, and blob in your history — stay in one place. The git docs put it plainly: a linked worktree shares "everything except per-worktree files such as `HEAD`, `index`, etc." Each worktree gets its own `HEAD`, its own index, and its own files on disk; all of them point back at one shared object database via `$GIT_COMMON_DIR`. The `.git` in a linked worktree isn't even a directory — it's a one-line file pointing at `…/.git/worktrees/feature-a`.

So you pay for the working files twice and the history *once*. On a repo whose `.git` dwarfs the checkout — which is most mature repos — a worktree is far cheaper than a clone and shares branches and remotes for free.

And git enforces the exact invariant agents need. **A branch can be checked out in only one worktree at a time.** Try to `add` a branch that's already live somewhere else and git refuses. That refusal is the file-level lock our two-agent bug was missing, built into the tool since 2015.

List them, remove them, garbage-collect the stale admin files:

```bash
git worktree list
git worktree remove ../project-feature-a
git worktree prune
```

That's the whole mechanism. Isolated files, shared history, one-branch-per-tree enforced. It is not new and it is not exciting. It is just correct.

## How Claude Code wires it for you

You can drive this by hand, but the agent harnesses now do it for you, and the defaults are the interesting part.

In Claude Code, one flag starts a session in its own worktree:

```bash
claude --worktree feature-auth
```

That lands you in `.claude/worktrees/feature-auth/`, on a branch named `worktree-feature-auth`, [per the docs](https://code.claude.com/docs/en/worktrees). Run it again with another name in a second terminal and you've got two isolated agents that physically cannot touch each other's files. Want one to review a specific PR? `claude --worktree "#1234"` fetches `pull/1234/head` and checks it out in its own tree.

Note the base branch, because it's a real decision. By default a worktree branches from `origin/HEAD` — a *clean* tree matching the remote, not your messy local state. If you want the agent to build on your unpushed work instead, flip one setting:

```json
{
  "worktree": {
    "baseRef": "head"
  }
}
```

For subagents — the parallel fan-out — you don't even pass a flag. Add one line to a custom subagent's frontmatter:

```yaml
isolation: worktree
```

Now every invocation of that subagent gets a throwaway worktree, and two of them running at once "will not interfere with each other." This is the missing half of the fan-out story I wrote about [when nested subagents each cost a fresh context window](2026-06-13-subagent-fan-out-budget.md): fan-out buys you parallel *thinking*, but if the parallel agents share a checkout, their parallel *writing* corrupts each other. Worktrees are what make the fan-out safe on disk, not just in tokens.

Two operational details that the harness gets right and a hand-rolled script usually doesn't:

- **It locks the tree while the agent runs.** Claude runs `git worktree lock` on an active worktree so a concurrent cleanup sweep can't delete out from under a working agent. Released on finish.
- **It cleans up by emptiness, not by clock.** A worktree with no commits, no uncommitted changes, and no untracked files is removed automatically when the agent finishes. One with changes is kept and reported back so you don't silently lose work.

## The gotcha that will bite you first

A worktree is a *fresh checkout*, which means it does not have your gitignored files. No `.env`. No `.env.local`. No `node_modules`, no `.venv`. The agent spins up, the app won't boot, and the agent burns three turns rediscovering that it has no database URL.

The fix is a `.worktreeinclude` file in your repo root, gitignore syntax, listing the untracked files to copy into each new worktree:

```text
.env
.env.local
config/secrets.json
```

Only files that match *and* are gitignored get copied, so you never accidentally duplicate tracked files. This is the single highest-leverage line of config for parallel agents, and it's the one people forget. Everything else — installing dependencies, building a virtualenv — you still have to run in each tree. Worktrees isolate files; they don't run your setup for you.

## So what does Oak actually solve?

Steelman it honestly, because the Oak team did real work. Worktrees still cost you a full *working directory* on disk per agent. Spin up twenty agents on a 5 GB monorepo and you're writing 100 GB of mostly-identical files. Oak's lazy, content-addressed mounts hydrate only the files an agent touches, so it claims to "begin editing any repository in seconds." Its JSON-first interface is genuinely nicer for a machine to parse than git's human-shaped porcelain. If your bottleneck is *clone-and-hydrate time at fleet scale*, that's a real edge.

But notice what that edge is *not*. It is not isolation — git already gives you that, enforced, today. The HN thread sharpened the burden of proof to a single line: *"Why would an agent (without fine tuning or oak-specific context) be faster with oak than it is with git?"* Your agent has read millions of git invocations in training and zero Oak ones. The moment it needs to do anything off the happy path, it falls back on git muscle memory it doesn't have for Oak — and you've traded a contention bug you understand for a literacy bug you don't. You also lose every tool that speaks git: CI, code review, your host, your hooks.

The honest read: Oak is betting that *clone time* is the binding constraint for agent fleets. For almost everyone today, the binding constraint was *file collision* — and that one is already solved, for free, with full ecosystem compatibility, by a feature that ships in the git you already have.

## Do / watch / ignore

**Do** — before you run a second agent on a repo, give each one a worktree. One flag (`claude --worktree`), or `isolation: worktree` on your fan-out subagents. Add a `.worktreeinclude` with your `.env` files *today* — it's the difference between an agent that boots and one that flails. Put `.claude/worktrees/` in `.gitignore`.

**Watch** — disk and per-tree setup. Twenty live worktrees is twenty `node_modules`. If hydration time at fleet scale becomes your real pain — not collisions, *clone time* — then content-addressed mounts (Oak, or `jj`'s Watchman-backed workspaces) are worth a serious look. That's the frontier; it isn't most people's problem yet.

**Ignore** — the pitch that agents need a new version-control system to work in parallel. They need their own working directory and a lock on the branch. Git has shipped both since 2015. Reach for the new VCS when you can name the specific git limit it removes — and "my agents collide" isn't it.
