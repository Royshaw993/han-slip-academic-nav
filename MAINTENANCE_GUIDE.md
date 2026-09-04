# 古文字学术导航 V1.1 维护指南

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

这是最重要的步骤。先在 data/candidate-updates.json 中找到已经批准的候选 id，然后严格按以下三步操作。

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
