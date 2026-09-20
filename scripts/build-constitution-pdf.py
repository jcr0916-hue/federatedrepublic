#!/usr/bin/env python3
"""Compatibility wrapper for the accessible Constitution PDF pipeline.

The old ReportLab generator produced an untagged PDF. The canonical PDF is now
rendered from semantic HTML through Chromium/Playwright so it can include a
structure tree and document outline.
"""
import subprocess
import sys

base = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8765"
raise SystemExit(subprocess.call(["node", "scripts/build-constitution-pdf.cjs", base]))
