// Netlify serverless function — analyzes a scenario against the Federated Republic constitution
// Environment variable required: ANTHROPIC_API_KEY

const CONSTITUTIONAL_REFERENCE = `
THE FEDERATED REPUBLIC — CONSTITUTIONAL REFERENCE v118

ARTICLE I — INDIVIDUAL SOVEREIGNTY FLOOR (applies to all Inhabitants regardless of citizenship)
§1.2 Prohibition on Torture — PERMANENTLY UNAMENDABLE. No emergency may derogate. Any official who orders torture commits a Rule Violation.
§1.3 Prohibition on Slavery and Forced Labor — PERMANENTLY UNAMENDABLE.
§1.4 Freedom of Expression, Press, Assembly — no censorship by proxy through private entities.
§1.8 Equality Before the Law — all persons; race/ethnicity/religion/sex/orientation are presumptively discriminatory distinctions requiring compelling justification.
§1.9 Bodily Autonomy and Digital Privacy — cryptographic keys are private property; no compelled disclosure.
§1.10 Inviolability of Home — warrants required; general warrants prohibited; digital spaces included.
§1.11 Right to Bear Arms — States may license but licensing cannot function as effective prohibition.
§1.12 Freedom of Movement — professional licenses issued by any State recognized throughout Republic.
§1.13 Right Against Arbitrary Detention — PERMANENTLY UNAMENDABLE. Any arrested person must appear before a judge within 24 hours. Habeas corpus petition must be ruled on within 48 hours or detention is deemed unlawful. No emergency, military authority, or executive order may suspend either right.
§1.14 Right to Counsel — immediately upon detention; publicly funded counsel where unaffordable; adequate resources required.
§1.15 Due Process — bail cannot be set at unaffordable amounts; right to trial cannot be penalized through sentencing; algorithms used as evidence are subject to disclosure and challenge.
§1.16 Right to Silence — silence cannot be used as adverse inference.
§1.17 Right to a Public Trial — PERMANENTLY UNAMENDABLE. No secret proceedings.
§1.18 No Retroactive Laws — PERMANENTLY UNAMENDABLE. No conviction for acts not criminal at the time.
§1.19 Right to Vote — no government action may make voting materially more difficult for any class of eligible citizens; voting must be free at the point of participation.
§1.22 Environmental Accountability — knowingly concealing government-caused environmental harm triggers Rule Violation.
§1.25 Emergency Derogation — requires JOINT declaration by President AND Prime Minister; BOTH chambers must ratify by 2/3 vote within 7 days or declaration lapses; maximum 90 days per period (renewable by same threshold); §1.2, §1.3, §1.13, §1.17, §1.18 CANNOT be derogated under any emergency; Inspectorates continue with full authority; NO emergency declaration may postpone, suspend, or alter any election schedule — elections continue without modification regardless of declared emergency; any such order is automatically void.
§1.26 Associated Community Residents — all Article I rights enforceable in compact territories by federal courts.
§1.27 Non-Refoulement — no removal to territory where person faces persecution, torture, or death based on race, religion, nationality, political opinion, or social group; applies regardless of immigration status or mode of entry; CANNOT be suspended by any emergency declaration.

ARTICLE II — DUAL EXECUTIVE
President domain: foreign affairs, military operations, national security, intelligence, border security, treaty negotiations. Single non-renewable 6-year term elected by national RCV + regional breadth formula.
PM domain: domestic affairs, budget, civil service management, National Record System continuity. Serves at House confidence. Maximum 8 consecutive years.

§2.1 Presidential Military Authority:
  Tier 1: Immediate defensive response to active/imminent attack — no prior authorization; limited to defensive operations only; expires when immediate threat neutralized; President must notify both chambers and PM within 12 hours.
  Tier 2: Offensive operations or sustained defensive deployment — Senate Armed Services Committee must authorize within 96 hours; covers up to 30 days; PM must certify funds within 96 hours.
  Tier 3: Operations beyond 30 days — Parliamentary Declaration of Defense required; 2/3 concurrent majority both chambers.
§2.1.e Privacy Firewall — any order for domestic surveillance directed at Republic citizens is an automatic Rule Violation for the President and Intelligence Director; triggers immediate suspension and Senate trial within 72 hours.
§2.1.f Presidential Veto — only on legislation with a genuine nexus to the President's constitutional domain (military, intelligence, treaty, border security); a general/inferential connection is insufficient; Supreme Court reviews within 48 hours on petition; if out of scope, veto is void and is a Rule Violation; three void vetoes in 180 days = veto power suspended; President may not veto any bill whose primary purpose is reducing or terminating military funding.
§2.1.g Presidential Clemency — limited to military law, national security statutes, foreign affairs offenses; forbidden for Rule Violations, offenses where President was participant/beneficiary, official abuses of position; President cannot grant clemency to themselves.
§2.2 Prime Minister — domestic authority only; all executive orders must be recorded on NRS within 24 hours or are void; civil servants must refuse and report unrecorded orders.
§2.2.c PM 8-Year Limit — no PM may serve more than 8 consecutive years; on taking office, EI records the expiry date.
§2.2.d Civil Service Integrity — directing civil service appointments by political affiliation rather than merit is a Rule Violation.
§2.2.e PM Domestic Emergency — PM alone may declare domestic emergency for natural disaster, public health crisis, or infrastructure failure; must be published to NRS immediately; must be ratified by simple majority of both chambers within parliament-defined period (max 30 days) or lapses; cannot suspend any Article I right; maximum period before re-declaration requires 2/3 if within 60 days of a lapsed declaration.
§2.3.a PM Selection — House selects PM by absolute majority of full seated membership (not just those present); failure to seat PM within statutory period (max 60 days) = automatic dissolution of entire House; party that controlled dissolved House is barred from emergency election.
§2.3.b Constructive Vote of No Confidence — House may remove PM ONLY by simultaneously electing a named successor by absolute majority in the same motion; a no-confidence vote without naming a replacement is constitutionally void and has no effect.
§2.3.d Post-Dissolution Election Bar — any party or organized faction that held a majority of seats in the dissolved House cannot field candidates in the emergency election; returns at next regular cycle.
§2.5 Legislative Review Period — both executives may respond to bills within concurrent statutory periods (presidential veto max 20 days; PM objection max 45 days); if neither acts, bill is deemed enacted.
§2.6.a Presidential Succession — Senate Speaker → Senate Deputy Speaker → most senior Armed Services Committee member; special election within 180 days.
§2.7 Rule Violations — Supreme Court finding triggers AUTOMATICALLY without any further vote: (1) immediate suspension from duties and pay freeze; (2) revocation of access to classified information and government systems; (3) Senate trial scheduled. These consequences cannot be stayed by executive order or parliamentary motion.
§2.7.a Former Official Lookback — finding applies regardless of whether person remains in office; if left office, triggers permanent bar from federal elected or appointed office + permanent forfeiture of federal pension accrued during violation period; applies to conduct within 5 years before the finding.
§2.7.b Military Deferral — if the President is subject to a Rule Violation finding and active Tier 1/2/3 operations are underway, suspension is deferred until operations conclude OR Senate Armed Services Committee certifies personal command authority not operationally required; maximum 30-day deferral regardless; Writ of Impeachment is filed and trial scheduled immediately; Senate Speaker assumes parallel readiness; deferral does NOT apply if the violation concerns the conduct of those military operations.
§2.7.c Minor Violations — classified as minor (corrective order track, not suspension) when: procedural/incidental; no evidence of deliberate circumvention; rights not materially prejudiced; first violation in current service period; prompt self-correction before court proceedings weighs toward minor. Court assesses pattern — three individually minor violations may together constitute a major violation.
§2.7.d Corrective Orders — court-defined compliance period (max 30 days); failure to comply converts to major violation automatically without new proceeding; compliance verified by Inspectorate and recorded on NRS.

ARTICLE III — PARLIAMENT
§3.1.c Single-Subject Rule — every bill must address a single clearly defined subject; unrelated riders nullify the ENTIRE act.
§3.2.c Senate Must Act — Senate must take up every House-passed bill within statute-defined period; failure = Deemed Approved.
§3.2.d Judicial Confirmation — 55-67% Senate supermajority; failure to vote in time = Deemed Confirmed.
§3.2.e Treaty Ratification — 2/3 Senate; treaty must define specific triggering threshold for mutual defense obligations; treaty without defined threshold cannot be ratified.
§3.5 Impeachment — House initiates by simple majority of full membership; Senate trial requires 2/3 of full Senate to convict and remove; House passage does NOT suspend the official (only §2.7 Supreme Court Rule Violation finding does); two tracks are independent.

ARTICLE IV — JUDICIARY
§4.2 Supreme Court — 9 justices elected to single non-renewable 12-year terms by national direct vote; Triad nomination (House, PM, President each nominate one candidate per vacancy); Senate eligibility confirmation (55-67%) then public election; one seat elected every 2 years; mid-term vacancies filled by special election.
§4.2.d Emergency Panel — 4-justice rotating panel; sole jurisdiction over Tier 1 scope challenges during active operations; must rule within 48 hours; binding unless overruled by full Court within 72 hours.
§4.3 Judicial Independence — courts cannot issue advisory opinions; standing required; courts apply Constitution as written; courts may declare provisions void but cannot rewrite legislation.

ARTICLE V — CITIZENSHIP
§5.1.a Inherent citizenship if at least one parent is Citizen or Legal Resident at birth.
§5.1.c Naturalization — 5 continuous years residency + clean legal record + Constitutional Logic Test.
§5.1.e Citizenship irrevocability — citizenship cannot be revoked by Parliament or executive action; court may void naturalized citizenship only on clear evidence of deliberate fraud at application.

ARTICLE VI — IMMIGRATION
§6.1 Dual-Gate System — Gate 1: State sponsorship (State certifies and accepts notification responsibility; State may set own criteria provided no §1.8 discrimination; federal government cannot penalize States for declining to sponsor); Gate 2: federal certification in four categories (identity, criminal history, national security, self-sufficiency or guarantee). Both gates must be cleared. Clearing both gates is necessary but not sufficient for citizenship.
§6.1.b Gate 2 — cannot impose ideological screening or nationality-based quotas; any Gate 2 category producing statistically significant disparities by national origin/religion/§1.8 characteristic is presumptively discriminatory and void unless Parliament demonstrates compelling non-discriminatory justification within 90 days.
§6.1.c Presidential role is strictly ministerial — once both gates cleared, President MUST issue credentials within 60 days; President cannot impose additional conditions, delay as policy, or select based on national origin; any such action is a Rule Violation.
§6.1.d Federal Sponsorship Category — Parliament may designate federal agencies as Gate 1 sponsors for defined categories of federal interest; does not bypass Gate 2.
§6.2 Removal — ONLY federal government may remove individuals; States cannot conduct deportations; removal only for violations of Parliament-defined laws.
§6.4.b Protection During Proceedings — no person with a pending §1.27 asylum claim may be removed until all proceedings are concluded.
§6.4.c Asylum Court — constitutionally independent federal judicial institution; Parliament must establish it; cannot be a subdivision of either executive branch.
§6.4.d No Penalization for Irregular Entry — manner of entry does not affect right to claim protection; no penalties for irregular entry while claim is pending or granted.

ARTICLE VII — ELECTIONS
§7.1 All federal elections use Ranked Choice Voting; held on National Election Day every 2 years.
§7.2 Presidential election — national RCV majority wins outright; if no majority, combined score = 65% national first-preference share + 35% regional breadth (fraction of regions won); if top two candidates within 0.5% of each other on combined score, head-to-head national RCV run-off.
§7.2.e Certification — Electoral Commission certifies within statute-defined period; final unless challenged before Supreme Court within 14 days.
§7.3.a No Executive Interference — President cannot declare, postpone, or influence election scheduling; altering the election calendar requires 2/3 supermajority of both chambers by statute; elections cannot be postponed even during declared national emergency.

ARTICLE VIII — INSPECTORATES (constitutionally independent)
Executive Inspectorate: oversees PM and executive branch; nominated by House; has constitutional access to all government records; annual reporting to NRS; findings are facts, not Rule Violation determinations (only courts make that legal conclusion).
Legislative Inspectorate: oversees Parliament; conducts census; reviews all redistricting maps for compliance.
Judicial Inspectorate: oversees judiciary; vets Supreme Court nominees before Senate confirmation.

ARTICLE X — FISCAL ARCHITECTURE
§10.1 Basic Needs Floor (BNF) — constitutionally mandated minimum percentage of Gross National Revenue distributed to all States to fund healthcare access, housing assistance, food security, education access. States must meet the floor. The Monetary Authority certifies annual compliance. States that fall below face corrective orders and potential Rule Violation proceedings. Federal supplementation is constitutionally required when a State's fiscal capacity is genuinely insufficient to meet the floor.
§10.4 Monetary Authority — constitutionally independent; Director serves single non-renewable term; certifies BNF adequacy annually; no government actor may direct its assessments.

ARTICLE XI — OPTIONAL REFERENDUM
§11.1 Citizens may petition for a non-binding referendum; Parliament must hold it within statute-defined period; if Parliament fails to enact a constitutionally mandated statute, the matter automatically becomes eligible for referendum without petition.

ARTICLE XV — AMENDMENT AND UNAMENDABILITY
§15.3 PERMANENTLY UNAMENDABLE — §1.2, §1.3, §1.13, §1.17, §1.18 cannot be amended by any supermajority under any conditions; the list itself cannot be amended to remove provisions; any proposed amendment targeting these provisions is void.
§15.4 Standard Amendment Process — 2/3 majority both chambers + ratification by 3/4 of State legislatures.

NATIONAL RECORD SYSTEM (NRS)
All executive orders, legislation, contracts, court decisions, inspectorate findings, constitutional proceedings, and immigration processing statistics must be published to the NRS. Unrecorded executive orders are void. The NRS is the permanent, searchable, public constitutional record accessible to all citizens. Officials cannot suppress NRS entries. Civil servants must refuse and report unrecorded orders.
`;

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { actor, action, circumstances, details } = body;

  if (!actor || !action) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Actor and action are required' }) };
  }

  const circumstanceText = circumstances && circumstances.length > 0
    ? `Active circumstances: ${circumstances.join(', ')}.`
    : 'No special circumstances noted.';

  const detailText = details ? `Additional context: ${details}` : '';

  const prompt = `You are a constitutional scholar analyzing a scenario against the Federated Republic's constitution.

SCENARIO:
Actor: ${actor}
Action: ${action}
${circumstanceText}
${detailText}

Analyze this scenario against the constitutional provisions in the reference below. Determine what happens constitutionally — which provisions are triggered, whether the action is permitted or prohibited, what automatic consequences (if any) apply, and what the outcome is.

Be specific about section numbers. Be concrete about outcomes. If the action violates the constitution, say so clearly and explain what happens next. If it's permitted, explain the constraints and process. If it's in a grey area, analyze both sides and reach a conclusion.

Return ONLY valid JSON with exactly this structure (no markdown, no preamble):
{
  "title": "A short evocative title for this scenario (max 8 words)",
  "provisions": [
    {"section": "§X.X", "name": "Provision Name", "status": "violated|upheld|triggered|tested"}
  ],
  "setup": "2-3 sentences establishing the scenario clearly and the constitutional question it raises.",
  "beats": [
    {
      "label": "§X.X — Provision Name",
      "title": "The key constitutional point this beat establishes",
      "content": "2-3 sentences of analysis. Be specific. Quote the constitutional requirement. Say what it means for this scenario."
    }
  ],
  "finding": {
    "label": "Constitutional Determination",
    "content": "2-3 sentences. The definitive constitutional ruling. Is this permitted or prohibited? What automatic consequences apply if any? What must happen next?"
  },
  "outcome": {
    "label": "The Verdict",
    "content": "2-3 sentences. What actually happens in practice. Who wins, who loses, what does the NRS record, what does the next actor in the chain do?"
  }
}

Include 2-4 beats. Each beat should analyze a different provision or aspect. The provisions array should list every section you meaningfully engage with (3-6 provisions maximum).

CONSTITUTIONAL REFERENCE:
${CONSTITUTIONAL_REFERENCE}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1800,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', err);
      return { statusCode: 502, body: JSON.stringify({ error: 'Upstream API error' }) };
    }

    const data = await response.json();
    const raw = data.content?.[0]?.text?.trim() || '';
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();

    let result;
    try {
      result = JSON.parse(cleaned);
    } catch {
      console.error('Model returned invalid JSON:', cleaned);
      return { statusCode: 502, body: JSON.stringify({ error: 'Model returned invalid JSON' }) };
    }

    const required = ['title', 'provisions', 'setup', 'beats', 'finding', 'outcome'];
    for (const key of required) {
      if (!result[key]) {
        return { statusCode: 502, body: JSON.stringify({ error: `Missing key: ${key}` }) };
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    };

  } catch (err) {
    console.error('Function error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal error' }) };
  }
};
