#!/usr/bin/env python3
"""Preserve exact previous Constitution pairs; never regenerate historical bytes."""
import argparse
import base64
from contextlib import contextmanager
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile

JSON_PATH = "constitution_data.json"
MD_PATH = "docs/constitution-current.md"
RENDERER = "scripts/build-constitution-md.py"
ARCHIVE = "docs/archive/constitution"
POLICY = f"{ARCHIVE}/policy.json"
STEM = re.compile(r"Constitution-\d{6}(?:-\d{2,})?$")
ROOT = Path(__file__).resolve().parent.parent


def git(root, *args):
    result = subprocess.run(["git", *args], cwd=root, stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE, check=False)
    if result.returncode:
        raise ValueError(result.stderr.decode(errors="replace").strip())
    return result.stdout


def commit(root, ref):
    return git(root, "rev-parse", "--verify", "--end-of-options", f"{ref}^{{commit}}").decode().strip()


def safe_path(root, relative):
    root = Path(root).absolute()
    path = root / relative
    if Path(relative).is_absolute() or ".." in Path(relative).parts:
        raise ValueError("Unsafe archive path")
    for parent in [path, *path.parents]:
        if parent.is_symlink():
            raise ValueError(f"Symlink refused: {parent}")
    return path


def render_with_code(source, code):
    namespace = {"__name__": "constitution_renderer", "__file__": RENDERER}
    exec(compile(code, RENDERER, "exec"), namespace)
    data = json.loads(source)
    if not isinstance(data, list) or not data:
        raise ValueError("Constitution must be a nonempty article array")
    return namespace["render"](data).encode("utf-8")


def render(root, source, ref=None):
    code = git(root, "show", f"{ref}:{RENDERER}") if ref else safe_path(root, RENDERER).read_bytes()
    return render_with_code(source, code)


def pair(root, ref=None):
    if ref:
        return tuple(git(root, "show", f"{ref}:{p}") for p in (JSON_PATH, MD_PATH))
    return tuple(safe_path(root, p).read_bytes() for p in (JSON_PATH, MD_PATH))


def validate_pair(root, contents, ref=None):
    if render(root, contents[0], ref) != contents[1]:
        raise ValueError(f"Constitution JSON/Markdown pair is out of sync ({ref or 'working tree'})")


def digest(data):
    return hashlib.sha256(data).hexdigest()


def inventory(root, ref=None):
    if ref:
        paths = git(root, "ls-tree", "-r", "--name-only", ref, "--", ARCHIVE).decode().splitlines()
        return {p: git(root, "show", f"{ref}:{p}") for p in paths}
    directory = safe_path(root, ARCHIVE)
    if not directory.exists():
        return {}
    return {p.relative_to(root).as_posix(): safe_path(root, p.relative_to(root)).read_bytes()
            for p in directory.rglob("*") if p.is_file()}


LEGACY_DUPLICATE_NAMES = frozenset(["Constitution-261014 2.json","Constitution-261014 2.md","Constitution-261014.archive 2.json","Constitution-261015 2.json","Constitution-261015 2.md","Constitution-261015-01 2.json","Constitution-261015-01 2.md","Constitution-261015-01.archive 2.json","Constitution-261015.archive 2.json","Constitution-261016 2.json","Constitution-261016 2.md","Constitution-261016 3.json","Constitution-261016 3.md","Constitution-261016-01 2.json","Constitution-261016-01 2.md","Constitution-261016-01.archive 2.json","Constitution-261016-02 2.json","Constitution-261016-02 2.md","Constitution-261016-02.archive 2.json","Constitution-261016-03 2.json","Constitution-261016-03 2.md","Constitution-261016-03.archive 2.json","Constitution-261016-04 2.json","Constitution-261016-04 2.md","Constitution-261016-04.archive 2.json","Constitution-261016-05 2.json","Constitution-261016-05 2.md","Constitution-261016-05.archive 2.json","Constitution-261016-06 2.json","Constitution-261016-06 2.md","Constitution-261016-06.archive 2.json","Constitution-261016-07 2.json","Constitution-261016-07 2.md","Constitution-261016-07 3.json","Constitution-261016-07 3.md","Constitution-261016-07.archive 2.json","Constitution-261016-07.archive 3.json","Constitution-261016-08 2.json","Constitution-261016-08 2.md","Constitution-261016-08 3.json","Constitution-261016-08 3.md","Constitution-261016-08.archive 2.json","Constitution-261016-08.archive 3.json","Constitution-261016-09 2.json","Constitution-261016-09 2.md","Constitution-261016-09 3.json","Constitution-261016-09 3.md","Constitution-261016-09.archive 2.json","Constitution-261016-09.archive 3.json","Constitution-261016-10 2.json","Constitution-261016-10 2.md","Constitution-261016-10 3.json","Constitution-261016-10 3.md","Constitution-261016-10.archive 2.json","Constitution-261016-10.archive 3.json","Constitution-261016-11 2.json","Constitution-261016-11 2.md","Constitution-261016-11 3.json","Constitution-261016-11 3.md","Constitution-261016-11.archive 2.json","Constitution-261016-11.archive 3.json","Constitution-261016-12 2.json","Constitution-261016-12 2.md","Constitution-261016-12 3.json","Constitution-261016-12 3.md","Constitution-261016-12.archive 2.json","Constitution-261016-12.archive 3.json","Constitution-261016-13 2.json","Constitution-261016-13 2.md","Constitution-261016-13 3.json","Constitution-261016-13 3.md","Constitution-261016-13.archive 2.json","Constitution-261016-13.archive 3.json","Constitution-261016-14 2.json","Constitution-261016-14 2.md","Constitution-261016-14 3.json","Constitution-261016-14 3.md","Constitution-261016-14.archive 2.json","Constitution-261016-14.archive 3.json","Constitution-261016-15 2.json","Constitution-261016-15 2.md","Constitution-261016-15 3.json","Constitution-261016-15 3.md","Constitution-261016-15.archive 2.json","Constitution-261016-15.archive 3.json","Constitution-261016-16 2.json","Constitution-261016-16 2.md","Constitution-261016-16 3.json","Constitution-261016-16 3.md","Constitution-261016-16.archive 2.json","Constitution-261016-16.archive 3.json","Constitution-261016-17 2.json","Constitution-261016-17 2.md","Constitution-261016-17 3.json","Constitution-261016-17 3.md","Constitution-261016-17.archive 2.json","Constitution-261016-17.archive 3.json","Constitution-261016-18 2.json","Constitution-261016-18 2.md","Constitution-261016-18 3.json","Constitution-261016-18 3.md","Constitution-261016-18.archive 2.json","Constitution-261016-18.archive 3.json","Constitution-261016-19 2.json","Constitution-261016-19 2.md","Constitution-261016-19 3.json","Constitution-261016-19.archive 2.json","Constitution-261016-19.archive 3.json","Constitution-261016-20 2.json","Constitution-261016-20 2.md","Constitution-261016-20 3.json","Constitution-261016-20 3.md","Constitution-261016-20.archive 2.json","Constitution-261016-20.archive 3.json","Constitution-261016-21 2.json","Constitution-261016-21 2.md","Constitution-261016-21 3.json","Constitution-261016-21 3.md","Constitution-261016-21.archive 2.json","Constitution-261016-21.archive 3.json","Constitution-261016.archive 2.json","Constitution-261016.archive 3.json","Constitution-261017 2.json","Constitution-261017 2.md","Constitution-261017 3.json","Constitution-261017 3.md","Constitution-261017.archive 2.json","Constitution-261017.archive 3.json"])

def validate_inventory(files):
    stems = set()
    for name in files:
        basename = Path(name).name
        if name in (f"{ARCHIVE}/README.md", POLICY):
            continue
        if basename in LEGACY_DUPLICATE_NAMES:
            original = f"{ARCHIVE}/{basename.replace(' 2.', '.').replace(' 3.', '.')}"
            if original not in files or files[name] != files[original]:
                raise ValueError(f"Legacy duplicate archive differs from canonical: {name}")
            continue
        suffix = next((s for s in (".archive.json", ".json", ".md") if basename.endswith(s)), None)
        stem = basename[:-len(suffix)] if suffix else ""
        if not STEM.fullmatch(stem) or name != f"{ARCHIVE}/{stem}{suffix}":
            raise ValueError(f"Unexpected archive file: {name}")
        stems.add(stem)
    records = []
    for stem in sorted(stems):
        prefix = f"{ARCHIVE}/{stem}"
        required = [prefix + s for s in (".json", ".md", ".archive.json")]
        if any(p not in files for p in required):
            raise ValueError(f"Incomplete Constitution archive pair: {stem}")
        metadata = json.loads(files[required[2]])
        if (metadata.get("schema_version") != 1 or metadata.get("stem") != stem or
                metadata.get("json_sha256") != digest(files[required[0]]) or
                metadata.get("markdown_sha256") != digest(files[required[1]]) or
                metadata.get("source_paths") != [JSON_PATH, MD_PATH] or
                not re.fullmatch(r"[a-f0-9]{40}", metadata.get("renderer_commit", "")) or
                metadata.get("renderer_sha256") != digest(metadata.get("renderer_source", "").encode())):
            raise ValueError(f"Constitution archive verification failed: {stem}")
        json.loads(files[required[0]])
        records.append((stem, metadata, (files[required[0]], files[required[1]])))
    return records


def unchanged_archives(before, after):
    for name, contents in before.items():
        if name != f"{ARCHIVE}/README.md" and after.get(name) != contents:
            raise ValueError(f"Existing archive modified or deleted: {name}")


def timestamp(value=None):
    now = datetime.fromisoformat(value.replace("Z", "+00:00")) if value else datetime.now(timezone.utc)
    if now.tzinfo is None:
        raise ValueError("Archive timestamp must include a timezone")
    return now.astimezone(timezone.utc)


def plan_pair(root, contents, now=None, source_commit=None):
    moment = timestamp(now)
    files = inventory(root)
    records = validate_inventory(files)
    # Exact bytes, rather than JSON equality, also preserve formatting-only changes.
    for stem, metadata, saved in records:
        if saved == contents:
            return {"stem": stem, "reused": True, "metadata": metadata}
    date = moment.strftime("%y%m%d")
    occupied = {Path(p).name.lower() for p in files}
    stem, number = f"Constitution-{date}", 1
    while any(f"{stem}{suffix}".lower() in occupied for suffix in (".json", ".md", ".archive.json")):
        stem = f"Constitution-{date}-{number:02d}"
        number += 1
    renderer_commit = source_commit or commit(root, "HEAD")
    validate_pair(root, contents, renderer_commit)
    renderer_source = git(root, "show", f"{renderer_commit}:{RENDERER}")
    return {"stem": stem, "reused": False, "metadata": {
        "schema_version": 1, "stem": stem, "source_commit": source_commit,
        "renderer_commit": renderer_commit,
        # Squash/rebase merges can discard proposal commit objects. Freeze the
        # renderer too, so old pairs remain verifiable after branches are deleted.
        "renderer_source": renderer_source.decode("utf-8"),
        "renderer_sha256": digest(renderer_source),
        "superseded_at": moment.isoformat(),
        "json_sha256": digest(contents[0]), "markdown_sha256": digest(contents[1]),
        "source_paths": [JSON_PATH, MD_PATH],
    }}


def archive_paths(root, plan):
    return [safe_path(root, f"{ARCHIVE}/{plan['stem']}{s}")
            for s in (".json", ".md", ".archive.json")]


@contextmanager
def locked(root):
    lock = safe_path(root, ".constitution-archive.lock")
    try:
        lock.mkdir()
    except FileExistsError:
        raise ValueError("Another Constitution operation holds .constitution-archive.lock; inspect it before retrying")
    try:
        yield
    finally:
        lock.rmdir()


def write_pair(root, contents, plan):
    if (not STEM.fullmatch(plan["stem"]) or plan["metadata"].get("stem") != plan["stem"] or
            plan["metadata"].get("json_sha256") != digest(contents[0]) or
            plan["metadata"].get("markdown_sha256") != digest(contents[1])):
        raise ValueError("Planned archive does not match previous Constitution pair")
    if render_with_code(contents[0], plan["metadata"]["renderer_source"].encode()) != contents[1]:
        raise ValueError("Planned archived JSON/Markdown pair is out of sync")
    paths = archive_paths(root, plan)
    if plan["reused"]:
        records = validate_inventory(inventory(root))
        if not any(stem == plan["stem"] and saved == contents for stem, _, saved in records):
            raise ValueError("Planned archive changed; preview again")
        return paths
    safe_path(root, ARCHIVE).mkdir(parents=True, exist_ok=True)
    if any(p.exists() for p in paths):
        raise ValueError("Constitution snapshot destination appeared; preview again")
    created = []
    payloads = (*contents, (json.dumps(plan["metadata"], indent=2) + "\n").encode())
    try:
        for path, data in zip(paths, payloads):
            with path.open("xb") as output:
                created.append(path)
                output.write(data)
                output.flush()
                os.fsync(output.fileno())
            if path.read_bytes() != data:
                raise ValueError("Constitution snapshot verification failed")
    except BaseException:
        # Remove only files exclusively created by this attempt. Current files remain untouched.
        for path in created:
            path.unlink()
        raise
    return paths


def atomic_write(path, contents):
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(dir=path.parent, prefix=".constitution-", delete=False) as output:
            temporary = Path(output.name)
            output.write(contents)
            output.flush()
            os.fsync(output.fileno())
        os.chmod(temporary, 0o644)
        os.replace(temporary, path)
    finally:
        if temporary and temporary.exists():
            temporary.unlink()


def previous_plan(root, incoming, now=None, base="HEAD"):
    ref = commit(root, base)
    previous = pair(root, ref)
    validate_pair(root, previous, ref)
    if incoming == previous:
        return None
    return previous, plan_pair(root, previous, now, ref)


def prepare(root, now=None, base="HEAD"):
    with locked(root):
        source = safe_path(root, JSON_PATH).read_bytes()
        planned = previous_plan(root, (source, render(root, source)), now, base)
        return write_pair(root, *planned) if planned else []


def publish_markdown(root, source, markdown):
    # Direct generator invocations use the same guard as npm run sync.
    with locked(root):
        if safe_path(root, JSON_PATH).read_bytes() != source:
            raise ValueError("Canonical Constitution changed during generation; retry")
        planned = previous_plan(root, (source, markdown))
        if planned:
            write_pair(root, *planned)
        atomic_write(safe_path(root, MD_PATH), markdown)


def plan_import(root, now=None):
    previous = pair(root)
    validate_pair(root, previous)
    source_commit = None
    ref = commit(root, "HEAD")
    if pair(root, ref) == previous:
        source_commit = ref
    plan = plan_pair(root, previous, now, source_commit)
    return {**plan, "snapshot": str(archive_paths(root, plan)[1]),
            "jsonSnapshot": str(archive_paths(root, plan)[0])}


def replace_import(root, request):
    previous = tuple(base64.b64decode(request[p], validate=True) for p in ("canonical", "markdown"))
    incoming = base64.b64decode(request["incoming"], validate=True)
    generated = render(root, incoming)
    with locked(root):
        if pair(root) != previous:
            raise ValueError("Canonical or generated Constitution changed; preview again")
        validate_pair(root, previous)
        paths = write_pair(root, previous, request["plan"])
        if pair(root) != previous:
            raise ValueError("Constitution changed during preservation; preview again")
        # Both current files are generated before either is installed. Git publishes
        # them together; rollback covers ordinary filesystem failures between renames.
        try:
            atomic_write(safe_path(root, JSON_PATH), incoming)
            atomic_write(safe_path(root, MD_PATH), generated)
        except BaseException:
            for name, contents in zip((JSON_PATH, MD_PATH), previous):
                atomic_write(safe_path(root, name), contents)
            raise
        return [str(p) for p in paths[:2]]


def check(root, base=None, head=None, worktree=False):
    destination = None if worktree else commit(root, head or "HEAD")
    current = pair(root, destination)
    validate_pair(root, current, destination)
    files = inventory(root, destination)
    records = validate_inventory(files)
    verify_records(records)
    if base:
        source = commit(root, base)
        before = pair(root, source)
        unchanged_archives(inventory(root, source), files)
        if before != current:
            # A prior commit may have changed only canonical JSON, leaving invalid
            # derived Markdown. A repair that leaves canonical JSON unchanged and
            # restores its exact rendered Markdown does not supersede a valid pair:
            # the broken JSON/Markdown combination must never be archived.
            if before[0] == current[0]:
                try:
                    validate_pair(root, before, source)
                except ValueError:
                    return
            else:
                validate_pair(root, before, source)
            if not any(saved == before for _, _, saved in records):
                raise ValueError("Unarchived Constitution replacement: run npm run sync and commit both previous archive files and their metadata")


def verify_records(records):
    for stem, metadata, saved in records:
        if render_with_code(saved[0], metadata["renderer_source"].encode()) != saved[1]:
            raise ValueError(f"Archived Constitution pair is out of sync: {stem}")


LEGACY_ALIAS_RESTORATION = (
    "47e9f9fdba9f79663c500cd5898d10f8ca85890c",
    "2d786132cff15205d36e370e03ed05f92221b91e",
)
LEGACY_UNSYNCHRONIZED_REVISIONS = {
    "e309c3bb667f153d71dd4c184fc73652f1d08f33":
        "f9b93b4f4b308c6810b9cc6045c8d9d820818a07",
}
# Exact already-published mismatches preserved before their synchronized
# successor is published. No particular future repair commit is invented.
LEGACY_RAW_SOURCE_REVISIONS = frozenset({
    "59beca5349754b131373d562ac77f447d60d654f",
})
EXCEPTION_SOURCES = "docs/archive/constitution-exceptions"


def restored_legacy_alias(root, previous_ref, ref, head, chain, name):
    """Recognize only the documented, byte-exact 2026-10-18 restoration.

    This does not permit a future deletion, even of the same alias. Both fixed
    commits must be on the audited first-parent chain, and the canonical blob
    must agree with the alias before deletion, on restoration and at the head.
    The ordinary before/after immutability check remains unconditional.
    """
    removed, restored = LEGACY_ALIAS_RESTORATION
    basename = Path(name).name
    if (ref != removed or basename not in LEGACY_DUPLICATE_NAMES or
            name != f"{ARCHIVE}/{basename}" or restored not in chain or
            chain.index(restored) >= chain.index(removed)):
        return False
    canonical = f"{ARCHIVE}/{basename.replace(' 2.', '.').replace(' 3.', '.')}"
    objects = git(root, "rev-parse", f"{previous_ref}:{name}",
                  f"{previous_ref}:{canonical}", f"{ref}:{canonical}",
                  f"{restored}:{name}", f"{restored}:{canonical}",
                  f"{head}:{name}", f"{head}:{canonical}").decode().splitlines()
    return len(objects) == 7 and len(set(objects)) == 1


def recovery_pair_is_verified(root, contents, ref, chain, evidence_ref=None):
    """Preserve explicitly reviewed broken historical editions as raw source."""
    try:
        validate_pair(root, contents, ref)
        return True
    except ValueError:
        repaired = LEGACY_UNSYNCHRONIZED_REVISIONS.get(ref)
        if (ref not in LEGACY_RAW_SOURCE_REVISIONS and
                (not repaired or repaired not in chain or
                 chain.index(repaired) >= chain.index(ref))):
            raise
    prefix = f"{EXCEPTION_SOURCES}/source-{ref}"
    def evidence(path):
        return git(root, "show", f"{evidence_ref}:{path}") if evidence_ref else safe_path(root, path).read_bytes()
    raw = tuple(evidence(prefix + suffix) for suffix in (".json", ".md"))
    note = json.loads(evidence(prefix + ".provenance.json"))
    if (raw != contents or note.get("previous_commit") != ref or
            note.get("superseding_commit") != repaired or
            note.get("status") != "unverified_historical_source" or
            note.get("verified_pair") is not False or
            note.get("source_paths") != [JSON_PATH, MD_PATH] or
            note.get("previous_json_sha256") != digest(raw[0]) or
            note.get("previous_markdown_sha256") != digest(raw[1])):
        raise ValueError(f"Historical exception source verification failed: {ref}")
    return False


def recovery_requirements(root, base, head="HEAD", evidence_ref=None):
    base, head = commit(root, base), commit(root, head)
    chain = git(root, "rev-list", "--first-parent", head).decode().splitlines()
    if base not in chain:
        raise ValueError("Archive baseline is not on main's first-parent history; manual recovery required")
    changes = list(reversed(chain[:chain.index(base)]))
    validate_pair(root, pair(root, head), head)
    required, previous_ref = [], base
    for ref in changes:
        # Compare paths/object changes, rather than loading every old snapshot
        # at every commit. The archive can grow without quadratic history reads.
        altered = git(root, "diff", "--name-only", "-z", "--no-renames", "--diff-filter=MD",
                      previous_ref, ref, "--", ARCHIVE).decode().split("\0")
        for name in altered:
            if name and name != f"{ARCHIVE}/README.md":
                if restored_legacy_alias(root, previous_ref, ref, head, chain, name):
                    continue
                raise ValueError(f"Existing archive modified or deleted: {name}")
        changed = git(root, "diff", "--name-only", previous_ref, ref, "--", JSON_PATH, MD_PATH)
        if changed:
            previous, current = pair(root, previous_ref), pair(root, ref)
            previous_verified = recovery_pair_is_verified(root, previous, previous_ref, chain, evidence_ref)
            recovery_pair_is_verified(root, current, ref, chain, evidence_ref)
            when = git(root, "show", "-s", "--format=%cI", ref).decode().strip()
            if previous_verified:
                required.append((previous, when, previous_ref))
        previous_ref = ref
    return required


def check_recovery(root, base, head="HEAD"):
    """Check the entire recovery plan against committed evidence without writes."""
    head = commit(root, head)
    required = recovery_requirements(root, base, head, evidence_ref=head)
    records = validate_inventory(inventory(root, head))
    verify_records(records)
    for contents, _, ref in required:
        if not any(saved == contents for _, _, saved in records):
            raise ValueError(f"Unarchived historical Constitution pair: {ref}; run reviewed recovery and commit its outputs")


def reconcile(root, base, head="HEAD"):
    required = recovery_requirements(root, base, head)
    saved = []
    with locked(root):
        verify_records(validate_inventory(inventory(root)))
        for contents, when, ref in required:
            plan = plan_pair(root, contents, when, ref)
            paths = write_pair(root, contents, plan)
            if not plan["reused"]:
                saved.extend(paths)
        verify_records(validate_inventory(inventory(root)))
    return saved


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["prepare", "check", "check-current", "reconcile", "plan-import", "replace-import"])
    parser.add_argument("--base")
    parser.add_argument("--head", default="HEAD")
    parser.add_argument("--date", help="ISO timestamp including timezone (normally automatic UTC)")
    args = parser.parse_args()
    if args.command == "plan-import":
        print(json.dumps(plan_import(ROOT, args.date)))
    elif args.command == "replace-import":
        print(json.dumps(replace_import(ROOT, json.load(sys.stdin))))
    elif args.command == "prepare":
        paths = prepare(ROOT, args.date, args.base or "HEAD")
        print(f"Constitution archive: preserved/verified {len(paths) // 3} previous pair(s)")
    elif args.command == "reconcile":
        baseline = args.base or json.loads(safe_path(ROOT, POLICY).read_bytes())["baseline_commit"]
        paths = reconcile(ROOT, baseline, args.head)
        print(f"Constitution archive: recovered {len(paths) // 3} previous pair(s)")
    else:
        check(ROOT, args.base, args.head, args.command == "check-current")
        if args.command == "check":
            destination = commit(ROOT, args.head)
            baseline = json.loads(git(ROOT, "show", f"{destination}:{POLICY}"))["baseline_commit"]
            check_recovery(ROOT, baseline, args.head)
            print("Full first-parent recovery verified against committed evidence without writes")
        print("Constitution archive check passed")


if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError, KeyError, TypeError) as error:
        print(f"Constitution archive stopped: {error}", file=sys.stderr)
        sys.exit(1)
