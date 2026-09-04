from __future__ import annotations

import contextlib
import importlib.util
import io
import json
import sys
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).resolve().parents[1] / "tools" / "publish-approved-updates.py"
SPEC = importlib.util.spec_from_file_location("publish_approved_updates", SCRIPT)
assert SPEC and SPEC.loader
publisher = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = publisher
SPEC.loader.exec_module(publisher)


def complete_candidate(candidate_id: str = "candidate-approved") -> dict:
    return {
        "id": candidate_id,
        "title": "张三：汉简文字研究",
        "type": "新论文",
        "source": "某大学研究中心",
        "sourceUrl": "https://example.edu.cn/article/1",
        "date": "2026-09-01",
        "summary": "一条经过人工补全并批准的测试动态。",
        "tags": ["汉简", "文字"],
        "featured": False,
        "relatedResources": ["测试资源"],
        "suggestedTopics": ["居延汉简"],
        "status": "pending",
    }


def formal_text(extra: str = "") -> str:
    suffix = f",\n  {extra}" if extra else ""
    return (
        'window.academicUpdatesLastUpdated = "2026-08-20";\n'
        'window.academicUpdates = [\n'
        '  { id:"existing-1", title:"既有动态", type:"新论文", source:"既有来源", '
        'sourceUrl:"https://example.com/old", date:"2026-08-01", summary:"摘要", '
        'tags:[], featured:false, relatedResources:[] }'
        f"{suffix}\n];\n"
    )


class Fixture:
    def __init__(self, candidate: dict | None = None, older: bool = False) -> None:
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        (self.root / "data").mkdir()
        (self.root / "academic-updates.js").write_text(formal_text(), encoding="utf-8")
        payload = {"generatedAt": "2026-09-04T00:00:00", "candidates": [], "olderCandidates": []}
        payload["olderCandidates" if older else "candidates"].append(candidate or complete_candidate())
        (self.root / "data" / "candidate-updates.json").write_text(
            json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )

    def close(self) -> None:
        self.temp.cleanup()


class PublishApprovedUpdatesTests(unittest.TestCase):
    def run_main(self, root: Path, *arguments: str) -> tuple[int, str, str]:
        stdout, stderr = io.StringIO(), io.StringIO()
        with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
            code = publisher.main([*arguments, "--project-root", str(root)])
        return code, stdout.getvalue(), stderr.getvalue()

    def test_dry_run_is_read_only(self) -> None:
        fixture = Fixture()
        self.addCleanup(fixture.close)
        before = {path: path.read_bytes() for path in fixture.root.rglob("*") if path.is_file()}
        code, output, _ = self.run_main(fixture.root, "--ids", "candidate-approved", "--dry-run")
        after = {path: path.read_bytes() for path in fixture.root.rglob("*") if path.is_file()}
        self.assertEqual(0, code)
        self.assertIn("Dry-run 完成", output)
        self.assertEqual(before, after)

    def test_preview_is_read_only_and_shows_historical(self) -> None:
        fixture = Fixture(older=True)
        self.addCleanup(fixture.close)
        formal_path = fixture.root / "academic-updates.js"
        candidate_path = fixture.root / "data" / "candidate-updates.json"
        before_formal = formal_path.read_bytes()
        before_candidates = candidate_path.read_bytes()
        code, output, _ = self.run_main(fixture.root, "--ids", "candidate-approved", "--preview")
        self.assertEqual(0, code)
        self.assertIn("标题：张三：汉简文字研究", output)
        self.assertIn("来源：某大学研究中心", output)
        self.assertIn("日期：2026-09-01", output)
        self.assertIn("类型：新论文", output)
        self.assertIn("是否历史记录：是", output)
        self.assertIn("sourceUrl：https://example.edu.cn/article/1", output)
        self.assertIn("- academic-updates.js", output)
        self.assertIn("- data/candidate-updates.json", output)
        self.assertIn("Git 状态：", output)
        self.assertIn("- 当前分支：", output)
        self.assertIn("- 是否存在未提交修改：", output)
        self.assertIn("- 是否配置 remote：", output)
        self.assertIn("- 是否存在 origin：", output)
        self.assertIn("预览完成：未写入文件，未 commit，未 push。", output)
        self.assertEqual(before_formal, formal_path.read_bytes())
        self.assertEqual(before_candidates, candidate_path.read_bytes())

    def test_nonexistent_candidate_is_rejected(self) -> None:
        fixture = Fixture()
        self.addCleanup(fixture.close)
        code, _, error = self.run_main(fixture.root, "--ids", "candidate-missing", "--preview")
        self.assertEqual(2, code)
        self.assertIn("找不到候选", error)

    def test_missing_formal_field_is_rejected(self) -> None:
        item = complete_candidate()
        del item["summary"]
        fixture = Fixture(item)
        self.addCleanup(fixture.close)
        code, _, error = self.run_main(fixture.root, "--ids", item["id"], "--preview")
        self.assertEqual(2, code)
        self.assertIn("待补充正式字段：summary", error)

    def test_duplicate_generated_formal_id_is_rejected(self) -> None:
        item = complete_candidate()
        fixture = Fixture(item)
        self.addCleanup(fixture.close)
        duplicate_id = publisher.formal_id(item)
        duplicate = (
            f'{{ id:"{duplicate_id}", title:"另一动态", type:"新论文", source:"另一来源", '
            'sourceUrl:"https://example.com/other", date:"2026-01-01", summary:"摘要", '
            'tags:[], featured:false, relatedResources:[] }'
        )
        (fixture.root / "academic-updates.js").write_text(formal_text(duplicate), encoding="utf-8")
        code, _, error = self.run_main(fixture.root, "--ids", item["id"], "--preview")
        self.assertEqual(2, code)
        self.assertIn("正式 id 重复", error)

    def test_non_repository_is_reported_and_push_is_blocked(self) -> None:
        fixture = Fixture()
        self.addCleanup(fixture.close)
        state = publisher.git_state(fixture.root)
        self.assertFalse(state.is_repo)
        with self.assertRaisesRegex(publisher.PublishError, "不是 Git 仓库"):
            publisher.assert_push_preflight(state)

    def test_unrelated_dirty_file_blocks_push(self) -> None:
        state = publisher.GitState(
            True,
            branch="main",
            remotes=("origin",),
            origin_url="https://github.com/example/han-slip-academic-nav.git",
            changes=("style.css",),
        )
        with self.assertRaisesRegex(publisher.PublishError, "无关未提交修改"):
            publisher.assert_push_preflight(state)

    def test_validation_failure_restores_both_files(self) -> None:
        fixture = Fixture()
        self.addCleanup(fixture.close)
        candidate_data, indexed = publisher.load_candidates(fixture.root)
        selected = publisher.select_candidates(indexed, ["candidate-approved"])
        formal_path = fixture.root / "academic-updates.js"
        candidate_path = fixture.root / "data" / "candidate-updates.json"
        before_formal = formal_path.read_bytes()
        before_candidates = candidate_path.read_bytes()

        def fail_validation(_: Path) -> None:
            raise publisher.PublishError("模拟校验失败")

        with self.assertRaisesRegex(publisher.PublishError, "模拟校验失败"):
            publisher.apply_transaction(
                fixture.root,
                selected,
                publisher.build_formal_entries(selected, formal_path.read_text(encoding="utf-8")),
                candidate_data,
                "2026-09-04",
                validator=fail_validation,
            )
        self.assertEqual(before_formal, formal_path.read_bytes())
        self.assertEqual(before_candidates, candidate_path.read_bytes())

    def test_wechat_preview_warns_without_blocking(self) -> None:
        item = complete_candidate()
        item.update({"sourceType": "wechat", "preferOriginalSource": True})
        fixture = Fixture(item)
        self.addCleanup(fixture.close)
        code, output, _ = self.run_main(fixture.root, "--ids", item["id"], "--preview")
        self.assertEqual(0, code)
        self.assertIn("建议确认是否存在更优原始学术来源", output)


if __name__ == "__main__":
    unittest.main()
