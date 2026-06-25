# Your Agent Will Retry That Write. Make It Safe to Run Twice.

*Deep dive · Theo Vance (The Builder) · 2026-06-26 · the retry stopped being an edge case — now it's the loop, and your tools are exposed.*

Here's a task you've probably handed an agent this week. "Open a PR with this
fix." Or "create the Stripe charge for invoice 4471." Or "run terraform apply
on staging." The agent calls your tool. The stream goes quiet for nineteen
seconds. The harness decides the call stalled and fires it again.

Now you have two PRs. Two charges. Two applies.

This isn't a hypothetical, and it isn't a bug in the model. It's the shape of
the system you're now running. Retries used to be the rare path — a flaky
network, a 500 you caught in a `try/except`. In an agent loop, the retry is
*structural*. Three different layers will repeat your tool call without asking,
and they will do it whether or not the first call actually worked. The only
thing that makes that safe is a property most internal tools never needed
before: idempotency. Doing the thing twice has to equal doing it once.

Let me show you exactly where the repeats come from, why they're unavoidable,
and the three building blocks that fix them.

## Three retriers, all wired in already

Count the things between your prompt and your tool that will re-send a request
on their own.

**The SDK.** The official Anthropic SDKs retry failed API calls up to **2
times by default**, with exponential backoff, on connection errors and on
408 / 409 / 429 / 5xx responses ([anthropic-sdk-python](https://github.com/anthropics/anthropic-sdk-python),
[error reference](https://platform.claude.com/docs/en/api/errors)). That's the
model call, not your tool — but it sets the tone: the stack assumes transient
failure and re-fires by default.

**The harness.** Claude Code [v2.1.185](https://github.com/anthropics/claude-code/releases)
reworded the stream-stall path to "Waiting for API response · will retry" and
raised the stall-detection timeout to 20s. A long tool call that goes quiet
gets re-driven. Quieter UX, same fact underneath: the loop retries.

**The model.** This is the one people miss. When a tool returns an empty body,
a timeout, a 502, or anything that *reads like* failure, the model will often
just call the tool again. It has no way to know the write landed. From inside
the loop, "no clear success" and "definitely failed" look identical.

Stack those and a single logical action — one charge, one PR, one deploy — can
hit your tool two to six times. You didn't write a retry loop. You inherited
three.

## Why the retrier can't just "check first"

The obvious objection: why not look before you leap? Have the agent check
whether the charge exists before creating it, then only retry if it doesn't.

Because the failure you're retrying *is the check failing*. Stripe's engineering
team laid out the three ways a write can break ([stripe.com/blog/idempotency](https://stripe.com/blog/idempotency)),
and only one of them is clean:

1. The request never reached the server. Safe to retry.
2. It failed midway, leaving the work half-done.
3. **It succeeded — and the connection dropped before the response came back.**

Case 3 is the killer. The write happened. The acknowledgment didn't. The client
— your SDK, your harness, your model — sees a dead connection and cannot
distinguish "never ran" from "ran fine, lost the receipt." A pre-check request
can hit the exact same wall.

This is the old distributed-systems result, and agents don't repeal it: over an
unreliable network you get *at-least-once* delivery, never *exactly-once*. You
cannot make the retries stop. You can only make them harmless. That's the whole
game.

## The three building blocks

None of this is new. It's just newly load-bearing, because the thing doing the
retrying is now a tireless non-deterministic model instead of a human who'd
notice the duplicate charge. Here are the three tools, weakest to strongest.

**1. Pick an idempotent method.** HTTP already sorts this for you.
[RFC 9110 §9.2.2](https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.2)
defines a method as idempotent when "the intended effect on the server of
multiple identical requests with that method is the same as the effect for a
single such request," and §9.3 names them: **GET, HEAD, PUT, DELETE, OPTIONS,
TRACE**. `POST` is not on the list, and that's the trap. `PUT /users/42` with a
full body can run five times and leave one user. `POST /users` runs five times
and leaves five. If the tool your agent calls maps to a `PUT` or a `DELETE`,
you're mostly covered for free. If it maps to a `POST` — create charge, send
message, open PR — you have to do real work.

**2. Idempotency keys for the writes that can't be PUTs.** This is the pattern
Stripe productized and everyone copied. The client attaches a unique key to the
request; the server stores the first result under that key and replays it for
any repeat. From [Stripe's API docs](https://docs.stripe.com/api/idempotent_requests):
the result is saved "regardless of whether it succeeds or fails," subsequent
requests with the same key "return the same result, including `500` errors,"
keys are retained for **24 hours**, and the layer "compares incoming parameters
to those of the original request and errors if they're not the same." Keys ride
on `POST` only — `GET` and `DELETE` are already idempotent by definition.

If you own the endpoint, the server side is a unique index and a lookup:

```sql
-- the table the agent's tool writes through
CREATE TABLE idempotency (
  key          text PRIMARY KEY,
  response     jsonb NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);
-- on each call: SELECT response WHERE key = $1; if hit, return it.
-- if miss, do the work in the same transaction as the INSERT.
```

**3. Natural keys and conditional writes.** Often you don't need a separate key
table — the data already has a unique handle. Upsert on it:

```sql
INSERT INTO charges (invoice_id, amount_cents)
VALUES ('inv_4471', 50000)
ON CONFLICT (invoice_id) DO NOTHING;   -- second apply is a no-op
```

Same idea as `If-None-Match` / `If-Match` on an HTTP write, or a compare-and-set
on a counter. The unique constraint *is* the idempotency. The fifth retry bounces
off the database, not off your luck.

## The agent-specific gotcha: where the key comes from

Here's the part that's genuinely new, and where I've watched good engineers ship
the bug. An idempotency key only works if it's **stable across retries of the
same intent but distinct across different intents.** Get that backwards and you
either defeat the protection or create a worse one.

The wrong move is to let the *model* mint the key in free text. Ask Claude to
"include a unique idempotency key" and it will — a fresh random-looking string
*every turn*, including on the retry. Now each attempt carries a different key,
the server sees three distinct requests, and you're back to three charges. The
model has no memory that this is attempt two of the same action; from its view
each turn is new.

So derive the key deterministically, in the tool wrapper, from the *content* of
the action — not from the model's narration:

```python
def charge(invoice_id: str, amount_cents: int):
    # key is a pure function of the action — identical on every retry,
    # different for any other charge. The model never sees or sets it.
    key = hashlib.sha256(f"charge:{invoice_id}:{amount_cents}".encode()).hexdigest()
    return stripe.Charge.create(
        {"amount": amount_cents, "currency": "usd", "invoice": invoice_id},
        idempotency_key=key,
    )
```

Retry the same `charge(inv_4471, 50000)` and the key is byte-identical, so
Stripe replays the first result. Try a genuinely different charge and the key
diverges. The model picks *what* to do; the wrapper guarantees *doing it twice
is free*. Keep the minting out of the prompt.

## The harness is already conceding the point

Watch what Anthropic shipped into the loop itself. Claude Code
[v2.1.183](https://github.com/anthropics/claude-code/releases/tag/v2.1.183) made
auto mode **block** a list of operations unless you explicitly asked for them:
`git reset --hard`, `git checkout -- .`, `git clean -fd`, `git stash drop`,
`git commit --amend` on commits the agent didn't make this session, and
`terraform destroy` / `pulumi destroy` / `cdk destroy` on any stack you didn't
name.

Read that list again. It's the catalog of operations that are *destructive and
not safe to repeat*. The harness can't make `terraform destroy` idempotent, so
it does the only other thing — refuses to run it autonomously. That's a blunt
guardrail standing in for the precise one. It's the same admission this whole
piece is built on: under autonomy, the repeated-or-unrequested write is the
failure mode, and we covered the first half of that story when
[autonomy shipped before its brakes](./2026-06-08-autonomy-before-brakes.md).
Worktree isolation [made parallel agents safe to *write*](./2026-06-23-git-worktrees-agent-isolation.md)
by giving each its own files; idempotency makes a *single* agent safe to retry.
Different brake, same car.

The counter-argument is "just gate every write behind a human confirm, or keep
the agent's tools read-only." It doesn't hold. Confirmation prompts don't exist
in a headless CI run or an overnight `claude -p` job — the whole point of which
is that nobody's watching. Read-only tools don't ship features. And the confirm
step is itself a network call that can be retried. You can move the at-least-once
problem around. You can't delete it. The only place it actually dies is at the
write, with a key or a constraint.

## So what, for Monday morning

**Do.** Audit every tool you expose to an agent that mutates state — `POST`s,
writes, deploys, sends. For each, pick a building block: an idempotent method, a
content-derived idempotency key minted in the wrapper, or a unique constraint
that turns the second write into a no-op. Mint keys deterministically, in code,
never in the prompt. If you consume a vendor API, check whether it takes an
idempotency key (Stripe, most payment and messaging APIs do) and pass one.

**Watch.** Duplicate side effects are mostly silent — two Slack messages, a
double-charged card, a re-sent webhook. Add a metric for writes-per-logical-task
and alert when it's greater than one. That number is your retry tax, and you
can't fix what you don't count.

**Ignore.** The dream of exactly-once. It's not coming, not in your stack and
not in the agent's. Stop trying to make the retries stop and make them free
instead. An at-least-once world with idempotent writes is *effectively* once —
and that's the strongest guarantee on offer. Build for the retry, because it's
already in the loop.
