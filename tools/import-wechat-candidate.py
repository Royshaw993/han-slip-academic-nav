#!/usr/bin/env python3
"""Import user-supplied public WeChat article URLs into the candidate pool."""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import html
import importlib.util
import json
import re
import sys
import time
from html.parser import HTMLParser
from pathlib import Path
from types import ModuleType
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener


ROOT = Path(__file__).resolve().parent.parent
CHECKER_PATH = ROOT / "tools" / "check-updates.py"
DATA = ROOT / "data"
CANDIDATES = DATA / "candidate-updates.json"
SEEN = DATA / "seen-items.json"
TIMEOUT = 12
INTERVAL = 1.5
MAX_URLS = 20
MAX_PAGE_BYTES = 2_000_000
USER_AGENT = "AncientChineseWritingAcademicHub/1.1B (manual WeChat candidate importer)"
WECHAT_HOST = "mp.weixin.qq.com"
EXTRA_KEYWORDS = ["\u91ca\u6587", "\u5b57\u5f62", "\u7f00\u5408", "\u8457\u5f55", "\u884c\u653f\u6587\u4e66", "\u6cd5\u5f8b\u6587\u4e66"]
BLOCKED_MARKERS = (
    "captcha",
    "waf-captcha",
    "access verification",
    "\u9a8c\u8bc1\u7801",
    "\u8bbf\u95ee\u9a8c\u8bc1",
    "\u5b89\u5168\u9a8c\u8bc1",
    "\u8bf7\u5728\u5fae\u4fe1\u5ba2\u6237\u7aef\u6253\u5f00\u94fe\u63a5",
    "\u8bf7\u5148\u767b\u5f55",
    "\u767b\u5f55\u540e",
    "\u73af\u5883\u5f02\u5e38",
    "\u8bbf\u95ee\u8fc7\u4e8e\u9891\u7e41",
)


def load_checker() -> ModuleType:
    spec = importlib.util.spec_from_file_location("academic_update_checker", CHECKER_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load shared checker: {CHECKER_PATH}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


CHECKER = load_checker()


class MetadataParser(HTMLParser):
    """Collect only explicit metadata and stable WeChat title/source elements."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.metas: list[dict[str, str]] = []
        self.capture: str | None = None
        self.capture_tag: str | None = None
        self.parts: dict[str, list[str]] = {"title": [], "source": []}

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = {key.lower(): value or "" for key, value in attrs}
        if tag.lower() == "meta":
            self.metas.append(values)
        element_id = values.get("id", "")
        if tag.lower() == "h1" and element_id == "activity-name":
            self.capture, self.capture_tag = "title", "h1"
        elif element_id == "js_name":
            self.capture, self.capture_tag = "source", tag.lower()

    def handle_data(self, data: str) -> None:
        if self.capture:
            self.parts[self.capture].append(data)

    def handle_endtag(self, tag: str) -> None:
        if self.capture and tag.lower() == self.capture_tag:
            self.capture, self.capture_tag = None, None

    def text(self, name: str) -> str:
        return clean_text(" ".join(self.parts[name]))


class WeChatRedirectHandler(HTTPRedirectHandler):
    """Permit redirects only to another HTTPS WeChat public-article URL."""

    def redirect_request(self, req: Any, fp: Any, code: int, msg: str, headers: Any, newurl: str) -> Any:
        validate_wechat_url(newurl)
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def clean_text(value: str) -> str:
    return " ".join(html.unescape(value).replace("\u200b", "").split()).strip()


def validate_wechat_url(url: str) -> str:
    parsed = urlsplit(url)
    if parsed.scheme.lower() != "https" or (parsed.hostname or "").lower() != WECHAT_HOST:
        raise ValueError("\u53ea\u63a5\u53d7 https://mp.weixin.qq.com/ \u7684\u516c\u5f00\u6587\u7ae0 URL\u3002")
    try:
        port = parsed.port
    except ValueError as error:
        raise ValueError("URL \u7aef\u53e3\u683c\u5f0f\u65e0\u6548\u3002") from error
    if parsed.username or parsed.password or port not in (None, 443):
        raise ValueError("URL \u4e0d\u5f97\u5305\u542b\u7528\u6237\u4fe1\u606f\u6216\u975e HTTPS \u6807\u51c6\u7aef\u53e3\u3002")
    if parsed.path != "/s" and not parsed.path.startswith("/s/"):
        raise ValueError("\u8be5 URL \u4e0d\u50cf\u5fae\u4fe1\u516c\u4f17\u53f7\u6587\u7ae0\u94fe\u63a5\uff08\u8def\u5f84\u5e94\u4ee5 /s \u5f00\u5934\uff09\u3002")
    return url


def comparable_url(url: str) -> str:
    """Normalize harmless URL differences while retaining every query field."""
    parsed = urlsplit(url.strip())
    query = urlencode(sorted(parse_qsl(parsed.query, keep_blank_values=True)), doseq=True)
    return urlunsplit((parsed.scheme.lower(), parsed.netloc.lower(), parsed.path, query, ""))


def meta_value(parser: MetadataParser, keys: tuple[str, ...]) -> str:
    wanted = {key.lower() for key in keys}
    for attributes in parser.metas:
        label = (attributes.get("property") or attributes.get("name") or "").lower()
        if label in wanted and attributes.get("content"):
            return clean_text(attributes["content"])
    return ""


def javascript_string(page: str, names: tuple[str, ...]) -> str:
    for name in names:
        pattern = rf"(?:var\s+)?{re.escape(name)}\s*=\s*(\"(?:\\.|[^\"\\])*\")"
        match = re.search(pattern, page)
        if not match:
            continue
        try:
            return clean_text(json.loads(match.group(1)))
        except (json.JSONDecodeError, TypeError):
            continue
    return ""


def reliable_date(page: str, parser: MetadataParser) -> str:
    published = meta_value(parser, ("article:published_time", "publishdate", "datepublished"))
    if published:
        date = CHECKER.date_from_text(published)
        if date:
            return date

    timestamp = re.search(r"(?:var\s+)?ct\s*=\s*[\"']?(\d{10})[\"']?", page)
    if timestamp:
        try:
            timezone = dt.timezone(dt.timedelta(hours=8))
            return dt.datetime.fromtimestamp(int(timestamp.group(1)), tz=timezone).date().isoformat()
        except (OverflowError, OSError, ValueError):
            pass

    explicit = re.search(
        r"(?:publish_time|create_time)\s*=\s*[\"'](20\d{2}[-/.]\d{1,2}[-/.]\d{1,2})[\"']",
        page,
        re.I,
    )
    return CHECKER.date_from_text(explicit.group(1)) if explicit else ""


def extract_metadata(page: str) -> dict[str, str]:
    parser = MetadataParser()
    parser.feed(page)
    title = meta_value(parser, ("og:title",)) or parser.text("title") or javascript_string(page, ("msg_title", "appmsg_title"))
    source = parser.text("source") or javascript_string(page, ("nickname", "account_name"))
    author = meta_value(parser, ("author", "article:author")) or javascript_string(page, ("author",))
    return {
        "title": title,
        "source": source,
        "possibleDate": reliable_date(page, parser),
        "author": author,
    }


def fetch_public_article(url: str) -> str:
    request = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "text/html,application/xhtml+xml"})
    opener = build_opener(WeChatRedirectHandler())
    with opener.open(request, timeout=TIMEOUT) as response:
        status = getattr(response, "status", response.getcode())
        if status in (401, 403, 429):
            raise PermissionError(f"HTTP {status}")
        validate_wechat_url(response.geturl())
        raw = response.read(MAX_PAGE_BYTES)
        encoding = response.headers.get_content_charset() or "utf-8"
    page = raw.decode(encoding, errors="replace")
    lowered = page.lower()
    if any(marker.lower() in lowered for marker in BLOCKED_MARKERS):
        raise PermissionError("\u9875\u9762\u8981\u6c42\u767b\u5f55\u3001\u9a8c\u8bc1\u6216\u9650\u5236\u8bbf\u95ee")
    return page


def matched_keywords(title: str) -> list[str]:
    result: list[str] = []
    for keyword in list(CHECKER.KEYWORDS) + EXTRA_KEYWORDS:
        if keyword in title and keyword not in result:
            result.append(keyword)
    return result


def build_candidate(url: str, metadata: dict[str, str], today: dt.date) -> dict[str, Any]:
    title = metadata.get("title", "")
    keywords = matched_keywords(title)
    possible_date = metadata.get("possibleDate", "")
    needs_date_review = not bool(possible_date)
    status = "pending"
    if possible_date and not CHECKER.is_recent(possible_date, today):
        status = "older"
    required = (title, metadata.get("source", ""), possible_date, metadata.get("author", ""))
    return {
        "id": "candidate-" + hashlib.sha256(url.encode("utf-8")).hexdigest()[:12],
        "title": title,
        "source": metadata.get("source", ""),
        "sourceUrl": url,
        "possibleDate": possible_date,
        "author": metadata.get("author", ""),
        "matchedKeywords": keywords,
        "suggestedTopics": [topic for topic in CHECKER.OBJECTS if topic in keywords],
        "discoveredAt": today.isoformat(),
        "status": status,
        "needsDateReview": needs_date_review,
        "sourceType": "wechat",
        "preferOriginalSource": True,
        "needsManualMetadata": not all(required),
    }


def existing_records(candidates: dict[str, Any], seen: dict[str, Any]) -> tuple[list[dict[str, str]], list[dict[str, Any]]]:
    formal_urls, formal_titles = CHECKER.load_formal()
    formal = [{"sourceUrl": url, "title": ""} for url in formal_urls]
    formal.extend({"sourceUrl": "", "title": title} for title in formal_titles)
    candidate_records = list(candidates.get("candidates", []))
    candidate_records.extend(candidates.get("olderCandidates", []))
    candidate_records.extend(seen.get("items", []))
    return formal, candidate_records


def duplicate_location(item: dict[str, Any], formal: list[dict[str, str]], candidates: list[dict[str, Any]]) -> str | None:
    item_url = comparable_url(item["sourceUrl"])
    for location, records in (("formal", formal), ("candidate", candidates)):
        if any(record.get("sourceUrl") and comparable_url(str(record["sourceUrl"])) == item_url for record in records):
            return location

    title = str(item.get("title", ""))
    if not title:
        return None
    normalized_title = CHECKER.normalized(title)
    for location, records in (("formal", formal), ("candidate", candidates)):
        if any(record.get("title") and CHECKER.normalized(str(record["title"])) == normalized_title for record in records):
            return location
    for location, records in (("formal", formal), ("candidate", candidates)):
        if any(record.get("title") and CHECKER.similar(title, str(record["title"])) for record in records):
            return location
    return None


def print_duplicate(location: str, url: str) -> None:
    if location == "formal":
        print(f"\u8be5\u6587\u7ae0\u5df2\u5b58\u5728\u4e8e\u6b63\u5f0f\u52a8\u6001\u4e2d\u3002 {url}")
    else:
        print(f"\u8be5\u6587\u7ae0\u5df2\u5b58\u5728\u4e8e\u5019\u9009\u8bb0\u5f55\u4e2d\u3002 {url}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Import explicit public WeChat article URLs as review candidates.")
    parser.add_argument("urls", nargs="+", help="One or more https://mp.weixin.qq.com/s... article URLs")
    parser.add_argument("--dry-run", action="store_true", help="Do not access the network or write files.")
    args = parser.parse_args()
    if len(args.urls) > MAX_URLS:
        parser.error(f"A maximum of {MAX_URLS} explicitly supplied URLs is allowed per run.")

    candidates = CHECKER.read_json(CANDIDATES, {"generatedAt": None, "candidates": [], "olderCandidates": []})
    seen = CHECKER.read_json(SEEN, {"items": []})
    if not isinstance(candidates, dict) or not isinstance(seen, dict):
        print("\u5019\u9009\u6216\u5df2\u89c1\u8bb0\u5f55 JSON \u683c\u5f0f\u65e0\u6548\u3002", file=sys.stderr)
        return 2

    formal_records, candidate_records = existing_records(candidates, seen)
    today = dt.date.today()
    additions: list[dict[str, Any]] = []
    invalid_count = 0

    for index, raw_url in enumerate(args.urls):
        url = raw_url.strip()
        try:
            validate_wechat_url(url)
        except ValueError as error:
            invalid_count += 1
            print(f"\u65e0\u6548 URL\uff1a{url} ({error})", file=sys.stderr)
            continue

        url_only = build_candidate(url, {}, today)
        duplicate = duplicate_location(url_only, formal_records, candidate_records + additions)
        if duplicate:
            print_duplicate(duplicate, url)
            continue

        metadata: dict[str, str] = {}
        if args.dry_run:
            print(f"DRY-RUN: \u4e0d\u8054\u7f51\uff0c\u4e3a\u8be5 URL \u751f\u6210\u5f85\u4eba\u5de5\u8865\u5145\u6846\u67b6\u3002 {url}")
        else:
            try:
                metadata = extract_metadata(fetch_public_article(url))
            except (PermissionError, HTTPError, URLError, TimeoutError, OSError, UnicodeError, ValueError) as error:
                print(f"\u9875\u9762\u65e0\u6cd5\u53ef\u9760\u8bfb\u53d6\uff0c\u5df2\u751f\u6210\u5f85\u4eba\u5de5\u8865\u5145\u5019\u9009\uff1a{url} ({error})")

        item = build_candidate(url, metadata, today)
        duplicate = duplicate_location(item, formal_records, candidate_records + additions)
        if duplicate:
            print_duplicate(duplicate, url)
            continue
        additions.append(item)
        print(json.dumps(item, ensure_ascii=False, indent=2))

        if not args.dry_run and index < len(args.urls) - 1:
            time.sleep(INTERVAL)

    if args.dry_run:
        print(f"DRY-RUN complete: planned={len(additions)} writes=0 network_requests=0")
        return 2 if invalid_count else 0

    if additions:
        candidates.setdefault("candidates", [])
        candidates.setdefault("olderCandidates", [])
        for item in additions:
            bucket = "olderCandidates" if item["status"] == "older" else "candidates"
            candidates[bucket].append(item)
        candidates["generatedAt"] = dt.datetime.now().isoformat(timespec="seconds")
        CHECKER.write_json(CANDIDATES, candidates)

        seen.setdefault("items", [])
        seen_urls = {comparable_url(str(item.get("sourceUrl", ""))) for item in seen["items"] if item.get("sourceUrl")}
        for item in additions:
            if comparable_url(item["sourceUrl"]) not in seen_urls:
                seen["items"].append({
                    "id": item["id"],
                    "title": item["title"],
                    "source": item["source"],
                    "sourceUrl": item["sourceUrl"],
                    "firstSeenAt": item["discoveredAt"],
                    "sourceType": "wechat",
                })
        CHECKER.write_json(SEEN, seen)
        print(f"\u5df2\u5199\u5165\u5019\u9009\uff1a{len(additions)} \u6761\u3002\u672a\u4fee\u6539 academic-updates.js\u3002")
    else:
        print("\u6ca1\u6709\u65b0\u5019\u9009\u9700\u8981\u5199\u5165\u3002\u672a\u4fee\u6539 academic-updates.js\u3002")
    return 2 if invalid_count else 0


if __name__ == "__main__":
    raise SystemExit(main())
