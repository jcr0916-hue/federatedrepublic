// Curated hero-carousel feed for index.html. Edit this list to add an update.
// category drives the fallback image: constitution -> parchment, world -> map, site -> seal.
// Optional `image:` overrides the category default (e.g. a specific portrait or place image).
// Newest first — the carousel shows them in this order.

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
    category: "site",
    badge: "Feature",
    title: "The Atlas",
    blurb: "The world of Torenthia, mapped in full: twelve states, four territories, and the country the constitution actually governs.",
    href: "torenthia-atlas.html",
  },
  {
    category: "constitution",
    badge: "Amendment",
    title: "Ethics provisions consolidated",
    blurb: "Financial disclosure and conduct rules unified under §12.4, with the Legislature empowered to establish standards under §12.4.a.",
    href: "annotated.html#s12-4",
  },
  {
    category: "site",
    badge: "Feature",
    title: "Seven scenarios added",
    blurb: "The Successor, The Classification, The Ledger, The Contraction, The Waiver, The Unremovable, The Second Renewal — elections, records, fiscal, and military accountability join the library.",
    href: "scenarios.html",
  },
  {
    category: "constitution",
    badge: "Amendment",
    title: "Constitution trimming complete",
    blurb: "A five-phase review reduced the document to its current form — every provision earning its place.",
    href: "annotated.html",
  },
];

export default updates.map(u => ({ ...u, image: u.image || CATEGORY_IMAGE[u.category] }));
