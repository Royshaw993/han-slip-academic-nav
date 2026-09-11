#!/usr/bin/env python3
"""Small loopback-only candidate reviewer. No apply, commit or push endpoint."""
from __future__ import annotations

import argparse
import calendar
import datetime as dt
import hashlib
import importlib.util
import json
import os
import re
import secrets
import subprocess
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGE = Path(__file__).with_name("review-candidates.html")
PUBLISHER_PATH = Path(__file__).with_name("publish-approved-updates.py")
DECISIONS = {"approved": "正式加入", "historical": "历史补录", "deferred": "暂不加入", "rejected": "不建议加入"}
sys.dont_write_bytecode = True
SPEC = importlib.util.spec_from_file_location("review_publisher", PUBLISHER_PATH)
assert SPEC and SPEC.loader
PUBLISHER = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = PUBLISHER
SPEC.loader.exec_module(PUBLISHER)
store = PUBLISHER.store


class ReviewError(ValueError):
    pass


PUBLISH_INFO_FIELDS = ("type", "date", "summary", "tags", "featured", "relatedResources")
PUBLISH_STRING_FIELDS = ("type", "date", "summary")
PUBLISH_ARRAY_FIELDS = ("tags", "relatedResources")
DEFAULT_FORMAL_TYPES = ("新论文", "新书", "学术会议", "研究动态", "数据库更新")
DATE_RE = re.compile(r"\d{4}-\d{2}-\d{2}\Z")


def formal_type_options(root: Path = ROOT) -> list[str]:
    """Reuse the type values already present in the formal academic data."""
    try:
        text = (root / PUBLISHER.FORMAL_REL).read_text(encoding="utf-8")
        values = PUBLISHER.decoded_js_strings(text, "type")
    except (OSError, ValueError):
        values = []
    return list(dict.fromkeys(values or DEFAULT_FORMAL_TYPES))


def validate_publish_info(fields: object, root: Path = ROOT) -> dict[str, Any]:
    if not isinstance(fields, dict) or not fields:
        raise ReviewError("请至少填写一个正式字段。")
    unknown = set(fields) - set(PUBLISH_INFO_FIELDS)
    if unknown:
        raise ReviewError("存在不支持的正式字段：" + ", ".join(sorted(str(item) for item in unknown)))
    result: dict[str, Any] = {}
    for field in PUBLISH_STRING_FIELDS:
        if field not in fields:
            continue
        value = fields[field]
        if not isinstance(value, str):
            raise ReviewError(f"{field} 必须是字符串。")
        value = value.strip()
        if field == "date":
            try:
                PUBLISHER.validate_date(value, "发布日期")
            except PUBLISHER.PublishError as error:
                raise ReviewError(str(error)) from error
        if field == "type" and value and value not in formal_type_options(root):
            raise ReviewError(f"type 不是当前正式数据使用的类型：{value}")
        result[field] = value
    for field in PUBLISH_ARRAY_FIELDS:
        if field not in fields:
            continue
        value = fields[field]
        if not isinstance(value, list) or any(not isinstance(item, str) for item in value):
            raise ReviewError(f"{field} 必须是字符串数组。")
        result[field] = list(value)
    if "featured" in fields:
        if not isinstance(fields["featured"], bool):
            raise ReviewError("featured 必须是布尔值。")
        result["featured"] = fields["featured"]
    return result


def find_candidate(data: dict, candidate_id: object) -> dict[str, Any]:
    if not isinstance(candidate_id, str) or not candidate_id:
        raise ReviewError("缺少候选 id。")
    for bucket in ("candidates", "olderCandidates"):
        for item in data.get(bucket, []):
            if item.get("id") == candidate_id:
                if item.get("reviewDecision") not in {"approved", "historical"}:
                    raise ReviewError("只有“正式加入”或“历史补录”候选可以补全发布信息。")
                return item
    raise ReviewError("找不到候选，或候选已变化，请刷新后重试。")


def save_publish_info(root: Path, payload: dict) -> str:
    path = root / PUBLISHER.CANDIDATES_REL
    raw, data, revision = snapshot(root)
    if payload.get("revision") != revision:
        raise ReviewError("候选文件已被其他操作修改；未覆盖，请刷新后重试。")
    item = find_candidate(data, payload.get("id"))
    item.update(validate_publish_info(payload.get("fields"), root))
    return save_review(path, raw, data, revision)


def save_review(path: Path, raw: bytes, data: dict, revision: str) -> str:
    try:
        with store.candidate_lock(path):
            store.assert_revision(path, revision)
            store.atomic_write_bytes(path.with_suffix(".review-backup.json"), raw)
            return store.write_locked(path, data, revision)
    except store.CandidateConflict as error:
        raise ReviewError(str(error)) from error


def candidate_periods(data: dict, today: dt.date | None = None) -> dict:
    """Display-only grouping; discovery dates never stand in for article dates."""
    today = today or dt.date.today()
    cutoff = today.replace(year=today.year - 1, day=min(today.day, calendar.monthrange(today.year - 1, today.month)[1]))
    groups = {"recent": [], "historical": [], "undated": []}
    for bucket in ("candidates", "olderCandidates"):
        for item in data.get(bucket, []):
            period = "historical" if bucket == "olderCandidates" else "undated"
            value = item.get("date") or item.get("possibleDate")
            if bucket != "olderCandidates" and isinstance(value, str):
                try:
                    if re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
                        start = end = dt.date.fromisoformat(value)
                    elif re.fullmatch(r"\d{4}-\d{2}", value):
                        start = dt.date.fromisoformat(value + "-01")
                        end = start.replace(day=calendar.monthrange(start.year, start.month)[1])
                    else:
                        raise ValueError("Unknown date precision")
                    if end < cutoff:
                        period = "historical"
                    elif start >= cutoff and end <= today:
                        period = "recent"
                except ValueError:
                    pass
            groups[period].append(item["id"])
    return {"asOf": today.isoformat(), "cutoff": cutoff.isoformat(), **groups}


def snapshot(root: Path) -> tuple[bytes, dict, str]:
    raw = (root / PUBLISHER.CANDIDATES_REL).read_bytes()
    data = json.loads(raw.decode("utf-8"))
    if not isinstance(data, dict):
        raise ReviewError("候选文件顶层必须是对象。")
    ids = set()
    for bucket in ("candidates", "olderCandidates"):
        if not isinstance(data.get(bucket, []), list):
            raise ReviewError(f"{bucket} 必须是数组。")
        for item in data.get(bucket, []):
            if not isinstance(item, dict):
                raise ReviewError("候选条目必须是对象。")
            candidate_id = item.get("id")
            if not isinstance(candidate_id, str) or not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_-]{0,199}", candidate_id):
                raise ReviewError("候选 id 无效，须由人工检查文件。")
            if candidate_id in ids:
                raise ReviewError(f"候选 id 重复：{candidate_id}")
            ids.add(candidate_id)
    return raw, data, hashlib.sha256(raw).hexdigest()


def selected_items(data: dict, ids: object) -> list[dict]:
    if not isinstance(ids, list) or not ids or len(ids) > 100 or any(not isinstance(i, str) for i in ids):
        raise ReviewError("请选择 1–100 条候选。")
    if len(set(ids)) != len(ids):
        raise ReviewError("选择中存在重复候选。")
    indexed = {i["id"]: i for bucket in ("candidates", "olderCandidates") for i in data.get(bucket, [])}
    if any(i not in indexed for i in ids):
        raise ReviewError("候选已变化，请刷新后重新选择。")
    items = [indexed[i] for i in ids]
    if any(i.get("status") == "published" for i in items):
        raise ReviewError("已发布候选不能修改或重复预览。")
    return items


def save_decision(root: Path, payload: dict) -> str:
    path = root / PUBLISHER.CANDIDATES_REL
    raw, data, revision = snapshot(root)
    if payload.get("revision") != revision:
        raise ReviewError("候选文件已被其他操作修改；未覆盖，请刷新后重试。")
    decision = payload.get("decision")
    if not isinstance(decision, str) or decision not in DECISIONS:
        raise ReviewError("无效的审核结论。")
    items = selected_items(data, payload.get("ids"))
    for item in items:
        item["reviewDecision"] = decision
    return save_review(path, raw, data, revision)


def preview(root: Path, payload: dict) -> dict:
    _, data, revision = snapshot(root)
    if payload.get("revision") != revision:
        raise ReviewError("候选文件已变化，请刷新后重新预览。")
    items = selected_items(data, payload.get("ids"))
    if any(i.get("reviewDecision") not in {"approved", "historical"} for i in items):
        raise ReviewError("请先将所选候选标记为“正式加入”或“历史补录”。")
    # Fixed executable and flags, no shell and no user-supplied command arguments.
    result = subprocess.run(
        [sys.executable, "-B", str(PUBLISHER_PATH), "--project-root", str(root), "--preview", "--ids", *[i["id"] for i in items]],
        capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=30,
        env={**os.environ, "PYTHONIOENCODING": "utf-8"},
    )
    return {"ok": result.returncode == 0, "output": result.stdout + result.stderr}


class ReviewServer(HTTPServer):
    def __init__(self, root: Path, port: int):
        super().__init__(("127.0.0.1", port), Handler)
        self.root = root
        self.token = secrets.token_hex(32)
        self.origin = f"http://127.0.0.1:{self.server_port}"

    def get_request(self):
        connection, address = super().get_request()
        connection.settimeout(10)
        return connection, address


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *_args):
        pass

    def respond(self, status: int, value: object, html: bool = False):
        body = (str(value) if html else json.dumps(value, ensure_ascii=False)).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "text/html; charset=utf-8" if html else "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Content-Security-Policy", "default-src 'none'; script-src 'nonce-" + self.server.token + "'; style-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'")
        self.end_headers()
        self.wfile.write(body)

    def allowed(self, api: bool = True) -> bool:
        expected_host = self.server.origin.removeprefix("http://")
        valid = self.headers.get("Host") == expected_host
        origin = self.headers.get("Origin")
        valid = valid and (origin is None or origin == self.server.origin)
        if api:
            valid = valid and secrets.compare_digest(self.headers.get("X-Review-Token", ""), self.server.token)
        if not valid:
            # Drain a bounded rejected request so Windows clients receive the 403
            # instead of a connection reset caused by unread request bytes.
            if self.command == "POST":
                try:
                    length = int(self.headers.get("Content-Length", "0"))
                    if 0 < length <= 32768:
                        self.rfile.read(length)
                except (OSError, ValueError):
                    pass
            self.respond(403, {"error": "仅允许本机审核页面访问。"})
        return valid

    def do_GET(self):
        if not self.allowed(api=self.path != "/"):
            return
        try:
            if self.path == "/":
                self.respond(200, PAGE.read_text(encoding="utf-8").replace("__REVIEW_TOKEN__", self.server.token), html=True)
            elif self.path == "/api/candidates":
                _, data, revision = snapshot(self.server.root)
                self.respond(200, {"data": data, "revision": revision, "periods": candidate_periods(data), "typeOptions": formal_type_options(self.server.root)})
            else:
                self.respond(404, {"error": "入口不存在。"})
        except (OSError, ValueError) as error:
            self.respond(400, {"error": str(error)})

    def do_POST(self):
        if not self.allowed():
            return
        if self.path not in {"/api/review", "/api/preview", "/api/publish-info"}:
            try:
                length = int(self.headers.get("Content-Length", "0"))
                if 0 < length <= 32768:
                    self.rfile.read(length)
            except (OSError, ValueError):
                pass
            self.respond(404, {"error": "入口不存在。"})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if self.headers.get("Content-Type") != "application/json" or not 0 < length <= 32768:
                raise ReviewError("请求必须是 32 KB 以内的 JSON。")
            payload = json.loads(self.rfile.read(length))
            if not isinstance(payload, dict):
                raise ReviewError("请求必须是 JSON 对象。")
            if self.path == "/api/review":
                self.respond(200, {"revision": save_decision(self.server.root, payload)})
            elif self.path == "/api/publish-info":
                self.respond(200, {"revision": save_publish_info(self.server.root, payload)})
            else:
                self.respond(200, preview(self.server.root, payload))
        except (OSError, ValueError, subprocess.TimeoutExpired) as error:
            self.respond(400, {"error": str(error)})


def main():
    parser = argparse.ArgumentParser(description="本机候选审核助手（只保存审核结论和 preview）")
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()
    try:
        snapshot(ROOT)
        with ReviewServer(ROOT, args.port) as server:
            print(f"审核助手：{server.origin}/\n请在浏览器打开以上地址。Ctrl+C 关闭。", flush=True)
            server.serve_forever()
    except KeyboardInterrupt:
        pass
    except (OSError, ValueError) as error:
        print(f"无法启动：{error}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
