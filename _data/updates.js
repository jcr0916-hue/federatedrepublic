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
    title: "The consular election takes shape",
    blurb: "Year 13 in the Federated Republic of Torenthia. A Civic Consul race forms as the Lake Varda crisis sharpens — followed piece by piece on the permanent record.",
    href: "torenthia.html",
  },
  {
    category: "constitution",
    badge: "Amendment",
    title: "§2.6.a — Government Formation",
    blurb: "A new provision for when the Assembly cannot elect a Civic Consul: a bound caretaker, a nominating ballot, and a national ranked-choice election. Deadlock routes to the people, not to a vacancy.",
    href: "scenario-the-formation.html",
  },
  {
    category: "constitution",
    badge: "Amendment",
    title: "\u00a72.16 \u2014 Executive Incapacity",
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
    title: "The Formation scenario",
    blurb: "Walk the \u00a72.6.a cascade step by step: a four-way Assembly split, twenty-one days with no Consul, and the constitution turning the deadlock into a national election.",
    href: "scenario-the-formation.html",
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
