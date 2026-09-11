#!/usr/bin/env python3
"""V1.2 local candidate finder. It never writes academic-updates.js."""

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

sys.path.insert(0, str(Path(__file__).resolve().parent))
import candidate_store as store

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
SOURCES = DATA / "sources.json"
CANDIDATES = DATA / "candidate-updates.json"
SEEN = DATA / "seen-items.json"
FORMAL = ROOT / "academic-updates.js"
TIMEOUT = 12
INTERVAL = 1.5
MAX_LINKS = 120
USER_AGENT = "AncientChineseWritingAcademicHub/1.2 (local academic candidate checker)"

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
LEGACY_KEYWORDS = OBJECTS + GENERAL
CATEGORY_ALIASES = {
    "oracle": "oracle", "甲骨文": "oracle", "甲骨": "oracle",
    "bronze": "bronze", "金文": "bronze",
    "stone": "stone", "石刻": "stone",
    "slips": "slips", "简牍": "slips", "簡牘": "slips",
    "silk": "silk", "帛书": "silk", "帛書": "silk",
}
CATEGORY_KEYWORDS = {
    "oracle": ["甲骨文", "甲骨", "卜辞", "卜辭", "殷墟"],
    "bronze": ["金文", "青铜器", "青銅器", "铭文", "銘文", "钟鼎文", "鐘鼎文"],
    "stone": ["石刻", "碑刻", "碑铭", "碑銘", "墓志", "墓誌", "拓片", "拓本", "造像"],
    "silk": ["帛书", "帛書", "楚帛书", "楚帛書", "马王堆", "馬王堆"],
    "slips": ["简牍", "簡牘", "简帛", "簡帛", "汉简", "漢簡", "竹简", "竹簡"],
}
EXCLUDED_RECRUITMENT_TITLE_KEYWORDS = (
    "招聘", "招聘启事", "教师招聘", "博士后招聘", "人才招聘", "岗位招聘", "招募", "聘用", "职位",
)
EXCLUDED_ADMIN_TITLE_KEYWORDS = (
    "人事任免", "党建", "党支部", "验收", "签约", "揭牌", "任免", "招生", "就业", "实习", "培训通知", "行政通知",
)
RESEARCH_STUDENT_ADMIN_CONTEXT = ("招生", "就业", "培养", "管理", "通知", "报名", "录取", "岗位")
ADMIN_AWARD_CONTEXT = ("行政", "党建", "党支部", "人事", "评优")
EXCLUDED_TITLE_KEYWORDS = EXCLUDED_RECRUITMENT_TITLE_KEYWORDS + EXCLUDED_ADMIN_TITLE_KEYWORDS
LECTURE_TITLE_KEYWORDS = ("讲座", "学术报告", "报告会")
LECTURE_KEEP_TITLE_KEYWORDS = ("线上", "在线", "直播", "回放", "视频", "讲义", "纪要", "实录", "内容整理")
LECTURE_RESEARCH_RESULT_KEYWORDS = ("新发现", "新释读", "新成果", "研究成果", "研究发现", "研究进展", "成果发布")
CORE_RESEARCH_KEYWORDS = (
    "甲骨文", "甲骨", "卜辞", "卜辭", "金文", "青铜器", "青銅器", "铭文", "銘文", "石刻", "碑刻", "碑铭", "碑銘",
    "墓志", "墓誌", "拓片", "拓本", "简牍", "簡牘", "简帛", "簡帛", "汉简", "漢簡", "竹简", "竹簡",
    "帛书", "帛書", "楚帛书", "楚帛書", "马王堆", "馬王堆", "出土文献", "古文字", "释读", "釋讀", "释文", "釋文",
)
HIGH_VALUE_TITLE_KEYWORDS = (
    "新论文", "论文发表", "论文", "新书", "新資料", "新资料", "新出土", "数据库开放", "数据库更新", "数据库上线",
    "数据库", "資料庫", "出土", "新释读", "新釋讀", "释读", "釋讀", "正式出版", "出版", "专著", "專著",
    "学术会议", "学术研讨会", "国际会议", "会议", "會議", "研讨会", "研討會", "论坛征稿", "会议征稿", "征稿启事", "征稿",
    "研究成果", "讲座纪要", "内容实录", "在线讲座", "在线", "线上", "视频讲座", "视频", "直播", "回放", "纪要", "實錄", "实录", "讲义",
)
GENERIC_TITLE_KEYWORDS = ("研究生", "通知", "新闻", "新闻", "活动", "活動", "讲座", "講座")
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


def string_list(value: Any) -> list[str]:
    """Read a configuration list while tolerating the old single-string form."""
    if isinstance(value, str):
        values = [value]
    elif isinstance(value, list):
        values = [str(item).strip() for item in value]
    else:
        values = []
    return list(dict.fromkeys(item for item in values if item))


def source_url_key(url: str) -> str:
    parsed = urlparse(url.strip())
    if not parsed.netloc:
        return url.strip().lower().rstrip("/")
    path = parsed.path.rstrip("/") or "/"
    return f"{parsed.scheme.lower()}://{parsed.netloc.lower()}{path}{('?' + parsed.query) if parsed.query else ''}"


def normalize_category(value: str) -> str:
    return CATEGORY_ALIASES.get(value.strip(), value.strip())


def merge_source_records(sources: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Collapse duplicate source records so one source is fetched only once."""
    merged: dict[str, dict[str, Any]] = {}
    order: list[str] = []
    for source in sources:
        if not isinstance(source, dict) or not str(source.get("url", "")).strip():
            continue
        key = source_url_key(str(source["url"]))
        if key not in merged:
            current = dict(source)
            current["categories"] = list(dict.fromkeys(normalize_category(item) for item in string_list(source.get("categories"))))
            current["keywords"] = string_list(source.get("keywords"))
            merged[key] = current
            order.append(key)
            continue
        current = merged[key]
        current["categories"] = list(dict.fromkeys(source_categories(current) + [normalize_category(item) for item in string_list(source.get("categories"))]))
        current["keywords"] = list(dict.fromkeys(string_list(current.get("keywords")) + string_list(source.get("keywords"))))
        current_config = current.setdefault("categoryKeywords", {})
        source_config = source.get("categoryKeywords", {})
        if isinstance(current_config, dict) and isinstance(source_config, dict):
            for category, terms in source_config.items():
                canonical = normalize_category(str(category))
                current_config[canonical] = list(dict.fromkeys(string_list(current_config.get(canonical)) + string_list(terms)))
        current["enabled"] = bool(current.get("enabled")) or bool(source.get("enabled"))
        current["manualReview"] = bool(current.get("manualReview")) or bool(source.get("manualReview"))
        current["maxDetailRequests"] = max(int(current.get("maxDetailRequests", 0)), int(source.get("maxDetailRequests", 0)))
        notes = [str(current.get("note", current.get("notes", ""))).strip(), str(source.get("note", source.get("notes", ""))).strip()]
        current["note"] = " ".join(dict.fromkeys(note for note in notes if note))
    return [merged[key] for key in order]


def source_keywords(source: dict[str, Any]) -> list[str]:
    return string_list(source.get("keywords")) or LEGACY_KEYWORDS


def source_categories(source: dict[str, Any]) -> list[str]:
    return list(dict.fromkeys(normalize_category(item) for item in string_list(source.get("categories"))))


def matched_categories(source: dict[str, Any], title: str) -> list[str]:
    """Keep explicit category matches narrow, while retaining a source's declared scope otherwise."""
    categories = source_categories(source)
    configured = source.get("categoryKeywords")
    matches: list[str] = []
    for category in categories:
        if isinstance(configured, dict):
            terms = string_list(configured.get(category)) or CATEGORY_KEYWORDS.get(category, [category])
        else:
            terms = CATEGORY_KEYWORDS.get(category, [category])
        if any(term in title for term in terms):
            matches.append(category)
    return matches or (categories if len(categories) == 1 else [])


def load_formal() -> tuple[set[str], list[str]]:
    text = FORMAL.read_text(encoding="utf-8")
    return set(URL_RE.findall(text)), TITLE_RE.findall(text)


def find_keywords(title: str, source: dict[str, Any] | None = None) -> list[str]:
    keywords = source_keywords(source) if source is not None else LEGACY_KEYWORDS
    return [word for word in keywords if word in title]


def title_exclusion_reason(title: str) -> str | None:
    """Return a reason for excluding low-value titles before candidate creation.

    This intentionally inspects the link title only. The checker does not fetch
    article bodies at admission time, so incidental body text cannot trigger a
    false exclusion.
    """
    if any(keyword in title for keyword in EXCLUDED_RECRUITMENT_TITLE_KEYWORDS):
        return "recruitment"
    if any(keyword in title for keyword in HIGH_VALUE_TITLE_KEYWORDS):
        return None
    if any(keyword in title for keyword in EXCLUDED_ADMIN_TITLE_KEYWORDS):
        return "admin"
    if "研究生" in title and any(keyword in title for keyword in RESEARCH_STUDENT_ADMIN_CONTEXT):
        return "admin"
    if ("获奖" in title or "表彰" in title) and any(keyword in title for keyword in ADMIN_AWARD_CONTEXT):
        return "admin"
    if any(keyword in title for keyword in LECTURE_TITLE_KEYWORDS):
        if any(keyword in title for keyword in LECTURE_KEEP_TITLE_KEYWORDS):
            return None
        if any(keyword in title for keyword in LECTURE_RESEARCH_RESULT_KEYWORDS) and any(keyword in title for keyword in CORE_RESEARCH_KEYWORDS):
            return None
        return "offline_lecture"
    compact_title = normalized(title)
    if len(compact_title) <= 12 and any(keyword in title for keyword in GENERIC_TITLE_KEYWORDS):
        if not any(keyword in title for keyword in CORE_RESEARCH_KEYWORDS + HIGH_VALUE_TITLE_KEYWORDS):
            return "generic"
    return None


def is_excluded_title(title: str) -> bool:
    """Compatibility wrapper used by the source manager and tests."""
    return title_exclusion_reason(title) is not None


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
    matched = find_keywords(link["title"], source)
    source_name = str(source["name"]).replace(" [home]", "")
    return {
        "id": "candidate-" + hashlib.sha256(absolute_url.encode("utf-8")).hexdigest()[:12],
        "title": link["title"],
        "source": source_name,
        "sourceUrl": absolute_url,
        "discoveredAt": found_at,
        "possibleDate": date_from_text(link.get("context", "")) or date_from_url(absolute_url),
        "categories": matched_categories(source, link["title"]),
        "matchedKeywords": matched,
        "suggestedTopics": [item for item in OBJECTS if item in matched and item != "\u94f6\u5ea7\u5c71\u6c49\u7b80"],
        "status": "pending",
        "needsDateReview": False,
    }


def merge_candidate(target: dict[str, Any], incoming: dict[str, Any]) -> None:
    """Merge metadata from a duplicate discovery without changing review state."""
    for field in ("categories", "matchedKeywords", "suggestedTopics"):
        target[field] = list(dict.fromkeys(string_list(target.get(field)) + string_list(incoming.get(field))))
    if not target.get("possibleDate") and incoming.get("possibleDate"):
        target["possibleDate"] = incoming["possibleDate"]
        target["needsDateReview"] = False
    target["discoveredAt"] = min(str(target.get("discoveredAt", incoming.get("discoveredAt", ""))), str(incoming.get("discoveredAt", "")))


def find_duplicate_candidate(item: dict[str, Any], collections: list[list[dict[str, Any]]]) -> dict[str, Any] | None:
    for collection in collections:
        for old in collection:
            if item["sourceUrl"] == old.get("sourceUrl") or similar(item["title"], str(old.get("title", ""))):
                return old
    return None


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
    print(f"\u5df2\u6392\u9664\u4f4e\u4ef7\u503c\u6807\u9898\uff1a{stats.get('excluded', 0)}")
    print(
        "\u6392\u9664\u5206\u7c7b\uff1a"
        f"recruitment={stats.get('excluded_recruitment', 0)} "
        f"admin={stats.get('excluded_admin', 0)} "
        f"offline_lecture={stats.get('excluded_offline_lecture', 0)} "
        f"generic={stats.get('excluded_generic', 0)}"
    )
    print("\u5019\u9009\u5df2\u4fdd\u5b58\uff1adata/candidate-updates.json")
    print("\u672c\u6b21\u6ca1\u6709\u4fee\u6539 academic-updates.js")
    print(
        "SUMMARY "
        f"checked={stats['checked']} success={stats['success']} manual={stats['manual']} "
        f"new={stats['new']} date_review={stats['date_review']} excluded={stats.get('excluded', 0)} "
        f"excluded_recruitment={stats.get('excluded_recruitment', 0)} "
        f"excluded_admin={stats.get('excluded_admin', 0)} "
        f"excluded_offline_lecture={stats.get('excluded_offline_lecture', 0)} "
        f"excluded_generic={stats.get('excluded_generic', 0)}"
    )
    if manual:
        print("\u9700\u8981\u4eba\u5de5\u68c0\u67e5\u6765\u6e90\uff1a" + "\u3001".join(manual))


def main() -> int:
    parser = argparse.ArgumentParser(description="Low-frequency candidate finder; it never publishes results.")
    parser.add_argument("--dry-run", action="store_true", help="Read local configuration only; no network and no writes.")
    args = parser.parse_args()
    sources = read_json(SOURCES, [])
    candidates, candidate_revision = store.read_snapshot(CANDIDATES, {"generatedAt": None, "candidates": []})
    seen = read_json(SEEN, {"items": []})
    if not isinstance(sources, list) or not isinstance(candidates, dict) or not isinstance(seen, dict):
        print("JSON configuration is invalid.", file=sys.stderr)
        return 2
    sources = merge_source_records(sources)
    active = [source for source in sources if source.get("enabled")]
    if args.dry_run:
        load_formal()
        print("\u5b89\u5168\u6d4b\u8bd5\u5b8c\u6210\uff1a\u672a\u8fdb\u884c\u8054\u7f51\u8bf7\u6c42\uff0c\u672a\u5199\u5165\u4efb\u4f55\u6587\u4ef6\uff0c\u672a\u4fee\u6539 academic-updates.js\u3002")
        print(f"\u5df2\u542f\u7528\u6765\u6e90\uff1a{len(active)}")
        category_counts: dict[str, int] = {}
        for source in sources:
            for category in source_categories(source):
                category_counts[category] = category_counts.get(category, 0) + 1
        if category_counts:
            print("\u6765\u6e90\u95e8\u7c7b\uff1a" + "\u3001".join(f"{category}={count}" for category, count in category_counts.items()))
        return 0

    formal_urls, formal_titles = load_formal()
    known = candidates.get("candidates", [])
    known_older = candidates.get("olderCandidates", [])
    seen_items = seen.get("items", [])
    today = dt.date.today()
    found_at = today.isoformat()
    stats = {
        "checked": len(active), "success": 0, "manual": 0, "pages": 0, "matches": 0,
        "formal": 0, "duplicates": 0, "new": 0, "older": 0, "date_review": 0, "excluded": 0,
        "excluded_recruitment": 0, "excluded_admin": 0, "excluded_offline_lecture": 0, "excluded_generic": 0,
    }
    manual: list[str] = []
    additions: list[dict[str, Any]] = []
    older_additions: list[dict[str, Any]] = []
    seen_additions: list[dict[str, str]] = []
    seen_addition_urls: set[str] = set()

    for index, source in enumerate(active):
        if source.get("manualReview"):
            stats["manual"] += 1
            manual.append(str(source["name"]))
            continue
        try:
            links = fetch_homepage(source)
        except (PermissionError, HTTPError, URLError, TimeoutError, OSError, ValueError) as error:
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
            if not find_keywords(link["title"], source):
                continue
            exclusion_reason = title_exclusion_reason(link["title"])
            if exclusion_reason:
                stats["excluded"] += 1
                stats[f"excluded_{exclusion_reason}"] += 1
                print(f"\u5df2\u6392\u9664 {exclusion_reason} \u5019\u9009\uff1a{link['title']}")
                continue
            stats["matches"] += 1
            item = candidate(source, link, found_at)
            reason = duplicate_reason(item, formal_urls, formal_titles, known + known_older + additions + older_additions, seen_items)
            if item["sourceUrl"] not in seen_addition_urls:
                seen_addition_urls.add(item["sourceUrl"])
                seen_additions.append({"id": item["id"], "title": item["title"], "source": item["source"], "sourceUrl": item["sourceUrl"], "firstSeenAt": found_at})
            if reason == "formal":
                stats["formal"] += 1
                continue
            elif reason:
                duplicate = find_duplicate_candidate(item, [known, known_older, additions, older_additions])
                if duplicate is not None:
                    merge_candidate(duplicate, item)
                stats["duplicates"] += 1
                continue
            if not item["possibleDate"] and not detail_blocked and detail_requests < int(source.get("maxDetailRequests", 6)):
                detail_requests += 1
                try:
                    item["possibleDate"] = detail_date(item["sourceUrl"])
                except (PermissionError, HTTPError, URLError, TimeoutError, OSError, ValueError) as error:
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
    try:
        store.save(CANDIDATES, candidates, candidate_revision)
    except store.CandidateConflict as error:
        print(f"周检保存冲突：{error}", file=sys.stderr)
        return 2
    write_json(SEEN, seen)
    report(stats, manual)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
