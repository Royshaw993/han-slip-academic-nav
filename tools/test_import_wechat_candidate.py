"""WeChat saving regression tests: fixture data and mocked network only."""
import contextlib
import importlib.util
import io
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

SPEC = importlib.util.spec_from_file_location("wechat_import_save_test", Path(__file__).with_name("import-wechat-candidate.py"))
importer = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(importer)


class WechatSaveTests(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        self.root = Path(directory.name)
        self.candidates = self.root / "candidate-updates.json"
        self.seen = self.root / "seen-items.json"
        self.item = {"id": "candidate-existing", "status": "pending", "reviewDecision": "approved", "sourceUrl": "https://example.com/existing"}
        self.candidates.write_bytes(importer.CHECKER.store.json_bytes({"candidates": [self.item]}))
        self.seen.write_bytes(b'{"items": []}\n')

    def run_import(self, fetch, dry_run=False):
        args = ["import-wechat-candidate.py", "https://mp.weixin.qq.com/s/test_article"]
        if dry_run:
            args.append("--dry-run")
        stderr = io.StringIO()
        with patch.multiple(importer, CANDIDATES=self.candidates, SEEN=self.seen), \
                patch.object(importer, "load_wechat_sources", return_value={}), \
                patch.object(importer.CHECKER, "load_formal", return_value=(set(), [])), \
                patch.object(importer, "fetch_public_article", side_effect=fetch) as network, \
                patch.object(sys, "argv", args), contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(stderr):
            code = importer.main()
            if dry_run:
                network.assert_not_called()
        return code, stderr.getvalue()

    @staticmethod
    def page(title):
        return f'<meta property="og:title" content="{title}"><meta name="author" content="测试作者">'

    def test_conflict_preserves_review_and_does_not_write_seen(self):
        before_seen = self.seen.read_bytes()
        changed = []
        def fetch(_url):
            data, revision = importer.CHECKER.store.read_snapshot(self.candidates)
            data["candidates"][0]["reviewDecision"] = "rejected"
            importer.CHECKER.store.save(self.candidates, data, revision)
            changed.append(self.candidates.read_bytes())
            return self.page("悬泉汉简数据库更新")
        code, error = self.run_import(fetch)
        self.assertEqual(2, code)
        self.assertIn("微信导入保存冲突", error)
        self.assertEqual(changed[0], self.candidates.read_bytes())
        self.assertEqual(before_seen, self.seen.read_bytes())

    def test_normal_import_preserves_review_and_adds_candidate(self):
        code, error = self.run_import(lambda _url: self.page("悬泉汉简数据库更新"))
        self.assertEqual(0, code, error)
        data = json.loads(self.candidates.read_bytes())
        self.assertEqual(self.item, data["candidates"][0])
        self.assertEqual(2, len(data["candidates"]))
        self.assertEqual("wechat", data["candidates"][1]["sourceType"])
        self.assertIn("悬泉汉简", data["candidates"][1]["matchedKeywords"])
        self.assertEqual(1, len(json.loads(self.seen.read_bytes())["items"]))

    def test_unrelated_or_filtered_titles_do_not_enter_candidates(self):
        for title in ("校园活动公告", "悬泉汉简教师招聘公告", "悬泉汉简某教授学术讲座"):
            with self.subTest(title=title):
                code, error = self.run_import(lambda _url, title=title: self.page(title))
                self.assertEqual(0, code, error)
                self.assertEqual(1, len(json.loads(self.candidates.read_bytes())["candidates"]))
                self.assertEqual([], json.loads(self.seen.read_bytes())["items"])

    def test_keyword_lookup_uses_current_checker_interface(self):
        self.assertFalse(hasattr(importer.CHECKER, "KEYWORDS"))
        self.assertIn("悬泉汉简", importer.matched_keywords("悬泉汉简研究札记"))
        self.assertEqual([], importer.matched_keywords("校园活动公告"))

    def test_dry_run_creates_no_files_and_uses_no_network(self):
        before = {p.name: p.read_bytes() for p in self.root.iterdir()}
        code, error = self.run_import(lambda _url: self.fail("unexpected network"), dry_run=True)
        self.assertEqual(0, code, error)
        self.assertEqual(before, {p.name: p.read_bytes() for p in self.root.iterdir()})


if __name__ == "__main__":
    unittest.main(verbosity=2)
