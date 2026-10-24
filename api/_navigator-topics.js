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
    answer: 'Judicial selection begins with the Judicial Pool. For inferior courts, the Civic Consul nominates a judge from the Judicial Pool and the Senate confirms by a majority of its full seated membership under §4.2. For the Supreme Court, the Civic Consul likewise nominates from the Judicial Pool under §4.4; the Senate must vote within 120 days, and confirmation requires a majority of the full seated Senate. If the ordinary Supreme Court process stalls, §4.4 and §4.4.a provide temporary-service and public-confirmation fallback mechanisms.',
    sections: [
      ['§4.2', 'Inferior courts: Civic Consul nomination from the Judicial Pool; Senate confirmation by majority of full seated membership'],
      ['§4.4', 'Supreme Court: Civic Consul nomination from the Judicial Pool; Senate vote plus vacancy-continuity rules'],
      ['§4.4.a', 'Supreme Court fallback: public confirmation when a nomination or Senate vote stalls'],
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
      ['§4.4.a', 'Public confirmation when a nomination or Senate vote stalls'],
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
    answer: "A Territory starts by resolution or a qualifying citizen petition. All three Monitor findings complete an audit; the responsible legislative chamber determines compliance. Two qualifying audits must be completed within the two-year windows and receive affirmative determinations under §§15.2 and 15.2.a. A timely completed audit remains eligible for decision afterward. The second affirmative determination creates Statehood immediately, subject to subdivision viability where applicable; no separate admission act follows.",
    sections: [["§15.2", "Initiation, completed audit records, qualification periods and Statehood"], ["§15.2.a", "Affirmative legislative decisions, exclusive transfer on delay and judicial enforcement"]],
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
    id: 'supreme-court-senate-inaction',
    aliases: [
      'does §4.4 imply the senate can block a supreme court seat forever',
      'can the senate block a supreme court seat forever',
      'what happens if the senate does not vote on a supreme court nominee',
      'what happens if the senate fails to vote on a supreme court nominee',
      'how do §4.4 and §4.4.a interact if the senate delays',
      'what happens if the senate delays a supreme court nomination',
    ],
    answer: 'A Senate failure to vote is not the same as rejection. Under §4.4(3), the Senate must vote within the applicable period, not to exceed 120 days, and no deemed confirmation applies. If the Senate fails to vote within that period, §4.4.a submits the serving Temporary Associate Justice for public confirmation at the next federal electoral period, requiring 60% of votes cast; an ordinary nomination and Senate confirmation completed before the ballot is certified ends that public route. The same route opens when the Civic Consul fails to nominate by the applicable deadline. The provisions do not say that an affirmative Senate rejection triggers public confirmation.',
    sections: [
      ['§4.4', 'Ordinary Supreme Court nomination and Senate-vote deadlines; temporary-service continuity'],
      ['§4.4.a', 'Public confirmation when the Civic Consul fails to nominate or the Senate fails to vote within the required period'],
    ],
  },
  {
    id: 'military-domain-dispute',
    aliases: [
      'who controls the military if the two consuls disagree about whether an operation is domestic or foreign',
      'who controls the military during an executive domain dispute',
      'what happens if the consuls disagree about military jurisdiction',
      'what happens if the civic consul and legat consul disagree over a military operation',
    ],
    answer: "The Council of Ministers is the first forum for a domain dispute under §2.14. It exercises no executive authority. Each Consul continues established functions while the specific disputed action is suspended, and unresolved disputes may go to the Supreme Court. During active military operations, command within the defensive authority or lawful authorization actually present belongs to the Legat Consul under §2.2; that does not decide an unresolved constitutional boundary. A temporary emergency operational lead under §2.14.a requires both Consuls to concur and does not transfer either constitutional domain.",
    sections: [["§2.14", "Council coordination and domain disputes"], ["§2.2", "Military command and its lawful scope"], ["§2.14.a", "Temporary emergency coordination without domain transfer"]],
  },
  {
    id: 'statehood-process-failure',
    aliases: [
      'what happens if the statehood process becomes impossible to complete',
      'what happens if a territory cannot complete statehood',
      'what happens if a territory misses the statehood deadlines',
      'what happens if the statehood audit process cannot be completed',
    ],
    answer: "The two-year qualification periods in §15.2 govern completion of audit records. A timely completed audit remains eligible for legislative determination afterward; delay alone does not terminate the proceeding. Section 15.2.a transfers an overdue decision exclusively to the other chamber and permits judicial enforcement of its duty. Separately, a §15.5.a Convention that produces no resolution within ninety days causes its affected petitions to lapse together, with a three-year bar on substantially the same geographic petitions.",
    sections: [["§15.2", "Qualification periods and timely completed records"], ["§15.2.a", "Legislative transfer and enforcement"], ["§15.5.a", "Competing petitions, remainder viability and Convention consequences"]],
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
    answer: "The Legat Consul commands operations necessary against an active or imminent attack, including necessary defense beyond the border. Other objectives require authorization by law within §14.1 purposes; a ratified treaty may supply authority for action its terms require. The Senate may require an alert posture when active defensive operations are no longer justified. Operational review, scope, appropriations and withdrawal duties remain governed by §§2.2 and 14.2.",
    sections: [["§2.2", "Immediate defense, notice, Senate alert-posture direction and command"], ["§14.1", "Permitted military purposes"], ["§14.2", "Authorization, operational review, appropriations and withdrawal"], ["§14.4", "Treaty authority within its terms"]],
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
    answer: "Citizens may propose legislation through §13.2 using the §13.1 two-phase petition process. The geographic requirements carry over; Phase Two requires ten percent nationally. The completion period is statutory. After verification the Legislature has ninety days to enact the proposal; otherwise the Elections Panel holds a referendum within the following ninety days. Sixty percent of votes cast enacts the initiative, without a constitutional turnout floor. It cannot narrow Article I rights, directly appropriate funds or alter taxes, duties or tariffs.",
    sections: [["§13.2", "Initiative thresholds, legislative period, referendum and limits"], ["§13.1", "Shared petition procedure and accessibility floor"]],
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
      ['§1.16.a', 'The six absolute non-derogable rights and the prohibition on derogation'],
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
