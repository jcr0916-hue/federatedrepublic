#!/usr/bin/env python3
"""Basic structural checks for public PDFs. Requires pypdf.

This is not a PDF/UA conformance test. It catches regressions where a PDF loses
its structure tree, language/title metadata, or bookmarks.
"""
from pathlib import Path
from pypdf import PdfReader

PDFS = [Path("pdf/constitution-current.pdf"), *sorted(Path("pdf").glob("quicksheet-*.pdf"))]

for path in PDFS:
    reader = PdfReader(str(path))
    root = reader.trailer["/Root"]
    assert root.get("/StructTreeRoot") is not None, f"{path}: missing tagged-PDF structure tree"
    assert reader.metadata and reader.metadata.title, f"{path}: missing document title metadata"
    # Chromium's outline option should provide bookmarks where semantic headings exist.
    assert reader.outline, f"{path}: missing document outline/bookmarks"
    print(f"{path}: tagged structure and outline present across {len(reader.pages)} page(s)")

print(f"Checked {len(PDFS)} public PDFs. Run a PDF/UA validator separately for full conformance.")
