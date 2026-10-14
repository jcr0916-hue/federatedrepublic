#!/usr/bin/env python3
"""Preview or delete six Batch 09 reviewed refs, enforcing commit ancestry and SHA leases."""
import json, os, sys, urllib.parse, urllib.request, urllib.error
REPO=os.environ["GITHUB_REPOSITORY"]
TOKEN=os.environ["GITHUB_TOKEN"]
CANDIDATES={
  "fix/idempotent-reviewed-branch-cleanup-20261014": "36713d52da1a5185c651fe741b971b4655efed70",
  "maintenance/branch-cleanup-batch-08-20261014": "8be96c35ae4282fa39aa0ec78aec4ffa11337396",
  "korda-convention-resolution-and-vote-2026-10-10": "c9d4885d8801f5dfb1d074beab133532d574e637",
  "navigator-answer-judicial-selection": "1d3e734b0a2a5201e39b6a0c57220f14f5549bad",
  "navigator-deterministic-title-match": "02e9125d7b524cf5e33f21035b85d0b28d1916d2",
  "content/torenthia-2026-10-01": "e0b76dcffa0b1f0b5e8e2f1ceb75d089bed44b62"
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
    if mode not in ("preview","DELETE-BATCH-09"): raise SystemExit("Unrecognized mode")
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
