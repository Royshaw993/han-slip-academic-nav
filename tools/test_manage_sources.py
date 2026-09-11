#!/usr/bin/env python3
"""静态/内存测试：资讯来源管理助手的校验、保存和来源去重。"""

from __future__ import annotations

import hashlib
import http.client
import importlib.util
import json
import sys
import tempfile
import threading
import unittest
from pathlib import Path
from unittest.mock import patch


sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parent.parent
SPEC = importlib.util.spec_from_file_location("manage_sources", ROOT / "tools" / "manage-sources.py")
assert SPEC and SPEC.loader
MANAGER = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = MANAGER
SPEC.loader.exec_module(MANAGER)


class ManageSourcesTests(unittest.TestCase):
    def fixture_root(self, value: list[dict]) -> tuple[tempfile.TemporaryDirectory, Path, bytes]:
        temporary = tempfile.TemporaryDirectory()
        root = Path(temporary.name)
        (root / "data").mkdir()
        raw = (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
        (root / "data" / "sources.json").write_bytes(raw)
        return temporary, root, raw

    def valid_source(self, **overrides: object) -> dict:
        source = {
            "id": "example-source",
            "name": "示例来源",
            "url": "https://example.org/",
            "enabled": True,
            "sourceType": "academic-site",
            "categories": ["slips"],
            "keywords": ["简牍"],
            "priority": 2,
            "manualReview": False,
            "maxDetailRequests": 6,
            "note": "测试",
        }
        source.update(overrides)
        return source

    def test_current_sources_are_valid_and_manager_page_exists(self) -> None:
        sources = json.loads((ROOT / "data" / "sources.json").read_text(encoding="utf-8"))
        checked = MANAGER.validate_sources(sources)
        self.assertEqual(len(checked), 13)
        page = (ROOT / "tools" / "manage-sources.html").read_text(encoding="utf-8")
        for marker in ("/api/sources", "/api/save", "categoryFilter", "categoryKeywords", "priority", "note", "规则详情 ▾", "高级设置 ▾", 'document.createElement("details")'):
            self.assertIn(marker, page)
        self.assertNotIn('addText(card, source.id', page)
        self.assertNotIn('addText(card, `关键词：${list(source.keywords)', page)

    def test_simple_form_and_automatic_defaults_contract(self) -> None:
        page = (ROOT / "tools" / "manage-sources.html").read_text(encoding="utf-8")
        simple_form = page.split('<details id="advancedSettings"', 1)[0].split('<form id="sourceForm"', 1)[1]
        for field_id in ("sourceName", "sourceUrl", "categories", "keywords", "note", "enabled"):
            self.assertIn(f'id="{field_id}"', simple_form)
        for technical_id in ("sourceId", "sourceType", "priority", "maxDetailRequests", "manualReview", "categoryKeywordFields"):
            self.assertNotIn(f'id="{technical_id}"', simple_form)
        for marker in ('value="official"', 'value="5"', 'value="6"', 'id="enabled" type="checkbox" checked'):
            self.assertIn(marker, page)
        for marker in ("sourceIdSuggestion", "idManuallyEdited", "normalizeUrl", "请至少选择一个门类"):
            self.assertIn(marker, page)

        completed = MANAGER.normalize_source({
            "id": "new-academic-source",
            "name": "新学术来源",
            "url": "https://new.example/",
            "categories": ["金文"],
            "keywords": ["铭文"],
        })
        self.assertEqual(completed["categories"], ["bronze"])
        self.assertEqual(completed["sourceType"], "official")
        self.assertEqual(completed["priority"], 5)
        self.assertEqual(completed["maxDetailRequests"], 6)
        self.assertTrue(completed["enabled"])
        self.assertEqual(completed["categoryKeywords"], {})

    def test_category_keyword_form_and_edit_preservation_contract(self) -> None:
        page = (ROOT / "tools" / "manage-sources.html").read_text(encoding="utf-8")
        self.assertNotIn("categoryKeywords（JSON", page)
        for marker in ("门类专用关键词（可选）", "categoryExamples", "categoryKeywordDraft", "syncCategoryKeywordDraft", "Object.fromEntries"):
            self.assertIn(marker, page)
        for term in ("卜辞", "青铜器", "墓志", "汉简", "马王堆"):
            self.assertIn(term, page)

        original = self.valid_source(
            categoryKeywords={"slips": ["简牍", "竹简"]},
            customParserOption={"keep": True},
        )
        normalized = MANAGER.validate_sources([original])[0]
        self.assertEqual(normalized["categoryKeywords"], {"slips": ["简牍", "竹简"]})
        self.assertEqual(normalized["customParserOption"], {"keep": True})

    def test_category_keyword_editor_switches_sources_without_stale_draft_sync(self) -> None:
        page = (ROOT / "tools" / "manage-sources.html").read_text(encoding="utf-8")
        edit = page.split("function edit(", 1)[1].split("function readForm", 1)[0]
        self.assertLess(edit.index('$("#categoryKeywordFields").replaceChildren()'), edit.index("categoryKeywordDraft=Object.fromEntries"))
        self.assertIn("renderCategoryChecks(list(source.categories),false)", edit)
        self.assertIn("function renderCategoryKeywordFields(selected=selectedCategories(),sync=true)", page)
        self.assertIn("if(sync)syncCategoryKeywordDraft()", page)

        source_a = {"categoryKeywords": {"slips": ["A 原值"]}}
        source_b = {"categoryKeywords": {"silk": ["B 原值"]}}

        def open_source(source: dict) -> dict[str, list[str]]:
            # Mirrors the page contract: discard the previous input/draft, then load the source.
            return {category: list(terms) for category, terms in source["categoryKeywords"].items()}

        # A: unsaved edits in A cannot be carried into B.
        draft_a = open_source(source_a)
        draft_a["slips"] = ["A 未保存输入"]
        self.assertEqual({"silk": ["B 原值"]}, open_source(source_b))
        # B: cancelling A has the same isolated transition as any other source switch.
        open_source(source_a)
        self.assertEqual({"silk": ["B 原值"]}, open_source(source_b))
        # D: opening B repeatedly reconstructs the same complete keyword draft.
        self.assertEqual(open_source(source_b), open_source(source_b))

    def test_save_note_only_preserves_category_keywords(self) -> None:
        source = self.valid_source(categoryKeywords={"slips": ["简牍", "竹简"]})
        temporary, root, old_raw = self.fixture_root([source])
        self.addCleanup(temporary.cleanup)
        revision = hashlib.sha256(old_raw).hexdigest()
        changed = {**source, "note": "只修改备注"}
        MANAGER.save_sources(root, {"revision": revision, "sources": [changed]})
        saved = json.loads((root / "data" / "sources.json").read_text(encoding="utf-8"))[0]
        self.assertEqual("只修改备注", saved["note"])
        self.assertEqual({"slips": ["简牍", "竹简"]}, saved["categoryKeywords"])

    def test_empty_categories_are_rejected(self) -> None:
        with self.assertRaisesRegex(MANAGER.SourceError, "categories"):
            MANAGER.validate_sources([self.valid_source(categories=[])])

    def test_duplicate_id_url_and_invalid_url_are_rejected(self) -> None:
        with self.assertRaises(MANAGER.SourceError):
            MANAGER.validate_sources([self.valid_source(), self.valid_source(url="https://other.example/", name="另一个来源")])
        with self.assertRaises(MANAGER.SourceError):
            MANAGER.validate_sources([self.valid_source(), self.valid_source(id="other", name="另一个来源")])
        with self.assertRaises(MANAGER.SourceError):
            MANAGER.validate_sources([self.valid_source(url="javascript:alert(1)")])

    def test_save_creates_backup_and_updates_revision(self) -> None:
        temporary, root, old_raw = self.fixture_root([self.valid_source()])
        self.addCleanup(temporary.cleanup)
        new_source = self.valid_source(id="new-source", name="新增来源", url="https://new.example/")
        old_revision = hashlib.sha256(old_raw).hexdigest()
        new_revision = MANAGER.save_sources(root, {"revision": old_revision, "sources": [self.valid_source(), new_source]})
        self.assertNotEqual(old_revision, new_revision)
        self.assertEqual((root / "data" / "sources.review-backup.json").read_bytes(), old_raw)
        saved = json.loads((root / "data" / "sources.json").read_text(encoding="utf-8"))
        self.assertEqual([item["id"] for item in saved], ["example-source", "new-source"])

    def test_loopback_api_reads_sources_and_rejects_unknown_post(self) -> None:
        temporary, root, _old_raw = self.fixture_root([self.valid_source()])
        self.addCleanup(temporary.cleanup)
        server = MANAGER.SourceServer(root, 0)
        worker = threading.Thread(target=server.serve_forever, daemon=True)
        worker.start()

        def close_server() -> None:
            server.shutdown()
            worker.join(timeout=5)
            server.server_close()

        self.addCleanup(close_server)

        def request(method: str, path: str, payload: object | None = None) -> tuple[int, str]:
            connection = http.client.HTTPConnection("127.0.0.1", server.server_port, timeout=10)
            headers = {"X-Source-Token": server.token, "Content-Type": "application/json"}
            body = json.dumps(payload) if payload is not None else None
            connection.request(method, path, body, headers)
            response = connection.getresponse()
            result = response.status, response.read().decode("utf-8")
            connection.close()
            return result

        status, body = request("GET", "/api/sources")
        self.assertEqual(status, 200)
        self.assertEqual("example-source", json.loads(body)["sources"][0]["id"])
        self.assertEqual(404, request("POST", "/api/apply", {"source": self.valid_source()})[0])

    def test_revision_conflict_does_not_overwrite(self) -> None:
        temporary, root, old_raw = self.fixture_root([self.valid_source()])
        self.addCleanup(temporary.cleanup)
        with self.assertRaises(MANAGER.SourceError):
            MANAGER.save_sources(root, {"revision": "stale", "sources": [self.valid_source(name="不应写入")]})
        self.assertEqual((root / "data" / "sources.json").read_bytes(), old_raw)

    def test_write_failure_rolls_back_original_bytes(self) -> None:
        temporary, root, old_raw = self.fixture_root([self.valid_source()])
        self.addCleanup(temporary.cleanup)
        revision = hashlib.sha256(old_raw).hexdigest()
        original = MANAGER.atomic_write_bytes
        calls = {"source": 0}

        def fail_once(path: Path, content: bytes) -> None:
            if path.name == "sources.json":
                calls["source"] += 1
                if calls["source"] == 1:
                    raise OSError("模拟写入失败")
            original(path, content)

        with patch.object(MANAGER, "atomic_write_bytes", side_effect=fail_once):
            with self.assertRaises(OSError):
                MANAGER.save_sources(root, {"revision": revision, "sources": [self.valid_source(name="变更")]})
        self.assertEqual((root / "data" / "sources.json").read_bytes(), old_raw)

    def test_single_source_test_still_uses_checker(self) -> None:
        source = self.valid_source()
        links = [{"title": "简牍研究新成果", "url": "https://example.org/item"}]
        with patch.object(MANAGER.CHECKER, "fetch_homepage", return_value=links):
            result = MANAGER.test_source(source)
        self.assertEqual(result["status"], "accessible")
        self.assertEqual(result["matches"], ["简牍研究新成果"])

    def test_same_url_categories_merge_without_duplicate_fetch(self) -> None:
        first = self.valid_source(categories=["slips"], categoryKeywords={"slips": ["简牍"]})
        second = self.valid_source(id="same-url-silk", categories=["帛书"], categoryKeywords={"帛书": ["帛书"]})
        merged = MANAGER.CHECKER.merge_source_records([first, second])
        self.assertEqual(len(merged), 1)
        self.assertEqual(merged[0]["categories"], ["slips", "silk"])
        self.assertEqual(merged[0]["categoryKeywords"], {"slips": ["简牍"], "silk": ["帛书"]})

    def test_wuda_slips_silk_and_recruitment_filters(self) -> None:
        wuda = {
            "categories": ["slips", "silk"],
            "categoryKeywords": {"slips": ["简牍", "简帛"], "silk": ["帛书", "马王堆"]},
        }
        self.assertEqual(MANAGER.CHECKER.matched_categories(wuda, "简牍整理新发现"), ["slips"])
        self.assertEqual(MANAGER.CHECKER.matched_categories(wuda, "马王堆帛书研究"), ["silk"])
        self.assertEqual(MANAGER.CHECKER.matched_categories(wuda, "古文字研究"), [])
        self.assertTrue(MANAGER.CHECKER.is_excluded_title("2026年博士后招聘启事"))
        self.assertTrue(MANAGER.CHECKER.is_excluded_title("简牍学术讲座"))
        self.assertFalse(MANAGER.CHECKER.is_excluded_title("简牍研究学术会议征稿"))


if __name__ == "__main__":
    unittest.main(verbosity=2)
