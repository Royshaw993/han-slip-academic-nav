"""Necessary local safety checks; all mutations use temporary candidate copies."""
import http.client
import datetime as dt
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


def load(name, filename):
    spec = importlib.util.spec_from_file_location(name, ROOT / "tools" / filename)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


review = load("review_test", "review-candidates.py")
importer = load("wechat_test", "import-wechat-candidate.py")


class ReviewTests(unittest.TestCase):
    def test_review_a_stale_revision_cannot_overwrite_review_b(self):
        stale = self.payload("approved")
        review.save_decision(self.root, self.payload("rejected"))
        before = self.path.read_bytes()
        with self.assertRaisesRegex(review.ReviewError, "未覆盖"):
            review.save_decision(self.root, stale)
        self.assertEqual(before, self.path.read_bytes())

    def test_both_review_endpoints_detect_change_during_preparation(self):
        for endpoint in ("decision", "publish-info"):
            self.item["reviewDecision"] = "approved"
            self.write()
            payload = self.payload("historical")
            payload.update(id=self.item["id"], fields={"summary": "旧操作"})
            original_save = review.save_review
            changed = []
            def other_writer_then_save(path, raw, data, revision):
                current, latest = review.store.read_snapshot(path)
                current["candidates"][0]["reviewDecision"] = "rejected"
                review.store.save(path, current, latest)
                changed.append(path.read_bytes())
                return original_save(path, raw, data, revision)
            with patch.object(review, "save_review", side_effect=other_writer_then_save):
                with self.assertRaisesRegex(review.ReviewError, "未覆盖"):
                    (review.save_decision if endpoint == "decision" else review.save_publish_info)(self.root, payload)
            self.assertEqual(changed[0], self.path.read_bytes())

    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / "data").mkdir()
        self.path = self.root / "data/candidate-updates.json"
        self.item = {
            "id": "candidate-test", "title": "测试候选", "source": "测试来源",
            "sourceUrl": "https://example.com/test", "type": "新论文", "date": "2026-09-10",
            "summary": "仅用于隔离测试", "tags": ["汉代简牍文字"], "featured": False,
            "relatedResources": [], "status": "pending", "custom": {"keep": True},
        }
        self.data = {"generatedAt": "unchanged", "candidates": [self.item], "olderCandidates": [], "extra": [1, 2]}
        self.write()
        self.formal = self.root / "academic-updates.js"
        self.formal.write_bytes((ROOT / "academic-updates.js").read_bytes())

    def write(self):
        self.path.write_text(json.dumps(self.data, ensure_ascii=False), encoding="utf-8")

    def payload(self, decision="approved"):
        return {"ids": [self.item["id"]], "revision": review.snapshot(self.root)[2], "decision": decision}

    def test_all_decisions_preserve_original_fields_and_backup(self):
        for decision in review.DECISIONS:
            before = self.path.read_bytes()
            review.save_decision(self.root, self.payload(decision))
            self.assertEqual(before, self.path.with_suffix(".review-backup.json").read_bytes())
            data = json.loads(self.path.read_text(encoding="utf-8"))
            self.assertEqual(decision, data["candidates"][0].pop("reviewDecision"))
            self.assertEqual(self.data, data)

    def test_publish_info_save_preserves_decision_and_supports_empty_arrays(self):
        self.item["reviewDecision"] = "approved"
        for field in ("type", "date", "summary", "tags", "featured", "relatedResources"):
            self.item.pop(field, None)
        self.write()
        before = self.path.read_bytes()
        fields = {
            "type": "新论文", "date": "2026-09-11", "summary": "人工核对后的摘要",
            "tags": ["甲骨文", "释读"], "featured": False, "relatedResources": [],
        }
        review.save_publish_info(self.root, {"id": self.item["id"], "revision": review.snapshot(self.root)[2], "fields": fields})
        saved = json.loads(self.path.read_text(encoding="utf-8"))["candidates"][0]
        self.assertEqual(fields, {field: saved[field] for field in fields})
        self.assertEqual("approved", saved["reviewDecision"])
        self.assertEqual({"keep": True}, saved["custom"])
        self.assertEqual(before, self.path.with_suffix(".review-backup.json").read_bytes())

    def test_publish_info_rejects_bad_date_and_ineligible_decisions(self):
        self.item["reviewDecision"] = "approved"
        self.write()
        before = self.path.read_bytes()
        with self.assertRaises(review.ReviewError):
            review.save_publish_info(self.root, {"id": self.item["id"], "revision": review.snapshot(self.root)[2], "fields": {"date": "2026-9-1"}})
        self.assertEqual(before, self.path.read_bytes())
        for decision in ("deferred", "rejected"):
            self.item["reviewDecision"] = decision
            self.write()
            with self.assertRaises(review.ReviewError):
                review.save_publish_info(self.root, {"id": self.item["id"], "revision": review.snapshot(self.root)[2], "fields": {"summary": "不应保存"}})

    def test_publish_info_date_validation_accepts_real_dates_and_ranges(self):
        for value in ("2026-07-04", "2024-02-29", "2026-10-24 至 10-25"):
            self.assertEqual({"date": value}, review.validate_publish_info({"date": value}, self.root))
        for value in ("2026-02-30", "2026-04-31", "2026-13-01", "not-a-date", ""):
            with self.subTest(value=value):
                with self.assertRaisesRegex(review.ReviewError, "发布日期无效，请填写真实存在的日期"):
                    review.validate_publish_info({"date": value}, self.root)

    def test_publish_info_failed_write_rolls_back_candidates(self):
        self.item["reviewDecision"] = "historical"
        self.write()
        before = self.path.read_bytes()
        original = review.store.atomic_write_bytes
        calls = {"candidate": 0}

        def fail_once(path, text):
            if path.name == "candidate-updates.json":
                calls["candidate"] += 1
                if calls["candidate"] == 1:
                    raise OSError("test failure")
            original(path, text)

        with patch.object(review.store, "atomic_write_bytes", side_effect=fail_once):
            with self.assertRaises(OSError):
                review.save_publish_info(self.root, {"id": self.item["id"], "revision": review.snapshot(self.root)[2], "fields": {"featured": False, "relatedResources": []}})
        self.assertEqual(before, self.path.read_bytes())
        with review.store.candidate_lock(self.path):
            pass

    def test_publish_info_editor_is_only_for_approved_or_historical(self):
        page = (ROOT / "tools/review-candidates.html").read_text(encoding="utf-8")
        for marker in ("/api/publish-info", "补全发布信息", "编辑发布信息", "正式字段：缺", "typeOptions", "relatedResources"):
            self.assertIn(marker, page)
        self.assertIn('["approved", "historical"].includes(item.reviewDecision)', page)
        self.assertIn("clearSelection(); await reload()", page)
        self.assertIn("clearSelection(); const matches = matchedItems()", page)
        self.assertIn('api("/api/preview"', page)

    def test_test_summary_candidate_is_not_on_publish_path(self):
        expected = {
            "title": "“出土简帛的文本与思想国际学术研讨会：清华简及其延伸”在英国牛津召开",
            "source": "清华大学出土文献研究与保护中心",
            "sourceUrl": "https://www.ctwx.tsinghua.edu.cn/info/1011/3517.htm",
            "date": "2026-07-04",
            "type": "学术会议",
            "tags": ["帛书", "slips", "清华简", "简帛"],
        }
        for filename in ("candidate-updates.json", "candidate-updates.review-backup.json"):
            data = json.loads((ROOT / "data" / filename).read_text(encoding="utf-8"))
            item = next(item for item in data["candidates"] if item["id"] == "candidate-2f9c3cfe8d91")
            for field, value in expected.items():
                self.assertEqual(value, item[field], field)
            self.assertEqual("pending", item["status"])
            self.assertEqual("deferred", item["reviewDecision"])
            self.assertEqual("", item["summary"])
            self.assertFalse(item["featured"])
            self.assertNotIn("哈" * 4, json.dumps(item, ensure_ascii=False))
            _, indexed, _ = review.PUBLISHER.load_candidates(ROOT)
            with self.assertRaises(review.PUBLISHER.PublishError):
                review.PUBLISHER.select_candidates(indexed, [item["id"]])
            with self.assertRaises(review.ReviewError):
                review.preview(ROOT, {"ids": [item["id"]], "revision": review.snapshot(ROOT)[2]})

    def test_collapsing_historical_selection_keeps_dom_set_and_count_consistent(self):
        page = (ROOT / "tools/review-candidates.html").read_text(encoding="utf-8")
        self.assertIn("function clearCollapsedSelection(period)", page)
        self.assertIn('selected.delete(id)', page)
        self.assertIn('check.checked = false', page)
        self.assertIn('clearCollapsedSelection(period)', page)

        def collapse(items, selected, checks, period):
            hidden = {candidate_id for candidate_id, candidate_period in items.items() if candidate_period == period}
            selected.difference_update(hidden)
            for candidate_id in hidden:
                checks[candidate_id] = False
            return len(selected)

        cases = (
            ({"history-1": "historical"}, {"history-1"}, {"history-1": True}, 0),
            ({"history-1": "historical", "history-2": "historical"}, {"history-1", "history-2"}, {"history-1": True, "history-2": True}, 0),
            ({"history-1": "historical", "recent-1": "recent"}, {"history-1", "recent-1"}, {"history-1": True, "recent-1": True}, 1),
        )
        for items, selected, checks, expected_count in cases:
            with self.subTest(items=items):
                self.assertEqual(expected_count, collapse(items, selected, checks, "historical"))
                self.assertFalse(any(checks[candidate_id] for candidate_id, period in items.items() if period == "historical"))
                self.assertTrue(all(candidate_id not in selected for candidate_id, period in items.items() if period == "historical"))
                self.assertEqual(expected_count, len(selected))

    def test_publish_info_editor_uses_compact_chinese_ui(self):
        page = (ROOT / "tools/review-candidates.html").read_text(encoding="utf-8")
        labels = '{type:"动态类型",date:"发布日期",summary:"内容简介",tags:"标签",featured:"重点推荐",relatedResources:"关联本站资源"}'
        self.assertIn(labels, page)
        for field, label in (("type", "动态类型"), ("date", "发布日期"), ("summary", "内容简介"), ("tags", "标签"), ("relatedResources", "关联本站资源")):
            self.assertIn(f'addPublishField(form, "{field}", "{label}"', page)
        for hint in (
            "用 1–2 句话说明这条动态的主要内容和收录价值，不必写成论文摘要。",
            "填写研究对象、材料或主题关键词，可用逗号或换行分隔。",
            "仅用于少量特别重要的动态，通常保持未勾选。",
            "如与本站某个数据库、机构或专题相关可填写；没有可留空。",
            "填写真实存在的单日或同年日期区间；不确定时不要猜。",
        ):
            self.assertIn(hint, page)
        self.assertIn('summary.rows = 3; summary.className = "summary-input"', page)
        self.assertIn('tags.rows = 2; tags.className = "compact-input"', page)
        self.assertIn('related.rows = 2; related.className = "compact-input"', page)
        self.assertIn('featuredText.append(document.createTextNode("设为重点推荐 "))', page)
        self.assertIn("grid-template-columns:repeat(2,minmax(0,1fr))", page)
        self.assertIn("@media(max-width:650px){.publish-editor form{grid-template-columns:1fr}", page)
        self.assertIn('actions.className = "actions publish-submit"', page)
        self.assertIn('missingText.textContent = `缺少：${missing.map(field => publishLabels[field]).join("、")}`', page)
        self.assertIn('value.split(/[\\n,，]/)', page)
        self.assertIn('featured:publishField(form,"featured").checked', page)
        self.assertIn('relatedResources:listValue(publishField(form,"relatedResources").value)', page)

    def test_conflict_invalid_id_and_invalid_decision_never_overwrite(self):
        stale = self.payload()
        self.data["extra"].append(3)
        self.write()
        before = self.path.read_bytes()
        for payload in (stale, {**self.payload(), "ids": ["--apply"]}, {**self.payload(), "decision": "published"}, {**self.payload(), "ids": [self.item["id"]] * 2}):
            with self.assertRaises(review.ReviewError):
                review.save_decision(self.root, payload)
            self.assertEqual(before, self.path.read_bytes())

    def test_duplicate_id_published_and_malformed_json_fail_closed(self):
        self.data["olderCandidates"].append(dict(self.item))
        self.write()
        with self.assertRaises(review.ReviewError):
            review.snapshot(self.root)
        self.data["olderCandidates"] = []
        self.item["status"] = "published"
        self.write()
        with self.assertRaises(review.ReviewError):
            review.save_decision(self.root, self.payload())
        self.path.write_text("{broken", encoding="utf-8")
        before = self.path.read_bytes()
        with self.assertRaises(ValueError):
            review.save_decision(self.root, {"revision": "bad"})
        self.assertEqual(before, self.path.read_bytes())

    def test_failed_atomic_write_preserves_candidates(self):
        before = self.path.read_bytes()
        with patch.object(review.PUBLISHER.os, "replace", side_effect=OSError("test failure")):
            with self.assertRaises(OSError):
                review.save_decision(self.root, self.payload())
        self.assertEqual(before, self.path.read_bytes())
        with review.store.candidate_lock(self.path):
            pass

    def test_preview_is_read_only_historical_and_missing_fields_reported(self):
        review.save_decision(self.root, self.payload("historical"))
        before = {p.name: p.read_bytes() for p in self.root.rglob("*") if p.is_file()}
        result = review.preview(self.root, self.payload())
        self.assertTrue(result["ok"], result["output"])
        self.assertIn("是否历史记录：是", result["output"])
        self.assertEqual(before, {p.name: p.read_bytes() for p in self.root.rglob("*") if p.is_file()})
        self.item.pop("summary")
        self.write()
        review.save_decision(self.root, self.payload())
        result = review.preview(self.root, self.payload())
        self.assertFalse(result["ok"])
        self.assertIn("summary", result["output"])
        self.assertEqual(before["academic-updates.js"], self.formal.read_bytes())

    def test_deferred_rejected_require_rereview_in_publisher(self):
        for decision in ("deferred", "rejected"):
            review.save_decision(self.root, self.payload(decision))
            with self.assertRaises(review.ReviewError):
                review.preview(self.root, self.payload())
            _, indexed, _ = review.PUBLISHER.load_candidates(self.root)
            with self.assertRaises(review.PUBLISHER.PublishError):
                review.PUBLISHER.select_candidates(indexed, [self.item["id"]])

    def test_http_token_origin_path_and_actual_review_preview(self):
        server = review.ReviewServer(self.root, 0)
        worker = threading.Thread(target=server.serve_forever, daemon=True)
        worker.start()
        try:
            def request(method, path, payload=None, headers=None):
                connection = http.client.HTTPConnection("127.0.0.1", server.server_port, timeout=35)
                connection.request(method, path, json.dumps(payload) if payload is not None else None, headers or {})
                response = connection.getresponse()
                result = response.status, response.read().decode("utf-8")
                connection.close()
                return result
            headers = {"X-Review-Token": server.token, "Content-Type": "application/json", "Origin": server.origin}
            before = self.path.read_bytes()
            self.assertEqual(403, request("POST", "/api/review", self.payload())[0])
            self.assertEqual(403, request("POST", "/api/review", self.payload(), {**headers, "Origin": "https://example.com"})[0])
            self.assertEqual(403, request("GET", "/", headers={"Host": "evil.example"})[0])
            self.assertEqual(404, request("GET", "/../academic-updates.js", headers=headers)[0])
            self.assertEqual(404, request("POST", "/api/apply", self.payload(), headers)[0])
            self.assertEqual(before, self.path.read_bytes())
            self.assertEqual(200, request("GET", "/")[0])
            self.assertEqual(200, request("GET", "/api/candidates", headers=headers)[0])
            self.assertEqual(200, request("POST", "/api/review", self.payload(), headers)[0])
            publish_payload = {"id": self.item["id"], "revision": review.snapshot(self.root)[2], "fields": {"summary": "API 保存的摘要"}}
            self.assertEqual(200, request("POST", "/api/publish-info", publish_payload, headers)[0])
            before = self.path.read_bytes()
            status, body = request("POST", "/api/preview", self.payload(), headers)
            self.assertEqual(200, status)
            self.assertTrue(json.loads(body)["ok"], body)
            self.assertEqual(before, self.path.read_bytes())
        finally:
            server.shutdown()
            worker.join()
            server.server_close()

    def test_wechat_source_configuration(self):
        sources = importer.load_wechat_sources()
        self.assertEqual({"古文字微刊", "出土文献", "简牍学", "语言与文献", "出土文献综合研究集刊"}, set(sources))
        self.assertTrue(all(s["official"] is None and s["institution"] == "" for s in sources.values()))

    def test_period_boundaries_and_unknown_dates_are_display_only(self):
        data = {"candidates": [
            {"id": "boundary", "date": "2025-09-11"},
            {"id": "old", "possibleDate": "2025-09-10"},
            {"id": "today", "date": "2026-09-11"},
            {"id": "future", "date": "2026-09-12"},
            {"id": "unknown", "discoveredAt": "2026-09-11"},
            {"id": "bad", "date": "2026-02-30"},
            {"id": "month", "date": "2026-08"},
            {"id": "ambiguous", "date": "2025-09"},
            {"id": "old-month", "date": "2024-11"},
        ], "olderCandidates": [{"id": "older-pool", "date": "2026-09-11"}]}
        before = json.dumps(data)
        periods = review.candidate_periods(data, dt.date(2026, 9, 11))
        self.assertEqual(["boundary", "today", "month"], periods["recent"])
        self.assertEqual(["old", "old-month", "older-pool"], periods["historical"])
        self.assertEqual(["future", "unknown", "bad", "ambiguous"], periods["undated"])
        self.assertEqual(before, json.dumps(data))
        self.assertEqual("2023-02-28", review.candidate_periods({}, dt.date(2024, 2, 29))["cutoff"])

    def test_current_candidate_periods_are_stable_without_changes(self):
        path = ROOT / "data/candidate-updates.json"
        before = path.read_bytes()
        data = json.loads(before)
        periods = review.candidate_periods(data, dt.date(2026, 9, 11))
        grouped = [set(periods[period]) for period in ("recent", "historical", "undated")]
        current_ids = {item["id"] for item in data["candidates"]}
        older_ids = {item["id"] for item in data["olderCandidates"]}
        self.assertEqual(current_ids | older_ids, set.union(*grouped))
        self.assertEqual(sum(len(group) for group in grouped), len(current_ids | older_ids))
        self.assertTrue(older_ids <= grouped[1])
        self.assertEqual(before, path.read_bytes())


if __name__ == "__main__":
    unittest.main()
