#!/usr/bin/env python3
"""Publish explicitly approved academic-update candidates safely.

Preview and dry-run modes are read-only. Applying is transactional; Git commit and
push are only reachable when --apply and --push are supplied together.
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable, Iterable
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parent.parent
FORMAL_REL = Path("academic-updates.js")
CANDIDATES_REL = Path("data/candidate-updates.json")
ALLOWED_PUBLISH_FILES = {FORMAL_REL.as_posix(), CANDIDATES_REL.as_posix()}
REQUIRED_FIELDS = (
    "id", "title", "type", "source", "sourceUrl", "date", "summary",
    "tags", "featured", "relatedResources",
)
ARRAY_FIELDS = ("tags", "relatedResources")
EXPECTED_REMOTE_REPOSITORY = "han-slip-academic-nav"
LAST_UPDATED_RE = re.compile(
    r'(window\.academicUpdatesLastUpdated\s*=\s*")[^"]*("\s*;)'
)
ARRAY_END_RE = re.compile(r"\n\s*\];\s*$")
ARRAY_START_RE = re.compile(r"window\.academicUpdates\s*=\s*\[")


class PublishError(RuntimeError):
    """A user-correctable safety or validation failure."""


@dataclass(frozen=True)
class SelectedCandidate:
    item: dict[str, Any]
    historical: bool


@dataclass(frozen=True)
class GitState:
    is_repo: bool
    branch: str = ""
    remotes: tuple[str, ...] = ()
    origin_url: str = ""
    changes: tuple[str, ...] = ()
    detail: str = ""


def read_json(path: Path) -> Any:
    try:
        with path.open("r", encoding="utf-8") as file:
            return json.load(file)
    except (OSError, json.JSONDecodeError) as error:
        raise PublishError(f"无法读取 JSON：{path}（{error}）") from error


def atomic_write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    handle, temporary_name = tempfile.mkstemp(prefix=f".{path.name}.", dir=path.parent)
    temporary = Path(temporary_name)
    try:
        with os.fdopen(handle, "w", encoding="utf-8", newline="\n") as file:
            file.write(text)
        os.replace(temporary, path)
    finally:
        if temporary.exists():
            temporary.unlink()


def json_text(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def load_candidates(root: Path) -> tuple[dict[str, Any], list[SelectedCandidate]]:
    data = read_json(root / CANDIDATES_REL)
    if not isinstance(data, dict):
        raise PublishError("candidate-updates.json 顶层必须是对象。")
    indexed: list[SelectedCandidate] = []
    for collection, historical in (("candidates", False), ("olderCandidates", True)):
        values = data.get(collection, [])
        if not isinstance(values, list):
            raise PublishError(f"{collection} 必须是数组。")
        for item in values:
            if not isinstance(item, dict):
                raise PublishError(f"{collection} 中存在非对象条目。")
            indexed.append(SelectedCandidate(item=item, historical=historical))
    return data, indexed


def select_candidates(indexed: Iterable[SelectedCandidate], ids: list[str]) -> list[SelectedCandidate]:
    if not ids:
        raise PublishError("必须通过 --ids 明确指定至少一个 candidate id。")
    if len(ids) != len(set(ids)):
        raise PublishError("--ids 中存在重复 candidate id。")
    by_id: dict[str, list[SelectedCandidate]] = {}
    for selected in indexed:
        candidate_id = selected.item.get("id")
        if isinstance(candidate_id, str):
            by_id.setdefault(candidate_id, []).append(selected)
    result: list[SelectedCandidate] = []
    for candidate_id in ids:
        matches = by_id.get(candidate_id, [])
        if not matches:
            raise PublishError(f"找不到候选：{candidate_id}")
        if len(matches) > 1:
            raise PublishError(f"候选 id 不唯一：{candidate_id}")
        if matches[0].item.get("status") == "published":
            raise PublishError(f"候选已发布，不能重复发布：{candidate_id}")
        result.append(matches[0])
    return result


def validate_candidate(selected: SelectedCandidate) -> None:
    item = selected.item
    missing = [field for field in REQUIRED_FIELDS if field not in item]
    empty = [
        field for field in ("id", "title", "type", "source", "sourceUrl", "date", "summary")
        if field in item and (not isinstance(item[field], str) or not item[field].strip())
    ]
    if missing or empty:
        fields = ", ".join(missing + empty)
        raise PublishError(f"候选 {item.get('id', '<unknown>')} 待补充正式字段：{fields}")
    for field in ARRAY_FIELDS:
        if not isinstance(item[field], list):
            raise PublishError(f"候选 {item['id']} 的 {field} 必须是数组。")
    if "topics" in item and not isinstance(item["topics"], list):
        raise PublishError(f"候选 {item['id']} 的 topics 必须是数组。")
    if not isinstance(item["featured"], bool):
        raise PublishError(f"候选 {item['id']} 的 featured 必须是布尔值。")
    validate_url(item["sourceUrl"], f"候选 {item['id']}")


def validate_url(value: str, context: str) -> None:
    parsed = urlparse(value)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise PublishError(f"{context} 的 sourceUrl 不是有效 HTTP(S) URL：{value}")


def decoded_js_strings(text: str, field: str) -> list[str]:
    pattern = re.compile(rf'\b{re.escape(field)}\s*:\s*("(?:\\.|[^"\\])*")')
    result: list[str] = []
    for match in pattern.finditer(text):
        try:
            result.append(json.loads(match.group(1)))
        except json.JSONDecodeError as error:
            raise PublishError(f"academic-updates.js 中 {field} 字符串无效。") from error
    return result


def academic_array_text(text: str) -> str:
    start = ARRAY_START_RE.search(text)
    end = ARRAY_END_RE.search(text)
    if not start or not end or start.end() > end.start():
        raise PublishError("无法识别 academicUpdates 数组。")
    return text[start.end():end.start()]


def parse_academic_entries(text: str) -> list[dict[str, Any]]:
    """Parse the project's deliberately JSON-like JavaScript object array."""
    body = academic_array_text(text)
    output: list[str] = []
    index = 0
    in_string = False
    escaped = False
    previous_significant = "["
    while index < len(body):
        char = body[index]
        if in_string:
            output.append(char)
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == '"':
                in_string = False
            index += 1
            continue
        if char == '"':
            in_string = True
            output.append(char)
            previous_significant = char
            index += 1
            continue
        if (char.isalpha() or char in "_$") and previous_significant in "{,":
            end = index + 1
            while end < len(body) and (body[end].isalnum() or body[end] in "_$"):
                end += 1
            colon = end
            while colon < len(body) and body[colon].isspace():
                colon += 1
            if colon < len(body) and body[colon] == ":":
                output.append(json.dumps(body[index:end]))
                output.append(body[end:colon + 1])
                previous_significant = ":"
                index = colon + 1
                continue
        output.append(char)
        if not char.isspace():
            previous_significant = char
        index += 1
    try:
        values = json.loads("[" + "".join(output) + "]")
    except json.JSONDecodeError as error:
        raise PublishError(f"academic-updates.js 数据语法无效：{error}") from error
    if not isinstance(values, list) or any(not isinstance(value, dict) for value in values):
        raise PublishError("academicUpdates 必须是对象数组。")
    return values


def formal_pairs(text: str) -> list[tuple[str, str]]:
    objects = re.findall(r"\{[^{}]*\}", text, flags=re.S)
    pairs: list[tuple[str, str]] = []
    for block in objects:
        titles = decoded_js_strings(block, "title")
        sources = decoded_js_strings(block, "source")
        if titles and sources:
            pairs.append((titles[0].strip().casefold(), sources[0].strip().casefold()))
    return pairs


def source_key(url: str) -> str:
    host = (urlparse(url).hostname or "source").lower()
    pieces = [part for part in host.split(".") if part not in {"www", "com", "cn", "org", "net", "edu"}]
    key = "-".join(reversed(pieces[:2])) if pieces else "source"
    key = re.sub(r"[^a-z0-9]+", "-", key).strip("-")
    return key or "source"


def formal_id(item: dict[str, Any]) -> str:
    date_key = re.sub(r"[^0-9]", "", item["date"])[:8] or "undated"
    digest_source = "\0".join((item["title"].strip(), item["source"].strip(), item["sourceUrl"].strip()))
    digest = hashlib.sha256(digest_source.encode("utf-8")).hexdigest()[:8]
    return f"{source_key(item['sourceUrl'])}-{date_key}-{digest}"


def build_formal_entries(selected: list[SelectedCandidate], formal_text: str) -> list[dict[str, Any]]:
    formal_entries = parse_academic_entries(formal_text)
    existing_ids = {entry.get("id") for entry in formal_entries}
    existing_pairs = {
        (str(entry.get("title", "")).strip().casefold(), str(entry.get("source", "")).strip().casefold())
        for entry in formal_entries
    }
    entries: list[dict[str, Any]] = []
    generated: set[str] = set()
    new_pairs: set[tuple[str, str]] = set()
    for candidate in selected:
        validate_candidate(candidate)
        item = candidate.item
        entry_id = formal_id(item)
        pair = (item["title"].strip().casefold(), item["source"].strip().casefold())
        if entry_id in existing_ids or entry_id in generated:
            raise PublishError(f"正式 id 重复：{entry_id}")
        if pair in existing_pairs or pair in new_pairs:
            raise PublishError(f"title + source 重复：{item['title']} / {item['source']}")
        entry = {field: item[field] for field in REQUIRED_FIELDS if field != "id"}
        entry = {"id": entry_id, **entry}
        if "topics" in item:
            entry["topics"] = item["topics"]
        if candidate.historical:
            entry["historical"] = True
        entries.append(entry)
        generated.add(entry_id)
        new_pairs.add(pair)
    return entries


def format_entry(entry: dict[str, Any]) -> str:
    order = ("id", "title", "type", "source", "sourceUrl", "date", "summary", "topics", "tags", "featured", "historical", "relatedResources")
    parts = [f"{field}:{json_text(entry[field])}" for field in order if field in entry]
    return "  { " + ", ".join(parts) + " }"


def updated_formal_text(original: str, entries: list[dict[str, Any]], today: str) -> str:
    if not LAST_UPDATED_RE.search(original):
        raise PublishError("找不到 academicUpdatesLastUpdated。")
    if not ARRAY_END_RE.search(original):
        raise PublishError("找不到 academicUpdates 数组结尾。")
    text = LAST_UPDATED_RE.sub(rf"\g<1>{today}\g<2>", original, count=1)
    addition = ",\n" + ",\n".join(format_entry(entry) for entry in entries)
    return ARRAY_END_RE.sub(addition + "\n];\n", text, count=1)


def update_candidate_status(data: dict[str, Any], ids: set[str], today: str) -> dict[str, Any]:
    result = json.loads(json.dumps(data, ensure_ascii=False))
    for collection in ("candidates", "olderCandidates"):
        for item in result.get(collection, []):
            if item.get("id") in ids:
                item["status"] = "published"
                item["publishedAt"] = today
    return result


def duplicate_values(values: Iterable[Any]) -> list[Any]:
    seen: set[Any] = set()
    duplicates: set[Any] = set()
    for value in values:
        if value in seen:
            duplicates.add(value)
        seen.add(value)
    return sorted(duplicates)


def javascript_syntax_check(path: Path) -> None:
    parse_academic_entries(path.read_text(encoding="utf-8"))
    node = shutil.which("node")
    if node:
        process = subprocess.run([node, "--check", str(path)], capture_output=True, text=True, encoding="utf-8", errors="replace")
        if process.returncode != 0:
            detail = (process.stderr or process.stdout).strip()
            raise PublishError(f"JavaScript 语法检查失败：{detail}")


def validate_written_files(root: Path) -> None:
    formal_path = root / FORMAL_REL
    text = formal_path.read_text(encoding="utf-8")
    entries = parse_academic_entries(text)
    ids = [str(entry.get("id", "")) for entry in entries]
    pairs = [
        (str(entry.get("title", "")).strip().casefold(), str(entry.get("source", "")).strip().casefold())
        for entry in entries
    ]
    duplicate_ids = duplicate_values(ids)
    duplicate_pairs = duplicate_values(pairs)
    if duplicate_ids:
        raise PublishError("检测到重复正式 id：" + ", ".join(duplicate_ids))
    if duplicate_pairs:
        raise PublishError("检测到重复 title + source。")
    for entry in entries:
        missing = [field for field in REQUIRED_FIELDS if field not in entry]
        if missing:
            raise PublishError("academic-updates.js 条目缺少字段：" + ", ".join(missing))
        validate_url(str(entry["sourceUrl"]), "academic-updates.js")
    candidate_data = read_json(root / CANDIDATES_REL)
    if not isinstance(candidate_data, dict):
        raise PublishError("写入后的 candidate-updates.json 无效。")
    javascript_syntax_check(formal_path)


def run_git(root: Path, *args: str, check: bool = True) -> subprocess.CompletedProcess[str]:
    try:
        process = subprocess.run(
            ["git", "-C", str(root), *args], capture_output=True, text=True,
            encoding="utf-8", errors="replace",
        )
    except FileNotFoundError as error:
        raise PublishError("未安装 Git。") from error
    if check and process.returncode != 0:
        detail = (process.stderr or process.stdout).strip()
        raise PublishError(f"Git 命令失败（{' '.join(args)}）：{detail}")
    return process


def git_state(root: Path) -> GitState:
    if not shutil.which("git"):
        return GitState(False, detail="未安装 Git")
    probe = run_git(root, "rev-parse", "--show-toplevel", check=False)
    if probe.returncode != 0:
        return GitState(False, detail="当前目录不是 Git 仓库")
    branch = run_git(root, "branch", "--show-current").stdout.strip()
    remotes = tuple(line.strip() for line in run_git(root, "remote").stdout.splitlines() if line.strip())
    origin_url = run_git(root, "remote", "get-url", "origin", check=False).stdout.strip() if "origin" in remotes else ""
    changes = tuple(parse_status_paths(run_git(root, "status", "--porcelain=v1", "--untracked-files=all").stdout))
    return GitState(True, branch, remotes, origin_url, changes)


def parse_status_paths(output: str) -> list[str]:
    paths: list[str] = []
    for line in output.splitlines():
        if len(line) < 4:
            continue
        value = line[3:]
        if " -> " in value:
            value = value.split(" -> ", 1)[1]
        paths.append(value.replace("\\", "/"))
    return paths


def remote_repository_name(url: str) -> str:
    cleaned = url.rstrip("/")
    name = cleaned.rsplit("/", 1)[-1].rsplit(":", 1)[-1]
    return name.removesuffix(".git")


def assert_push_preflight(state: GitState) -> None:
    if not state.is_repo:
        raise PublishError(f"不能 push：{state.detail}。")
    if not state.branch:
        raise PublishError("不能 push：当前处于 detached HEAD 或分支不明确。")
    if "origin" not in state.remotes or not state.origin_url:
        raise PublishError("不能 push：未配置 remote origin。")
    if remote_repository_name(state.origin_url) != EXPECTED_REMOTE_REPOSITORY:
        raise PublishError("不能 push：origin URL 未指向 han-slip-academic-nav。")
    unrelated = sorted(set(state.changes) - ALLOWED_PUBLISH_FILES)
    if unrelated:
        raise PublishError("检测到无关未提交修改，已停止自动发布：" + ", ".join(unrelated))
    if set(state.changes) & ALLOWED_PUBLISH_FILES:
        raise PublishError("发布目标文件已有未提交修改；为避免覆盖，已停止自动发布。")


def print_git_state(state: GitState) -> None:
    print("Git 状态：")
    print(f"- 当前分支：{state.branch or '不可用'}")
    print(f"- 是否存在未提交修改：{'是' if state.changes else '否'}")
    print(f"- 是否配置 remote：{'是' if state.remotes else '否'}")
    print(f"- remote 名称：{', '.join(state.remotes) if state.remotes else '无'}")
    print(f"- 是否存在 origin：{'是' if state.origin_url else '否'}")
    if not state.is_repo:
        print(f"- 说明：{state.detail}")


def research_objects(item: dict[str, Any]) -> list[str]:
    for field in ("topics", "suggestedTopics", "matchedKeywords"):
        value = item.get(field)
        if isinstance(value, list) and value:
            return [str(entry) for entry in value]
    return []


def print_preview(selected: list[SelectedCandidate], entries: list[dict[str, Any]], state: GitState) -> None:
    print(f"准备加入 {len(selected)} 条：")
    for index, (candidate, entry) in enumerate(zip(selected, entries), start=1):
        item = candidate.item
        print(f"\n{index}.")
        print(f"候选 id：{item['id']}")
        print(f"正式 id：{entry['id']}")
        print(f"标题：{item['title']}")
        print(f"来源：{item['source']}")
        print(f"日期：{item['date']}")
        print(f"类型：{item['type']}")
        print(f"研究对象：{'、'.join(research_objects(item)) or '未标注'}")
        print(f"是否历史记录：{'是' if candidate.historical else '否'}")
        print(f"sourceUrl：{item['sourceUrl']}")
        if item.get("sourceType") == "wechat" and item.get("preferOriginalSource") is True:
            print("提醒：该候选来自公众号，建议确认是否存在更优原始学术来源。")
    print("\n将修改：")
    print("- academic-updates.js")
    print("- data/candidate-updates.json（保留候选并更新 published 状态）")
    print("将更新：")
    print("- academicUpdatesLastUpdated")
    print()
    print_git_state(state)


def apply_transaction(
    root: Path,
    selected: list[SelectedCandidate],
    entries: list[dict[str, Any]],
    candidate_data: dict[str, Any],
    today: str,
    validator: Callable[[Path], None] = validate_written_files,
) -> None:
    formal_path = root / FORMAL_REL
    candidate_path = root / CANDIDATES_REL
    original_formal = formal_path.read_bytes()
    new_formal = updated_formal_text(original_formal.decode("utf-8"), entries, today)
    new_candidates = update_candidate_status(candidate_data, {item.item["id"] for item in selected}, today)
    with tempfile.TemporaryDirectory(prefix="approved-updates-backup-") as directory:
        backup = Path(directory)
        formal_backup = backup / FORMAL_REL.name
        candidates_backup = backup / CANDIDATES_REL.name
        shutil.copy2(formal_path, formal_backup)
        shutil.copy2(candidate_path, candidates_backup)
        try:
            atomic_write_text(formal_path, new_formal)
            atomic_write_text(candidate_path, json.dumps(new_candidates, ensure_ascii=False, indent=2) + "\n")
            validator(root)
        except Exception:
            shutil.copy2(formal_backup, formal_path)
            shutil.copy2(candidates_backup, candidate_path)
            raise


def commit_and_push(root: Path, today: str, branch: str) -> None:
    run_git(root, "add", "--", FORMAL_REL.as_posix(), CANDIDATES_REL.as_posix())
    staged = {
        path.replace("\\", "/")
        for path in run_git(root, "diff", "--cached", "--name-only").stdout.splitlines()
        if path.strip()
    }
    if not staged or staged - ALLOWED_PUBLISH_FILES:
        raise PublishError("暂存区文件不符合发布范围，已停止 commit。")
    run_git(root, "commit", "-m", f"Update academic updates {today}")
    pushed = run_git(root, "push", "origin", f"HEAD:{branch}", check=False)
    if pushed.returncode != 0:
        detail = (pushed.stderr or pushed.stdout).strip()
        raise PublishError(f"本地发布成功，但 GitHub 推送失败。可稍后重新 push。详情：{detail}")


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(description="发布经人工明确批准的学术动态候选。")
    result.add_argument("--ids", nargs="+", required=True, help="明确批准的 candidate id")
    modes = result.add_mutually_exclusive_group()
    modes.add_argument("--preview", action="store_true", help="只读预览")
    modes.add_argument("--dry-run", action="store_true", help="只读检查候选与 Git 环境")
    modes.add_argument("--apply", action="store_true", help="写入本地并校验")
    result.add_argument("--push", action="store_true", help="仅与 --apply 同用：commit 并 push")
    result.add_argument("--project-root", type=Path, default=ROOT, help=argparse.SUPPRESS)
    return result


def main(argv: list[str] | None = None) -> int:
    args = parser().parse_args(argv)
    if args.push and not args.apply:
        print("错误：--push 必须与 --apply 同时使用。", file=sys.stderr)
        return 2
    if not (args.preview or args.dry_run or args.apply):
        args.preview = True
    root = args.project_root.resolve()
    try:
        candidate_data, indexed = load_candidates(root)
        selected = select_candidates(indexed, args.ids)
        formal_text = (root / FORMAL_REL).read_text(encoding="utf-8")
        entries = build_formal_entries(selected, formal_text)
        state = git_state(root)
        if args.push:
            assert_push_preflight(state)
        print_preview(selected, entries, state)
        if args.preview:
            print("\n预览完成：未写入文件，未 commit，未 push。")
            return 0
        if args.dry_run:
            print("\nDry-run 完成：候选与环境检查通过；未写入文件，未 commit，未 push。")
            return 0
        today = dt.date.today().isoformat()
        apply_transaction(root, selected, entries, candidate_data, today)
        print("\n本地写入与校验成功。")
        if args.push:
            post_state = git_state(root)
            unrelated = set(post_state.changes) - ALLOWED_PUBLISH_FILES
            if unrelated:
                raise PublishError("检测到无关未提交修改，已停止自动发布：" + ", ".join(sorted(unrelated)))
            commit_and_push(root, today, state.branch)
            print("Git commit 与 push 成功。")
        else:
            print("未执行 Git commit 或 push。")
        return 0
    except (PublishError, OSError) as error:
        print(f"错误：{error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
