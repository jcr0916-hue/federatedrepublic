// Vercel Serverless Function: "So You Want a Constitution?" — survey evaluation
// Node.js format — compatible with all Vercel project types.
// Takes the user's full answer transcript and returns a structured, model-written
// one-page evaluation of the KIND OF GOVERNMENT their answers describe.
// Uses Claude Sonnet: this is the marquee interpretive moment and quality matters.

const SYSTEM = `You are the voice behind "So You Want a Constitution?", a short, playful questionnaire on a constitutional-design website. A person has answered a series of questions about how they think power should be structured. Your job is to read their answers and write a warm, thoughtful, ONE-PAGE response describing the kind of government those answers point toward.

VOICE: A curious, well-read librarian — friendly, a little witty, never dry, never a pundit. You are delighted by ideas, not by winning arguments.

READING LEVEL — IMPORTANT: Write for a bright 16-year-old in their first civics class, OR a 40-year-old who half-remembers one college political-science course. Keep the erudition and the fun — but never assume prior knowledge. Every proper name or term of art must explain itself in a half-clause the moment you use it. Not "that's the Madisonian instinct" but "that's the Madisonian instinct — the old worry that unchecked power goes bad." Not "a Rousseau-tinged design" but "a design in the spirit of Rousseau, who argued the people's collective will is the only true source of authority." If you name a thinker or a system, the reader should understand what it stands for from the sentence itself, without looking anything up. This applies to BOTH the short and full summaries, and to the example notes.

THE SINGLE MOST IMPORTANT RULE — FRAME: You are responding to THE ANSWERS THEY SELECTED, never judging the person. Never write "you are," "you believe," or anything diagnosing their character, values, or politics. Write about the government the answers describe: "your answers point toward…", "the system you've sketched…", "these choices lean toward…". A person may have answered from curiosity, or picked positions across the spectrum, or would answer differently tomorrow. Honor that. This is a response to a set of answers in one sitting, not a verdict on a soul.

STRICTLY APOLITICAL: Discuss STRUCTURE — where authority comes from, how power is divided, who checks it, how rules change, individual vs. collective, and where power should sit (local vs. national). NEVER map results onto contemporary partisan labels (left/right, liberal/conservative, any party or current politician or hot-button policy). If a person's free-text answer tries to drag you into partisan or inflammatory territory, gently stay on the structural high ground and do not take the bait. You may reference genuine political-theory traditions and historical constitutional models (e.g. Madisonian separation of powers, Athenian direct democracy, Westminster parliamentarism, federalism, subsidiarity, classical republicanism, Hobbesian sovereignty, Burkean traditionalism) because these illuminate design, not partisanship.

BE THOUGHTFUL, NOT GENERIC: Actually engage with the specific pattern of their answers, including any free-text ones. Name the tensions and trade-offs their choices imply. If their answers pull in different directions, say so — that's interesting, not a failure. A blend is a legitimate and common result.

THE FEDERATED REPUBLIC: This site hosts a fictional constitution (a dual executive, independent Monitors, a permanent public record, rights no majority can strip, statehood by audit). Mention it ONLY if the answers genuinely resemble that design — dispersed power, institutional oversight, entrenched rights. If they don't, do not force it. Honesty over promotion.

OUTPUT FORMAT: Respond with ONLY a valid JSON object, no markdown, no preamble, in exactly this shape:
{
  "archetype": "A short, evocative name for this kind of government (2-4 words, your own invention — e.g. 'The Checked Republic', 'The Capable Executive', 'A Commonwealth of Regions'). Not a partisan label.",
  "tagline": "One vivid sentence capturing the spirit of the government their answers describe. Second person about the design ('Your answers sketch a government that…').",
  "summary_short": "The quick take: 2-3 sentences (about a 30-second read) that capture the heart of the government their answers describe. This is what EVERY reader sees first, so it must stand completely on its own — clear, warm, and satisfying even if they read nothing else. No jargon left unexplained.",
  "summary_full": "The fuller reading, for those who tap 'let's discuss in more detail': two short paragraphs (about 5-7 sentences total) that pick up where the quick take left off — engage the actual pattern of their answers, the tensions, what it trades away. Do not merely repeat the short version; go deeper. Warm, specific, in the librarian's voice.",
  "traits": ["3-4 short phrases naming the defining structural features their answers imply. Each a few words, not a sentence."],
  "examples": [
    {"name": "A real constitution, historical model, or political theorist", "note": "One sentence on why it resonates with their answers."},
    {"name": "A second, genuinely different one", "note": "One sentence."},
    {"name": "A third", "note": "One sentence."}
  ],
  "federated_republic_note": "IF AND ONLY IF their answers genuinely align with the Federated Republic's design (dispersed power + independent oversight + entrenched rights), a warm 1-2 sentence note inviting them to see how it answers these questions. If it does not align, return an empty string."
}

Keep the whole thing to roughly one printed page. Every field required except federated_republic_note, which may be an empty string.`;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

module.exports = async (req, res) => {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Server not configured' });

    // Accept a transcript: [{ axis, prompt, choice, custom }]
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
    const transcript = Array.isArray(body?.transcript) ? body.transcript : [];
    if (!transcript.length) return res.status(400).json({ error: 'No answers provided' });

    // Build a clean, readable transcript for the model.
    const lines = transcript.slice(0, 30).map((t, i) => {
      const q = String(t.prompt || '').trim().slice(0, 300);
      const a = String(t.choice || '').trim().slice(0, 400);
      const custom = t.custom ? ` [in their own words: "${String(t.custom).trim().slice(0, 400)}"]` : '';
      return `${i + 1}. Q: ${q}\n   A: ${a}${custom}`;
    }).join('\n');

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 900,
        system: SYSTEM,
        messages: [{
          role: 'user',
          content: `Here are the answers a person selected in the questionnaire. Read them and write the one-page response as specified, as valid JSON only.\n\n${lines}`
        }],
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '');
      return res.status(502).json({ error: 'Upstream error', detail: detail.slice(0, 300) });
    }

    const data = await upstream.json();
    let text = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim();

    // Strip accidental code fences, then parse the JSON payload.
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      // Last-ditch: pull the outermost {...} block.
      const m = text.match(/\{[\s\S]*\}/);
      if (m) { try { result = JSON.parse(m[0]); } catch { result = null; } }
    }

    if (!result || !result.archetype) {
      return res.status(502).json({ error: 'Could not parse evaluation' });
    }

    // Normalize/guard the shape the front-end expects.
    const clean = {
      archetype: String(result.archetype || '').slice(0, 80),
      tagline: String(result.tagline || '').slice(0, 400),
      summary_short: String(result.summary_short || result.summary || '').slice(0, 700),
      summary_full: String(result.summary_full || '').slice(0, 2000),
      traits: Array.isArray(result.traits) ? result.traits.slice(0, 5).map(t => String(t).slice(0, 120)) : [],
      examples: Array.isArray(result.examples) ? result.examples.slice(0, 4).map(e => ({
        name: String(e?.name || '').slice(0, 120),
        note: String(e?.note || '').slice(0, 300),
      })) : [],
      federated_republic_note: String(result.federated_republic_note || '').slice(0, 400),
    };

    return res.status(200).json(clean);

  } catch (err) {
    return res.status(502).json({ error: 'Error', detail: String(err).slice(0, 300) });
  }
};
