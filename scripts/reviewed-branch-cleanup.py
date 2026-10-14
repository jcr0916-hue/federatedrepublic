#!/usr/bin/env python3
"""Preview or delete exactly six reviewed refs, enforcing commit ancestry and SHA leases."""
import json, os, sys, urllib.parse, urllib.request, urllib.error
REPO=os.environ["GITHUB_REPOSITORY"]
TOKEN=os.environ["GITHUB_TOKEN"]
CANDIDATES={
  "maintenance/branch-cleanup-batch-07-20261014": "f72216cf67ca0b85fcd0300e95546475695ae6ce",
  "design-principles-update-2026-10-10": "aa9832169f8dcbd47832b21ba9ba442ea958c7a4",
  "world-y13m12-opening-records": "6b4fffd5a8c450adffac502ffba519dab6e36efc",
  "constitution-pdf-2026-10-11": "557a4f6d800b84cf9810cf9916c616be53289003",
  "constitution-door-closing-2026-10-10": "f960865f0e0792771cd3fc943057b543e4fbd73e",
  "changelog-and-open-items": "bc89834686c1f5a498860a84ac79eb0686b61a4e"
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
    if mode not in ("preview","DELETE-BATCH-08"): raise SystemExit("Unrecognized mode")
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
