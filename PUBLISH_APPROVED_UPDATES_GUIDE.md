# 人工批准后的写入与 GitHub 发布指南

## 这项工具做什么

V1.1C 把“人工审核之后”的机械步骤集中到一个安全工具中：按你明确给出的 candidate id 预览，检查正式字段，写入 `academic-updates.js`，更新候选状态，并在你额外指定 `--push` 时提交和推送。

它不会判断一条候选是否值得发布，也不会自动批准候选。学术信息的真实性、字段内容和来源优先级仍须由人确认。

## 先找到 candidate id

用文本编辑器打开 `data/candidate-updates.json`，在 `candidates` 或 `olderCandidates` 中找到准备审核的条目。复制其 `id`，例如 `candidate-xxxxxxxxxxxx`。不要把标题当作 id，也不要一次加入尚未逐条批准的候选。

候选必须已经人工补全这些正式字段：`id`、`title`、`type`、`source`、`sourceUrl`、`date`、`summary`、`tags`、`featured`、`relatedResources`。如果缺少字段，工具会提示“待补充正式字段”并停止，不会猜测内容。

## 第一步：只读预览

在项目根目录打开 PowerShell：

```powershell
python tools/publish-approved-updates.py --ids candidate-xxxxxxxxxxxx --preview
```

预览会列出标题、来源、日期、类型、研究对象、历史记录标记、URL、拟生成的正式 id、会修改的文件及 Git 状态。它不写文件、不 commit、不 push。多个已批准候选可以依次写在 `--ids` 后。

如果只提供 `--ids` 而不写运行模式，工具也会安全地默认为 preview。

只想检查候选和 Git 环境时可用：

```powershell
python tools/publish-approved-updates.py --ids candidate-xxxxxxxxxxxx --dry-run
```

`--dry-run` 同样完全只读。

## 第二步：只写入本地

确认预览无误后执行：

```powershell
python tools/publish-approved-updates.py --ids candidate-xxxxxxxxxxxx --apply
```

工具会临时备份正式数据和候选数据，写入正式条目，更新 `academicUpdatesLastUpdated`，并把原候选保留为 `status: "published"`、增加 `publishedAt`。随后检查重复 id、重复 `title + source`、URL 和 JavaScript 语法。任一写入或校验失败时，两份文件都会恢复到执行前状态，不留下半写入结果。

`--apply` 不会执行 Git commit 或 push。建议再次查看页面和 `git diff`。

## 写入并推送 GitHub

只有再次明确确认时才执行：

```powershell
python tools/publish-approved-updates.py --ids candidate-xxxxxxxxxxxx --apply --push
```

工具会在写入前确认 Git 已安装、当前目录是仓库、分支明确、存在 `origin`、远端仓库名是 `han-slip-academic-nav`，并检查工作区。它只会显式暂存 `academic-updates.js` 和 `data/candidate-updates.json`，不会使用 `git add .`，也不会 force push。

如果有 `style.css`、`script.js`、`index.html` 等无关未提交修改，自动发布会停止。请先自行检查并妥善提交、暂存到别处或还原这些修改；不要为了通过检查而丢弃不明改动。发布目标文件本身已有未提交修改时也会停止，以免覆盖人工编辑。

## 历史补录与公众号候选

来自 `olderCandidates` 的条目会自动增加 `historical: true`，但保留候选中已经人工确认的原始 `date`；只有 `academicUpdatesLastUpdated` 使用本次维护日期。

若候选含有 `sourceType: "wechat"` 和 `preferOriginalSource: true`，预览会提醒确认是否存在更优的原始学术来源。提醒不会自动否决发布，但应优先把正式论文、大学、出版社或研究机构页面作为 `sourceUrl`。

## 失败时怎么办

本地写入或校验失败会自动恢复备份，请根据错误补全字段或修正数据，再重新从 preview 开始。

若 commit 已成功但 push 失败，本地正式数据和本地 commit 都会保留，不会回滚，也不要重复执行写入。检查网络、GitHub 登录或远端权限后，在仓库中手动执行普通 `git push` 即可；禁止 force push。

如果希望回到原来的手工流程，继续人工编辑 `academic-updates.js`、更新维护日期、运行现有检查并手工提交即可；这个工具没有改变页面结构或 GitHub 设置。

## 确认 GitHub Pages 已更新

push 成功后打开 GitHub 仓库的 Actions 或 Deployments 页面，确认 Pages 部署任务成功；随后打开网站，核对新动态的标题、链接、日期与历史补录标记。部署可能需要短暂等待，浏览器缓存未刷新时可强制刷新一次。
