#!/usr/bin/env python3
"""Print OPEN predictions whose concrete due date is on or before today.

The prediction-watch workflow runs this; if it prints anything, the workflow
opens a "predictions due for grading" issue so a due call never silently
slides past its date. The whole compounding premise rests on grading every
due prediction — this makes a missed one impossible to ignore.

Usage:
    python3 scripts/due_predictions.py [YYYY-MM-DD]   # default: today (UTC)
"""

import sys
from datetime import date, datetime, timezone
from pathlib import Path

from ledger import parse_ledger

ROOT = Path(__file__).resolve().parent.parent
MEMORY = ROOT / "reports" / "MEMORY.md"


def main() -> int:
    if len(sys.argv) > 1:
        today = datetime.strptime(sys.argv[1], "%Y-%m-%d").date()
    else:
        today = datetime.now(timezone.utc).date()

    due = [
        p
        for p in parse_ledger(MEMORY)
        if p.is_open and p.due_date and p.due_date <= today
    ]
    for p in sorted(due, key=lambda p: p.due_date or date.max):
        print(f"- **Due {p.due_date}** (made {p.made}, {p.confidence}): {p.text}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
