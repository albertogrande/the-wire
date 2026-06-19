#!/usr/bin/env bash
#
# build-docx.sh — convert a report markdown into a Word DOCX using pandoc.
#
# Usage:
#   scripts/build-docx.sh reports/2026-W24.md [output.docx]
#
# Same relative-link rewriting as build-epub.sh so cross-issue links resolve to
# the published site. DOCX is an Amazon Send-to-Kindle-accepted format that
# reflows well on-device — used as an alternative when EPUB ingestion fails.

set -euo pipefail

SRC="${1:?usage: build-docx.sh <report.md> [out.docx]}"
SITE="https://albertogrande.github.io/the-wire"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ ! -f "$SRC" ]]; then
  echo "error: source not found: $SRC" >&2
  exit 1
fi

base="$(basename "$SRC" .md)"
out="${2:-$REPO_ROOT/reports/epub/$base.docx}"
mkdir -p "$(dirname "$out")"

title="$(grep -m1 '^# ' "$SRC" | sed 's/^# //')"
tmp="$(mktemp).md"
sed -E \
  -e "s#\]\(\./deep-dives/([^)]+)\.md\)#](${SITE}/reports/deep-dives/\1.html)#g" \
  -e "s#\]\(\./([^)/]+)\.md\)#](${SITE}/reports/\1.html)#g" \
  "$SRC" > "$tmp"

meta="$(mktemp).yaml"
cat > "$meta" <<EOF
---
title: "${title//\"/\\\"}"
author: "The Wire"
date: "$(date +%Y-%m-%d)"
lang: en
...
EOF

pandoc \
  --from=gfm \
  --to=docx \
  --metadata-file="$meta" \
  --toc --toc-depth=2 \
  -o "$out" \
  "$meta" "$tmp"

rm -f "$tmp" "$meta"
echo "wrote $out"
