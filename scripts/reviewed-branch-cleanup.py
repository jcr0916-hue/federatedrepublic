#!/usr/bin/env python3
"""Preview or delete exactly eight reviewed refs, enforcing commit ancestry and SHA leases."""
import json, os, sys, urllib.parse, urllib.request, urllib.error
REPO=os.environ["GITHUB_REPOSITORY"]
TOKEN=os.environ["GITHUB_TOKEN"]
CANDIDATES={
  "maintenance/archive-reachability-proof-20261013": "3e1f87ab2c24c507ce3be506701075c239c5d55f",
  "maintenance/branch-cleanup-batch-01-20261013": "6a92a3c7cd57fb5cd282d21698f1c3f0caf47217",
  "maintenance/branch-cleanup-batch-02-20261014": "07b1cd75995685e83c8b16b33e9c96dd34eb0fc6",
  "maintenance/branch-cleanup-batch-03-20261014": "a739e0ef397f7b3556fec92a6cf237519c9281cc",
  "maintenance/branch-cleanup-batch-04-20261014": "cad64486c1233a2d285f5cf3ce78aa05cdf0d023",
  "maintenance/branch-preservation-gates-20261013": "7357a416741b793495b1d4bd7f02f07997e6a2f1",
  "maintenance/complete-branch-history-manifest-20261013": "51451020fc93c41aef4384856f4f91856d480112",
  "maintenance/constitutional-publishing-decisions-20261013": "c1e2a57086df72145452b863f3eb13d059455599"
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
    if mode not in ("preview","DELETE-BATCH-05"): raise SystemExit("Unrecognized mode")
    assert not set(CANDIDATES)&PERMANENT
    if get_ref("archive/legacy-project-material")!= "0053ac4da09d32807d7f5b71ef0fff2075b421c1":
        raise SystemExit("Archive ref moved since audit; re-review before any deletions")
    prs=api("pulls?state=open&per_page=100")
    for name, expected in CANDIDATES.items():
        current=get_ref(name)
        if current!=expected: raise SystemExit(f"STOP: {name} changed {current} != {expected}")
        if any(p.get("head",{}).get("ref")==name for p in prs):
            raise SystemExit(f"STOP: {name} is attached to an open PR")
        if ahead("main",name) and ahead("archive/legacy-project-material",name):
            raise SystemExit(f"STOP: {name} contains commits not reachable from either permanent branch")
        print("VERIFIED",name,current,flush=True)
    if mode=="preview":
        print("PREVIEW ONLY: no refs changed. Confirm external deployment dependencies before deletion.")
        return
    for name, expected in CANDIDATES.items():
        if get_ref(name)!=expected: raise SystemExit(f"STOP: {name} moved during review")
        api("git/refs/heads/"+urllib.parse.quote(name,safe="/"),"DELETE")
        print("DELETED",name,flush=True)
if __name__=="__main__": main()
