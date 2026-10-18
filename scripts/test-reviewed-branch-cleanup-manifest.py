#!/usr/bin/env python3
"""Reject malformed or out-of-scope manifests before any live cleanup."""
import importlib.util
import json
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest import TestCase, main

spec=importlib.util.spec_from_file_location("manifest_cleanup",Path(__file__).with_name("reviewed-branch-cleanup-manifest.py"))
cleanup=importlib.util.module_from_spec(spec)
spec.loader.exec_module(cleanup)

class ManifestTests(TestCase):
    def setUp(self):
        self.directory=TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.path=Path(self.directory.name)/"manifest.json"
        self.data={"repository":"example/repo","batches":[{"number":13,"branches":[{"name":"done/one","sha":"1"*40}]}]}

    def load(self,number=13,repo="example/repo"):
        self.path.write_text(json.dumps(self.data))
        return cleanup.load_batch(self.path,number,repo)

    def test_exact_batch_selection(self):
        self.assertEqual(self.load(),{"done/one":"1"*40})

    def test_wrong_repository(self):
        with self.assertRaisesRegex(SystemExit,"repository"): self.load(repo="other/repo")

    def test_unknown_batch(self):
        with self.assertRaisesRegex(SystemExit,"exactly one"): self.load(number=99)

    def test_duplicate_branch(self):
        self.data["batches"][0]["branches"]*=2
        with self.assertRaisesRegex(SystemExit,"duplicate"): self.load()

    def test_invalid_sha(self):
        self.data["batches"][0]["branches"][0]["sha"]="main"
        with self.assertRaisesRegex(SystemExit,"Invalid"): self.load()

    def test_oversized_batch(self):
        self.data["batches"][0]["branches"]=[{"name":f"done/{n}","sha":"1"*40} for n in range(21)]
        with self.assertRaisesRegex(SystemExit,"1-20"): self.load()

    def test_duplicate_batch_number(self):
        self.data["batches"]*=2
        with self.assertRaisesRegex(SystemExit,"exactly one"): self.load()

if __name__=="__main__": main()
