"""Parse The Observer's predictions ledger and scorecard from reports/MEMORY.md.

Shared by check_scorecard.py (the CI integrity gate) and due_predictions.py
(the due-prediction nudge). Standard library only — no dependencies, so it
runs on a bare actions/setup-python step.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import date
from pathlib import Path

DATE_RE = re.compile(r"(\d{4})-(\d{2})-(\d{2})")


@dataclass
class Prediction:
    made: str
    text: str
    confidence: str
    due_raw: str
    status: str

    @property
    def is_open(self) -> bool:
        return self.status.strip().upper() == "OPEN"

    @property
    def due_date(self) -> date | None:
        """The first concrete YYYY-MM-DD in the Due cell, if any.

        Some predictions are due "by 2027-Q1" (a quarter, not a date); those
        have no concrete due date and return None.
        """
        m = DATE_RE.search(self.due_raw)
        if not m:
            return None
        try:
            return date(int(m.group(1)), int(m.group(2)), int(m.group(3)))
        except ValueError:
            return None


@dataclass
class Scorecard:
    settled: int
    record: str  # "R-W" (en-dash or hyphen)


def _section(text: str, heading: str) -> str:
    """Return the body of the '## <heading>' section, up to the next '## '."""
    out: list[str] = []
    grabbing = False
    for line in text.splitlines():
        if line.startswith("## "):
            if grabbing:
                break
            grabbing = heading.lower() in line.lower()
            continue
        if grabbing:
            out.append(line)
    return "\n".join(out)


def parse_ledger(memory_path: Path) -> list[Prediction]:
    """Every data row of the predictions-ledger markdown table."""
    body = _section(memory_path.read_text(encoding="utf-8"), "Predictions ledger")
    preds: list[Prediction] = []
    for line in body.splitlines():
        line = line.strip()
        if not line.startswith("|"):
            continue
        cells = [c.strip() for c in line.strip("|").split("|")]
        if len(cells) < 5:
            continue
        # Skip the header row and the |---|---| separator row.
        if cells[0].lower() == "made" or set(cells[0]) <= {"-", ":"}:
            continue
        preds.append(
            Prediction(
                made=cells[0],
                text=cells[1],
                confidence=cells[2],
                due_raw=cells[3],
                status=cells[-1],
            )
        )
    return preds


def parse_scorecard_line(memory_path: Path) -> Scorecard | None:
    """The '**Scorecard: N settled · record R-W · ...**' summary line."""
    text = memory_path.read_text(encoding="utf-8")
    m = re.search(
        r"Scorecard:\s*(\d+)\s*settled.*?record\s*(\d+\s*[-–]\s*\d+)", text
    )
    if not m:
        return None
    return Scorecard(settled=int(m.group(1)), record=m.group(2).replace(" ", ""))


def load_scorecard_yml(path: Path) -> dict[str, str]:
    """Minimal reader for the flat `key: value` scorecard data file."""
    data: dict[str, str] = {}
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or ":" not in line:
            continue
        key, _, val = line.partition(":")
        val = val.split(" #", 1)[0].strip().strip('"').strip("'")
        data[key.strip()] = val
    return data
