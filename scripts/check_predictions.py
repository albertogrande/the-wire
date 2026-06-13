#!/usr/bin/env python3
"""CI gate: validate _data/predictions.yml — the scorecard's source of truth.

The status bar (every page) and /predictions/ derive the whole public scorecard
from this one file (open count, record, mean Brier, next due). A malformed entry
— a typo'd status, a missing due date, a settled call with no Brier — would
silently corrupt the ticker rather than error. This fails the build instead.

Checks each entry:
  * required keys present (id, made, text, confidence, due, status)
  * status is one of open | correct | partial | incorrect
  * confidence is an integer percent in 0..100
  * due is a concrete YYYY-MM-DD or a quarter (YYYY-Qn)
  * settled entries (status != open) carry a Brier in 0..1; open entries don't
  * ids are unique

Standard library + PyYAML (installed in the CI step).
"""

import re
import sys
from datetime import date
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
PREDICTIONS = ROOT / "_data" / "predictions.yml"

VALID_STATUS = {"open", "correct", "partial", "incorrect"}
REQUIRED = ("id", "made", "text", "confidence", "due", "status")
QUARTER_RE = re.compile(r"^\d{4}-Q[1-4]$")


def _due_ok(raw) -> bool:
    s = str(raw).strip()
    if QUARTER_RE.match(s):
        return True
    try:
        date.fromisoformat(s)
        return True
    except ValueError:
        return False


def main() -> int:
    errors: list[str] = []
    preds = yaml.safe_load(PREDICTIONS.read_text(encoding="utf-8"))

    if not isinstance(preds, list) or not preds:
        print("predictions.yml is not a non-empty list", file=sys.stderr)
        return 1

    seen_ids: set[str] = set()
    for i, p in enumerate(preds):
        where = f"entry {i}"
        if not isinstance(p, dict):
            errors.append(f"{where}: not a mapping")
            continue
        where = f"entry {i} ({p.get('id', '?')})"

        for key in REQUIRED:
            if p.get(key) in (None, ""):
                errors.append(f"{where}: missing required key '{key}'")

        pid = p.get("id")
        if pid:
            if pid in seen_ids:
                errors.append(f"{where}: duplicate id '{pid}'")
            seen_ids.add(pid)

        status = str(p.get("status", "")).strip().lower()
        if status and status not in VALID_STATUS:
            errors.append(
                f"{where}: status '{status}' not in {sorted(VALID_STATUS)}"
            )

        conf = p.get("confidence")
        if not isinstance(conf, int) or not (0 <= conf <= 100):
            errors.append(f"{where}: confidence {conf!r} must be an int in 0..100")

        if p.get("due") not in (None, "") and not _due_ok(p.get("due")):
            errors.append(
                f"{where}: due {p.get('due')!r} must be YYYY-MM-DD or YYYY-Qn"
            )

        brier = p.get("brier")
        if status and status != "open":
            if not isinstance(brier, (int, float)):
                errors.append(f"{where}: settled call must carry a numeric Brier")
            elif not (0.0 <= brier <= 1.0):
                errors.append(f"{where}: Brier {brier!r} out of range 0..1")
        elif status == "open" and brier not in (None, ""):
            errors.append(f"{where}: open call should not carry a Brier yet")

    if errors:
        print("predictions.yml validation FAILED:\n", file=sys.stderr)
        for e in errors:
            print(f"  ✗ {e}", file=sys.stderr)
        return 1

    open_n = sum(1 for p in preds if str(p.get("status")).lower() == "open")
    print(f"predictions.yml OK — {len(preds)} entries, {open_n} open")
    return 0


if __name__ == "__main__":
    sys.exit(main())
