#!/usr/bin/env python3
"""静态测试：核心工具书数据与前端展示契约。"""

from __future__ import annotations

import json
import unittest
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent


def load_bibliography() -> list[dict]:
    source = (ROOT / "data" / "core-bibliography.js").read_text(encoding="utf-8")
    payload = source.split("window.coreBibliography =", 1)[1].strip()
    return json.loads(payload.removesuffix(";").strip())


class CoreBibliographyTests(unittest.TestCase):
    def setUp(self) -> None:
        self.books = load_bibliography()
        self.script = (ROOT / "script.js").read_text(encoding="utf-8")
        self.page = (ROOT / "index.html").read_text(encoding="utf-8")
        self.style = (ROOT / "style.css").read_text(encoding="utf-8")

    def test_data_loads_and_has_expected_shape(self) -> None:
        self.assertEqual(len(self.books), 12)
        required = {"id", "title", "author", "categories", "type", "level", "useFor", "publisher", "year", "note", "featured"}
        self.assertTrue(all(required <= set(book) for book in self.books))
        self.assertEqual(len({book["id"] for book in self.books}), 12)
        allowed = {"general", "oracle", "bronze", "stone", "slips", "silk"}
        self.assertTrue(all(book["categories"] and set(book["categories"]) <= allowed for book in self.books))
        self.assertNotIn("isbn", {key.lower() for book in self.books for key in book})

    def test_category_counts_and_home_featured_limit(self) -> None:
        counts = Counter(category for book in self.books for category in book["categories"])
        self.assertEqual(counts, Counter(general=5, oracle=1, bronze=2, slips=4))
        featured = [book for book in self.books if book["featured"] is True]
        self.assertEqual(len(featured), 2)
        self.assertIn('book.featured === true).slice(0, 4)', self.script)

    def test_genre_filtering_and_empty_states(self) -> None:
        general = [book for book in self.books if "general" in book["categories"]]
        for category, expected_direct in (("oracle", 1), ("bronze", 2), ("slips", 4)):
            direct = [book for book in self.books if category in book["categories"]]
            visible = (direct + general)[:4]
            self.assertEqual(len(direct), expected_direct)
            self.assertEqual(len(visible), 4)
            self.assertTrue(all(book in visible for book in direct[:4]))
        self.assertFalse(any("stone" in book["categories"] for book in self.books))
        self.assertFalse(any("silk" in book["categories"] for book in self.books))
        self.assertIn("当前暂无已整理的石刻核心书目。", self.script)
        self.assertIn("当前暂无已整理的帛书核心书目。", self.script)

    def test_page_controls_return_home_and_mobile_contract(self) -> None:
        self.assertIn('<script src="data/core-bibliography.js"></script>', self.page)
        self.assertLess(self.page.index('data/core-bibliography.js'), self.page.index('<script src="script.js"></script>'))
        self.assertIn('id="bibliographyToggle"', self.page)
        self.assertIn("bibliographyExpanded = !bibliographyExpanded", self.script)
        self.assertIn('activateCategory("全部")', self.script)
        self.assertIn("bibliographyExpanded = false", self.script)
        self.assertIn("@media (max-width:560px)", self.style)
        self.assertIn(".bibliography-grid { grid-template-columns:1fr; }", self.style)
        self.assertIn("min-width:0", self.style)
        card_template = self.script.split("function bibliographyCardTemplate", 1)[1].split("function renderBibliography", 1)[0]
        for visible_field in ("book.title", "book.author", "book.type", "book.level", "book.useFor", "book.note", "book.publisher", "book.year"):
            self.assertIn(visible_field, card_template)
        self.assertNotIn("book.id", card_template)
        self.assertNotIn("book.categories", card_template)

    def test_resource_sections_precede_bibliography_for_every_genre(self) -> None:
        core_position = self.page.index('id="coreSection"')
        resources_position = self.page.index('id="resourcesSection"')
        bibliography_position = self.page.index('id="bibliographySection"')
        self.assertLess(core_position, bibliography_position, "简牍核心资源应在书目之前")
        self.assertLess(resources_position, bibliography_position, "甲、金、石、帛资源应在书目之前")
        self.assertEqual(self.page.count('id="bibliographySection"'), 1)
        for genre in ("甲骨文", "金文", "石刻", "🏺 汉代简牍", "帛书"):
            self.assertIn(f'data-genre="{genre}"', self.page)


if __name__ == "__main__":
    unittest.main(verbosity=2)
