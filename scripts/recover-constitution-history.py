#!/usr/bin/env python3
"""Backfill authentic historical Constitution blobs, separating verified editions from exceptions.

Never manufacture a Markdown edition and never alter present constitutional text.
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
EXCEPTIONS = "docs/archive/constitution-exceptions"


def history():
    base = archive.commit(ROOT, BASELINE)
    refs = archive.git(ROOT, "rev-list", "--first-parent", "--reverse", base).decode().splitlines()
    selected = []
    for i, ref in enumerate(refs):
        dt = datetime.fromisoformat(archive.git(ROOT, "show", "-s", "--format=%cI", ref).decode().strip())
        if dt < START or i == 0:
            continue
        previous = refs[i - 1]
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
        # Verification of each archival candidate is independent of the *new* revision:
        # a bad incoming edition must not prevent preserving a good superseded one.
        try:
            old = archive.pair(ROOT, before)
            entry["previous_json_sha256"] = archive.digest(old[0])
            entry["previous_markdown_sha256"] = archive.digest(old[1])
            archive.validate_pair(ROOT, old, before)
            entry["verified_pair"] = True
        except (ValueError, OSError, KeyError, SyntaxError, TypeError) as exc:
            entry["error"] = f"{type(exc).__name__}: {exc}"
        report.append(entry)
    return report


def immutable_write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        if path.read_bytes() != data:
            raise ValueError(f"Historical source collision: {path}")
        return False
    with path.open("xb") as stream:
        stream.write(data)
    return True


def preserve_exceptions(entries):
    # Save exact historical blobs, even if old renderer cannot be executed or differs.
    # These are forensic source materials, never certified Constitution editions.
    for entry in entries:
        ref = entry["previous_commit"]
        stem = f"source-{ref}"
        raw = archive.pair(ROOT, ref)
        directory = archive.safe_path(ROOT, EXCEPTIONS)
        note = {**entry, "status": "unverified_historical_source",
                "source_paths": [archive.JSON_PATH, archive.MD_PATH]}
        immutable_write(directory / (stem + ".json"), raw[0])
        immutable_write(directory / (stem + ".md"), raw[1])
        immutable_write(directory / (stem + ".provenance.json"),
                        (json.dumps(note, indent=2) + "\n").encode())


def apply(entries):
    # Preflight content and paths before writing anything.
    verified = [r for r in entries if r["verified_pair"]]
    exceptions = [r for r in entries if not r["verified_pair"]]
    for entry in verified:
        archive.validate_pair(ROOT, archive.pair(ROOT, entry["previous_commit"]),
                              entry["previous_commit"])
    for entry in exceptions:
        archive.pair(ROOT, entry["previous_commit"])
    with archive.locked(ROOT):
        archive.verify_records(archive.validate_inventory(archive.inventory(ROOT)))
        for entry in verified:
            ref = entry["previous_commit"]
            contents = archive.pair(ROOT, ref)
            plan = archive.plan_pair(ROOT, contents, entry["superseded_utc"], ref)
            archive.write_pair(ROOT, contents, plan)
        preserve_exceptions(exceptions)
        archive.verify_records(archive.validate_inventory(archive.inventory(ROOT)))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="preserve verified pairs and raw exceptions")
    args = parser.parse_args()
    entries = audit()
    n = sum(e["verified_pair"] for e in entries)
    report = {"total_transitions": len(entries), "verified_transitions": n,
              "exceptions": len(entries) - n, "entries": entries}
    print(json.dumps(report, indent=2))
    if args.apply:
        apply(entries)
        print(f"Recovered {n} verified transitions and {len(entries)-n} exception source records.",
              file=sys.stderr)


if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError, KeyError, TypeError) as exc:
        print(f"Historical Constitution recovery stopped: {exc}", file=sys.stderr)
        sys.exit(1)
