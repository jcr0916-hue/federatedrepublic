#!/usr/bin/env python3
"""Regression tests for repeat-safe reviewed branch cleanup."""
import contextlib
import importlib.util
import io
import os
from pathlib import Path
from unittest import TestCase, main, mock
from urllib.error import HTTPError

SCRIPT = Path(__file__).with_name("reviewed-branch-cleanup.py")
spec = importlib.util.spec_from_file_location("reviewed_cleanup", SCRIPT)
cleanup = importlib.util.module_from_spec(spec)
with mock.patch.dict(os.environ, {"GITHUB_REPOSITORY": "example/repo", "GITHUB_TOKEN": "fake"}):
    spec.loader.exec_module(cleanup)


class ReviewedCleanupTests(TestCase):
    def execute(self, refs, mode="DELETE-BATCH-08"):
        deleted = []
        def get_ref(branch, allow_missing=False):
            if branch == "archive/legacy-project-material":
                return "0053ac4da09d32807d7f5b71ef0fff2075b421c1"
            if branch not in refs:
                if allow_missing:
                    return None
                raise AssertionError("Missing permanent branch")
            return refs[branch]
        def delete_ref(branch):
            deleted.append(branch)
            refs.pop(branch, None)
            return True
        output = io.StringIO()
        with (mock.patch.dict(os.environ, {"CLEANUP_MODE": mode}),
              mock.patch.object(cleanup, "get_ref", side_effect=get_ref),
              mock.patch.object(cleanup, "delete_ref", side_effect=delete_ref),
              mock.patch.object(cleanup, "ahead", return_value=0),
              mock.patch.object(cleanup, "api", return_value=[]),
              contextlib.redirect_stdout(output)):
            cleanup.main()
        return deleted, output.getvalue()

    def test_repeated_batch_is_successful_noop(self):
        deleted, output = self.execute({})
        self.assertEqual(deleted, [])
        self.assertEqual(output.count("ALREADY DELETED"), 6)
        self.assertIn("COMPLETE: 0 deleted; 6 already deleted", output)

    def test_mixed_existing_and_missing(self):
        names = list(cleanup.CANDIDATES)
        refs = {names[0]: cleanup.CANDIDATES[names[0]]}
        deleted, output = self.execute(refs)
        self.assertEqual(deleted, [names[0]])
        self.assertIn("COMPLETE: 1 deleted; 5 already deleted", output)

    def test_preview_never_deletes(self):
        refs = dict(cleanup.CANDIDATES)
        deleted, output = self.execute(refs, mode="preview")
        self.assertEqual(deleted, [])
        self.assertIn("PREVIEW ONLY", output)

    def test_sha_drift_stops_all_deletions(self):
        refs = dict(cleanup.CANDIDATES)
        refs[next(iter(refs))] = "0" * 40
        with self.assertRaises(SystemExit) as caught:
            self.execute(refs)
        self.assertIn("changed", str(caught.exception))

    def test_get_ref_only_swallows_404_when_requested(self):
        def raise_http(code):
            raise HTTPError("https://example.invalid", code, "error", {}, None)
        with mock.patch.object(cleanup, "api", side_effect=lambda *_: raise_http(404)):
            self.assertIsNone(cleanup.get_ref("missing", allow_missing=True))
            with self.assertRaises(HTTPError):
                cleanup.get_ref("missing")
        with mock.patch.object(cleanup, "api", side_effect=lambda *_: raise_http(403)):
            with self.assertRaises(HTTPError):
                cleanup.get_ref("missing", allow_missing=True)


if __name__ == "__main__":
    main()
