#!/bin/bash
#
# diagnose.sh — figures out WHY place-downloads.sh isn't finding files.
# Prints what it sees at each step. Doesn't change anything.
#
# Run from the repo root:
#   bash diagnose.sh

echo "=================================================="
echo "STEP 1: Which script file is actually on disk?"
echo "=================================================="
if [ -f scripts/place-downloads.sh ]; then
    echo "scripts/place-downloads.sh exists."
    if grep -q "nullglob" scripts/place-downloads.sh; then
        echo "  -> Contains 'nullglob' = NEW version (the one I sent last)"
    else
        echo "  -> No 'nullglob' = OLD version (the fix never got saved over it)"
    fi
    if grep -q "stat -f" scripts/place-downloads.sh; then
        echo "  -> Contains 'stat -f' = the broken macOS-syntax version"
    fi
    echo ""
    echo "  Last modified:"
    ls -l scripts/place-downloads.sh
else
    echo "scripts/place-downloads.sh DOES NOT EXIST at that path."
fi

echo ""
echo "=================================================="
echo "STEP 2: What does HOME resolve to?"
echo "=================================================="
echo "HOME = $HOME"
echo "Downloads path would be: $HOME/Downloads"
if [ -d "$HOME/Downloads" ]; then
    echo "  -> That directory EXISTS"
else
    echo "  -> That directory DOES NOT EXIST (this would be the problem)"
fi

echo ""
echo "=================================================="
echo "STEP 3: Can bash actually see the files?"
echo "=================================================="
DOWNLOADS="$HOME/Downloads"
for f in constitution_data.json annotated.html constitutional-history.html search-index.js; do
    if [ -f "$DOWNLOADS/$f" ]; then
        echo "  FOUND    $f"
    else
        echo "  missing  $f"
    fi
done

echo ""
echo "=================================================="
echo "STEP 4: Does globbing work?"
echo "=================================================="
shopt -s nullglob
matches=("$DOWNLOADS"/constitution_data*.json)
shopt -u nullglob
echo "Glob 'constitution_data*.json' matched ${#matches[@]} file(s):"
for m in "${matches[@]}"; do
    echo "    $m"
done

echo ""
echo "=================================================="
echo "STEP 5: Anything in Downloads matching our names?"
echo "=================================================="
ls -la "$DOWNLOADS" 2>/dev/null | grep -i "constitution\|annotated\|search-index\|quickref" || echo "  (nothing matched)"

echo ""
echo "=================================================="
echo "STEP 6: bash version"
echo "=================================================="
echo "Running under: $BASH_VERSION"
echo "(macOS ships bash 3.2 by default — some newer syntax fails silently there)"

echo ""
echo "=================================================="
echo "DONE — paste all of this output back"
echo "=================================================="
