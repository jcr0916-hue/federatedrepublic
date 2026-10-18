#!/usr/bin/env python3
"""Safety regressions for destructive cleanup gates and server-enforced leases."""
import contextlib
import importlib.util
import io
import os
from pathlib import Path
from unittest import TestCase, main, mock

spec=importlib.util.spec_from_file_location("batch12",Path(__file__).with_name("reviewed-branch-cleanup-batch-12.py"))
cleanup=importlib.util.module_from_spec(spec)
with mock.patch.dict(os.environ,{"GITHUB_REPOSITORY":"example/repo","GITHUB_TOKEN":"fake"}):
    spec.loader.exec_module(cleanup)

ARCHIVE="0053ac4da09d32807d7f5b71ef0fff2075b421c1"

class SafetyTests(TestCase):
    def setUp(self):
        self.candidates={"done/one":"1"*40,"done/two":"2"*40}
        self.refs={**self.candidates,"main":"3"*40,"archive/legacy-project-material":ARCHIVE}
        self.prs=[]
        self.protected=False
        self.ahead=0

    def api(self,path):
        if path=="": return {"default_branch":"main"}
        if path.startswith("pulls?"): return self.prs
        if path.startswith("branches/"): return {"protected":self.protected}
        raise AssertionError(path)

    def run_cleanup(self,mode="DELETE-BATCH-12"):
        with (mock.patch.dict(os.environ,{"CLEANUP_MODE":mode}),
              mock.patch.object(cleanup,"CANDIDATES",self.candidates),
              mock.patch.object(cleanup,"get_ref",side_effect=lambda name,allow_missing=False:self.refs.get(name)),
              mock.patch.object(cleanup,"api",side_effect=self.api),
              mock.patch.object(cleanup,"ahead",return_value=self.ahead),
              mock.patch.object(cleanup,"delete_refs") as delete,
              contextlib.redirect_stdout(io.StringIO())):
            cleanup.main()
            return delete.call_args_list

    def test_preview_cannot_mutate(self):
        self.assertEqual(self.run_cleanup("preview"),[])

    def test_sha_drift_aborts_batch(self):
        self.refs["done/two"]="4"*40
        with self.assertRaisesRegex(SystemExit,"changed"): self.run_cleanup()

    def test_archive_drift_aborts_batch(self):
        self.refs["archive/legacy-project-material"]="4"*40
        with self.assertRaisesRegex(SystemExit,"Archive ref moved"): self.run_cleanup()

    def test_unique_history_aborts_batch(self):
        self.ahead=1
        with self.assertRaisesRegex(SystemExit,"not reachable"): self.run_cleanup()

    def test_protected_branch_aborts_batch(self):
        self.protected=True
        with self.assertRaisesRegex(SystemExit,"protected"): self.run_cleanup()

    def test_open_pr_base_is_retained(self):
        self.prs=[{"head":{"ref":"other"},"base":{"ref":"done/one"}}]
        with self.assertRaisesRegex(SystemExit,"open PR"): self.run_cleanup()

    def test_permanent_branch_cannot_be_candidate(self):
        self.candidates["main"]="3"*40
        with self.assertRaisesRegex(SystemExit,"Permanent branch"): self.run_cleanup()

    def test_changed_default_branch_cannot_be_candidate(self):
        original=self.api
        self.api=lambda path: {"default_branch":"done/one"} if path=="" else original(path)
        with self.assertRaisesRegex(SystemExit,"Default branch"): self.run_cleanup()

    def test_missing_branches_are_repeat_safe(self):
        self.refs.pop("done/one")
        self.refs.pop("done/two")
        self.assertEqual(self.run_cleanup(),[mock.call([])])

    def test_pagination_keeps_prs_beyond_first_page(self):
        first=[{"head":{"ref":"other"}} for _ in range(100)]
        second=[{"base":{"ref":"done/one"}}]
        with mock.patch.object(cleanup,"api",side_effect=[first,second]) as api:
            result=cleanup.open_prs()
        self.assertEqual(len(result),101)
        self.assertIn("page=2",api.call_args_list[1].args[0])

    def test_atomic_push_enforces_every_frozen_lease(self):
        with mock.patch.object(cleanup.subprocess,"run") as run:
            cleanup.delete_refs(list(self.candidates.items()))
        command=run.call_args.args[0]
        self.assertEqual(command[:3],["git","push","--atomic"])
        for name,sha in self.candidates.items():
            self.assertIn(f"--force-with-lease=refs/heads/{name}:{sha}",command)
            self.assertIn(f":refs/heads/{name}",command)
        self.assertTrue(run.call_args.kwargs["check"])

    def test_preview_is_repeated_before_mutation(self):
        with (mock.patch.dict(os.environ,{"CLEANUP_MODE":"DELETE-BATCH-12"}),
              mock.patch.object(cleanup,"validate",side_effect=[([],[]),SystemExit("new PR")]),
              mock.patch.object(cleanup,"delete_refs") as delete):
            with self.assertRaisesRegex(SystemExit,"new PR"): cleanup.main()
            delete.assert_not_called()

if __name__=="__main__": main()
