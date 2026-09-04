#!/usr/bin/env python3
"""V0.8A local candidate finder. It never writes academic-updates.js."""

from __future__ import annotations

import argparse
import datetime as dt
import difflib
import hashlib
import html
import json
import re
import sys
import time
from html.parser import HTMLParser
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
SOURCES = DATA / "sources.json"
CANDIDATES = DATA / "candidate-updates.json"
SEEN = DATA / "seen-items.json"
FORMAL = ROOT / "academic-updates.js"
TIMEOUT = 12
INTERVAL = 1.5
MAX_LINKS = 120
USER_AGENT = "AncientChineseWritingAcademicHub/0.8A (local academic candidate checker)"

OBJECTS = [
    "\u5c45\u5ef6\u6c49\u7b80", "\u5c45\u5ef6\u65b0\u7b80", "\u60ac\u6cc9\u6c49\u7b80", "\u6566\u714c\u6c49\u7b80",
    "\u7389\u95e8\u5173\u6c49\u7b80", "\u80a9\u6c34\u91d1\u5173", "\u6b66\u5a01\u6c49\u7b80", "\u5c39\u6e7e\u6c49\u7b80",
    "\u94f6\u96c0\u5c71\u6c49\u7b80", "\u94f6\u5ea7\u5c71\u6c49\u7b80", "\u5f20\u5bb6\u5c71\u6c49\u7b80",
    "\u4e94\u4e00\u5e7f\u573a\u4e1c\u6c49\u7b80", "\u8d70\u9a6c\u697c\u897f\u6c49\u7b80",
]
GENERAL = [
    "\u6c49\u7b80", "\u6c49\u4ee3\u7b80\u724d", "\u79e6\u6c49\u7b80\u724d", "\u7b80\u724d\u6587\u5b57",
    "\u7b80\u724d\u91ca\u6587", "\u7b80\u724d\u7f00\u5408", "\u7b80\u724d\u6574\u7406",
    "\u6c49\u4ee3\u884c\u653f\u6587\u4e66", "\u6c49\u4ee3\u6cd5\u5f8b\u6587\u4e66", "\u6570\u5b57\u7b80\u724d",
]
KEYWORDS = OBJECTS + GENERAL
BLOCKED = ("\u9a8c\u8bc1\u7801", "captcha", "\u8bbf\u95ee\u9a8c\u8bc1", "\u5b89\u5168\u9a8c\u8bc1", "\u8bf7\u5148\u767b\u5f55", "\u767b\u5f55\u540e")
DASH_DATE_RE = re.compile(r"\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b")
CHINESE_DATE_RE = re.compile(r"(20\d{2})\u5e74\s*(\d{1,2})\u6708\s*(\d{1,2})\u65e5")
LABELED_DATE_RE = re.compile(r"(?:\u53d1\u5e03\u65f6\u95f4|\u53d1\u5e03\u65e5\u671f|\u65e5\u671f)\s*[:\uff1a]?\s*(20\d{2}(?:[-/.]\d{1,2}[-/.]\d{1,2}|\u5e74\s*\d{1,2}\u6708\s*\d{1,2}\u65e5))")
TIME_DATE_RE = re.compile(r"<time[^>]+datetime=[\"']([^\"']+)[\"']", re.I)
META_DATE_RE = re.compile(r"<meta[^>]+(?:article:published_time|publishdate|datepublished)[^>]+content=[\"']([^\"']+)[\"']", re.I)
TITLE_RE = re.compile(r'title\s*:\s*"([^"]+)"')
URL_RE = re.compile(r'sourceUrl\s*:\s*"([^"]+)"')


class LinkCollector(HTMLParser):
    """Collect ordinary public text links without running page scripts."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.links: list[dict[str, str]] = []
        self.href: str | None = None
        self.parts: list[str] = []
        self.page_parts: list[str] = []
        self.page_length = 0
        self.start = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag == "a":
            self.href = dict(attrs).get("href")
            self.parts = []
            self.start = self.page_length

    def handle_data(self, data: str) -> None:
        self.page_parts.append(data)
        self.page_length += len(data)
        if self.href is not None:
            self.parts.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag == "a" and self.href is not None:
            title = " ".join("".join(self.parts).split())
            if title:
                self.links.append({"title": html.unescape(title), "href": self.href, "start": str(self.start), "end": str(self.page_length)})
            self.href = None
            self.parts = []

    def collected_links(self) -> list[dict[str, str]]:
        page_text = "".join(self.page_parts)
        result: list[dict[str, str]] = []
        for link in self.links:
            start, end = int(link.pop("start")), int(link.pop("end"))
            link["context"] = page_text[max(0, start - 180): min(len(page_text), end + 240)]
            result.append(link)
        return result


def read_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


def write_json(path: Path, value: Any) -> None:
    with path.open("w", encoding="utf-8", newline="\n") as file:
        json.dump(value, file, ensure_ascii=False, indent=2)
        file.write("\n")


def normalized(value: str) -> str:
    return re.sub(r"[^0-9a-z\u4e00-\u9fff]", "", value.lower())


def similar(left: str, right: str) -> bool:
    left, right = normalized(left), normalized(right)
    if not left or not right:
        return False
    if left == right:
        return True
    if min(len(left), len(right)) >= 8 and (left in right or right in left):
        return True
    return difflib.SequenceMatcher(None, left, right).ratio() >= 0.88


def load_formal() -> tuple[set[str], list[str]]:
    text = FORMAL.read_text(encoding="utf-8")
    return set(URL_RE.findall(text)), TITLE_RE.findall(text)


def find_keywords(title: str) -> list[str]:
    return [word for word in KEYWORDS if word in title]


def normalized_date(year: str, month: str, day: str) -> str:
    try:
        return dt.date(int(year), int(month), int(day)).isoformat()
    except ValueError:
        return ""


def date_from_text(text: str) -> str:
    """Extract a reliable full date and normalize it to YYYY-MM-DD."""
    labeled = LABELED_DATE_RE.search(text)
    if labeled:
        date = date_from_text(labeled.group(1))
        if date:
            return date
    chinese = CHINESE_DATE_RE.search(text)
    if chinese:
        return normalized_date(*chinese.groups())
    dashed = DASH_DATE_RE.search(text)
    if dashed:
        return normalized_date(*dashed.groups())
    return ""


def date_from_url(url: str) -> str:
    """Use a URL date only when it explicitly contains a complete date."""
    parsed = urlparse(url)
    return date_from_text(f"{parsed.path} {parsed.query}")


def date_from_html(page: str) -> str:
    """Prefer page metadata and time elements before searching visible text."""
    # Inspect attributes separately so metadata attribute order does not matter.
    for tag in re.findall(r"<meta\b[^>]*>", page, re.I):
        if re.search(r"article:published_time|publishdate|datepublished", tag, re.I):
            content = re.search(r"content=[\"']([^\"']+)[\"']", tag, re.I)
            if content:
                date = date_from_text(content.group(1))
                if date:
                    return date
    for pattern in (META_DATE_RE, TIME_DATE_RE):
        match = pattern.search(page)
        if match:
            date = date_from_text(match.group(1))
            if date:
                return date
    visible_text = re.sub(r"<[^>]+>", " ", page)
    return date_from_text(visible_text)


def is_recent(date_text: str, today: dt.date) -> bool:
    try:
        candidate_date = dt.date.fromisoformat(date_text)
    except ValueError:
        return False
    return today - dt.timedelta(days=365) <= candidate_date <= today


def request_public_page(url: str) -> str:
    request = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "text/html,application/xhtml+xml"})
    with urlopen(request, timeout=TIMEOUT) as response:
        status = getattr(response, "status", response.getcode())
        if status in (401, 403, 429):
            raise PermissionError(f"HTTP {status}")
        raw = response.read(1_500_000)
        encoding = response.headers.get_content_charset() or "utf-8"
    page = raw.decode(encoding, errors="replace")
    if any(marker.lower() in page.lower() for marker in BLOCKED):
        raise PermissionError("access control, login, or captcha marker")
    return page


def fetch_homepage(source: dict[str, Any]) -> list[dict[str, str]]:
    page = request_public_page(source["url"])
    parser = LinkCollector()
    parser.feed(page)
    return parser.collected_links()[:MAX_LINKS]


def detail_date(url: str) -> str:
    return date_from_html(request_public_page(url))


def candidate(source: dict[str, Any], link: dict[str, str], found_at: str) -> dict[str, Any]:
    absolute_url = urljoin(source["url"], link["href"])
    matched = find_keywords(link["title"])
    source_name = str(source["name"]).replace(" [home]", "")
    return {
        "id": "candidate-" + hashlib.sha256(absolute_url.encode("utf-8")).hexdigest()[:12],
        "title": link["title"],
        "source": source_name,
        "sourceUrl": absolute_url,
        "discoveredAt": found_at,
        "possibleDate": date_from_text(link.get("context", "")) or date_from_url(absolute_url),
        "matchedKeywords": matched,
        "suggestedTopics": [item for item in OBJECTS if item in matched and item != "\u94f6\u5ea7\u5c71\u6c49\u7b80"],
        "status": "pending",
        "needsDateReview": False,
    }


def duplicate_reason(item: dict[str, Any], formal_urls: set[str], formal_titles: list[str], known: list[dict[str, Any]], seen: list[dict[str, Any]]) -> str | None:
    if item["sourceUrl"] in formal_urls:
        return "formal"
    if any(similar(item["title"], title) for title in formal_titles):
        return "formal"
    for old in known:
        if item["sourceUrl"] == old.get("sourceUrl") or similar(item["title"], str(old.get("title", ""))):
            return "candidate"
    for old in seen:
        if item["sourceUrl"] == old.get("sourceUrl") or similar(item["title"], str(old.get("title", ""))):
            return "candidate"
    return None


def report(stats: dict[str, int], manual: list[str]) -> None:
    print("\u6c49\u4ee3\u7b80\u724d\u5b66\u672f\u52a8\u6001\u68c0\u67e5\u5b8c\u6210")
    print(f"\u68c0\u67e5\u6765\u6e90\uff1a{stats['checked']}")
    print(f"\u6210\u529f\u8bbf\u95ee\uff1a{stats['success']}")
    print(f"\u9700\u8981\u4eba\u5de5\u68c0\u67e5\uff1a{stats['manual']}")
    print(f"\u53d1\u73b0\u9875\u9762\uff1a{stats['pages']}")
    print(f"\u5173\u952e\u8bcd\u5339\u914d\uff1a{stats['matches']}")
    print(f"\u5df2\u6709\u52a8\u6001\uff1a{stats['formal']}")
    print(f"\u91cd\u590d\u5019\u9009\uff1a{stats['duplicates']}")
    print(f"\u65b0\u5019\u9009\uff1a{stats['new']}")
    print(f"\u5df2\u5f52\u6863\u65e7\u8d44\u6599\uff1a{stats['older']}")
    print(f"\u65e5\u671f\u5f85\u4eba\u5de5\u786e\u8ba4\uff1a{stats['date_review']}")
    print("\u5019\u9009\u5df2\u4fdd\u5b58\uff1adata/candidate-updates.json")
    print("\u672c\u6b21\u6ca1\u6709\u4fee\u6539 academic-updates.js")
    print(
        "SUMMARY "
        f"checked={stats['checked']} success={stats['success']} manual={stats['manual']} "
        f"new={stats['new']} date_review={stats['date_review']}"
    )
    if manual:
        print("\u9700\u8981\u4eba\u5de5\u68c0\u67e5\u6765\u6e90\uff1a" + "\u3001".join(manual))


def main() -> int:
    parser = argparse.ArgumentParser(description="Low-frequency candidate finder; it never publishes results.")
    parser.add_argument("--dry-run", action="store_true", help="Read local configuration only; no network and no writes.")
    args = parser.parse_args()
    sources = read_json(SOURCES, [])
    candidates = read_json(CANDIDATES, {"generatedAt": None, "candidates": []})
    seen = read_json(SEEN, {"items": []})
    if not isinstance(sources, list) or not isinstance(candidates, dict) or not isinstance(seen, dict):
        print("JSON configuration is invalid.", file=sys.stderr)
        return 2
    active = [source for source in sources if source.get("enabled")]
    if args.dry_run:
        load_formal()
        print("\u5b89\u5168\u6d4b\u8bd5\u5b8c\u6210\uff1a\u672a\u8fdb\u884c\u8054\u7f51\u8bf7\u6c42\uff0c\u672a\u5199\u5165\u4efb\u4f55\u6587\u4ef6\uff0c\u672a\u4fee\u6539 academic-updates.js\u3002")
        print(f"\u5df2\u542f\u7528\u6765\u6e90\uff1a{len(active)}")
        return 0

    formal_urls, formal_titles = load_formal()
    known = candidates.get("candidates", [])
    known_older = candidates.get("olderCandidates", [])
    seen_items = seen.get("items", [])
    today = dt.date.today()
    found_at = today.isoformat()
    stats = {"checked": len(active), "success": 0, "manual": 0, "pages": 0, "matches": 0, "formal": 0, "duplicates": 0, "new": 0, "older": 0, "date_review": 0}
    manual: list[str] = []
    additions: list[dict[str, Any]] = []
    older_additions: list[dict[str, Any]] = []
    seen_additions: list[dict[str, str]] = []

    for index, source in enumerate(active):
        if source.get("manualReview"):
            stats["manual"] += 1
            manual.append(str(source["name"]))
            continue
        try:
            links = fetch_homepage(source)
        except (PermissionError, HTTPError, URLError, TimeoutError, OSError) as error:
            stats["manual"] += 1
            manual.append(str(source["name"]))
            print(f"\u9700\u8981\u4eba\u5de5\u68c0\u67e5\uff1a{source['name']} ({error})")
            continue
        stats["success"] += 1
        stats["pages"] += len(links)
        detail_requests = 0
        detail_blocked = False
        for link in links:
            absolute = urljoin(source["url"], link["href"])
            if urlparse(absolute).netloc != urlparse(source["url"]).netloc:
                continue
            if not find_keywords(link["title"]):
                continue
            stats["matches"] += 1
            item = candidate(source, link, found_at)
            reason = duplicate_reason(item, formal_urls, formal_titles, known + known_older + additions + older_additions, seen_items)
            seen_additions.append({"id": item["id"], "title": item["title"], "source": item["source"], "sourceUrl": item["sourceUrl"], "firstSeenAt": found_at})
            if reason == "formal":
                stats["formal"] += 1
                continue
            elif reason:
                stats["duplicates"] += 1
                continue
            if not item["possibleDate"] and not detail_blocked and detail_requests < int(source.get("maxDetailRequests", 6)):
                detail_requests += 1
                try:
                    item["possibleDate"] = detail_date(item["sourceUrl"])
                except (PermissionError, HTTPError, URLError, TimeoutError, OSError) as error:
                    detail_blocked = True
                    if str(source["name"]) not in manual:
                        stats["manual"] += 1
                        manual.append(str(source["name"]))
                    print(f"\u9700\u8981\u4eba\u5de5\u68c0\u67e5\uff1a{source['name']} ({error})")
            if item["possibleDate"]:
                item["needsDateReview"] = False
                if not is_recent(item["possibleDate"], today):
                    item["status"] = "older"
                    older_additions.append(item)
                    stats["older"] += 1
                    continue
            else:
                item["needsDateReview"] = True
                stats["date_review"] += 1
            additions.append(item)
            stats["new"] += 1
        if index < len(active) - 1:
            time.sleep(INTERVAL)

    migrated_older = [item for item in known if item.get("status") == "older"]
    candidates["generatedAt"] = dt.datetime.now().isoformat(timespec="seconds")
    candidates["candidates"] = [item for item in known if item.get("status") != "older"] + additions
    candidates["olderCandidates"] = known_older + migrated_older + older_additions
    old_urls = {str(item.get("sourceUrl", "")) for item in seen_items}
    seen["items"] = seen_items + [item for item in seen_additions if item["sourceUrl"] not in old_urls]
    write_json(CANDIDATES, candidates)
    write_json(SEEN, seen)
    report(stats, manual)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
