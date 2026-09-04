# 每周自动检查使用说明

## 1. 这套自动检查是干什么的

这套流程会定期运行现有的 `tools/check-updates.py`，低频查看 `data/sources.json` 中已启用的官方网站，并把发现的新条目保存为待审核候选。

自动检查只负责“发现”。它不会批准候选，不会修改 `academic-updates.js`，不会提交或推送 Git，也不会发布到 GitHub Pages。候选仍须人工审核。

## 2. 默认什么时候运行

默认计划为每周一次：每周日上午 10:00（使用电脑的本地时间）。任务只以安装任务时的当前 Windows 用户身份运行。

## 3. 如何安装任务

在项目根目录打开 PowerShell，运行：

```powershell
powershell -ExecutionPolicy Bypass -File tools\install-weekly-task.ps1
```

脚本会根据自身位置自动找到项目，不依赖固定盘符或固定文件夹。一般不需要管理员权限。如果单位电脑的安全策略禁止普通用户创建计划任务，Windows 可能会拒绝安装；此时请联系电脑管理员，不要尝试绕过策略。

重复运行安装命令会更新同名任务。任务名称是“古文字学术导航-每周学术动态检查”。

## 4. 如何确认任务已经创建

打开“任务计划程序”，在“任务计划程序库”中查找“古文字学术导航-每周学术动态检查”。也可以在 PowerShell 中运行：

```powershell
Get-ScheduledTask -TaskName '古文字学术导航-每周学术动态检查'
```

任务设置为：如果上一次仍在运行，不启动新的实例。

## 5. 如何立即手动测试

不必等到周日。在项目根目录双击或在命令提示符中运行：

```bat
tools\run-weekly-check.bat
```

该命令会执行一次真实检查，因此会按现有规则访问已启用的官方网站，并可能更新候选文件和已见条目文件。

如只想测试路径、Python 和本地配置，不联网也不写入数据，可运行：

```bat
tools\run-weekly-check.bat --dry-run
```

## 6. 去哪里看日志

日志位于：

```text
logs\update-check.log
```

日志记录开始和结束时间、Python 入口和版本、来源统计、候选统计及退出状态。日志达到约 5 MB 后会简单轮换：旧日志改名为 `update-check.log.1`，只保留一份旧日志。

## 7. 去哪里看候选

待人工审核的候选位于：

```text
data\candidate-updates.json
```

`data\seen-items.json` 用于避免重复发现。正式网站数据仍在 `academic-updates.js`，自动流程不会修改它。

## 8. 如何卸载自动任务

在项目根目录打开 PowerShell，运行：

```powershell
powershell -ExecutionPolicy Bypass -File tools\uninstall-weekly-task.ps1
```

卸载只删除计划任务，不会删除候选、日志或任何网站数据。

## 9. 电脑关机时错过计划任务怎么办

任务启用了“错过计划后尽快启动”。如果周日上午 10:00 电脑关机，Windows 会在之后任务可运行、且该用户已登录时补跑一次。也可以随时手动运行 `tools\run-weekly-check.bat`。

## 10. Python 找不到怎么办

启动脚本按以下顺序查找 Python 3：

1. 项目中的 `.venv\Scripts\python.exe`；
2. `py -3`；
3. `python`。

如果都找不到，检查会以错误状态结束，并在日志中写明 `Python 3 was not found`。可安装 Python 3 并勾选加入 PATH，或在项目根目录建立可用的 `.venv`。安装后先运行 `tools\run-weekly-check.bat --dry-run` 验证。

## 11. 某个网站访问失败怎么办

网络超时、SSL 错误、401、403、429、验证码、登录或访问验证都会让该来源停止本次检查并标记为需要人工检查，不会导致其他来源全部崩溃。请稍后人工打开官方网站核对；不要高频重试，也不要绕过验证码、登录或其他访问限制。中国考古网等网站偶发 SSL 超时，也按人工检查处理。

## 12. 自动检查不会自动发布

无论发现多少新候选，本流程都只写入 `data/candidate-updates.json`（并维护 `data/seen-items.json`）。它绝不会自动修改 `academic-updates.js`，不会自动批准候选，不会执行 `git commit` 或 `git push`，也不会更新 GitHub Pages。
