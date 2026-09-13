#!/usr/bin/env python3
from pathlib import Path


def must_replace(path, old, new):
    p = Path(path)
    s = p.read_text(encoding='utf-8')
    if old not in s:
        raise SystemExit(f'Missing expected text in {path}: {old[:80]}')
    p.write_text(s.replace(old, new), encoding='utf-8')

# Homepage feature label only; keep the existing description.
must_replace(
    'index.html',
    '&#8776; 12 minute read &nbsp;&middot;&nbsp; NRS &middot; Social State &middot; Asylum Court &middot; Monitors',
    '&#8776; 12 minute read &nbsp;&middot;&nbsp; NRS &middot; Social State &middot; Asylum Process &middot; Monitors'
)

# Ordinary Law: align Selin with the current independent adjudicative-process architecture.
must_replace(
    'scenario-ordinary.html',
    'PENDING &#8212; ASYLUM COURT HEARING DATE TO BE ASSIGNED<br>',
    'PENDING &#8212; ASYLUM ADJUDICATION DATE TO BE ASSIGNED<br>'
)
must_replace(
    'scenario-ordinary.html',
    'While her claim was pending before the statutory Asylum Court &#8212; a federal judicial body, the officer had been careful to say, independent of the Legat Consul, independent of the Civic Consul, not like immigration tribunals she had read about in other countries &#8212; she could not be removed. A judge with constitutional tenure protections would hear her case. After the decision, she could appeal. Throughout the process: protection active.',
    'While her claim was pending in the independent federal asylum adjudicative process established by law &#8212; institutionally separate from immigration enforcement, removal, foreign affairs, and national-security operations &#8212; she could not be removed. An independent adjudicator would hear her claim under the statutory process, with judicial review remaining available afterward. Throughout the process: protection active.'
)
must_replace(
    'scenario-ordinary.html',
    'ASYLUM COURT HEARING DATE ASSIGNED &#8212; 44 DAYS<br>',
    'ASYLUM ADJUDICATION DATE ASSIGNED &#8212; 44 DAYS<br>'
)
# Legacy Monitor abbreviations.
must_replace(
    'scenario-ordinary.html',
    'the EI&#8217;s summary against the Minister&#8217;s testimony',
    'the EM&#8217;s summary against the Minister&#8217;s testimony'
)
must_replace(
    'scenario-ordinary.html',
    'the LI&#8217;s audit finding for Carston State;',
    'the LM&#8217;s audit finding for Carston State;'
)

print('Ordinary Law and homepage feature aligned with current asylum/Monitor terminology.')
