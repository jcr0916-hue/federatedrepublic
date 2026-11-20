// Cast, outlet and name checks for World records.
//
// Deterministic lookups against _data/worldRegistry.json, so the Central Editor does not
// check them by hand: avoided names, bare surnames in a name-collision group, a byline
// attributed to the wrong outlet, unregistered bylines and outlets, new bylines whose first
// name is one letter from an existing one, and pronouns that contradict a locked pronoun.
// Every result is a warning; nothing here blocks publishing.

import fs from "node:fs";

const escapeRe = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function loadRegistry(file = "_data/worldRegistry.json") {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function editDistance(a, b) {
  a = String(a).toLowerCase(); b = String(b).toLowerCase();
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[a.length][b.length];
}

export function outletKey(name, registry) {
  const n = String(name || "").trim().toLowerCase();
  for (const o of registry.outlets || []) {
    if (o.name.toLowerCase() === n || (o.aliases || []).some((a) => a.toLowerCase() === n)) return o.name;
  }
  return null;
}

function personByName(name, registry) {
  const n = String(name || "").trim().toLowerCase();
  return (registry.people || []).find((p) => p.name.toLowerCase() === n || (p.aliases || []).some((a) => a.toLowerCase() === n)) || null;
}

function sentences(text) {
  return String(text).split(/(?<=[.!?])\s+/);
}

// Pronouns used in the rest of a sentence after each mention of a person, ignoring sentences
// where another registered person is named after the mention (the pronoun may be theirs).
export function pronounHits(person, body, registry) {
  const names = [person.name, ...(person.aliases || [])].filter((n) => !/^Director /.test(n));
  const others = (registry.people || []).filter((p) => p.id !== person.id)
    .flatMap((p) => [p.name, ...(p.aliases || [])]).filter((n) => n.length > 3);
  const counts = { he: 0, she: 0, they: 0 };
  const samples = [];
  for (const s of sentences(body)) {
    for (const name of names) {
      const m = new RegExp(`\\b${escapeRe(name)}\\b`).exec(s);
      if (!m) continue;
      const rest = s.slice(m.index + m[0].length);
      // A byline line (name, outlet, dateline, then the story's first sentence) runs together in the scan; the pronouns after it are the story's, not the reporter's.
      if (/^.{0,120}?\bYear \d+, Month \d+/.test(rest)) continue;
      if (others.some((o) => new RegExp(`\\b${escapeRe(o)}\\b`).test(rest))) continue;
      const he = (rest.match(/\b(he|his|him|himself)\b/gi) || []).length;
      const she = (rest.match(/\b(she|her|hers|herself)\b/gi) || []).length;
      const they = (rest.match(/\b(they|their|them|themself)\b/gi) || []).length;
      counts.he += he; counts.she += she; counts.they += they;
      const want = person.pronouns;
      const bad = (want === "she" && he) || (want === "he" && she) || (want === "they" && (he || she));
      if (bad && samples.length < 2) samples.push(s.trim().slice(0, 160));
      break;
    }
  }
  return { counts, samples };
}

const OPPOSITE = { she: ["he"], he: ["she"], they: ["he", "she"] };

export function analyzeRegistry(data, body, registry) {
  const warnings = [];
  const add = (kind, message) => warnings.push({ kind, message });
  const text = `${data.worldTitle || ""} ${data.worldBlurb || ""} ${body || ""}`;
  const kind = data.worldKind;

  for (const rule of registry.avoid || []) {
    const m = new RegExp(rule.pattern, "i").exec(text);
    if (m) add("avoid", `"${m[0].slice(0, 60)}" must not appear: ${rule.reason}`);
  }

  for (const group of registry.collisions || []) {
    const present = group.names.filter((n) => new RegExp(`\\b${escapeRe(n)}\\b`).test(text));
    if (present.length < 2) continue;
    const surname = group.names[0].split(" ").pop();
    const firsts = group.names.map((n) => n.split(" ")[0]);
    const re = new RegExp(`(?:\\b(${firsts.map(escapeRe).join("|")})\\s+)?\\b${escapeRe(surname)}\\b`, "g");
    let m, bare = 0;
    while ((m = re.exec(text))) if (!m[1]) bare++;
    if (bare) add("collision", `${present.join(" and ")} both appear; ${bare} bare "${surname}" could mean either (${group.note})`);
  }

  const author = String(data.worldAuthor || "").trim();
  const outlet = String(data.worldOutlet || "").trim();
  const isDeskByline = !!author && new RegExp(registry.deskBylinePattern || "$^").test(author);
  const canonicalOutlet = outlet ? outletKey(outlet, registry) : null;

  if (outlet && kind !== "nrs" && !canonicalOutlet) add("outlet", `outlet "${outlet}" is not in the registry; add it to _data/worldRegistry.json if it is new`);

  if (author && !isDeskByline) {
    const person = personByName(author, registry);
    if (!person) {
      const first = author.split(" ")[0];
      const near = (registry.people || []).filter((p) => {
        const pf = p.name.split(" ")[0];
        return pf.length > 2 && editDistance(pf, first) <= 1;
      }).map((p) => p.name);
      add("byline", `new byline "${author}" (${outlet || "no outlet"}); add to the registry${near.length ? `. First name is within one letter of ${near.join(", ")}: consider a more distinct name` : ""}`);
    } else if (canonicalOutlet && person.outlets && !person.outlets.includes(canonicalOutlet)) {
      add("outlet", `${author} is registered at ${person.outlets.join(" or ")}, not ${canonicalOutlet}`);
    }
  }

  for (const person of registry.people || []) {
    if (!person.pronounsLocked || !person.pronouns) continue;
    const { counts, samples } = pronounHits(person, body || "", registry);
    const wrong = OPPOSITE[person.pronouns].reduce((n, p) => n + counts[p], 0);
    if (wrong) add("pronoun", `${person.name} is locked to "${person.pronouns}" but the text pairs ${wrong} other pronoun${wrong > 1 ? "s" : ""} with the name${samples.length ? `: "${samples[0]}"` : ""}`);
  }
  return warnings;
}

// Pronoun counts for everyone in the registry, from a set of records. Used to review locks.
export function pronounEvidence(records, registry) {
  const out = [];
  for (const person of registry.people || []) {
    const total = { he: 0, she: 0, they: 0 };
    for (const r of records) {
      const { counts } = pronounHits({ ...person, pronouns: null }, r.body, registry);
      total.he += counts.he; total.she += counts.she; total.they += counts.they;
    }
    out.push({ id: person.id, name: person.name, locked: !!person.pronounsLocked, pronouns: person.pronouns || null, ...total });
  }
  return out;
}
