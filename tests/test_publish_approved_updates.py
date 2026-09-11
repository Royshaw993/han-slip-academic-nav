from __future__ import annotations

import contextlib
import importlib.util
import io
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


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

    def test_real_dates_and_same_year_date_ranges_are_accepted(self) -> None:
        for value in ("2026-07-04", "2024-02-29", "2026-10-24 至 10-25"):
            item = complete_candidate()
            item["date"] = value
            fixture = Fixture(item)
            self.addCleanup(fixture.close)
            code, _, error = self.run_main(fixture.root, "--ids", item["id"], "--preview")
            self.assertEqual(0, code, error)

    def test_invalid_dates_reject_preview_and_apply_without_writes(self) -> None:
        for value in ("2026-02-30", "2026-04-31", "2026-13-01", "not-a-date", ""):
            for mode in ("--preview", "--apply"):
                with self.subTest(value=value, mode=mode):
                    item = complete_candidate()
                    item["date"] = value
                    fixture = Fixture(item)
                    self.addCleanup(fixture.close)
                    before = {path: path.read_bytes() for path in fixture.root.rglob("*") if path.is_file()}
                    code, _, error = self.run_main(fixture.root, "--ids", item["id"], mode)
                    self.assertEqual(2, code)
                    self.assertIn("发布日期无效", error)
                    after = {path: path.read_bytes() for path in fixture.root.rglob("*") if path.is_file()}
                    self.assertEqual(before, after)

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
        candidate_data, indexed, revision = publisher.load_candidates(fixture.root)
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
                revision,
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

    def test_special_text_round_trips_preview_and_apply_all_fields(self):
        samples = ["第一行\n第二行", r"\n", r"\t", r"C:\Users\Test", r"\\", '中文，“引号”、\'单引号\'、"双引号"。']
        for sample in samples:
            with self.subTest(sample=sample):
                item = complete_candidate()
                for field in ("title", "source", "summary", "type"):
                    item[field] = sample
                item["sourceUrl"] += "?text=" + sample
                for field in ("tags", "relatedResources", "topics"):
                    item[field] = [sample]
                fixture = Fixture(item, older=True)
                self.addCleanup(fixture.close)
                before = {p: p.read_bytes() for p in fixture.root.rglob("*") if p.is_file()}
                code, _, error = self.run_main(fixture.root, "--ids", item["id"], "--preview")
                self.assertEqual(0, code, error)
                self.assertEqual(before, {p: p.read_bytes() for p in fixture.root.rglob("*") if p.is_file()})
                code, _, error = self.run_main(fixture.root, "--ids", item["id"], "--apply")
                self.assertEqual(0, code, error)
                text = (fixture.root / publisher.FORMAL_REL).read_text(encoding="utf-8")
                entry = publisher.parse_academic_entries(text)[-1]
                for field in (*publisher.REQUIRED_FIELDS, "topics"):
                    if field != "id":
                        self.assertEqual(item[field], entry[field], field)
                self.assertEqual(publisher.formal_id(item), entry["id"])
                self.assertTrue(entry["historical"])
                saved = json.loads((fixture.root / publisher.CANDIDATES_REL).read_text(encoding="utf-8"))["olderCandidates"][0]
                self.assertEqual("published", saved["status"])
                self.assertIn(saved["publishedAt"], text)
                self.assertNotIn("formalId", saved)

    def test_preview_rejects_invalid_or_changed_final_text_without_writes(self):
        fixture = Fixture()
        self.addCleanup(fixture.close)
        render = publisher.updated_formal_text
        for replacement in ('summary:"changed"', 'summary:"broken\nstring"'):
            before = {p: p.read_bytes() for p in fixture.root.rglob("*") if p.is_file()}
            def corrupt(original, entries, today):
                text = render(original, entries, today)
                return text.replace('summary:' + publisher.json_text(entries[0]["summary"]), replacement)
            with patch.object(publisher, "updated_formal_text", side_effect=corrupt):
                code, _, _ = self.run_main(fixture.root, "--ids", "candidate-approved", "--preview")
            self.assertEqual(2, code)
            self.assertEqual(before, {p: p.read_bytes() for p in fixture.root.rglob("*") if p.is_file()})

    def test_stale_publish_preserves_new_rejection_and_formal_bytes(self):
        fixture = Fixture()
        self.addCleanup(fixture.close)
        path = fixture.root / publisher.CANDIDATES_REL
        formal = fixture.root / publisher.FORMAL_REL
        data, indexed, revision = publisher.load_candidates(fixture.root)
        selected = publisher.select_candidates(indexed, ["candidate-approved"])
        entries = publisher.build_formal_entries(selected, formal.read_text(encoding="utf-8"))
        current, current_revision = publisher.store.read_snapshot(path)
        current["candidates"][0]["reviewDecision"] = "rejected"
        publisher.store.save(path, current, current_revision)
        before = (formal.read_bytes(), path.read_bytes())
        with self.assertRaises(publisher.store.CandidateConflict):
            publisher.apply_transaction(fixture.root, selected, entries, data, "2026-09-11", revision)
        self.assertEqual(before, (formal.read_bytes(), path.read_bytes()))

    def test_formal_or_candidate_write_failure_preserves_both_files(self):
        for target in (publisher.FORMAL_REL, publisher.CANDIDATES_REL):
            with self.subTest(target=target):
                fixture = Fixture()
                self.addCleanup(fixture.close)
                paths = [fixture.root / publisher.FORMAL_REL, fixture.root / publisher.CANDIDATES_REL]
                before = [p.read_bytes() for p in paths]
                real_write = publisher.store.atomic_write_bytes
                def fail(path, raw):
                    if path == fixture.root / target:
                        raise OSError("injected write failure")
                    real_write(path, raw)
                with patch.object(publisher.store, "atomic_write_bytes", side_effect=fail):
                    code, _, error = self.run_main(fixture.root, "--ids", "candidate-approved", "--apply")
                self.assertEqual(2, code)
                self.assertIn("injected write failure", error)
                self.assertEqual(before, [p.read_bytes() for p in paths])
                # The failed transaction also released its candidate lock.
                code, _, error = self.run_main(fixture.root, "--ids", "candidate-approved", "--apply")
                self.assertEqual(0, code, error)

    def test_conflict_after_formal_write_rolls_back_without_overwriting_review(self):
        fixture = Fixture()
        self.addCleanup(fixture.close)
        formal = fixture.root / publisher.FORMAL_REL
        candidate = fixture.root / publisher.CANDIDATES_REL
        before = formal.read_bytes()
        real_write = publisher.atomic_write_text
        def external_change(path, text):
            real_write(path, text)
            data = json.loads(candidate.read_text(encoding="utf-8"))
            data["candidates"][0]["reviewDecision"] = "rejected"
            candidate.write_bytes(publisher.store.json_bytes(data))
        with patch.object(publisher, "atomic_write_text", side_effect=external_change):
            code, _, _ = self.run_main(fixture.root, "--ids", "candidate-approved", "--apply")
        self.assertEqual(2, code)
        self.assertEqual(before, formal.read_bytes())
        self.assertEqual("rejected", json.loads(candidate.read_text(encoding="utf-8"))["candidates"][0]["reviewDecision"])

    def test_candidate_flush_failure_uses_prepared_rollback_without_new_writes(self):
        fixture = Fixture()
        self.addCleanup(fixture.close)
        paths = [fixture.root / publisher.FORMAL_REL, fixture.root / publisher.CANDIDATES_REL]
        before = [path.read_bytes() for path in paths]
        # Two rollback copies, the formal commit, then candidate fsync fails.
        # Any attempt to allocate/write a rollback copy afterward also fails.
        real_fsync = publisher.store.os.fsync
        calls = []
        def disk_full(handle):
            calls.append(handle)
            if len(calls) >= 4:
                raise OSError("injected disk full")
            return real_fsync(handle)
        with patch.object(publisher.store.os, "fsync", side_effect=disk_full):
            code, _, error = self.run_main(fixture.root, "--ids", "candidate-approved", "--apply")
        self.assertEqual(2, code)
        self.assertIn("injected disk full", error)
        self.assertEqual(4, len(calls))
        self.assertEqual(before, [path.read_bytes() for path in paths])
        for path in paths:
            self.assertEqual([], list(path.parent.glob(f".{path.name}.*")))


if __name__ == "__main__":
    unittest.main()
