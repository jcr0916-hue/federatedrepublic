function extractRefs(text) {
  return [...String(text || '').matchAll(/§\s*(\d+(?:\.\d+)*(?:\.[a-z])?)/gi)]
    .map(m => '§' + m[1]);
}

function exactRefRegex(num) {
  const escaped = String(num).replace(/\./g, '\\.');
  return new RegExp(escaped + '(?![\\w.])');
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
    const clipped = clause.length > 420 ? clause.slice(0, 417).replace(/\s+\S*$/, '') + '...' : clause;
    out.push(clipped);
    if (out.length >= limit) break;
  }
  return out;
}

function formatProvision(provision, label) {
  return `${label} [${provision.num}] ${provision.name}\n${provision.text}`;
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

  const explicitRelated = [];
  const backlinks = [];
  const seenRelated = new Set();

  for (const item of primary) {
    for (const ref of extractRefs(item.provision.text)) {
      if (seenPrimary.has(ref) || seenRelated.has(ref)) continue;
      const provision = byNum.get(ref);
      if (!provision) continue;
      explicitRelated.push({ provision, from: item.provision.num });
      seenRelated.add(ref);
      if (explicitRelated.length >= relatedLimit) break;
    }
    if (explicitRelated.length >= relatedLimit) break;
  }

  if (explicitRelated.length < relatedLimit) {
    for (const candidate of provisions) {
      if (seenPrimary.has(candidate.num) || seenRelated.has(candidate.num)) continue;
      const citedPrimary = primary.find(item => exactRefRegex(item.provision.num).test(candidate.text));
      if (!citedPrimary) continue;
      backlinks.push({ provision: candidate, to: citedPrimary.provision.num });
      seenRelated.add(candidate.num);
      if (explicitRelated.length + backlinks.length >= relatedLimit) break;
    }
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

  sections.push('RELATED EXACT-TEXT PROVISIONS FOUND BY CROSS-REFERENCE');
  if (explicitRelated.length) {
    explicitRelated.forEach((item, index) => {
      sections.push(formatProvision(item.provision, `RELATED ${index + 1} — cited by ${item.from}`), '');
    });
  } else {
    sections.push('(none)', '');
  }

  const cueSources = [
    ...primary.map(x => x.provision),
    ...explicitRelated.map(x => x.provision),
    ...backlinks.map(x => x.provision),
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

  sections.push('BACKLINKS — OTHER PROVISIONS THAT EXPLICITLY CITE A PRIMARY PROVISION');
  if (backlinks.length) {
    backlinks.forEach((item, index) => {
      sections.push(formatProvision(item.provision, `BACKLINK ${index + 1} — cites ${item.to}`), '');
    });
  } else {
    sections.push('(none)', '');
  }

  sections.push(
    'PACKET RULE',
    'Primary provisions are the retrieval layer\'s best evidence for the question. Related and backlink provisions are exact constitutional text supplied to expose dependencies and downstream consequences; they are not automatically controlling. If this packet does not establish a requested fact or resolution, say so rather than inventing one.'
  );

  return {
    packet: sections.join('\n').trim(),
    primary: primary.map(x => x.provision),
    related: [...explicitRelated, ...backlinks].map(x => x.provision),
  };
}

module.exports = {
  extractRefs,
  mechanicCues,
  buildNavigatorContextPacket,
};
