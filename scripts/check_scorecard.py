#!/usr/bin/env python3
"""CI gate: assert _data/scorecard.yml matches reports/MEMORY.md's ledger.

The weekly desk hand-mirrors the scorecard into _data/scorecard.yml — the
masthead ticker on every page reads it (see _includes/header.html). When the
mirror drifts, the public scorecard lies. This fails the build instead.

Checks, all derived from the ledger table and the Scorecard summary line:
  * open      — count of OPEN predictions
  * settled   — count of settled (non-OPEN) predictions
  * record    — "R-W"; R+W must equal the settled count
  * next_due  — earliest concrete due date among OPEN predictions
  * the MEMORY.md Scorecard line agrees with the ledger it summarizes
"""

import re
import sys
from pathlib import Path

from ledger import (
    load_scorecard_yml,
    parse_ledger,
    parse_scorecard_line,
)

ROOT = Path(__file__).resolve().parent.parent
MEMORY = ROOT / "reports" / "MEMORY.md"
YML = ROOT / "_data" / "scorecard.yml"


def _int(val: str, field: str, errors: list[str]) -> int | None:
    try:
        return int(val)
    except (TypeError, ValueError):
        errors.append(f"{field}: scorecard.yml value {val!r} is not an integer")
        return None


def main() -> int:
    preds = parse_ledger(MEMORY)
    yml = load_scorecard_yml(YML)
    errors: list[str] = []

    open_preds = [p for p in preds if p.is_open]
    settled_preds = [p for p in preds if not p.is_open]

    # 1. open count
    yml_open = _int(yml.get("open", ""), "open", errors)
    if yml_open is not None and yml_open != len(open_preds):
        errors.append(
            f"open: ledger has {len(open_preds)} OPEN prediction(s), "
            f"scorecard.yml says {yml_open}"
        )

    # 2. settled count
    yml_settled = _int(yml.get("settled", ""), "settled", errors)
    if yml_settled is not None and yml_settled != len(settled_preds):
        errors.append(
            f"settled: ledger has {len(settled_preds)} settled prediction(s), "
            f"scorecard.yml says {yml_settled}"
        )

    # 3. record "R-W": rights + wrongs must equal the settled count
    record = yml.get("record", "")
    nums = [int(n) for n in re.findall(r"\d+", record)]
    if len(nums) != 2:
        errors.append(f"record: {record!r} is not in 'R-W' form")
    elif sum(nums) != len(settled_preds):
        errors.append(
            f"record: {record!r} sums to {sum(nums)}, "
            f"but the ledger has {len(settled_preds)} settled prediction(s)"
        )

    # 4. next_due: earliest concrete due date among OPEN predictions
    open_dates = sorted(p.due_date for p in open_preds if p.due_date)
    if open_dates:
        expected = open_dates[0].isoformat()
        if yml.get("next_due", "") != expected:
            errors.append(
                f"next_due: earliest OPEN due date is {expected}, "
                f"scorecard.yml says {yml.get('next_due', '')!r}"
            )

    # 5. the MEMORY.md Scorecard summary line agrees with its own ledger
    line = parse_scorecard_line(MEMORY)
    if line is None:
        errors.append("MEMORY.md has no parseable '**Scorecard: …**' line")
    else:
        if line.settled != len(settled_preds):
            errors.append(
                f"MEMORY Scorecard line says {line.settled} settled, "
                f"ledger has {len(settled_preds)}"
            )
        line_nums = [int(n) for n in re.findall(r"\d+", line.record)]
        if len(line_nums) == 2 and sum(line_nums) != line.settled:
            errors.append(
                f"MEMORY Scorecard record {line.record!r} sums to {sum(line_nums)}, "
                f"but the line claims {line.settled} settled"
            )

    if errors:
        print("Scorecard integrity check FAILED:\n", file=sys.stderr)
        for e in errors:
            print(f"  ✗ {e}", file=sys.stderr)
        print(
            "\nFix _data/scorecard.yml (or the ledger) so the public ticker "
            "matches reports/MEMORY.md.",
            file=sys.stderr,
        )
        return 1

    print(
        f"Scorecard OK — {len(open_preds)} open, {len(settled_preds)} settled, "
        f"record {record}"
        + (f", next due {open_dates[0].isoformat()}" if open_dates else "")
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
