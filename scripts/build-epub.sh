#!/usr/bin/env bash
#
# build-epub.sh — convert a weekly report (or any report markdown) into a
# Kindle-friendly EPUB3 using pandoc.
#
# Usage:
#   scripts/build-epub.sh reports/2026-W24.md [output.epub]
#
# Relative cross-issue links (./2026-W23.md, ./deep-dives/foo.md) are rewritten
# to absolute URLs on the published site so they resolve from inside the reader.
# Modern Kindles accept EPUB directly via Send-to-Kindle.

set -euo pipefail

SRC="${1:?usage: build-epub.sh <report.md> [out.epub]}"
SITE="https://albertogrande.github.io/the-wire"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COVER="$REPO_ROOT/assets/social-preview.png"

if [[ ! -f "$SRC" ]]; then
  echo "error: source not found: $SRC" >&2
  exit 1
fi

base="$(basename "$SRC" .md)"           # e.g. 2026-W24
out="${2:-$REPO_ROOT/reports/epub/$base.epub}"
mkdir -p "$(dirname "$out")"

# Title = the file's H1; subtitle/date derived from the report.
title="$(grep -m1 '^# ' "$SRC" | sed 's/^# //')"
# The report files live under reports/, so ./X.md -> reports/X.html and
# ./deep-dives/X.md -> reports/deep-dives/X.html on the live site.
tmp="$(mktemp).md"
sed -E \
  -e "s#\]\(\./deep-dives/([^)]+)\.md\)#](${SITE}/reports/deep-dives/\1.html)#g" \
  -e "s#\]\(\./([^)/]+)\.md\)#](${SITE}/reports/\1.html)#g" \
  "$SRC" > "$tmp"

# Metadata block prepended for pandoc.
meta="$(mktemp).yaml"
cat > "$meta" <<EOF
---
title: "${title//\"/\\\"}"
author: "The Wire"
publisher: "The Wire — circulation of one"
date: "$(date +%Y-%m-%d)"
lang: en
...
EOF

pandoc \
  --from=gfm \
  --to=epub3 \
  --metadata-file="$meta" \
  --epub-cover-image="$COVER" \
  --toc --toc-depth=2 \
  --split-level=1 \
  -o "$out" \
  "$meta" "$tmp"

rm -f "$tmp" "$meta"
echo "wrote $out"
