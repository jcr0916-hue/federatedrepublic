#!/bin/bash
#
# place-downloads.sh  (v3 — written for bash 3.2, which is what macOS ships)
#
# Copies files you downloaded from Claude into their correct spots in the repo.
# Handles downloads that got renamed (spaces, "(1)" suffixes) and always picks
# the most recently downloaded copy.
#
# Deliberately avoids arrays, nullglob, and anything newer than bash 3.2.
#
# Run from the repo root:
#   bash scripts/place-downloads.sh

# Browsers may save to the local Downloads folder OR to iCloud Drive's
# Downloads folder, depending on system settings. Check both.
DOWNLOADS="$HOME/Downloads"
ICLOUD_DOWNLOADS="$HOME/Library/Mobile Documents/com~apple~CloudDocs/Downloads"
REPO=`pwd`

echo "Looking in:   $DOWNLOADS"
echo "Placing into: $REPO"
echo ""

FOUND=0
MISSING=0

place () {
    hint="$1"
    dest="$2"

    base=`echo "$hint" | sed 's/\.[^.]*$//'`
    ext=`echo "$hint" | sed 's/.*\.//'`
    spaced=`echo "$base" | tr '_' ' '`

    best=""

    for candidate in "$DOWNLOADS"/*."$ext" "$ICLOUD_DOWNLOADS"/*."$ext"; do
        [ -f "$candidate" ] || continue
        fname=`basename "$candidate"`
        keep=no
        case "$fname" in
            "$base".*|"$base"\ *|"$base"-*) keep=yes ;;
        esac
        case "$fname" in
            "$spaced".*|"$spaced"\ *|"$spaced"-*) keep=yes ;;
        esac
        [ "$keep" = "yes" ] || continue

        if [ -z "$best" ]; then
            best="$candidate"
        elif [ "$candidate" -nt "$best" ]; then
            best="$candidate"
        fi
    done

    if [ -n "$best" ]; then
        cp "$best" "$REPO/$dest"
        echo "  OK    `basename \"$best\"`  ->  $dest"
        FOUND=`expr $FOUND + 1`
    else
        echo "  ----  $hint  not in Downloads (skipped)"
        MISSING=`expr $MISSING + 1`
    fi
}

echo "Placing files:"
place "constitution_data.json"       "constitution_data.json"
place "annotated.html"               "annotated.html"
place "constitutional-history.html"  "constitutional-history.html"
place "search-index.js"              "search-index.js"
place "constitution-current.md"      "docs/constitution-current.md"
place "constitutional-quickref.md"   "docs/constitutional-quickref.md"
place "updates.js"                   "_data/updates.js"
place "WORLD-THREADS-PENDING.md"     "docs/WORLD-THREADS-PENDING.md"

echo ""
echo "Placed: $FOUND    Not found: $MISSING"
echo "(Not found is expected for any file that wasn't part of today's delivery.)"
echo ""

if [ "$FOUND" -eq 0 ]; then
    echo "NOTHING WAS PLACED. The files may not be downloaded yet."
    echo ""
    echo "Checked both:"
    echo "  $DOWNLOADS"
    echo "  $ICLOUD_DOWNLOADS"
    echo ""
    echo "Matching files found in local Downloads:"
    ls -la "$DOWNLOADS" 2>/dev/null | grep -i "constitution\|annotated\|search-index\|quickref\|updates\|WORLD-THREADS"
    echo ""
    echo "Matching files found in iCloud Downloads:"
    ls -la "$ICLOUD_DOWNLOADS" 2>/dev/null | grep -i "constitution\|annotated\|search-index\|quickref\|updates\|WORLD-THREADS"
    echo ""
    exit 1
fi

if [ -f "scripts/check-consistency.py" ]; then
    echo "Running consistency check..."
    echo ""
    python3 scripts/check-consistency.py
    echo ""
fi

echo "Next: open GitHub Desktop, confirm the changed files look right,"
echo "then Commit and Push."
