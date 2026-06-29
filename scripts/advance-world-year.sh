#!/bin/bash
# Advance the Torenthia world year across all tagged HTML files.
# Usage: bash scripts/advance-world-year.sh 12 13
#
# How it works: <!-- WORLD_YEAR --> comment markers are placed next to
# every hard-coded year reference in world-facing pages. This script
# finds those markers and updates the adjacent year value.
# After running: verify with grep -n "WORLD_YEAR" *.html
# Also manually update: meta og:description, record archive year headers,
# dispatch card "Latest:" labels, and any prose year references in world pages.

FROM=$1
TO=$2

if [ -z "$FROM" ] || [ -z "$TO" ]; then
  echo "Usage: bash scripts/advance-world-year.sh <from_year> <to_year>"
  echo "Example: bash scripts/advance-world-year.sh 12 13"
  exit 1
fi

echo "Advancing world year: Year $FROM → Year $TO"
echo ""

for file in $(grep -rl "WORLD_YEAR" *.html 2>/dev/null); do
  sed -i "s/Year $FROM<\/div><!-- WORLD_YEAR -->/Year $TO<\/div><!-- WORLD_YEAR -->/g" "$file"
  sed -i "s/Year $FROM\. The constitution operates here/Year $TO. The constitution operates here/g" "$file"
  echo "Updated: $file"
done

echo ""
echo "Done. Run: grep -n 'WORLD_YEAR' *.html to verify all instances."
