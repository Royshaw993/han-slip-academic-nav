#!/usr/bin/env python3
"""Loopback-only V1.0 manager for data/sources.json."""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import os
import re
import secrets
import sys
import tempfile
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
SOURCES = DATA / "sources.json"
PAGE = Path(__file__).with_name("manage-sources.html")
BACKUP = DATA / "sources.review-backup.json"
CATEGORY_LABELS = {
    "oracle": "甲骨文",
    "bronze": "金文",
    "stone": "石刻",
    "slips": "简牍",
    "silk": "帛书",
}
CATEGORY_ALIASES = {
    **{key: key for key in CATEGORY_LABELS},
    "甲骨文": "oracle", "甲骨": "oracle", "金文": "bronze", "石刻": "stone",
    "简牍": "slips", "簡牘": "slips", "帛书": "silk", "帛書": "silk",
}
ID_RE = re.compile(r"[A-Za-z0-9][A-Za-z0-9_-]{0,79}\Z")
MAX_BODY = 128 * 1024
sys.dont_write_bytecode = True

CHECKER_PATH = Path(__file__).with_name("check-updates.py")
SPEC = importlib.util.spec_from_file_location("source_checker", CHECKER_PATH)
assert SPEC and SPEC.loader
CHECKER = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = CHECKER
SPEC.loader.exec_module(CHECKER)


class SourceError(ValueError):
    pass


def string_list(value: Any) -> list[str]:
    if isinstance(value, str):
        values = [value]
    elif isinstance(value, list):
        values = [str(item).strip() for item in value]
    else:
        values = []
    return list(dict.fromkeys(item for item in values if item))


def canonical_category(value: str) -> str:
    return CATEGORY_ALIASES.get(value.strip(), value.strip())


def source_url_key(url: str) -> str:
    parsed = urlparse(url.strip())
    path = parsed.path.rstrip("/") or "/"
    return f"{parsed.scheme.lower()}://{parsed.netloc.lower()}{path}{('?' + parsed.query) if parsed.query else ''}"


def normalize_source(raw: dict[str, Any]) -> dict[str, Any]:
    source = dict(raw)
    source["categories"] = list(dict.fromkeys(canonical_category(item) for item in string_list(raw.get("categories"))))
    source["keywords"] = string_list(raw.get("keywords"))
    source["enabled"] = raw.get("enabled", True)
    source["manualReview"] = raw.get("manualReview", False)
    source["sourceType"] = str(raw.get("sourceType", "official")).strip()
    source["priority"] = raw.get("priority", 5)
    source["maxDetailRequests"] = raw.get("maxDetailRequests", 6)
    source["note"] = str(raw.get("note", raw.get("notes", ""))).strip()
    source.pop("notes", None)
    raw_config = raw.get("categoryKeywords", {})
    if isinstance(raw_config, dict):
        category_config: dict[str, list[str]] = {}
        for category, terms in raw_config.items():
            category_config[canonical_category(str(category))] = string_list(terms)
        source["categoryKeywords"] = category_config
    return source


def validate_sources(value: Any) -> list[dict[str, Any]]:
    if not isinstance(value, list):
        raise SourceError("sources.json 顶层必须是数组。")
    if len(value) > 200:
        raise SourceError("来源数量不能超过 200 条。")
    result: list[dict[str, Any]] = []
    ids: set[str] = set()
    urls: set[str] = set()
    for index, raw in enumerate(value, 1):
        if not isinstance(raw, dict):
            raise SourceError(f"第 {index} 条来源必须是对象。")
        source = normalize_source(raw)
        source_id = str(source.get("id", "")).strip()
        name = str(source.get("name", "")).strip()
        url = str(source.get("url", "")).strip()
        if not ID_RE.fullmatch(source_id):
            raise SourceError(f"第 {index} 条来源 id 无效。")
        if source_id in ids:
            raise SourceError(f"来源 id 重复：{source_id}")
        ids.add(source_id)
        if not name or len(name) > 200:
            raise SourceError(f"第 {index} 条来源名称不能为空或过长。")
        parsed = urlparse(url)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc or not parsed.hostname:
            raise SourceError(f"第 {index} 条来源 URL 无效：{url}")
        url_key = source_url_key(url)
        if url_key in urls:
            raise SourceError(f"来源 URL 重复：{url}")
        urls.add(url_key)
        if not isinstance(source["enabled"], bool) or not isinstance(source["manualReview"], bool):
            raise SourceError(f"第 {index} 条来源 enabled/manualReview 必须是布尔值。")
        if not source["categories"] or any(category not in CATEGORY_LABELS for category in source["categories"]):
            raise SourceError(f"第 {index} 条来源 categories 必须使用已知门类。")
        if not source["keywords"]:
            raise SourceError(f"第 {index} 条来源 keywords 不能为空。")
        if not isinstance(source["priority"], int) or isinstance(source["priority"], bool) or not 0 <= source["priority"] <= 99:
            raise SourceError(f"第 {index} 条来源 priority 必须是 0–99 的整数。")
        if not isinstance(source["maxDetailRequests"], int) or isinstance(source["maxDetailRequests"], bool) or not 0 <= source["maxDetailRequests"] <= 100:
            raise SourceError(f"第 {index} 条来源 maxDetailRequests 必须是 0–100 的整数。")
        if not isinstance(source["sourceType"], str) or not source["sourceType"] or len(source["sourceType"]) > 100:
            raise SourceError(f"第 {index} 条来源 sourceType 无效。")
        if not isinstance(source["note"], str) or len(source["note"]) > 2000:
            raise SourceError(f"第 {index} 条来源 note 过长。")
        category_config = source.get("categoryKeywords", {})
        if not isinstance(category_config, dict):
            raise SourceError(f"第 {index} 条来源 categoryKeywords 必须是对象。")
        for category, terms in category_config.items():
            if category not in CATEGORY_LABELS or not isinstance(terms, list) or any(not isinstance(term, str) or not term.strip() for term in terms):
                raise SourceError(f"第 {index} 条来源 categoryKeywords 无效。")
        result.append(source)
    return result


def snapshot(root: Path = ROOT) -> tuple[bytes, list[dict[str, Any]], str]:
    path = root / "data" / "sources.json"
    raw = path.read_bytes()
    value = json.loads(raw.decode("utf-8"))
    sources = validate_sources(value)
    return raw, sources, hashlib.sha256(raw).hexdigest()


def atomic_write_bytes(path: Path, content: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temporary = tempfile.mkstemp(prefix=f".{path.name}.", suffix=".tmp", dir=path.parent)
    try:
        with os.fdopen(fd, "wb") as handle:
            handle.write(content)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def save_sources(root: Path, payload: dict[str, Any]) -> str:
    path = root / "data" / "sources.json"
    lock = path.with_suffix(".manage.lock")
    try:
        handle = os.open(lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
    except FileExistsError as error:
        raise SourceError("另一个来源管理操作正在保存，请稍后重试。") from error
    try:
        raw, _current, revision = snapshot(root)
        if payload.get("revision") != revision:
            raise SourceError("sources.json 已被其他操作修改，请刷新后重试。")
        sources = validate_sources(payload.get("sources"))
        encoded = (json.dumps(sources, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
        atomic_write_bytes(path.with_name("sources.review-backup.json"), raw)
        try:
            atomic_write_bytes(path, encoded)
            check_raw, _check_sources, new_revision = snapshot(root)
            if check_raw != encoded:
                raise SourceError("写入校验失败。")
        except Exception:
            atomic_write_bytes(path, raw)
            raise
        return new_revision
    finally:
        os.close(handle)
        lock.unlink(missing_ok=True)


def test_source(source: dict[str, Any]) -> dict[str, Any]:
    checked = validate_sources([source])[0]
    if checked["manualReview"]:
        return {"status": "manual", "message": "此来源标记为人工复核，未发起网络请求。"}
    try:
        links = CHECKER.fetch_homepage(checked)
        matches = [
            link["title"] for link in links
            if CHECKER.find_keywords(link["title"], checked) and not CHECKER.is_excluded_title(link["title"])
        ]
        if matches:
            return {"status": "accessible", "message": f"可访问；发现 {len(matches)} 个关键词匹配页面。", "matches": matches[:20]}
        return {"status": "no_match", "message": "可访问，但首页没有关键词匹配页面。", "matches": []}
    except PermissionError as error:
        return {"status": "manual", "message": f"需人工检查：{error}"}
    except (HTTPError, URLError, TimeoutError, OSError, ValueError) as error:
        return {"status": "failed", "message": f"抓取失败：{error}"}


class SourceServer(HTTPServer):
    def __init__(self, root: Path, port: int):
        super().__init__(("127.0.0.1", port), Handler)
        self.root = root
        self.token = secrets.token_hex(32)
        self.origin = f"http://127.0.0.1:{self.server_port}"


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
            valid = valid and secrets.compare_digest(self.headers.get("X-Source-Token", ""), self.server.token)
        if not valid:
            self.respond(403, {"error": "仅允许本机来源管理页面访问。"})
        return valid

    def do_GET(self):
        if not self.allowed(api=self.path != "/"):
            return
        try:
            if self.path == "/":
                self.respond(200, PAGE.read_text(encoding="utf-8").replace("__SOURCE_TOKEN__", self.server.token), html=True)
            elif self.path == "/api/sources":
                _raw, sources, revision = snapshot(self.server.root)
                self.respond(200, {"sources": sources, "revision": revision, "categories": CATEGORY_LABELS})
            else:
                self.respond(404, {"error": "入口不存在。"})
        except (OSError, ValueError) as error:
            self.respond(400, {"error": str(error)})

    def do_POST(self):
        if not self.allowed():
            return
        if self.path not in {"/api/save", "/api/test-source"}:
            try:
                length = int(self.headers.get("Content-Length", "0"))
                if 0 < length <= MAX_BODY:
                    self.rfile.read(length)
            except (OSError, ValueError):
                pass
            self.respond(404, {"error": "入口不存在。"})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if self.headers.get("Content-Type") != "application/json" or not 0 < length <= MAX_BODY:
                raise SourceError("请求必须是 128 KB 以内的 JSON。")
            payload = json.loads(self.rfile.read(length))
            if not isinstance(payload, dict):
                raise SourceError("请求必须是 JSON 对象。")
            if self.path == "/api/save":
                self.respond(200, {"revision": save_sources(self.server.root, payload)})
            else:
                source = payload.get("source")
                if not isinstance(source, dict):
                    raise SourceError("缺少待测试来源。")
                self.respond(200, test_source(source))
        except (OSError, ValueError) as error:
            self.respond(400, {"error": str(error)})


def main() -> int:
    parser = argparse.ArgumentParser(description="本机资讯来源管理助手（只保存 sources.json）")
    parser.add_argument("--port", type=int, default=8766)
    args = parser.parse_args()
    try:
        snapshot(ROOT)
        with SourceServer(ROOT, args.port) as server:
            print(f"来源管理助手：{server.origin}/\n请在浏览器打开以上地址。Ctrl+C 关闭。", flush=True)
            server.serve_forever()
    except KeyboardInterrupt:
        pass
    except (OSError, ValueError) as error:
        print(f"无法启动：{error}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
