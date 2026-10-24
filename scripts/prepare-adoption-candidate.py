#!/usr/bin/env python3
"""Create and validate a review-only constitution JSON from the clean Markdown candidate.

Never modifies constitution_data.json or published artifacts.
Usage: python3 scripts/prepare-adoption-candidate.py
"""
import json
import re
import runpy
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "docs/adoption-candidate-constitution.md"
DEST = ROOT / "docs/adoption-candidate-data.json"
GENERATOR = ROOT / "scripts/build-constitution-md.py"
ARTICLE = re.compile(r"^## (Article [IVXLCDM]+ — [^\n]+)$", re.M)
SECTION = re.compile(r"^### (§\d+\.\d+(?:\.[a-z])?) — ([^\n]+)$", re.M)


def build():
    content = SOURCE.read_text(encoding="utf-8")
    arts = list(ARTICLE.finditer(content))
    assert len(arts) == 20, f"Expected 20 articles, found {len(arts)}"
    data = []
    for i, art in enumerate(arts):
        text = content[art.end():arts[i+1].start() if i+1 < len(arts) else len(content)]
        ms = list(SECTION.finditer(text))
        assert ms, f"No sections in {art.group(1)}"
        entries = []
        for j, match in enumerate(ms):
            body = text[match.end():ms[j+1].start() if j+1 < len(ms) else len(text)]
            body = re.sub(r"\n---\s*$", "", body).strip()
            assert body, match.group(1)
            entries.append({"num":match.group(1),"name":match.group(2),"text":body})
        data.append({"heading":art.group(1),"provisions":entries})
    assert sum(len(a["provisions"]) for a in data) == 177
    renderer = runpy.run_path(str(GENERATOR))["render"]
    rendered = renderer(data)
    def normalize(text):
        return "\n".join(line.rstrip() for line in text.strip().splitlines() if line.strip() and line.strip() != "---")
    assert normalize(rendered)[normalize(rendered).index("## Article I"):]==normalize(content)[normalize(content).index("## Article I"):], "Generated Markdown differs from approved candidate"
    DEST.write_text(json.dumps(data, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    print(f"Verified {len(data)} articles and 177 provisions; wrote {DEST}")


if __name__ == "__main__":
    build()
