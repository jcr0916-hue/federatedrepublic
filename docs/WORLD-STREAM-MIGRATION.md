# World stream migration

The 137 existing records keep their world IDs, URLs, fictional dates and published
`worldSeq` values. No article bodies, canon, characters or outcomes were changed.
The 41 NRS records gain explicit `nrsSeq` (their existing numbered-file order)
and `nrsId` (their own document title/record reference). Runtime ordering never
parses prose. NRS references are opaque identifiers: their numerical suffix is
not assumed to be a day, a publication count, or consecutive.

Historical NRS `worldSeq` is retained and still checked for collisions. The next
narrative value at migration is 138; the next NRS sequence is 42. New NRS records
omit `worldSeq`, so any volume of NRS leaves the next narrative value unchanged.
All NRS records, including manually imported older documents, now require explicit
NRS metadata. Do not silently assign a reference from another record's summary.

`collections.world` remains the unified archive/discovery/dossier collection.
`collections.narrativeWorld` supplies Latest and narrative Previous/Next;
`collections.nrsRecords` and the stream filter supply NRS navigation. The complete
Record keeps all existing filters and all records. Dates remain the shared
cross-stream axis; same-month tie-breaks are display order, not new canonical days.

Two existing summaries (NRS 010 and 011) quote NRS-Y13-0291, whereas their document
identities are NRS-Y13-0293 and NRS-Y13-0294. The new metadata uses the documents'
own identity fields. Those older summary errors are left for editorial review.

The local ingest implementation is commit b026f22, one commit above the fetched
main ea62db7 at implementation start. This work builds directly on it. Its three
commands, read-only preview, exclusive creation, review boundaries and archive
behavior are reused, not duplicated. The completed work is authorized for commit and push to
`weekend-infrastructure` only; no merge or deployment is authorized.
