// Netlify serverless function — analyzes a scenario against the Federated Republic constitution
// Environment variable required: ANTHROPIC_API_KEY

const REF = `FEDERATED REPUBLIC CONSTITUTION v118 — KEY PROVISIONS

ARTICLE I RIGHTS (all Inhabitants regardless of citizenship)
§1.2 No torture — PERMANENTLY UNAMENDABLE, no emergency derogation
§1.3 No slavery — PERMANENTLY UNAMENDABLE
§1.8 Equality — racial/religious/sex discrimination presumptively void
§1.9 Bodily autonomy; cryptographic keys are private property
§1.10 Home inviolable; warrants required; general warrants prohibited
§1.11 Right to bear arms; States may license but not effectively prohibit
§1.13 Arbitrary detention — PERMANENTLY UNAMENDABLE; arrested person before judge within 24hrs; habeas corpus ruled within 48hrs; no emergency may suspend
§1.17 Public trial — PERMANENTLY UNAMENDABLE
§1.18 No retroactive laws — PERMANENTLY UNAMENDABLE
§1.19 Right to vote; no action may make voting more difficult for any class of eligible citizens
§1.25 Emergency derogation: requires JOINT President+PM declaration; 2/3 both chambers within 7 days or lapses; max 90 days per period; §1.2/1.3/1.13/1.17/1.18 cannot be derogated; NO emergency may postpone/cancel any election — any such order is automatically void; Inspectorates continue operating
§1.27 Non-refoulement: no removal to territory where person faces persecution/torture/death; cannot be suspended; applies regardless of immigration status or mode of entry

ARTICLE II DUAL EXECUTIVE
President domain: military, foreign affairs, intelligence, border security. Single non-renewable 6-year term.
PM domain: domestic affairs, budget, civil service, NRS. Max 8 consecutive years. Serves at House confidence.

§2.1 Military tiers: Tier 1=immediate defensive response (no prior auth, expires when threat neutralized, notify within 12hrs); Tier 2=Senate Armed Services Committee within 96hrs (covers 30 days); Tier 3=Parliamentary Declaration 2/3 both chambers (beyond 30 days)
§2.1.e Privacy Firewall: domestic surveillance of citizens = automatic Rule Violation for President and Intelligence Director; immediate suspension + Senate trial within 72hrs
§2.1.f Presidential veto: only on legislation in President's domain; Supreme Court reviews within 48hrs; out-of-scope veto = void + Rule Violation; 3 void vetoes in 180 days = veto power suspended; cannot veto bills cutting military funding
§2.1.g Presidential clemency: only military/national security/foreign affairs offenses; forbidden for Rule Violations, self-clemency, offenses where President was participant
§2.2.a All PM orders must be on NRS within 24hrs or void; civil servants must refuse unrecorded orders
§2.2.c PM max 8 consecutive years
§2.2.d Directing civil service by political affiliation = Rule Violation
§2.2.e PM domestic emergency: requires parliamentary ratification by simple majority within 30 days or lapses; cannot suspend any Article I right
§2.3.a PM selected by absolute majority of full House membership; failure within 60 days = House dissolution
§2.3.b Constructive vote: House can ONLY remove PM by simultaneously electing a named successor by absolute majority; no-confidence without named replacement = void
§2.3.d Post-dissolution bar: party that held majority when dissolution triggered cannot field candidates in emergency election
§2.6.a Presidential succession: Senate Speaker → Deputy Speaker → most senior Armed Services member; special election within 180 days
§2.7 Rule Violation — Supreme Court finding triggers AUTOMATICALLY: immediate suspension, access revocation, Senate trial. No vote required. Cannot be stayed.
§2.7.a Former official lookback: finding applies regardless of whether person still in office; triggers permanent bar from federal office + pension forfeiture; applies to conduct within 5 years before finding
§2.7.b Military deferral: if President subject to finding and Tier 1/2/3 operations active, suspension deferred until operations conclude OR Armed Services certifies personal command not needed; max 30-day deferral; does NOT apply if violation concerns those military operations
§2.7.c Minor violations: corrective order track (not suspension) if procedural, no deliberate circumvention, no material prejudice, first violation in current service; prompt self-correction weighs toward minor; pattern of minor violations may be reclassified as major
§2.7.d Corrective orders: max 30-day compliance period; failure converts to major violation automatically

ARTICLE III PARLIAMENT
§3.1.c Single-subject rule: unrelated riders nullify entire act
§3.2.c Senate must act on every House bill within statute-defined period or bill is Deemed Approved
§3.2.d Judicial confirmation: 55-67% Senate supermajority; failure to vote = Deemed Confirmed
§3.2.e Treaty ratification: 2/3 Senate; must include specific triggering threshold or cannot be ratified
§3.5 Impeachment: House by simple majority of full membership; Senate trial requires 2/3 of full Senate; House passage does NOT suspend official (only §2.7 does); two tracks are independent

ARTICLE IV JUDICIARY
§4.2 Supreme Court: 9 justices, single non-renewable 12-year terms, elected by national direct vote; Triad nomination (House + PM + President each nominate one per vacancy); Senate eligibility confirmation then public election
§4.2.d Emergency Panel: 4-justice rotating panel; sole jurisdiction over Tier 1 scope challenges during active operations; rules within 48hrs
§4.3 No advisory opinions; standing required; courts apply Constitution as written; can declare provisions void but cannot rewrite legislation

ARTICLE V CITIZENSHIP
§5.1.a Inherent citizenship if one parent is Citizen or Legal Resident at birth
§5.1.c Naturalization: 5 years residency + clean record + Constitutional Logic Test
§5.1.e Citizenship irrevocable; cannot be revoked by Parliament or executive

ARTICLE VI IMMIGRATION
§6.1 Dual-gate: Gate 1=State sponsorship (State sets own criteria, no §1.8 discrimination); Gate 2=federal certification (identity, criminal, national security, self-sufficiency). Both required.
§6.1.b Gate 2 statistical disparities by national origin = presumptively discriminatory and void
§6.1.c Presidential role is strictly ministerial: must issue credentials within 60 days once both gates clear; cannot add conditions or delay; any such action = Rule Violation
§6.2 ONLY federal government may remove individuals; States cannot deport
§6.4.b No removal while §1.27 asylum claim pending; irregular entry does not affect right to claim

ARTICLE VII ELECTIONS
§7.1 All federal elections use Ranked Choice Voting on National Election Day
§7.2 Presidential: national RCV majority wins; if no majority, combined score (65% national vote + 35% regional breadth); run-off if top two within 0.5%
§7.3.a President cannot postpone elections; changing election calendar requires 2/3 supermajority both chambers; elections continue during any declared emergency

ARTICLE VIII INSPECTORATES (constitutionally independent)
Executive Inspectorate: oversees PM and executive; has access to all government records; findings are facts, not Rule Violation determinations (only courts make that conclusion)
Legislative Inspectorate: oversees Parliament; conducts census; reviews redistricting maps
Judicial Inspectorate: oversees judiciary; vets Supreme Court nominees

ARTICLE X FISCAL
§10.1 Basic Needs Floor (BNF): constitutionally mandated minimum % of GNR to States for healthcare, housing, food, education; States must meet floor; MA certifies compliance; federal supplementation required if State fiscally unable
§10.4 Monetary Authority: constitutionally independent; Director single non-renewable term

ARTICLE XV AMENDMENT
§15.3 PERMANENTLY UNAMENDABLE: §1.2, §1.3, §1.13, §1.17, §1.18; list itself cannot be amended to remove provisions; any proposed amendment targeting these is void
§15.4 Standard amendment: 2/3 both chambers + 3/4 State legislatures

NRS (National Record System): all executive orders, legislation, court decisions, inspectorate findings must be published; unrecorded executive orders are void`;

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
    return { statusCode: 400, body: JSON.stringify({ error: 'Actor and action required' }) };
  }

  const circumstanceText = circumstances && circumstances.length > 0
    ? `Circumstances: ${circumstances.join(', ')}.` : '';
  const detailText = details ? `Additional context: ${details}` : '';

  const prompt = `Analyze this scenario against the Federated Republic's constitution.

Actor: ${actor}
Action: ${action}
${circumstanceText}
${detailText}

Determine what happens constitutionally. Be specific about section numbers. Say clearly whether the action is permitted or prohibited and what happens next.

Return ONLY valid JSON, no markdown fences:
{
  "title": "Short evocative title (max 8 words)",
  "provisions": [{"section": "§X.X", "name": "Provision Name", "status": "violated|upheld|triggered|tested"}],
  "setup": "2-3 sentences establishing the scenario and constitutional question.",
  "beats": [{"label": "§X.X — Provision Name", "title": "Key constitutional point", "content": "2-3 sentences of specific analysis."}],
  "finding": {"label": "Constitutional Determination", "content": "2-3 sentences. Is this permitted or prohibited? What automatic consequences apply?"},
  "outcome": {"label": "The Verdict", "content": "2-3 sentences. What actually happens. Who wins, what does the NRS record."}
}

Include 2-4 beats. List 3-6 provisions.

CONSTITUTIONAL REFERENCE:
${REF}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
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
      console.error('Invalid JSON from model:', cleaned);
      return { statusCode: 502, body: JSON.stringify({ error: 'Model returned invalid JSON' }) };
    }

    for (const key of ['title','provisions','setup','beats','finding','outcome']) {
      if (!result[key]) return { statusCode: 502, body: JSON.stringify({ error: `Missing key: ${key}` }) };
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
