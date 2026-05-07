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

KEY CONSTITUTIONAL RULES (v120):
- §1.25: Emergency needs JOINT President+PM declaration + 2/3 both chambers within 7 days. Max 90 days. Cannot suspend §1.2/1.3/1.13/1.17/1.18. CANNOT postpone elections — any order postponing an election is automatically void.
- §1.13 UNAMENDABLE: 24hr first appearance before judge; 48hr habeas corpus. No exceptions, no emergency derogation.
- §1.2/1.3/1.17/1.18 UNAMENDABLE: No torture, slavery, secret trials, retroactive laws.
- §2.1: President = military/foreign/intelligence only. Tier1=immediate defense(no auth, notify within 12hrs); Tier2=Senate Armed Services 96hrs; Tier3=Parliament 2/3.
- §2.1.e: Domestic surveillance of citizens = automatic Rule Violation → immediate suspension.
- §2.1.f: Presidential veto only within President's domain. Out-of-scope veto = Rule Violation. 3 void vetoes in 180 days = veto suspended.
- §2.2: PM = domestic only. Orders unrecorded on NRS within 24hrs = void.
- §2.2.c: PM max 8 consecutive years.
- §2.3.b: House removes PM ONLY by simultaneously electing named successor. No-confidence without replacement = void.
- §2.3.d: Party holding majority when House dissolves cannot field candidates in emergency election.
- §2.7: Supreme Court Rule Violation finding → automatic suspension, access revocation, Senate trial. No vote required.
- §2.7.b: Military deferral: if President found in violation during active Tier1/2/3, suspension deferred max 30 days.
- §2.7.e: Rule Violation against legislator = suspension from voting/committee + mandatory §3.6 expulsion referral within 30 days.
- §2.10.a: Presidential removal Path 1 — 2/3 full House to initiate + 2/3 full Senate to convict. Independent of §2.7.
- §2.10.b: Presidential removal Path 2 — simple Senate majority to refer to national recall referendum. Removal requires majority of eligible voters. One referral per presidential term.
- §3.1.c: Bills must cover single subject. Unrelated riders = entire act void.
- §3.2.e: Treaties need 2/3 Senate + defined triggering threshold.
- §3.2.h: Senate Speaker vacancy → Deputy Speaker assumes succession role immediately. Senate must elect new Speaker within 72 hours.
- §3.5: Applies ONLY to executive and judicial officers. Legislative members governed exclusively by §3.6.
- §3.6: House expelled by 2/3 full membership; Senate expelled by 2/3 full membership. Anti-weaponization: raises to 3/4 if vote within 30 days of a vote the member was publicly opposing.
- §4.1.b: Inferior court vacancy must be filled within 180 days. PM has 90 days to nominate; if fails, Supreme Court nominates from Qualified Jurist Registry.
- §4.1.c: Inferior court judges removed by three tracks: Rule Violation (§2.7), judicial initiation (2/3 SC petition + parliamentary supermajority), or political removal (2/3 House + 2/3 Senate, OR Senate referral to popular recall).
- §4.2: Supreme Court — 9 justices, single non-renewable 12-year terms, elected by national RCV. Triad nominators are Senate, PM, and President (not House) — all nominating from Qualified Jurist Registry. No Senate eligibility confirmation round — JI vetting is the sole filter.
- §4.2.b: Mid-term SC vacancy → President and PM nominate; Senate has 90 days to nominate third candidate; if Senate fails, public elects from two nominees.
- §6.1: Immigration needs State sponsorship (Gate1) + federal certification (Gate2). No nationality quotas.
- §6.2: Only federal government can deport. States cannot.
- §7.3.a: Elections cannot be postponed. Even during emergency. Any order postponing an election is automatically void.
- §8.1: Inspectorates publish facts and recommendations — no enforcement power, no binding orders. Nominating actors submit candidate disclosure records; Inspectorates review for accuracy and publish recommendation. Citizens who identify discrepancies petition their elected representative.
- §8.6.g: Any citizen who identifies a discrepancy in a published candidate disclosure record may petition their elected House member or Senator. No petition fee or threshold required.
- §10.1: BNF floor mandatory. States must meet it. Federal supplementation required if State can't.
- §10.4: Monetary Authority governed by elected Director + 5 Senate-confirmed board members. Director may veto board determinations; board may override by 4-of-5 vote. Neither veto nor override may be exercised under political direction.
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
