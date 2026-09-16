from pathlib import Path
import json, string

root = Path('.')

# Archive the exact current generated Constitution before correcting cross-references.
src = root / 'docs/constitution-current.md'
archive_dir = root / 'docs/archive/constitution'
archive_dir.mkdir(parents=True, exist_ok=True)
base = archive_dir / 'Constitution-260915-a.md'
if base.exists():
    for suffix in string.ascii_lowercase[1:]:
        candidate = archive_dir / f'Constitution-260915-{suffix}.md'
        if not candidate.exists():
            base = candidate
            break
base.write_bytes(src.read_bytes())
print('Archived current Constitution to', base)

p = root / 'constitution_data.json'
data = json.loads(p.read_text(encoding='utf-8'))
repls = {
    'may decline under §2.16(4). The conduct of acting service is governed by §2.16(6). Acting status ends when the Civic Consul\'s incapacity ends under §2.16(3)':
    'may decline under §2.16(7). The conduct of acting service is governed by §2.16(9). Acting status ends when the Civic Consul\'s incapacity ends under §2.16',
    'may decline under §2.16(4). The conduct of acting service is governed by §2.16(6). Acting authority ends when the Legat Consul\'s incapacity ends under §2.16(3)':
    'may decline under §2.16(7). The conduct of acting service is governed by §2.16(9). Acting authority ends when the Legat Consul\'s incapacity ends under §2.16',
}
counts = {k: 0 for k in repls}
for article in data:
    for provision in article.get('provisions', []):
        text = provision.get('text', '')
        for old, new in repls.items():
            if old in text:
                text = text.replace(old, new)
                counts[old] += 1
        provision['text'] = text
if sorted(counts.values()) != [1, 1]:
    raise RuntimeError(f'Unexpected constitutional cross-reference replacement counts: {counts}')
p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

# Glossary: the acting-office entry should not point to only one restoration subsection.
p = root / 'glossary.html'
s = p.read_text(encoding='utf-8')
s2 = s.replace('Acting status ends when the incapacity ends under §2.16(3)', 'Acting status ends when the incapacity ends under §2.16')
if s2 == s:
    print('Glossary phrase already current or absent')
else:
    p.write_text(s2, encoding='utf-8')

# Scenario: the compressed rule no longer constitutionally requires transmission to named officers.
p = root / 'scenario-the-twenty-four-hours.html'
s = p.read_text(encoding='utf-8')
old = '''        TRANSMITTED TO: Speaker of the Assembly; Speaker of the Senate; the Legat Consul;<br>\n        the officer then holding acting authority.<br>\n        <br>\n'''
if old not in s:
    raise RuntimeError('Scenario transmission block not found')
p.write_text(s.replace(old, ''), encoding='utf-8')
