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

KEY CONSTITUTIONAL RULES:
- §1.25: Emergency needs JOINT President+PM declaration + 2/3 both chambers within 7 days. Max 90 days. Cannot suspend §1.2/1.3/1.13/1.17/1.18. CANNOT postpone elections.
- §1.13 UNAMENDABLE: 24hr first appearance; 48hr habeas corpus. No exceptions.
- §1.2/1.3/1.17/1.18 UNAMENDABLE: No torture, slavery, secret trials, retroactive laws.
- §2.1: President = military/foreign/intelligence only. Tier1=immediate defense(no auth); Tier2=Senate Armed Services 96hrs; Tier3=Parliament 2/3.
- §2.1.e: Domestic surveillance of citizens = automatic Rule Violation → immediate suspension.
- §2.1.f: Presidential veto only within President's domain. Out-of-scope veto = Rule Violation. 3 void vetoes in 180 days = veto suspended.
- §2.2: PM = domestic only. Orders unrecorded on NRS within 24hrs = void.
- §2.2.c: PM max 8 consecutive years.
- §2.3.b: House removes PM ONLY by simultaneously electing named successor. No-confidence without replacement = void.
- §2.3.d: Party holding majority when House dissolves cannot field candidates in emergency election.
- §2.7: Supreme Court Rule Violation finding → automatic suspension, access revocation, Senate trial. No vote required.
- §2.7.b: Military deferral: if President found in violation during active Tier1/2/3, suspension deferred max 30 days.
- §3.1.c: Bills must cover single subject. Unrelated riders = entire act void.
- §3.2.e: Treaties need 2/3 Senate + defined triggering threshold.
- §4.2: Supreme Court justices elected by national vote. Single 12-year term.
- §6.1: Immigration needs State sponsorship (Gate1) + federal certification (Gate2). No nationality quotas.
- §6.2: Only federal government can deport. States cannot.
- §7.3.a: Elections cannot be postponed. Even during emergency.
- §10.1: BNF floor mandatory. States must meet it. Federal supplementation required if State can't.
- §15.3: §1.2/1.3/1.13/1.17/1.18 permanently unamendable. Any amendment targeting them = void.
- NRS: All executive orders must be recorded. Unrecorded orders are void.

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
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic error:', err);
      return { statusCode: 502, body: JSON.stringify({ error: `Anthropic: ${response.status}` }) };
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
