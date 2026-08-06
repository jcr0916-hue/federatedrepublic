#!/bin/bash
#
# place-downloads.sh — run this after downloading files from Claude, before
# opening GitHub Desktop. Finds each expected file in ~/Downloads (however
# it got renamed on the way down) and copies it to the correct spot in the
# repo. Then runs the consistency checker automatically.
#
# Usage, from the repo root:
#   bash scripts/place-downloads.sh
#
# Safe to run any time — it only touches files it finds a match for, and it
# tells you plainly about anything it couldn't find rather than failing silently.

DOWNLOADS="$HOME/Downloads"
REPO="$(pwd)"

echo "Looking in: $DOWNLOADS"
echo "Placing into: $REPO"
echo ""

FOUND=0
MISSING=0

# find_file NAME_HINT   — finds the MOST RECENTLY DOWNLOADED file matching a
# loose name, checking every naming variant (exact, underscore-to-space, and
# any " (1)", " (2)" copies from repeat downloads) and picking the newest.
find_file () {
    local hint="$1"
    local base="${hint%.*}"
    local ext="${hint##*.}"
    local spaced
    spaced=$(echo "$base" | tr '_' ' ')

    # gather every plausible candidate, then sort ALL of them by modification
    # time and take the newest — never stop at the first name that matches.
    {
        [ -f "$DOWNLOADS/$hint" ] && echo "$DOWNLOADS/$hint"
        [ -f "$DOWNLOADS/$spaced.$ext" ] && echo "$DOWNLOADS/$spaced.$ext"
        ls -1 "$DOWNLOADS/$base"*."$ext" 2>/dev/null
        ls -1 "$DOWNLOADS/$spaced"*."$ext" 2>/dev/null
    } | sort -u | xargs -I{} stat -f '%m %N' {} 2>/dev/null | sort -rn | head -1 | cut -d' ' -f2-
}

# place SOURCE_HINT DEST_PATH
place () {
    local hint="$1"
    local dest="$2"
    local src
    src=$(find_file "$hint")
    if [ -n "$src" ]; then
        cp "$src" "$REPO/$dest"
        echo "  OK    $hint  ->  $dest"
        FOUND=$((FOUND+1))
    else
        echo "  ----  $hint  NOT FOUND in Downloads (skipped)"
        MISSING=$((MISSING+1))
    fi
}

echo "Placing files:"
place "constitution_data.json"        "constitution_data.json"
place "annotated.html"                "annotated.html"
place "constitutional-history.html"   "constitutional-history.html"
place "search-index.js"               "search-index.js"
place "constitution-current.md"       "docs/constitution-current.md"
place "constitutional-quickref.md"    "docs/constitutional-quickref.md"
place "updates.js"                    "_data/updates.js"
place "WORLD-THREADS-PENDING.md"      "docs/WORLD-THREADS-PENDING.md"

echo ""
echo "Placed: $FOUND   Not found: $MISSING"
echo "(Not found is fine if that file wasn't part of today's delivery.)"
echo ""

if [ -f "scripts/check-consistency.py" ]; then
    echo "Running consistency check..."
    echo ""
    python3 scripts/check-consistency.py
    echo ""
fi

echo "Next: open GitHub Desktop. It will show the changed files —"
echo "check they look right, then Commit and Push."
