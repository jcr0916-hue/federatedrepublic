function annotatedAnchor(sectionNumber) {
  const raw = String(sectionNumber || '').trim().replace(/^§\s*/, '');
  if (!raw) return '';
  const parts = raw.split('.');
  let suffix = '';
  if (parts.length && /^[a-z]$/i.test(parts.at(-1))) suffix = parts.pop().toLowerCase();
  return 's' + parts.join('-') + suffix;
}

function annotatedHref(sectionNumber) {
  const anchor = annotatedAnchor(sectionNumber);
  return anchor ? `annotated.html#${anchor}` : 'annotated.html';
}

function articleNumber(sectionNumber) {
  const m = String(sectionNumber || '').match(/^§(\d+)/);
  return m ? Number(m[1]) : null;
}

function provisionResource(provision, relevance) {
  return {
    kind: 'provision',
    title: `${provision.num} — ${provision.name}`,
    href: annotatedHref(provision.num),
    note: relevance || 'Read this provision in the Annotated Constitution.',
  };
}

function scenarioResource(scenario) {
  return {
    kind: 'scenario',
    title: scenario.title,
    href: scenario.file,
    note: scenario.relevance || 'See this scenario applied in context.',
  };
}

const QUICK_SHEETS = {
  1: ['The Rights Floor', 'quicksheet-rights.html', 'One-page guide to the constitutional rights floor and non-derogable protections.'],
  2: ['The Dual Executive', 'quicksheet-article-2.html', 'One-page guide to the two executive domains, their legislative instruments, and coordination.'],
  3: ['Assembly · Senate', 'quicksheet-article-3.html', 'One-page guide to legislation and the distinct roles of the two chambers.'],
  4: ['The Judiciary', 'quicksheet-judiciary.html', 'One-page guide to the Judicial Pool, inferior courts, and Supreme Court selection.'],
  6: ['Immigration', 'quicksheet-immigration.html', 'One-page guide to residency, asylum, removal, and credentials.'],
  7: ['Electing the Executive', 'quicksheet-elections.html', 'One-page guide to federal elections and executive selection.'],
  8: ['Electing the Executive', 'quicksheet-elections.html', 'Election reference material for federal campaign and electoral rules.'],
  9: ['The Monitors', 'quicksheet-monitors.html', 'One-page guide to the three constitutional Monitors and their selection.'],
  10: ['The Machinery Under the Vote', 'quicksheet-nvs.html', 'Reference guide to the NRS, voting machinery, and independent panels.'],
  11: ['The Machinery Under the Vote', 'quicksheet-nvs.html', 'Reference guide to the NRS Panel, Elections Panel, and National Voting System.'],
  12: ['The Fiscal System', 'quicksheet-fiscal.html', 'One-page guide to fiscal architecture, appropriations, and the Monetary Authority.'],
  13: ['Referendum · Amendment', 'quicksheet-amendments.html', 'One-page guide to direct democracy and constitutional change.'],
  15: ['Joining, Rising, Leaving', 'quicksheet-states.html', 'One-page guide to Statehood, Provisional status, devolution, and departure.'],
  17: ['Referendum · Amendment', 'quicksheet-amendments.html', 'One-page guide to direct democracy and constitutional amendment.'],
};

const DIAGRAMS = {
  structure: {
    title: 'Government Structure',
    href: 'diagrams.html#tab-structure',
    note: 'Visual map of the Republic’s principal constitutional institutions.',
  },
  lifecycle: {
    title: 'Legislative Lifecycle',
    href: 'diagrams.html#tab-lifecycle',
    note: 'Visual guide to passage, executive review, Senate action, and enactment.',
  },
  tiers: {
    title: 'Military Authorization Tiers',
    href: 'diagrams.html#tab-tiers',
    note: 'Visual guide to the constitutional tiers for military authorization.',
  },
  dual: {
    title: 'Dual Executive Domain Map',
    href: 'diagrams.html#tab-dual',
    note: 'Visual comparison of Legat Consul, Civic Consul, and shared coordination mechanisms.',
  },
  scAppointment: {
    title: 'Supreme Court Appointment',
    href: 'diagrams.html#tab-sc-appointment',
    note: 'Visual path for Supreme Court nomination, Senate action, and fallback.',
  },
  pool: {
    title: 'Constitutional Pool Framework',
    href: 'diagrams.html#tab-pool',
    note: 'Visual guide to constitutional candidate pools and selection routes.',
  },
  states: {
    title: 'States and the Federation',
    href: 'diagrams.html#tab-states-fed',
    note: 'Visual guide to territorial status, Statehood, and federal relationships.',
  },
};

const GLOSSARY_BY_SECTION = {
  '§1.19': ['Declaration of National Emergency', 'glossary.html#term-declaration-of-national-emergency'],
  '§2.1': ['Dual Executive', 'glossary.html#term-dual-executive'],
  '§2.4.a': ['Domain Officer', 'glossary.html#term-legat-consul-officer-appointment-removal'],
  '§2.6': ['Constructive Vote of No Confidence', 'glossary.html#term-constructive-vote-of-no-confidence'],
  '§2.7': ['Suspensive Veto', 'glossary.html#term-suspensive-veto'],
  '§2.14': ['Council of Ministers', 'glossary.html#term-council-of-ministers-joint-executive-dual-executive'],
  '§2.14.a': ['Coordination Failure Protocol', 'glossary.html#term-coordination-failure-protocol'],
  '§3.7': ['Absolute Majority', 'glossary.html#term-absolute-majority'],
  '§5.1': ['Civic Proficiency Assessment', 'glossary.html#term-civic-proficiency-assessment-naturalization'],
  '§6.1': ['Legal Resident', 'glossary.html#term-legal-resident-two-stage-immigration'],
  '§6.2': ['Non-Refoulement', 'glossary.html#term-non-refoulement'],
  '§7.4': ['Disqualifying Offense', 'glossary.html#term-disqualifying-offense-federal-felony'],
  '§9.8': ['Constitutional Pool Framework', 'glossary.html#term-constitutional-pool-framework'],
  '§10.1': ['National Record System', 'glossary.html#term-national-record-system-nrs'],
  '§10.2': ['Classification Ceiling', 'glossary.html#term-classification-ceiling-classified-records-sunlight'],
  '§11.1': ['NRS Panel and Elections Panel', 'glossary.html#term-nrs-panel-elections-panel-panels'],
  '§11.2': ['National Voting System', 'glossary.html#term-national-voting-system-nvs'],
  '§12.1': ['Social State', 'glossary.html#term-social-state'],
  '§14.1': ['Legislative Declaration of Defense', 'glossary.html#term-legislative-declaration-of-defense'],
  '§15.2': ['Statehood Proceeding', 'glossary.html#term-provisional-membership-period'],
  '§15.3': ['Mandatory Devolution', 'glossary.html#term-mandatory-devolution'],
  '§17.3': ['Entrenchment Clause', 'glossary.html#term-entrenchment-clause'],
  '§20.1': ['Associated Community', 'glossary.html#term-associated-community'],
};

function relatedQuickSheet(provisions) {
  const articles = [...new Set(provisions.map(p => articleNumber(p.num)).filter(Boolean))];
  for (const article of articles) {
    const match = QUICK_SHEETS[article];
    if (!match) continue;
    return { kind:'quicksheet', title:match[0], href:match[1], note:match[2] };
  }

  const removal = provisions.some(p => /remov|recall|no confidence/i.test(`${p.name} ${p.text}`));
  if (removal) {
    return {
      kind:'quicksheet',
      title:'Recall · Removal',
      href:'quicksheet-recall-removal.html',
      note:'One-page comparison of the Constitution’s distinct early-removal mechanisms.',
    };
  }
  return null;
}

function relatedDiagrams(provisions) {
  const nums = new Set(provisions.map(p => p.num));
  const articles = new Set(provisions.map(p => articleNumber(p.num)).filter(Boolean));
  const out = [];

  if (articles.has(2)) out.push(DIAGRAMS.dual);
  if (articles.has(3) || nums.has('§2.3.a') || nums.has('§2.7')) out.push(DIAGRAMS.lifecycle);
  if (nums.has('§4.4') || nums.has('§4.4.a')) out.push(DIAGRAMS.scAppointment);
  if (nums.has('§4.2') || nums.has('§9.3') || nums.has('§9.8')) out.push(DIAGRAMS.pool);
  if (articles.has(14)) out.push(DIAGRAMS.tiers);
  if (articles.has(15) || articles.has(16) || articles.has(20)) out.push(DIAGRAMS.states);
  if (!out.length && [...articles].some(a => [2,3,4,9,11].includes(a))) out.push(DIAGRAMS.structure);

  return out.map(d => ({ kind:'diagram', ...d }));
}

function relatedGlossary(provisions) {
  for (const provision of provisions) {
    const match = GLOSSARY_BY_SECTION[provision.num];
    if (!match) continue;
    return {
      kind:'glossary',
      title:match[0],
      href:match[1],
      note:'Glossary definition tied directly to this constitutional mechanism.',
    };
  }
  return null;
}

function deterministicCompanionResources(provisions = [], max = 3) {
  const out = [];
  const sheet = relatedQuickSheet(provisions);
  const diagrams = relatedDiagrams(provisions);
  const glossary = relatedGlossary(provisions);

  // Prefer one item of each complementary format before offering a second
  // diagram. The goal is breadth of explanation, not a longer link list.
  if (sheet) out.push(sheet);
  if (diagrams[0]) out.push(diagrams[0]);
  if (glossary) out.push(glossary);
  out.push(...diagrams.slice(1));

  const seen = new Set();
  return out.filter(resource => {
    const key = resource.href;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, max);
}

function resourceBundle(provisions = [], scenarios = []) {
  const resources = [];
  const seen = new Set();
  const normalizedProvisions = [];

  for (const item of provisions) {
    const provision = item.provision || item;
    if (!provision?.num) continue;
    normalizedProvisions.push(provision);
    const key = `p:${provision.num}`;
    if (seen.has(key)) continue;
    seen.add(key);
    resources.push(provisionResource(provision, item.relevance));
  }

  for (const scenario of scenarios) {
    if (!scenario?.file) continue;
    const key = `s:${scenario.file}`;
    if (seen.has(key)) continue;
    seen.add(key);
    resources.push(scenarioResource(scenario));
  }

  for (const companion of deterministicCompanionResources(normalizedProvisions)) {
    const key = `r:${companion.href}`;
    if (seen.has(key)) continue;
    seen.add(key);
    resources.push(companion);
  }

  return resources;
}

module.exports = {
  annotatedAnchor,
  annotatedHref,
  provisionResource,
  scenarioResource,
  deterministicCompanionResources,
  resourceBundle,
};
