#!/usr/bin/env python3
"""Run one frozen follow-on batch through Batch 12's reviewed safety gates."""
import argparse
import importlib.util
import json
from pathlib import Path
import re

ROOT=Path(__file__).resolve().parent.parent

def load_batch(path,number,repository):
    manifest=json.loads(path.read_text())
    if manifest["repository"]!=repository:
        raise SystemExit("Manifest repository does not match GITHUB_REPOSITORY")
    batches=[batch for batch in manifest["batches"] if batch["number"]==number]
    if len(batches)!=1:
        raise SystemExit("Select exactly one reviewed batch")
    rows=batches[0]["branches"]
    if not 1<=len(rows)<=20:
        raise SystemExit("A reviewed batch must contain 1-20 refs")
    candidates={row["name"]:row["sha"] for row in rows}
    if len(candidates)!=len(rows) or any(not re.fullmatch(r"[0-9a-f]{40}",sha) for sha in candidates.values()):
        raise SystemExit("Invalid or duplicate frozen branch entry")
    return candidates

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--batch",type=int,required=True)
    parser.add_argument("--manifest",type=Path,default=ROOT/"docs/archive/development/BRANCH-CLEANUP-20261018.json")
    args=parser.parse_args()
    spec=importlib.util.spec_from_file_location("reviewed_batch12",ROOT/"scripts/reviewed-branch-cleanup-batch-12.py")
    cleanup=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(cleanup)
    cleanup.CANDIDATES=load_batch(args.manifest,args.batch,cleanup.REPO)
    cleanup.main(f"DELETE-BATCH-{args.batch}")

if __name__=="__main__": main()
