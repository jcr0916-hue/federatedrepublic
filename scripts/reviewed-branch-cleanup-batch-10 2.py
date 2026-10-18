#!/usr/bin/env python3
"""Preview or delete six Batch 10 reviewed refs, enforcing commit ancestry and SHA leases."""
import json, os, sys, urllib.parse, urllib.request, urllib.error
REPO=os.environ["GITHUB_REPOSITORY"]
TOKEN=os.environ["GITHUB_TOKEN"]
CANDIDATES={
  "maintenance/branch-cleanup-batch-09-20261014": "62ff4b9f8dcaa2a7648007fc55d3152094a17d46",
  "maintenance/branch-cleanup-batch-09-audit-20261014": "e181a80806dc69e1410e05264de4a96dad725707",
  "korda-decision-runway-and-doc-cleanup-2026-10-10": "b948073ac4f6862a1666739fdbb8abd7d2f59bc0",
  "navigator-deterministic-explicit-section": "5439648387e4d0bbfdcaa6670e1a82921fa1d67c",
  "content/torenthia-2026-09-28": "267114ec9b6e1ee49b82f7abb600b05f08024e44",
  "docs/torenthia-2026-09-28-publication": "62a05ef768fdbc23db93b9c890a30a93b9fca793"
}
PERMANENT={"main","archive/legacy-project-material"}
def api(path, method="GET"):
    request=urllib.request.Request("https://api.github.com/repos/"+REPO+"/"+path,method=method,headers={"Authorization":"Bearer "+TOKEN,"Accept":"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28"})
    with urllib.request.urlopen(request,timeout=30) as response:
        return json.loads(response.read() or b"{}")
def get_ref(branch, allow_missing=False):
    try:
        return api("git/ref/heads/"+urllib.parse.quote(branch,safe="/"))["object"]["sha"]
    except urllib.error.HTTPError as error:
        if allow_missing and error.code == 404:
            return None
        raise

def delete_ref(branch):
    try:
        api("git/refs/heads/"+urllib.parse.quote(branch,safe="/"), "DELETE")
        return True
    except urllib.error.HTTPError as error:
        if error.code == 404:
            return False
        raise
def ahead(base, branch):
    return api("compare/"+urllib.parse.quote(base,safe="")+"..."+urllib.parse.quote(branch,safe=""))["ahead_by"]
def main():
    mode=os.environ.get("CLEANUP_MODE","preview")
    if mode not in ("preview","DELETE-BATCH-10"): raise SystemExit("Unrecognized mode")
    assert not set(CANDIDATES)&PERMANENT
    if get_ref("archive/legacy-project-material")!= "0053ac4da09d32807d7f5b71ef0fff2075b421c1":
        raise SystemExit("Archive ref moved since audit; re-review before any deletions")
    prs=api("pulls?state=open&per_page=100")
    pending=[]
    already_absent=[]
    for name, expected in CANDIDATES.items():
        current=get_ref(name, allow_missing=True)
        if current is None:
            already_absent.append(name)
            print("ALREADY DELETED", name, flush=True)
            continue
        if current!=expected: raise SystemExit(f"STOP: {name} changed {current} != {expected}")
        if any(p.get("head",{}).get("ref")==name for p in prs):
            raise SystemExit(f"STOP: {name} is attached to an open PR")
        if ahead("main",name) and ahead("archive/legacy-project-material",name):
            raise SystemExit(f"STOP: {name} contains commits not reachable from either permanent branch")
        print("VERIFIED",name,current,flush=True)
        pending.append((name, expected))
    if mode=="preview":
        print("PREVIEW ONLY: no refs changed. Confirm external deployment dependencies before deletion.")
        return
    deleted=[]
    for name, expected in pending:
        current=get_ref(name, allow_missing=True)
        if current is None:
            already_absent.append(name)
            print("ALREADY DELETED", name, flush=True)
            continue
        if current!=expected: raise SystemExit(f"STOP: {name} moved during review")
        if delete_ref(name):
            deleted.append(name)
            print("DELETED", name, flush=True)
        else:
            already_absent.append(name)
            print("ALREADY DELETED", name, flush=True)
    print(f"COMPLETE: {len(deleted)} deleted; {len(already_absent)} already deleted; {len(CANDIDATES)} total reviewed.", flush=True)
if __name__=="__main__": main()
