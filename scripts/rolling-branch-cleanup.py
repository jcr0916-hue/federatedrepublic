#!/usr/bin/env python3
"""Keep three reviewed completed branches; preserve every uncertain ref.

Preview is the default. Apply consumes that exact preview and repeats all gates.
Only git receive-pack can delete: one atomic push with one frozen SHA lease/ref.
"""
import argparse
import concurrent.futures
import datetime as dt
import json
import os
from pathlib import Path
import re
import subprocess
import urllib.error
import urllib.parse
import urllib.request

PERMANENT = {"main", "archive/legacy-project-material"}
ARCHIVE_SHA = "0053ac4da09d32807d7f5b71ef0fff2075b421c1"
POLICY = Path("docs/archive/development/branch-cleanup-policy.json")
REVIEW_MARKER = re.compile(r"<!-- branch-cleanup-review:\s*(\{[^\n]*\})\s*-->")
BUSY = {"queued", "pending", "in_progress", "waiting"}


def git(*args, check=True):
    return subprocess.run(["git", *args], check=check, text=True, capture_output=True)


def ancestor(sha, base):
    result = git("merge-base", "--is-ancestor", sha, base, check=False)
    if result.returncode not in (0, 1):
        raise RuntimeError("Cannot establish commit ancestry")
    return result.returncode == 0


def api(path):
    repository = os.environ["GITHUB_REPOSITORY"]
    request = urllib.request.Request(
        "https://api.github.com/repos/" + repository + ("/" + path if path else ""),
        headers={"Authorization": "Bearer " + os.environ["GITHUB_TOKEN"],
                 "Accept": "application/vnd.github+json",
                 "X-GitHub-Api-Version": "2022-11-28"})
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.loads(response.read() or b"{}")


def pages(path, key=None):
    result = []
    for page in range(1, 1001):
        response = api(path + ("&" if "?" in path else "?") + f"per_page=100&page={page}")
        rows = response[key] if key else response
        if not isinstance(rows, list):
            raise RuntimeError("Unexpected paginated response")
        result.extend(rows)
        if len(rows) < 100:
            return result
    raise RuntimeError("Incomplete pagination; no deletion permitted")


def ref(branch, missing=False):
    try:
        return api("git/ref/heads/" + urllib.parse.quote(branch, safe="/"))["object"]["sha"]
    except urllib.error.HTTPError as error:
        if missing and error.code == 404:
            return None
        raise


def review_valid(review, sha, now):
    try:
        reviewed = dt.datetime.fromisoformat(review["reviewed_at"].replace("Z", "+00:00"))
        age = now - reviewed
        path = review["handoff"]
        return (review["sha"] == sha and re.fullmatch(r"[0-9a-f]{40}", sha)
                and review["dependencies"] == "none"
                and dt.timedelta(0) <= age <= dt.timedelta(days=7)
                and path.startswith("docs/archive/development/branches/")
                and path.endswith(".md") and ".." not in Path(path).parts)
    except (KeyError, TypeError, ValueError):
        return False


def pr_review(pr):
    # A same-repository writer must explicitly attest the exact final tip.
    if pr.get("author_association") not in {"OWNER", "MEMBER", "COLLABORATOR"}:
        return None
    matches = REVIEW_MARKER.findall(pr.get("body") or "")
    if len(matches) != 1:
        return None
    try:
        return json.loads(matches[0])
    except (ValueError, TypeError):
        return None


def classify(snapshot, policy, now=None):
    now = now or dt.datetime.now(dt.timezone.utc)
    reviewed = {row["name"]: row for row in policy.get("reviewed", [])}
    if len(reviewed) != len(policy.get("reviewed", [])):
        raise RuntimeError("Duplicate dependency review entry")
    eligible, retained = [], []
    for branch in snapshot["branches"]:
        name, sha = branch["name"], branch["commit"]["sha"]
        row = {"name": name, "sha": sha}
        reason = None
        if name in PERMANENT or name == snapshot["default_branch"]:
            reason = "permanent/default branch"
        elif branch["protected"] or name in snapshot["rules_blocked"]:
            reason = "protected branch or active branch rules"
        elif name in snapshot["open_refs"]:
            reason = "open PR head/base"
        elif name in snapshot["busy_refs"]:
            reason = "active workflow/deployment dependency"
        elif name in snapshot["workflow_refs"]:
            reason = "literal reference in a current workflow"
        elif name in policy.get("retain", {}):
            reason = policy["retain"][name]
        if reason:
            retained.append({**row, "reason": reason})
            continue
        merged = [p for p in snapshot["prs"] if p.get("merged_at")
                  and p["base"]["ref"] == snapshot["default_branch"]
                  and p["head"]["ref"] == name
                  and (p["head"].get("repo") or {}).get("full_name") == snapshot["repository"]]
        if not merged:
            retained.append({**row, "reason": "no completed merged PR; unfinished/unknown work"})
            continue
        pr = max(merged, key=lambda p: (p["merged_at"], p["number"]))
        row.update(pr=pr["number"], merged_at=pr["merged_at"])
        if pr["head"]["sha"] != sha:
            reason = "tip differs from merged PR; preserve/review changed work"
        elif sha not in snapshot["reachable"] or pr["merge_commit_sha"] not in snapshot["reachable"]:
            reason = "original tip or merge commit not preserved on permanent history"
        else:
            review = reviewed.get(name) or pr_review(pr)
            if not review or not review_valid(review, sha, now):
                reason = "missing, stale, or SHA-mismatched external dependency review"
            elif review.get("pr", pr["number"]) != pr["number"]:
                reason = "dependency review belongs to another PR"
            elif name not in snapshot["handoffs"].get(review["handoff"], ""):
                reason = "permanent Markdown handoff missing or does not identify branch"
        if reason:
            retained.append({**row, "reason": reason})
        else:
            eligible.append(row)
    eligible.sort(key=lambda r: (r["merged_at"], r["pr"], r["name"]), reverse=True)
    retained.extend({**row, "reason": "three newest eligible completed branches"} for row in eligible[:3])
    return {"repository": snapshot["repository"], "main_sha": snapshot["main_sha"],
            "archive_sha": snapshot["archive_sha"], "generated_at": now.isoformat(),
            "inventory_count": len(snapshot["branches"]), "delete": eligible[3:],
            "retain": sorted(retained, key=lambda r: r["name"])}


def capture(policy):
    repository = os.environ["GITHUB_REPOSITORY"]
    if repository != policy["repository"] or policy["retain_completed"] != 3:
        raise RuntimeError("Policy repository/retention mismatch")
    git("fetch", "--quiet", "origin", "+refs/heads/*:refs/remotes/origin/*")
    metadata = api("")
    if metadata["delete_branch_on_merge"]:
        raise RuntimeError("Unconditional delete-on-merge conflicts with three-branch retention")
    main_sha, archive_sha = ref("main"), ref("archive/legacy-project-material")
    if archive_sha != ARCHIVE_SHA or metadata["default_branch"] != "main":
        raise RuntimeError("Permanent/default ref changed; re-review required")
    for name, sha in [("main", main_sha), ("archive/legacy-project-material", archive_sha)]:
        if git("rev-parse", "refs/remotes/origin/" + name).stdout.strip() != sha:
            raise RuntimeError("Remote changed during fetch; rerun preview")
    reads = {"branches": ("branches", None), "prs": ("pulls?state=all", None),
             "deployments": ("deployments", None)}
    for status in ("in_progress", "queued", "waiting", "pending", "requested"):
        reads[status] = ("actions/runs?status=" + status, "workflow_runs")
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        jobs = {key: pool.submit(pages, *args) for key, args in reads.items()}
        data = {key: job.result() for key, job in jobs.items()}
    branches, prs = data["branches"], data["prs"]
    busy = {r["head_branch"] for status in ("in_progress", "queued", "waiting", "pending", "requested")
            for r in data[status] if r.get("head_branch")}
    open_refs = {p[role]["ref"] for p in prs if p["state"] == "open" for role in ("head", "base")}
    reachable = set()
    for b in branches:
        sha = b["commit"]["sha"]
        if ancestor(sha, main_sha) or ancestor(sha, archive_sha):
            reachable.add(sha)
    live_names = {b["name"] for b in branches} - PERMANENT
    for p in prs:
        if (p["head"]["ref"] in live_names and p.get("merged_at") and p.get("merge_commit_sha")
                and ancestor(p["merge_commit_sha"], main_sha)):
            reachable.add(p["merge_commit_sha"])
    workflows = git("ls-tree", "-r", "--name-only", main_sha, ".github/workflows").stdout.splitlines()
    workflow_text = "\n".join(git("show", main_sha + ":" + p).stdout for p in workflows)
    workflow_refs = {b["name"] for b in branches if b["name"] in workflow_text}
    reviews = list(policy.get("reviewed", [])) + [r for p in prs if (r := pr_review(p))]
    handoffs = {}
    for review in reviews:
        path = review.get("handoff", "")
        if not path.startswith("docs/archive/development/branches/") or ".." in Path(path).parts:
            continue
        result = git("show", main_sha + ":" + path, check=False)
        if result.returncode == 0:
            handoffs[path] = result.stdout
    # Query applicable branch rules as well as the protected flag. Failure is fatal.
    def rules(b):
        return b["name"], api("rules/branches/" + urllib.parse.quote(b["name"], safe=""))
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        rules_blocked = {name for name, rows in pool.map(rules, branches) if rows}
    # All deployments are paginated; inspect the latest status of each relevant one.
    by_sha = {b["commit"]["sha"]: b["name"] for b in branches if b["name"] not in PERMANENT}
    names = live_names
    relevant = [d for d in data["deployments"] if d.get("sha") in by_sha or d.get("ref") in names]
    def deployment_status(d):
        rows = api(f"deployments/{d['id']}/statuses?per_page=1")
        active = not rows or rows[0]["state"] in BUSY
        return d, active
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        for d, active in pool.map(deployment_status, relevant):
            if active:
                if d.get("ref") in names:
                    busy.add(d["ref"])
                if d.get("sha") in by_sha:
                    busy.add(by_sha[d["sha"]])
    if ref("main") != main_sha or ref("archive/legacy-project-material") != archive_sha:
        raise RuntimeError("Permanent ref moved during review; rerun preview")
    return {"repository": repository, "default_branch": metadata["default_branch"],
            "main_sha": main_sha, "archive_sha": archive_sha, "branches": branches,
            "prs": prs, "open_refs": open_refs, "busy_refs": busy, "reachable": reachable,
            "rules_blocked": rules_blocked, "workflow_refs": workflow_refs, "handoffs": handoffs}


def delete_refs(rows, repository):
    if not rows:
        return
    if len(rows) > 20 or len({r["name"] for r in rows}) != len(rows):
        raise RuntimeError("Invalid deletion batch")
    for row in rows:
        if row["name"] in PERMANENT or not re.fullmatch(r"[0-9a-f]{40}", row["sha"]):
            raise RuntimeError("Invalid or permanent deletion ref")
        git("check-ref-format", "refs/heads/" + row["name"])
    command = ["push", "--atomic"]
    command += [f"--force-with-lease=refs/heads/{r['name']}:{r['sha']}" for r in rows]
    command += ["https://github.com/" + repository + ".git"]
    command += [":refs/heads/" + r["name"] for r in rows]
    git(*command)


def apply_plan(preview, policy):
    if preview["repository"] != os.environ["GITHUB_REPOSITORY"] or preview["archive_sha"] != ARCHIVE_SHA:
        raise RuntimeError("Preview identity mismatch")
    age = dt.datetime.now(dt.timezone.utc) - dt.datetime.fromisoformat(preview["generated_at"])
    if not dt.timedelta(0) <= age <= dt.timedelta(hours=1):
        raise RuntimeError("Preview expired; generate a fresh preview")
    deleted, absent, held = [], [], []
    proposed = preview["delete"]
    if len({r["name"] for r in proposed}) != len(proposed):
        raise RuntimeError("Duplicate preview ref")
    for start in range(0, len(proposed), 20):
        group = proposed[start:start + 20]
        fresh = classify(capture(policy), policy)
        allowed = {r["name"]: r for r in fresh["delete"]}
        pending = []
        for row in group:
            current = ref(row["name"], missing=True)
            if current is None:
                absent.append(row)
            elif current != row["sha"] or allowed.get(row["name"], {}).get("sha") != row["sha"]:
                held.append({**row, "reason": "fresh safety/rotation gate changed; retained"})
            else:
                pending.append(row)
        try:
            delete_refs(pending, preview["repository"])
        except subprocess.CalledProcessError:
            # A ref disappearing between validation and push is completed, never
            # an error. Retry remaining refs only after another full validation.
            missing = [r for r in pending if ref(r["name"], missing=True) is None]
            if not missing:
                raise
            absent.extend(missing)
            remaining = [r for r in pending if r not in missing]
            allowed = {r["name"]: r for r in classify(capture(policy), policy)["delete"]}
            if any(allowed.get(r["name"], {}).get("sha") != r["sha"] for r in remaining):
                raise RuntimeError("Safety gate changed after atomic push rejection")
            delete_refs(remaining, preview["repository"])
            pending = remaining
        for row in pending:
            if ref(row["name"], missing=True) is not None:
                raise RuntimeError("Deletion verification failed; branch was retained/recreated")
            deleted.append(row)
    result = classify(capture(policy), policy)
    result.update(deleted=deleted, already_absent=absent, held_during_apply=held)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--apply", type=Path, help="Apply an exact JSON preview, after fresh gates")
    args = parser.parse_args()
    policy = json.loads(POLICY.read_text())
    if args.apply:
        result = apply_plan(json.loads(args.apply.read_text()), policy)
    else:
        result = classify(capture(policy), policy)
    args.output.write_text(json.dumps(result, indent=2) + "\n")
    print(f"{result['inventory_count']} live branches; {len(result.get('deleted', []))} deleted; "
          f"{len(result.get('already_absent', []))} already absent; {len(result['delete'])} eligible beyond rotation")
    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        with open(summary, "a") as out:
            out.write("## Three-branch rolling cleanup\n\n")
            out.write(f"Deleted: {len(result.get('deleted', []))}. Already absent: {len(result.get('already_absent', []))}.\n\n")
            for key in ("deleted", "already_absent", "delete", "retain", "held_during_apply"):
                if result.get(key):
                    out.write("### " + key.replace("_", " ").title() + "\n\n")
                    for row in result[key]:
                        out.write(f"- `{row['name']}` — {row.get('reason', row['sha'])}\n")
                    out.write("\n")


if __name__ == "__main__":
    main()
