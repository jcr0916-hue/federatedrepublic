#!/usr/bin/env python3
"""Preview or delete exactly ten reviewed refs, enforcing commit ancestry and SHA leases."""
import json, os, sys, urllib.parse, urllib.request, urllib.error
REPO=os.environ["GITHUB_REPOSITORY"]
TOKEN=os.environ["GITHUB_TOKEN"]
CANDIDATES={
  "maintenance/branch-cleanup-batch-06-20261014": "80674848b2fa81d638ef46191bf22b2921ad61d4",
  "remove-navigator-model-benchmark-final": "fb9c3f26b91c40b3ef8cf0407e084f967252938c",
  "remove-temporary-navigator-benchmark": "48abadfffe9d4d24b3af2c74052730964226d27f",
  "retire-korda-crossroads-feature-2026-10-10": "42393697d0a2d81256fded9dd69316f49b06b48d",
  "world-publishing-guards": "208100e32f1eda37694b51f501b18f94aab43d96",
  "constitution-automatic-archival": "a77701b5fba19de9f5035f946e9c4c2f544c6d15",
  "project/remove-preamble-torenthia-y14m1": "79a204073035e1ca22a54c61bf2ea00c270c8a7d",
  "review-intent-decisions-2026-10-11": "5828a04c7941315f47c603894ebe98548b5d453d",
  "world-y14m01-opening-2026-10-12": "bd564b88295c029eca4d1b4f97e42e01ea4b9dff",
  "typingmind-kb-tags": "49f6ef4e0f61d9b6c8a2aa9867c6f7ab67d76ca9"
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
    if mode not in ("preview","DELETE-BATCH-07"): raise SystemExit("Unrecognized mode")
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
