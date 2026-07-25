/* _data/stats.js — Torenthia Stats: the single source of truth.
 *
 * GOVERNING DISCIPLINE (see WORLD-THREADS-PENDING.md):
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
        value: 274,
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
      "She holds the chamber by twenty-three votes and the country by none. The \u00a712.8 review will move both, and not necessarily the same way.",
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
      "The Legat Consul answers to no confidence vote \u2014 the office is not the Assembly's to remove. Approval here is standing, not survival.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. THE OPEN SLOT — whatever is contested right now. Comes off when it settles.
//    The turnover of this slot is itself a record: what sat here in Y13 vs Y15
//    is a history of what the Republic cared about, narrated by nothing.
// ─────────────────────────────────────────────────────────────────────────────
const openSlot = {
  flag: "\u00a712.8 \u00b7 Fiscal Equalization",
  headline: "The Formula Goes Back to the Floor",
  body:
    "The Civic Consul has sent the equalization mechanism to the Legislature for its full statutory review, in public, rather than move the queue by discretion. Any formula that lifts Korda and Morantine moves someone down \u2014 and the advantaged states were in the 198.",
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
const states = [
  { name: "Harren",     pop: 6.2, senate: 2, assembly: 60, rel: "State", audit: "Passing",  char: "Northern heartland \u00b7 Founding State" },
  { name: "Merath",     pop: 5.8, senate: 2, assembly: 56, rel: "State", audit: "Passing",  char: "Interior \u00b7 Industrial" },
  { name: "Orath",      pop: 5.4, senate: 2, assembly: 52, rel: "State", audit: "Passing",  char: "Interior \u00b7 Agricultural heartland" },
  { name: "Aldenmere",  pop: 4.9, senate: 2, assembly: 47, rel: "State", audit: "Review",   char: "Capital region \u00b7 Southwestern coast" },
  { name: "Caldenmere", pop: 4.6, senate: 2, assembly: 44, rel: "State", audit: "Passing",  char: "Western coast \u00b7 Calden port" },
  { name: "Kelvant",    pop: 4.1, senate: 2, assembly: 40, rel: "State", audit: "Strained", char: "Eastern lake \u00b7 Rhondel city" },
  { name: "Selvane",    pop: 3.6, senate: 2, assembly: 35, rel: "State", audit: "Passing",  char: "Central heartland \u00b7 Mixed heritage" },
  { name: "Arvane",     pop: 3.3, senate: 2, assembly: 32, rel: "State", audit: "Passing",  char: "Western coast \u00b7 Maritime" },
  { name: "Varek",      pop: 2.7, senate: 2, assembly: 26, rel: "State", audit: "Passing",  char: "Northern border \u00b7 River country" },
  { name: "Rhovane",    pop: 2.2, senate: 2, assembly: 21, rel: "State", audit: "Watch",    char: "Eastern lake \u00b7 Under pressure" },
  { name: "Norvane",    pop: 1.6, senate: 2, assembly: 15, rel: "State", audit: "Watch",    char: "Northern lake \u00b7 Arrival zone" },
  { name: "Corindal",   pop: 1.1, senate: 1, assembly: 11, rel: "Provisional (from State)", audit: "Crisis", char: "Southern border \u00b7 Valedon adjacent", senateNote: "1 vacant, expires Y15" },
];

const territories = [
  { name: "Korda",      pop: 3.4, senate: 0, assembly: 33, rel: "Territory", audit: "Crisis", char: "Indigenous \u00b7 Southeastern lake shore \u00b7 Incorporation dispute" },
  { name: "Morantine",  pop: 1.6, senate: 0, assembly: 15, rel: "Provisional (from Territory)", audit: null, char: "Southern border \u00b7 Valedon country" },
  { name: "Solara",     pop: 0.9, senate: 0, assembly:  9, rel: "Provisional (from Territory)", audit: null, char: "Western Sea island \u00b7 Distinct culture" },
  { name: "Verdmont",   pop: 0.4, senate: 0, assembly:  4, rel: "Territory", audit: null, char: "Northern Alps \u00b7 Resource extraction" },
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
