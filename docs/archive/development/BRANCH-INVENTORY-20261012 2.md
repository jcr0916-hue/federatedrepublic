# Branch preservation inventory — 2026-10-12

> Read-only inventory of remote refs on the date above. No branch has been deleted or deemed safe to delete solely from this report.

## Purpose

Identify GitHub branches needing preservation review before cleanup. For merged PRs, PR discussions and Git history remain a source, but squash/rebase merged branches may still contain unique intermediate commits, test artifacts, or intent not copied to `main`. **Do not delete until preservation is verified.**

Total branches: **123**. Pull requests queried: **124**. Branch classifications: merged **116**; no-pr **7**.

## Proposed policy

- Retain `main` and `archive/legacy-project-material`.
- Retain any actively used branch until its work is resolved.
- Before any deletion: inspect PR discussion, unique commits and files; copy material findings into a Markdown development report on `main`; recover archival constitutional editions separately; verify the documentation and content; then delete only reviewed branches.
- `closed-unmerged` and `no-pr` are **investigate**, not deletion candidates.

## Complete branch inventory

| Branch | PR | Status | Historical purpose / title | Head SHA |
|---|---|---|---|---|
| `activate-fiscal-equalization-review` | [#31](https://github.com/jcr0916-hue/federatedrepublic/pull/31) | merged | Reactivate fiscal equalization review | `97f86de12277` |
| `add-terenne-map-capital` | [#92](https://github.com/jcr0916-hue/federatedrepublic/pull/92) | merged | Add Terenne to Aldenmere map data | `07d633f5e65b` |
| `ai-cleanup-haiku-benchmark` | [#51](https://github.com/jcr0916-hue/federatedrepublic/pull/51) | merged | Remove Haiku benchmark endpoint and record result | `44311017e4cf` |
| `ai-crossroads-shadow-benchmark` | [#38](https://github.com/jcr0916-hue/federatedrepublic/pull/38) | merged | Shadow-test GPT-5.4 Nano for Crossroads | `56e278da875b` |
| `ai-efficiency-audit` | [#87](https://github.com/jcr0916-hue/federatedrepublic/pull/87) | merged | Add cross-feature AI efficiency audit and runtime usage metrics | `52f142979862` |
| `ai-gateway-all-live-features` | [#39](https://github.com/jcr0916-hue/federatedrepublic/pull/39) | merged | Route all live AI features through Vercel AI Gateway | `992b089756e5` |
| `ai-gateway-crossroads-poc` | [#37](https://github.com/jcr0916-hue/federatedrepublic/pull/37) | merged | Prototype Vercel AI Gateway routing for Crossroads | `a8674d4bc80e` |
| `ai-navigator-escalation-benchmark` | [#40](https://github.com/jcr0916-hue/federatedrepublic/pull/40) | merged | Benchmark Navigator retrieval and escalation | `0ac72122071c` |
| `ai-navigator-haiku-answer-only-benchmark` | [#48](https://github.com/jcr0916-hue/federatedrepublic/pull/48) | merged | Benchmark Haiku answer-only Tier A path | `8c0f2c142d83` |
| `ai-navigator-haiku-close-paraphrase` | [#50](https://github.com/jcr0916-hue/federatedrepublic/pull/50) | merged | Harden Haiku Tier A to close paraphrase | `90551e1e928f` |
| `ai-navigator-haiku-direct-benchmark` | [#46](https://github.com/jcr0916-hue/federatedrepublic/pull/46) | merged | Benchmark Haiku on 76 direct Navigator rules | `0bcee4254914` |
| `ai-navigator-haiku-single-source-benchmark` | [#47](https://github.com/jcr0916-hue/federatedrepublic/pull/47) | merged | Benchmark Haiku with single-source Tier A packets | `f06359ca0401` |
| `ai-navigator-haiku-temperature-zero` | [#49](https://github.com/jcr0916-hue/federatedrepublic/pull/49) | merged | Test Haiku Tier A at temperature zero | `1ba168416d55` |
| `ai-navigator-model-benchmark` | [#41](https://github.com/jcr0916-hue/federatedrepublic/pull/41) | merged | Run fixed Navigator model comparison | `f01d684a3dcc` |
| `ai-navigator-model-benchmark-verify` | [#43](https://github.com/jcr0916-hue/federatedrepublic/pull/43) | merged | Temporarily run Navigator model benchmark | `b4738f832aa8` |
| `ai-record-navigator-benchmark` | [#45](https://github.com/jcr0916-hue/federatedrepublic/pull/45) | merged | Record Navigator model benchmark and update shadow model | `cc88d174b691` |
| `aldenmere-flag` | [#89](https://github.com/jcr0916-hue/federatedrepublic/pull/89) | merged | Add flat Aldenmere flag to State pages | `57624c114935` |
| `annotator-completion-and-torenthia-2026-10-02` | [#76](https://github.com/jcr0916-hue/federatedrepublic/pull/76) | merged | Finish Annotator responses and publish October 2 Torenthia batch | `b5aa5f496664` |
| `annotator-context-packets` | [#75](https://github.com/jcr0916-hue/federatedrepublic/pull/75) | merged | Give Provision Annotator deterministic constitutional context packets | `5ccb0e20b732` |
| `annotator-model-benchmark` | [#72](https://github.com/jcr0916-hue/federatedrepublic/pull/72) | merged | TEMP: Provision Annotator model benchmark | `76bd5ed3b9ed` |
| `annotator-packet-benchmark-2026-10-02` | [#85](https://github.com/jcr0916-hue/federatedrepublic/pull/85) | merged | Harden Provision Annotator from packet benchmark | `ac7a7d6c6e70` |
| `annotator-strict-benchmark` | [#73](https://github.com/jcr0916-hue/federatedrepublic/pull/73) | merged | TEMP: test stricter Annotator grounding prompt | `9716159181ca` |
| `archive/legacy-project-material` | — | no-pr |  | `5d3052d463bc` |
| `article-ix-final-checkpoint-2026-10-09` | [#103](https://github.com/jcr0916-hue/federatedrepublic/pull/103) | merged | Complete Article IX review: incapacity, accountability, pools and removal | `4f71b5f955af` |
| `article-ix-review-checkpoint-2026-10-09` | [#102](https://github.com/jcr0916-hue/federatedrepublic/pull/102) | merged | Checkpoint approved Article IX revisions and open review decisions | `b953ecc8ba3f` |
| `arvane-flag-profile-2026-10-10` | [#115](https://github.com/jcr0916-hue/federatedrepublic/pull/115) | merged | Add Arvane flag using existing State page templates | `bae431d2413d` |
| `arvane-profile-and-constitution-2026-10-10` | [#113](https://github.com/jcr0916-hue/federatedrepublic/pull/113) | merged | Publish Arvane State profile and formatted Constitution | `10b74fe00b3d` |
| `audit-approved-continuity-and-state-boundaries-20261010` | [#118](https://github.com/jcr0916-hue/federatedrepublic/pull/118) | merged | Apply approved constitutional continuity and State-boundary revisions | `64a74aef695e` |
| `auto-world-dossiers` | [#11](https://github.com/jcr0916-hue/federatedrepublic/pull/11) | merged | Automate Torenthia dossier timelines | `ab4d57e2fe26` |
| `background-stats-aldenmere` | [#88](https://github.com/jcr0916-hue/federatedrepublic/pull/88) | merged | Refresh Torenthia stats and add Aldenmere State profile | `8baabb87c461` |
| `benchmark-navigator-sonnet5` | — | no-pr |  | `e8f9ebabacb0` |
| `biennial-statehood-audits` | [#15](https://github.com/jcr0916-hue/federatedrepublic/pull/15) | merged | Make Statehood Audits biennial | `04c27c787997` |
| `changelog-and-open-items` | [#108](https://github.com/jcr0916-hue/federatedrepublic/pull/108) | merged | Changelog and open items | `bc89834686c1` |
| `cold-storage-questionnaire` | [#66](https://github.com/jcr0916-hue/federatedrepublic/pull/66) | merged | Put Constitution Questionnaire in cold storage | `ca7c2bde6361` |
| `constitution/acting-executive-incapacity` | [#34](https://github.com/jcr0916-hue/federatedrepublic/pull/34) | merged | Add continuity when an acting executive becomes incapacitated | `d2f7b4d44c3e` |
| `constitution/acting-incapacity-history` | [#35](https://github.com/jcr0916-hue/federatedrepublic/pull/35) | merged | Record acting-executive incapacity amendment in constitutional history | `996e3b99c424` |
| `constitution-automatic-archival` | [#124](https://github.com/jcr0916-hue/federatedrepublic/pull/124) | merged | Automatically archive previous Constitution JSON and Markdown pairs | `a77701b5fba1` |
| `constitution-door-closing-2026-10-10` | [#119](https://github.com/jcr0916-hue/federatedrepublic/pull/119) | merged | Close open doors from the 10.10 consistency pass | `f960865f0e07` |
| `constitution-pdf-2026-10-11` | [#120](https://github.com/jcr0916-hue/federatedrepublic/pull/120) | merged | Regenerate full Constitution PDF from current text | `557a4f6d800b` |
| `constitution-reader-polish` | [#6](https://github.com/jcr0916-hue/federatedrepublic/pull/6) | merged | Make the Constitution reader’s links and contents feel integrated | `70baec729071` |
| `constitution-rename-2-3-consular-intelligence` | [#62](https://github.com/jcr0916-hue/federatedrepublic/pull/62) | merged | Rename §2.3 to Consular Intelligence | `fa2cd535a672` |
| `constitution-review-48h-crossroads-site-2026-10-10` | [#114](https://github.com/jcr0916-hue/federatedrepublic/pull/114) | merged | Require 48-hour emergency judicial review; quiet inactive Crossroads and rehome Winning Bid | `76f38950f033` |
| `constitutional-review-2026-10-08-article-vi` | [#99](https://github.com/jcr0916-hue/federatedrepublic/pull/99) | merged | Article VI review: classified evidence and Article I protection for noncitizens | `ed4b2bc18b6b` |
| `constitutional-review-2026-10-08-article-vii` | [#100](https://github.com/jcr0916-hue/federatedrepublic/pull/100) | merged | Article VII constitutional review — elections, ethics, and office continuity | `b2f1c01311d1` |
| `constitutional-review-2026-10-09-article-viii` | [#101](https://github.com/jcr0916-hue/federatedrepublic/pull/101) | merged | Article VIII campaign integrity and Assembly electoral framework | `382558e5c138` |
| `constitutional-subsidiarity-transition` | — | no-pr |  | `4d95b6a1156d` |
| `constitutional-subsidiarity-transition-v2` | [#96](https://github.com/jcr0916-hue/federatedrepublic/pull/96) | merged | Add subsidiarity and harden Article XIX transition rules | `307045b37d2b` |
| `content/caldenmere-winning-bid` | [#90](https://github.com/jcr0916-hue/federatedrepublic/pull/90) | merged | Publish Caldenmere, its flag, and shared seat-selection history | `3d607847a1d2` |
| `content/torenthia-2026-09-28` | [#28](https://github.com/jcr0916-hue/federatedrepublic/pull/28) | merged | Publish four NRS records and Korda fiscal reporting | `267114ec9b6e` |
| `content/torenthia-2026-10-01` | [#65](https://github.com/jcr0916-hue/federatedrepublic/pull/65) | merged | Publish October 1 Torenthia records and Korda evidence update | `e0b76dcffa0b` |
| `content/torenthia-fiscal-equalization-2026-09-29` | [#33](https://github.com/jcr0916-hue/federatedrepublic/pull/33) | merged | Publish Morantine’s fiscal equalization follow-up | `115dae7d62ef` |
| `continuity-state-emergency-council-2026-10-11` | [#122](https://github.com/jcr0916-hue/federatedrepublic/pull/122) | merged | Add the State Emergency Council and reversion to the States | `25d39e200a4c` |
| `court-opinion-navigation` | [#9](https://github.com/jcr0916-hue/federatedrepublic/pull/9) | merged | Explain Court opinion sections with a compact reading guide | `775377bd23f8` |
| `crossroads-benchmark-corpus` | [#69](https://github.com/jcr0916-hue/federatedrepublic/pull/69) | merged | Harden Living Crossroads AI benchmark | `a367a1c0f4d0` |
| `crossroads-hardened-benchmark-temp` | [#70](https://github.com/jcr0916-hue/federatedrepublic/pull/70) | merged | TEMP: hardened Crossroads model benchmark | `944baabf7017` |
| `crossroads-model-benchmark` | [#67](https://github.com/jcr0916-hue/federatedrepublic/pull/67) | merged | TEMP: Crossroads model benchmark | `c849904fb1cf` |
| `design-principles-update-2026-10-10` | [#109](https://github.com/jcr0916-hue/federatedrepublic/pull/109) | merged | Update design-principles reference after the 10.10 text-economy review | `aa9832169f8d` |
| `docs/torenthia-2026-09-28-publication` | [#29](https://github.com/jcr0916-hue/federatedrepublic/pull/29) | merged | Record verified Torenthia publication and next editorial steps | `62a05ef768fd` |
| `editorial-2026-10-07-world-article-vi` | [#97](https://github.com/jcr0916-hue/federatedrepublic/pull/97) | merged | October 7 Torenthia batch and approved Articles V–VI updates | `e566d9852c4b` |
| `finish-scenario-guidance` | [#7](https://github.com/jcr0916-hue/federatedrepublic/pull/7) | merged | Complete reading guidance for all 51 scenarios | `e59e199408e0` |
| `harden-annotator-sonnet` | [#74](https://github.com/jcr0916-hue/federatedrepublic/pull/74) | merged | Harden Provision Annotator and keep Sonnet | `d083aedc98e5` |
| `harren-test-01-domain-dispute` | [#23](https://github.com/jcr0916-hue/federatedrepublic/pull/23) | merged | Publish Harren dual-executive historical test | `b74a96793da8` |
| `korda-convention-resolution-and-vote-2026-10-10` | [#111](https://github.com/jcr0916-hue/federatedrepublic/pull/111) | merged | Korda Convention adopts proposed Northern Lake Settlement (28–5) | `c9d4885d8801` |
| `korda-decision-runway-and-doc-cleanup-2026-10-10` | [#110](https://github.com/jcr0916-hue/federatedrepublic/pull/110) | merged | Korda Convention decision runway and documentation cleanup | `b948073ac4f6` |
| `main` | [#2](https://github.com/jcr0916-hue/federatedrepublic/pull/2) | merged | Merge | `643c9e78dc6e` |
| `navigator-answer-judicial-selection` | [#55](https://github.com/jcr0916-hue/federatedrepublic/pull/55) | merged | Answer judicial-selection queries directly | `1d3e734b0a2a` |
| `navigator-context-packets` | [#78](https://github.com/jcr0916-hue/federatedrepublic/pull/78) | merged | Give Constitution Navigator deterministic context packets | `122786b68af1` |
| `navigator-deterministic-explicit-section` | [#52](https://github.com/jcr0916-hue/federatedrepublic/pull/52) | merged | Serve explicit-section Navigator lookups deterministically | `5439648387e4` |
| `navigator-deterministic-title-match` | [#53](https://github.com/jcr0916-hue/federatedrepublic/pull/53) | merged | Add deterministic full-title Navigator lookups | `02e9125d7b52` |
| `navigator-fallback-completeness` | [#60](https://github.com/jcr0916-hue/federatedrepublic/pull/60) | merged | Require complete material consequences in Navigator fallback | `2bb34708f1d1` |
| `navigator-fallback-prompt-hardening` | [#59](https://github.com/jcr0916-hue/federatedrepublic/pull/59) | merged | Harden Navigator fallback against constitutional inference | `b4d33ab4c309` |
| `navigator-fallback-sufficiency-benchmark` | [#57](https://github.com/jcr0916-hue/federatedrepublic/pull/57) | merged | Benchmark Navigator fallback retrieval sufficiency | `e6519d548187` |
| `navigator-high-risk-topics` | [#84](https://github.com/jcr0916-hue/federatedrepublic/pull/84) | merged | Route repeated high-risk Navigator procedures deterministically | `23669010fb47` |
| `navigator-judicial-selection-disambiguation` | [#54](https://github.com/jcr0916-hue/federatedrepublic/pull/54) | merged | Disambiguate broad judicial-selection queries | `9337ebb282b4` |
| `navigator-open-guide` | [#64](https://github.com/jcr0916-hue/federatedrepublic/pull/64) | merged | Make Constitution Navigator open-ended and resource-guided | `4d3a9bbe648f` |
| `navigator-residual-model-benchmark` | [#83](https://github.com/jcr0916-hue/federatedrepublic/pull/83) | merged | Harden Navigator residual synthesis from packet benchmark | `bc8fd7058325` |
| `navigator-resource-relationships` | [#80](https://github.com/jcr0916-hue/federatedrepublic/pull/80) | merged | Add deterministic constitutional resource relationships | `adf8adf14814` |
| `navigator-routing-telemetry` | [#82](https://github.com/jcr0916-hue/federatedrepublic/pull/82) | merged | Measure Navigator routing before adding another model tier | `a1f6112408d3` |
| `navigator-shadow-opt-in` | [#81](https://github.com/jcr0916-hue/federatedrepublic/pull/81) | merged | Make Navigator shadow evaluation opt-in | `b72653488e80` |
| `navigator-sonnet5` | [#94](https://github.com/jcr0916-hue/federatedrepublic/pull/94) | merged | Promote Navigator residual synthesis to Sonnet 5 | `8d5546b11bf3` |
| `navigator-sonnet-fallback-benchmark` | [#58](https://github.com/jcr0916-hue/federatedrepublic/pull/58) | merged | Benchmark Sonnet Navigator fallback answers | `cea38c250743` |
| `navigator-structured-topic-registry` | [#56](https://github.com/jcr0916-hue/federatedrepublic/pull/56) | merged | Add structured natural-language Navigator topics | `d8ea58df01e7` |
| `promote-crossroads-haiku` | [#71](https://github.com/jcr0916-hue/federatedrepublic/pull/71) | merged | Promote Haiku for Living Crossroads | `d03f70920397` |
| `publish-norvane-kelvant-tests` | [#30](https://github.com/jcr0916-hue/federatedrepublic/pull/30) | merged | Publish Norvane and Kelvant historical tests | `f4a1af69e8e7` |
| `publish-september-30-torenthia` | [#36](https://github.com/jcr0916-hue/federatedrepublic/pull/36) | merged | Publish September 30 Torenthia batch | `3a191e77a4a7` |
| `published-state-constitution-rollout` | [#22](https://github.com/jcr0916-hue/federatedrepublic/pull/22) | merged | Roll formatted Constitutions out to published State profiles | `8721c7db23f8` |
| `publishing-safety-and-papers` | — | no-pr |  | `d82a3879b940` |
| `remove-crossroads-benchmark` | [#68](https://github.com/jcr0916-hue/federatedrepublic/pull/68) | merged | Remove temporary Crossroads benchmark endpoint | `d1399ba2ba4a` |
| `remove-navigator-model-benchmark-final` | [#44](https://github.com/jcr0916-hue/federatedrepublic/pull/44) | merged | Remove completed Navigator model benchmark | `fb9c3f26b91c` |
| `remove-temporary-navigator-benchmark` | [#42](https://github.com/jcr0916-hue/federatedrepublic/pull/42) | merged | Remove temporary Navigator benchmark endpoint | `48abadfffe9d` |
| `research-page-browsing` | [#8](https://github.com/jcr0916-hue/federatedrepublic/pull/8) | merged | Make Sources easier to scan with expandable notes | `e31a367961a1` |
| `retire-korda-crossroads-feature-2026-10-10` | [#112](https://github.com/jcr0916-hue/federatedrepublic/pull/112) | merged | Retire Korda Living Crossroads from active site promotion | `42393697d0a2` |
| `review-intent-decisions-2026-10-11` | [#121](https://github.com/jcr0916-hue/federatedrepublic/pull/121) | merged | Order displaced judges by seniority; record two review decisions | `5828a04c7941` |
| `rhovane-corindal-flags` | [#25](https://github.com/jcr0916-hue/federatedrepublic/pull/25) | merged | Add Rhovane and Corindal flags | `3d88dcd72258` |
| `rhovane-corindal-state-profiles` | [#24](https://github.com/jcr0916-hue/federatedrepublic/pull/24) | merged | Publish Rhovane and Corindal State profiles | `1194e9d78c29` |
| `rhovane-test-01` | [#26](https://github.com/jcr0916-hue/federatedrepublic/pull/26) | merged | Publish Rhovane public-trust historical test | `27dfda21a4e8` |
| `scenario-reading-bridges` | [#5](https://github.com/jcr0916-hue/federatedrepublic/pull/5) | merged | Connect eight scenarios to provisions and specific next reads | `f1d1ba8cf2e0` |
| `separate-state-scenarios` | [#91](https://github.com/jcr0916-hue/federatedrepublic/pull/91) | merged | Separate shared federal scenario from State profile prose | `b022787c9b5c` |
| `session-progress-2026-09-26` | [#19](https://github.com/jcr0916-hue/federatedrepublic/pull/19) | merged | Record current project progress and working ideas | `0bc94a502664` |
| `site-link-consistency` | [#10](https://github.com/jcr0916-hue/federatedrepublic/pull/10) | merged | Replace default blue and purple hyperlinks site-wide | `8658adc810c4` |
| `site-new-world-map` | [#63](https://github.com/jcr0916-hue/federatedrepublic/pull/63) | merged | Replace the Atlas world map with the approved continental map | `77bd9ab99404` |
| `state-profile-history-cards` | [#17](https://github.com/jcr0916-hue/federatedrepublic/pull/17) | merged | Improve State history cards and related rail layout | `f5f3d34fa0cf` |
| `temporary-torenthia-map` | [#20](https://github.com/jcr0916-hue/federatedrepublic/pull/20) | merged | Use uploaded Torenthia artwork for regional maps | `df37d4993db2` |
| `torenthia-2026-09-29` | [#32](https://github.com/jcr0916-hue/federatedrepublic/pull/32) | merged | Publish September 29 Torenthia NRS batch | `7cd6441ff62f` |
| `torenthia-2026-10-08-korda-compilation` | [#98](https://github.com/jcr0916-hue/federatedrepublic/pull/98) | merged | Publish October 8 Torenthia and Korda preliminary compilation | `2bb8cf1824a7` |
| `torenthia-authoring-validation` | [#86](https://github.com/jcr0916-hue/federatedrepublic/pull/86) | merged | Make Torenthia authoring packet-first and validate unresolved canon | `2fbea3bfad44` |
| `torenthia-batch-2026-10-02-evening` | [#77](https://github.com/jcr0916-hue/federatedrepublic/pull/77) | merged | Advance Korda evidence and delegate movement through news 097 | `d89ff43bdea5` |
| `torenthia-context-packets` | [#79](https://github.com/jcr0916-hue/federatedrepublic/pull/79) | merged | Add deterministic Torenthia authoring source packets | `4229f06b07f9` |
| `torenthia-publish-2026-10-09` | — | no-pr |  | `5a4046721e56` |
| `typingmind-kb-tags` | [#16](https://github.com/jcr0916-hue/federatedrepublic/pull/16) | merged | Add metadata-driven TypingMind KB tag planner and maintenance guide | `49f6ef4e0f61` |
| `update-weekly-tracking-2026-09-27` | [#27](https://github.com/jcr0916-hue/federatedrepublic/pull/27) | merged | Refresh weekly project tracking | `e0d856820055` |
| `varek-constitution-presentation` | [#18](https://github.com/jcr0916-hue/federatedrepublic/pull/18) | merged | Add polished Varek State Constitution presentation | `28129acf4fc6` |
| `varek-presentation-refinements` | [#21](https://github.com/jcr0916-hue/federatedrepublic/pull/21) | merged | Refine Varek historical-test presentation | `f650ed9b86d9` |
| `website-refresh` | [#4](https://github.com/jcr0916-hue/federatedrepublic/pull/4) | merged | Improve website orientation, reading paths, and Republic discovery | `07607d1d860d` |
| `weekend-infrastructure` | — | no-pr |  | `ada859069f51` |
| `world-authoring-helper` | [#13](https://github.com/jcr0916-hue/federatedrepublic/pull/13) | merged | Add Torenthia World authoring helper | `26ef487e64a0` |
| `world-metadata-safety-net` | [#12](https://github.com/jcr0916-hue/federatedrepublic/pull/12) | merged | Add World metadata publishing safety net | `132d317f9719` |
| `world-oct4-content` | [#93](https://github.com/jcr0916-hue/federatedrepublic/pull/93) | merged | Publish October 4 Torenthia World batch | `9efc3cd3a877` |
| `world-oct5-content` | [#95](https://github.com/jcr0916-hue/federatedrepublic/pull/95) | merged | Publish October 5 Torenthia World batch | `570af14a9dc8` |
| `world-publishing-guards` | [#14](https://github.com/jcr0916-hue/federatedrepublic/pull/14) | merged | Guard World publication and automate release checks | `208100e32f1e` |
| `world-record-generator` | — | no-pr |  | `e542cdf84ee7` |
| `world-y13m12-opening-records` | [#117](https://github.com/jcr0916-hue/federatedrepublic/pull/117) | merged | Y13 M12 opening records: EM pool roster and housing bill introduction | `6b4fffd5a8c4` |
| `world-y14m01-opening-2026-10-12` | [#123](https://github.com/jcr0916-hue/federatedrepublic/pull/123) | merged | Torenthia: begin Year 14, Month 1 | `bd564b88295c` |

## Next verification steps

1. Investigate the branches marked `closed-unmerged` or `no-pr` first.
2. Record each meaningful branch's outcome in `docs/archive/development/` with its source SHA and any associated PR.
3. Backfill exact historical constitutional source pairs from Git revisions, keeping evidence distinct from reconstructions.
4. Produce a per-branch verified-deletion manifest in a separate PR and seek approval before deleting remote refs.

Generated from the GitHub branches and pull requests APIs. Association by head branch name; force pushes and deleted/reused branch names may limit provenance certainty.