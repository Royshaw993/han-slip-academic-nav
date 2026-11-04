# V1.3 学术论文入口补全与卡片文案优化

日期：2026-11-03（Asia/Shanghai）。仅本地维护；不重新审核入库，不commit、不push、不发布。

## 1. 范围、基线与结果

- 审核正式论文 **74条**，原有主URL **13条**、无主URL **61条**。
- 本轮为此前无URL的论文新增已核主入口 **12条**：国家哲学社会科学文献中心 **10条**、TOAJ **1条**、北京大学期刊平台公开扫描原文 **1条**。
- **CNKI新增0条，万方新增0条，维普新增0条**。CNKI主检索域名实际GET报证书域名不匹配，机构代理单篇也有超时；没有绕过证书、登录或验证码，没有按文件名推造CNKI地址。已有CNKI承载的期刊门户未计作本轮新增。
- 另优化已有主入口 **2条**：朱凤瀚整期目录→准确单篇信息页；曹建国正式单篇信息页→已核正式原刊PDF。故本轮写入14个已核目标URL，净增加有URL论文12篇。
- 最终有URL **25条**、无URL **49条**；每篇仍只有一个主URL，没有建立重复论文或增加第二个前台链接。
- 74个稳定ID、记录次序、所有题名作者及年/刊/卷/期/页/DOI等题录逐字段保持；分类、Hub关系、推荐状态和featured保持。N06、E03未发布。核心书目、8个Hub、首页经典精选及index.html均未修改。

开始前阅读了data/classic-papers.js、广泛收录审核、第二批实施报告及2026-11-02访问审计，并检查统一卡片、访问类型、Hub和搜索实现。以本轮开始时的工作区文件为基线，保留已有未提交修改。

## 2. 核验方法与边界

对61条无主URL记录逐条以题名检索，按需叠加作者、刊物及简繁变体，优先CNKI及官方期刊/机构；再检索万方、维普、国家哲社等可信平台。对其余13条实际GET原入口并复核内容类型。没有声称每条都可直接访问各数据库的站内检索：部分平台只获得搜索索引，不能据此计成功。

新链接须实际获取单篇页，并核题名和作者。国家哲社由真实期刊目录的onclick链接发现；动态题录另核Edge正文或页面自身公开题录接口。CTWX两条用该页getjournalarticletable接口核身份，同时如实保留Edge动态呈现未成功的结果。HTTP 200应用壳本身不算通过。PDF跟随官方页真实链接下载，核文件、题名署名、首/中/末印页。只读取公开响应；无登录、支付、订阅验证或本地PDF上传。

真实浏览器为无头Microsoft Edge。下表“Edge导航”表示打开目标页并核对正文，不冒称从本站点击全链路成功。TOAJ尝试点击下载按钮后未取得文件、验证码模态未成功显示；源码确有验证码下载流程，因此仅paper-info。Web工具click只是网页链接获取，另与真实浏览器结果区分。

## 3. 本轮写入的已核入口（12条补缺＋2条优化）

两项原有URL优化在“核验结果”标明；稳定ID是唯一作品键。全文链接未被数据库题录覆盖。

| 稳定ID | 论文题名 | 平台 | URL | 实际核验结果 | 访问类型 |
| --- | --- | --- | --- | --- | --- |
| `paper-n63` | 长沙走马楼西汉简所见“采铜”琐议 | 国家哲学社会科学文献中心 | [入口](https://ncpssd.cn/Literature/articleinfo?id=CTWX2020003011&type=journalArticle&typename=%E4%B8%AD%E6%96%87%E6%9C%9F%E5%88%8A%E6%96%87%E7%AB%A0&nav=1&langType=1) | 新增主入口；单篇HTML实际GET；页面使用的公开题录接口返回目标题名、作者及刊年期。Edge重试未完成动态题录呈现，需人工复查外站体验；不推断全文权限。 | `paper-info` |
| `paper-n62` | 长沙走马楼西汉简中的“定邑”小考 | 国家哲学社会科学文献中心 | [入口](https://ncpssd.cn/Literature/articleinfo?id=CTWX2022001011&type=journalArticle&typename=%E4%B8%AD%E6%96%87%E6%9C%9F%E5%88%8A%E6%96%87%E7%AB%A0&nav=1&langType=1) | 新增主入口；单篇HTML实际GET；页面使用的公开题录接口返回目标题名、作者及刊年期。Edge重试未完成动态题录呈现，需人工复查外站体验；不推断全文权限。 | `paper-info` |
| `paper-n51` | 走马楼西汉简所见长沙国职官建置论考 | 国家哲学社会科学文献中心 | [入口](https://ncpssd.cn/Literature/articleinfo?id=SHKXZX2022004010&type=journalArticle&typename=%E4%B8%AD%E6%96%87%E6%9C%9F%E5%88%8A%E6%96%87%E7%AB%A0&nav=1&langType=1) | 新增主入口；实际GET并经Edge导航打开，正文核对题名及全部作者；未登录，未验证全文权限。 | `paper-info` |
| `paper-n50` | 走马楼西汉简所见赦令初探 | 国家哲学社会科学文献中心 | [入口](https://ncpssd.cn/Literature/articleinfo?id=SHKXZX2022004011&type=journalArticle&typename=%E4%B8%AD%E6%96%87%E6%9C%9F%E5%88%8A%E6%96%87%E7%AB%A0&nav=1&langType=1) | 新增主入口；实际GET并经Edge导航打开，正文核对题名及全部作者；未登录，未验证全文权限。 | `paper-info` |
| `paper-n33` | 从走马楼西汉简歧异干支谈汉初历法混用问题 | 国家哲学社会科学文献中心 | [入口](https://ncpssd.cn/Literature/articleinfo?id=SHKXZX2022004012&type=journalArticle&typename=%E4%B8%AD%E6%96%87%E6%9C%9F%E5%88%8A%E6%96%87%E7%AB%A0&nav=1&langType=1) | 新增主入口；实际GET并经Edge导航打开，正文核对题名及全部作者；未登录，未验证全文权限。 | `paper-info` |
| `paper-n37` | 西汉国家权力对蛮人族群的渗透——基于走马楼西汉简所见无阳蛮人的探讨 | 国家哲学社会科学文献中心 | [入口](https://ncpssd.cn/Literature/articleinfo?id=SHKXZX2022008015&type=journalArticle&typename=%E4%B8%AD%E6%96%87%E6%9C%9F%E5%88%8A%E6%96%87%E7%AB%A0&nav=1&langType=1) | 新增主入口；实际GET并经Edge导航打开，正文核对题名及全部作者；未登录，未验证全文权限。 | `paper-info` |
| `paper-z2` | 张家山汉墓竹简研究述评 | 国家哲学社会科学文献中心 | [入口](https://ncpssd.cn/Literature/articleinfo?id=8985858&type=journalArticle&typename=%E4%B8%AD%E6%96%87%E6%9C%9F%E5%88%8A%E6%96%87%E7%AB%A0&nav=1&langType=1) | 新增主入口；实际GET并经Edge导航打开，正文核对题名及全部作者；未登录，未验证全文权限。 | `paper-info` |
| `paper-x3` | 1995—2005年敦煌悬泉汉简研究综述 | 国家哲学社会科学文献中心 | [入口](https://ncpssd.cn/Literature/articleinfo?id=23945474&type=journalArticle&typename=%E4%B8%AD%E6%96%87%E6%9C%9F%E5%88%8A%E6%96%87%E7%AB%A0&nav=1&langType=1) | 新增主入口；实际GET并经Edge导航打开，正文核对题名及全部作者；未登录，未验证全文权限。 | `paper-info` |
| `chengwei-wuyi-donghan-zhengli-yanjiu-qianjing` | 五一广场出土东汉简牍的整理与研究前景 | 国家哲学社会科学文献中心 | [入口](https://ncpssd.cn/Literature/articleinfo?id=668522162&type=journalArticle&typename=%E4%B8%AD%E6%96%87%E6%9C%9F%E5%88%8A%E6%96%87%E7%AB%A0&nav=1&langType=1) | 新增主入口；实际GET并经Edge导航打开，正文核对题名及全部作者；未登录，未验证全文权限。 | `paper-info` |
| `chensongchang-chenxiangyuan-zoumalou-xihan-xinjinzhan` | 长沙走马楼西汉简整理与研究的新进展 | 国家哲学社会科学文献中心 | [入口](https://ncpssd.cn/Literature/articleinfo?id=ZGSYJDT2022001008&type=journalArticle&typename=%E4%B8%AD%E6%96%87%E6%9C%9F%E5%88%8A%E6%96%87%E7%AB%A0&nav=1&langType=1) | 新增主入口；实际GET并经Edge导航打开，正文核对题名及全部作者；未登录，未验证全文权限。 | `paper-info` |
| `zhufenghan-yinxu-jiaguwen-yanjiu` | 近百年来的殷墟甲骨文研究 | 国家哲学社会科学文献中心 | [入口](https://ncpssd.cn/Literature/articleinfo?id=1002096142&type=journalArticle&typename=%E4%B8%AD%E6%96%87%E6%9C%9F%E5%88%8A%E6%96%87%E7%AB%A0&nav=1&langType=1) | 优化已有入口；实际GET并经Edge导航打开，正文核对题名及全部作者；未登录，未验证全文权限。 | `paper-info` |
| `paper-n12` | 漢代簡牘公文書的形制、性質與行政程序──論「兩行」的制度地位 | TOAJ | [入口](https://toaj.stpi.niar.org.tw/index/journal/volume/article/4b1141f98d5b0700018d5e9eee19019e) | 新增主入口；实际GET并经Edge导航打开，正文核对题名及全部作者；未登录，未验证全文权限。 下载按钮点击未出现可用下载；源码含验证码下载流程，未取得PDF。 | `paper-info` |
| `paper-z1` | 汉简《奏谳书》和秦汉刑事诉讼程序初探 | 北京大学期刊平台 | [入口](https://ccj.pku.edu.cn/Article/DownLoad?id=290880460&type=ArticleFile) | 新增主入口；从官方题名页真实PDF链接取得1,109,561字节、10页；渲染目视题名、张建国署名、1997年第2期及印页48、53、57，无登录。信息页误列52–61，本轮不改既有空页码。 | `scan-pdf` |
| `paper-z3` | 早期书写与文本传统——以张家山汉简《盗跖》为例 | 中国人民大学学报官网 | [入口](http://xuebao.ruc.edu.cn/CN/PDF/13511) | 优化已有入口；从正式单篇HTML的citation_pdf_url真实链接取得12,426,376字节、13页；渲染目视题名、曹建国署名及印页150、156、162，是正式排版全文，非先行工作论文。无需登录。 | `full-pdf` |

Z1扫描PDF首末印页48–57，而其信息页误列52–61；本轮只补真实PDF入口，不新增或更改正式页码。Z3正式PDF实际印页150–162，与已有题录一致；先前报告的工作论文版本判断继续保留为历史证据，不再用于描述本次已取得的正式PDF。

备用题录：Z1 https://ccj.pku.edu.cn/article/info?id=290880460；Z3 http://xuebao.ruc.edu.cn/CN/Y2025/V39/I4/150。保存于报告，不增加第二个前台按钮。O2原整期地址保留在旧审核报告和本轮临时基线。

## 4. 原13个主URL复查

| 稳定ID | 本轮实际获取及处理 |
| --- | --- |
| `dongzuobin-jiaguwen-duandai-yanjiuli` | 实际取得原PDF；保留原主URL和全文类型，不用题录覆盖。 |
| `lixueqin-qinghuajian-chubu-zhengli-yanjiu` | GET成功，HTML内目标题名/署名或目录项可核；保留原入口及类型。 |
| `liuguozhong-lixueqin-yu-qinghuajian` | GET成功，HTML内目标题名/署名或目录项可核；保留原入口及类型。 |
| `zhufenghan-yinxu-jiaguwen-yanjiu` | GET整期成功；Edge单篇正文核题名与朱凤瀚署名，通过后优化为单篇，见第3节。 |
| `zhaopeng-jiagu-zhuihe-yanjiu-huigu` | GET目录成功并核趙鵬及目标题名；保留bibliography。本轮未重验旧失效PDF，不将历史索引升级为全文。 |
| `xuyahui-xizhou-qingtong-liqi-jinwen-jiantao` | 实际取得原PDF；保留原主URL和全文类型，不用题录覆盖。 |
| `paper-z3` | GET原正式题录成功；跟随真实PDF元链接取得正式版并升级，见第3节。 |
| `paper-m3` | GET成功，HTML内目标题名/署名或目录项可核；保留原入口及类型。 |
| `paper-b2` | 实际取得原PDF；保留原主URL和全文类型，不用题录覆盖。 |
| `paper-x1` | GET成功，HTML内目标题名/署名或目录项可核；保留原入口及类型。 |
| `paper-x2` | GET成功，HTML内目标题名/署名或目录项可核；保留原入口及类型。 |
| `paper-w3` | GET成功，HTML内目标题名/署名或目录项可核；保留原入口及类型。 |
| `paper-n18` | GET成功，HTML内目标题名/署名或目录项可核；保留原入口及类型。 |

## 5. 检索过而保持无URL的49条

每条均检索过题名（按需叠加作者、简繁/标点变体）；下表记录最接近的线索和未采用原因。未检出可靠单篇不等于文献不存在，不补造发表字段或摘要。

| 稳定ID | 题名 / 作者 | 未补主URL的原因 |
| --- | --- | --- |
| `linyun-xianqin-pianpang` | 先秦古文字中待探索的偏旁 / 林澐 | 只定位到作者自述、他文引文与2019文集重收书目；未得2001原刊单篇入口。保留已有辅助书目。 |
| `paper-q3` | 清华简《保训》与周文王事商 / 刘国忠 | 检索所得清华新闻《保训》与周文王称王是异文；清华学报2009年5期目录未完成目标单篇定位，不用新闻替代。 |
| `paper-m1` | 马王堆出土《老子》乙本卷前古佚书的研究 / 唐兰 | 真实《考古学报》1975年1期目录定位同正题、唐兰及副题；跟随实际单篇加密链接超时，未核得其动态题录。 |
| `paper-m2` | 从刘向校书再论马王堆帛书《老子》乙本卷前古佚书非《黄帝四经》 / 徐建委 | 北大机构库发现同题徐建委单篇173249；HTTPS握手及HTTP重试均超时。检索索引不能代替当前获取。 |
| `paper-b3` | 西周中期青铜器的重要标尺——周原庄白、强家两处青铜器窖藏的综合研究 / 李学勤 | 只发现引文、重收文集线索；未得1979原刊单篇页。 |
| `paper-l2` | 走马楼西汉简《长沙邸传舍劾文书》解析 / 李均明 | 官方PDF实际取得4,475,536字节、172页整期；目标在文件页124–128，题名与李均明可核。未作单篇直达主入口，候选整期URL见下。 |
| `paper-l3` | 长沙走马楼西汉简狱政资料的整理与考证 / 李均明、宋少华 | 只定位到他文正式引文、会议/文集目录，未得目标单篇。 |
| `paper-w2` | 长沙五一广场东汉简牍整理研究论著目录（2010年至今） / 徐畅、高智敏 | 香港中文大学课程页引用该篇目录文章；课程书目不是目标论文单篇入口。 |
| `paper-n02` | 《長沙五一廣場東漢簡牘》分類校注及相關問題研究 / 傅杉杉 | 题名、作者及简繁变体检索未得可确认的学位库/高校单篇落地页；学校名单、母目录或同主题文献不作替代。 |
| `paper-n03` | 《長沙五一廣場東漢簡牘（壹）-（肆）》語詞彙釋 / 徐碩 | 题名、作者及简繁变体检索未得可确认的学位库/高校单篇落地页；学校名单、母目录或同主题文献不作替代。 |
| `paper-n04` | 《長沙五一廣場東漢簡牘（壹）》校注 / 牛天志 | 题名、作者及简繁变体检索未得可确认的学位库/高校单篇落地页；学校名单、母目录或同主题文献不作替代。 |
| `paper-n05` | 五一廣場東漢簡牘所見縣級司法研究 / 刘运杰 | 题名、作者及简繁变体检索未得可确认的学位库/高校单篇落地页；学校名单、母目录或同主题文献不作替代。 |
| `paper-n07` | 東漢簡牘司法文書詞彙研究 / 李歡 | 题名、作者及简繁变体检索未得可确认的学位库/高校单篇落地页；学校名单、母目录或同主题文献不作替代。 |
| `paper-n08` | 長沙地區所見東漢簡牘詞彙專題研究 / 繆愷然 | 题名、作者及简繁变体检索未得可确认的学位库/高校单篇落地页；学校名单、母目录或同主题文献不作替代。 |
| `paper-n10` | 2003年長沙走馬樓西漢簡牘重大考古發現 / 長沙簡牘博物館、長沙市文物考古研究所聯合發掘組 | 集体署名文章只找到目录、引文与考古新闻，不以新闻替代论文。 |
| `paper-n19` | 走马楼西汉简所见长沙国民族及其社会生活 / 王博凯 | 社科大官网可定位同题页3772，网页工具可读摘要；本机GET、Edge题录呈现及所附PDF反复超时，未完成同一页面的署名核验。机构代理CNKI索引仅作发现。 |
| `paper-n20` | 走马楼西汉简新见“长沙临湘少内禁钱计”校缪案编联整理与研究 / 雷长巍、李建平 | 只找到山东师大同主题讲座及参考网转载线索；讲座不是目标双作者论文，未确认可信数据库单篇。 |
| `paper-n23` | 长沙走马楼西汉简牍所见“都乡七年垦田租簿”及其相关问题分析 / 朱德贵 | 真实2015年2期目录核题名、朱德贵与页码范围；实际加密单篇URL取得应用壳，Edge未成功呈现目标内容，暂不写入。 |
| `paper-n24` | 长沙走马楼西汉简牍狱案研究 / 刘梦君 | 学校科研实践报告会汇总表不是学位论文单篇页；未得可信学位库落地页。 |
| `paper-n30` | “都乡七年垦田租簿”的年代问题商榷——兼论走马楼西汉简牍的年代 / 宋少华、杨芬 | 只找到同主题讲座综述及重收文集目录，未核目标单篇页。 |
| `paper-n31` | 《簡牘名蹟選2》所刊“走馬樓前漢簡”釋文校訂 / 胡平生 | 只定位到集刊/会议文集目录与他文引文，未核原载版本单篇。 |
| `paper-n32` | 《长沙走马楼西汉简牍选粹》释文补正 / 雷长巍、李建平 | 龙源2024年第3期为整期目录；未核目标双作者的可用单篇地址。 |
| `paper-n34` | 再论秦汉时期的“狱”——以长沙走马楼西汉简为中心 / 陈松长 | 同题转载来源域名异常，不采用；未确认《华东政法大学学报》目标单篇。 |
| `paper-n35` | 對走馬樓西漢簡“非縱火時擅縱火”的考察 / 王勇 | 所得经济作物管理论文是罗启龙另一篇文章，只引用王勇论文，不能替代。 |
| `paper-n36` | 從走馬樓漢簡看西漢歸附蠻夷的編户化管理 / 王勇 | 只定位到正式论文中的参考文献及文集目录。 |
| `paper-n38` | 西汉时期乐人公职服务问题考论——以走马楼西汉简《都乡七年垦田租簿》为中心 / 李立 | 官方PDF实际取得4,278,327字节、128页整期，文件页102–112含李立目标全文；未找到单篇直达入口，整期候选记录在下。 |
| `paper-n39` | 西汉诸侯王墓园邑制度的几个问题——以长沙走马楼西汉简牍为中心 / 李银德 | 只定位到正式论文引用，未确认《考古》2023年4期目标题录单篇。 |
| `paper-n40` | 讀長沙走馬樓西漢簡札記——紀年與證律 / 杨芬 | 项目报告介绍该文内容，属于他处介绍而非该文正文/题录页。 |
| `paper-n42` | 走馬樓西漢簡“都鄉七年墾田租簿”再整理 / 雷长巍、李建平 | 未核得对应原载版本的可信单篇页；所得集刊/文集目录或他文引文只能作为发现线索，不冒充目标论文。 |
| `paper-n43` | 走馬樓西漢簡中的“别治醴陵”與“别治長賴” / 王勇 | 未核得对应原载版本的可信单篇页；所得集刊/文集目录或他文引文只能作为发现线索，不冒充目标论文。 |
| `paper-n44` | 走馬樓西漢簡刑制史料初探 / 欧扬 | 项目报告和文集目录介绍该文，不能作为论文单篇。 |
| `paper-n45` | 走馬樓西漢簡所見“譯人”及相關問題試論 / 王博凯 | 项目报告与他文参考文献能定位作品，但不是目标单篇页。 |
| `paper-n46` | 走馬樓西漢簡所見里名及相關問題考論 / 陈湘圆 | 未核得对应原载版本的可信单篇页；所得集刊/文集目录或他文引文只能作为发现线索，不冒充目标论文。 |
| `paper-n47` | 走馬樓西漢簡的斷代——兼談草書的形成時間 / 李洪财 | 作者访谈、通俗说明及他文引文不能替代目标正式集刊文章。 |
| `paper-n53` | 長沙走馬樓西漢簡《卯劾僮詐爲書案》所見“將田”“部”“將大農田”諸問題小議 / 杨芬、宋少华 | 未核得对应原载版本的可信单篇页；所得集刊/文集目录或他文引文只能作为发现线索，不冒充目标论文。 |
| `paper-n54` | 長沙走馬樓西漢簡《宫司空令史兒等爲武擅解脱易桎弗舉劾案》初步考察 / 杨芬、宋少华 | 未核得对应原载版本的可信单篇页；所得集刊/文集目录或他文引文只能作为发现线索，不冒充目标论文。 |
| `paper-n55` | 長沙走馬樓西漢簡《都鄉七年墾田租簿》初步考察 / 马代忠 | 未核得对应原载版本的可信单篇页；所得集刊/文集目录或他文引文只能作为发现线索，不冒充目标论文。 |
| `paper-n56` | 長沙走馬樓西漢簡中的“將田”小考 / 陈松长、刘国庆 | 项目报告、集刊母目录列该文，未得到目标单篇。 |
| `paper-n57` | 長沙走馬樓西漢簡中的人名雜識 / 陈松长 | 只定位到后出论文的引文及文集目录。 |
| `paper-n58` | 長沙走馬樓西漢簡中的文字異寫現象例説 / 陈松长 | 项目报告介绍该文而非本文；未得到原载单篇。 |
| `paper-n59` | 長沙走馬樓西漢簡牘所見年代、疆域瑣議——以走馬樓西漢簡牘爲中心 / 宋少华 | 讲座综述与他文引文/文集目录不能作为本文入口。 |
| `paper-n61` | 长沙走马楼西汉简《都乡七年垦田租簿》考论 / 吕志峰 | 未核得对应原载版本的可信单篇页；所得集刊/文集目录或他文引文只能作为发现线索，不冒充目标论文。 |
| `paper-n64` | 走马楼西汉简所见地名辑证 / 陈守琪 | 题名、作者及简繁变体检索未得可确认的学位库/高校单篇落地页；学校名单、母目录或同主题文献不作替代。 |
| `paper-n41` | 谈走马楼西汉简中的两条简文 / 刘乐贤 | 题名作者检索未定位到可信目标单篇；不使用他文或同批简牍论文替代。 |
| `paper-n14` | 历代简牍形制特点概述 / 邓咏秋 | 形制相关一般网页、书目和引文较多，未定位邓咏秋该篇；期刊目录尝试未取得目标题录。 |
| `paper-n15` | 秦简牍形制若干问题研究 / 梅书英 | 题名、作者及简繁变体检索未得可确认的学位库/高校单篇落地页；学校名单、母目录或同主题文献不作替代。 |
| `paper-n16` | 简帛文献所见秦汉官府建筑研究 / 谢伟斌 | 发现机构代理CNKI博士论文1024451089.nh索引（署谢伟斌、湖南大学、2023），实际获取超时；不转换域名或编造官方CNKI地址。 |
| `paper-e01` | 释“爰书”——读秦、汉简牍札记 / 高敏 | 只得到《秦汉爰书考辨》正式引文；目标期刊曾用名可定位，但该文单篇未核。 |
| `paper-e02` | 竹简秦汉律中的“赎罪”与“赎刑” / 朱红林 | 《史学月刊》2007年5期真实目录核全题、朱红林；实际加密单篇页访问未完成，不使用目录或他文作替代。 |

### 接近目标但尚未采用的具体外链

- M1、N23、E02：已从真实目录发现的加密单篇地址仍需人工复查动态呈现；没有写入数据。
  - paper-m1：[待核单篇](https://ncpssd.cn/Literature/secure/articleinfo?params=WUJQQkJrZGJvVHY0TXBldE4vZ01yYmVkMlQzbks4Y24xeEJtTkF4bm1RcWtZZVdGRzAxTFFvajMwNjcxdUpPTW93bUVIUVJ2d1ZnLys3Z1NHZ1U0dUV6QUlOZDQwZ0hpV3RpdHVOcEwvRzR2K2dKU1N6VHV5Z2hMK24vSTZVejFINDhGNGZ4dlR3RU9PZTExODM4eVBnPT0)。
  - paper-n23：[待核单篇](https://ncpssd.cn/Literature/secure/articleinfo?params=R0EwRzdPUmQ2cGxYWXVaZnkrUzBxN3lqbFduZHlsYXBhUHlFTVNOdmZqTWV2a3M5NTNRL01kS1htdDcxOFBJdDZUeEFDVjFDY2wraytsek1HRHIxbktuSnU1ZzJtWmtJS0NUcTc2eFAvWE93REE0TTlqejRyQnl6L1FuTEo3VThQQmgrbWhoVW1ieTFQc1lOenVNbW13PT0)。
  - paper-e02：[待核单篇](https://ncpssd.cn/Literature/secure/articleinfo?params=RzBYLzZWanFFQVFPNm1aVEk0S215TkphelhETXRtVS9HdlZnMGlnNUVPelk3N2JnUmdSa0xmWG1sWW5JODgrUkxmOFF3aFNhWElmT0xoWVVFUEN0dEgwZ3RwL0pBUFBUcjhMZDh3OS96NlpUUVJQTUFieVBLTnV6VjZtQWV1ZlA)。

- M2：[北大机构库单篇](https://ir.pku.edu.cn/handle/20.500.11897/173249)，连接超时；N16：[机构代理CNKI学位记录](https://cnki.istiz.org.cn/kcms/detail/detail.aspx?dbcode=CDFD&dbname=CDFD2025&filename=1024451089.nh)，仅索引可定位、实取超时；没有改写成猜测的官方知网地址。
- N19：[社科大目标页](https://xbbjb.ucass.edu.cn/info/1247/3772.htm)及[所附PDF](https://xbbjb.ucass.edu.cn/__local/3/B7/9A/6904D9B2A3EFA848D9CFB98B8AF_72D40B33_6B82EB.pdf)未完成当前署名核验，PDF反复读取超时。
- L2：[期刊整期PDF](https://zzxk1979.cn/Uploads/PdfFile/2021-01-29/6013743529d71.pdf)，172个文件页，目标在124–128；N38：[期刊整期PDF](https://www.zywhyj.cn/Uploads/PdfFile/2021-05-12/609b97847a20e.pdf)，128页，目标在102–112。两者实际可定位全文，但本轮保守不把整期下载包装成单篇阅读主入口。没有裁切并公开上传。

## 6. 读者卡片文案与内部证据分离

目录、Research Hub和统一搜索继续共用classicPaperCardTemplate。移除accessNote的前台输出，sourceNote与accessChecked保持维护用途，搜索白名单也不收录这些内部字段。note与真实abstract仍可展示，空字段不造简介。本轮没有新增任何摘要，也没有按题名自动生成学术介绍。

| 修改前 | 修改后 |
| --- | --- |
| 无URL：“题录已核，暂无经核验的公开全文入口。” | 只显示题名、作者、出版信息，以及原有且有价值的简介；没有空操作区。 |
| paper-info：“目标题录/摘要；未核实无登录阅读全文……” | 底部“查看论文信息”；不重复解释权限核验。 |
| full-html：“目标报纸文章HTML正文；非期刊PDF。” | 底部“阅读原文”；内部技术说明仍保留。 |
| 林澐简介后缀“其经典性尚待原文评阅确认”等编辑状态 | 简化为“古文字偏旁与构形方法的专题选读。”原note逐字追加保存到sourceNote。 |
| 清华简背景、人物补充、五一简线索中的推荐排序解释 | 保留原有学术定位，删除内部推荐资格评语；原note完整存入sourceNote。 |

主按钮统一：scan-pdf“阅读原文（扫描PDF）”、full-pdf“阅读原文（PDF）”、full-html“阅读原文”、paper-info“查看论文信息”、excerpt“阅读节选”、bibliography“查看书目记录”；none无主链接。林澐等原有合法辅助书目继续用“查看书目记录”，不冒充阅读按钮。

链接归入仅在实际有来源时才生成的底部操作区，多个来源自然换行；没有固定最小卡片高度或空白占位。暖米色、暗红色、栏目名称和布局不重设计。完整目录每次12篇的渐进展开、Hub少量预览与展开、搜索与返回状态保持。

所有原sourceNote保留为新值的前缀；发生入口变化时，原accessNote逐字附存sourceNote并注明历史。原审核报告不修改，原题录不修改，内部证据没有删除。

## 7. 实际执行的测试与结果

| 检查 | 实际命令或方法 | 最终结果 |
| --- | --- | --- |
| 论文、专题、统一搜索定向单测 | `node --test tests/test_classic_papers.cjs tests/test_research_hubs.cjs tests/test_unified_search.cjs` | **103/103通过**。含14个已核入口与报告一致、无URL无空按钮、保留有价值note、内部说明隐藏及摘要转义。 |
| 论文目录与专题卡片 | `node tests/test_classic_papers_browser.cjs` | **34/34通过**，真实无头Edge，无页面错误。 |
| Research Hub导航与返回 | `node tests/test_research_hubs_browser.cjs` | **23/23通过**，真实无头Edge，无页面错误。 |
| 统一搜索与来源按钮 | `node tests/test_unified_search_browser.cjs` | **23/23通过**；逐篇按74篇的题名、作者检索，核按钮文案、URL和隐藏的内部说明。首次执行因旧测试仍等待已移除的classic-paper-access而超时；更新该断言为“不出现内部说明”后重跑通过。 |
| JS/CJS语法 | 对本轮修改的6个JS/CJS逐一 `node --check` | 全部通过。文件为script.js、data/classic-papers.js、tests/test_classic_papers.cjs、tests/test_classic_papers_browser.cjs、tests/test_unified_search.cjs、tests/test_unified_search_browser.cjs。 |
| Git空白检查 | `git diff --check` | 通过。 |
| 数量、稳定ID及保护边界 | 与本轮临时baseline.json逐字段比较；index.html与核心书目逐字节比较 | 74条、74个唯一稳定ID，顺序不变，所有题录字段不变；N06/E03未发布；原有全文URL全部不变；每条sourceNote保留原文前缀，变更的原accessNote/note完整归档。index.html及核心书目内容不变。 |

本站浏览器合计 **80项通过**，与外站浏览器/网页获取分开计数。三组覆盖320、375、390、430px；检查长题名、长作者及出版信息换行、无横向溢出、无URL卡片底部无空操作区（卡片末段到下边距不足25px）、链接位置、12篇渐进展开至74篇及收起、Hub预览和展开、搜索退出后滚动/展开恢复、返回焦点及首页原HTML保持。目视抽查320px长标题卡片、375px走马楼专题展开截图，风格与排版正常。

仅运行本轮相关定向测试，没有无关全量回归。浏览器截图/JSON仍在系统临时目录classic-papers-browser、research-hubs-browser、unified-search-browser；所有测试自建服务与浏览器均正常关闭。

## 8. 尚待人工检查的外部访问

1. 新NSSD单篇中的N62/N63已由页面公开题录接口核对作者题名，但Edge动态呈现重试仍未通过；需人工跨网络复查阅读体验。其余NSSD已在本轮Edge中成功显示目标题录，不据此承诺免费全文。
2. TOAJ目标题名作者可读；下载点击未取得文件、模态未显示，仍按信息页。具体验证码、登录及下载交互需要人工复查。
3. 第5节所有待核单篇、机构库及整期PDF不属于本轮新增成功单篇。网络超时和脚本挑战没有被解释为“论文不存在”。
4. 未登录验证NSSD/CNKI/万方/维普的全文和机构订阅权益；本轮报告不作付费或免费推断。本站浏览器测试与外站核验分开计数。

原始公开HTML、PDF、接口响应、Edge正文与导航结果、PDF渲染图及本轮基线保存在系统临时目录 `%TEMP%/classic-source-links-2026-11-03/`；不作为网站公开资源。源文件只维护14个主入口及4条note的必要变动，不上传任何本地PDF。
