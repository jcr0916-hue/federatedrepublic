/* _data/stats.js — Torenthia Stats: the single source of truth.
 *
 * GOVERNING DISCIPLINE (see WORLD-STORY-BIBLE.md):
 *   Once a number here is published, it BINDS every future piece. This ledger is what we
 *   write FROM, not a record reconciled afterward. Same rule as constitution_data.json.
 *
 * ANNOUNCEMENT POLICY: one announcement at launch, then NEVER. Data changes are not posted —
 *   the numbers just shift, and the reader who watches sees it first. Preserving history
 *   (the `since` and `prior` fields) is encouraged; announcing a change is not.
 *
 * ORDERED BY VOLATILITY: executive dials first (most dynamic), open slot second,
 *   structural table last (reference bedrock).
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. THE EXECUTIVE — most dynamic. These move with the story.
// ─────────────────────────────────────────────────────────────────────────────
const executive = [
  {
    name: "Elin Thoss",
    office: "Civic Consul",
    since: "Y13 M9",
    metrics: [
      {
        label: "Assembly support",
        value: 266,
        prior: 274,
        of: 500,
        // §2.6 constructive vote: absolute majority of full seated membership
        threshold: 251,
        thresholdLabel: "251 to survive",
        tier: "high",
      },
      {
        label: "Public approval",
        value: 46,
        unit: "%",
        tier: "mid",
      },
    ],
    note:
      "Her working Assembly count is fifteen votes above the survival line, down from the 274 that installed her. The §12.6 review remains the pressure point.",
  },
  {
    name: "Casimir Rehn",
    office: "Legat Consul",
    since: "external domain",
    metrics: [
      {
        label: "Public approval",
        value: 61,
        unit: "%",
        tier: "high",
      },
    ],
    note:
      "The Legat Consul answers to no confidence vote — the office is not the Assembly's to remove. Approval here is standing, not survival.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. THE OPEN SLOT — whatever is contested right now. Comes off when it settles.
//    The turnover of this slot is itself a record: what sat here in Y13 vs Y15
//    is a history of what the Republic cared about, narrated by nothing.
// ─────────────────────────────────────────────────────────────────────────────
const openSlot = {
  flag: "§12.6 · Fiscal Equalization",
  headline: "The Formula Goes Back to the Floor",
  body:
    "The Civic Consul has sent the equalization mechanism to the Legislature for its full statutory review, in public, rather than move the queue by discretion. Any formula that lifts Korda and Morantine moves someone down — and the advantaged states were in the 198.",
  stages: [
    { when: "Now",   label: "Notice filed",  active: true  },
    { when: "Next",  label: "Committee",     active: false },
    { when: "Then",  label: "Floor vote",    active: false },
    { when: "After", label: "EM certifies",  active: false },
  ],
  entered: "Year 13, Month 9",
  status: "still open",
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. STATES & TERRITORIES — most stable. Reference bedrock.
//
//    Assembly seats: Webster method under §3.2, ~103,600 per seat, totalling 500.
//    Senate: flat 2 per State under §3.5 regardless of population; Territories hold none.
//    Relationship (Article XV — Territorial Structure and Statehood) is CONSTITUTIONAL status.
//    Audit is Statehood-Audit HEALTH (§15.2) — a separate dimension, deliberately not conflated.
// ─────────────────────────────────────────────────────────────────────────────
// statusColor: green | yellow | red — the "should I be concerned" signal, shown for every
// entry. audit: the specific label text (compliance vocabulary for States, process vocabulary
// for Territories — deliberately NOT shared vocabulary; that collision, esp. both Corindal and
// Korda once carrying the identical word "Crisis" to mean unrelated things, was the bug this
// redesign fixes). summary: the popup content, shown via hover/tap on the status pill. Write a
// real summary only where there's actual published coverage to draw on; everyone else gets an
// honest, minimal, non-manufactured placeholder. Keep summaries grounded in published coverage.
const states = [
  { name: "Harren",     pop: 6.2, senate: 2, assembly: 60, rel: "State", audit: "Passing",  statusColor: "green",  summary: "Founding State. Its own profile page covers its history and the federal preamble's studied neutrality toward it — no other current story.", char: "Northern heartland · Founding State" },
  { name: "Merath",     pop: 5.8, senate: 2, assembly: 56, rel: "State", audit: "Passing",  statusColor: "green",  summary: "Passing — nothing notable on record.", char: "Interior · Industrial" },
  { name: "Orath",      pop: 5.4, senate: 2, assembly: 52, rel: "State", audit: "Passing",  statusColor: "green",  summary: "Passing — nothing notable on record.", char: "Interior · Agricultural heartland" },
  { name: "Aldenmere",  pop: 4.9, senate: 2, assembly: 47, rel: "State", audit: "Review",   statusColor: "yellow", summary: "Under statutory Review — no further detail published yet.", char: "Capital region · Southwestern coast" },
  { name: "Caldenmere", pop: 4.6, senate: 2, assembly: 44, rel: "State", audit: "Passing",  statusColor: "green",  summary: "Passing — nothing notable on record.", char: "Western coast · Calden port" },
  { name: "Kelvant",    pop: 4.1, senate: 2, assembly: 40, rel: "State", audit: "Strained", statusColor: "yellow", summary: "Proposed receiving State in the Korda corridor merger petition. The corridor referendum was canceled; the competing claims remain before Korda’s Territory Convention. No merger has taken effect.", char: "Eastern lake · Rhondel city" },
  { name: "Selvane",    pop: 3.6, senate: 2, assembly: 35, rel: "State", audit: "Passing",  statusColor: "green",  summary: "Passing — nothing notable on record.", char: "Central heartland · Mixed heritage" },
  { name: "Arvane",     pop: 3.3, senate: 2, assembly: 32, rel: "State", audit: "Passing",  statusColor: "green",  summary: "Passing — nothing notable on record.", char: "Western coast · Maritime" },
  { name: "Varek",      pop: 2.7, senate: 2, assembly: 26, rel: "State", audit: "Passing",  statusColor: "green",  summary: "Consented to §18.4 National Trust designation for its portion of Argent Ridge. No single-executive government, by its own constitution.", char: "Northern border · River country" },
  { name: "Rhovane",    pop: 2.2, senate: 2, assembly: 21, rel: "State", audit: "Watch",    statusColor: "yellow", summary: "Feeling direct spillover from the Lake Varda crisis — \"this city is carrying too much,\" per its own Assembly delegate.", char: "Eastern lake · Under pressure" },
  { name: "Norvane",    pop: 1.6, senate: 2, assembly: 15, rel: "State", audit: "Watch",    statusColor: "yellow", summary: "Refused §18.4 National Trust consent for its Argent Ridge parcel — the residential portion remains its best large housing option near the northern arrival corridor.", char: "Northern lake · Arrival zone" },
  { name: "Corindal",   pop: 1.1, senate: 1, assembly: 11, rel: "Provisional (from State)", audit: "Provisional", statusColor: "red", summary: "Provisional since a failed §15.3 Statehood Audit. Subject of Maren Sollis's ongoing dispatch and the site of the Corindal Industrial Partners record.", char: "Southern border · Valedon adjacent", senateNote: "1 vacant, expires Y15" },
];

const territories = [
  { name: "Korda",      pop: 3.4, senate: 0, assembly: 33, rel: "Territory", audit: "Contested", statusColor: "red",    summary: "Two certified petitions — a corridor merger and a whole-Territory statehood bid — triggered §15.5.a(1). The Territory Convention is underway; the Supreme Court has affirmed it continues (SC-Y13-0119).", char: "Indigenous · Southeastern lake shore · Incorporation dispute" },
  { name: "Morantine",  pop: 1.6, senate: 0, assembly: 15, rel: "Territory (statehood process)", audit: "First audit passed · awaiting second", statusColor: "green", summary: "First Statehood Audit passed; second audit due within the §15.2(4) two-year window. No material failure on record.", char: "Southern border · Valedon country" },
  { name: "Solara",     pop: 0.9, senate: 0, assembly:  9, rel: "Territory (statehood process)", audit: "First audit passed · awaiting second", statusColor: "green", summary: "First Statehood Audit passed; second audit due within the §15.2(4) two-year window. No material failure on record.", char: "Western Sea island · Distinct culture" },
  { name: "Verdmont",   pop: 0.4, senate: 0, assembly:  4, rel: "Territory", audit: "Not started", statusColor: "yellow", summary: "Territory — statehood process not yet initiated.", char: "Northern Alps · Resource extraction" },
];

// ── derived totals (never hand-maintained) ──────────────────────────────────
const all = states.concat(territories);
const totals = {
  population: Math.round(all.reduce((n, s) => n + s.pop, 0) * 10) / 10,
  assembly: all.reduce((n, s) => n + s.assembly, 0),
  senateFilled: all.reduce((n, s) => n + s.senate, 0),
  senateTotal: states.length * 2,
  states: states.length,
  territories: territories.length,
};

export default { executive, openSlot, states, territories, totals };
