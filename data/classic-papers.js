/*
 * 长期研究资料唯一数据源；人工选录，不从 academic-updates 自动迁移。
 * id 是持久引用键：补全年份、调整题名或 URL 时不重建。
 * hubIds 是唯一专题关系；general 不表示自动关联全部专题。
 * 未核验字段留空；volume / issue / pages / url 可选。
 * note 面向读者；sourceNote 仅供维护，不展示、不筛选、不排序。
 * accessType 定义按钮用途；accessNote / accessChecked 保留内部访问核验记录，不直接展示。
 * relatedSources 可选，保存辅助题录/书目；不代替主 URL 的访问类型。
 * recommendationStatus：recommended、background、catalog-only；缺省兼容旧 featured。
 */
window.classicPapers = [
  {
    id: "linyun-xianqin-pianpang",
    title: "先秦古文字中待探索的偏旁",
    author: "林澐",
    year: "2001",
    journal: "古文字研究",
    issue: "第21辑",
    pages: "",
    categories: ["general"],
    hubIds: [],
    type: "经典论文",
    note: "古文字偏旁与构形方法的专题选读。",
    featured: false,
    url: "",
    accessType: "none",
    accessNote: "尚未核得可公开阅读的原刊全文，完整页码待核。下方书目为2019年文集重收记录，不是本文正文。",
    accessChecked: "2026-11-02",
    recommendationStatus: "background",
    relatedSources: [{ url: "https://www.fdgwz.org.cn/Web/Show/4535", accessType: "bibliography", context: "2019年文集重收" }],
    sourceNote: "依据本轮用户确认：《古文字读书会》材料中明确提及作者与题名。2026-11-02访问审计：吉林大学作者自述核2001发表于《古文字研究》；故宫博物院论文引文核第21辑。361–367仅有引文索引线索，未核原刊首末页，pages留空，不移填文集重印页码。具体专题归属及原刊全文URL待核。详见 reports/classic-paper-access-audit-2026-11-02.md。 2026-11-03卡片文案精简前的原note（保留维护记录）：古文字偏旁与构形方法的专题选读；其经典性尚待原文评阅确认。"
  },
  {
    id: "dongzuobin-jiaguwen-duandai-yanjiuli",
    title: "甲骨文斷代研究例",
    author: "董作賓",
    year: "1933",
    journal: "慶祝蔡元培先生六十五歲論文集",
    pages: "323–424",
    categories: ["oracle"],
    hubIds: ["yinxu-oracle"],
    type: "经典论文",
    note: "提出甲骨断代的系统标准，是理解殷墟甲骨分期、贞人及书体研究传统的奠基性读物。",
    featured: false,
    url: "https://upload.wikimedia.org/wikipedia/commons/d/d3/NLC416-07jh010998-5035_%E7%94%B2%E9%AA%A8%E6%96%87%E6%96%B7%E4%BB%A3%E7%A0%94%E7%A9%B6%E4%BE%8B.pdf",
    accessType: "scan-pdf",
    accessNote: "国家图书馆藏扫描本，共115个文件页，含封面、插页；正文印页323–424。2026-11-02已下载并抽查可读，未要求登录；扫描图像不支持正文文字检索。",
    accessChecked: "2026-11-02",
    recommendationStatus: "recommended",
    relatedSources: [{ url: "https://www1.ihp.sinica.edu.tw/Fellows/Tso-pin_Tung", accessType: "bibliography", context: "作者书目" }],
    sourceNote: "批准候选 O1；依据 reports/classic-paper-candidates-2026-11-02.md。史语所书目核1933、文集及323–424；属集刊外编第一种，不作期刊1期。2026-11-02访问审计核下载扫描PDF 4,632,335字节、115文件页，目视封面及印页323、340、423、424；说明页：https://commons.wikimedia.org/wiki/File:NLC416-07jh010998-5035_甲骨文斷代研究例.pdf 。此为网络下载和PDF阅读核验，非真实浏览器点击通过。"
  },
  {
    id: "lixueqin-qinghuajian-chubu-zhengli-yanjiu",
    title: "我与清华简的初步整理研究",
    author: "李学勤",
    year: "2014",
    journal: "民族艺术",
    issue: "5",
    pages: "",
    categories: ["slips"],
    hubIds: ["qinghua-slips"],
    type: "研究史",
    note: "清华简入藏与初步整理的亲历背景史料。",
    featured: false,
    url: "https://www.tuef.tsinghua.edu.cn/info/1043/2374.htm",
    accessType: "excerpt",
    accessNote: "仅页面第一部分节选自本文，第二部分为另行编写内容；节选无需登录。完整原刊、完整页码及全文权限尚未核实。",
    accessChecked: "2026-11-02",
    recommendationStatus: "background",
    sourceNote: "批准候选 Q1；依据 reports/classic-paper-candidates-2026-11-02.md。清华大学教育基金会页面明确节选自《民族艺术》2014年第5期李学勤原文；网页日期2019不是论文年份。完整原刊页码未核，留空；URL为节选及出处说明。 2026-11-03卡片文案精简前的原note（保留维护记录）：清华简入藏与初步整理的亲历背景史料；不作为清华简研究总综述或优先推荐的方法教程。"
  },
  {
    id: "liuguozhong-lixueqin-yu-qinghuajian",
    title: "李学勤先生与清华简",
    author: "刘国忠",
    year: "2024",
    journal: "邯郸学院学报",
    volume: "34",
    issue: "1",
    pages: "52–61+84",
    categories: ["slips"],
    hubIds: ["qinghua-slips"],
    type: "研究史",
    note: "清华简整理团队与人物研究的补充阅读。",
    featured: false,
    url: "https://szhd.cbpt.cnki.net/portal/journal/portal/client/paper/9be241f035be5a90b064d9a96775db3a",
    accessType: "paper-info",
    accessNote: "此页提供题录、摘要和部分附注；全文需转知网获取，登录、订阅或机构权限尚未确认。",
    accessChecked: "2026-11-02",
    recommendationStatus: "catalog-only",
    sourceNote: "批准候选 Q2；依据 reports/classic-paper-candidates-2026-11-02.md。官方期刊门户核作者、题名、2024、34卷1期及52–61+84，保留跳页。URL为题录及摘要页，全文获取以期刊平台说明为准。 2026-11-03卡片文案精简前的原note（保留维护记录）：人物与整理团队史的补充题录，暂不列为优先推荐；与亲历背景史料存在内容重叠。"
  },
  {
    id: "zhufenghan-yinxu-jiaguwen-yanjiu",
    title: "近百年来的殷墟甲骨文研究",
    author: "朱凤瀚",
    year: "1997",
    journal: "历史研究",
    issue: "1",
    pages: "115–139",
    categories: ["oracle"],
    hubIds: ["yinxu-oracle"],
    type: "研究史",
    note: "回顾截至1997年的甲骨材料著录、考释和分期研究，供研究史选读，不代表当前最新研究现状。",
    featured: false,
    url: "https://ncpssd.cn/Literature/articleinfo?id=1002096142&type=journalArticle&typename=%E4%B8%AD%E6%96%87%E6%9C%9F%E5%88%8A%E6%96%87%E7%AB%A0&nav=1&langType=1",
    accessType: "paper-info",
    accessNote: "实际GET并经Edge导航打开，正文核对题名及全部作者；未登录，未验证全文权限。",
    accessChecked: "2026-11-03",
    recommendationStatus: "background",
    sourceNote: "批准候选 O2；依据 reports/classic-paper-candidates-2026-11-02.md。北京大学作者目录核作者、题名及《历史研究》1997年第1期；国家哲社文献中心该期目录核115–139。URL为整期目录，不是单篇全文。 2026-11-03入口补全：实际GET并经Edge导航打开，正文核对题名及全部作者；未登录，未验证全文权限。 原访问说明（历史记录）：链接为《历史研究》1997年第1期整期目录，需在目录中定位本文。阅读全文需登录，登录后的访问权限尚未确认。 详见 reports/classic-paper-source-links-and-card-copy-2026-11-03.md。"
  },
  {
    id: "zhaopeng-jiagu-zhuihe-yanjiu-huigu",
    title: "甲骨綴合研究回顧",
    author: "趙鵬",
    year: "2020",
    journal: "出土文獻研究視野與方法",
    issue: "第七輯",
    pages: "187–226",
    categories: ["oracle"],
    hubIds: ["yinxu-oracle"],
    type: "研究史",
    note: "以时间和方法转变梳理甲骨缀合工作，供缀合方法史选读。",
    featured: false,
    url: "https://chinese.nccu.edu.tw/PageDoc/Detail?fid=5997&id=6841",
    accessType: "bibliography",
    accessNote: "链接仅为第七辑书目目录。2026-11-02核验时，官方附带全文链接失效，尚未核得可用的公开全文入口。",
    accessChecked: "2026-11-02",
    recommendationStatus: "background",
    sourceNote: "批准候选 O3；依据 reports/classic-paper-candidates-2026-11-02.md。目录核题名、作者；原候选报告及香港浸会大学引文核2020、187–226。2026-11-02访问审计：含PageDoc及站点根目录的两种PDF地址本机均404；检索工具可读的旧40页内容不代表当前可下载。只保留目录URL，详见 reports/classic-paper-access-audit-2026-11-02.md。"
  },
  {
    id: "xuyahui-xizhou-qingtong-liqi-jinwen-jiantao",
    title: "近二十多年西周青銅禮器與金文研究之課題與檢討",
    author: "許雅惠",
    year: "2013",
    journal: "新史學",
    volume: "24",
    issue: "3",
    pages: "185–216",
    categories: ["bronze"],
    hubIds: ["western-zhou-bronze"],
    type: "重要综述",
    note: "评述礼制变化、断代历谱、社会网络与性别等路径并检讨研究方法；覆盖到2013年前后的研究，不作为最新综述。",
    featured: false,
    url: "https://www.newhistory.org.tw/admin/contents/ajaxGetPic/1650187747444888_24-3-05-%285%29%20%E8%A8%B1%E9%9B%85%E6%83%A0.pdf",
    accessType: "full-pdf",
    accessNote: "期刊官方原文PDF，共32页，印页185–216；2026-11-02实际下载并抽查可读，未要求登录、订阅或验证码。",
    accessChecked: "2026-11-02",
    recommendationStatus: "recommended",
    relatedSources: [{ url: "https://www.newhistory.org.tw/contents/202203251124411494/1650187749399260", accessType: "paper-info" }],
    sourceNote: "批准候选 B1；依据 reports/classic-paper-candidates-2026-11-02.md。期刊官网核作者、题名、2013、24卷3期；TOAJ核185–216：https://toaj.stpi.niar.org.tw/index/journal/volume/article/4b1141f997a7bf910197cc741d3207a5 。2026-11-02审计实际取得官方PDF 993,905字节、32页，目视185、200、216；网页工具缓存未取到PDF不等于下载失败。本记录依据本机下载及PDF阅读核验，非外站真实浏览器点击通过。"
  },
  {
    id: "chensongchang-chenxiangyuan-zoumalou-xihan-xinjinzhan",
    title: "长沙走马楼西汉简整理与研究的新进展",
    author: "陈松长、陈湘圆",
    year: "2022",
    journal: "中国史研究动态",
    issue: "1",
    pages: "45–52",
    categories: ["slips"],
    hubIds: ["zoumalou-western-han-slips"],
    type: "重要综述",
    note: "梳理走马楼J8井西汉简的发现、保护、整理与研究进展，可作为本专题的阶段性研究入口。",
    featured: false,
    url: "https://ncpssd.cn/Literature/articleinfo?id=ZGSYJDT2022001008&type=journalArticle&typename=%E4%B8%AD%E6%96%87%E6%9C%9F%E5%88%8A%E6%96%87%E7%AB%A0&nav=1&langType=1",
    accessType: "paper-info",
    accessNote: "实际GET并经Edge导航打开，正文核对题名及全部作者；未登录，未验证全文权限。",
    accessChecked: "2026-11-03",
    recommendationStatus: "background",
    sourceNote: "批准候选 L1（与F21同篇，仅入库一次）；依据 reports/classic-paper-candidates-2026-11-02.md。本地原刊PDF《长沙走马楼西汉简整理与研究的新进展_陈松长.pdf》首页核双作者与印页45，末页核2022年第1期及印页52；公开单篇URL未确认，留空。仅关联走马楼西汉简，不关联三国吴简。 2026-11-03入口补全：实际GET并经Edge导航打开，正文核对题名及全部作者；未登录，未验证全文权限。 原访问说明（历史记录）：题录已核，暂无经核验的公开全文入口。可按《中国史研究动态》2022年第1期45–52页查阅馆藏，公共全文访问权限尚未确认。 详见 reports/classic-paper-source-links-and-card-copy-2026-11-03.md。"
  },
  {
    id: "chengwei-wuyi-donghan-zhengli-yanjiu-qianjing",
    title: "五一广场出土东汉简牍的整理与研究前景",
    author: "程薇",
    year: "2016",
    journal: "中国史研究动态",
    issue: "2",
    pages: "",
    categories: ["slips"],
    hubIds: ["wuyi-eastern-han-slips"],
    type: "研究史",
    note: "五一广场东汉简早期整理项目的研究史线索。",
    featured: false,
    url: "https://ncpssd.cn/Literature/articleinfo?id=668522162&type=journalArticle&typename=%E4%B8%AD%E6%96%87%E6%9C%9F%E5%88%8A%E6%96%87%E7%AB%A0&nav=1&langType=1",
    accessType: "paper-info",
    accessNote: "实际GET并经Edge导航打开，正文核对题名及全部作者；未登录，未验证全文权限。",
    accessChecked: "2026-11-03",
    recommendationStatus: "catalog-only",
    sourceNote: "批准候选 W1；依据 reports/classic-paper-candidates-2026-11-02.md。全国哲社工作办项目报告核程薇、完整题名及《中国史研究动态》2016年第2期；网页2017不是论文年份。2026-11-02审计原报告 https://www.nopss.gov.cn/n1/2017/1208/c400750-29694800.html 本机两次连接重置；仅作题录出处证据，不作为读者阅读入口。原刊全文与页码未取得，页码留空。推荐状态为补充题录，不删除作品或专题关系。 2026-11-03入口补全：实际GET并经Edge导航打开，正文核对题名及全部作者；未登录，未验证全文权限。 原访问说明（历史记录）：尚未核得完整页码及可用的公开全文入口。现有出处证据为提及本文的2017年项目报告，原刊全文的访问权限尚未确认。 详见 reports/classic-paper-source-links-and-card-copy-2026-11-03.md。 2026-11-03卡片文案精简前的原note（保留维护记录）：五一广场东汉简早期整理项目的研究史线索，暂保留为补充题录，不作为总体研究综述或优先推荐。"
  },
  {
    "id": "paper-z1",
    "reviewId": "Z1",
    "title": "汉简《奏谳书》和秦汉刑事诉讼程序初探",
    "author": "张建国",
    "year": "1997",
    "journal": "中外法学",
    "volume": "",
    "issue": "2",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zhangjiashan-hanjian"
    ],
    "type": "期刊论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "https://ccj.pku.edu.cn/Article/DownLoad?id=290880460&type=ArticleFile",
    "accessType": "scan-pdf",
    "accessNote": "从官方题名页真实PDF链接取得1,109,561字节、10页；渲染目视题名、张建国署名、1997年第2期及印页48、53、57，无登录。信息页误列52–61，本轮不改既有空页码。",
    "accessChecked": "2026-11-03",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 Z1；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。 2026-11-03入口补全：从官方题名页真实PDF链接取得1,109,561字节、10页；渲染目视题名、张建国署名、1997年第2期及印页48、53、57，无登录。信息页误列52–61，本轮不改既有空页码。 原访问说明（历史记录）：题录已核，暂无经核验的公开全文入口。 详见 reports/classic-paper-source-links-and-card-copy-2026-11-03.md。"
  },
  {
    "id": "paper-z2",
    "reviewId": "Z2",
    "title": "张家山汉墓竹简研究述评",
    "author": "张小锋、沈颂金",
    "year": "2003",
    "journal": "中国史研究动态",
    "volume": "",
    "issue": "2",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zhangjiashan-hanjian"
    ],
    "type": "期刊论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "https://ncpssd.cn/Literature/articleinfo?id=8985858&type=journalArticle&typename=%E4%B8%AD%E6%96%87%E6%9C%9F%E5%88%8A%E6%96%87%E7%AB%A0&nav=1&langType=1",
    "accessType": "paper-info",
    "accessNote": "实际GET并经Edge导航打开，正文核对题名及全部作者；未登录，未验证全文权限。",
    "accessChecked": "2026-11-03",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 Z2；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。 2026-11-03入口补全：实际GET并经Edge导航打开，正文核对题名及全部作者；未登录，未验证全文权限。 原访问说明（历史记录）：题录已核，暂无经核验的公开全文入口。 详见 reports/classic-paper-source-links-and-card-copy-2026-11-03.md。"
  },
  {
    "id": "paper-z3",
    "reviewId": "Z3",
    "title": "早期书写与文本传统——以张家山汉简《盗跖》为例",
    "author": "曹建国",
    "year": "2025",
    "journal": "中国人民大学学报",
    "volume": "39",
    "issue": "4",
    "pages": "150–162",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zhangjiashan-hanjian"
    ],
    "type": "期刊论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "http://xuebao.ruc.edu.cn/CN/PDF/13511",
    "accessType": "full-pdf",
    "accessNote": "从正式单篇HTML的citation_pdf_url真实链接取得12,426,376字节、13页；渲染目视题名、曹建国署名及印页150、156、162，是正式排版全文，非先行工作论文。无需登录。",
    "accessChecked": "2026-11-03",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 Z3；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。 2026-11-03入口补全：从正式单篇HTML的citation_pdf_url真实链接取得12,426,376字节、13页；渲染目视题名、曹建国署名及印页150、156、162，是正式排版全文，非先行工作论文。无需登录。 原访问说明（历史记录）：正式单篇题录入口；已下载的工作论文是另一版本，不冒充正式排版全文。 详见 reports/classic-paper-source-links-and-card-copy-2026-11-03.md。"
  },
  {
    "id": "paper-q3",
    "reviewId": "Q3",
    "title": "清华简《保训》与周文王事商",
    "author": "刘国忠",
    "year": "2009",
    "journal": "清华大学学报（哲学社会科学版）",
    "volume": "",
    "issue": "5",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "qinghua-slips"
    ],
    "type": "期刊论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 Q3；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-m1",
    "reviewId": "M1",
    "title": "马王堆出土《老子》乙本卷前古佚书的研究",
    "author": "唐兰",
    "year": "1975",
    "journal": "考古学报",
    "volume": "",
    "issue": "1",
    "pages": "",
    "doi": "",
    "categories": [
      "silk"
    ],
    "hubIds": [
      "mawangdui-silk"
    ],
    "type": "期刊论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 M1；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-m2",
    "reviewId": "M2",
    "title": "从刘向校书再论马王堆帛书《老子》乙本卷前古佚书非《黄帝四经》",
    "author": "徐建委",
    "year": "",
    "journal": "",
    "volume": "",
    "issue": "",
    "pages": "",
    "doi": "",
    "categories": [
      "silk"
    ],
    "hubIds": [
      "mawangdui-silk"
    ],
    "type": "学术论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 M2；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-m3",
    "reviewId": "M3",
    "title": "马王堆帛书《导引图》出土50年研究概述",
    "author": "晁胜杰、陈倩、周倩、王震",
    "year": "2025",
    "journal": "湖南中医药大学学报",
    "volume": "45",
    "issue": "3",
    "pages": "",
    "doi": "10.3969/j.issn.1674-070X.2025.03.016",
    "categories": [
      "silk"
    ],
    "hubIds": [
      "mawangdui-silk"
    ],
    "type": "期刊论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "https://opaj.napstic.cn/periodicalArticle/0120250401578115",
    "accessType": "paper-info",
    "accessNote": "目标题录/摘要；未核实无登录阅读全文，不能因页面有下载按钮就改标全文。",
    "accessChecked": "2026-11-03",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 M3；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-b2",
    "reviewId": "B2",
    "title": "册命铭文的变化与西周厉、宣铜器分界",
    "author": "韩巍",
    "year": "2009",
    "journal": "文物",
    "volume": "",
    "issue": "1",
    "pages": "80–85",
    "doi": "",
    "categories": [
      "bronze"
    ],
    "hubIds": [
      "western-zhou-bronze"
    ],
    "type": "期刊论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "https://fh.pku.edu.cn/docs/2018-11/20181110164332397851.pdf",
    "accessType": "scan-pdf",
    "accessNote": "实际取得6页扫描原文；前轮未需登录，未作浏览器点击验收。",
    "accessChecked": "2026-11-03",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 B2；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-b3",
    "reviewId": "B3",
    "title": "西周中期青铜器的重要标尺——周原庄白、强家两处青铜器窖藏的综合研究",
    "author": "李学勤",
    "year": "1979",
    "journal": "中国历史博物馆馆刊",
    "volume": "",
    "issue": "1",
    "pages": "",
    "doi": "",
    "categories": [
      "bronze"
    ],
    "hubIds": [
      "western-zhou-bronze"
    ],
    "type": "期刊论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 B3；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-x1",
    "reviewId": "X1",
    "title": "敦煌悬泉汉简研究综述",
    "author": "刘全波、李若愚",
    "year": "2018",
    "journal": "",
    "volume": "28",
    "issue": "4",
    "pages": "6–12",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "xuanquan-hanjian"
    ],
    "type": "期刊论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "https://ksgb.cbpt.cnki.net/portal/journal/portal/client/paper/36215433707fa28246e29fd2d1c56e88",
    "accessType": "paper-info",
    "accessNote": "目标题录/摘要；未核实无登录阅读全文，不能因页面有下载按钮就改标全文。",
    "accessChecked": "2026-11-03",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 X1；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-x2",
    "reviewId": "X2",
    "title": "悬泉汉简和西域史事",
    "author": "殷晴",
    "year": "2002",
    "journal": "西域研究",
    "volume": "",
    "issue": "3",
    "pages": "10–17",
    "doi": "10.16363/j.cnki.xyyj.2002.03.002",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "xuanquan-hanjian"
    ],
    "type": "期刊论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "https://xyyj.cbpt.cnki.net/portal/journal/portal/client/paper/00985703547e15681dec67c2f50dd20b",
    "accessType": "paper-info",
    "accessNote": "目标题录/摘要；未核实无登录阅读全文，不能因页面有下载按钮就改标全文。",
    "accessChecked": "2026-11-03",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 X2；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-x3",
    "reviewId": "X3",
    "title": "1995—2005年敦煌悬泉汉简研究综述",
    "author": "韩华",
    "year": "2007",
    "journal": "中国史研究动态",
    "volume": "",
    "issue": "2",
    "pages": "2–7",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "xuanquan-hanjian"
    ],
    "type": "期刊论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "https://ncpssd.cn/Literature/articleinfo?id=23945474&type=journalArticle&typename=%E4%B8%AD%E6%96%87%E6%9C%9F%E5%88%8A%E6%96%87%E7%AB%A0&nav=1&langType=1",
    "accessType": "paper-info",
    "accessNote": "实际GET并经Edge导航打开，正文核对题名及全部作者；未登录，未验证全文权限。",
    "accessChecked": "2026-11-03",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 X3；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。 2026-11-03入口补全：实际GET并经Edge导航打开，正文核对题名及全部作者；未登录，未验证全文权限。 原访问说明（历史记录）：题录已核，暂无经核验的公开全文入口。 详见 reports/classic-paper-source-links-and-card-copy-2026-11-03.md。"
  },
  {
    "id": "paper-l2",
    "reviewId": "L2",
    "title": "走马楼西汉简《长沙邸传舍劾文书》解析",
    "author": "李均明",
    "year": "2021",
    "journal": "中州学刊",
    "volume": "",
    "issue": "1",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zoumalou-western-han-slips"
    ],
    "type": "期刊论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 L2；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-l3",
    "reviewId": "L3",
    "title": "长沙走马楼西汉简狱政资料的整理与考证",
    "author": "李均明、宋少华",
    "year": "",
    "journal": "出土文献研究",
    "volume": "",
    "issue": "第18辑",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zoumalou-western-han-slips",
      "zhangjiashan-hanjian",
      "wuyi-eastern-han-slips"
    ],
    "type": "论文集文章",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 L3；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-w2",
    "reviewId": "W2",
    "title": "长沙五一广场东汉简牍整理研究论著目录（2010年至今）",
    "author": "徐畅、高智敏",
    "year": "",
    "journal": "简帛研究",
    "volume": "",
    "issue": "二〇一七（秋冬卷）",
    "pages": "343–351",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "wuyi-eastern-han-slips"
    ],
    "type": "论文集文章",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 W2；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-w3",
    "reviewId": "W3",
    "title": "长沙五一广场东汉简牍所见基层社会治理",
    "author": "符奎",
    "year": "2026",
    "journal": "中国社会科学报",
    "volume": "",
    "issue": "",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "wuyi-eastern-han-slips"
    ],
    "type": "报纸文章",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "https://www.cssn.cn/skgz/bwyc/202608/t20260820_6063887.shtml",
    "accessType": "full-html",
    "accessNote": "目标报纸文章HTML正文；非期刊PDF；",
    "accessChecked": "2026-11-03",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 W3；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-n02",
    "reviewId": "N02",
    "title": "《長沙五一廣場東漢簡牘》分類校注及相關問題研究",
    "author": "傅杉杉",
    "year": "2022",
    "journal": "华东师范大学",
    "volume": "",
    "issue": "",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "wuyi-eastern-han-slips"
    ],
    "type": "硕士学位论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N02；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-n03",
    "reviewId": "N03",
    "title": "《長沙五一廣場東漢簡牘（壹）-（肆）》語詞彙釋",
    "author": "徐碩",
    "year": "2023",
    "journal": "吉林大学",
    "volume": "",
    "issue": "",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "wuyi-eastern-han-slips"
    ],
    "type": "硕士学位论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N03；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-n04",
    "reviewId": "N04",
    "title": "《長沙五一廣場東漢簡牘（壹）》校注",
    "author": "牛天志",
    "year": "2024",
    "journal": "辽宁师范大学",
    "volume": "",
    "issue": "",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "wuyi-eastern-han-slips"
    ],
    "type": "硕士学位论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N04；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-n05",
    "reviewId": "N05",
    "title": "五一廣場東漢簡牘所見縣級司法研究",
    "author": "刘运杰",
    "year": "2022",
    "journal": "河北师范大学",
    "volume": "",
    "issue": "",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "wuyi-eastern-han-slips"
    ],
    "type": "硕士学位论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N05；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-n07",
    "reviewId": "N07",
    "title": "東漢簡牘司法文書詞彙研究",
    "author": "李歡",
    "year": "2022",
    "journal": "陕西师范大学",
    "volume": "",
    "issue": "",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "wuyi-eastern-han-slips"
    ],
    "type": "硕士学位论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N07；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-n08",
    "reviewId": "N08",
    "title": "長沙地區所見東漢簡牘詞彙專題研究",
    "author": "繆愷然",
    "year": "2020",
    "journal": "华东师范大学",
    "volume": "",
    "issue": "",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "wuyi-eastern-han-slips"
    ],
    "type": "硕士学位论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N08；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-n10",
    "reviewId": "N10",
    "title": "2003年長沙走馬樓西漢簡牘重大考古發現",
    "author": "長沙簡牘博物館、長沙市文物考古研究所聯合發掘組",
    "year": "",
    "journal": "出土文獻研究",
    "volume": "",
    "issue": "第七輯",
    "pages": "57–64",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zoumalou-western-han-slips"
    ],
    "type": "论文集文章",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N10；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-n18",
    "reviewId": "N18",
    "title": "走马楼西汉简“驾、纵、野劾不审案”所见汉代司法问题",
    "author": "袁延胜、贾蕾",
    "year": "2026",
    "journal": "南都学坛",
    "volume": "46",
    "issue": "1",
    "pages": "8–15",
    "doi": "10.16700/j.cnki.cn41-1157/c.2026.01.012",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zoumalou-western-han-slips"
    ],
    "type": "期刊论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "https://ldxt.cbpt.cnki.net/portal/journal/portal/client/paper/48027c5f53c79bdcb7eae29d917d4a0c",
    "accessType": "paper-info",
    "accessNote": "目标题录/摘要；未核实无登录阅读全文，不能因页面有下载按钮就改标全文。",
    "accessChecked": "2026-11-03",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N18；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-n19",
    "reviewId": "N19",
    "title": "走马楼西汉简所见长沙国民族及其社会生活",
    "author": "王博凯",
    "year": "2025",
    "journal": "中国社会科学院大学学报",
    "volume": "",
    "issue": "6",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zoumalou-western-han-slips"
    ],
    "type": "期刊论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N19；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-n20",
    "reviewId": "N20",
    "title": "走马楼西汉简新见“长沙临湘少内禁钱计”校缪案编联整理与研究",
    "author": "雷长巍、李建平",
    "year": "",
    "journal": "",
    "volume": "",
    "issue": "",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zoumalou-western-han-slips"
    ],
    "type": "学术论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N20；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-n23",
    "reviewId": "N23",
    "title": "长沙走马楼西汉简牍所见“都乡七年垦田租簿”及其相关问题分析",
    "author": "朱德贵",
    "year": "2015",
    "journal": "中国社会经济史研究",
    "volume": "",
    "issue": "2",
    "pages": "1–11",
    "doi": "10.13469/j.cnki.zgshjjsyj.2015.02.001",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zoumalou-western-han-slips"
    ],
    "type": "期刊论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N23；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-n24",
    "reviewId": "N24",
    "title": "长沙走马楼西汉简牍狱案研究",
    "author": "刘梦君",
    "year": "2025",
    "journal": "华东政法大学",
    "volume": "",
    "issue": "",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zoumalou-western-han-slips"
    ],
    "type": "硕士学位论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N24；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-n30",
    "reviewId": "N30",
    "title": "“都乡七年垦田租簿”的年代问题商榷——兼论走马楼西汉简牍的年代",
    "author": "宋少华、杨芬",
    "year": "",
    "journal": "",
    "volume": "",
    "issue": "",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zoumalou-western-han-slips"
    ],
    "type": "学术论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N30；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-n31",
    "reviewId": "N31",
    "title": "《簡牘名蹟選2》所刊“走馬樓前漢簡”釋文校訂",
    "author": "胡平生",
    "year": "",
    "journal": "簡帛",
    "volume": "",
    "issue": "第7辑",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zoumalou-western-han-slips"
    ],
    "type": "论文集文章",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N31；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-n32",
    "reviewId": "N32",
    "title": "《长沙走马楼西汉简牍选粹》释文补正",
    "author": "雷长巍、李建平",
    "year": "2024",
    "journal": "现代语文",
    "volume": "",
    "issue": "3",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zoumalou-western-han-slips"
    ],
    "type": "期刊论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N32；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-n33",
    "reviewId": "N33",
    "title": "从走马楼西汉简歧异干支谈汉初历法混用问题",
    "author": "李洪财",
    "year": "2022",
    "journal": "社会科学战线",
    "volume": "",
    "issue": "4",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zoumalou-western-han-slips"
    ],
    "type": "期刊论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "https://ncpssd.cn/Literature/articleinfo?id=SHKXZX2022004012&type=journalArticle&typename=%E4%B8%AD%E6%96%87%E6%9C%9F%E5%88%8A%E6%96%87%E7%AB%A0&nav=1&langType=1",
    "accessType": "paper-info",
    "accessNote": "实际GET并经Edge导航打开，正文核对题名及全部作者；未登录，未验证全文权限。",
    "accessChecked": "2026-11-03",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N33；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。 2026-11-03入口补全：实际GET并经Edge导航打开，正文核对题名及全部作者；未登录，未验证全文权限。 原访问说明（历史记录）：题录已核，暂无经核验的公开全文入口。 详见 reports/classic-paper-source-links-and-card-copy-2026-11-03.md。"
  },
  {
    "id": "paper-n34",
    "reviewId": "N34",
    "title": "再论秦汉时期的“狱”——以长沙走马楼西汉简为中心",
    "author": "陈松长",
    "year": "2022",
    "journal": "华东政法大学学报",
    "volume": "",
    "issue": "1",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zoumalou-western-han-slips",
      "zhangjiashan-hanjian"
    ],
    "type": "期刊论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N34；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-n35",
    "reviewId": "N35",
    "title": "對走馬樓西漢簡“非縱火時擅縱火”的考察",
    "author": "王勇",
    "year": "",
    "journal": "出土文献研究",
    "volume": "",
    "issue": "第18辑",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zoumalou-western-han-slips"
    ],
    "type": "论文集文章",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N35；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-n36",
    "reviewId": "N36",
    "title": "從走馬樓漢簡看西漢歸附蠻夷的編户化管理",
    "author": "王勇",
    "year": "",
    "journal": "简帛研究",
    "volume": "",
    "issue": "二〇二一（秋冬卷）",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zoumalou-western-han-slips"
    ],
    "type": "论文集文章",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N36；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-n37",
    "reviewId": "N37",
    "title": "西汉国家权力对蛮人族群的渗透——基于走马楼西汉简所见无阳蛮人的探讨",
    "author": "王勇、杨芬、宋少华",
    "year": "2022",
    "journal": "社会科学战线",
    "volume": "",
    "issue": "8",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zoumalou-western-han-slips"
    ],
    "type": "期刊论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "https://ncpssd.cn/Literature/articleinfo?id=SHKXZX2022008015&type=journalArticle&typename=%E4%B8%AD%E6%96%87%E6%9C%9F%E5%88%8A%E6%96%87%E7%AB%A0&nav=1&langType=1",
    "accessType": "paper-info",
    "accessNote": "实际GET并经Edge导航打开，正文核对题名及全部作者；未登录，未验证全文权限。",
    "accessChecked": "2026-11-03",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N37；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。 2026-11-03入口补全：实际GET并经Edge导航打开，正文核对题名及全部作者；未登录，未验证全文权限。 原访问说明（历史记录）：题录已核，暂无经核验的公开全文入口。 详见 reports/classic-paper-source-links-and-card-copy-2026-11-03.md。"
  },
  {
    "id": "paper-n38",
    "reviewId": "N38",
    "title": "西汉时期乐人公职服务问题考论——以走马楼西汉简《都乡七年垦田租簿》为中心",
    "author": "李立",
    "year": "2021",
    "journal": "中原文化研究",
    "volume": "",
    "issue": "3",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zoumalou-western-han-slips"
    ],
    "type": "期刊论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N38；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-n39",
    "reviewId": "N39",
    "title": "西汉诸侯王墓园邑制度的几个问题——以长沙走马楼西汉简牍为中心",
    "author": "李银德",
    "year": "2023",
    "journal": "考古",
    "volume": "",
    "issue": "4",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zoumalou-western-han-slips"
    ],
    "type": "期刊论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N39；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-n40",
    "reviewId": "N40",
    "title": "讀長沙走馬樓西漢簡札記——紀年與證律",
    "author": "杨芬",
    "year": "",
    "journal": "简帛研究",
    "volume": "",
    "issue": "二〇一八（秋冬卷）",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zoumalou-western-han-slips"
    ],
    "type": "论文集文章",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N40；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-n42",
    "reviewId": "N42",
    "title": "走馬樓西漢簡“都鄉七年墾田租簿”再整理",
    "author": "雷长巍、李建平",
    "year": "",
    "journal": "",
    "volume": "",
    "issue": "",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zoumalou-western-han-slips"
    ],
    "type": "学术论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N42；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-n43",
    "reviewId": "N43",
    "title": "走馬樓西漢簡中的“别治醴陵”與“别治長賴”",
    "author": "王勇",
    "year": "",
    "journal": "简帛",
    "volume": "",
    "issue": "第23辑",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zoumalou-western-han-slips"
    ],
    "type": "论文集文章",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N43；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-n44",
    "reviewId": "N44",
    "title": "走馬樓西漢簡刑制史料初探",
    "author": "欧扬",
    "year": "",
    "journal": "简帛研究",
    "volume": "",
    "issue": "二〇一八（秋冬卷）",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zoumalou-western-han-slips",
      "zhangjiashan-hanjian"
    ],
    "type": "论文集文章",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N44；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-n45",
    "reviewId": "N45",
    "title": "走馬樓西漢簡所見“譯人”及相關問題試論",
    "author": "王博凯",
    "year": "",
    "journal": "简帛研究",
    "volume": "",
    "issue": "二〇一九（春夏卷）",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zoumalou-western-han-slips"
    ],
    "type": "论文集文章",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N45；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-n46",
    "reviewId": "N46",
    "title": "走馬樓西漢簡所見里名及相關問題考論",
    "author": "陈湘圆",
    "year": "",
    "journal": "简帛研究",
    "volume": "",
    "issue": "二〇二二（春夏卷）",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zoumalou-western-han-slips"
    ],
    "type": "论文集文章",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N46；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-n47",
    "reviewId": "N47",
    "title": "走馬樓西漢簡的斷代——兼談草書的形成時間",
    "author": "李洪财",
    "year": "",
    "journal": "简帛研究",
    "volume": "",
    "issue": "二〇一八（秋冬卷）",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zoumalou-western-han-slips"
    ],
    "type": "论文集文章",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N47；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-n50",
    "reviewId": "N50",
    "title": "走马楼西汉简所见赦令初探",
    "author": "邬文玲",
    "year": "2022",
    "journal": "社会科学战线",
    "volume": "",
    "issue": "4",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zoumalou-western-han-slips"
    ],
    "type": "期刊论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "https://ncpssd.cn/Literature/articleinfo?id=SHKXZX2022004011&type=journalArticle&typename=%E4%B8%AD%E6%96%87%E6%9C%9F%E5%88%8A%E6%96%87%E7%AB%A0&nav=1&langType=1",
    "accessType": "paper-info",
    "accessNote": "实际GET并经Edge导航打开，正文核对题名及全部作者；未登录，未验证全文权限。",
    "accessChecked": "2026-11-03",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N50；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。 2026-11-03入口补全：实际GET并经Edge导航打开，正文核对题名及全部作者；未登录，未验证全文权限。 原访问说明（历史记录）：题录已核，暂无经核验的公开全文入口。 详见 reports/classic-paper-source-links-and-card-copy-2026-11-03.md。"
  },
  {
    "id": "paper-n51",
    "reviewId": "N51",
    "title": "走马楼西汉简所见长沙国职官建置论考",
    "author": "陈松长、陈湘圆",
    "year": "2022",
    "journal": "社会科学战线",
    "volume": "",
    "issue": "4",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zoumalou-western-han-slips"
    ],
    "type": "期刊论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "https://ncpssd.cn/Literature/articleinfo?id=SHKXZX2022004010&type=journalArticle&typename=%E4%B8%AD%E6%96%87%E6%9C%9F%E5%88%8A%E6%96%87%E7%AB%A0&nav=1&langType=1",
    "accessType": "paper-info",
    "accessNote": "实际GET并经Edge导航打开，正文核对题名及全部作者；未登录，未验证全文权限。",
    "accessChecked": "2026-11-03",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N51；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。 2026-11-03入口补全：实际GET并经Edge导航打开，正文核对题名及全部作者；未登录，未验证全文权限。 原访问说明（历史记录）：题录已核，暂无经核验的公开全文入口。 详见 reports/classic-paper-source-links-and-card-copy-2026-11-03.md。"
  },
  {
    "id": "paper-n53",
    "reviewId": "N53",
    "title": "長沙走馬樓西漢簡《卯劾僮詐爲書案》所見“將田”“部”“將大農田”諸問題小議",
    "author": "杨芬、宋少华",
    "year": "",
    "journal": "简帛",
    "volume": "",
    "issue": "第25辑",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zoumalou-western-han-slips"
    ],
    "type": "论文集文章",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N53；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-n54",
    "reviewId": "N54",
    "title": "長沙走馬樓西漢簡《宫司空令史兒等爲武擅解脱易桎弗舉劾案》初步考察",
    "author": "杨芬、宋少华",
    "year": "",
    "journal": "简帛研究",
    "volume": "",
    "issue": "二〇二〇（秋冬卷）",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zoumalou-western-han-slips"
    ],
    "type": "论文集文章",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N54；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-n55",
    "reviewId": "N55",
    "title": "長沙走馬樓西漢簡《都鄉七年墾田租簿》初步考察",
    "author": "马代忠",
    "year": "",
    "journal": "出土文献研究",
    "volume": "",
    "issue": "第12辑",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zoumalou-western-han-slips"
    ],
    "type": "论文集文章",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N55；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-n56",
    "reviewId": "N56",
    "title": "長沙走馬樓西漢簡中的“將田”小考",
    "author": "陈松长、刘国庆",
    "year": "",
    "journal": "出土文献",
    "volume": "",
    "issue": "第14辑（2019年第1期）",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zoumalou-western-han-slips"
    ],
    "type": "论文集文章",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N56；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-n57",
    "reviewId": "N57",
    "title": "長沙走馬樓西漢簡中的人名雜識",
    "author": "陈松长",
    "year": "",
    "journal": "出土文献研究",
    "volume": "",
    "issue": "第20辑",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zoumalou-western-han-slips"
    ],
    "type": "论文集文章",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N57；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-n58",
    "reviewId": "N58",
    "title": "長沙走馬樓西漢簡中的文字異寫現象例説",
    "author": "陈松长",
    "year": "",
    "journal": "简帛研究",
    "volume": "",
    "issue": "二〇一八（秋冬卷）",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zoumalou-western-han-slips"
    ],
    "type": "论文集文章",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N58；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-n59",
    "reviewId": "N59",
    "title": "長沙走馬樓西漢簡牘所見年代、疆域瑣議——以走馬樓西漢簡牘爲中心",
    "author": "宋少华",
    "year": "",
    "journal": "出土文献研究",
    "volume": "",
    "issue": "第20辑",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zoumalou-western-han-slips"
    ],
    "type": "论文集文章",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N59；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-n61",
    "reviewId": "N61",
    "title": "长沙走马楼西汉简《都乡七年垦田租簿》考论",
    "author": "吕志峰",
    "year": "",
    "journal": "中国文字研究",
    "volume": "",
    "issue": "第34辑",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zoumalou-western-han-slips"
    ],
    "type": "论文集文章",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N61；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-n62",
    "reviewId": "N62",
    "title": "长沙走马楼西汉简中的“定邑”小考",
    "author": "陈松长",
    "year": "2022",
    "journal": "出土文献",
    "volume": "",
    "issue": "1",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zoumalou-western-han-slips"
    ],
    "type": "期刊论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "https://ncpssd.cn/Literature/articleinfo?id=CTWX2022001011&type=journalArticle&typename=%E4%B8%AD%E6%96%87%E6%9C%9F%E5%88%8A%E6%96%87%E7%AB%A0&nav=1&langType=1",
    "accessType": "paper-info",
    "accessNote": "单篇HTML实际GET；页面使用的公开题录接口返回目标题名、作者及刊年期。Edge重试未完成动态题录呈现，需人工复查外站体验；不推断全文权限。",
    "accessChecked": "2026-11-03",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N62；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。 2026-11-03入口补全：单篇HTML实际GET；页面使用的公开题录接口返回目标题名、作者及刊年期。Edge重试未完成动态题录呈现，需人工复查外站体验；不推断全文权限。 原访问说明（历史记录）：题录已核，暂无经核验的公开全文入口。 详见 reports/classic-paper-source-links-and-card-copy-2026-11-03.md。"
  },
  {
    "id": "paper-n63",
    "reviewId": "N63",
    "title": "长沙走马楼西汉简所见“采铜”琐议",
    "author": "王博凯",
    "year": "2020",
    "journal": "出土文献",
    "volume": "",
    "issue": "3",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zoumalou-western-han-slips"
    ],
    "type": "期刊论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "https://ncpssd.cn/Literature/articleinfo?id=CTWX2020003011&type=journalArticle&typename=%E4%B8%AD%E6%96%87%E6%9C%9F%E5%88%8A%E6%96%87%E7%AB%A0&nav=1&langType=1",
    "accessType": "paper-info",
    "accessNote": "单篇HTML实际GET；页面使用的公开题录接口返回目标题名、作者及刊年期。Edge重试未完成动态题录呈现，需人工复查外站体验；不推断全文权限。",
    "accessChecked": "2026-11-03",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N63；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。 2026-11-03入口补全：单篇HTML实际GET；页面使用的公开题录接口返回目标题名、作者及刊年期。Edge重试未完成动态题录呈现，需人工复查外站体验；不推断全文权限。 原访问说明（历史记录）：题录已核，暂无经核验的公开全文入口。 详见 reports/classic-paper-source-links-and-card-copy-2026-11-03.md。"
  },
  {
    "id": "paper-n64",
    "reviewId": "N64",
    "title": "走马楼西汉简所见地名辑证",
    "author": "陈守琪",
    "year": "2023",
    "journal": "湖南大学",
    "volume": "",
    "issue": "",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zoumalou-western-han-slips"
    ],
    "type": "硕士学位论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N64；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-n41",
    "reviewId": "N41",
    "title": "谈走马楼西汉简中的两条简文",
    "author": "刘乐贤",
    "year": "2013",
    "journal": "首都师范大学学报（社会科学版）",
    "volume": "",
    "issue": "6",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zoumalou-western-han-slips"
    ],
    "type": "期刊论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N41；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-n12",
    "reviewId": "N12",
    "title": "漢代簡牘公文書的形制、性質與行政程序──論「兩行」的制度地位",
    "author": "石昇烜",
    "year": "2023",
    "journal": "臺大歷史學報",
    "volume": "",
    "issue": "72",
    "pages": "1–129",
    "doi": "10.6253/ntuhistory.202312_(72).0001",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "xuanquan-hanjian",
      "wuyi-eastern-han-slips",
      "zoumalou-western-han-slips"
    ],
    "type": "期刊论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "https://toaj.stpi.niar.org.tw/index/journal/volume/article/4b1141f98d5b0700018d5e9eee19019e",
    "accessType": "paper-info",
    "accessNote": "实际GET并经Edge导航打开，正文核对题名及全部作者；未登录，未验证全文权限。 下载按钮点击未出现可用下载；源码含验证码下载流程，未取得PDF。",
    "accessChecked": "2026-11-03",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N12；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。 2026-11-03入口补全：实际GET并经Edge导航打开，正文核对题名及全部作者；未登录，未验证全文权限。 下载按钮点击未出现可用下载；源码含验证码下载流程，未取得PDF。 原访问说明（历史记录）：题录已核，暂无经核验的公开全文入口。 详见 reports/classic-paper-source-links-and-card-copy-2026-11-03.md。"
  },
  {
    "id": "paper-n14",
    "reviewId": "N14",
    "title": "历代简牍形制特点概述",
    "author": "邓咏秋",
    "year": "2000",
    "journal": "河南图书馆学刊",
    "volume": "20",
    "issue": "2",
    "pages": "89–92",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [],
    "type": "期刊论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N14；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-n15",
    "reviewId": "N15",
    "title": "秦简牍形制若干问题研究",
    "author": "梅书英",
    "year": "2022",
    "journal": "湖南大学",
    "volume": "",
    "issue": "",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [],
    "type": "硕士学位论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N15；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-n16",
    "reviewId": "N16",
    "title": "简帛文献所见秦汉官府建筑研究",
    "author": "谢伟斌",
    "year": "2023",
    "journal": "湖南大学",
    "volume": "",
    "issue": "",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [
      "zoumalou-western-han-slips",
      "xuanquan-hanjian",
      "zhangjiashan-hanjian"
    ],
    "type": "博士学位论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 N16；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-e01",
    "reviewId": "E01",
    "title": "释“爰书”——读秦、汉简牍札记",
    "author": "高敏",
    "year": "1987",
    "journal": "益阳师专学报（哲学社会科学版）",
    "volume": "",
    "issue": "2",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [],
    "type": "期刊论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 E01；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  },
  {
    "id": "paper-e02",
    "reviewId": "E02",
    "title": "竹简秦汉律中的“赎罪”与“赎刑”",
    "author": "朱红林",
    "year": "2007",
    "journal": "史学月刊",
    "volume": "",
    "issue": "5",
    "pages": "",
    "doi": "",
    "categories": [
      "slips"
    ],
    "hubIds": [],
    "type": "期刊论文",
    "note": "",
    "abstract": "",
    "featured": false,
    "url": "",
    "accessType": "none",
    "accessNote": "题录已核，暂无经核验的公开全文入口。",
    "accessChecked": "",
    "recommendationStatus": "background",
    "sourceNote": "用户批准第二批 E02；仅采用 reports/classic-paper-broad-intake-review-2026-11-03.md 第3节已核字段。真实性证据与待补字段见该编号，不将证据网页或本地PDF作为阅读入口。"
  }
];
