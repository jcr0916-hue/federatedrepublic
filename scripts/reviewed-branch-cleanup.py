#!/usr/bin/env python3
"""Preview or delete exactly ten reviewed refs, enforcing commit ancestry and SHA leases."""
import json, os, sys, urllib.parse, urllib.request, urllib.error
REPO=os.environ["GITHUB_REPOSITORY"]
TOKEN=os.environ["GITHUB_TOKEN"]
CANDIDATES={
  "fix/annotated-table-of-contents-20261013": "d2f4f07d95d874e7237f613966acc775b9e83309",
  "fix/cleanup-reachability-either-permanent-20261014": "3fccb1d7351c73424f6d7712fdc60dea57149af4",
  "fix/remove-stale-annotated-preamble-20261013": "1fb728850cb283158cfde97aeb0b216475cd6241",
  "history/constitution-recovery-index-20261012": "30f5bc882dfb11cc07dd0d8d75937473a0450290",
  "history/recover-constitution-editions-20261012": "a12a14c5d0ffefeedbb158bfc9fcd64d3b65b7a0",
  "history/recovered-constitution-source-editions": "e23bf126f64d75515c366ef6923a0b8baf7020e6",
  "history/two-track-constitution-recovery-20261012": "61f5cc1f88d29f60d372f230aac3c7c90a3a2302",
  "maintenance/branch-cleanup-batch-05-20261014": "dcac879b698b814355e694737a7099846589b814",
  "maintenance/decision-register-ai-20261013": "5247ba8ddebd931e33491a55d42da3d652c9f085",
  "maintenance/development-branch-history-20261013": "c8ab278b017fd8948b0c25555716b8319061a399"
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
    if mode not in ("preview","DELETE-BATCH-06"): raise SystemExit("Unrecognized mode")
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
