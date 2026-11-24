# Edit log

How much the Central Editor changed each desk piece before it was published. Each row compares the desk's filed story with the published story, word by word (the draft's notes ledger and the page markup are left out). **Separate edits** counts unbroken runs of changed words; **Changed** is the share of words that differ (0% = published as filed). It measures size, not importance: one swapped name can matter more than a cut paragraph, and the notes in each desk's `NOTES.md` say why.

Add a row for every desk story at publication:

```
node scripts/newsroom-edits.mjs --log <draft file> <published html> "news NNN · desk · title"
```

The draft is the inbox submission (its JSON, or the story text saved to a file). Records batches are not logged here; their notes list the cuts.

| Piece | Draft words | Published words | Cut | Added | Separate edits | Changed |
|---|---:|---:|---:|---:|---:|---:|
| news 139 · Korda · The Winter Service Ledger | 647 | 649 | 19 | 21 | 21 | 3% |
| news 140 · Federal · What Accurate Enough Costs | 547 | 561 | 115 | 129 | 49 | 22% |
| news 141 · Federal backlog · The Tables Before the Ledger | 633 | 570 | 171 | 108 | 60 | 23% |
| news 142 · Morantine · Field Sheets and Floodwater | 586 | 565 | 217 | 196 | 103 | 36% |
| news 143 · Caldenmere · The Crane Operator and the Canvas Bag | 608 | 600 | 21 | 13 | 11 | 3% |
| news 144 · Partisan Media · Put the Ledger Before the Referendum | 777 | 697 | 108 | 28 | 18 | 9% |

**Week 1 (Nov 16–22, 2026):** six stories, none published as filed. Changed share ran from 3% to 36% (median 16%). The lightest, news 139 and 143, kept almost every sentence: 139 got a rename (Droven to Brask) and one adverb, 143 five wording fixes (authority, "certified/set," the source of the §8.4 allocation, "in the Caldenmere Registry," a byline) and a cut sentence. The heaviest, news 142, had a renamed character (every mention counts), three corrected claims, cut lines and reworded dialogue. A rename or a byline can move this number or not move it at all (a byline sits outside the story text), so read it as a size, with the notes beside it for the substance. Drafts are the inbox versions; if a desk later revised and resubmitted, the first version is the one measured.
| news 146 · Solara · The Island Side of the Two-Sailing Week | 548 | 455 | 128 | 35 | 17 | 16% |
