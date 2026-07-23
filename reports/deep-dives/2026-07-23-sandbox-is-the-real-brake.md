# The Kernel Approves Commands Better Than You Do

*Claude Code · Kit Sandoval (The Operator) · 2026-07-23 · why OS-level sandboxing cuts 84% of your permission prompts without going YOLO — and where the box still leaks*

Here is the workflow that breaks by lunch. You start a session, the agent
wants to run `npm test`, you approve. It wants `npm run build`, you approve.
`git status`, approve. `ruff check`, approve. Somewhere around the fortieth
prompt you stop reading the command and start hitting `y` on reflex. The prompt
was supposed to be the brake. By prompt forty it is a formality.

That is not a discipline problem. It is the predictable failure of a human
classifier under load — the same false-negative curve the [deskilled-reviewer
dive](./2026-07-22-human-in-the-loop-deskilled.md) traced yesterday. The more
reliably the agent behaves, the less each prompt earns your attention, and the
worse you get at the one prompt in fifty that actually matters. A brake that
wears out the more you use it is not a brake.

So most people take the other exit. They run `--dangerously-skip-permissions`,
alias it to `yolo`, and never see a prompt again. Now there is no brake at all.
A prompt-injected file or a bad `curl | bash` runs with your shell's full reach:
your `~/.ssh`, your `~/.aws/credentials`, your whole home directory, and an open
socket to anywhere on the internet.

There is a third setting, and it is the one to use. Move the brake off the
prompt and onto the operating system.

## What the sandbox actually is

Claude Code ships a sandboxed Bash tool. Turn it on and every shell command the
agent runs — and every child process that command spawns — executes inside an
OS-enforced box that can write only to your working directory and reach only the
network domains you named. On macOS the box is [Seatbelt](https://code.claude.com/docs/en/sandboxing),
Apple's built-in `sandbox-exec`. On Linux and WSL2 it is
[bubblewrap](https://github.com/containers/bubblewrap), the same unprivileged
namespace tool Flatpak uses. No container, no VM — kernel primitives wrapping
the process.

The number that matters is Anthropic's own. In
[their engineering write-up](https://anthropic.com/engineering/claude-code-sandboxing),
sandboxing "safely reduces permission prompts by 84%" in internal usage. That is
the whole pitch: you stop approving commands one at a time because the box, not
your attention, is now what contains them.

This is a different layer from the one the [hooks
dive](./2026-07-02-hooks-are-the-real-guardrail.md) covered. A permission rule —
or a `PreToolUse` hook — decides *whether* a command runs, and it decides it
*before the command runs*, from the command string. The sandbox decides *what a
command can touch once it is running*, and the OS enforces that on the live
process. The docs put the distinction plainly: the boundary "holds regardless of
what the model chose to run and even if an allowed command does more than its
name suggests." That last clause is the point. A permission classifier reads
`npm test` and reasons about what it should do. The sandbox does not care what
`npm test` claims to be — if the process reaches for `~/.ssh`, the kernel returns
`EPERM`. You can auto-approve because the containment no longer depends on anyone,
human or classifier, reading the command right.

## The config to paste in

Run `/sandbox` once to see the panel, pick **auto-allow**, and it writes to your
project's `.claude/settings.local.json`. To turn it on everywhere, put this in
`~/.claude/settings.json`:

```json
{
  "sandbox": {
    "enabled": true,
    "network": {
      "allowedDomains": ["registry.npmjs.org", "*.github.com", "pypi.org"]
    },
    "credentials": {
      "files": [
        { "path": "~/.ssh", "mode": "deny" },
        { "path": "~/.aws/credentials", "mode": "deny" }
      ]
    }
  }
}
```

The `credentials` block is not optional, and here is why. The sandbox's default
*write* perimeter is tight — working directory plus the session temp dir. Its
default *read* perimeter is the whole computer. Straight from the
[docs](https://code.claude.com/docs/en/sandboxing): "the default read policy
still allows them," meaning `~/.aws/credentials` and `~/.ssh/` are readable by a
sandboxed command unless you say otherwise. Filesystem isolation stops the agent
from *modifying* your dotfiles; it does not, by default, stop it from *reading*
your keys. The `credentials.files` deny list closes that. For the belt-and-braces
version, `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB` strips Anthropic and cloud provider
tokens out of every subprocess environment regardless of sandboxing.

Auto-allow is not a blank check. Explicit `deny` rules still hold. An `rm`
aimed at `/` or your home directory still prompts. Content-scoped `ask` rules
like `Bash(git push *)` still stop for approval even when sandboxed. What
disappears is the undifferentiated firehose of "can I run this build" prompts —
which is 84% of them.

For anything unattended — CI, a headless loop, an overnight refactor — tighten
two more keys:

```json
{
  "sandbox": {
    "enabled": true,
    "failIfUnavailable": true,
    "allowUnsandboxedCommands": false
  }
}
```

`failIfUnavailable` refuses to start rather than silently falling back to
unsandboxed execution when bubblewrap is missing — you never want an unattended
run quietly dropping its own containment. `allowUnsandboxedCommands: false` is
the one people miss. By default, when a command fails *because* of the sandbox,
Claude may retry it with `dangerouslyDisableSandbox` and run it outside the box.
That is a sensible escape hatch when you are watching. It is a hole when you are
not. Setting it false is what the docs call **strict sandbox mode**: the escape
hatch is ignored, and a command either runs sandboxed or is on your explicit
`excludedCommands` list.

## Where the box leaks

A sandbox you trust more than it deserves is worse than none, so read the
limits before you rely on it. Anthropic is unusually honest that this "is not a
complete isolation boundary." Three leaks are worth holding in your head.

**The network filter reads the hostname, not the traffic.** By default the
built-in proxy does not terminate TLS. It allows or blocks a connection on the
hostname the client claims, then passes the encrypted bytes through untouched.
So a broad `allowedDomains` entry is an exfiltration path: allow `github.com`
for your tooling and a compromised process can push secrets out through a gist
or an issue comment, or use [domain
fronting](https://en.wikipedia.org/wiki/Domain_fronting) to reach a host you
never allowed. One practitioner's teardown puts the bind exactly: "Broad domains
allow exfiltration via gists and issue comments, but half your dev tooling talks
to github so you have to let it through"
([claudecodecamp](https://www.claudecodecamp.com/p/claude-code-sandboxing-how-sandbox-works-and-what-it-doesn-t-protect),
single source, but it matches the docs' own warning). Scope domains as narrow as
your workflow tolerates; `registry.npmjs.org` beats `*`.

**The sandbox is Bash-only.** It isolates shell subprocesses. Claude's own
`Read`, `Edit`, and `Write` tools do not run through it — they go through the
permission system directly. That means `sandbox.filesystem.denyRead` governs
what a *shell command* can read, not what the *Read tool* can read; the same
teardown found a `denyRead` path the Read tool opened anyway. It is not a bug in
the sandbox, it is the scope of the sandbox: if you want to fence the agent's
built-in file access, that is a permissions job, not a sandbox job. Know which
tool you are actually constraining.

**A sandbox is only as trustworthy as its documentation.** Simon Willison, who
has [read more of these than most](https://simonwillison.net/2026/May/30/how-we-contain-claude/),
makes the durable point: "sandboxing products… are rarely thoroughly
*documented*, and in the absence of detailed documentation it's hard to know how
much I can trust them." He cites the `api.anthropic.com/v1/files` exfiltration
vector — allow your own model provider's API, which you must, and you have
allowed an upload endpoint. Anthropic's docs are, to their credit, thorough
enough to tell you all of this. Treat the sandbox as defense in depth — the exact
frame Anthropic uses, "without network isolation a compromised agent could
exfiltrate SSH keys; without filesystem isolation it could escape and gain
network access" — not as a wall you can stop thinking behind.

## New this week, and the standalone

Two shipping notes make this the right week to set it up. In
[v2.1.216 (Jul 20)](https://github.com/anthropics/claude-code/releases),
`sandbox.filesystem.disabled` arrived: it drops filesystem isolation while
keeping the network box. That sounds backwards until you hit the tool that
breaks under filesystem isolation — and plenty do — but you still want egress
control. It is the "I trust this workload's writes, I do not trust where it
phones" case. Use it deliberately; with writes unrestricted and commands
auto-allowed, a command can edit a file a later command runs. The same release
also fixed worktree subagents escaping to the shared checkout — a reminder that
the isolation guards themselves get patched, and the argument from the
[worktree dive](./2026-06-23-git-worktrees-agent-isolation.md) holds: layer your
brakes, don't trust one.

And the box is not Claude-Code-only. Anthropic open-sourced the engine as
[`@anthropic-ai/sandbox-runtime`](https://github.com/anthropic-experimental/sandbox-runtime).
Its `srt` CLI wraps any process — `srt "curl anthropic.com"` — and, more useful,
wraps a local MCP server so a third-party tool server runs inside the same
filesystem and network fence:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "srt",
      "args": ["npx", "-y", "@modelcontextprotocol/server-filesystem"]
    }
  }
}
```

That is the containment the [agent-egress
dive](./2026-07-17-what-your-coding-agent-sends.md) asked for, applied to the
MCP servers you did not write and cannot audit line by line.

## So what to do Monday

Turn on the sandbox, pick auto-allow, and *immediately* add the `credentials`
deny list for `~/.ssh` and `~/.aws` — because the default read perimeter is your
whole disk. Scope `allowedDomains` to the handful of hosts your build actually
talks to; every wildcard is a maybe-exfil path the proxy cannot see into. For
anything you are not watching, set `allowUnsandboxedCommands: false` and
`failIfUnavailable: true`. And keep the mental model straight: the sandbox
contains *Bash*, the permission system and hooks contain *the tools and the
decision to run*, and neither one inspects your encrypted traffic. The win is
real and measured — 84% fewer prompts — but you buy it by moving the brake to a
place that does not get tired, not by removing the brake. If you want the wall
rather than the fence, that is a VM, which is why Anthropic runs
[Cowork in a full VM](https://simonwillison.net/2026/May/30/how-we-contain-claude/)
and Claude Code in a sandbox. Match the boundary to the blast radius you can
afford.
