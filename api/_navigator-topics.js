// Deterministic answer-first registry for common constitutional questions.
// Every answer is source-bound to the listed current constitutional provisions.
// Matching is intentionally narrow; anything outside these aliases stays on the
// existing deterministic title/section path or escalates to Sonnet.

function normalizeQuestion(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9§.'\s-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[?.!]+$/, '');
}

const TOPICS = [
  {
    id: 'judicial-selection',
    aliases: [
      'judicial selection',
      'judicial appointment',
      'judicial appointments',
      'judge selection',
      'judicial appointment process',
      'how are judges selected',
      'how are judges appointed',
      'who appoints judges',
    ],
    answer: 'Judicial selection begins with the Judicial Pool. For inferior courts, the Civic Consul nominates a judge from the Judicial Pool and the Senate confirms by a two-thirds vote under §4.2. For the Supreme Court, the Civic Consul likewise nominates from the Judicial Pool under §4.4; the Senate then votes on the nomination within the applicable deadline. If the ordinary Supreme Court process stalls, §4.4 and §4.4.a provide temporary-service and public-confirmation fallback mechanisms.',
    sections: [
      ['§4.2', 'Inferior courts: Civic Consul nomination from the Judicial Pool; Senate confirmation by 2/3'],
      ['§4.4', 'Supreme Court: Civic Consul nomination from the Judicial Pool; Senate vote plus vacancy-continuity rules'],
      ['§4.4.a', 'Supreme Court fallback: Senate-bypass public confirmation in specified circumstances'],
    ],
  },
  {
    id: 'supreme-court-selection',
    aliases: [
      'how are supreme court justices selected',
      'how are supreme court justices appointed',
      'who appoints supreme court justices',
      'who selects supreme court justices',
      'supreme court appointment process',
    ],
    answer: 'Supreme Court justices are nominated by the Civic Consul from the Judicial Pool. The Civic Consul must nominate within the applicable vacancy deadline, and the Senate must vote within the applicable confirmation deadline. A confirmed justice serves a single non-renewable 12-year term; §4.4 also provides temporary service and a public-confirmation fallback when the ordinary process stalls.',
    sections: [
      ['§4.4', 'Ordinary Supreme Court nomination, Senate vote, temporary service, and confirmation process'],
      ['§4.4.a', 'Separate Senate-bypass public-confirmation mechanism'],
    ],
  },
  {
    id: 'civic-consul-removal',
    aliases: [
      'how is the civic consul removed',
      'how can the civic consul be removed',
      'who can remove the civic consul',
      'how do you remove the civic consul',
      'civic consul removal',
      'remove the civic consul',
    ],
    answer: 'The Assembly can remove the Civic Consul only through a constructive vote of no confidence: one vote must both remove the sitting Civic Consul and elect a named replacement. It requires an absolute majority of the full seated Assembly membership under §2.6.',
    sections: [
      ['§2.6', 'Constructive vote of no confidence: removal and replacement in one Assembly vote'],
    ],
  },
  {
    id: 'statehood',
    aliases: [
      'how does a territory become a state',
      'how can a territory become a state',
      'how does statehood work',
      'statehood process',
      'territory to state',
    ],
    answer: 'A Territory enters the statehood process by a resolution of its elected governing authority or by a qualifying citizen petition. It must then achieve two successful Statehood Audits within the constitutional time windows. Upon publication of the second successful audit, the Territory becomes a State immediately by constitutional operation; no additional political vote, legislative act, executive confirmation, or provisional stage is required.',
    sections: [
      ['§15.2', 'Initiation, two successful Statehood Audits, and automatic admission as a State'],
    ],
  },
  {
    id: 'state-independence',
    aliases: [
      'can a state leave the republic',
      'can a state leave the federation',
      'can a state become independent',
      'how can a state become independent',
      'state independence process',
      'state secession',
    ],
    answer: 'A State may seek independence through the three-stage process in §15.9: a State-level legislative resolution and referendum; concurrent ratification by both federal chambers; and then a national referendum. If all three stages succeed, the State and Legislature negotiate a separation agreement, and independence takes effect on the date specified in that agreement after Senate ratification.',
    sections: [
      ['§15.9', 'Three-stage voluntary State independence process and separation agreement'],
    ],
  },
  {
    id: 'military-authority',
    aliases: [
      'who controls the military',
      'who commands the military',
      'who has military command',
      'who can use military force',
      'military authority',
      'military command',
    ],
    answer: 'The Legat Consul holds military command and force-employment authority. The Legat Consul may use force immediately in response to an active or imminent attack on Republic territory, citizens abroad, or treaty allies; beyond immediate response, military force requires legislative authorization. Authorized military action must also serve a purpose permitted by Article XIV.',
    sections: [
      ['§2.1', 'Legat Consul domain includes military command and force employment'],
      ['§2.2', 'Immediate defensive force and the requirement for legislative authorization beyond immediate response'],
      ['§14.1', 'Permitted and prohibited purposes for military force'],
    ],
  },
  {
    id: 'amendments',
    aliases: [
      'how is the constitution amended',
      'how do constitutional amendments work',
      'how are constitutional amendments passed',
      'constitutional amendment process',
      'amendment process',
    ],
    answer: 'The Constitution has two amendment paths. A parliamentary amendment requires two-thirds of the full seated membership of both chambers and then either State Ratification or Popular Ratification as specified by the proposing body. A citizen-initiative amendment uses the two-phase petition process in §17.1 and then goes directly to a national referendum under the higher constitutional thresholds stated there.',
    sections: [
      ['§17.1', 'Parliamentary and citizen-initiative amendment paths'],
    ],
  },
  {
    id: 'nrs',
    aliases: [
      'what is the nrs',
      'what is the national record system',
      'how does the nrs work',
      'how does the national record system work',
      'what does the nrs do',
    ],
    answer: 'The National Record System is the Republic’s permanent, tamper-evident public record, freely accessible to every Inhabitant at no cost. Constitutional acts and official records are published there subject to Article X. The NRS records authority; it does not create authority or legal effect unless the Constitution expressly makes publication a condition of effect.',
    sections: [
      ['§10.1', 'Permanent public record, publication duties, permanence, and the rule that the NRS records rather than creates authority'],
    ],
  },
  {
    id: 'monetary-authority',
    aliases: [
      'what is the monetary authority',
      'what does the monetary authority do',
      'who controls monetary policy',
      'who issues the currency',
      'who issues currency',
      'how is the monetary authority selected',
    ],
    answer: 'The Monetary Authority is constitutionally independent of both executives and the Legislature in exercising its constitutional functions. It is responsible for monetary policy, currency issuance, fiscal-integrity certification, and assigned National Endowment functions; it has exclusive authority to issue the Republic’s currency. Principal decision-makers are selected through an independent candidate process and confirmed by two-thirds of the Senate.',
    sections: [
      ['§12.1.a', 'Monetary Authority independence, functions, currency authority, and leadership selection'],
    ],
  },
  {
    id: 'citizen-legislative-initiative',
    aliases: [
      'how can citizens propose a law',
      'how can citizens propose legislation',
      'how does citizen initiative work',
      'citizen legislative initiative',
      'citizen initiative process',
    ],
    answer: 'Citizens may propose legislation directly through the two-phase petition process in §13.2. After the required geographic and national signature thresholds are met, the Legislature must vote within 90 days. If the proposal fails or is not voted on, it proceeds to a direct citizen referendum under the constitutional passage and participation thresholds.',
    sections: [
      ['§13.2', 'Two-phase citizen petition, legislative vote, and referendum fallback'],
    ],
  },
  {
    id: 'non-derogable-rights',
    aliases: [
      'what rights cannot be suspended',
      'what rights are non derogable',
      'what are the non derogable rights',
      'which rights cannot be suspended',
      'rights that cannot be suspended',
    ],
    answer: 'Six rights are non-derogable: the prohibitions on torture and slavery; habeas corpus; the right to a public trial; the prohibition on retroactive punishment; and non-refoulement. No emergency declaration, executive order, or legislative act may derogate them.',
    sections: [
      ['§1.19.a', 'The six absolute non-derogable rights and the prohibition on derogation'],
    ],
  },
];

const aliasIndex = new Map();
for (const topic of TOPICS) {
  for (const alias of topic.aliases) {
    const key = normalizeQuestion(alias);
    if (aliasIndex.has(key)) throw new Error(`Duplicate Navigator topic alias: ${key}`);
    aliasIndex.set(key, topic);
  }
}

function topicMatch(question) {
  return aliasIndex.get(normalizeQuestion(question)) || null;
}

module.exports = { TOPICS, normalizeQuestion, topicMatch };
