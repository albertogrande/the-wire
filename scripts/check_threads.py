#!/usr/bin/env python3
"""CI gate: keep _data/threads.yml in sync with reports/MEMORY.md.

`/threads/` and the front page render from _data/threads.yml, but the master
list of running threads lives in the "## Running threads" section of
reports/MEMORY.md. The dive/weekly skills open a new thread in MEMORY.md and are
supposed to mirror it into threads.yml — when that mirror step is skipped, a new
storyline silently never reaches the site (it happened: the channel-war,
autonomy-before-brakes, and maintainer-revolt threads). This check fails the
build when the two drift apart instead of letting it slip.

Checks:
  * every thread title in MEMORY.md has a matching threads.yml entry
    (matched by a normalized slug derived from the title)
  * threads.yml carries no entry that no longer exists in MEMORY.md
  * each threads.yml entry is well-formed (slug, title, momentum, summary,
    issues) with momentum in up | steady | down

Standard library + PyYAML (installed in the CI step).
"""

import re
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
MEMORY = ROOT / "reports" / "MEMORY.md"
THREADS = ROOT / "_data" / "threads.yml"

VALID_MOMENTUM = {"up", "steady", "down"}
REQUIRED = ("slug", "title", "momentum", "summary", "issues")

# A thread heading in MEMORY.md: "- **Title here** `↑` — ..."
HEADING_RE = re.compile(r"^- \*\*(?P<title>[^*]+)\*\*")


# Filler words that a slug routinely drops ("Washington vs. the labs" ->
# washington-vs-labs), so they shouldn't count toward matching a title to a slug.
STOP = {"the", "a", "an", "of", "vs", "and", "its", "on", "as", "for", "to", "in"}


def normalize(text: str):
    """A title or slug reduced to (significant-word set, concatenated form).
    Both forms are compared so 'The channel war / off-ramps',
    'channel-war-offramps', and 'channel war offramps' all match."""
    words = [w for w in re.findall(r"[a-z0-9]+", text.lower()) if w not in STOP]
    return set(words), "".join(words)


def is_match(a, b) -> bool:
    """Two normalized forms refer to the same thread if their concatenations are
    equal or one contains the other, or their word sets overlap heavily."""
    a_words, a_cat = a
    b_words, b_cat = b
    if not a_cat or not b_cat:
        return False
    if a_cat == b_cat or a_cat in b_cat or b_cat in a_cat:
        return True
    if a_words and b_words:
        jaccard = len(a_words & b_words) / len(a_words | b_words)
        return jaccard >= 0.5
    return False


def memory_threads() -> list[str]:
    """Titles under the '## Running threads' section of MEMORY.md."""
    lines = MEMORY.read_text(encoding="utf-8").splitlines()
    titles: list[str] = []
    in_section = False
    for line in lines:
        if line.startswith("## "):
            in_section = line.strip().lower().startswith("## running threads")
            continue
        if in_section:
            m = HEADING_RE.match(line)
            if m:
                titles.append(m.group("title").strip())
    return titles


def main() -> int:
    errors: list[str] = []

    entries = yaml.safe_load(THREADS.read_text(encoding="utf-8"))
    if not isinstance(entries, list) or not entries:
        print("threads.yml is not a non-empty list", file=sys.stderr)
        return 1

    yml_norms: list[tuple] = []
    for i, t in enumerate(entries):
        where = f"entry {i}"
        if not isinstance(t, dict):
            errors.append(f"{where}: not a mapping")
            continue
        slug = t.get("slug", "?")
        where = f"entry {i} ({slug})"
        for key in REQUIRED:
            if t.get(key) in (None, ""):
                errors.append(f"{where}: missing required key '{key}'")
        mom = str(t.get("momentum", "")).strip().lower()
        if mom and mom not in VALID_MOMENTUM:
            errors.append(f"{where}: momentum '{mom}' not in {sorted(VALID_MOMENTUM)}")
        if t.get("slug"):
            yml_norms.append((str(slug), normalize(str(slug))))

    mem_titles = memory_threads()
    if not mem_titles:
        errors.append("no threads found under '## Running threads' in MEMORY.md")
    mem_norms = [(title, normalize(title)) for title in mem_titles]

    # Every MEMORY thread must have a matching threads.yml entry...
    for title, mn in mem_norms:
        if not any(is_match(mn, yn) for _, yn in yml_norms):
            errors.append(
                f"MEMORY thread not mirrored to threads.yml: {title!r} "
                f"(add a block with slug ~ '{normalize(title)[1]}')"
            )

    # ...and no threads.yml entry should outlive its MEMORY thread.
    for slug, yn in yml_norms:
        if not any(is_match(yn, mn) for _, mn in mem_norms):
            errors.append(
                f"threads.yml has a stale thread no longer in MEMORY.md: '{slug}'"
            )

    if errors:
        print("threads.yml / MEMORY.md sync FAILED:\n", file=sys.stderr)
        for e in errors:
            print(f"  ✗ {e}", file=sys.stderr)
        return 1

    print(f"threads.yml OK — {len(entries)} threads, in sync with MEMORY.md")
    return 0


if __name__ == "__main__":
    sys.exit(main())
