# Branch history — design/remove-duplicate-state-constitution-link-20261016

**Purpose:** Remove redundant Constitution link block at end of all Torenthia State profiles after mobile review.

**Change:** Shared `_includes/state-profile.njk` now proceeds from profile/test material directly to the public-record links without the second `Read the Constitution` section. The existing primary Constitution destination in the Explore State rail remains unchanged.

**Rationale:** One clear Constitution destination reduces page repetition and supports the new feature-oriented reading flow. No State constitutional or canonical source text changes.

**Verification:** Template edit confirmed against source structure. Site build and mobile display checks remain to be confirmed on PR.

**Disposition:** Documentation retained on main after merge; deletion only through reviewed cleanup.
