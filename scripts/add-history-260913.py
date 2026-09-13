#!/usr/bin/env python3
from pathlib import Path

p = Path('constitutional-history.html')
s = p.read_text(encoding='utf-8')
marker = '''  <div style="margin:1.5rem 0 2rem;padding:1rem 1.25rem;background:var(--cream2);border:1px solid var(--border);border-radius:4px;font-family:'Jost',sans-serif;font-size:.9rem;color:var(--muted)">
    Showing the most recent changes. The complete record of all constitutional changes is in the <a href="constitutional-history-archive.html">full history archive</a>.
  </div>
'''
if marker not in s:
    raise SystemExit('History insertion marker not found')
entry = '''

  <article class="hist-entry">
    <div class="hist-tag">Session 260913 &middot; Constitutional</div>
    <h2 class="hist-title">Articles I&ndash;XX &mdash; Structural Consolidation and Consistency Review</h2>
    <div class="hist-body"><p>A comprehensive structural review consolidated recurring constitutional rules, removed duplication, repaired cross-references, and standardized terminology and fallback procedures across the document. General rules governing federal office &mdash; including removal, continuity and acting service, official-capacity protection, branch separation, electoral mandates, ethics, recusal, post-service restrictions, compensation, and authority arising by constitutional operation &mdash; were consolidated principally in Article VII rather than repeated within individual institutions.</p><p>The review also aligned provisions governing the Monitors, constitutional appointment pools, publication to the NRS, independent institutions, the Monetary Authority, the National Trust, transition machinery, and related constitutional processes. Obsolete institutional references and provisions made redundant by the consolidated framework were removed. Most changes were organizational or clarifying rather than changes to the allocation of constitutional power: existing institutional relationships, democratic fallbacks, independence protections, and core governing processes were generally preserved.</p><p>A limited number of substantive refinements were made where the review identified genuine operational issues, including the Territory-to-State Statehood pathway, certain Monitor incapacity and bad-faith procedures, clemency review, electoral-district safeguards, and several continuity and fallback mechanisms. The Statehood pathway was subsequently aligned with the same durability principle used in State remediation: a Territory must now obtain two successful Statehood Audits within the constitutional timetable before Statehood takes effect automatically by constitutional operation.</p><p>The result is a shorter and more internally consistent constitutional structure without a general redesign of the Republic's governmental system.</p></div>
  </article>
'''
if 'Session 260913 &middot; Constitutional' in s:
    raise SystemExit('260913 history entry already exists')
s = s.replace(marker, marker + entry, 1)
p.write_text(s, encoding='utf-8')
print('Added Session 260913 constitutional history entry.')
