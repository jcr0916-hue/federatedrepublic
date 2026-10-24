# Adoption candidate — comparison and release checklist

**Status:** Review package only. No update to `constitution_data.json`, generated adopted text, `main`, PDFs, or website.

## Candidate source

- Clean candidate: `docs/adoption-candidate-constitution.md`
- Approved working integration: `docs/constitution-integrated-working.md`
- Existing adopted generated reference: `docs/constitution-current.md`
- Approval and historical decisions: `docs/WORKING-CONSTITUTIONAL-AMENDMENTS.md`

## Structural comparison

- Candidate: 177 numbered sections across 20 Articles.
- Current adopted generated reference: 177 numbered sections across 20 Articles.
- Section text changed or introduced: 105.
- Unchanged section text: 72.
- New section identifiers: §3.9.a, §5.1.b, §12.2.a, §15.2.a.
- Removed section identifiers: §2.10, §7.11, §9.6, §14.3.
- Candidate section content matches integrated working draft: yes.

## Changed sections by Article

- Article 1: 5 changed — §1.7, §1.11, §1.12, §1.16, §1.17
- Article 2: 9 changed — §2.2, §2.5, §2.6.a, §2.9.a, §2.12, §2.14.b, §2.15, §2.16, §2.18
- Article 3: 8 changed — §3.2, §3.3, §3.4, §3.5, §3.9, §3.9.a, §3.10, §3.11
- Article 4: 4 changed — §4.1, §4.2, §4.3, §4.5
- Article 5: 2 changed — §5.1, §5.1.b
- Article 6: 3 changed — §6.2, §6.3, §6.3.a
- Article 7: 6 changed — §7.2, §7.2.a, §7.4, §7.10, §7.12, §7.14
- Article 8: 3 changed — §8.2, §8.3, §8.4
- Article 9: 14 changed — §9.1, §9.1.a, §9.1.b, §9.1.c, §9.1.d, §9.1.e, §9.4, §9.4.a, §9.5, §9.5.a, §9.7, §9.7.a, §9.8, §9.9
- Article 10: 0 changed — none
- Article 11: 1 changed — §11.1
- Article 12: 8 changed — §12.1, §12.1.a, §12.1.b, §12.2, §12.2.a, §12.3, §12.4, §12.6
- Article 13: 2 changed — §13.1, §13.2
- Article 14: 4 changed — §14.1, §14.2, §14.4, §14.5
- Article 15: 6 changed — §15.1.a, §15.2, §15.2.a, §15.3, §15.4, §15.5.a
- Article 16: 5 changed — §16.1, §16.2, §16.3, §16.4, §16.5
- Article 17: 2 changed — §17.1, §17.3
- Article 18: 5 changed — §18.1, §18.2, §18.3, §18.4, §18.5
- Article 19: 11 changed — §19.1, §19.2, §19.3, §19.3.a, §19.4, §19.5, §19.6, §19.7, §19.8, §19.9, §19.10
- Article 20: 7 changed — §20.1, §20.2, §20.3, §20.4, §20.5, §20.6, §20.7

## Release checklist (not yet executed)

- [x] Extract a separate clean candidate without the working-draft notice.
- [x] Compare candidate section identifiers and text with the integrated draft.
- [x] Compare candidate sections against the currently generated adopted Markdown.
- [ ] Independent legal/policy review and explicit approval of the adoption package.
- [ ] Map the approved candidate to the canonical `constitution_data.json` schema, without losing formatting or metadata.
- [ ] On a separately approved release branch, generate the adopted Markdown, website, PDF and annotated edition from canonical data.
- [ ] Diff all generated outputs against the approved candidate; verify publication and site links.
- [ ] Run repository tests and any release workflows; record results.
- [ ] Obtain explicit authorization before merging to the adopted Constitution and publishing.
- [ ] Prepare and verify rollback and restoration procedures for canonical data and deployment.

**Caution:** A changed section count is not a count of individual amendments. The historical register includes superseded proposals; use the latest approved integration as the candidate, not each historical proposal independently.
