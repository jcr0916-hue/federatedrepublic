/* _data/atlas.js — the world beyond the Republic.
 *
 * BUILD PRINCIPLE (see WORLD-THREADS-PENDING.md, "The Atlas as Expandable Frontier"):
 *   Data-driven from day one. Adding a nation is adding a RECORD here, never editing the page.
 *   This is what keeps the participation door open — a visitor-named neighbor touches no
 *   constitution, breaks no canon, and needs no §-verification. Rigor stays authored in the
 *   Republic's own documents; the edges of the map can become shared.
 *
 * `region` groups entries on the page. `now` is the live situation — the one field expected to
 * change as the story moves. Keep it current; it is the atlas's equivalent of a dateline.
 */

const nations = [
  {
    key: "caldris",
    name: "Caldris",
    region: "North & Northeast",
    tag: "Upstream Power &middot; ~85 million",
    body:
      "The Republic's largest neighbor. Caldris controls the Toren River headwaters &mdash; Torenthia is downstream. It also holds economic investment in Sunderland, giving it interests in the eastern war the Republic cannot ignore.",
    now:
      "Proposed upstream dam infrastructure on the Toren. Treaty renewal active. The water talks and the Sunderland situation are not separate files.",
  },
  {
    key: "sunderland",
    name: "Sunderland",
    region: "East",
    tag: "Authoritarian &middot; Fracturing &middot; At War",
    body:
      "A nation coming apart. Civil conflict has produced refugees crossing Lake Varda into Norvane and Rhovane for two years, and the crossings have not slowed.",
    now:
      "Three LC diplomatic notes on vessel incursions. Coast guard in Rhondel on standing emergency protocols. The Interim Authority has not answered the Republic's standing inquiry.",
  },
  {
    key: "marisvia",
    name: "Marisvia",
    region: "West",
    tag: "Maritime Democracy &middot; Across the Western Sea",
    body:
      "A seafaring republic across the Western Sea, and the Republic's most natural diplomatic counterpart &mdash; which has not prevented a long-running disagreement over Solara.",
    now:
      "Historical claims on Solara Territory unresolved. Refugee burden-sharing from the eastern war is an active negotiation.",
  },
  {
    key: "valedon",
    name: "Valedon",
    region: "South",
    tag: "~25\u201330 million &middot; The Nation That Almost Joined",
    body:
      "The nation that almost joined. Valedon's incorporation question has never fully closed, and the border states of Corindal and Morantine sit in its cultural shadow.",
    now:
      "Whether a citizen referendum constitutes a constructive &sect;15.6 petition has never been put to the SC. Several in Valedon would like to find out.",
  },
  {
    key: "seronne",
    name: "Seronne",
    region: "Southeast",
    tag: "~5\u20138 million &middot; Buffer State",
    body:
      "A small state between the Republic and the eastern conflict, whose independence has always depended on being useful to larger neighbors rather than strong enough to refuse them.",
    now:
      "Quiet inquiries about &sect;15.6 incorporation &mdash; not because they want to join, but to signal to Sunderland that they could.",
  },
];

/* Not a foreign sovereignty — a Torenthian Territory that sits in the contested
   space of the region, which is why it belongs on the atlas alongside the neighbors. */
const contested = [
  {
    key: "solara",
    name: "Solara Territory",
    region: "Western Sea Island",
    tag: "Distinct Culture &middot; Torenthian Territory",
    body:
      "A Torenthian Territory with a culture of its own and an ancient capital at Ostara. Marisvia has never accepted the island's choice to sit within the Republic.",
    now:
      "Statehood debate active within Solara itself. Has submitted a formal bid to host the seat of government under &sect;18.2. Marisvia has never accepted the island's choice.",
  },
];

export default { nations, contested };
