#!/usr/bin/env python3
"""Preview or delete exactly ten reviewed refs, enforcing commit ancestry and SHA leases."""
import json, os, sys, urllib.parse, urllib.request, urllib.error
REPO=os.environ["GITHUB_REPOSITORY"]
TOKEN=os.environ["GITHUB_TOKEN"]
CANDIDATES={
  "torenthia-publish-2026-10-09": "5a4046721e56fd96e88eb42a215ba264384e764f",
  "weekend-infrastructure": "ada859069f514bb9de7a12d8c7edf31a3b5e3cf5",
  "world-record-generator": "e542cdf84ee75159c3de7594e547820449eb4ea7",
  "auto-world-dossiers": "ab4d57e2fe269b5013b99a0e17ca182250c34b85",
  "maintenance/branch-preservation-inventory-20261012": "a63fd59306c019d25f7c6a8b29f171f75745b395",
  "maintenance/merged-branch-history-batch-01-20261013": "0cfcbf6a9f29c6ecaadbf5488ddb5aa95eb94820",
  "maintenance/merged-branch-history-batch-02-20261013": "33305edc58a5b0d2cd67defe3e7b728a4de9d268",
  "maintenance/merged-branch-history-batch-03-20261013": "5e72f19dbf63d0f7b2344564e6b7433950c369d9",
  "maintenance/merged-branch-history-batch-04-20261013": "5a955cc174ad88be771b288e2db4ed3014aebb0b",
  "maintenance/merged-branch-history-batch-05-20261013": "3a01dec45e913d93e3b7808751cd4b81a78cefff"
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
    if mode not in ("preview","DELETE-BATCH-01"): raise SystemExit("Unrecognized mode")
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
