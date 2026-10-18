# Root HTML duplicate repair — 2026-10-18

## Incident
PR #212 merged with Constitution Archival success but World Publishing failed: 16 root-level `torenthia-news-... 2.html` and `torenthia-nrs-... 2.html` / ` 3.html` pages violate required filename/worldId agreement.

## Audit
Enumerated all root-level HTML files on main and found 23 with duplicate space-2 or space-3 suffixes, including seven duplicated State constitution/profile pages in addition to the 16 World pages. For all 23 the canonical unsuffixed filename exists and has the identical Git blob SHA, establishing byte-identical contents. This branch removes only those extra root HTML files, not the canonical HTML files or historical archives.

## Verification
Exact-content comparisons completed before changes. CI still pending after PR creation. No changes to World chronology, NRS identifiers, Constitution history or state-test pages.

## Next
Verify Constitution archival and World publishing jobs green. Merge this repair first, then refresh/retest PR #211 and proceed to authenticated cleanup preview. No branch deletion as part of this repair.
