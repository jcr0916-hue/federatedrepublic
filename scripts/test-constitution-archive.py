#!/usr/bin/env python3
"""Exercise real Git history and filesystem failures without touching this repo."""
import base64
import importlib.util
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

SCRIPTS = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("constitution_archive", SCRIPTS / "constitution-archive.py")
archive = importlib.util.module_from_spec(spec)
spec.loader.exec_module(archive)
DATE = "2026-10-12T12:00:00+00:00"


class ConstitutionArchiveTest(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix="constitution-archive-")
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name).resolve()
        (self.root / "scripts").mkdir()
        (self.root / "docs").mkdir()
        for name in ("build-constitution-md.py", "constitution-archive.py"):
            shutil.copyfile(SCRIPTS / name, self.root / "scripts" / name)
        archive.git(self.root, "init", "-q")
        archive.git(self.root, "config", "user.name", "Archival test")
        archive.git(self.root, "config", "user.email", "archival-test@example.invalid")
        self.set_pair("First constitutional text.")
        self.old = archive.pair(self.root)
        self.base = self.commit()

    def commit(self):
        archive.git(self.root, "add", ".")
        env = {**os.environ, "GIT_AUTHOR_DATE": DATE, "GIT_COMMITTER_DATE": DATE}
        subprocess.run(["git", "commit", "-qm", "Test revision"], cwd=self.root, env=env, check=True)
        return archive.commit(self.root, "HEAD")

    def source(self, text):
        return (json.dumps([{"heading": "Article I", "provisions": [
            {"num": "§1.1", "name": "First provision", "text": text}]}], indent=2) + "\n").encode()

    def set_pair(self, text):
        source = self.source(text)
        (self.root / archive.JSON_PATH).write_bytes(source)
        (self.root / archive.MD_PATH).write_bytes(archive.render(self.root, source))

    def generator(self):
        return subprocess.run([sys.executable, "-B", "scripts/build-constitution-md.py",
                               archive.JSON_PATH, archive.MD_PATH], cwd=self.root,
                              stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)

    def records(self):
        return archive.validate_inventory(archive.inventory(self.root))

    def request(self, incoming=None):
        return {"plan": archive.plan_import(self.root, DATE),
                "canonical": base64.b64encode(self.old[0]).decode(),
                "markdown": base64.b64encode(self.old[1]).decode(),
                "incoming": base64.b64encode(incoming or self.source("Second text.")).decode()}

    def test_no_change_creates_no_archive(self):
        self.assertEqual(archive.prepare(self.root, DATE), [])
        self.generator()
        self.assertEqual(self.records(), [])
        self.assertEqual(archive.pair(self.root), self.old)

    def test_sync_preserves_previous_exact_bytes_and_is_idempotent(self):
        (self.root / archive.JSON_PATH).write_bytes(self.source("Second text."))
        paths = archive.prepare(self.root, DATE)
        self.assertEqual([p.suffix for p in paths[:2]], [".json", ".md"])
        self.assertEqual(self.records()[0][2], self.old)
        self.assertEqual((self.root / archive.MD_PATH).read_bytes(), self.old[1])
        self.generator()
        before = archive.inventory(self.root)
        archive.prepare(self.root, "2026-10-13T12:00:00Z")
        self.assertEqual(archive.inventory(self.root), before)
        archive.check(self.root, self.base, worktree=True)

    def test_direct_generator_cannot_bypass_preservation(self):
        (self.root / archive.JSON_PATH).write_bytes(self.source("Direct generator revision."))
        self.generator()
        self.assertEqual(self.records()[0][2], self.old)
        archive.check(self.root, self.base, worktree=True)

    def test_same_day_multiple_revisions_share_stems_without_overwrites(self):
        (self.root / archive.JSON_PATH).write_bytes(self.source("Second text."))
        archive.prepare(self.root, DATE)
        self.generator()
        self.commit()
        second = archive.pair(self.root)
        previous_files = archive.inventory(self.root)
        (self.root / archive.JSON_PATH).write_bytes(self.source("Third text."))
        archive.prepare(self.root, DATE)
        self.generator()
        records = self.records()
        self.assertEqual([r[0] for r in records], ["Constitution-261012", "Constitution-261012-01"])
        self.assertEqual([r[2] for r in records], [self.old, second])
        archive.unchanged_archives(previous_files, archive.inventory(self.root))

    def test_json_formatting_only_change_still_preserves_both(self):
        (self.root / archive.JSON_PATH).write_bytes(json.dumps(json.loads(self.old[0])).encode())
        self.generator()
        self.assertEqual(archive.pair(self.root)[1], self.old[1])
        self.assertEqual(self.records()[0][2], self.old)
        archive.check(self.root, self.base, worktree=True)

    def test_renderer_change_preserves_the_original_markdown(self):
        renderer = self.root / archive.RENDERER
        renderer.write_text(renderer.read_text().replace("# The Federated Republic — Constitution", "# Constitution"))
        self.generator()
        self.assertEqual(self.records()[0][2], self.old)
        self.assertNotEqual(archive.pair(self.root)[1], self.old[1])
        archive.check(self.root, self.base, worktree=True)
        self.commit()
        archive.check(self.root, self.base)

    def test_unarchived_replacement_is_rejected_even_if_current_pair_matches(self):
        self.set_pair("Unarchived revision.")
        self.commit()
        with self.assertRaisesRegex(ValueError, "Unarchived"):
            archive.check(self.root, self.base)

    def test_untracked_archives_do_not_make_a_committed_revision_pass(self):
        self.set_pair("Unarchived revision.")
        self.commit()
        archive.reconcile(self.root, self.base)
        with self.assertRaisesRegex(ValueError, "Unarchived"):
            archive.check(self.root, self.base)
        self.commit()
        archive.check(self.root, self.base)

    def test_squashed_and_deleted_proposal_commits_do_not_break_archival_verification(self):
        (self.root / archive.JSON_PATH).write_bytes(self.source("Second text."))
        self.generator()
        proposal = self.commit()
        (self.root / archive.JSON_PATH).write_bytes(self.source("Third text."))
        self.generator()
        self.commit()
        archive.git(self.root, "reset", "--soft", self.base)
        self.commit()
        archive.git(self.root, "reflog", "expire", "--expire=now", "--all")
        archive.git(self.root, "gc", "--prune=now")
        with self.assertRaises(ValueError):
            archive.git(self.root, "cat-file", "-e", proposal)
        archive.check(self.root, self.base)

    def test_mismatched_current_pair_is_rejected(self):
        (self.root / archive.JSON_PATH).write_bytes(self.source("Missing Markdown revision."))
        with self.assertRaisesRegex(ValueError, "out of sync"):
            archive.check(self.root, self.base, worktree=True)

    def test_missing_archive_half_and_changed_metadata_are_rejected(self):
        archive.replace_import(self.root, self.request())
        files = archive.inventory(self.root)
        json_file = next(p for p in files if p.endswith(".json") and not p.endswith(".archive.json"))
        with self.assertRaisesRegex(ValueError, "Incomplete"):
            archive.validate_inventory({p: v for p, v in files.items() if p != json_file})
        files[json_file] += b"\n"
        with self.assertRaisesRegex(ValueError, "verification failed"):
            archive.validate_inventory(files)

    def test_new_archive_with_consistent_hashes_but_mismatched_text_is_rejected(self):
        plan = archive.plan_pair(self.root, self.old, DATE, self.base)
        wrong = (self.old[0], b"Unrelated Markdown")
        plan["metadata"]["markdown_sha256"] = archive.digest(wrong[1])
        with self.assertRaisesRegex(ValueError, "out of sync"):
            archive.write_pair(self.root, wrong, plan)
        paths = archive.archive_paths(self.root, plan)
        paths[0].parent.mkdir(parents=True)
        for path, contents in zip(paths, (*wrong, json.dumps(plan["metadata"]).encode())):
            path.write_bytes(contents)
        with self.assertRaisesRegex(ValueError, "out of sync"):
            archive.check(self.root, self.base, worktree=True)

    def test_existing_archive_edits_and_deletions_are_rejected(self):
        archive.replace_import(self.root, self.request())
        baseline = self.commit()
        snapshot = next((self.root / archive.ARCHIVE).glob("*.md"))
        snapshot.write_bytes(snapshot.read_bytes() + b"Changed history.")
        with self.assertRaisesRegex(ValueError, "verification failed"):
            archive.check(self.root, baseline, worktree=True)
        snapshot.unlink()
        with self.assertRaisesRegex(ValueError, "Incomplete"):
            archive.check(self.root, baseline, worktree=True)
        with self.assertRaisesRegex(ValueError, "modified or deleted"):
            archive.unchanged_archives(archive.inventory(self.root, baseline), archive.inventory(self.root))

    def test_recovery_catches_every_revision_in_a_batched_push(self):
        self.set_pair("Second text.")
        self.commit()
        second = archive.pair(self.root)
        self.set_pair("Third text.")
        self.commit()
        latest = archive.pair(self.root)
        self.assertEqual(len(archive.reconcile(self.root, self.base)), 6)
        self.assertEqual([r[2] for r in self.records()], [self.old, second])
        self.assertEqual(archive.pair(self.root), latest)
        self.assertEqual(archive.reconcile(self.root, self.base), [])
        self.commit()
        # A later run always scans from the baseline, even if a pending run was canceled.
        self.set_pair("Fourth text.")
        self.commit()
        self.assertEqual(len(archive.reconcile(self.root, self.base)), 3)
        self.assertEqual(len(self.records()), 3)

    def test_recovery_refuses_invalid_intermediate_revisions_before_any_archive_writes(self):
        (self.root / archive.JSON_PATH).write_bytes(self.source("Broken intermediate pair."))
        self.commit()
        self.set_pair("Valid latest pair.")
        self.commit()
        with self.assertRaisesRegex(ValueError, "out of sync"):
            archive.reconcile(self.root, self.base)
        self.assertEqual(self.records(), [])

    def test_recovery_detects_archive_edits_even_when_later_restored(self):
        archive.replace_import(self.root, self.request())
        self.commit()
        snapshot = next((self.root / archive.ARCHIVE).glob("*.md"))
        original = snapshot.read_bytes()
        snapshot.write_bytes(original + b"Changed history")
        self.commit()
        snapshot.write_bytes(original)
        self.commit()
        with self.assertRaisesRegex(ValueError, "modified or deleted"):
            archive.reconcile(self.root, self.base)

    def legacy_alias_history(self):
        plan = archive.plan_pair(self.root, self.old, "2026-10-14T12:00:00Z", self.base)
        archive.write_pair(self.root, self.old, plan)
        canonical = self.root / archive.ARCHIVE / "Constitution-261014.json"
        alias = canonical.with_name("Constitution-261014 2.json")
        alias.write_bytes(canonical.read_bytes())
        before = self.commit()
        alias.unlink()
        removed = self.commit()
        alias.write_bytes(canonical.read_bytes())
        restored = self.commit()
        return alias, before, removed, restored

    def test_known_legacy_restoration_does_not_permit_a_later_deletion(self):
        alias, before, removed, restored = self.legacy_alias_history()
        with self.assertRaisesRegex(ValueError, "modified or deleted"):
            archive.reconcile(self.root, self.base)
        with patch.object(archive, "LEGACY_ALIAS_RESTORATION", (removed, restored)):
            self.assertEqual(archive.reconcile(self.root, self.base), [])
            alias.unlink()
            # The ordinary immutability gate still rejects this same alias.
            with self.assertRaisesRegex(ValueError, "modified or deleted"):
                archive.check(self.root, before, worktree=True)
            self.commit()
            alias.write_bytes(self.old[0])
            self.commit()
            with self.assertRaisesRegex(ValueError, "modified or deleted"):
                archive.reconcile(self.root, self.base)

    def test_known_legacy_restoration_requires_exact_current_and_restored_blobs(self):
        alias, _, removed, restored = self.legacy_alias_history()
        alias.write_bytes(alias.read_bytes() + b"Changed duplicate")
        self.commit()
        with patch.object(archive, "LEGACY_ALIAS_RESTORATION", (removed, restored)):
            with self.assertRaisesRegex(ValueError, "modified or deleted"):
                archive.reconcile(self.root, self.base)

    def test_known_legacy_restoration_requires_the_restoration_in_first_parent_history(self):
        _, _, removed, _ = self.legacy_alias_history()
        with patch.object(archive, "LEGACY_ALIAS_RESTORATION", (removed, "0" * 40)):
            with self.assertRaisesRegex(ValueError, "modified or deleted"):
                archive.reconcile(self.root, self.base)

    def broken_revision_history(self):
        (self.root / archive.JSON_PATH).write_bytes(self.source("Broken historical edition."))
        broken = self.commit()
        raw = archive.pair(self.root, broken)
        self.set_pair("Repaired edition.")
        repaired = self.commit()
        prefix = self.root / archive.EXCEPTION_SOURCES / f"source-{broken}"
        prefix.parent.mkdir(parents=True)
        for suffix, data in zip((".json", ".md"), raw):
            Path(str(prefix) + suffix).write_bytes(data)
        note = {"previous_commit": broken, "superseding_commit": repaired,
                "status": "unverified_historical_source", "verified_pair": False,
                "source_paths": [archive.JSON_PATH, archive.MD_PATH],
                "previous_json_sha256": archive.digest(raw[0]),
                "previous_markdown_sha256": archive.digest(raw[1])}
        Path(str(prefix) + ".provenance.json").write_text(json.dumps(note))
        return broken, repaired, raw, prefix

    def test_known_broken_edition_is_preserved_as_raw_source_never_a_verified_pair(self):
        broken, repaired, raw, _ = self.broken_revision_history()
        with patch.dict(archive.LEGACY_UNSYNCHRONIZED_REVISIONS, {broken: repaired}, clear=True):
            self.assertEqual(len(archive.reconcile(self.root, self.base)), 3)
        self.assertEqual([r[2] for r in self.records()], [self.old])
        self.assertNotIn(raw, [r[2] for r in self.records()])

    def test_known_broken_edition_refuses_tampered_source_before_archive_writes(self):
        broken, repaired, _, prefix = self.broken_revision_history()
        Path(str(prefix) + ".md").write_bytes(b"Invented historical source")
        with patch.dict(archive.LEGACY_UNSYNCHRONIZED_REVISIONS, {broken: repaired}, clear=True):
            with self.assertRaisesRegex(ValueError, "source verification failed"):
                archive.reconcile(self.root, self.base)
        self.assertEqual(self.records(), [])

    def test_known_broken_edition_requires_its_repair_on_the_first_parent_chain(self):
        broken, _, _, _ = self.broken_revision_history()
        with patch.dict(archive.LEGACY_UNSYNCHRONIZED_REVISIONS, {broken: "0" * 40}, clear=True):
            with self.assertRaisesRegex(ValueError, "out of sync"):
                archive.reconcile(self.root, self.base)
        self.assertEqual(self.records(), [])

    def test_recovery_preflight_requires_committed_pairs_and_never_writes(self):
        self.set_pair("Second edition.")
        self.commit()
        before = archive.inventory(self.root)
        with self.assertRaisesRegex(ValueError, "Unarchived historical"):
            archive.check_recovery(self.root, self.base)
        self.assertEqual(archive.inventory(self.root), before)
        archive.reconcile(self.root, self.base)
        # Correct untracked pairs do not satisfy the committed preflight.
        with self.assertRaisesRegex(ValueError, "Unarchived historical"):
            archive.check_recovery(self.root, self.base)
        self.commit()
        archive.check_recovery(self.root, self.base)

    def test_recovery_preflight_requires_committed_raw_exception_evidence(self):
        broken, repaired, _, _ = self.broken_revision_history()
        with patch.dict(archive.LEGACY_UNSYNCHRONIZED_REVISIONS, {broken: repaired}, clear=True):
            with self.assertRaises(ValueError):
                archive.check_recovery(self.root, self.base)
            archive.reconcile(self.root, self.base)
            self.commit()
            archive.check_recovery(self.root, self.base)

    def test_recovery_refuses_rewritten_baseline(self):
        unrelated = "0" * 40
        with self.assertRaises(ValueError):
            archive.reconcile(self.root, unrelated)

    def test_import_preview_is_immutable_and_replacement_installs_a_matched_pair(self):
        request = self.request()
        self.assertFalse((self.root / archive.ARCHIVE).exists())
        paths = archive.replace_import(self.root, request)
        self.assertEqual(len(paths), 2)
        self.assertEqual(self.records()[0][2], self.old)
        archive.validate_pair(self.root, archive.pair(self.root))
        archive.check(self.root, self.base, worktree=True)

    def test_import_refuses_a_stale_preview(self):
        request = self.request()
        (self.root / archive.JSON_PATH).write_bytes(self.old[0] + b"\n")
        with self.assertRaisesRegex(ValueError, "changed"):
            archive.replace_import(self.root, request)
        self.assertEqual(self.records(), [])

    def test_destination_race_never_overwrites_history_or_current_files(self):
        request = self.request()
        paths = archive.archive_paths(self.root, request["plan"])
        paths[0].parent.mkdir(parents=True)
        paths[0].write_bytes(b"Earlier snapshot")
        with self.assertRaisesRegex(ValueError, "appeared"):
            archive.replace_import(self.root, request)
        self.assertEqual(paths[0].read_bytes(), b"Earlier snapshot")
        self.assertEqual(archive.pair(self.root), self.old)
        self.assertFalse(paths[1].exists())

    def test_archive_write_failure_leaves_no_partial_pair_and_no_replacement(self):
        request = self.request()
        with patch.object(archive.os, "fsync", side_effect=OSError("Disk full")):
            with self.assertRaisesRegex(OSError, "Disk full"):
                archive.replace_import(self.root, request)
        self.assertEqual(archive.pair(self.root), self.old)
        self.assertEqual(self.records(), [])

    def test_current_write_failure_rolls_back_both_but_retains_archive(self):
        request = self.request()
        original, calls = archive.atomic_write, []
        def fail_second(path, contents):
            calls.append(path)
            if len(calls) == 2:
                raise OSError("Markdown replacement failed")
            return original(path, contents)
        with patch.object(archive, "atomic_write", side_effect=fail_second):
            with self.assertRaisesRegex(OSError, "replacement failed"):
                archive.replace_import(self.root, request)
        self.assertEqual(archive.pair(self.root), self.old)
        self.assertEqual(self.records()[0][2], self.old)

    def test_concurrent_operations_stop_before_replacement(self):
        request = self.request()
        with archive.locked(self.root):
            with self.assertRaisesRegex(ValueError, "Another Constitution operation"):
                archive.replace_import(self.root, request)
        self.assertEqual(archive.pair(self.root), self.old)

    def test_symlink_archives_are_refused(self):
        directory = self.root / archive.ARCHIVE
        directory.parent.mkdir()
        directory.symlink_to(self.root / "docs", target_is_directory=True)
        with self.assertRaisesRegex(ValueError, "Symlink"):
            archive.plan_import(self.root, DATE)

    def test_import_uses_utc_dates(self):
        plan = archive.plan_import(self.root, "2026-10-12T23:30:00-07:00")
        self.assertEqual(plan["stem"], "Constitution-261013")


if __name__ == "__main__":
    unittest.main(verbosity=2)
