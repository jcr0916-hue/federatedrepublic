function extractRefs(text) {
  return [...String(text || '').matchAll(/§\s*(\d+(?:\.\d+)*(?:\.[a-z])?)/gi)]
    .map(m => '§' + m[1]);
}

function formatProvision(provision, label) {
  return `${label} [${provision.num}] ${provision.name}\n${provision.text}`;
}

function mechanicCues(text, limit = 3) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return [];

  const clauses = normalized
    .split(/(?<=[.!?;])\s+(?=(?:\(\d+\)\s*)?(?:If|Where|When|Upon|Unless|After|Before|Until|Failing)\b)/g)
    .map(x => x.trim())
    .filter(Boolean);

  const cuePattern = /\b(?:if|where|when|upon|unless|failing|fails?|failure|lapses?|does not act|has not made|deadline|within \d+|automatically|automatic|may not|void)\b/i;
  const out = [];

  for (const clause of clauses) {
    if (!cuePattern.test(clause)) continue;
    const clipped = clause.length > 420
      ? clause.slice(0, 417).replace(/\s+\S*$/, '') + '...'
      : clause;
    out.push(clipped);
    if (out.length >= limit) break;
  }

  return out;
}

function familyBase(num) {
  const m = String(num || '').match(/^(§\d+(?:\.\d+)*)\.[a-z]$/i);
  return m ? m[1] : String(num || '');
}

function isLetteredSibling(candidateNum, base) {
  const escaped = base.replace(/[.*+?^$()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped}\\.[a-z]$`, 'i').test(candidateNum);
}

function buildNavigatorContextPacket(question, ranked, provisions, relatedLimit = 4) {
  const byNum = new Map(provisions.map(p => [p.num, p]));
  const primary = [];
  const seenPrimary = new Set();

  for (const item of ranked || []) {
    const provision = item?.provision;
    if (!provision || seenPrimary.has(provision.num)) continue;
    primary.push({
      provision,
      via: item.via || null,
    });
    seenPrimary.add(provision.num);
  }

  const related = [];
  const seenRelated = new Set();

  // Keep parent/lettered-sibling provisions together before broader citations.
  // These are structurally adjacent parts of one numbered mechanism.
  for (const item of primary) {
    const num = item.provision.num;
    const base = familyBase(num);
    const parent = num !== base ? byNum.get(base) : null;

    if (parent && !seenPrimary.has(parent.num) && !seenRelated.has(parent.num)) {
      related.push({ provision: parent, from:num, relation:'structural parent' });
      seenRelated.add(parent.num);
    }

    if (related.length >= relatedLimit) break;

    for (const candidate of provisions) {
      if (candidate.num === num || seenPrimary.has(candidate.num) || seenRelated.has(candidate.num)) continue;
      if (!isLetteredSibling(candidate.num, base)) continue;
      related.push({ provision:candidate, from:num, relation:'structural sibling' });
      seenRelated.add(candidate.num);
      if (related.length >= relatedLimit) break;
    }

    if (related.length >= relatedLimit) break;
  }

  // Then include provisions explicitly cited by the primary evidence.
  for (const item of primary) {
    for (const ref of extractRefs(item.provision.text)) {
      if (seenPrimary.has(ref) || seenRelated.has(ref)) continue;
      const provision = byNum.get(ref);
      if (!provision) continue;
      related.push({ provision, from:item.provision.num, relation:'explicit citation' });
      seenRelated.add(ref);
      if (related.length >= relatedLimit) break;
    }
    if (related.length >= relatedLimit) break;
  }

  const sections = [
    'SOURCE PACKET — generated deterministically from constitution_data.json',
    '',
    'QUESTION',
    String(question || '').trim(),
    '',
    'PRIMARY RETRIEVED PROVISIONS',
  ];

  if (primary.length) {
    primary.forEach((item, index) => {
      const route = item.via ? ` — included by cross-reference from ${item.via}` : '';
      sections.push(formatProvision(item.provision, `PRIMARY ${index + 1}${route}`), '');
    });
  } else {
    sections.push('(none)', '');
  }

  sections.push('RELATED EXACT-TEXT PROVISIONS');
  if (related.length) {
    related.forEach((item, index) => {
      sections.push(
        formatProvision(
          item.provision,
          `RELATED ${index + 1} — ${item.relation} to ${item.from}`
        ),
        ''
      );
    });
  } else {
    sections.push('(none)', '');
  }

  const cueSources = [
    ...primary.map(x => x.provision),
    ...related.map(x => x.provision),
  ];
  const cueLines = [];
  const seenCueProvision = new Set();

  for (const provision of cueSources) {
    if (seenCueProvision.has(provision.num)) continue;
    seenCueProvision.add(provision.num);
    const cues = mechanicCues(provision.text, 3);
    if (!cues.length) continue;
    cueLines.push(`[${provision.num}] ${provision.name}`);
    cues.forEach(cue => cueLines.push(`- ${cue}`));
    if (cueLines.length >= 24) break;
  }

  sections.push(
    'PROCEDURAL CUES — verbatim excerpts extracted mechanically to keep triggers, deadlines, and fallback consequences attached to the provision that states them',
    cueLines.length ? cueLines.join('\n') : '(none)',
    ''
  );

  sections.push(
    'PACKET RULE',
    'Primary provisions are the retrieval layer\'s best evidence for the question. Related provisions are exact constitutional text supplied only because they are structural siblings/parents or are explicitly cited by a primary provision; they are not automatically controlling. Backlinks are intentionally excluded because a downstream provision that cites a primary rule is often not evidence for the question. If this packet does not establish a requested fact or resolution, say so rather than inventing one.'
  );

  return {
    packet: sections.join('\n').trim(),
    primary: primary.map(x => x.provision),
    related: related.map(x => x.provision),
  };
}

module.exports = {
  extractRefs,
  mechanicCues,
  buildNavigatorContextPacket,
};
