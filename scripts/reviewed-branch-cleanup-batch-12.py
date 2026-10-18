#!/usr/bin/env python3
"""Preview or delete ten Batch 12 reviewed refs, enforcing commit ancestry and SHA leases."""
import json, os, socket, subprocess, time, urllib.parse, urllib.request, urllib.error
REPO=os.environ["GITHUB_REPOSITORY"]
TOKEN=os.environ["GITHUB_TOKEN"]
CANDIDATES={
  "kelvant-state-test-02-paid-service-20261017": "51342bfedf4dc9b853429dc3a03d31d361ed61d5",
  "corindal-state-test-01-commission-veto-20261017": "176d627b5393cc456652a04682199a7640074620",
  "caldenmere-state-test-01-minister-appointment-20261017": "f83ac03345f4003fe616354b7b7c3e2a0c22a724",
  "arvane-state-test-01-rule-sunset-20261017": "3efd298ac3271e14ee41f8c99f21c0b376891e7a",
  "aldenmere-state-test-01-budget-continuity-20261017": "0f7dcf26c8ddbad9e892b2d71f049dc38336e918",
  "fix/cleanup-batch05-permanent-reachability-20261014": "afad3d4621093ccd0f77f92e3c0db6d80489a7a6",
  "content/selvane-profile-20261017": "74ff03fff9d0330988144365ae2276150f33735c",
  "content/orath-merath-profiles-20261017": "fb4876ed685713ced5fd0ce484465d8fe97378d0",
  "design/remove-duplicate-state-constitution-link-20261016": "b26f329f1175dd6f87b75d211dc8963bf50c50f9",
  "planning/weekend-objectives-20261017": "7ee3f901ce4fe332a05ebb79e5d10290b10f2779"
}
PERMANENT={"main","archive/legacy-project-material"}
def api(path):
    request=urllib.request.Request("https://api.github.com/repos/"+REPO+("/"+path if path else ""),headers={"Authorization":"Bearer "+TOKEN,"Accept":"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(request,timeout=30) as response:
                return json.loads(response.read() or b"{}")
        except (urllib.error.URLError, TimeoutError, socket.timeout) as error:
            if isinstance(error, urllib.error.HTTPError) and error.code not in (429, 500, 502, 503, 504):
                raise
            if attempt == 2:
                raise
            time.sleep(attempt + 1)
def get_ref(branch, allow_missing=False):
    try:
        return api("git/ref/heads/"+urllib.parse.quote(branch,safe="/"))["object"]["sha"]
    except urllib.error.HTTPError as error:
        if allow_missing and error.code == 404:
            return None
        raise

def delete_refs(pending):
    if not pending:
        return
    # The receive-pack server checks all leases atomically. A GET followed by a
    # REST DELETE cannot enforce a lease when another writer moves a ref.
    command=["git", "push", "--atomic"]
    command += [f"--force-with-lease=refs/heads/{name}:{sha}" for name, sha in pending]
    command += ["https://github.com/"+REPO+".git"]
    command += [f":refs/heads/{name}" for name, _ in pending]
    subprocess.run(command, check=True)
def ahead(base, branch):
    return api("compare/"+urllib.parse.quote(base,safe="")+"..."+urllib.parse.quote(branch,safe=""))["ahead_by"]
def open_prs():
    result=[]
    page=1
    while True:
        items=api(f"pulls?state=open&per_page=100&page={page}")
        result.extend(items)
        if len(items)<100:
            return result
        page+=1

def validate():
    if set(CANDIDATES)&PERMANENT:
        raise SystemExit("Permanent branch in candidate list")
    default_branch=api("")["default_branch"]
    if default_branch in CANDIDATES:
        raise SystemExit("Default branch in candidate list")
    permanent={name:get_ref(name) for name in PERMANENT}
    if permanent["archive/legacy-project-material"]!= "0053ac4da09d32807d7f5b71ef0fff2075b421c1":
        raise SystemExit("Archive ref moved since audit; re-review before any deletions")
    prs=open_prs()
    pending=[]
    already_absent=[]
    for name, expected in CANDIDATES.items():
        current=get_ref(name, allow_missing=True)
        if current is None:
            already_absent.append(name)
            print("ALREADY DELETED", name, flush=True)
            continue
        if current!=expected: raise SystemExit(f"STOP: {name} changed {current} != {expected}")
        if any(p.get(role,{}).get("ref")==name for p in prs for role in ("head", "base")):
            raise SystemExit(f"STOP: {name} is attached to an open PR")
        if api("branches/"+urllib.parse.quote(name,safe=""))["protected"]:
            raise SystemExit(f"STOP: {name} is protected")
        if all(ahead(base,expected) for base in permanent.values()):
            raise SystemExit(f"STOP: {name} contains commits not reachable from either permanent branch")
        print("VERIFIED",name,current,flush=True)
        pending.append((name, expected))
    if any(get_ref(name)!=sha for name,sha in permanent.items()):
        raise SystemExit("Permanent ref moved during review; rerun preview")
    return pending, already_absent

def main(delete_mode="DELETE-BATCH-12"):
    mode=os.environ.get("CLEANUP_MODE","preview")
    if mode not in ("preview",delete_mode): raise SystemExit("Unrecognized mode")
    pending, already_absent=validate()
    if mode=="preview":
        print("PREVIEW ONLY: no refs changed. Confirm external deployment dependencies before deletion.")
        return
    # Recheck PRs, protected refs, preservation and tips immediately before push.
    pending, already_absent=validate()
    delete_refs(pending)
    deleted=[name for name,_ in pending]
    for name in deleted:
        print("DELETED", name, flush=True)
    print(f"COMPLETE: {len(deleted)} deleted; {len(already_absent)} already deleted; {len(CANDIDATES)} total reviewed.", flush=True)
if __name__=="__main__": main()
