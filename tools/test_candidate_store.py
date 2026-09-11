"""Storage failures and real process concurrency; temporary files only."""
import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import candidate_store as store


class CandidateStoreTests(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        self.path = Path(directory.name) / "candidate-updates.json"
        self.path.write_bytes(b'{"candidates": [], "review": "original"}\r\n')
        self.data, self.revision = store.read_snapshot(self.path)

    def assert_unlocked(self):
        with store.candidate_lock(self.path):
            pass

    def test_snapshot_conflict_and_missing_file_creation(self):
        store.save(self.path, {"review": "new"}, self.revision)
        before = self.path.read_bytes()
        with self.assertRaises(store.CandidateConflict):
            store.save(self.path, self.data, self.revision)
        self.assertEqual(before, self.path.read_bytes())
        other = self.path.with_name("new.json")
        data, revision = store.read_snapshot(other, {"candidates": []})
        self.assertIsNone(revision)
        store.save(other, data, revision)
        with self.assertRaises(store.CandidateConflict):
            store.save(other, {"stale": True}, revision)

    def test_replace_and_flush_failure_preserve_json_cleanup_and_release(self):
        before = self.path.read_bytes()
        for operation in ("replace", "fsync"):
            with self.subTest(operation=operation):
                with patch.object(store.os, operation, side_effect=OSError("injected failure")):
                    with self.assertRaises(OSError):
                        store.save(self.path, {"review": "new"}, self.revision)
                self.assertEqual(before, self.path.read_bytes())
                self.assertEqual(self.data, json.loads(self.path.read_bytes()))
                self.assertEqual([], list(self.path.parent.glob(".candidate-updates.json.*")))
                self.assert_unlocked()
        store.save(self.path, {"review": "recovered"}, self.revision)

    def test_exception_releases_lock_and_same_process_competitor_is_refused(self):
        with self.assertRaisesRegex(RuntimeError, "injected"):
            with store.candidate_lock(self.path):
                with self.assertRaises(store.CandidateConflict):
                    store.save(self.path, self.data, self.revision)
                raise RuntimeError("injected")
        self.assert_unlocked()
        store.save(self.path, {"review": "recovered"}, self.revision)

    def child(self, program, *args):
        child = subprocess.Popen(
            [sys.executable, "-B", "-c", program, str(self.path), *args],
            cwd=Path(store.__file__).parent, stdin=subprocess.PIPE,
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
            encoding="utf-8", env={**os.environ, "PYTHONIOENCODING": "utf-8"},
        )
        def cleanup():
            if child.poll() is None:
                child.kill()
            child.communicate(timeout=10)
        self.addCleanup(cleanup)
        return child

    def test_process_death_releases_lock_and_stale_file_is_reusable(self):
        program = """
import sys
from pathlib import Path
import candidate_store as store
with store.candidate_lock(Path(sys.argv[1])):
    print('ready', flush=True)
    sys.stdin.readline()
"""
        child = self.child(program)
        self.assertEqual("ready", child.stdout.readline().strip())
        with self.assertRaises(store.CandidateConflict):
            store.save(self.path, self.data, self.revision)
        # Unlocked readers and unrelated candidate paths remain usable.
        self.assertEqual(self.data, store.read_snapshot(self.path)[0])
        store.save(self.path.with_name("unrelated.json"), {"ok": True}, None)
        child.kill()
        child.communicate(timeout=10)
        self.assertTrue(self.path.with_suffix(".review.lock").exists())
        store.save(self.path, {"review": "after crash"}, self.revision)

    def test_two_process_writers_with_one_snapshot_have_exactly_one_winner(self):
        program = """
import sys
from pathlib import Path
import candidate_store as store
path = Path(sys.argv[1])
data, revision = store.read_snapshot(path)
print('ready', flush=True)
sys.stdin.readline()
try:
    store.save(path, {'winner': sys.argv[2]}, revision)
    print('saved', flush=True)
except store.CandidateConflict:
    print('conflict', flush=True)
"""
        children = [self.child(program, name) for name in ("A", "B")]
        for child in children:
            self.assertEqual("ready", child.stdout.readline().strip())
        for child in children:
            child.stdin.write("go\n")
            child.stdin.flush()
        results = []
        for child in children:
            stdout, stderr = child.communicate(timeout=10)
            self.assertEqual(0, child.returncode, stderr)
            results.append(stdout.strip())
        self.assertCountEqual(["saved", "conflict"], results)
        self.assertEqual(("A", "B")[results.index("saved")], json.loads(self.path.read_bytes())["winner"])
        self.assert_unlocked()


if __name__ == "__main__":
    unittest.main(verbosity=2)
