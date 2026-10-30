#!/usr/bin/env python3
"""Regression tests for retention, explicit review, races, and atomic deletion."""
import copy
import datetime as dt
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import unittest
from unittest import mock

spec = importlib.util.spec_from_file_location("rolling", Path(__file__).with_name("rolling-branch-cleanup.py"))
c = importlib.util.module_from_spec(spec)
spec.loader.exec_module(c)
NOW = dt.datetime(2026, 10, 30, 12, tzinfo=dt.timezone.utc)
REPO = "example/repo"


class SafetyTests(unittest.TestCase):
    def setUp(self):
        self.snapshot = {"repository": REPO, "default_branch": "main", "main_sha": "f" * 40,
                         "archive_sha": c.ARCHIVE_SHA, "branches": [], "prs": [],
                         "rules_blocked": set(), "open_refs": set(), "busy_refs": set(),
                         "workflow_refs": set(), "reachable": set(), "handoffs": {}}
        self.policy = {"repository": REPO, "retain_completed": 3, "reviewed": []}
        for n in range(1, 6):
            name, sha, merge = f"done/{n}", f"{n:040x}", f"{n+100:040x}"
            path = f"docs/archive/development/branches/pr-{n}.md"
            self.snapshot["branches"].append({"name": name, "commit": {"sha": sha}, "protected": False})
            self.snapshot["prs"].append({"number": n, "state": "closed", "merged_at": f"2026-10-{20+n:02}T00:00:00Z",
                "base": {"ref": "main"}, "head": {"ref": name, "sha": sha, "repo": {"full_name": REPO}},
                "merge_commit_sha": merge, "body": "", "author_association": "OWNER"})
            self.snapshot["reachable"].update([sha, merge])
            self.snapshot["handoffs"][path] = "**Original branch:** `" + name + "`"
            self.policy["reviewed"].append({"name": name, "sha": sha, "pr": n, "handoff": path,
                "dependencies": "none", "reviewed_at": "2026-10-30T00:00:00Z"})

    def plan(self):
        return c.classify(self.snapshot, self.policy, NOW)

    def names(self, key="delete"):
        return {r["name"] for r in self.plan()[key]}

    def test_keep_exactly_three_by_merge_time(self):
        self.assertEqual(self.names(), {"done/1", "done/2"})
        self.assertEqual(self.names("retain"), {"done/3", "done/4", "done/5"})

    def test_permanent_and_default_never_candidates(self):
        self.snapshot["branches"][0]["name"] = "archive/legacy-project-material"
        self.snapshot["default_branch"] = "done/2"
        self.assertNotIn("archive/legacy-project-material", self.names())
        self.assertNotIn("done/2", self.names())

    def test_protected_and_ruleset_branches_retained(self):
        self.snapshot["branches"][0]["protected"] = True
        self.snapshot["rules_blocked"].add("done/2")
        self.assertEqual(self.names(), set())

    def test_open_pr_head_or_base_is_retained(self):
        self.snapshot["open_refs"].update(["done/1", "done/2"])
        self.assertEqual(self.names(), set())

    def test_active_workflow_or_deployment_retained(self):
        self.snapshot["busy_refs"].add("done/1")
        self.assertNotIn("done/1", self.names())

    def test_literal_workflow_reference_retained(self):
        self.snapshot["workflow_refs"].add("done/1")
        self.assertNotIn("done/1", self.names())

    def test_unfinished_branch_retained_even_when_reachable(self):
        self.snapshot["prs"] = self.snapshot["prs"][1:]
        self.assertNotIn("done/1", self.names())

    def test_tip_changed_after_merge_retained(self):
        self.snapshot["branches"][0]["commit"]["sha"] = "a" * 40
        self.assertNotIn("done/1", self.names())

    def test_squash_unique_history_retained_until_preserved(self):
        self.snapshot["reachable"].remove(f"{1:040x}")
        self.assertNotIn("done/1", self.names())

    def test_unreachable_merge_commit_retained(self):
        self.snapshot["reachable"].remove(f"{101:040x}")
        self.assertNotIn("done/1", self.names())

    def test_missing_stale_future_and_wrong_sha_reviews_retained(self):
        for mutation in [None, {"reviewed_at": "2026-10-01T00:00:00Z"},
                         {"reviewed_at": "2026-10-31T00:00:00Z"}, {"sha": "a" * 40}]:
            with self.subTest(mutation=mutation):
                policy = copy.deepcopy(self.policy)
                if mutation is None:
                    policy["reviewed"] = []
                else:
                    for review in policy["reviewed"]:
                        review.update(mutation)
                self.assertFalse(c.classify(self.snapshot, policy, NOW)["delete"])

    def test_handoff_must_be_on_main_and_identify_branch(self):
        self.snapshot["handoffs"].clear()
        self.assertFalse(self.names())

    def test_handoff_path_traversal_rejected(self):
        review = {**self.policy["reviewed"][0], "handoff": "docs/archive/development/branches/../../bad.md"}
        self.assertFalse(c.review_valid(review, review["sha"], NOW))

    def test_explicit_retention_adds_to_rotation(self):
        self.policy["retain"] = {"done/1": "unfinished historical experiment"}
        self.assertNotIn("done/1", self.names())
        self.assertEqual(len(self.plan()["retain"]), 4)

    def test_trusted_pr_review_marker_accepts_exact_tip(self):
        review = self.policy["reviewed"][0]
        self.policy["reviewed"] = self.policy["reviewed"][1:]
        self.snapshot["prs"][0]["body"] = "<!-- branch-cleanup-review: " + json.dumps(review) + " -->"
        self.assertIn("done/1", self.names())
        self.snapshot["prs"][0]["author_association"] = "NONE"
        self.assertNotIn("done/1", self.names())

    def test_fork_pr_cannot_authorize_cleanup(self):
        self.snapshot["prs"][0]["head"]["repo"]["full_name"] = "stranger/repo"
        self.assertNotIn("done/1", self.names())

    def test_every_page_is_read(self):
        with mock.patch.object(c, "api", side_effect=[[{}] * 100, [{"last": True}]]) as api:
            self.assertEqual(len(c.pages("pulls?state=open")), 101)
            self.assertIn("page=2", api.call_args.args[0])

    def test_atomic_push_has_every_frozen_sha_lease(self):
        rows = self.plan()["delete"]
        with mock.patch.object(c, "git") as git:
            c.delete_refs(rows, REPO)
        args = git.call_args.args
        self.assertEqual(args[:2], ("push", "--atomic"))
        for row in rows:
            self.assertIn(f"--force-with-lease=refs/heads/{row['name']}:{row['sha']}", args)
            self.assertIn(":refs/heads/" + row["name"], args)

    def test_duplicate_review_cannot_silently_replace_clearance(self):
        self.policy["reviewed"].append(self.policy["reviewed"][0])
        with self.assertRaises(RuntimeError):
            self.plan()

    def test_delete_function_rejects_permanent_and_duplicate_refs(self):
        with self.assertRaises(RuntimeError):
            c.delete_refs([{"name": "main", "sha": "f" * 40}], REPO)
        row = self.plan()["delete"][0]
        with self.assertRaises(RuntimeError):
            c.delete_refs([row, row], REPO)

    def run_apply(self, preview, current):
        preview["generated_at"] = dt.datetime.now(dt.timezone.utc).isoformat()
        # Fresh planning uses the real current time, with current review dates.
        policy = copy.deepcopy(self.policy)
        for review in policy["reviewed"]:
            review["reviewed_at"] = preview["generated_at"]
        with (mock.patch.dict(os.environ, {"GITHUB_REPOSITORY": REPO}),
              mock.patch.object(c, "capture", return_value=self.snapshot),
              mock.patch.object(c, "ref", side_effect=current),
              mock.patch.object(c, "delete_refs") as delete):
            return c.apply_plan(preview, policy), delete

    def test_already_deleted_is_success_and_never_recreated(self):
        result, delete = self.run_apply(self.plan(), lambda *a, **k: None)
        self.assertEqual(len(result["already_absent"]), 2)
        self.assertEqual(result["deleted"], [])
        delete.assert_called_once_with([], REPO)

    def test_sha_moving_after_preview_prevents_deletion(self):
        result, delete = self.run_apply(self.plan(), lambda *a, **k: "a" * 40)
        self.assertEqual(len(result["held_during_apply"]), 2)
        delete.assert_called_once_with([], REPO)

    def test_expired_preview_cannot_mutate(self):
        preview = self.plan()
        preview["generated_at"] = (dt.datetime.now(dt.timezone.utc) - dt.timedelta(hours=2)).isoformat()
        with (mock.patch.dict(os.environ, {"GITHUB_REPOSITORY": REPO}), mock.patch.object(c, "delete_refs") as delete):
            with self.assertRaises(RuntimeError):
                c.apply_plan(preview, self.policy)
            delete.assert_not_called()

    def test_disappearance_during_atomic_push_counts_as_completed(self):
        preview = self.plan()
        preview["delete"] = preview["delete"][:1]
        preview["generated_at"] = dt.datetime.now(dt.timezone.utc).isoformat()
        policy = copy.deepcopy(self.policy)
        for r in policy["reviewed"]:
            r["reviewed_at"] = preview["generated_at"]
        row = preview["delete"][0]
        with (mock.patch.dict(os.environ, {"GITHUB_REPOSITORY": REPO}),
              mock.patch.object(c, "capture", return_value=self.snapshot),
              mock.patch.object(c, "ref", side_effect=[row["sha"], None]),
              mock.patch.object(c, "delete_refs", side_effect=[subprocess.CalledProcessError(1, "git"), None])):
            result = c.apply_plan(preview, policy)
        self.assertEqual(result["already_absent"], [row])
        self.assertEqual(result["deleted"], [])


if __name__ == "__main__":
    unittest.main()
