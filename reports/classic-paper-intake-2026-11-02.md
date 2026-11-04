# 8条经典论文 / 研究史正式入库验收

日期：2026-11-02（Asia/Shanghai）。已完成本地入库；未 commit、未 push。

## 工作区检查与范围

开始时 Git 工作区已有首页、搜索、样式、学术动态、候选池及测试的未提交修改；`data/classic-papers.js`、`data/research-hubs.js` 无未提交差异。论文库仅有 `linyun-xianqin-pianpang`，批准的8条均未入库。

保留林澐原有记录全部字段及稳定 ID，仅新增 O1、Q1、Q2、O2、O3、B1、L1、W1，现共9条。候选报告中的其他条目未入库；L1/F21作为同一作品仅录一次。复用现有 `hubIds` 唯一关联结构，不向 Research Hub 增加第二份论文列表。

## 稳定 ID 与专题

| 候选 | 稳定 ID | Research Hub | 类型 |
| --- | --- | --- | --- |
| O1 | `dongzuobin-jiaguwen-duandai-yanjiuli` | `yinxu-oracle` | 经典论文 |
| Q1 | `lixueqin-qinghuajian-chubu-zhengli-yanjiu` | `qinghua-slips` | 研究史 |
| Q2 | `liuguozhong-lixueqin-yu-qinghuajian` | `qinghua-slips` | 研究史 |
| O2 | `zhufenghan-yinxu-jiaguwen-yanjiu` | `yinxu-oracle` | 研究史 |
| O3 | `zhaopeng-jiagu-zhuihe-yanjiu-huigu` | `yinxu-oracle` | 研究史 |
| B1 | `xuyahui-xizhou-qingtong-liqi-jinwen-jiantao` | `western-zhou-bronze` | 重要综述 |
| L1 | `chensongchang-chenxiangyuan-zoumalou-xihan-xinjinzhan` | `zoumalou-western-han-slips` | 重要综述 |
| W1 | `chengwei-wuyi-donghan-zhengli-yanjiu-qianjing` | `wuyi-eastern-han-slips` | 研究史 |

张家山、悬泉、马王堆仍显示论文空状态；原林澐记录保持 general、无 Hub 归属。新增记录均不额外设为 featured。

## 题录与链接核验

逐字段对照 `classic-paper-candidates-2026-11-02.md`，核对题名、作者、年份、刊物/文集、卷期页及类型，保留繁简版本字形和空字段。

- O1：复核[史语所官方作者书目](https://www1.ihp.sinica.edu.tw/Fellows/Tso-pin_Tung)及其检索题录，1933、文集、323–424。使用中文作者书目入口；不把集刊外编第一种填成期刊第1期。
- Q1：[清华大学教育基金会节选出处](https://www.tuef.tsinghua.edu.cn/info/1043/2374.htm)明确原文为《民族艺术》2014年第5期；保留页码空白，不采用网页年份2019。读者说明标明来源为节选。
- Q2：[期刊官方门户](https://szhd.cbpt.cnki.net/portal/journal/portal/client/paper/9be241f035be5a90b064d9a96775db3a)核2024、34卷1期、52–61+84，保留跳页。
- O2：[国家哲社文献中心1997年第1期目录](https://ncpssd.org/journal/details?gch=81900X&langType=1&num=1&years=1997)核115–139；[北大作者目录](https://history.pku.edu.cn/jszy/zfh/index.htm)检索题录交叉核作者、年期与题名。正式链接为整期目录。
- O3：[政治大学中文系第七辑目录](https://chinese.nccu.edu.tw/PageDoc/Detail?fid=5997&id=6841)核作者、题名及辑号；[香港浸会大学正式论文引文](https://jas.hkbu.edu.hk/content/dam/jas-assets/publications/bulletin-of-the-jao-tsung-i-academy-of-sinology/issue-11/i11_01.pdf)的检索题录交叉核2020与187–226，与候选报告相符。本轮目录附带的单篇PDF返回404；正式链接使用可访问的官方目录，维护备注明确此限制，不承诺全文可用。
- B1：[《新史学》官网](https://www.newhistory.org.tw/contents/202203251124411494/1650187749399260)核作者、题名、2013、24卷3期与综述内容；[TOAJ](https://toaj.stpi.niar.org.tw/index/journal/volume/article/4b1141f997a7bf910197cc741d3207a5)复核185–216。
- L1：读取并渲染本地原刊PDF首末页，目视核双作者陈松长、陈湘圆、印页45与52、末页刊头《中国史研究动态》2022年第1期。公开 URL 留空，不展示来源链接；仅关联走马楼西汉简。
- W1：[全国哲社工作办项目中期报告](https://www.nopss.gov.cn/n1/2017/1208/c400750-29694800.html)核程薇、原题及《中国史研究动态》2016年第2期。页码留空；按早期整理项目研究史材料定位，读者说明明确来源为项目报告中的题录说明，不采用网页年份2017。

所有公开链接沿用“查看来源”，使用 `target="_blank" rel="noopener noreferrer"`；内部 `sourceNote` 不展示、不进入搜索。

## 首页、搜索及返回状态

启用首页“经典论文 / 研究史”原有入口，计数9篇。沿用资源、书目等模块的打开/返回机制和现有卡片样式，列表由论文唯一数据源生成。首页默认不平铺论文列表。

验证全部8条可按题名、作者及关联专题检索且不重复；空URL不产生链接。论文列表内进入搜索、退出搜索可恢复列表；从模块返回保留首页门类、动态展开状态、原滚动位置和入口焦点。原有搜索结果与专题之间往返、专题内部搜索、Escape退出等状态恢复回归通过。

320、375、390、430及1280像素宽度检查通过；目视复核390/1280论文列表和375像素殷墟、西周论文区截图，标题换行正常、无横向溢出。

## 最终验证

| 验证 | 结果 |
| --- | --- |
| `node --test tests/test_classic_papers.cjs tests/test_research_hubs.cjs tests/test_unified_search.cjs` | 94/94通过 |
| `node tests/test_classic_papers_browser.cjs` | 30/30通过 |
| `node tests/test_homepage_browser.cjs` | 15/15通过 |
| `node tests/test_unified_search_browser.cjs` | 22/22通过 |
| `node tests/test_research_hubs_browser.cjs` | 23/23通过 |
| `node tests/test_ui_accessibility_browser.cjs` | 32/32通过 |
| `node tests/test_wechat_browser.cjs` | 15/15通过 |
| Python `unittest discover -s tests -p 'test_*.py'` | 26/26通过 |
| 全部项目JS/CJS的 `node --check` | 16个文件通过 |
| `git diff --check` | 通过 |

Python使用已有临时运行时 `academic-wechat-python-3.12.10/python.exe`；无需安装依赖。浏览器使用已有 Playwright 与 Edge，截图、报告及首末页PDF渲染均位于系统临时目录。

## 本轮改动边界

本轮修改 `data/classic-papers.js`、`index.html`、`script.js`、`tests/test_classic_papers.cjs`、`tests/test_classic_papers_browser.cjs`、`tests/test_unified_search.cjs`、`tests/test_unified_search_browser.cjs`、原已存在的未跟踪文件 `tests/test_homepage_browser.cjs`，并新增本验收记录。

写入前保存52个工作区文件的内容与SHA-256基线；其余44个已有文件保持逐字节一致。候选报告、候选池、锁文件、学术动态、Research Hub数据、样式及其他阶段文件均保持原样。对已有修改的首页、脚本及测试只作本任务所需的增量修改。Git暂存区未改变；未 commit、未 push。
