#!/usr/bin/env python3
"""Print OPEN predictions whose concrete due date is on or before today.

Reads _data/predictions.yml — the site's single source of truth for the
scorecard (the status bar and /predictions/ derive everything from it). The
prediction-watch workflow runs this; if it prints anything, the workflow opens
a "predictions due for grading" issue so a due call never silently slides past
its date. The whole compounding premise rests on grading every due prediction.

Some predictions are due by a quarter ("2026-Q4", "2027-Q1") rather than a
concrete date; those have no firm deadline to miss and are skipped here.

Usage:
    python3 scripts/due_predictions.py [YYYY-MM-DD]   # default: today (UTC)
"""

import sys
from datetime import date, datetime, timezone
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
PREDICTIONS = ROOT / "_data" / "predictions.yml"


def _due_date(raw) -> date | None:
    """A YYYY-MM-DD due value as a date, or None for quarter/other forms."""
    try:
        return date.fromisoformat(str(raw).strip())
    except (TypeError, ValueError):
        return None


def main() -> int:
    if len(sys.argv) > 1:
        today = datetime.strptime(sys.argv[1], "%Y-%m-%d").date()
    else:
        today = datetime.now(timezone.utc).date()

    preds = yaml.safe_load(PREDICTIONS.read_text(encoding="utf-8")) or []
    due = [
        (p, d)
        for p in preds
        if str(p.get("status", "")).strip().lower() == "open"
        and (d := _due_date(p.get("due"))) is not None
        and d <= today
    ]
    for p, d in sorted(due, key=lambda pd: pd[1]):
        text = " ".join(str(p.get("text", "")).split())
        print(f"- **Due {d}** (made {p.get('made', '?')}, {p.get('confidence', '?')}%): {text}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
