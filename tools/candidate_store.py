"""Shared optimistic candidate writes, using a per-file OS lock (stdlib only).

The existing .review.lock pathname is retained, but ownership is an OS byte lock
on Windows / flock on POSIX, not the existence of the file. Never unlink it:
replacing a lock inode could let two writers hold different locks. The OS frees
ownership on close or process death, so an abandoned file needs no stale cleanup.
Readers and preparation do not acquire this lock. Publishers hold it only across
the two-file commit/validation/rollback, to exclude other candidate writers.
"""
from __future__ import annotations

import hashlib
import json
import os
import tempfile
from contextlib import contextmanager
from pathlib import Path
from typing import Any


class CandidateConflict(ValueError):
    """The caller must reload and retry; its snapshot must not be written."""


def fingerprint(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def read_snapshot(path: Path, default: Any = None) -> tuple[Any, str | None]:
    try:
        raw = path.read_bytes()
    except FileNotFoundError:
        if default is None:
            raise
        return default, None
    return json.loads(raw.decode("utf-8")), fingerprint(raw)


def assert_revision(path: Path, expected: str | None) -> None:
    try:
        current = fingerprint(path.read_bytes())
    except FileNotFoundError:
        current = None
    if current != expected:
        raise CandidateConflict("候选文件已被其他操作修改；本轮结果未写入，未覆盖。请重新读取后重试或重新运行。")


@contextmanager
def candidate_lock(path: Path):
    path = path.resolve()
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.with_suffix(".review.lock").open("a+b") as lock:
        lock.seek(0)
        try:
            if os.name == "nt":
                import msvcrt
                # Windows permits locking a byte beyond EOF, including empty files.
                msvcrt.locking(lock.fileno(), msvcrt.LK_NBLCK, 1)
            else:
                import fcntl
                fcntl.flock(lock.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
        except OSError as error:
            raise CandidateConflict("另一个候选操作正在保存；本轮结果未写入。请重新读取后重试。") from error
        try:
            yield
        finally:
            lock.seek(0)
            if os.name == "nt":
                msvcrt.locking(lock.fileno(), msvcrt.LK_UNLCK, 1)
            else:
                fcntl.flock(lock.fileno(), fcntl.LOCK_UN)


@contextmanager
def staged_bytes(path: Path, raw: bytes):
    """Prepare durable bytes beside the target, also usable as rollback data."""
    path.parent.mkdir(parents=True, exist_ok=True)
    handle, name = tempfile.mkstemp(prefix=f".{path.name}.", dir=path.parent)
    temporary = Path(name)
    try:
        with os.fdopen(handle, "wb") as file:
            file.write(raw)
            file.flush()
            os.fsync(file.fileno())
        yield temporary
    finally:
        temporary.unlink(missing_ok=True)


def atomic_write_bytes(path: Path, raw: bytes) -> None:
    with staged_bytes(path, raw) as temporary:
        os.replace(temporary, path)


def json_bytes(data: Any) -> bytes:
    return (json.dumps(data, ensure_ascii=False, indent=2) + "\n").encode("utf-8")


def write_locked(path: Path, data: Any, expected: str | None) -> str:
    """Caller MUST hold candidate_lock, including any backup/rollback work."""
    raw = json_bytes(data)
    assert_revision(path, expected)
    atomic_write_bytes(path, raw)
    return fingerprint(raw)


def save(path: Path, data: Any, expected: str | None) -> str:
    with candidate_lock(path):
        return write_locked(path, data, expected)
