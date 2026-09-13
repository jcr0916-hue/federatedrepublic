#!/usr/bin/env python3
from pathlib import Path
import re

replacement='<li><a href="scenario-the-audit.html">The Audit</a> — Year 3. A Territory completes its second successful Statehood Audit within the constitutional window. The first success kept it a Territory; the second makes Statehood automatic by constitutional operation.</li>'
pat=r'<li><a href="scenario-the-audit\.html">The Audit</a>\s*—.*?</li>'
old_phrase='A Territory passes the Statehood Audit, with clean findings from all three Monitors. No political vote required. The pathway is automatic. What happens next, in what order, and who can stop it.'
new_phrase='A Territory completes its second successful Statehood Audit within the constitutional window. The first success kept it a Territory; the second makes Statehood automatic by constitutional operation.'
for name in ('scenarios.html','scenarios-FINAL.html'):
    p=Path(name)
    s=p.read_text(encoding='utf-8')
    s2,n=re.subn(pat,replacement,s,count=1,flags=re.S)
    if n != 1:
        raise SystemExit(f'Expected one The Audit list entry in {name}, found {n}')
    s2=s2.replace(old_phrase,new_phrase)
    p.write_text(s2,encoding='utf-8')
print('Scenario index entries and duplicate summaries updated.')
