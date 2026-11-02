# Branch history — Torenthia's founding flag initiative

**Original branch:** `feature/torenthia-flag-initiative-20261101`

**PR:** draft PR link pending at initial handoff; see this branch's pull request

**Base commit:** [`ed68a7aa62fe4c36f3376cc3f7199d7980b15ce7`](https://github.com/jcr0916-hue/federatedrepublic/commit/ed68a7aa62fe4c36f3376cc3f7199d7980b15ce7)

**Head commit at handoff:** pending initial commit; the draft PR records the final head

**Status:** proposed and locally verified; not shipped, merged, or deployed

## Purpose

Integrate the author-approved citizen flag initiative and legislative adoption into *The First Twelve Years*, including the four actual design finalists. Four Founders is **Torenthia's flag**; the Federated Republic emblem remains the **seal**.

## Changes and artifacts

- `scenario-the-first-twelve-years.html`: founding citizen initiative introduced beside Mira's existing flag remark; four embedded SVGs and the Assembly's deliberation/adoption placed in Phase 4, after the first full government is operating. Captions, descriptive alt text, intrinsic image dimensions, uncropped responsive sizing, two-column desktop and one-column phone layout.
- `images/flags/`: A–C preserve the original conversation SVG artwork geometry and colors. D implements the expressly authorized SVG fallback for the approved Four Founders design, including a pure white, unoutlined four-point star.
- [Design provenance and narrative boundaries](../../../torenthia/FLAG-DESIGN-REFERENCE-20261101.md) and [Story Bible](../../../torenthia/STORY-BIBLE.md#torenthias-flag-and-the-federated-republic-seal) preserve the source decisions for reuse.

## Results and verification

- **Passed:** `npm run world:publish-check` in full (44 Constitution archive tests and 169 Node tests across 27 summaries; zero failures), including the site build, publishing safeguards, chronology, scenario catalog, discovery, consistency and constitutional compatibility checks. Build wrote 415 pages; discovery verified local links/anchors, 270 existing public records, 19 State historical tests and 12 State profile/Constitution routes. All 55 scenarios remained consistent; compatibility covered 397 pages and 338 documented decisions.
- **Passed:** SVG XML parsing and accessibility metadata; A–C artwork elements/attributes compared with the recovered original SVGs. All four built flag assets are byte-identical to their reviewed source files. D's star is explicitly `#ffffff` with `stroke="none"` and no inherited stroke.
- **Passed:** in-app browser inspection at 1440, 768, 390 and 320 CSS pixels: two columns on desktop/tablet, one on phones, all four images loaded with alt text and original aspect ratios, no horizontal overflow. Desktop gallery and 390-pixel adopted-flag views visually inspected. Browser warning/error log was empty. The navigation still uses `/seal.png`.
- **Passed:** `git diff --check`. A shared dependency directory was temporarily linked only after package-lock equality was verified; that link is excluded from the proposed changes.
- Initial direct browser launch and local-server binding were restricted in the execution environment; verification completed through the in-app browser and an approved loopback-only local preview. No deployment was used.
- Full local validation log and desktop/mobile screenshots are retained in the task workspace's `output/` directory; they are local QA artifacts, not website assets or public records.

## Decisions and lessons

- **Proposed:** a nonpartisan citizen initiative presents four finalists; the newly constituted federal Assembly selects Four Founders and ordinary legislative procedure enacts the National Flag Act. No constitutional amendment, exact adoption date, vote count, designer identity or public popularity result is invented.
- **Historically preserved:** four founding political communities include Korda; only three predecessor sovereign countries ratified the merger. Korda's existing separate Territorial Integration story and the rest of the Twelve Years chronology are unchanged.
- **Rejected:** the prior image-search substitute for D, a red outline around the central star, replacing the seal with the flag, treating Korda as a fourth ratifying sovereign, and creating a new World/NRS record for this task.
- **Limitation / unresolved source:** the approved PNG path and a downloadable attachment were unavailable. D faithfully renders the agreed design as SVG; recovered pixel geometry, exact original color values and fictional statutory numerical specifications are **not established**. Reuse the committed asset; compare against the approved original if it becomes available before any geometric refinements.
- **Experimental:** none introduced. **Shipped:** none; this is a draft review branch.

## Open follow-ups

- Review the draft narrative and SVG fallback. No merge, deployment, fictional-time advance or World/NRS publication is authorized by this handoff.
- Add the draft PR link and substantive commit reference once available, without renaming this note.

## Preservation and branch disposition

- Work began in a separate checkout from the verified current `main` base above. Existing checkouts, working edits, and the open #273–#276 editorial/Korda branch chain were not changed or made dependencies of this PR.
- Preserve these source files, design reference and handoff in any eventual approved integration. Prefer a merge commit so original history remains reachable; a squash requires separate history preservation before cleanup.
- **Branch disposition:** retain this unfinished draft PR head. Content is not merged and the branch is not deleted. After a separately approved merge, apply the three-newest-completed-branches buffer and guarded SHA-leased cleanup policy; eventual disposition belongs in its cleanup ledger.
- **Dependency review:** repository `vercel.json` disables Git deployments for non-main branches; it was inspected and left unchanged. Live deployment settings, external automation and protection/deletion clearance are **not established**. No branch-cleanup-review attestation or deletion is performed. Complete the final-SHA dependency review under [BRANCH-LIFECYCLE.md](../BRANCH-LIFECYCLE.md) before eventual cleanup.
