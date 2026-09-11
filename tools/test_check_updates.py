#!/usr/bin/env python3
"""候选准入规则的无联网回归测试。"""

from __future__ import annotations

import importlib.util
import contextlib
import io
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parent.parent
SPEC = importlib.util.spec_from_file_location("check_updates", ROOT / "tools" / "check-updates.py")
assert SPEC and SPEC.loader
CHECKER = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = CHECKER
SPEC.loader.exec_module(CHECKER)


class CandidateAdmissionTests(unittest.TestCase):
    def test_weekly_save_conflict_preserves_human_review_and_seen(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            candidates, seen, sources = [root / name for name in ("candidate-updates.json", "seen-items.json", "sources.json")]
            data = {"candidates": [{"id": "candidate-test", "reviewDecision": "approved"}]}
            candidates.write_bytes(CHECKER.store.json_bytes(data))
            seen.write_bytes(b'{"items": []}\n')
            sources.write_bytes(b'[]\n')
            seen_before = seen.read_bytes()
            def human_review():
                current, revision = CHECKER.store.read_snapshot(candidates)
                current["candidates"][0]["reviewDecision"] = "rejected"
                CHECKER.store.save(candidates, current, revision)
                return set(), []
            stderr = io.StringIO()
            with patch.multiple(CHECKER, CANDIDATES=candidates, SEEN=seen, SOURCES=sources), \
                    patch.object(CHECKER, "load_formal", side_effect=human_review), \
                    patch.object(sys, "argv", ["check-updates.py"]), \
                    contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(stderr):
                self.assertEqual(2, CHECKER.main())
            self.assertIn("周检保存冲突", stderr.getvalue())
            self.assertIn("本轮结果未写入", stderr.getvalue())
            self.assertEqual("rejected", json.loads(candidates.read_bytes())["candidates"][0]["reviewDecision"])
            self.assertEqual(seen_before, seen.read_bytes())

    def test_weekly_normal_save_preserves_review_fields(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            paths = {name: root / filename for name, filename in (("CANDIDATES", "candidate-updates.json"), ("SEEN", "seen-items.json"), ("SOURCES", "sources.json"))}
            item = {"id": "candidate-test", "status": "pending", "reviewDecision": "rejected", "summary": "人工审核"}
            paths["CANDIDATES"].write_bytes(CHECKER.store.json_bytes({"candidates": [item]}))
            paths["SEEN"].write_bytes(b'{"items": []}')
            paths["SOURCES"].write_bytes(b'[]')
            with patch.multiple(CHECKER, **paths), patch.object(CHECKER, "load_formal", return_value=(set(), [])), \
                    patch.object(sys, "argv", ["check-updates.py"]), contextlib.redirect_stdout(io.StringIO()):
                self.assertEqual(0, CHECKER.main())
            self.assertEqual([item], json.loads(paths["CANDIDATES"].read_bytes())["candidates"])

    def test_recruitment_and_administrative_titles_are_excluded(self) -> None:
        titles = (
            "汉字文明研究中心党支部通过教育部全国党建工作样板支部建设验收",
            "教育部语言文字信息管理司与郑州大学签约续建中华汉字文明研究中心",
            "某单位行政通知",
            "古文字研究岗位招聘启事",
        )
        for title in titles:
            with self.subTest(title=title):
                self.assertIn(CHECKER.title_exclusion_reason(title), {"recruitment", "admin"})
                self.assertTrue(CHECKER.is_excluded_title(title))

    def test_generic_titles_are_excluded_without_core_topic(self) -> None:
        for title in ("研究生", "通知", "新闻", "活动"):
            with self.subTest(title=title):
                self.assertIsNotNone(CHECKER.title_exclusion_reason(title))
                self.assertTrue(CHECKER.is_excluded_title(title))
        self.assertEqual("generic", CHECKER.title_exclusion_reason("研究生"))
        self.assertEqual("admin", CHECKER.title_exclusion_reason("研究生招生通知"))
        for title in ("通知", "新闻", "活动"):
            self.assertEqual("generic", CHECKER.title_exclusion_reason(title))
        self.assertTrue(CHECKER.is_excluded_title("讲座"))

    def test_plain_offline_lecture_is_excluded(self) -> None:
        self.assertEqual("offline_lecture", CHECKER.title_exclusion_reason("何毓灵研究员学术讲座"))
        self.assertEqual("offline_lecture", CHECKER.title_exclusion_reason("郑振峰教授学术讲座"))
        self.assertEqual("offline_lecture", CHECKER.title_exclusion_reason("党怀兴教授学术讲座"))
        self.assertEqual("offline_lecture", CHECKER.title_exclusion_reason("某教授学术报告会"))

    def test_valuable_lecture_formats_are_kept(self) -> None:
        for title in ("甲骨文学术讲座视频回放", "金文学术讲座纪要", "甲骨文新成果学术讲座"):
            with self.subTest(title=title):
                self.assertIsNone(CHECKER.title_exclusion_reason(title))

    def test_valuable_academic_information_is_kept(self) -> None:
        for title in (
            "马王堆帛书研究新成果",
            "《出土文献》2026年第3期目录",
            "商周金文数据库更新",
            "简牍研究学术会议征稿",
            "古文字专著出版",
        ):
            with self.subTest(title=title):
                self.assertIsNone(CHECKER.title_exclusion_reason(title))

    def test_title_rule_does_not_consult_article_body(self) -> None:
        self.assertIsNone(CHECKER.title_exclusion_reason("甲骨文研究新成果"))
        self.assertEqual("offline_lecture", CHECKER.title_exclusion_reason("某教授学术讲座"))

    def test_admission_exclusion_classification_chain_preserves_high_value_titles(self) -> None:
        source = {
            "keywords": ["古文字", "研究生", "学术", "数据库", "讲座", "成果", "汉字", "教师", "博士后", "表彰"],
            "categories": ["oracle"],
            "categoryKeywords": {"oracle": ["甲骨文"]},
        }
        kept = (
            "第一届古文字与出土文献研究生论坛征稿",
            "研究生学术论坛征稿",
            "甲骨文数据库更新学术报告",
            "某某学术讲座纪要",
            "某某在线学术讲座",
            "古文字研究成果获奖",
        )
        for title in kept:
            with self.subTest(title=title):
                self.assertTrue(CHECKER.find_keywords(title, source))
                self.assertIsNone(CHECKER.title_exclusion_reason(title))
                self.assertFalse(CHECKER.is_excluded_title(title))

        excluded = (
            "教师招聘公告",
            "博士后招聘启事",
            "汉字文明研究中心党支部通过验收",
            "某教授学术讲座",
            "某教授学术报告",
            "研究生培养通知",
            "行政表彰：年度先进个人",
        )
        for title in excluded:
            with self.subTest(title=title):
                self.assertTrue(CHECKER.find_keywords(title, source))
                self.assertIsNotNone(CHECKER.title_exclusion_reason(title))
                self.assertTrue(CHECKER.is_excluded_title(title))

    def test_bsm_keywords_admit_traditional_titles_then_classify(self) -> None:
        sources = json.loads((ROOT / "data" / "sources.json").read_text(encoding="utf-8"))
        bsm = next(source for source in sources if source["id"] == "bsm")
        for title, category in (("帛書研究新发现", "silk"), ("帛书研究新发现", "silk"), ("懸泉漢簡释读札记", "slips"), ("悬泉汉简释读札记", "slips")):
            with self.subTest(title=title):
                self.assertTrue(CHECKER.find_keywords(title, bsm))
                self.assertIsNone(CHECKER.title_exclusion_reason(title))
                self.assertIn(category, CHECKER.matched_categories(bsm, title))


if __name__ == "__main__":
    unittest.main(verbosity=2)
