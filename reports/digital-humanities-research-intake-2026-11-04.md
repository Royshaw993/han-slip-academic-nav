# 数字人文研究成果正式入库（2026-11-04）

依据 [候选审核报告](digital-humanities-research-review-2026-11-04.md) 及本轮用户批准，已正式录入 R01—R18 共 18 项。正式论文由 **74 篇增至 92 篇**，无重复 ID；C01—C16、D01—D03 及此前 N06、E03 均未发布。

## 新增论文

新增类型为期刊论文 13 篇、集刊论文 2 篇、会议论文 2 篇、网络研究报告 1 篇。材料分类为综合方法 3 篇、简牍 7 篇、甲骨 4 篇、金文 1 篇、石刻 3 篇；未将“简帛”题名自动归为帛书研究。R01—R03 的研究方向仅为数字人文，所有新论文的具体专题关联 hubIds 均为空，不自动挂入清华简、马王堆或其他材料专题。

| 审核号 | 题名 | 正式稳定 ID | 文献类型 |
| --- | --- | --- | --- |
| R01 | 古籍数字化关键技术评述 | `paper-dh-guji-jishu-pingshu` | 期刊论文 |
| R02 | 数智时代古籍数字化再造的逻辑与进路 | `paper-dh-guji-shuzihua-zaizao` | 期刊论文 |
| R03 | 动态视图在文字编管理系统中的应用研究 | `paper-dh-wenzibian-dongtai-shitu` | 集刊论文 |
| R04 | 论郭店楚简数字化工作之得失：兼及出土文献数据库的开发标准问题 | `paper-dh-guodian-shujuku-biaozhun` | 集刊论文 |
| R05 | 数字人文视域下简帛文献的分词研究——以《里耶秦简牍》为例 | `paper-dh-liye-fenci` | 期刊论文 |
| R06 | 基于CRF模型的《里耶秦简》自动断句与分词研究 | `paper-dh-liye-crf` | 期刊论文 |
| R07 | DeepJiandu Dataset for Character Detection and Recognition on Jiandu Manuscript | `paper-dh-deepjiandu` | 期刊论文 |
| R08 | An open dataset for oracle bone character recognition and decipherment | `paper-dh-hust-obc` | 期刊论文 |
| R09 | AI-Powered Oracle Bone Inscriptions Recognition and Fragments Rejoining | `paper-dh-ijcai-recognition-rejoining` | 会议论文 |
| R10 | Deep rejoining model and dataset of oracle bone fragment images | `paper-dh-obfi-rejoining` | 期刊论文 |
| R11 | OBIMD: A Multi-modal Dataset for Contextual Interpretation of Oracle Bone Inscriptions | `paper-dh-obimd` | 期刊论文 |
| R12 | 利用計算機視覺輔助金文通鑒《銘四》部分拓片查重的嘗試 | `paper-dh-jinwen-mingsi-chazhong` | 网络研究报告 |
| R13 | 简牍数智化技术进展与展望：里耶秦简的数智化探索 | `paper-dh-liye-shuzhihua` | 期刊论文 |
| R14 | Virtual cleaning and unwrapping of non-invasively digitized soiled bamboo scrolls | `paper-dh-bamboo-virtual-unwrapping` | 期刊论文 |
| R15 | 简牍图像信息采集过程中的保护及要求 | `paper-dh-jiandu-image-acquisition` | 期刊论文 |
| R16 | 碑刻资源语义化组织研究 | `paper-dh-beike-semantic-organization` | 期刊论文 |
| R17 | Research on the extraction of inscription rubbings information of stone carved cultural relics based on 3D fine models | `paper-dh-stone-digital-rubbings` | 期刊论文 |
| R18 | InscriberNet: A Novel Framework for Chinese Character Recognition in Stone Inscriptions using CNNs and Swin Transformer | `paper-dh-inscribernet` | 会议论文 |

元数据沿用已批准报告，缺失 DOI、页码等字段留空。R03、R04、R15 的主 URL 留空，仅提供有证据的题录来源及刊物入口，不显示虚假的原文阅读按钮。数据论文仍保留期刊论文类型，文章号单独维护，不混填页码。所有新增记录的 abstract 为空，读者简介仅精简报告中已有的研究内容，不补造原摘要、实验成绩或研究结论。

R01 采用原文署名“苏祺”，官网“苏棋”冲突证据留在 sourceNote/accessNote；R12 保持网络研究报告，提示算法细节另文说明；R14 保留制作的刻划模拟样本限制，不宣称已经读出真实出土墨书简牍。版本与访问证据保留在内部字段，不进入卡片或统一搜索。

## 展示与稳定关联

- 论文唯一数据源仍为 `data/classic-papers.js`；数字人文视图直接筛选正式论文目录，不向 `sites` 复制任何成果。
- 现有数字人文入口分区显示 **13 项研究资源、18 篇研究成果**，首页数量分别标注。复用既有论文卡片、12 篇分页、查看更多/收起及搜索返回状态；资源类型筛选仍控制资源，数字人文“全部”视图展示成果。
- 刊物关联使用稳定 ID：R01/R02 → `digital-humanities-research-journal`；R03/R04 → `digital-humanities-collected-journal`；R15 → `chutu-wenxian-journal`。刊物目录可直接展开这些论文，关联总数依次为 2、2、4（《出土文献》原有 3 篇加本次 1 篇）。5 种刊物保持原记录与期刊/集刊类型。
- R07 在论文中保存 `resourceIds: [nwnu-jiandu]`、`updateIds: [nwnu-deepjiandu]`，由正式记录解析研究平台和相关动态链接，不改动平台、动态或其日期。
- 统一搜索索引新增论文的研究方向、DOI 及稳定关联的资源名称；18 项均可按题名、作者、数字人文检索，已有 DOI 也可检索。内部审核字段和候选编号不进入索引。

## 检查结果

| 检查 | 结果 |
| --- | --- |
| 论文与统一搜索定向测试 | `node --test --test-reporter=dot tests/test_classic_papers.cjs tests/test_unified_search.cjs`，**111 项通过**。包含报告逐项题名/署名/年份/URL/DOI 对照、类型与缺项、唯一 ID、方向边界、稳定关联、分页和搜索返回。 |
| 浏览器定向验收 | `node tests/test_digital_humanities_research_browser.cjs`，**1280px、375px 通过**。18 项在论文目录、数字人文与统一搜索均可找到；刊物/DeepJiandu 链接、无 URL 卡片、分页/收起、筛选切换与搜索恢复正常。无运行错误或校验警告。 |
| 375px 资源组合筛选 | `node tests/test_resource_facets_browser.cjs`，42 种类型/方向组合及原资源分类、刊物入口、17 条书目、搜索返回通过。 |
| 视觉检查 | 已目视桌面与375px成果卡片、长英文标题/作者及 DeepJiandu 关联按钮截图；暖米色/暗红样式延续，无横向溢出或内部审核说明。截图与浏览器 JSON 结果位于系统临时目录 `digital-humanities-research-intake`，未加入正式站点。 |
| 语法与空白 | 修改的正式 JS、相关测试 JS/CJS 语法检查及 `git diff --check` 通过；新报告、新浏览器测试另做空白检查。 |
| 保护范围 | 原74篇论文逐字段比较一致；65条资源逐字段比较一致；17条书目、5种刊物、全部既有ID与首页精选保持原状。`index.html`、`style.css`、动态、专题数据及原审核报告的本轮前后哈希一致。 |

本轮实际改动：`data/classic-papers.js`、`script.js`；更新论文、搜索与资源筛选测试中的相关断言并补充入库/展示测试；新增本实施报告和专用浏览器测试。未修改页面布局、正式资源数据或旧报告，未运行无关大规模回归，未 commit、未 push。已有工作区未提交改动予以保留。
