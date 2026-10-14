#!/usr/bin/env python3
"""Preview or delete exactly two reviewed refs, enforcing commit ancestry and SHA leases."""
import json, os, sys, urllib.parse, urllib.request, urllib.error
REPO=os.environ["GITHUB_REPOSITORY"]
TOKEN=os.environ["GITHUB_TOKEN"]
CANDIDATES={
  "article-ix-final-checkpoint-2026-10-09": "4f71b5f955af027ee82684ed8b3d09b986873efa",
  "article-ix-review-checkpoint-2026-10-09": "b953ecc8ba3f846f57cb2c9e08442a0799e56806"
}
PERMANENT={"main","archive/legacy-project-material"}
def api(path, method="GET"):
    request=urllib.request.Request("https://api.github.com/repos/"+REPO+"/"+path,method=method,headers={"Authorization":"Bearer "+TOKEN,"Accept":"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28"})
    with urllib.request.urlopen(request,timeout=30) as response:
        return json.loads(response.read() or b"{}")
def get_ref(branch):
    return api("git/ref/heads/"+urllib.parse.quote(branch,safe="/"))["object"]["sha"]
def ahead(base, branch):
    return api("compare/"+urllib.parse.quote(base,safe="")+"..."+urllib.parse.quote(branch,safe=""))["ahead_by"]
def main():
    mode=os.environ.get("CLEANUP_MODE","preview")
    if mode not in ("preview","DELETE-BATCH-04"): raise SystemExit("Unrecognized mode")
    assert not set(CANDIDATES)&PERMANENT
    if get_ref("archive/legacy-project-material")!= "0053ac4da09d32807d7f5b71ef0fff2075b421c1":
        raise SystemExit("Archive ref moved since audit; re-review before any deletions")
    prs=api("pulls?state=open&per_page=100")
    for name, expected in CANDIDATES.items():
        current=get_ref(name)
        if current!=expected: raise SystemExit(f"STOP: {name} changed {current} != {expected}")
        if any(p.get("head",{}).get("ref")==name for p in prs):
            raise SystemExit(f"STOP: {name} is attached to an open PR")
        if ahead("main",name) or ahead("archive/legacy-project-material",name):
            raise SystemExit(f"STOP: {name} contains commits not reachable from permanent branches")
        print("VERIFIED",name,current,flush=True)
    if mode=="preview":
        print("PREVIEW ONLY: no refs changed. Confirm external deployment dependencies before deletion.")
        return
    for name, expected in CANDIDATES.items():
        if get_ref(name)!=expected: raise SystemExit(f"STOP: {name} moved during review")
        api("git/refs/heads/"+urllib.parse.quote(name,safe="/"),"DELETE")
        print("DELETED",name,flush=True)
if __name__=="__main__": main()
