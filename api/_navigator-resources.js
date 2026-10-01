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

function resourceBundle(provisions = [], scenarios = []) {
  const resources = [];
  const seen = new Set();
  for (const item of provisions) {
    const provision = item.provision || item;
    if (!provision?.num) continue;
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
  return resources;
}

module.exports = {
  annotatedAnchor,
  annotatedHref,
  provisionResource,
  scenarioResource,
  resourceBundle,
};
