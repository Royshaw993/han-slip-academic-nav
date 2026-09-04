# GitHub Pages 网站上传与发布流程

本文件用于记录如何把本地静态网站上传到 GitHub，并通过 GitHub Pages 发布成可以公开访问的网址。

---

## 一、适用的网站类型

适合：

- HTML
- CSS
- JavaScript
- 静态网页
- 不需要服务器后台的网站

例如本项目主要包含：

```text
index.html
style.css
script.js
academic-updates.js
research-topics.js
favicon.svg
```

---

# 二、第一次发布网站

第一次上线时，大致流程：

```text
新建 GitHub 仓库
↓
上传网站文件
↓
提交 Commit
↓
开启 GitHub Pages
↓
选择 main + /(root)
↓
等待部署
↓
获得公开网址
```

---

# 三、第一步：登录 GitHub

进入 GitHub 并登录自己的账号。

右上角点击：

```text
+
```

选择：

```text
New repository
```

---

# 四、第二步：新建仓库

填写：

```text
Repository name
```

例如：

```text
han-slip-academic-nav
```

Description 可以填写：

```text
个人古文字与汉代简牍学术资源导航网站
```

Visibility 选择：

```text
Public
```

第一次创建时可以保持：

```text
Add README：Off

.gitignore：No .gitignore

License：No license
```

然后点击：

```text
Create repository
```

---

# 五、第三步：上传网站文件

创建仓库以后，进入空仓库页面。

点击：

```text
uploading an existing file
```

或者：

```text
Add file
→ Upload files
```

上传网站运行所需要的文件。

例如：

```text
index.html
style.css
script.js
academic-updates.js
research-topics.js
favicon.svg
```

---

## 注意：index.html 的位置

`index.html` 必须直接位于仓库根目录。

正确：

```text
han-slip-academic-nav
├── index.html
├── style.css
├── script.js
├── academic-updates.js
├── research-topics.js
└── favicon.svg
```

不要变成：

```text
han-slip-academic-nav
└── 某个文件夹
    └── index.html
```

否则 GitHub Pages 可能无法正确找到首页。

---

# 六、哪些文件不一定需要公开上传

一些只用于本地维护的文件，不属于网页运行必需文件，可以暂时不上传。

例如：

```text
tools/
data/
REVIEW_RULES.md
MAINTENANCE_GUIDE.md
GITHUB_PUBLISH_GUIDE.md
```

它们主要用于：

- 本地维护
- 半自动检查
- 候选审核
- 操作记录

访客打开网页并不需要这些文件。

---

# 七、第四步：提交文件

文件上传完成以后，向页面下方滚动。

找到：

```text
Commit changes
```

在 Commit message 中填写：

```text
Initial V1.0 release
```

第一次发布也可以写：

```text
Initial website release
```

详细说明框可以留空。

然后点击绿色按钮：

```text
Commit changes
```

提交成功后，仓库首页应该能够看到刚才上传的网站文件。

---

# 八、第五步：开启 GitHub Pages

进入仓库顶部菜单：

```text
Settings
```

然后在左侧找到：

```text
Pages
```

进入 GitHub Pages 设置。

---

## Build and deployment

Source 选择：

```text
Deploy from a branch
```

Branch 选择：

```text
main
```

目录选择：

```text
/(root)
```

然后点击：

```text
Save
```

---

# 九、第六步：等待网站部署

GitHub Pages 通常需要：

```text
几十秒 ～ 几分钟
```

等待一会儿以后，刷新：

```text
Settings
→ Pages
```

如果看到：

```text
Your site is live at ...
```

说明网站已经成功发布。

---

# 十、网站网址是什么样子

GitHub Pages 的网址通常格式为：

```text
https://GitHub用户名.github.io/仓库名/
```

例如：

```text
https://royshaw993.github.io/han-slip-academic-nav/
```

以后这个网址就可以：

- 自己访问
- 发给同学
- 发给老师
- 分享给其他研究者

---

# 十一、以后忘记网站网址怎么办

进入：

```text
GitHub
↓
对应仓库
↓
Settings
↓
Pages
```

页面顶部会显示：

```text
Your site is live at ...
```

后面的链接就是正式网站网址。

---

# 十二、以后更新网站怎么办

以后修改网站时：

不需要重新创建仓库。

也不需要重新设置 GitHub Pages。

只需要更新原来的文件。

流程：

```text
本地修改网站
↓
进入原来的 GitHub 仓库
↓
上传修改后的文件
↓
Commit changes
↓
GitHub Pages 自动重新部署
```

---

# 十三、更新文件的方法

进入仓库：

```text
Add file
→ Upload files
```

上传已经修改过的同名文件。

例如修改了：

```text
academic-updates.js
```

就上传新的：

```text
academic-updates.js
```

如果同时修改：

```text
script.js
style.css
```

也一起上传。

---

# 十四、更新时 Commit message 怎么写

更新学术动态：

```text
Update academic data
```

更新网站样式：

```text
Update website styles
```

增加新功能：

```text
Add new website feature
```

修复错误：

```text
Fix website bug
```

也可以使用日期：

```text
Update academic data 2026-08-20
```

---

# 十五、提交更新后多久生效

提交以后：

```text
GitHub Pages
```

会自动重新部署。

通常需要：

```text
几十秒 ～ 几分钟
```

然后重新打开网站。

如果浏览器仍然显示旧内容，可以按：

```text
Ctrl + F5
```

进行强制刷新。

---

# 十六、发布后需要检查什么

每次比较大的更新之后，建议检查：

## 1. 首页

确认首页能够正常打开。

## 2. CSS

确认：

- 页面样式正常
- 卡片正常
- 字体正常
- 没有变成纯文字网页

## 3. JavaScript

确认：

- 搜索正常
- 分类正常
- 筛选正常
- 展开 / 收起正常

## 4. 学术动态

确认：

- 新增动态已经出现
- 日期正确
- 标签正确
- 专题数量正确

## 5. 外部链接

点击几个重要资源测试：

- 武汉大学简帛网
- 简牍学术资源平台
- 中国知网
- 简牍字典
- 其他核心资源

## 6. favicon

确认浏览器标签页能够显示网站图标。

## 7. 手机端

使用手机打开网站，确认：

- 没有横向滚动
- 搜索框正常
- 卡片正常
- 标签不会过度拥挤

---

# 十七、如果网站打不开

首先检查：

```text
GitHub
→ 仓库
→ Settings
→ Pages
```

确认仍然显示：

```text
Your site is live at ...
```

然后检查：

```text
index.html
```

是否还存在于仓库根目录。

---

# 十八、如果页面只有文字，没有样式

通常说明：

```text
style.css
```

没有正确加载。

检查：

```text
index.html
```

中的 CSS 路径。

对于当前这种仓库结构，通常应使用相对路径，例如：

```html
<link rel="stylesheet" href="style.css">
```

不要写成本地 Windows 路径，例如：

```text
D:\桌面\古文字学术导航\style.css
```

---

# 十九、如果搜索和筛选失效

检查以下 JavaScript 文件是否都上传：

```text
academic-updates.js
research-topics.js
script.js
```

并保持正确加载顺序：

```text
academic-updates.js
↓
research-topics.js
↓
script.js
```

---

# 二十、如果 favicon 不显示

检查：

```text
favicon.svg
```

是否已经上传。

同时检查：

```text
index.html
```

是否有 favicon 引用。

例如：

```html
<link rel="icon" href="favicon.svg" type="image/svg+xml">
```

---

# 二十一、第一次发布和以后更新的区别

## 第一次发布

```text
创建仓库
↓
上传文件
↓
Commit
↓
Settings
↓
Pages
↓
Deploy from a branch
↓
main
↓
/(root)
↓
Save
↓
等待部署
```

---

## 以后更新

```text
修改本地网站
↓
上传修改后的文件
↓
Commit
↓
等待 GitHub Pages 自动部署
```

不用再次设置 Pages。

---

# 二十二、最简记忆版

如果以后完全忘记操作，只记下面这段：

```text
第一次：

GitHub 新建仓库
→ 上传网站文件
→ Commit
→ Settings
→ Pages
→ Deploy from a branch
→ main
→ /(root)
→ Save
→ 等待 Your site is live


以后更新：

修改本地文件
→ 上传同名新文件
→ Commit
→ 等 GitHub Pages 自动更新
```

---

# 二十三、本项目当前公开网站

仓库：

```text
han-slip-academic-nav
```

网站地址：

```text
https://royshaw993.github.io/han-slip-academic-nav/
```

---

# 二十四、重要提醒

正式网站文件和本地维护工具要区分。

公开网站主要运行文件：

```text
index.html
style.css
script.js
academic-updates.js
research-topics.js
favicon.svg
```

本地维护文件例如：

```text
tools/
data/
REVIEW_RULES.md
MAINTENANCE_GUIDE.md
GITHUB_PUBLISH_GUIDE.md
```

可以继续保存在本地项目里，不一定公开上传。

---

# 一句话记忆

> 修改本地网站 → 上传 GitHub → Commit → GitHub Pages 自动发布。