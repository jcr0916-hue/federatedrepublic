// Netlify serverless function — constitutional scenario analysis
// Environment variable required: ANTHROPIC_API_KEY

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const { actor, action, circumstances, details } = body;
  if (!actor || !action) return { statusCode: 400, body: JSON.stringify({ error: 'Actor and action required' }) };

  const ctx = [circumstances?.length ? circumstances.join(', ') : '', details || ''].filter(Boolean).join('. ');

  const prompt = `You are a constitutional scholar for the Federated Republic. Analyze this scenario and return ONLY valid JSON.

SCENARIO: ${actor} attempts to: ${action}${ctx ? `. Context: ${ctx}` : ''}

KEY CONSTITUTIONAL RULES (v129):
- §1.25: Emergency needs JOINT President+PM declaration + 2/3 both chambers within 7 days. Max 90 days. Cannot suspend §1.2/1.3/1.13/1.17/1.18. CANNOT postpone elections — any order postponing an election is automatically void.
- §1.13 UNAMENDABLE: 24hr first appearance before judge; 48hr habeas corpus. No exceptions, no emergency derogation.
- §1.2/1.3/1.17/1.18 UNAMENDABLE: No torture, slavery, secret trials, retroactive laws.
- §2.1: President = military/foreign/intelligence only. Tier1=immediate defense(no auth, notify BOTH chambers and PM within 12hrs); Tier2=Senate Armed Services 96hrs; Tier3=Legislature 2/3.
- §2.1.e: Domestic surveillance of citizens = automatic Rule Violation → immediate suspension.
- §2.1.f: Presidential veto only within President's domain. Out-of-scope veto = Rule Violation. 3 void vetoes in 180 days = veto suspended.
- §2.2: PM = domestic only. Orders unrecorded on NRS within 24hrs = void.
- §2.2.c: PM max 8 consecutive years.
- §2.3.b: House removes PM ONLY by simultaneously electing named successor. No-confidence without replacement = void.
- §2.3.d: Party holding majority when House dissolves cannot field candidates in emergency election.
- §2.7: Supreme Court Rule Violation finding → automatic suspension, access revocation, Senate trial. No vote required.
- §2.7.b: Military deferral: if President found in violation during active Tier1/2/3, suspension deferred max 30 days.
- §2.7.e: Rule Violation against legislator = suspension from voting/committee + mandatory §3.6 expulsion referral within 30 days.
- §2.10.a: Presidential removal Path 1 — 2/3 full House to initiate WITH a Statement of Grounds + 2/3 full Senate to convict. No Statement of Grounds = motion is constitutionally void. Senate trial under §3.5.c mechanics.
- §2.10.b: Presidential removal Path 2 — Senate simple majority refers to national recall referendum. Removal requires majority of ELIGIBLE voters (not just turnout). One referral per term. Senate Speaker assumes succession role during referendum.
- §2.10.c: One referral per presidential term. Failed referendum cannot be re-run within same term. Legislative removal track has no such bar.
- §2.1.h: Dual executive conflict during active military ops — President has 6 hours to file written objection to NRS; Emergency Panel (§4.2.e) rules within 24 hours; PM domestic orders remain operative pending ruling; failure to object within 6 hours waives the claim. The §4.2.e Emergency Panel has sole jurisdiction over Tier 1 scope challenges and §2.1.h conflict disputes during active operations.
- §2.2.g: Ministerial appointments: PM appoints/removes ministers within Domestic Affairs Council. All appointments published to NRS within 24hrs. Ministers exercise only PM-domain authority. Unrecorded ministerial orders are void.
- §3.2.h: Senate Speaker vacancy: Deputy Speaker assumes succession role immediately. Senate must elect new Speaker within 72 hours. If Senate cannot convene due to catastrophic event, Deputy Speaker continues until Senate convenes.
- §3.1.c: Bills must cover single subject. Unrelated riders = entire act void.
- §3.2.e: Treaty ratification requires 2/3 Senate vote. Mutual defense treaties must contain accurate Tier 1-3 authorization language and an explicit triggering threshold — treaty without defined threshold cannot be ratified.
- §3.2.e.i: Ratified treaties are DIRECTLY APPLICABLE as federal law in domestic courts from date of ratification, unless the treaty expressly requires implementing legislation or its provisions are too indefinite for direct judicial application. Legislature must pass implementation framework within 2 years of Phase 4 activation. Absent a legislature designation, courts apply treaties directly as federal law.
- §3.2.e.ii: Presidential treaty withdrawal requires NRS notice with minimum 6-month effective date and simultaneous diplomatic notification. Three tracks — General treaties: Senate may BLOCK by simple majority within 6 months; no vote = withdrawal proceeds automatically. Mutual defense treaties: Senate must AFFIRMATIVELY CONFIRM withdrawal by simple majority within 6 months; no confirmation = treaty remains in force; withdrawal cannot be initiated during active Tier 2 or Tier 3 operations under the treaty. Indigenous treaties: NO presidential withdrawal ever — Article XIV governs. All notices, votes, and withdrawal dates are permanent NRS entries.
- §3.5: Applies ONLY to executive and judicial officers. Legislative members governed exclusively by §3.6.
- §3.6: House expelled by 2/3 full membership; Senate expelled by 2/3 full membership. Anti-weaponization: raises to 3/4 if vote within 30 days of a vote the member was publicly opposing.
- §3.6.e: States and Territories may establish recall mechanisms for both Senators and House members. Federal government cannot restrict this.
- §3.6.f: Vacancy filling: States and Territories determine replacement process. Legislature sets maximum vacancy period — no seat may remain indefinitely unfilled. Supermajority thresholds calculated against full constitutional membership, not reduced seated membership.
- §4.1.b: Inferior court vacancy must be filled within 180 days from date of vacancy. PM has 90 days to nominate; if fails, Supreme Court nominates from Qualified Jurist Registry. Deemed Confirmed if House fails to vote within Legislature-defined period. Legislature-defined confirmation period cannot push total elapsed time past 180-day ceiling.
- §4.1.d: Inferior court judges serve during GOOD BEHAVIOR once commissioned — NOT time-limited. Legislature may define maximum service period by statute but minimum is 15 years. Fixed terms shorter than 15 years PROHIBITED.
- §4.1.c: Inferior court judges removed by THREE independent tracks: (1) Rule Violation under §2.7 — automatic; (2) Judicial initiation — 2/3 Supreme Court petition + legislative supermajority; (3) Political removal — 2/3 House + 2/3 Senate OR Senate referral to popular recall. §3.5 does NOT apply to inferior court judges.
- §4.2: Supreme Court — 9 justices, single non-renewable 12-year terms, elected by national RCV. Triad nominators are Senate, PM, and President (NOT the House) — each nominates ONE candidate from Qualified Jurist Registry. No Senate eligibility confirmation round — JI vetting of Registry records is the ONLY eligibility filter. All certified nominees go directly to public election. §4.2.e (formerly §4.2.d before v123 renumbering) is the Emergency Panel for Tier 1 scope challenges and §2.1.h dual-executive conflict disputes.
- §4.2 political removal: Supreme Court justices removed by same two paths as President: 2/3 House + 2/3 Senate (For-Cause only, JI verification required) OR Senate referral to popular recall. NOT by §3.5 impeachment alone.
- §4.2.b: Mid-term SC vacancy → President and PM nominate; Senate has 90 days to nominate third candidate; if Senate fails, public elects from two nominees.
- §5.4.b: CLT Administrator eligibility criteria are constitutionally defined: no government position in prior 5 years; no financial interest in testing/credentialing entities; demonstrated expertise in psychometrics, constitutional law, educational policy, or civic literacy research. Legislature may add requirements by statute but not reduce below this floor.
- §6.1: Immigration needs State sponsorship (Gate1) + federal certification (Gate2). No nationality quotas.
- §6.2: Only federal government can deport. States cannot.
- §7.3.a: Elections cannot be postponed. Even during emergency. Any order postponing an election is automatically void.
- §8.1: Inspectorates publish facts and recommendations — no enforcement power, no binding orders. Nominating actors submit candidate disclosure records; Inspectorates review for accuracy and publish recommendation. Citizens who identify discrepancies petition their elected representative (§8.6.g).
- §8.5.a For-Cause IG removal: requires 2/3 both chambers + State Designee Panel verification finding. IOC IS ELIMINATED — replaced by State Designee Panel (§8.9). Panel draws 5 members by lot from State/Territory designees each 2-year cycle. Binary finding (substantiated/unsubstantiated) published before legislative vote. Unsubstantiated finding does NOT block vote — it becomes permanent NRS record alongside vote. For-Cause removal vote at constitutional threshold is NOT a Rule Violation for political motivation where process is complete. The State Designee Panel (five State-appointed representatives drawn by lot at each two-year election cycle) must publish a binary finding — grounds substantiated or unsubstantiated — before the Legislature may vote. Legislature MAY vote even if Panel finds grounds unsubstantiated, but the finding is on the NRS permanently.
- §8.5.b No-Cause IG removal: 3/4 both chambers + 90-day delay. No State Designee Panel verification required for No-Cause. Judicial IG has no No-Cause removal track — For-Cause only.
- §8.6.g: Any citizen who identifies a discrepancy in a published candidate disclosure record may petition their elected House member or Senator. No petition fee or threshold required.
- §10.1: BNF floor mandatory. States must meet it. Federal supplementation required if State can't.
- §10.4: Monetary Authority governed by elected Director + 5 Senate-confirmed board members. Director may veto ANY board determination. Board may override Director veto by 4-of-5 vote. ALL vetoes and overrides published to NRS immediately. NEITHER veto NOR override may be exercised under political direction — doing so = Rule Violation.
- §10.4.d: Director who vetoes on METHODOLOGY grounds must file SC methodology challenge within 48 HOURS or veto lapses automatically. Board override proceeds regardless. Director removal protection runs from date challenge filed, not date of veto.
- §15.3: §1.2/1.3/1.13/1.17/1.18 permanently unamendable. Any amendment targeting them = void.
- NRS: All executive orders must be recorded within 24hrs or void. Civil servants must refuse and report unrecorded orders.

Return ONLY this JSON (no markdown, no extra text):
{
  "title": "6-word scenario title",
  "provisions": [{"section": "§X.X", "name": "Short Name", "status": "violated|upheld|triggered"}],
  "setup": "One sentence: what is happening and why it matters constitutionally.",
  "analysis": "Three sentences: which provisions apply, what they require, and whether this action meets or violates those requirements.",
  "finding": "Two sentences: the constitutional determination and what automatic consequences (if any) trigger.",
  "outcome": "One sentence: what actually happens next."
}

Max 3 provisions. Be direct and specific.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic error:', err);
      return { statusCode: 502, body: JSON.stringify({ error: `Anthropic ${response.status}: ${err.slice(0,300)}` }) };
    }

    const data = await response.json();
    const raw = (data.content?.[0]?.text || '').trim().replace(/^```json\s*/i,'').replace(/```\s*$/,'').trim();

    let result;
    try { result = JSON.parse(raw); }
    catch { return { statusCode: 502, body: JSON.stringify({ error: 'Invalid JSON from model', raw: raw.slice(0,200) }) }; }

    for (const k of ['title','provisions','setup','analysis','finding','outcome']) {
      if (!result[k]) return { statusCode: 502, body: JSON.stringify({ error: `Missing: ${k}` }) };
    }

    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(result) };

  } catch (err) {
    console.error('Function error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
