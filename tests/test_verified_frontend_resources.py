#!/usr/bin/env python3
"""静态测试：本轮核验资源的前台分类、去重与交互契约。"""

from __future__ import annotations

import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent


class VerifiedFrontendResourcesTests(unittest.TestCase):
    def setUp(self) -> None:
        self.script = (ROOT / "script.js").read_text(encoding="utf-8")

    def resource_line(self, url: str) -> str:
        matches = [line for line in self.script.splitlines() if f'url:"{url}"' in line]
        self.assertEqual(len(matches), 1, f"资源 URL 应且只应出现一次：{url}")
        return matches[0]

    def test_all_five_resources_use_verified_urls_without_duplicates(self) -> None:
        expected = {
            "《说文解字》研究与应用平台": "https://szsw.bnu.edu.cn/",
            "汉字全息资源应用系统": "https://qxk.bnu.edu.cn/",
            "历代碑刻典藏与应用平台": "https://ldbk.bnu.edu.cn/",
            "韵典网": "https://ytenx.org/",
            "北京大学 CCL 语料库": "https://cclcorpus.pku.edu.cn/",
        }
        for name, url in expected.items():
            line = self.resource_line(url)
            self.assertIn(f'name:"{name}"', line)
            self.assertEqual(self.script.count(f'name:"{name}"'), 1)
        self.assertNotIn("/swjz/", self.script)
        self.assertNotIn(":8080", self.script)

    def test_resource_categories_are_not_misrepresented(self) -> None:
        for url in ("https://szsw.bnu.edu.cn/", "https://qxk.bnu.edu.cn/"):
            line = self.resource_line(url)
            self.assertIn('category:"🧱 古文字数据库"', line)
            self.assertIn('resourceCategories:["🛠️ 学术工具"]', line)
            self.assertNotIn('resourceCategories:["甲骨文"', line)
            self.assertNotIn('resourceCategories:["金文"', line)

        stone = self.resource_line("https://ldbk.bnu.edu.cn/")
        self.assertIn('resourceCategories:["石刻"]', stone)
        self.assertIn("genreOnly:true", stone)

        for url in ("https://ytenx.org/", "https://cclcorpus.pku.edu.cn/"):
            line = self.resource_line(url)
            self.assertIn('category:"🛠️ 学术工具"', line)
            self.assertNotIn("resourceCategories", line)

    def test_front_page_limit_and_existing_navigation_contract_remain(self) -> None:
        self.assertIn("allOrdinary.slice(0, 6)", self.script)
        self.assertGreater(self.script.index('url:"https://szsw.bnu.edu.cn/"'), self.script.index('name:"Semantic Scholar"'))
        for marker in ('[data-genre]', 'activateCategory("全部")', "sitesExpanded = !sitesExpanded", "searchInput.addEventListener"):
            self.assertIn(marker, self.script)

    def test_resources_are_not_added_to_news_source_pool(self) -> None:
        sources = json.loads((ROOT / "data" / "sources.json").read_text(encoding="utf-8"))
        source_urls = "\n".join(str(source.get("url", "")) for source in sources)
        for host in ("szsw.bnu.edu.cn", "qxk.bnu.edu.cn", "ldbk.bnu.edu.cn", "ytenx.org", "cclcorpus.pku.edu.cn"):
            self.assertNotIn(host, source_urls)


if __name__ == "__main__":
    unittest.main(verbosity=2)
