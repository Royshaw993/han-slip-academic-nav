# 古文字学术导航 V1.2 维护指南

这是一份日常操作手册。平时按顺序执行即可，不需要了解程序内部实现。

> 重要：自动发现不等于自动发布。任何正式动态都必须经过人工审核和确认。

## 1. 平时怎么维护

每周维护流程：

每周自动检查 → 有候选才审核 → 公众号文章可手动导入 → 人工决定是否收录 → Preview → Apply → Push → 检查线上网站

平时主要接触三个文件：

- data/candidate-updates.json：等待审核的候选。
- REVIEW_RULES.md：人工审核标准。
- academic-updates.js：网站正式显示的学术动态。

如果本周没有新候选，不需要做其他操作，下周再检查即可。

## 2. 自动检查官方网站

系统默认在每周日上午 10:00 自动检查已配置的官方网站。计划任务名称是“古文字学术导航-每周学术动态检查”。自动检查只发现候选，不会修改正式动态。

想立即手动检查时，在项目根目录运行：

```
python tools/check-updates.py
```

只做安全测试，不联网、不写数据：

```
tools\run-weekly-check.bat --dry-run
```

检查完成后查看：

- 候选：data/candidate-updates.json
- 日志：logs/update-check.log

如果自动任务失效，可重新安装：

```
powershell -ExecutionPolicy Bypass -File tools\install-weekly-task.ps1
```

确认任务是否存在：

```
Get-ScheduledTask -TaskName '古文字学术导航-每周学术动态检查'
```

不再需要自动任务时卸载：

```
powershell -ExecutionPolicy Bypass -File tools\uninstall-weekly-task.ps1
```

卸载任务不会删除候选、日志或网站数据。某个网站访问失败时，其他来源仍可继续检查；不要连续高频重试失败来源。

### 来源管理助手

V1.2 可用本机来源管理助手维护 `data/sources.json`。在项目根目录运行：

```powershell
python tools/manage-sources.py
```

然后打开终端显示的 `http://127.0.0.1:8766/`。新增来源默认只需填写名称、URL、至少一个门类和关键词，备注可选，来源默认启用；id、sourceType、priority、maxDetailRequests、门类专用关键词和人工复核标记位于折叠的“高级设置”。门类专用关键词可用逗号或换行填写，无需手写 JSON。页面还支持按门类筛选、查看和编辑来源、启用/停用，以及单来源测试。保存会先校验 id、URL、重复 URL、门类和关键词，并在 `data/sources.review-backup.json` 保留保存前版本；发现外部修改时会拒绝覆盖。助手只监听本机，不需要数据库或前端依赖；使用完毕在终端按 Ctrl+C 关闭。

## 3. 导入微信公众号文章

在微信中复制公开文章链接，然后运行：

```
python tools/import-wechat-candidate.py "文章URL"
```

一次导入多个链接：

```
python tools/import-wechat-candidate.py "URL1" "URL2"
```

导入后打开 data/candidate-updates.json 查看结果。工具只处理你主动提供的公开链接，不批量抓取历史文章，不使用 Cookie，也不绕过登录或验证。

如果页面无法读取，工具可能只建立一个待补充候选，需要人工核对标题、作者、来源和日期。无法确认的信息不要猜。

公众号主要用于发现线索。如果文章是转载，正式收录时应优先寻找论文、期刊、大学官网、出版社或研究机构的原始来源。

## 4. 审核候选

V1.2 推荐使用本地审核助手。在项目根目录运行：

```powershell
python tools/review-candidates.py
```

在浏览器打开终端显示的 `http://127.0.0.1:8765/`，关闭时在终端按 Ctrl+C。若端口被占用，可用 `--port 8766`。只依赖 Python 标准库，不需要安装前端框架。不要直接双击 HTML 文件，也不要将此助手作为公网服务部署。

审核页顶部显示“近期候选 X 条 · 历史候选 Y 条”。近期按运行当天向前推 12 个日历月（含分界日），读取原 `date`，没有时读取 `possibleDate`；`olderCandidates` 或早于分界日的条目归入历史。默认展示近期，历史独立折叠；没有近期时显示“当前暂无近期候选”。日期缺失、无效、未来日期或仅有月份且不能明确判断范围的条目另列“日期待核验”，不拿发现日期代替文章日期。

搜索仍覆盖各分区，会自动展开命中的历史/待核验分区；“选择当前结果”只选择当前展开且匹配的候选。收起分区会取消该分区的选择。分层只影响展示，不搬移候选池、不改日期或审核结论；普通候选因时间变旧而出现在历史区时，仍须人工决定是否标为“历史补录”。

1. 按标题、来源或研究对象查找，勾选一条或多条候选，无需复制 id。
2. 点击“正式加入 / 历史补录 / 暂不加入 / 不建议加入”保存审核结论。
3. 对已标记“正式加入 / 历史补录”的候选点击“预览所选（preview）”，查看现有发布工具的结果或缺失字段提示。
4. 如需补全，编辑 `data/candidate-updates.json` 中对应候选，只填写已核实的信息，然后点“重新读取”再预览。必需字段仍以发布工具检查为准，不能把 `possibleDate` 未经核验直接当作正式 `date`。

“正式加入”只是审核结论，助手没有 apply、commit 或 push 入口。结果保存在候选的 `reviewDecision` 字段（`approved / historical / deferred / rejected`），保留原始 `status`、候选池位置和其他字段。`olderCandidates` 始终按历史补录处理；普通候选标为 `historical` 后也按历史补录预览。已标为暂不加入或不建议加入的候选，发布工具会要求先重新人工审核。

每次成功保存前，会在 `data/candidate-updates.review-backup.json` 保留上一版内容（下一次保存会更新备份）。需要撤销时先关闭助手，核对备份后再恢复；不要把备份当成新候选导入。检测到外部修改会拒绝覆盖，点击“重新读取”后重新审核。保存时避免同时运行导入、周检或手动编辑候选。异常退出若遗留 `data/candidate-updates.review.lock`，确认所有审核助手均已关闭后再删除该锁文件。备份和锁文件均为本地运行文件，无需发布到网站。

打开 data/candidate-updates.json，按照 REVIEW_RULES.md 逐条判断：

- 正式加入
- 历史补录
- 可选
- 暂不加入
- 不建议加入

重点核对标题、作者或责任者、日期、来源、原文链接、研究对象和是否重复。日期未知、页面信息不完整或来源无法确认时，先暂不加入。

超过近期范围但有长期参考价值的专著、整理成果、数据库、经典论文或综述，可以作为历史补录。

> 最终是否加入必须由人工决定。AI 可以帮助检查，但不能代替人工批准。

## 5. 发布审核通过的内容

这是最重要的步骤。审核助手已支持无须复制 id 的 preview；以下是后续手动发布或命令行备用方法，须明确指定已经人工批准的候选 id。

第一步：预览

```
python tools/publish-approved-updates.py --ids 候选ID --preview
```

Preview 只显示准备发布的标题、来源、日期、类型、链接、历史补录状态、修改文件和 Git 状态，不修改任何文件。

第二步：写入本地

```
python tools/publish-approved-updates.py --ids 候选ID --apply
```

Apply 把内容写入本地正式数据并进行校验，但不会上传 GitHub。校验失败时会恢复写入前的数据。

第三步：正式上线

```
python tools/publish-approved-updates.py --ids 候选ID --apply --push
```

校验通过后，工具只提交本次发布相关文件并普通推送到 han-slip-academic-nav。GitHub Pages 随后自动更新，远程 Git 历史也作为网站备份。

> 不要跳过 Preview。工具提示字段不完整时不要猜，应先从可靠来源补全正式信息。

来自 olderCandidates 的内容默认按历史补录处理，并保留原始日期。公众号候选会提醒检查更合适的原始来源。发现无关未提交修改时，工具会暂停 Push，避免把其他文件一起提交。

如果 Push 失败，但本地写入或提交已经成功，不要重复 Apply。先运行 git status 检查，解决网络、登录或远程权限问题后再执行普通 git push。禁止强制推送。

正式上线前后建议检查：

- git status
- git remote -v
- git branch
- 新动态的标题、日期、来源和链接
- GitHub Pages 的 Actions、Deployments 或 Settings → Pages

阶段性改动尚未验收完成时，不要提前 Push。

## 6. 网站新版怎么用

V1.2 在专题结果的筛选栏新增“返回默认视图”：清除专题、动态类型和研究对象，切回“最新动态”，恢复默认前 6 条和“查看更多动态”。操作仅影响动态区；若搜索框仍有文字，其他资源仍使用该搜索词，动态区会显示说明，修改搜索词即可重新搜索动态。

Hero 的“甲—金—石—简—帛”是站内门类按钮，沿用原地切换并标记当前门类，不滚动跳转。“简”回到汉代简牍体系；“石”“帛”显示“资源整理中”。顶部气泡栏移除甲骨文、金文，保留原有十个分类。点击 Hero 门类会清除搜索词与研究方向筛选，以显示该门类的完整资源。

资源仍统一维护在 `script.js` 的 `sites` 中，`resourceCategories` 支持多门类，新增专项资源以 `genreOnly: true` 限定在相应 Hero 门类显示，`accessNote` 展示简洁权限标签。默认首页仍为 6 条其他资源；常用网站、小學堂总入口和殷墟甲骨文数据库的既有 URL 保留。

2026-09-11 补充甲骨文 3 项：[小學堂甲骨文](https://xiaoxue.iis.sinica.edu.tw/jiaguwen)、[合集材料来源表](https://xiaoxue.iis.sinica.edu.tw/obm/Home/Welcome)、[汉达文库“新甲骨文”](http://www.chant.org/Database.aspx)（可能需要机构访问权限）。补充金文 4 项：[小學堂金文](https://xiaoxue.iis.sinica.edu.tw/jinwen/Home/Home)、[殷周金文暨青銅器資料庫](https://bronze.asdc.sinica.edu.tw/)（需要申请账号）、[先秦甲骨金文簡牘詞彙資料庫](https://inscription.asdc.sinica.edu.tw/c_index.php)、[商周金文数字查询平台](https://jwdcdbz.ancientbooks.cn/dictionary)。中研院两项入口经其官方数据库及[金文工作室介绍](https://www.ihp.sinica.edu.tw/~bronze/)核对，商周平台机构未确认，留空。汉达访问说明可参见[复旦大学图书馆](https://library.fudan.edu.cn/e8/6e/c42799a518254/page.htm)。本次不扩展其他门类，也不更改全站旧有链接核验日期。

公众号来源配置在 `data/wechat-sources.json`，首批五项与现有页面名称一致。`priority` 数字越小越优先，本批统一为 1；`topics` 是线索归类；机构未知时保留空字符串，官方身份未知时用 `official: null`，不得把未知写成已确认。导入工具启动时读取并校验名单，按提取到的来源名称记录 `sourceWhitelisted`，同时保留 `needsSourceReview: true`。名称命中不证明账号官方身份，也不代表文章已批准；名称未知或未命中时仅保留待人工核验候选。不抓取公众号列表或历史文章，不使用登录凭证。以后调整来源名单时也需同步核对 `index.html` 中的人工维护展示卡片。

V1.1D.1 只改变访客使用方式，不改变候选审核和发布流程。站内操作尽量统一为“原地切换”和“原地展开”，只有外部数据库、学术资源或论文原文链接会离开本站。

- 顶部分类在当前页面原地切换主内容，不再主要依赖页面滚动。
- 搜索框用于全站搜索。
- “最新动态 / 重点专题”是同一区域内的双视图切换。
- 最新动态可以按“动态类型 + 研究对象”组合筛选，结果在当前区域直接更新。
- 点击重点专题后，专题结果仍在当前动态区域显示，不会跳到页面其他位置。
- 核心资源标签只筛选当前资源区；没有专门数据库时仍保留综合资源。
- 资源筛选会同时作用于核心资源和其他学术资源；如果其他学术资源暂无匹配项，页面会显示提示，并可点击“清除资源筛选”恢复全部资源。
- “我的常用网站”保持 6 张卡片；点击“学术公众号”会在卡片下方原地展开，再次点击或选择“收起公众号”即可关闭。
- 独立平铺的公众号大模块已取消，公众号内容仍只用于发现线索，不等于正式收录。
- 其他学术资源默认显示较少条目，可以使用按钮原地展开或收起。
- Zotero 已归入“其他学术资源”中的学术工具。

## 7. 出问题时怎么办

| 问题 | 处理 |
| --- | --- |
| Python 找不到 | 运行 python --version。若仍找不到，检查 Python 是否安装并加入 PATH。 |
| 自动检查失败 | 查看 logs/update-check.log。 |
| 中国考古网 SSL timeout | 记为人工检查，不需要反复请求。 |
| 公众号页面读不到 | 打开候选文件，人工补充能够可靠确认的信息。 |
| 候选缺字段 | 不发布，先从可靠来源补全。 |
| Git 显示有无关修改 | 暂停 Push，运行 git status 逐项检查。 |
| Push 失败 | 本地数据仍保留；排查 Git 后重新执行普通 git push，不重复 Apply。 |
| GitHub Pages 没更新 | 等待几分钟，检查部署状态，再按 Ctrl + F5。 |

不要为了消除报错而删除不明改动，也不要绕过网站的登录、验证码或访问限制。

## 8. 手动备用办法

自动工具失效时，保留以下备用流程：

手动运行 tools/check-updates.py → 查看 data/candidate-updates.json → 按 REVIEW_RULES.md 审核 → 人工修改 academic-updates.js → 更新维护日期并检查数据 → git commit → git push

手动编辑时同样必须核对信息、检查重复和链接。历史补录保留原始事件日期，不要改成今天。

如果本地 Git 也暂时不可用，可以进入现有 GitHub 仓库，使用 Add file → Upload files 上传本次实际修改的同名文件，再提交。不要重新创建仓库，不要上传无关文件。

## 9. 安全底线

- 自动发现不等于自动发布。
- 不绕过验证码、登录或访问限制，不抓取私人内容。
- 不让 AI 猜作者、日期、标题、出处或链接等关键学术信息。
- 公众号转载优先寻找原始学术来源。
- 不使用 git push --force。
- 不使用 git add .，不把无关文件一起提交。
- 不把密码、Token、Cookie 或其他凭证写入项目和日志。

最简记忆版：

每周自动检查 → 有候选才审核 → 公众号文章可手动导入 → 按 REVIEW_RULES.md 审核 → Preview → 确认后 Apply → 需要上线时 Apply --push → 检查 GitHub Pages
