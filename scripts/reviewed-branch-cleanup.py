#!/usr/bin/env python3
"""Preview or delete exactly seven reviewed refs, enforcing commit ancestry and SHA leases."""
import json, os, sys, urllib.parse, urllib.request, urllib.error
REPO=os.environ["GITHUB_REPOSITORY"]
TOKEN=os.environ["GITHUB_TOKEN"]
CANDIDATES={
  "ai-cleanup-haiku-benchmark": "44311017e4cf6b603476692ab64f7c4947924044",
  "ai-crossroads-shadow-benchmark": "56e278da875b85e26e9d3ae2ffd475882c41e35c",
  "ai-gateway-all-live-features": "992b089756e5775541bb09d6e0203da88062285c",
  "ai-gateway-crossroads-poc": "a8674d4bc80e7044c8624353903ca546d188f1de",
  "ai-navigator-escalation-benchmark": "0ac72122071c34de9ce5e80743df599e0a45cd2d",
  "ai-navigator-haiku-answer-only-benchmark": "8c0f2c142d836b8192eee079ec4850b39d12a7cd",
  "ai-navigator-haiku-close-paraphrase": "90551e1e928f23884159e07b247678bb419d9ebf"
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
    if mode not in ("preview","DELETE-BATCH-02"): raise SystemExit("Unrecognized mode")
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
