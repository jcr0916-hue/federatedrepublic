// Curated hero-carousel feed for index.html. Edit this list to add an update.
// category drives the fallback image: constitution -> parchment, world -> map, site -> seal.
// Optional `image:` overrides the category default (e.g. a specific portrait or place image).
// Newest first — the carousel shows them in this order. Keep it current: when something ships,
// add it to the TOP and let older items fall off the visible window.

const CATEGORY_IMAGE = {
  constitution: "Federated-Republic-Parchment-card.webp",
  world:        "world-map-card.webp",
  site:         "seal-card.webp",
};

const updates = [
  {
    category: "world",
    badge: "The World",
    title: "Thoss names her Council — and the receipt",
    blurb: "Eleven days after the vote, her ministers publish to the record. The surprise isn't who's on the list — it's how she intends to pay her debts. \u00a712.8 heads back to the floor, in public.",
    href: "torenthia-news-043.html",
  },
  {
    category: "world",
    badge: "The World",
    title: "Two Hundred Seventy-Four",
    blurb: "The count nobody outside her rooms had seen becomes public. Elin Thoss is Civic Consul \u2014 not by a bare majority, but by twenty-three votes more than she needed.",
    href: "torenthia-news-042.html",
  },
  {
    category: "site",
    badge: "Feature",
    title: "The Diagrams, rebuilt",
    blurb: "Seven core mechanics, each a quick read \u2014 pick from the carousel, hover any \u00a7 for context, click through to the exact provision.",
    href: "diagrams.html",
  },
  {
    category: "site",
    badge: "Feature",
    title: "The Scenario Library, rebuilt",
    blurb: "Pick a shelf, browse its scenarios, open the one that fits. The newest addition leads \u2014 tied to what's happening in the world right now.",
    href: "scenarios.html",
  },
  {
    category: "constitution",
    badge: "Amendment",
    title: "\u00a72.6.a — Government Formation",
    blurb: "A new provision for when the Assembly cannot elect a Civic Consul: a bound caretaker, a nominating ballot, and a national ranked-choice election. Deadlock routes to the people, not to a vacancy.",
    href: "scenario-the-formation.html",
  },
  {
    category: "constitution",
    badge: "Amendment",
    title: "\u00a72.16 — Executive Incapacity",
    blurb: "A defined process for a Civic Consul unable to serve: the Council of Ministers determines incapacity by majority of members then in office, with a floor of five.",
    href: "annotated.html#s2-16",
  },
  {
    category: "site",
    badge: "Feature",
    title: "So You Want a Constitution?",
    blurb: "A short questionnaire on how you'd arrange power \u2014 who holds it, who checks it, what it must never touch. Nine questions, a one-page result, nothing political.",
    href: "survey.html",
  },
  {
    category: "site",
    badge: "Feature",
    title: "Quick Sheets",
    blurb: "The constitution's core mechanics distilled to twelve one-page references \u2014 rights, elections, the judiciary, the monitors, and more, each at a glance.",
    href: "quicksheets.html",
  },
];

export default updates.map(u => ({ ...u, image: u.image || CATEGORY_IMAGE[u.category] }));
