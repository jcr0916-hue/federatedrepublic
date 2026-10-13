#!/usr/bin/env python3
"""Audit and (when explicitly requested) backfill historical Constitution editions.

Read from the first-parent history of main, rather than proposal/feature branches.
Never synthesize missing historical Markdown.
"""
import argparse
from datetime import datetime, timezone
import importlib.util
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("archive", ROOT / "scripts/constitution-archive.py")
archive = importlib.util.module_from_spec(spec)
spec.loader.exec_module(archive)
START = datetime(2026, 9, 18, tzinfo=timezone.utc)
BASELINE = "9ee6104ef1ed89291874d6b8963128d501afb816"


def history():
    # Exclude the post-installation archive policy: backfill only the gap.
    base = archive.commit(ROOT, BASELINE)
    refs = archive.git(ROOT, "rev-list", "--first-parent", "--reverse", base).decode().splitlines()
    selected = []
    for i, ref in enumerate(refs):
        dt = datetime.fromisoformat(archive.git(ROOT, "show", "-s", "--format=%cI", ref).decode().strip())
        if dt < START:
            continue
        if i == 0:
            continue
        previous = refs[i-1]
        changed = archive.git(ROOT, "diff", "--name-only", previous, ref, "--",
                              archive.JSON_PATH, archive.MD_PATH).decode().strip()
        if changed:
            selected.append((previous, ref, dt))
    return selected


def audit():
    report = []
    for before, after, when in history():
        entry = {"previous_commit": before, "superseding_commit": after,
                 "superseded_utc": when.astimezone(timezone.utc).isoformat(),
                 "verified_pair": False}
        try:
            old = archive.pair(ROOT, before)
            archive.validate_pair(ROOT, old, before)
            new = archive.pair(ROOT, after)
            archive.validate_pair(ROOT, new, after)
            entry["verified_pair"] = True
            entry["previous_json_sha256"] = archive.digest(old[0])
            entry["previous_markdown_sha256"] = archive.digest(old[1])
        except (ValueError, OSError, KeyError, SyntaxError) as exc:
            entry["error"] = str(exc)
        report.append(entry)
    return report


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true",
                        help="write only fully verified historical pairs; abort if any exception")
    args = parser.parse_args()
    report = audit()
    failures = [r for r in report if not r["verified_pair"]]
    print(json.dumps({"total_transitions": len(report),
                      "verified_transitions": len(report)-len(failures),
                      "exceptions": len(failures), "entries": report}, indent=2))
    if not args.apply:
        return
    if failures:
        raise ValueError("Historical pair exceptions exist; no snapshots written. Resolve or document exceptions first.")
    with archive.locked(ROOT):
        archive.verify_records(archive.validate_inventory(archive.inventory(ROOT)))
        for entry in report:
            ref = entry["previous_commit"]
            contents = archive.pair(ROOT, ref)
            plan = archive.plan_pair(ROOT, contents, entry["superseded_utc"], ref)
            archive.write_pair(ROOT, contents, plan)
        archive.verify_records(archive.validate_inventory(archive.inventory(ROOT)))
    print("Verified snapshots recovered without changing the operative Constitution.")


if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError) as exc:
        print("Historical Constitution recovery stopped:", exc, file=sys.stderr)
        sys.exit(1)
