// 所有资源都集中在这一份数组中。核心资源以 core: true 标记，避免重复创建同一个网站。
// id 是人工确定的持久引用键：改名、改描述或小幅更新 URL 均不重建 id。
// 禁止使用数组索引或从名称动态生成；冲突须人工确定稳定语义 id。
const sites = [
  { id:"chutu-wenxian-journal", name:"《出土文献》", institution:"清华大学出土文献研究与保护中心、中西书局", category:"📚 学术期刊", displayCategory:"学术期刊", description:"2020年创刊的出土文献专业学术期刊，前身为2010年创办的同名辑刊。刊载甲骨、金文、战国秦汉简帛等出土文献及相关交叉研究。", keywords:["出土文献","期刊","古文字","甲骨","金文","简帛"], url:"https://www.ctwx.tsinghua.edu.cn/info/1068/1832.htm", buttonLabel:"查看刊物信息", sourceNote:"清华大学中心期刊稿约及创刊号公告已实际获取；2020年期刊与2010—2019年辑刊沿革合并维护，非另建两条记录。" },
  { id:"chutu-wenxian-yanjiu", name:"《出土文献研究》", institution:"中国文化遗产研究院 编", category:"📚 学术期刊", displayCategory:"学术集刊", description:"以出土文献为主要研究对象的连续出版集刊，刊载古文字、简牍帛书等材料的整理与研究。", keywords:["出土文献研究","集刊","简牍","帛书","古文字"], url:"https://m.ncpssd.cn/journal/details?gch=73019X&langType=1&nav=1", buttonLabel:"查看刊物信息", sourceNote:"NSSD整体刊物页实际获取并核对名称、简介与历年目录；北大考古文博学院上架书目第39期列第十四辑、中国文化遗产研究院编、中西书局2015。NSSD误将单辑ISBN列作ISSN，未移录。" },
  { id:"chutu-wenxian-falvshi", name:"《出土文献与法律史研究》", institution:"华东政法大学法律古籍整理研究所", category:"📚 学术期刊", displayCategory:"学术集刊", description:"围绕甲骨、金文、简牍等出土法律文献与法律史研究的连续出版集刊。", keywords:["出土文献与法律史研究","集刊","法律史","秦汉简牍"], url:"https://m.ncpssd.cn/journal/details?gch=11178X&langType=1&nav=1", buttonLabel:"查看刊物信息", sourceNote:"NSSD整体刊物页已由网页工具实际获取并核对名称、机构、简介及目录；本地直连一次连接重置。华东政法大学成立三十周年公告亦确认连续出版。各辑出版社不同，不将单辑出版社或ISBN用作系列统一字段。" },
  { id:"nwnu-jiandu", name:"简牍学术资源数据共享平台", institution:"西北师范大学", category:"🏺 汉代简牍", core:true, priority:true, description:"面向简牍研究的数字资源平台，提供实物、释文、字形、著录、文献与专家等资源，涵盖居延汉简、居延新简、悬泉汉简、敦煌汉简、玉门关汉简、地湾汉简、武威汉简、额济纳汉简等。", fitFor:"实物、释文、字形、著录与文献检索；平台另发布DeepJiandu字符检测与识别数据集。", keywords:["汉代简牍","居延汉简","悬泉汉简","敦煌汉简","释文","字形","著录","实物","图版","检索","学者","DeepJiandu","字符检测","字符识别"], researchTags:["居延汉简","居延新简","悬泉汉简","敦煌汉简","玉门关汉简","武威汉简","张家山汉简","五一广场东汉简","走马楼西汉简","汉代简牍文字","释文","字形","著录","图版","实物","检索","学者","数字人文"], url:"https://jiandu.nwnu.edu.cn/", buttonLabel:"进入资源平台 ↗", readerNote:"DeepJiandu是研究数据集；下载流程及数据使用许可须按数据发布页核实。", sourceNote:"B01：https://jiandu.nwnu.edu.cn/article/229.html 和 https://www.scidb.cn/en/detail?dataSetId=7f627b99d06e4430a5e5d21b20614b46 支持数据集关系。原动态nwnu-deepjiandu保留，本轮不新建数据集资源或重复动态；入库前发布页返回412，沿用同日审核证据，未验证下载。", accessChecked:"2026-11-04", accessNote:"DeepJiandu是研究数据集；下载流程及数据使用许可须按数据发布页核实。" },
  { id:"bsm", name:"简帛网", institution:"武汉大学简帛研究中心", category:"🏺 汉代简牍", core:true, priority:true, description:"武汉大学简帛研究中心主办的简帛学术网站，适合跟踪简帛研读、研究札记、学术动态以及汉简等出土文献研究成果。", fitFor:"简帛研究动态、研究文章、汉简资料、学术交流和最新研究成果。", keywords:["简帛","汉简","简牍","研读","研究札记","学术动态","论文","检索"], researchTags:["居延汉简","敦煌汉简","肩水金关","张家山汉简","五一广场东汉简","走马楼西汉简","银雀山汉简","汉代简牍文字","论文","检索","数字人文"], url:"https://www.bsm.org.cn/", buttonLabel:"进入简帛网 ↗" },
  { id:"ihp-woodslip", name:"简牍字典", subtitle:"史语所藏居延汉简资料库", institution:"中央研究院历史语言研究所", category:"🏺 汉代简牍", core:true, description:"以居延汉简为核心的数字资料库，可检索简号、释文、时代、遗址等信息，并提供简牍图像与字形相关资料。", fitFor:"简号、释文与遗址检索、单字图像比对、标注内容检索；官网另提供SPARQL语意检索入口。", keywords:["居延汉简","简牍字典","字形","释文","简号","遗址","图像","图版","检索","出土地"], researchTags:["居延汉简","居延新简","肩水金关","汉代简牍文字","释文","字形","图版","检索","出土地"], url:"https://wcd-ihp.ascdc.sinica.edu.tw/woodslip/", buttonLabel:"查询简牍字典 ↗", readerNote:"公开检索与登录功能分开；图像下载及标注写入权限以平台说明为准。", sourceNote:"B04：本轮 https://wcd-ihp.ascdc.sinica.edu.tw/woodslip/ 核首页三类检索、登录和SPARQL入口；史语所与数位文化中心联合呈现，未实测登录后权益。", accessChecked:"2026-11-04", accessNote:"公开检索与登录功能分开；图像下载及标注写入权限以平台说明为准。" },
  { id:"guanlian-hanqing", name:"贯联汗青", subtitle:"简牍缀合信息库", institution:"复旦大学出土文献与古文字研究中心", category:"🏺 汉代简牍", core:true, description:"专门整合简牍缀合信息的数据库，目前公布西北汉简缀合信息，适合进行简牍缀合资料查询与研究。", fitFor:"西北汉简已有缀合记录、释文、缀合者、来源及简号对照；当前部分含个别帛书。", keywords:["简牍缀合","西北汉简","释文","缀合者","简号","检索","著录"], researchTags:["居延汉简","居延新简","悬泉汉简","敦煌汉简","玉门关汉简","肩水金关","释文","缀合","著录","检索"], url:"https://www.fdgwz.org.cn/guanlianhanqing/Home", buttonLabel:"查询缀合信息 ↗", readerNote:"免费供学术界与公众查询已有缀合成果；各项论证仍须回查原出处。", sourceNote:"B05：https://www.fdgwz.org.cn/guanlianhanqing/Home 同日审核可读说明，核已公布西北汉简及个别帛书、免费开放。本轮直取异常；不宣称AI自动缀合或计划分部已开放。", accessChecked:"2026-11-04", accessNote:"免费供学术界与公众查询已有缀合成果；各项论证仍须回查原出处。" },
  { id:"xiaoxue", name:"小學堂文字學資料庫", institution:"台湾大学中国文学系、中央研究院历史语言研究所、资讯科学研究所及数位文化中心", category:"🧱 古文字数据库", resourceCategories:["甲骨文","金文"], description:"汉字字形与文字学研究资料库；首页提供甲骨文、金文字形及古今字音等资料入口，用于字形资料检索与比较。", keywords:["汉字","字形","文字学","资料库","甲骨文","金文"], url:"https://xiaoxue.iis.sinica.edu.tw/", readerNote:"检索入口公开；图像与资料再使用须遵循平台版权说明。", sourceNote:"B02：本轮 https://xiaoxue.iis.sinica.edu.tw/ 核开发维运四方、甲骨金文等入口；不新增子库记录，不宣称上传图像AI识字。", accessChecked:"2026-11-04", accessNote:"检索入口公开；图像与资料再使用须遵循平台版权说明。" },
  { id:"yinxu-oracle-database", name:"殷墟甲骨文数据库", institution:"浙江师范大学、浙江中医药大学浙江中医药文化研究院；陈年福主编；古联公司平台", category:"🧱 古文字数据库", resourceCategories:["甲骨文"], description:"提供殷墟甲骨卜辞浏览、释文与原文检索、甲骨字典及相关资料。", keywords:["甲骨文","殷墟","卜辞","商代"], url:"https://obid.ancientbooks.cn/", readerNote:"平台有登录、注册与购买入口；具体订阅及机构访问权益以平台说明为准。", sourceNote:"B06：本轮 https://obid.ancientbooks.cn/ 可读，核学术单位、陈年福主编及古联版权与购买入口；未核价格、机构IP或具体产品权益。", accessChecked:"2026-11-04", accessNote:"平台有登录、注册与购买入口；具体订阅及机构访问权益以平台说明为准。" },
  { id:"ihp-oracle-rubbings", name:"甲骨文拓片資料庫", institution:"中央研究院历史语言研究所傅斯年图书馆", category:"🧱 古文字数据库", resourceCategories:["甲骨文"], genreOnly:true, description:"收录甲骨文拓片，并可通过典藏号与甲骨实物资料及影像对照查询。", keywords:["甲骨文","拓片","实物","影像","检索"], url:"https://dap.ihp.sinica.edu.tw/database/3/", buttonLabel:"进入数据库 ↗" },
  { id:"tsinghua-ctwx", name:"清华大学出土文献研究与保护中心", institution:"清华大学", category:"🏛️ 学术机构", description:"清华大学出土文献研究、整理、保护及学术交流的重要平台。", keywords:["清华简","出土文献","战国","简帛"], url:"https://www.ctwx.tsinghua.edu.cn/", displayCategory:"学术机构" },
  { id:"wuhan-bamboo-silk-center", name:"武汉大学简帛研究中心", institution:"武汉大学", category:"🏛️ 学术机构", description:"武汉大学开展简帛、古文字与出土文献研究的重要学术机构。", keywords:["武汉大学","简帛","楚简","古文字"], url:"https://www.bsm.org.cn/?gaikuo/=", buttonLabel:"查看机构介绍", displayCategory:"学术机构", sourceNote:"2026-11-04去重：原入口与简帛网bsm同为https://www.bsm.org.cn/。由首页“简帛研究中心→中心概况”核得独立介绍页https://www.bsm.org.cn/?gaikuo/=，正文为武汉大学简帛研究中心概况，保留原稳定ID。项目与成果页仍为建设中，未采用。" },
  { id:"cnki", name:"中国知网", institution:"中国知网", category:"📚 学术期刊", description:"检索中文期刊、学位论文、会议论文等学术文献的综合平台。", keywords:["期刊","论文","学位论文","中文文献"], url:"https://cnki.net/", resourceKind:"database", displayCategory:"学术文献数据库" },
  { id:"china-archaeology", name:"中国考古网", institution:"中国社会科学院考古研究所", category:"🏛️ 学术机构", description:"中国社会科学院考古研究所主办的考古资讯与学术资源平台。", keywords:["考古","田野","遗址","出土材料"], url:"https://kaogu.cssn.cn/", resourceKind:"website", displayCategory:"考古学术网站" },
  { id:"cssn", name:"中国社会科学网", institution:"中国社会科学网", category:"📚 学术期刊", description:"社会科学研究动态、学术成果与资讯发布平台。", keywords:["社科","历史","学术资讯","论文"], url:"https://www.cssn.cn/", resourceKind:"website", displayCategory:"学术资讯网站" },
  { id:"google-scholar", name:"Google Scholar", institution:"Google", category:"🛠️ 学术工具", description:"覆盖多语种学术文献的通用检索工具，适合追踪引文与海外研究。", keywords:["英文论文","引文","检索","海外"], url:"https://scholar.google.com/", displayCategory:"学术检索工具" },
  { id:"jstor", name:"JSTOR", institution:"ITHAKA", category:"📚 学术期刊", description:"人文社会科学期刊与图书的数字学术档案平台。", keywords:["期刊","人文","考古","海外文献"], url:"https://www.jstor.org/", resourceKind:"database", displayCategory:"学术文献数据库" },
  { id:"cinii", name:"CiNii Research", institution:"日本国立信息学研究所", category:"🛠️ 学术工具", description:"日本学术信息检索平台，可查找日本汉学与东亚研究成果。", keywords:["日本","汉学","东亚","论文"], url:"https://cir.nii.ac.jp/", displayCategory:"学术检索平台" },
  { id:"brill", name:"Brill", institution:"Brill", category:"🌏 海外汉学", description:"以人文与亚洲研究见长的国际学术出版平台。", keywords:["出版","汉学","亚洲研究","期刊"], url:"https://brill.com/" },
  { id:"zotero", name:"Zotero", institution:"Corporation for Digital Scholarship", category:"🛠️ 学术工具", description:"免费开源的文献管理工具，可整理条目、笔记、引文和参考文献。", keywords:["文献管理","引文","笔记","开源"], url:"https://www.zotero.org/" },
  { id:"ctext", name:"中国哲学书电子化计划", englishName:"Chinese Text Project", institution:"Chinese Text Project", category:"🛠️ 学术工具", displayCategory:"古典文献 / 学术工具", description:"开放的中国古典文献电子图书馆，适合查阅先秦两汉传世文献、原典文本与相关资料。", keywords:["CTEXT","Chinese Text Project","先秦","两汉","古籍","传世文献","原典","哲学","历史","文本分析","Text Tools","API"], url:"https://ctext.org/pre-qin-and-han/zh", fitFor:"传世文献检索、重见与n元语法分析；可通过官方插件/API连接文本研究工具。", readerNote:"开放阅读与插件/API权益不同；部分功能需账号，高级API可能涉及机构订阅。", sourceNote:"B08：https://ctext.org/digital-humanities/zhs 、https://ctext.org/tools/api/zhs 及 https://ctext.org/tools/subscribe/zhs 的同日官方索引支持工具和高级API权益。本轮数字人文页403；不据开放阅读承诺无限批量下载。", accessChecked:"2026-11-04", accessNote:"开放阅读与插件/API权益不同；部分功能需账号，高级API可能涉及机构订阅。" },
  { id:"zdic", name:"汉典", institution:"汉典", category:"🛠️ 学术工具", displayCategory:"字典 / 学术工具", description:"综合汉字与词语检索平台，可查询字义、部首、字形以及《说文解字》《康熙字典》等资料。", keywords:["汉字","说文解字","康熙字典","字义","部首","字典"], url:"https://zdic.net/" },
  { id:"zi-tools", name:"字统网", englishName:"zi.tools", institution:"zi.tools", category:"🧱 古文字数据库", displayCategory:"古文字数据库 / 学术工具", description:"面向汉字源、形、音、义和 Unicode 的综合检索网站，支持字形、结构检字与古汉字相关查询。", keywords:["zi.tools","字源","字形","Unicode","古文字","结构检字","汉字"], url:"https://zi.tools/" },
  { id:"openalex", name:"OpenAlex", institution:"OurResearch", category:"🛠️ 学术工具", description:"开放的全球学术知识图谱，适合发现研究机构、作者与关联文献。", keywords:["开放数据","知识图谱","文献","引文"], url:"https://openalex.org/", displayCategory:"开放学术知识图谱工具" },
  { id:"semantic-scholar", name:"Semantic Scholar", institution:"Allen Institute for AI", category:"🛠️ 学术工具", description:"利用人工智能辅助发现论文、作者、引文脉络与研究主题。", keywords:["AI","论文检索","引文","英文文献"], url:"https://www.semanticscholar.org/", displayCategory:"论文检索工具" },
  { id:"bnu-shuowen", name:"《说文解字》研究与应用平台", institution:"北京师范大学汉字汉语实验室相关团队", category:"🧱 古文字数据库", displayCategory:"古文字数据库 / 学术工具", resourceCategories:["🛠️ 学术工具"], description:"面向《说文解字》研究与应用的综合平台，可查检小篆、字头、部首、构形与古音信息。", keywords:["说文解字","说文","小篆","字头","部首","构形","古音","综合资源"], url:"https://szsw.bnu.edu.cn/", buttonLabel:"进入平台 ↗" },
  { id:"bnu-hanzi", name:"汉字全息资源应用系统", institution:"北京师范大学汉字汉语实验室", category:"🧱 古文字数据库", displayCategory:"古文字数据库 / 学术工具", resourceCategories:["🛠️ 学术工具"], description:"提供汉字形、音、义及历代字形的综合查询，适合比较古今汉字资源。", keywords:["汉字","形音义","历代字形","古今汉字","字形比较","综合资源"], url:"https://qxk.bnu.edu.cn/", buttonLabel:"进入系统 ↗" },
  { id:"ytenx", name:"韵典网", institution:"", category:"🛠️ 学术工具", displayCategory:"音韵工具 / 学术工具", description:"提供《广韵》、上古音与中古音等韵书和音韵资料检索。", keywords:["广韵","上古音","中古音","韵书","音韵","检索"], url:"https://ytenx.org/", buttonLabel:"进入韵典网 ↗" },
  { id:"ccl-corpus", name:"北京大学 CCL 语料库", institution:"北京大学中国语言学研究中心", category:"🛠️ 学术工具", displayCategory:"古代汉语语料库 / 学术工具", description:"提供古代汉语与断代语料检索，涵盖四库全书、佛道典籍及大型丛书等资源。", keywords:["CCL","语料库","古代汉语","断代语料","四库全书","佛道典籍","大型丛书"], url:"https://cclcorpus.pku.edu.cn/", buttonLabel:"检索语料库 ↗", fitFor:"古代汉语分库及断代材料查询，可参照官方说明使用路径、组合与位置等检索条件。", readerNote:"语料查询、导出范围及配额以平台当前提示为准。", sourceNote:"B07：本轮 https://corpus.pku.edu.cn/CCLCorpus_User_Guide.html 可读，核路径等查询语法；https://ccl.pku.edu.cn/news/535/detail 的同日官方索引支持2026版古代汉语分库。未实测查询导出，不保证包含某一出土材料。", accessChecked:"2026-11-04", accessNote:"语料查询、导出范围及配额以平台当前提示为准。" },
  // 专项入口只在对应门类显示，首页和原有资源目录保持紧凑。
  { id:"xiaoxue-oracle", name:"小學堂甲骨文資料庫", institution:"中央研究院资讯科学研究所 · 小學堂", category:"🧱 古文字数据库", resourceCategories:["甲骨文"], genreOnly:true, description:"小學堂甲骨文字形资料的专门检索入口。", keywords:["甲骨文","字形","小學堂"], url:"https://xiaoxue.iis.sinica.edu.tw/jiaguwen" },
  { id:"xiaoxue-oracle-sources", name:"甲骨文合集材料來源表資料庫", institution:"中央研究院资讯科学研究所 · 小學堂", category:"🧱 古文字数据库", resourceCategories:["甲骨文"], genreOnly:true, description:"用于查阅《甲骨文合集》材料来源与著录对应信息。", keywords:["甲骨文","合集","材料来源","著录"], url:"https://xiaoxue.iis.sinica.edu.tw/obm/Home/Welcome" },
  { id:"chant-oracle", name:"汉达文库“新甲骨文”", institution:"香港中文大学", category:"🧱 古文字数据库", resourceCategories:["甲骨文"], genreOnly:true, accessNote:"可能需要机构访问权限", description:"汉达文库的新甲骨文数据库入口，提供甲骨资料与释文检索。", keywords:["甲骨文","汉达文库","释文","检索"], url:"http://www.chant.org/Database.aspx" },
  { id:"xiaoxue-bronze", name:"小學堂金文資料庫", institution:"中央研究院资讯科学研究所 · 小學堂", category:"🧱 古文字数据库", resourceCategories:["金文"], genreOnly:true, description:"小學堂金文字形资料的专门检索入口。", keywords:["金文","字形","小學堂"], url:"https://xiaoxue.iis.sinica.edu.tw/jinwen/Home/Home" },
  { id:"ihp-bronze", name:"殷周金文暨青銅器資料庫", institution:"中央研究院历史语言研究所金文工作室", category:"🧱 古文字数据库", resourceCategories:["金文"], genreOnly:true, accessNote:"入库前访问转登录页，提供注册指引；账号审批与登录后权益未实测。", description:"提供青铜器铭文、拓片、器影及相关背景资料查询。", keywords:["金文","青铜器","铭文","拓片","器影"], url:"https://bronze.asdc.sinica.edu.tw/", readerNote:"需申请账号并登录；内容限个人及非商业目的浏览使用。", sourceNote:"B03：本轮 https://bronze.asdc.sinica.edu.tw/ 转qry_bronze.php，核注册登录与个人非商业使用限制；保留原研究机构字段，不把系统页版权署名当作学术编纂机构。", accessChecked:"2026-11-04" },
  { id:"ihp-preqin-vocabulary", name:"先秦甲骨金文簡牘詞彙資料庫", institution:"中央研究院历史语言研究所金文工作室", category:"🧱 古文字数据库", resourceCategories:["金文","帛书"], resourceGroup:"数据库与检索", genreOnly:true, description:"提供甲骨、金文及简牍词汇与全文检索，其中收录《楚帛书》甲乙丙本，可作跨材料检索。", keywords:["金文","帛书","楚帛书","词汇","释文","全文检索"], url:"https://w9.ihp.sinica.edu.tw/bronze/pages/263", buttonLabel:"查看官方说明 ↗" },
  { id:"shangzhou-bronze-query", name:"商周金文数字查询平台", institution:"", category:"🧱 古文字数据库", resourceCategories:["金文"], genreOnly:true, description:"商周金文数字查询入口。", keywords:["商周","金文","查询"], url:"https://jwdcdbz.ancientbooks.cn/dictionary" },
  { id:"ihp-bronze-rubbings", name:"青銅器拓片資料庫", institution:"中央研究院历史语言研究所傅斯年图书馆", category:"🧱 古文字数据库", resourceCategories:["金文"], genreOnly:true, description:"收藏青铜器全形拓片与铭文拓片，可供器物、铭文与拓片影像研究使用。", keywords:["金文","青铜器","拓片","铭文","器影"], url:"https://dap.ihp.sinica.edu.tw/database/4/", buttonLabel:"进入数据库 ↗" },
  { id:"zju-epitaphs", name:"中国历代墓志数据库", institution:"浙江大学图书馆古籍碑帖研究与保护中心", category:"🪨 石刻资源", resourceCategories:["石刻"], genreOnly:true, readerNote:"请使用繁体字检索。", accessNote:"检索页可访问；图书馆标注不限 IP。影像权限以平台提示为准。", resourceTags:["墓志","拓片","释文","石刻数据库"], description:"整合馆藏拓片与已发表墓志资料，提供题名、责任者、年代、地点与录文等检索线索。", keywords:["墓志","碑刻","石刻","拓片","录文","全文","图像","检索"], url:"http://csid.zju.edu.cn/tomb/stone", buttonLabel:"检索墓志与碑拓 ↗", accessChecked:"2026-11-03", sourceNote:"原定8项候选第3项，沿用原ID。浙江大学图书馆 https://libdb.zju.edu.cn/s/lib/libtb/show/1516 核名称、制作机构及不限IP说明；本轮HTTP GET 200，Edge打开碑拓检索页，核子库与录文等字段；外站报iFrameHeight未定义，未验证检索结果或全量影像下载。HTTPS握手失败，保留官方HTTP入口。未移录历史藏量。" },
  { id:"ihp-han-stone-rubbings", name:"漢代石刻畫象拓本資料庫", institution:"中央研究院历史语言研究所傅斯年图书馆", category:"🪨 石刻资源", resourceCategories:["石刻"], genreOnly:true, resourceTags:["石刻画像","拓片"], description:"收录汉代石刻画像拓本，可用于汉代社会、信仰、建筑与生活文化史研究。", keywords:["汉代","石刻画像","拓本","拓片","图像"], url:"https://dap.ihp.sinica.edu.tw/database/5/", buttonLabel:"查看官方说明 ↗" },
  { id:"ihp-buddhist-stone-rubbings", name:"佛教石刻造像拓片資料庫", institution:"中央研究院历史语言研究所傅斯年图书馆", category:"🪨 石刻资源", resourceCategories:["石刻"], genreOnly:true, resourceTags:["佛教造像","拓片"], description:"收藏佛教石刻造像拓片，支持按题名、原刻地点、年代与释文关键词检索。", keywords:["佛教","石刻造像","拓片","释文","检索"], url:"https://dap.ihp.sinica.edu.tw/database/6/", buttonLabel:"查看官方说明 ↗" },
  { id:"ihp-liao-jin-yuan-rubbings", name:"遼金元拓片資料庫", institution:"中央研究院历史语言研究所傅斯年图书馆", category:"🪨 石刻资源", resourceCategories:["石刻"], genreOnly:true, resourceTags:["拓片"], description:"收录辽金元三朝碑拓，提供基本资料、释文与影像浏览。", keywords:["辽金元","碑拓","拓片","释文","影像"], url:"https://dap.ihp.sinica.edu.tw/database/7/", buttonLabel:"查看官方说明 ↗" },
  { id:"ihp-song-rubbings", name:"五代及宋拓片資料庫", institution:"中央研究院历史语言研究所傅斯年图书馆", category:"🪨 石刻资源", resourceCategories:["石刻"], genreOnly:true, resourceTags:["墓志","拓片"], description:"以五代及宋拓片为主，优先收录墓志主题，支持题名、墓主、年代、地点与释文检索。", keywords:["五代","宋代","墓志","拓片","释文","检索"], url:"https://dap.ihp.sinica.edu.tw/database/8/", buttonLabel:"查看官方说明 ↗" },
  { id:"bnu-inscriptions", name:"历代碑刻典藏与应用平台", institution:"北京师范大学汉字汉语实验室相关团队", category:"🪨 石刻资源", displayCategory:"石刻核心资源 / 古文字数据库", resourceCategories:["石刻"], genreOnly:true, resourceTags:["碑刻","拓片","释文","字形"], description:"提供历代碑刻、拓片与碑刻文字资料，可用于释文和字形检索。", keywords:["历代碑刻","碑刻","拓片","碑刻文字","释文","字形","检索"], url:"https://ldbk.bnu.edu.cn/", buttonLabel:"进入碑刻平台 ↗" },
  // 石刻专项审核结果仍只维护在 sites；说明页与数据库入口通过按钮文案区分。
  { id:"nlc-beitie-jinghua", name:"碑帖菁华", institution:"中国国家图书馆", category:"🪨 石刻资源", resourceCategories:["石刻"], genreOnly:true, resourceTags:["碑刻","墓志","拓片","石刻数据库"], description:"中华古籍资源库中的拓片资源，提供年代导航与碑刻题录，适合查找碑名、责任者、刻立地和现藏地。", keywords:["国家图书馆","国图","碑帖","碑刻","墓志","拓片","题录","年代","著录"], url:"http://read.nlc.cn/allSearch/searchList?searchType=34&showType=1&pageNo=1", buttonLabel:"查看碑帖资源 ↗", accessNote:"2026-11-03 核验：目录可读取，浏览器加载超时；影像权限待复核。", accessChecked:"2026-11-03", sourceNote:"原定候选第1项。官方入口GET 200，正文有碑帖菁华、年代导航及重修城隍廟碑等12条记录；Edge初次DOMContentLoaded超时。https://www.nlc.cn/pcab/zy/szzy/ 与 https://www.nlc.cn/web/yejiefuwu/newtsgj/newgjgx/hzxm/20111031_54107.shtml 证实资源，旧免费说明不作为当前权限保证；未移录藏量、元数据与影像数量。" },
  { id:"shl-beitie", name:"上海图书馆碑帖知识库", institution:"上海图书馆", aliases:["上海图书馆碑帖"], category:"🪨 石刻资源", resourceCategories:["石刻"], genreOnly:true, resourceTags:["碑刻","拓片","字形","综合资源"], description:"围绕馆藏珍本碑帖组织作品、单字和人物等知识，适合碑帖版本、书法字形与相关人物的对照研究。", keywords:["上海图书馆","碑帖","碑刻","拓片","单字","字形","人物","数字人文"], url:"https://beitie.library.sh.cn/home", buttonLabel:"进入碑帖知识库 ↗", accessNote:"2026-11-03 核验：连接超时，交互与影像权限待复核。", accessChecked:"2026-11-03", sourceNote:"原定候选第2项。入口网页工具可读title及JavaScript提示，实际GET连接超时、Edge导航超时。上海图书馆 https://www.library.sh.cn/service/service/11 列碑帖知识库；上海图书馆系统网络中心数字人文项目组供稿 https://www.calsp.cn/2024/01/22/bulletin-202401-03/ 核URL及作品/单字/人物功能；未将清单免费和45/77件数量移作当前状态。" },
  { id:"ncl-stone-rubbings", name:"金石拓片資料庫", subtitle:"古籍與特藏文獻資源", institution:"國家圖書館（臺灣）", aliases:["台湾国家图书馆金石拓片数据库","台湾国图","古籍与金石特藏文献资源"], category:"🪨 石刻资源", resourceCategories:["石刻","金文"], genreOnly:true, resourceTags:["碑刻","墓志","拓片","石刻数据库"], description:"馆藏金石拓片检索入口，涵盖碑志、摩崖、题记与金文拓片，可按题名、撰文者、版本、类型及有无影像查找。", keywords:["金石拓片","碑刻","墓志","金文","摩崖","题记","图像","检索"], url:"https://rbook.ncl.edu.tw/NCLSearch/Search/Index/5", buttonLabel:"检索金石拓片 ↗", accessNote:"检索页无需登录即可打开；单件影像及使用授权以馆方说明为准。", accessChecked:"2026-11-03", sourceNote:"原定候选第4项。原URL带tab=3，GET和Edge均200；从 https://rbook.ncl.edu.tw/NCLSearch 的金石拓片資料链接核规范入口，去掉tab参数。官网 https://www.ncl.edu.tw/collections 与子库简介核内容及机构。简介藏量为历史说明，本轮不转填为当前上线数，未验证全量下载或永久免费。" },
  { id:"pku-rare-books", name:"祕籍琳琅——北京大学数字图书馆古文献资源库", institution:"北京大学图书馆", aliases:["秘籍琳琅","秘籍琳琅"], category:"🪨 石刻资源", displayCategory:"综合资源 / 古文献", resourceCategories:["石刻"], genreOnly:true, resourceTags:["拓片","综合资源"], description:"北京大学馆藏古文献综合平台，涵盖元数据、古籍书影、电子图书、拓片与舆图图像，可作拓片馆藏查找的补充入口。", keywords:["北京大学","北大","古文献","古籍","拓片","舆图","馆藏","综合资源"], url:"https://www.lib.pku.edu.cn/3wxbz/34gwxzy/349dyxs/index.htm", buttonLabel:"查看官方资源说明 ↗", accessNote:"官方说明页可访问；2026-11-03 核验数据库入口超时，图像权限未核。", accessChecked:"2026-11-03", sourceNote:"原定候选第5项。用户所列URL为北大图书馆点阅线上官方说明页，GET及Edge均200，核全名、机构与拓片内容；非石刻专库。实际链接为 http://rbdl.calis.edu.cn/aopac/indexold.jsp ，网页工具自动HTTPS后超时，实际访问另核；不把说明页冒充数据库或标为免费。" },
  { id:"shukutoku-stone-rubbings", name:"中国石刻拓本デジタルア－カイブズ", subtitle:"中国石刻拓本数字档案", institution:"淑徳大学書学文化センター", aliases:["日本淑德大学收藏的中国石刻拓片资源","淑德大学中国石刻拓本"], category:"🪨 石刻资源", resourceCategories:["石刻"], genreOnly:true, resourceTags:["碑刻","墓志","拓片"], description:"按年代与专题浏览中国石刻拓本，设天放楼藏拓、画像石砖与昭陵墓志等目录，支持从目录进入拓本图像。", keywords:["淑德大学","日本","中国石刻拓本","天放楼","碑刻","墓志","拓片","画像石","图像"], url:"https://www.shukutoku.ac.jp/university/facilities/syogaku/takuhon/", buttonLabel:"浏览拓本目录 ↗", accessNote:"目录无需登录即可浏览；图像使用遵循馆方规定。", accessChecked:"2026-11-03", sourceNote:"原定候选第6项。官网GET及Edge 200，核原文名称、書学文化センター、年代/专题目录、图像放大说明与官方目録PDF；北魏目录 https://www.shukutoku.ac.jp/university/facilities/syogaku/takuhon/hokugi.html 可读。未移录6000余件、531件或免费使用/下载承诺。" },
  { id:"kyoto-stone-rubbings", name:"京都大学人文科学研究所所蔵石刻拓本資料", institution:"京都大学人文科学研究所", aliases:["京都大学人文科学研究所所藏石刻拓本数据库","京都大学石刻拓本"], category:"🪨 石刻资源", resourceCategories:["石刻"], genreOnly:true, resourceTags:["碑刻","拓片","石刻数据库"], description:"提供画像石与文字拓本两类馆藏目录，可作碑刻图像与刻文研究的资料线索。", keywords:["京都大学","日本","石刻拓本","碑刻","拓片","画像石","文字拓本","图像","目录"], url:"http://kanji.zinbun.kyoto-u.ac.jp/db-machine/imgsrv/takuhon/index.html", buttonLabel:"浏览石刻拓本目录 ↗", readerNote:"旧格式阅读提示：含 DjVu 阅读入口。", accessNote:"目录可访问；旧站含 DjVu 阅读入口，现代浏览器兼容性需留意。", accessChecked:"2026-11-03", sourceNote:"原定候选第7项。HTTP GET及Edge 200，浏览器按iso-2022-jp正确显示原文全名，核畫像石/文字拓本目录、DjVu插件链接及版权说明；https://www.ciih.zinbun.kyoto-u.ac.jp/library/collect.html 交叉核馆藏。未承诺所有影像均能在现代浏览器打开或任意下载，未移录五千/三千幅数量。" },
  { id:"china-jinshi-zonglu", name:"中国金石总录", institution:"", category:"🪨 石刻资源", resourceCategories:["石刻","金文"], genreOnly:true, resourceTags:["碑刻","墓志","拓片","释文","石刻数据库","综合资源"], description:"汇集历代金文与石刻文献，配合拓本、录文和叙录，适合碑刻、墓志及相关历史文献的查找与对读。", keywords:["中国金石总录","金石","金文","碑刻","墓志","拓片","释文","录文","叙录","全文检索"], url:"http://121.89.86.151:6722/home", originalUrl:"http://www.ch5000.com.cn/", buttonLabel:"进入数据库", readerNote:"试用库入口。", accessNote:"补充核验：新入口HTTP 200，浏览器可显示试用库首页与搜索入口；未验证完整检索结果、下载或注册权限。", accessChecked:"2026-11-03", sourceNote:"原定候选第8项，真实资源保留资料条目。官方地址 http://www.ch5000.com.cn/ 经苏州大学图书馆 https://library.suda.edu.cn/c2/1a/c4807a705050/page.htm （2026-07-09更新）确认；本机GET 22秒超时，Edge22秒超时。馆方列校园IP内注册及校外VPN，不等于所有用户免费；发行商列甘肃省古籍文献整理编译中心，未据此认定维护公司，institution留空。未核实甘肃五凉公司归属及当前期数、数量，不移录。 2026-11-03 核验：官网连接超时；可向所在图书馆核实访问权限。 2026-11-03补充：用户提供新地址 http://121.89.86.151:6722/home；Edge实际访问HTTP 200，页面标题“中國金石總錄試用庫”，正文显示开始搜索、关于中国金石总录、总库目录、试用目录及编辑单位甘肃省古籍文献编译整理中心，未登录或注册。首次仅加载到标题，复查成功显示正文且无页面脚本错误。保留原官网 http://www.ch5000.com.cn/ 于originalUrl，主链接改用新入口，HTTP及IP地址可能变化，不保证永久稳定或全部功能/权限。" },
  // AI与数字人文审核A01—A14：各资源只建一条正式记录，分类按实际用途。
  { id:"digital-humanities-research-journal", name:"《数字人文研究》", institution:"中国人民大学主办；数字人文研究院、信息资源管理学院承办；书报资料中心出版", category:"📚 学术期刊", displayCategory:"学术期刊", description:"数字人文领域学术期刊，刊载理论、数字整理方法、基础设施与研究案例。", keywords:["数字人文研究","期刊","Digital Humanities Research","CN10-1716/C","ISSN2096-9155"], researchTags:["数字人文","数字人文研究"], url:"http://dhr.ruc.edu.cn/CN/article/showOldVolumn.do", buttonLabel:"查看刊物目录", readerNote:"此入口为期刊官网HTTP过刊目录；全文获取条件以各篇说明为准。", sourceNote:"A01：2026-11-04直连及浏览器核 http://dhr.ruc.edu.cn/CN/article/showOldVolumn.do 返回200，显示2021—2026年过刊期次和目录链接。院方 http://dh.ruc.edu.cn/xsqk/ 的期刊链接指向同一官网HTTP完整首页，支持入口归属；该院方栏目本轮往期列表为空。https://dh.ruc.edu.cn/xsqk/ 及原https://dhr.ruc.edu.cn/ 本轮证书校验失败，未绕过证书验证，改用已核官网HTTP过刊页。学院 https://irm.ruc.edu.cn/publish/irm/kxyj/szrwyj/index.htm 可读刊物介绍，但不是目录入口。不承诺全刊开放。", accessChecked:"2026-11-04", accessNote:"此入口为期刊官网HTTP过刊目录；全文获取条件以各篇说明为准。" },
  { id:"digital-humanities-collected-journal", name:"《数字人文》", institution:"清华大学、中华书局联合创办", category:"📚 学术期刊", displayCategory:"学术集刊", description:"面向数字人文理论、资源、方法与实践的学术集刊，关注中文世界及跨学科研究。", keywords:["数字人文","集刊","Journal of Digital Humanities","清华大学","中华书局"], researchTags:["数字人文","数字人文研究"], url:"https://www.dhcn.cn/dhjournal", buttonLabel:"查看刊物目录", readerNote:"DHCN提供分期目录与相关文章；全文获取以各原始发布平台为准。", sourceNote:"A02：2026-11-04直连及浏览器核 https://www.dhcn.cn/dhjournal 返回200，可见分期目录和相关文章；沿2023年第3期链接核到《动态视图在文字编管理系统中的应用研究》及作者马继，2025年第4期也有文章列表。原清华 https://www.zhongwen.tsinghua.edu.cn/info/1125/1062.htm 为创刊报道，不再作为主入口。此为DHCN刊物专栏，不将其称为出版社全文站；全文条件按原始发布平台核实。集刊类型保留，不借用人大期刊刊号。", accessChecked:"2026-11-04", accessNote:"DHCN提供分期目录与相关文章；全文获取以各原始发布平台为准。" },
  { id:"ruc-digital-humanities-institute", name:"中国人民大学数字人文研究院", institution:"中国人民大学", category:"🏛️ 学术机构", displayCategory:"学术机构", description:"校级跨学科研究机构，开展数字记忆、数字史学、数字经学等研究、人才培养与项目建设。", keywords:["数字人文","中国人民大学","研究院","数字记忆","数字经学","研究项目"], researchTags:["数字人文","研究项目"], url:"https://dh.ruc.edu.cn/index.htm", buttonLabel:"查看机构介绍", readerNote:"机构网站连接可能不稳定；各项目的数据与工具开放条件须分别查阅。", sourceNote:"A03：现行简介 https://dh.ruc.edu.cn/jggk/zxjj/index.htm 支持准确现名与校级机构关系；本轮首页502、简介超时，沿用同日官方索引证据。前身成立年份口径不一，未录入。", accessChecked:"2026-11-04", accessNote:"机构网站连接可能不稳定；各项目的数据与工具开放条件须分别查阅。" },
  { id:"tsinghua-cnki-digital-humanities-center", name:"清华大学-同方知网数字人文联合研究中心", institution:"清华大学、同方知网数字科技有限公司", category:"🏛️ 学术机构", displayCategory:"学术机构", description:"清华大学与同方知网共建的数字人文研究机构，开展传统文化知识组织、技术与人文协同研究。", keywords:["数字人文","清华大学","同方知网","联合研究中心","研究项目"], researchTags:["数字人文","研究项目"], url:"https://www.rwxy.tsinghua.edu.cn/info/1161/9719.htm", buttonLabel:"查看机构介绍", readerNote:"入口为清华大学官方机构介绍。", sourceNote:"A04：本轮揭牌公告可读；没有核得独立中心官网。不将校内数字人文中心、中华传统文化智能实验室或出土文献研究与保护中心视为同一名称。", accessChecked:"2026-11-04", accessNote:"入口为清华大学官方机构介绍。" },
  { id:"dhcn", name:"中国数字人文（DHCN）", aliases:["DHCN","DHLIB","中国数字人文"], institution:"中华书局古联公司运营", category:"🤖 AI & 数字人文", displayCategory:"数字人文学术门户", description:"提供数字人文资讯、论文元数据、机构和工具导航，现为数字人文专业发展联盟官方网站。", keywords:["数字人文","门户","论文元数据","机构导航","工具导航"], url:"https://www.dhcn.cn/", buttonLabel:"进入学术门户", readerNote:"外链数据库、课程和工具的访问条件各不相同。", sourceNote:"A05：本轮 https://www.dhcn.cn/aboutoursite 可读，明确在清华原有网站基础上改版、由中华书局古联公司负责后续运营。门户不归为单一研究成果。", accessChecked:"2026-11-04", accessNote:"外链数据库、课程和工具的访问条件各不相同。" },
  { id:"fudan-zhuiyu-lianzhu", name:"缀玉联珠：甲骨缀合信息库", aliases:["缀玉联珠","綴玉聯珠"], institution:"复旦大学出土文献与古文字研究中心", category:"🧱 古文字数据库", displayCategory:"甲骨缀合信息数据库", resourceCategories:["甲骨文"], genreOnly:true, description:"整合甲骨缀合关系、出处、缀合者与补正信息，便于查找已有缀合成果及其文献依据。", keywords:["甲骨文","缀合","著录","出处","甲骨缀合"], url:"https://www.fdgwz.org.cn/ZhuiHeLab/Home", buttonLabel:"查询缀合信息", readerNote:"免费向学界与公众开放；查询已有成果，使用时仍需核对原始论证。", sourceNote:"A06：本轮数据库及使用说明可读；不是上传图片自动缀合工具。", accessChecked:"2026-11-04", accessNote:"免费向学界与公众开放；查询已有成果，使用时仍需核对原始论证。" },
  { id:"fudan-sifang-huitong", name:"四方会同：甲骨著录信息库", aliases:["四方会同","四方會同"], institution:"复旦大学出土文献与古文字研究中心", category:"🧱 古文字数据库", displayCategory:"甲骨著录信息数据库", resourceCategories:["甲骨文"], genreOnly:true, description:"互查同片甲骨的不同著录号、相关号、现藏地与参考来源，并联动甲骨缀合信息。", keywords:["甲骨文","著录","片号","重片","现藏地","著录互查"], url:"https://www.fdgwz.org.cn/ZhuLuLab/Home", buttonLabel:"查询著录信息", readerNote:"公开查询免费；共创提交需注册并经审核，相关功能逐步开放。", sourceNote:"A07：本轮官网说明及检索控件可读，说明标2026-10-31正式发布。不与小學堂材料来源表合并，也不把共创权限等同公开查阅。", accessChecked:"2026-11-04", accessNote:"公开查询免费；共创提交需注册并经审核，相关功能逐步开放。" },
  { id:"shidian-guji", name:"识典古籍", institution:"北京大学与字节跳动（抖音）合作建设", category:"🛠️ 学术工具", displayCategory:"古籍阅读与整理平台", description:"提供古籍检索和图文对照；整理平台支持OCR、标点、实体标注、多版本校勘与协作校对。", fitFor:"传世古籍阅读与数字整理；处理古文字原始图像前须另行验证材料适用性。", keywords:["识典古籍","古籍","OCR","文本校勘","图文对照","协作校对"], researchTags:["数字人文","数字整理方法"], url:"https://www.shidianguji.com/searchdq", buttonLabel:"进入阅读与整理平台", readerNote:"公开阅读与注册整理分开；整理端配额及高级功能权限以平台提示为准。", sourceNote:"A08：本轮阅读入口可读并直接链接 https://edit.shidianguji.com/；机构关系参见 https://pkunews.pku.edu.cn/info/7921/2830681.htm 。未登录整理端或验证古文字专用模型，不记录识别准确率。", accessChecked:"2026-11-04", accessNote:"公开阅读与注册整理分开；整理端配额及高级功能权限以平台提示为准。" },
  { id:"imagej-fiji", name:"ImageJ / Fiji", aliases:["ImageJ","Fiji"], institution:"NIH Wayne Rasband及ImageJ、Fiji社区", category:"🛠️ 学术工具", displayCategory:"图像处理工具", description:"提供图像显示、灰度与对比度处理、测量及批处理，可辅助拓片、简帛影像的整理与比较。", keywords:["ImageJ","Fiji","图像处理","拓片数字化","影像测量","批处理"], researchTags:["数字人文","数字整理方法"], url:"https://imagej.net/learn/", buttonLabel:"查看工具与下载指引", readerNote:"需本地安装，无需平台账号；各发行版与插件许可不同。", sourceNote:"A09：本轮官方介绍可读。https://imagej.net/downloads 与 https://imagej.net/licensing/ 支持获取和许可边界；Fiji为包含ImageJ及插件的发行版。非OCR或AI修复工具，未安装运行。", accessChecked:"2026-11-04", accessNote:"需本地安装，无需平台账号；各发行版与插件许可不同。" },
  { id:"collatex", name:"CollateX", institution:"Interedition开发团队（含Huygens ING等参与者）", category:"🛠️ 学术工具", displayCategory:"开源文本校勘组件", description:"对多个文本版本进行切分、对齐和异文输出，可辅助不同释文版本的比较与校勘。", keywords:["CollateX","文本校勘","版本对读","异文","开源"], researchTags:["数字人文","数字整理方法"], url:"https://collatex.net/", buttonLabel:"查看工具与文档", readerNote:"需部署运行环境并准备文本；分词、异体字规则及校勘判断由研究者确定。", sourceNote:"A10：本轮官网可读；https://collatex.net/about/ 核团队，https://github.com/interedition/collatex 核GPL-3.0源码。未运行或评测中文古文字样本。", accessChecked:"2026-11-04", accessNote:"需部署运行环境并准备文本；分词、异体字规则及校勘判断由研究者确定。" },
  { id:"epidoc", name:"EpiDoc Guidelines", aliases:["EpiDoc"], institution:"EpiDoc国际协作团队", category:"🛠️ 学术工具", displayCategory:"数字整理规范与工具", description:"基于TEI XML的古代文献数字整理规范与配套工具，支持释文、残缺、编者处理及器物元数据编码。", keywords:["EpiDoc","TEI","XML","数字整理规范","释文编码","元数据"], researchTags:["数字人文","数字整理方法"], url:"https://epidoc.stoa.org/gl/latest/", buttonLabel:"阅读官方指南", readerNote:"指南公开可读；中文石刻与简帛项目须另定编码约定。", sourceNote:"A11：本轮官方指南可读。规范不是自动识别工具或开箱即用录入网站。", accessChecked:"2026-11-04", accessNote:"指南公开可读；中文石刻与简帛项目须另定编码约定。" },
  { id:"escriptorium", name:"eScriptorium", subtitle:"使用Kraken引擎的OCR/HTR工作流", aliases:["eScriptorium","Kraken"], institution:"EPHE-PSL、Inria等维护团队", category:"🛠️ 学术工具", displayCategory:"开源OCR/HTR整理工具", description:"管理历史文献图像导入、版面分割、转写校对、模型训练与结构化导出，使用独立的Kraken识别引擎。", keywords:["eScriptorium","Kraken","OCR","HTR","版面分析","模型训练","开源"], researchTags:["数字人文","数字整理方法"], url:"https://escriptorium.eu/about/", buttonLabel:"查看项目与文档", readerNote:"需部署或使用机构实例；训练有标注及算力成本，现成古文字模型适用性未核。", sourceNote:"A12：本轮官方说明可读；https://escriptorium.readthedocs.io/en/latest/ 与 https://kraken.re/main/index.html 支持工作流和引擎关系。eScriptorium官方说明MIT许可；不将其许可外推至独立引擎和模型。未安装、上传或训练。", accessChecked:"2026-11-04", accessNote:"需部署或使用机构实例；训练有标注及算力成本，现成古文字模型适用性未核。" },
  { id:"markus", name:"MARKUS", institution:"Hilde De Weerdt、Brent Ho等开发团队", category:"🛠️ 学术工具", displayCategory:"文本标注与分析工具", description:"标注文本中的人名、地名、官职、时间和自定义词表，关联参考资源并导出，辅助已释读文本的实体整理。", keywords:["MARKUS","文本标注","实体标注","自定义词表","文本分析"], researchTags:["数字人文","数字整理方法"], url:"https://dh.chinese-empires.eu/markus/beta/frontPage.html", buttonLabel:"进入标注工具", readerNote:"官网注明使用Chrome；部分联动功能需免费账号，预置词表不保证覆盖先秦秦汉。", sourceNote:"A13：本轮官方工具说明和控件可读；设计者依据 https://www.arts.kuleuven.be/english/our-staff/zap/hildedeweerdt 。未注册上传，不把词表标注称为古文字图像识别。", accessChecked:"2026-11-04", accessNote:"官网注明使用Chrome；部分联动功能需免费账号，预置词表不保证覆盖先秦秦汉。" },
  { id:"docusky", name:"DocuSky数位人文学术研究平台", aliases:["DocuSky","DocuSky數位人文學術研究平台"], institution:"国立台湾大学数位人文研究中心", category:"🛠️ 学术工具", displayCategory:"文本建库与分析平台", description:"提供个人文本资料建库、检索与元数据分析，适合组织已转写释文、出处与研究资料。", keywords:["DocuSky","文本建库","语料检索","元数据","文本分析"], researchTags:["数字人文","数字整理方法"], url:"https://docusky.org.tw/", buttonLabel:"进入平台", readerNote:"仅供学术研究，账号须申请核准；重要资料请另存，容量及费用以平台说明为准。", sourceNote:"A14：本轮账号条件 https://docusky.org.tw/DocuSky/accounts/applyAccountSender.php 可读，明确需用途和所属单位、核准及备份提醒。台大工具目录 https://digital.ntu.edu.tw/News_Link_n_200614_sms_128500__CSN_34628.html 确认官网。未申请或登录。", accessChecked:"2026-11-04", accessNote:"仅供学术研究，账号须申请核准；重要资料请另存，容量及费用以平台说明为准。" },
  { id:"academic-wechat", name:"学术公众号", institution:"微信内学术资讯入口", category:"学术资讯", commonOnly:true, commonAction:"wechat", description:"古文字微刊、出土文献、简牍学等学术公众号入口。", keywords:["公众号","古文字","出土文献","简牍"] }
];

const categories = ["全部","🧱 古文字数据库","📚 学术期刊","🏛️ 学术机构","🛠️ 学术工具","🌏 海外汉学"];
const resourceTypeLabels = { "全部":"全部", "🧱 古文字数据库":"数据库", "📚 学术期刊":"学术刊物", "🏛️ 学术机构":"研究机构", "🛠️ 学术工具":"研究工具", "🌏 海外汉学":"海外资源" };
const resourceGenres = ["甲骨文", "金文", "石刻", "帛书"];
const heroGenreViews = new Set([...resourceGenres, "🏺 汉代简牍"]);
const disciplineViews = new Set(["甲骨文", "金文", "石刻", "🏺 汉代简牍"]);
// 首页推荐独立于 core 标记、专题引用和搜索索引，只引用既有持久 ID。
const homepageFeaturedIds = ["bsm", "nwnu-jiandu", "xiaoxue", "ihp-bronze"];
const bibliographyCategoryCodes = Object.fromEntries(Object.entries(window.searchTaxonomy.categories).flatMap(([code, item]) => [item.label, ...item.aliases].map(label => [label, code])));
const updateGenreDefinitions = {
  "甲骨文": { code:"oracle", label:"甲骨文", matches:["甲骨文", "甲骨"] },
  "金文": { code:"bronze", label:"金文", matches:["金文", "青铜器", "青銅器"] },
  "石刻": { code:"stone", label:"石刻", matches:["石刻", "碑刻", "墓志", "墓誌"] },
  "帛书": { code:"silk", label:"帛书", matches:["帛书", "帛書", "楚帛书", "楚帛書"] }
};
const silkResourceGroups = ["核心材料", "数据库与检索", "整理与出版", "最新研究动态"];
const directionTags = ["甲骨", "金文", "石刻", "简牍", "帛书", "数字人文"];
const updateTypes = ["全部","新论文","新书","新资料","学术会议","学术讲座","研究动态","数据库更新"];
const updateObjectLabels = ["居延汉简","悬泉汉简","敦煌汉简","肩水金关","武威汉简","张家山汉简","五一广场东汉简","走马楼西汉简","秦汉简牍文字","汉代简牍文字"];
const searchTitles = {
  "全部": "从文字与文献，通向学术研究",
  "甲骨文": "从一片甲骨，探寻早期文字",
  "金文": "从一件青铜器，读懂金文世界",
  "石刻": "从一方碑刻，走近历史现场",
  "🏺 汉代简牍": "从一枚汉简，抵达一片学术天地",
  "帛书": "从一卷帛书，展开出土文献"
};
const commonNames = ["小學堂文字學資料庫","中国知网","学术公众号","中国哲学书电子化计划","汉典","字统网"];
let activeCategory = "全部";
let activeResourceCategory = "全部";
let activeDirectionTag = "";
let activeUpdateType = "全部";
const siteGrid = document.querySelector("#siteGrid");
const coreGrid = document.querySelector("#coreGrid");
const filters = document.querySelector("#categoryFilters");
const tagsContainer = document.querySelector("#researchTags");
const searchInput = document.querySelector("#searchInput");
const emptyState = document.querySelector("#emptyState");
const coreSection = document.querySelector("#coreSection");
const searchTitle = document.querySelector("#search-title");
const resourceFilterStatus = document.querySelector("#resourceFilterStatus");
const resourceFilterLabel = document.querySelector("#resourceFilterLabel");
const resourceFilterSummary = document.querySelector("#resourceFilterSummary");
const clearResourceFilter = document.querySelector("#clearResourceFilter");
const updatesGrid = document.querySelector("#updatesGrid");
const researchTopicsContainer = document.querySelector("#researchTopics");
const updateFilters = document.querySelector("#updateFilters");
const updateEmpty = document.querySelector("#updateEmpty");
const updatesKicker = document.querySelector("#updates-kicker");
const updatesTitle = document.querySelector("#updates-title");
const latestUpdateDateElement = document.querySelector("#latestUpdateDate");
const linksLastCheckedElement = document.querySelector("#linksLastChecked");
const updatesToggle = document.querySelector("#updatesToggle");
const researchTagsToggle = document.querySelector("#researchTagsToggle");
const categoryFeedback = document.querySelector("#categoryFeedback");
const returnHomeButton = document.querySelector("#returnHomeButton");
const updateFilterStatus = document.querySelector("#updateFilterStatus");
const updateFilterSummary = document.querySelector("#updateFilterSummary");
const clearUpdateFilters = document.querySelector("#clearUpdateFilters");
const backToTopics = document.querySelector("#backToTopics");
const latestUpdatesView = document.querySelector("#latestUpdatesView");
const updatesSection = document.querySelector(".updates-section");
const resourcesSection = document.querySelector("#resourcesSection");
const genreStructure = document.querySelector("#genreStructure");
const wechatPanel = document.querySelector("#wechatPanel");
const bibliographySection = document.querySelector("#bibliographySection");
const papersSection = document.querySelector("#papersSection");
const papersGrid = document.querySelector("#papersGrid");
const papersMore = document.querySelector("#papersMore");
const papersCollapse = document.querySelector("#papersCollapse");
const papersStatus = document.querySelector("#papersStatus");
const paperPageSize = 12;
let papersVisibleCount = paperPageSize;
let resourceVisibleCounts = { oracle:4, bronze:4, han:4, stone:4, directory:12 };
const literatureSection = document.querySelector("#literatureSection");
const literatureGrid = document.querySelector("#literatureGrid");
const literatureMore = document.querySelector("#literatureMore");
const literatureCollapse = document.querySelector("#literatureCollapse");
let literatureVisibleCount = 4;
const coreResourcesMore = document.querySelector("#coreResourcesMore");
const coreResourcesCollapse = document.querySelector("#coreResourcesCollapse");
const directoryResourcesMore = document.querySelector("#directoryResourcesMore");
const directoryResourcesCollapse = document.querySelector("#directoryResourcesCollapse");
const bibliographyToggle = document.querySelector("#bibliographyToggle");
const bibliographyTitle = document.querySelector("#bibliography-title");
const bibliographyGrid = document.querySelector("#bibliographyGrid");
const bibliographyEmpty = document.querySelector("#bibliographyEmpty");
let updatesExpanded = false;
let researchTagsExpanded = false;
let sitesExpanded = false;
let coreExpanded = false;
let activeUpdateView = "latest";
let topicSelectionActive = false;
// 返回默认动态时只解除动态区的搜索，不改变其他资源区的全站搜索。
let updateSearchIgnored = false;
let wechatExpanded = false;
let bibliographyExpanded = false;
const defaultResearchTags = directionTags;
const researchObjectTags = new Set(["居延汉简","居延新简","悬泉汉简","敦煌汉简","玉门关汉简","肩水金关","武威汉简","尹湾汉简","银雀山汉简","张家山汉简","五一广场东汉简","走马楼西汉简","汉代简牍文字"]);
const isTodo = site => site.url === "TODO";
const academicUpdatesData = Array.isArray(window.academicUpdates) ? window.academicUpdates : (typeof academicUpdates !== "undefined" && Array.isArray(academicUpdates) ? academicUpdates : []);
const academicUpdatesLastUpdatedValue = typeof window.academicUpdatesLastUpdated === "string" && window.academicUpdatesLastUpdated.trim() ? window.academicUpdatesLastUpdated.trim() : (typeof academicUpdatesLastUpdated !== "undefined" && String(academicUpdatesLastUpdated).trim() ? String(academicUpdatesLastUpdated).trim() : "");
// 外部资源链接最近一次人工核验日期，与学术动态数据维护日期分开记录。
const linksLastChecked = "2026-08-20";
const coreBibliographyData = Array.isArray(window.coreBibliography) ? window.coreBibliography : [];
const researchHubsData = Array.isArray(window.researchHubs) ? window.researchHubs : [];
const hubCategoryLabels = Object.fromEntries(Object.entries(window.searchTaxonomy.categories).map(([code, item]) => [code, item.label]));
const hubDetail = document.querySelector("#hubDetail");
let hubsExpanded = false;
let activeHubId = "";
let activeModule = "";
let moduleReturnContext = null;
let activeResourceType = "全部";
const topicsSection = document.querySelector("#topicsSection");
const navigationOverview = document.querySelector("#navigationOverview");
const moduleHeader = document.querySelector("#moduleHeader");
const moduleBack = document.querySelector("#moduleBack");
const guideSection = document.querySelector("#guide");
let hubReturnContext = null;
let hubExpandedSections = new Set();
let hubNavigationFrame = 0;
const hubWarnings = new Set();

function hubWarning(message) {
  if (hubWarnings.has(message)) return;
  hubWarnings.add(message);
  console.warn(`Research hubs: ${message}`);
}
function hubIndex(items, kind) {
  const index = new Map();
  items.forEach(item => {
    if (!item || typeof item.id !== "string" || !item.id) { hubWarning(`${kind}: 缺少 id`); return; }
    if (index.has(item.id)) { hubWarning(`${kind}: 重复 id ${item.id}`); return; }
    index.set(item.id, item);
  });
  return index;
}
const hubResourcesById = hubIndex(sites, "resource");
const hubBooksById = hubIndex(coreBibliographyData, "bibliography");
const hubsById = hubIndex(researchHubsData, "hub");

// 论文按唯一数据源建立运行时索引。URL 结构校验不代替人工来源核验。
function classicPaperUrl(value) {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return "";
    if (/^(?:localhost|example\.(?:com|org|net))$|\.(?:test|invalid|example)$|(?:^|\.)example\.(?:com|org|net)$/i.test(url.hostname)) return "";
    return url.href;
  } catch { return ""; }
}
const paperAccessLabels = {
  "scan-pdf": "阅读原文（扫描PDF）", "full-pdf": "阅读原文（PDF）",
  "full-html": "阅读原文", excerpt: "阅读节选", "paper-info": "查看论文信息", bibliography: "查看出版信息"
};
function paperRecommendationRank(paper) {
  return { recommended: 0, background: 1, "catalog-only": 2 }[paper.recommendationStatus] ?? (paper.featured ? 0 : 1);
}
function comparePaperRecommendations(a, b) {
  return paperRecommendationRank(a) - paperRecommendationRank(b);
}
function classicPaperSourceLink(source, role) {
  const url = classicPaperUrl(source.url);
  if (!url || source.accessType === "none") return "";
  const label = Object.hasOwn(paperAccessLabels, source.accessType) ? paperAccessLabels[source.accessType] : "查看来源（内容未核验）";
  const context = source.context ? `（${source.context}）` : "";
  return `<a class="classic-paper-link" data-paper-source="${role}" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label + context)} ↗</a>`;
}
function validateClassicPapers(items, hubIndex = hubsById) {
  const papers = [], byHub = new Map(), warnings = [];
  const ids = new Set(), identities = new Set();
  const categories = new Set(["oracle", "bronze", "stone", "slips", "silk", "general"]);
  const types = new Set(["经典论文", "研究史", "重要综述", "期刊论文", "集刊论文", "会议论文", "网络研究报告", "论文集文章", "硕士学位论文", "博士学位论文", "报纸文章", "学术论文"]);
  const normalize = value => value.normalize("NFKC").replace(/[\p{P}\s]/gu, "").toLowerCase();
  if (!Array.isArray(items)) return { papers, byHub, warnings: ["论文数据必须为数组"] };
  items.forEach((paper, index) => {
    const label = `论文 #${index + 1}`;
    const fail = message => warnings.push(`${label}: ${message}`);
    if (!paper || typeof paper !== "object") { fail("条目不是对象"); return; }
    if (typeof paper.id !== "string" || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(paper.id)) { fail("缺少合法稳定 id"); return; }
    if (ids.has(paper.id)) { fail(`重复 id ${paper.id}`); return; }
    ids.add(paper.id);
    if (typeof paper.title !== "string" || !paper.title.trim()) { fail("题名为空"); return; }
    if (["author", "year", "journal", "note"].some(key => typeof paper[key] !== "string")) { fail("作者、年份、刊物及 note 必须为字符串，未核验时用空字符串"); return; }
    if (paper.year !== "" && (!/^\d{4}$/.test(paper.year) || Number(paper.year) < 1000 || Number(paper.year) > new Date().getFullYear())) { fail("年份不合理"); return; }
    if (!types.has(paper.type)) { fail("论文类型不合法"); return; }
    if (typeof paper.featured !== "boolean") { fail("featured 必须为布尔值"); return; }
    if (!Array.isArray(paper.categories) || !paper.categories.length || paper.categories.some(code => !categories.has(code))) { fail("门类编码不合法"); return; }
    if (!Array.isArray(paper.hubIds) || paper.hubIds.some(id => typeof id !== "string" || !id)) { fail("hubIds 必须为非空字符串组成的数组，可为空数组"); return; }
    if (["volume", "issue", "pages", "articleNumber", "doi", "abstract", "reviewId", "url", "sourceNote", "accessNote", "accessChecked", "publicationId"].some(key => paper[key] !== undefined && typeof paper[key] !== "string")) { fail("可选字段必须为字符串"); return; }
    if (paper.researchDirections !== undefined && (!Array.isArray(paper.researchDirections) || paper.researchDirections.some(direction => !directionTags.includes(direction)))) { fail("研究方向不合法"); return; }
    if (paper.publicationId && !isPeriodical(hubResourcesById.get(paper.publicationId) || {})) { fail("刊物引用无效"); return; }
    if (["resourceIds", "updateIds"].some(field => paper[field] !== undefined && (!Array.isArray(paper[field]) || paper[field].some(id => typeof id !== "string" || !(field === "resourceIds" ? hubResourcesById.has(id) : academicUpdatesData.some(update => update.id === id)))))) { fail("论文关联引用无效"); return; }
    if (paper.accessType !== undefined && paper.accessType !== "none" && !Object.hasOwn(paperAccessLabels, paper.accessType)) { fail("来源访问类型不合法"); return; }
    if (paper.recommendationStatus !== undefined && !["recommended", "background", "catalog-only"].includes(paper.recommendationStatus)) { fail("推荐状态不合法"); return; }
    const url = classicPaperUrl(paper.url);
    if (paper.url && !url) { fail("URL 无效或包含占位地址"); return; }
    if (paper.accessType === "none" && url) { fail("无公开入口不能同时填写主URL"); return; }
    if (paper.relatedSources !== undefined && !Array.isArray(paper.relatedSources)) { fail("辅助来源必须为数组"); return; }
    const relatedSources = (paper.relatedSources || []).filter(source => {
      if (source && classicPaperUrl(source.url) && Object.hasOwn(paperAccessLabels, source.accessType) && (source.context === undefined || typeof source.context === "string")) return true;
      fail("辅助来源无效，已跳过"); return false;
    });
    const identity = `${normalize(paper.author)}\u0000${normalize(paper.title)}`;
    if (identities.has(identity)) { fail(`作者与题名疑似重复，需人工核对：${paper.id}`); return; }
    identities.add(identity);
    const hubIds = [...new Set(paper.hubIds)].filter(id => {
      if (hubIndex.has(id)) return true;
      fail(`未找到专题引用 ${id}`);
      return false;
    });
    const valid = { ...paper, url, hubIds, relatedSources };
    papers.push(valid);
    hubIds.forEach(id => {
      if (!byHub.has(id)) byHub.set(id, []);
      byHub.get(id).push(valid);
    });
  });
  // 推荐状态优先；旧记录仍按 featured 排序，同级保留人工编排顺序。
  byHub.forEach(list => list.sort(comparePaperRecommendations));
  return { papers, byHub, warnings };
}
const classicPaperCatalog = validateClassicPapers(window.classicPapers || []);
classicPaperCatalog.warnings.forEach(message => console.warn(`Classic papers: ${message}`));
function classicPapersForHub(hubId, catalog = classicPaperCatalog) {
  return catalog.byHub.get(hubId) || [];
}
// 关系只保存稳定 ID，展示时解析正式资源/动态，不复制刊物、平台或论文。
function paperRelationLinks(paper) {
  const references = [
    ...(paper.publicationId ? [{ kind:"publication", id:paper.publicationId, item:hubResourcesById.get(paper.publicationId) }] : []),
    ...searchStrings(paper.resourceIds).map(id => ({ kind:"resource", id, item:hubResourcesById.get(id) })),
    ...searchStrings(paper.updateIds).map(id => ({ kind:"update", id, item:academicUpdatesData.find(update => update.id === id) }))
  ];
  return references.map(({ kind, id, item }) => {
    const url = classicPaperUrl(kind === "update" ? item?.sourceUrl : item?.url);
    if (!url) return "";
    const label = kind === "publication" ? `刊物：${item.name}` : kind === "resource" ? "研究平台" : "相关动态";
    return `<a class="classic-paper-link" data-paper-relation="${kind}" data-related-id="${escapeHtml(id)}" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)} ↗</a>`;
  }).join("");
}
function classicPaperCardTemplate(paper) {
  const carrier = paper.journal ? (paper.type.endsWith("学位论文") ? `学位授予单位：${paper.journal}` : paper.type === "论文集文章" ? `载于：${paper.journal}` : paper.type === "报纸文章" ? `报纸：${paper.journal}` : paper.type === "网络研究报告" ? `发布平台：${paper.journal}` : paper.journal) : "";
  const issueLabel = paper.type === "论文集文章" ? "辑/卷" : paper.type === "会议论文" ? "单元" : "期";
  const publication = [carrier, paper.year, paper.volume ? `卷：${paper.volume}` : "", paper.issue ? `${issueLabel}：${paper.issue}` : "", paper.pages ? `页：${paper.pages}` : "", paper.articleNumber ? `文章号：${paper.articleNumber}` : "", paper.doi ? `DOI：${paper.doi}` : ""].filter(Boolean).map(part => `<span class="paper-citation-part">${escapeHtml(part)}</span>`).join(" · ");
  const sources = (Array.isArray(paper.relatedSources) ? paper.relatedSources : []).filter(source => source && Object.hasOwn(paperAccessLabels, source.accessType) && (source.context === undefined || typeof source.context === "string"));
  const links = classicPaperSourceLink(paper, "primary") + sources.map(source => classicPaperSourceLink(source, "related")).join("") + paperRelationLinks(paper);
  // note / abstract 面向读者；accessNote / sourceNote 保留内部核验依据，不进入卡片。
  const description = paper.abstract || paper.note;
  const status = paper.recommendationStatus === "catalog-only" ? `<span class="bibliography-level">补充题录</span>` : "";
  return `<article class="classic-paper-card bibliography-card" data-paper-id="${escapeHtml(paper.id)}"><div class="bibliography-meta"><span class="bibliography-type">${escapeHtml(paper.type)}</span>${status}</div><h4>${escapeHtml(paper.title)}</h4>${paper.author ? `<p class="bibliography-author">${escapeHtml(paper.author)}</p>` : ""}${publication ? `<p class="bibliography-publication">${publication}</p>` : ""}${description ? `<p class="bibliography-note">${escapeHtml(description)}</p>` : ""}${links ? `<div class="classic-paper-actions">${links}</div>` : ""}</article>`;
}
function resolveHubReferences(ids, index, kind) {
  return [...new Set(Array.isArray(ids) ? ids : [])].flatMap(id => {
    if (index.has(id)) return [index.get(id)];
    hubWarning(`${kind}: 未找到引用 ${id}`);
    return [];
  });
}
function hubCategories(hub) {
  return [...new Set([hub.category, ...searchStrings(hub.categories)].map(searchCategoryCode).filter(Boolean))];
}
function availableHub(hub) {
  return ["active", "preparing"].includes(hub.status) && hubCategories(hub).some(code => hubCategoryLabels[code]);
}
function hubsForCategory(category) {
  const hubs = [...hubsById.values()].filter(availableHub);
  if (category === "全部") return hubs;
  if (category === "🏺 汉代简牍") return hubs.filter(isHanHub);
  const code = bibliographyCategoryCodes[category];
  return code ? hubs.filter(hub => hubCategories(hub).includes(code)) : [];
}
function isHanView() { return activeCategory === "🏺 汉代简牍"; }
function isDisciplineView() { return disciplineViews.has(activeCategory); }
function disciplineResourceKey() { return isHanView() ? "han" : bibliographyCategoryCodes[activeCategory]; }
function isHanHub(hub) {
  return searchCategoryCode(hub.category) === "slips" && searchStrings(hub.updateTags).some(tag => researchObjectTags.has(tag));
}
function hanHubs() { return researchHubsData.filter(hub => availableHub(hub) && isHanHub(hub)); }
function hanResources() {
  const ids = new Set(hanHubs().flatMap(hub => hub.resourceIds));
  const journals = new Set(hanPapers().map(paper => normalizeSearch(paper.journal)));
  return sites.filter(site => site.category === "🏺 汉代简牍" || ids.has(site.id) || (isPeriodical(site) && journals.has(normalizeSearch(site.name))));
}
function hanBooks() {
  const ids = new Set(hanHubs().flatMap(hub => hub.bibliographyIds));
  return coreBibliographyData.filter(book => ids.has(book.id));
}
function hanPapers() {
  const ids = new Set(hanHubs().map(hub => hub.id));
  return classicPaperCatalog.papers.filter(paper => paper.hubIds.some(id => ids.has(id)));
}
function isHanUpdate(update) {
  return [...searchStrings(update.tags), ...searchStrings(update.topics)].some(tag => researchObjectTags.has(tag));
}
function updatesForHub(hub) {
  const terms = new Set(Array.isArray(hub.updateTags) ? hub.updateTags : []);
  const seen = new Set();
  return academicUpdatesData.filter(update => {
    if (!update || seen.has(update.id) || update.example) return false;
    const tags = [...(Array.isArray(update.tags) ? update.tags : []), ...(Array.isArray(update.topics) ? update.topics : [])];
    if (!tags.some(tag => terms.has(tag))) return false;
    seen.add(update.id);
    return true;
  }).sort((a, b) => parseUpdateDate(b.date).localeCompare(parseUpdateDate(a.date)));
}
function hubCardTemplate(hub) {
  const labels = hubCategories(hub).map(code => hubCategoryLabels[code]).filter(Boolean).join(" / ");
  return `<article class="research-topic-card"><span class="topic-label">${escapeHtml(labels)} · ${hub.status === "preparing" ? "整理中" : "研究专题"}</span><h3>${escapeHtml(hub.title)}</h3>${hub.subtitle ? `<p class="topic-subtitle">${escapeHtml(hub.subtitle)}</p>` : ""}<p class="topic-description">${escapeHtml(hub.description)}</p><p class="topic-count">当前收录 ${updatesForHub(hub).length} 条研究动态</p><button class="topic-button" type="button" data-research-topic="${escapeHtml(hub.id)}" aria-label="查看${escapeHtml(hub.title)}">查看专题 →</button></article>`;
}
function hubSectionTemplate(key, title, items, template, emptyText, limit = 4, previewItems = null) {
  const expanded = hubExpandedSections.has(key);
  const preview = previewItems ?? items.slice(0, limit);
  const visible = expanded ? items : preview;
  const content = visible.length ? `<div class="hub-grid">${visible.map(template).join("")}</div>` : `<p class="hub-empty">${items.length ? "本专题另有补充题录，可展开查看。" : emptyText}</p>`;
  const toggle = items.length > preview.length ? `<button type="button" class="section-toggle" data-hub-expand="${key}" aria-expanded="${expanded}">${expanded ? "收起" : `展开更多（${items.length}）`}</button>` : "";
  return `<section class="hub-section${items.length ? "" : " hub-section-empty"}" data-hub-section="${key}" aria-labelledby="hub-${key}-title"><h3 id="hub-${key}-title">${title}</h3>${content}${toggle}</section>`;
}
function renderHubDetail() {
  const hub = hubsById.get(activeHubId);
  if (!hub) return;
  const resources = resolveHubReferences(hub.resourceIds, hubResourcesById, "resource");
  const books = resolveHubReferences(hub.bibliographyIds, hubBooksById, "bibliography");
  const related = resolveHubReferences(hub.relatedHubIds, hubsById, "hub").filter(item => item.id !== hub.id && availableHub(item));
  const papers = classicPapersForHub(hub.id);
  const returnLabel = searchSession ? "返回搜索结果" : hubReturnContext?.category === "全部" ? "返回首页" : "返回当前门类";
  hubDetail.innerHTML = `<button type="button" class="hub-back" data-hub-back>← ${returnLabel}</button><header class="hub-heading"><p class="section-kicker">RESEARCH HUB · ${escapeHtml(hubCategories(hub).map(code => hubCategoryLabels[code]).filter(Boolean).join(" / "))}</p><h2 id="hubTitle" tabindex="-1">${escapeHtml(hub.title)}</h2>${hub.subtitle ? `<p class="hub-subtitle">${escapeHtml(hub.subtitle)}</p>` : ""}<p>${escapeHtml(hub.description)}</p></header>`
    + hubSectionTemplate("resources", "核心资源", resources, siteCardTemplate, "核心资源整理中。")
    + hubSectionTemplate("bibliography", "研究书目", books, bibliographyCardTemplate, "核心书目整理中。")
    + hubSectionTemplate("papers", "学术论文", papers, classicPaperCardTemplate, "当前暂无已整理的学术论文。", 3, papers.filter(paper => paper.recommendationStatus !== "catalog-only").slice(0, 3))
    + hubSectionTemplate("updates", "最新学术动态", updatesForHub(hub), update => updateCardTemplate({ ...update, tags: Array.isArray(update.tags) ? update.tags : [] }), "当前暂无已收录的相关学术动态。")
    + hubSectionTemplate("related", "相关专题", related, hubCardTemplate, "相关专题整理中。");
  hubDetail.hidden = false;
  searchBrowseSections().forEach(section => { section.hidden = true; });
  hubDetail.hidden = false;
}
function openResearchHub(id) {
  const hub = hubsById.get(id);
  if (!hub || !availableHub(hub)) { hubWarning(`hub: 无法打开 ${id}`); return; }
  if (!activeHubId) hubReturnContext = { category: activeCategory, scrollY: window.scrollY, triggerId: id };
  activeHubId = id;
  hubExpandedSections.clear();
  renderHubDetail();
  cancelAnimationFrame(hubNavigationFrame);
  hubNavigationFrame = requestAnimationFrame(() => {
    document.querySelector("#hubTitle")?.focus({ preventScroll: true });
    const top = hubDetail.getBoundingClientRect().top + window.scrollY - 16;
    window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
  });
}
function dismissResearchHub(restore = false) {
  if (restore && searchSession) { returnToSearchResults(); return; }
  cancelAnimationFrame(hubNavigationFrame);
  if (!activeHubId) return;
  const context = hubReturnContext;
  activeHubId = "";
  hubReturnContext = null;
  hubExpandedSections.clear();
  hubDetail.hidden = true;
  hubDetail.innerHTML = "";
  if (!restore) return;
  renderSites();
  renderBibliography();
  renderResearchTopics();
  renderUpdateView();
  hubNavigationFrame = requestAnimationFrame(() => {
    const trigger = [...researchTopicsContainer.querySelectorAll("[data-research-topic]")].find(button => button.dataset.researchTopic === context?.triggerId);
    trigger?.focus({ preventScroll: true });
    window.scrollTo({ top: context?.scrollY || 0, behavior: "instant" });
  });
}

// 统一处理文本，保证日后新增资料时特殊字符不会影响卡片结构。
function escapeHtml(text) { return String(text || "").replace(/[&<>'"]/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#039;", '"':"&quot;" })[char]); }
// 卡片展示白名单：审核字段永不直接回退到前台，正文简介不按关键词删改。
const resourceUseConditions = {
  "ihp-bronze":"需注册", "yinxu-oracle-database":"提供注册与购买入口",
  "ctext":"部分功能需账号", "shidian-guji":"整理功能需注册",
  "fudan-sifang-huitong":"共创功能需注册", "docusky":"需申请账号；仅限学术研究",
  "imagej-fiji":"需本地安装", "collatex":"需部署运行环境", "escriptorium":"需部署或使用机构实例",
  "markus":"部分功能需注册；需Chrome", "zju-epitaphs":"请用繁体字检索",
  "kyoto-stone-rubbings":"含DjVu阅读入口", "china-jinshi-zonglu":"试用库"
};
function resourceCardTextKey(value) { return String(value || "").normalize("NFKC").toLowerCase().replace(/[\s《》〈〉（）()·—–-]/g, ""); }
function resourceLinkUrl(site) {
  if (typeof site.url !== "string" || !site.url.trim() || isTodo(site)) return "";
  try { return ["http:","https:"].includes(new URL(site.url).protocol) ? site.url : ""; } catch { return ""; }
}
function resourceCardView(site) {
  const name = String(site.name || "");
  const nameKey = resourceCardTextKey(name);
  const institution = site.institution && !nameKey.includes(resourceCardTextKey(site.institution)) ? site.institution : "";
  const seen = new Set([nameKey, resourceCardTextKey(site.institution)].filter(Boolean));
  const subtitles = [site.subtitle, site.englishName].filter(value => {
    const key = resourceCardTextKey(value);
    if (!key || seen.has(key) || nameKey.includes(key)) return false;
    seen.add(key); return true;
  });
  const preferred = new Set(["文本分析","文本校勘","图像处理","OCR","HTR","语料库","字形","释文","检索","缀合","著录","版本对读","文献管理","实体标注","文本建库","元数据","图文对照","开源"]);
  const keywords = (Array.isArray(site.keywords) ? site.keywords : []).filter(value => typeof value === "string");
  const candidates = [...(Array.isArray(site.resourceTags) ? site.resourceTags : []), ...keywords.filter(word => preferred.has(word)), ...keywords];
  const tags = [];
  for (const word of candidates) {
    const key = resourceCardTextKey(word);
    if (!key || seen.has(key) || nameKey.includes(key) || resourceCardTextKey(institution) === key) continue;
    seen.add(key); tags.push(word); if (tags.length === 4) break;
  }
  return { name, institution, subtitle:subtitles[0] || "", description:site.description || "", tags,
    condition:Object.hasOwn(resourceUseConditions, site.id) ? resourceUseConditions[site.id] : "", url:resourceLinkUrl(site), buttonLabel:site.buttonLabel };
}
function linkTemplate(site) { const url = resourceLinkUrl(site); return !url ? "" : `<a class="visit-button" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(site.buttonLabel || "访问网站 ↗")}</a>`; }
function keywordsTemplate(site) { const tags = resourceCardView(site).tags; return tags.length ? `<div class="keywords" aria-label="关键词">${tags.map(word => `<span class="keyword">${escapeHtml(word)}</span>`).join("")}</div>` : ""; }
// 显示名称与既有分类键分离，正式名称、稳定ID和原始数据保持不变。
function resourceDisplayLabel(value) {
  return String(value || "").replace(/学术网站与数据库/g,"学术资源").replace(/数据库与数字资源/g,"数据库").replace(/学术期刊与集刊/g,"学术刊物").replace(/学术机构/g,"研究机构").replace(/学术工具/g,"研究工具").replace(/AI\s*&?\s*数字人文|AI与数字人文/g,"数字人文").replace(/研究著作与整理本/g,"研究书目").replace(/学术论文\s*[/／]\s*研究史/g,"学术论文");
}
function resourceBadge(site) {
  if (isPeriodical(site)) return site.displayCategory;
  const kind = resourceKind(site);
  return resourceDisplayLabel(site.displayCategory || (kind === "institution" ? "研究机构" : kind === "tool" ? "研究工具" : kind === "database" ? "数据库" : "学术资源"));
}
function coreCardTemplate(site) { return renderResourceCard(site, { compact:true }); }
function resourceTagsTemplate(site) { return keywordsTemplate(site); }
function siteCardTemplate(site) { return renderSiteCard(site, activeResourceCategory); }
function renderSiteCard(site, resourceCategory) { return renderResourceCard(site, { resourceCategory }); }
function renderResourceCard(site, { compact = false, resourceCategory = "" } = {}) {
  const view = resourceCardView(site);
  const description = compact ? view.description.split(/[，；。]/)[0] + "。" : view.description;
  const classes = compact ? "core-card site-card featured-card" : "site-card";
  const group = !compact && resourceCategory === "帛书" && site.resourceGroup ? `<span class="resource-group-label">${escapeHtml(site.resourceGroup)}</span>` : "";
  const subtitle = !compact && view.subtitle ? `<p class="core-subtitle">${escapeHtml(view.subtitle)}</p>` : "";
  const institution = view.institution ? `<p class="institution">${escapeHtml(view.institution)}</p>` : "";
  const condition = !compact && view.condition ? `<span class="access-note">${escapeHtml(view.condition)}</span>` : "";
  const tags = compact ? "" : keywordsTemplate(site);
  return `<article class="${classes}"><span class="category-badge">${escapeHtml(resourceBadge(site))}</span>${group}<h3>${escapeHtml(view.name)}</h3>${subtitle}${institution}${condition}<p class="description">${escapeHtml(description)}</p>${tags}${linkTemplate(compact ? {...view, buttonLabel:"进入 ↗"} : view)}</article>`;
}
function isPeriodical(site) { return ["学术期刊", "学术集刊"].includes(site.displayCategory); }
function papersForPeriodical(site) {
  return isPeriodical(site) ? classicPaperCatalog.papers.filter(paper => paper.publicationId ? paper.publicationId === site.id : normalizeSearch(paper.journal) === normalizeSearch(site.name)).sort(comparePaperRecommendations) : [];
}
function periodicalCardTemplate(site) {
  const papers = papersForPeriodical(site);
  return `<section class="periodical-record" data-periodical-id="${escapeHtml(site.id)}">${siteCardTemplate(site)}<details class="periodical-papers"><summary>${escapeHtml(site.name)} · 本站关联论文（${papers.length}）</summary>${papers.length ? `<div class="hub-grid">${papers.map(classicPaperCardTemplate).join("")}</div>` : `<p class="hub-empty">本站暂未收录该刊论文。</p>`}</details></section>`;
}
function bibliographyItemsFor(category) {
  if (category === "全部") return coreBibliographyData.slice().sort((a, b) => Number(b.featured === true) - Number(a.featured === true));
  const code = bibliographyCategoryCodes[category];
  if (!code) return [];
  const direct = coreBibliographyData.filter(book => Array.isArray(book.categories) && book.categories.includes(code));
  if (!direct.length) return [];
  const general = coreBibliographyData.filter(book => Array.isArray(book.categories) && book.categories.includes("general"));
  return [...direct, ...general];
}
function bibliographyCardTemplate(book) {
  const author = book.author ? `<p class="bibliography-author">${escapeHtml(book.author)}</p>` : "";
  const level = book.level ? `<span class="bibliography-level">${escapeHtml(book.level)}</span>` : "";
  const useFor = Array.isArray(book.useFor) ? `<div class="bibliography-tags" aria-label="适用方向">${book.useFor.map(item => `<span>${escapeHtml(item)}</span>`).join("")}</div>` : "";
  const publication = [book.publisher, book.year].filter(Boolean).map(escapeHtml).join(" · ");
  const isbn = book.isbn ? `<p class="bibliography-isbn">ISBN ${escapeHtml(book.isbn)}</p>` : "";
  const volumes = Array.isArray(book.volumes) && book.volumes.length ? `<details class="bibliography-volumes"><summary>已收录卷册（${book.volumes.length}）</summary><ul>${book.volumes.map(volume => `<li><span>${escapeHtml(volume.title)}</span>${volume.year || volume.isbn ? `<small>${escapeHtml([volume.year, volume.isbn ? `ISBN ${volume.isbn}` : ""].filter(Boolean).join(" · "))}</small>` : ""}</li>`).join("")}</ul></details>` : "";
  const link = book.url ? `<a class="visit-button bibliography-link" href="${escapeHtml(book.url)}" target="_blank" rel="noopener noreferrer">查看馆藏信息</a>` : "";
  return `<article class="bibliography-card"><div class="bibliography-meta"><span class="bibliography-type">${escapeHtml(book.type)}</span>${level}</div><h3>${escapeHtml(book.title)}</h3>${author}${useFor}${book.note ? `<p class="bibliography-note">${escapeHtml(book.note)}</p>` : ""}${publication ? `<p class="bibliography-publication">${publication}</p>` : ""}${isbn}${volumes}${link}</article>`;
}
// 仅建立展示用引用列表，不写回或复制正式题录；通用书目不自动分配给具体学科。
function disciplineLiterature() {
  if (!isDisciplineView()) return [];
  const code = bibliographyCategoryCodes[activeCategory];
  const bookIds = new Set(hubsForCategory(activeCategory).flatMap(hub => hub.bibliographyIds));
  const books = coreBibliographyData.filter(book => bookIds.has(book.id) || (!isHanView() && searchStrings(book.categories).includes(code)));
  const papers = (isHanView() ? hanPapers() : classicPaperCatalog.papers.filter(paper => paper.categories.includes(code))).slice().sort(comparePaperRecommendations);
  const items = [];
  // 首屏兼顾论文与书目，完整列表仍只出现每条正式题录一次。
  for (let i = 0; i < Math.max(books.length, papers.length); i++) {
    if (papers[i]) items.push({ kind:"paper", item:papers[i] });
    if (books[i]) items.push({ kind:"bibliography", item:books[i] });
  }
  return items;
}
function renderDisciplineLiterature() {
  const items = disciplineLiterature();
  const count = Math.min(literatureVisibleCount, items.length);
  literatureGrid.innerHTML = items.slice(0, count).map(({ kind, item }) => kind === "paper"
    ? classicPaperCardTemplate(item)
    : bibliographyCardTemplate(item).replace('<article class="bibliography-card">', `<article class="bibliography-card" data-bibliography-id="${escapeHtml(item.id)}">`)).join("");
  renderPagedControls(literatureMore, literatureCollapse, document.querySelector("#literatureStatus"), count, items.length, 4, "文献", "项", "查看更多文献");
}
function renderBibliography() {
  const han = isHanView() && activeModule !== "bibliography";
  const allItems = han ? hanBooks() : bibliographyItemsFor(activeModule === "bibliography" ? "全部" : activeCategory);
  bibliographyTitle.textContent = han ? "汉简研究书目" : "研究书目";
  document.querySelector("#bibliographySection .section-kicker").textContent = han ? "HAN SLIPS · BOOKS & EDITIONS" : "RESEARCH BOOKS & EDITIONS";
  bibliographyGrid.innerHTML = (han && !bibliographyExpanded ? allItems.slice(0, 3) : allItems).map(bibliographyCardTemplate).join("");
  bibliographyToggle.hidden = !han || allItems.length <= 3;
  bibliographyToggle.textContent = bibliographyExpanded ? "收起著作" : `查看更多著作（${allItems.length}）`;
  bibliographyToggle.setAttribute("aria-expanded", String(bibliographyExpanded));
  bibliographyEmpty.hidden = allItems.length !== 0;
  bibliographyEmpty.textContent = activeCategory === "石刻" ? "当前暂无已整理的石刻核心书目。" : activeCategory === "帛书" ? "当前暂无已整理的帛书核心书目。" : "当前暂无已整理的核心书目。";
}
function digitalHumanitiesPapers() { return classicPaperCatalog.papers.filter(paper => searchStrings(paper.researchDirections).includes("数字人文")); }
function isDigitalResearchView() { return activeModule === "resources" && activeResourceType === "全部" && activeDirectionTag === "数字人文"; }
function paperListStep() { return !isDigitalResearchView() && isHanView() && activeModule !== "papers" ? 3 : paperPageSize; }
function renderClassicPapers() {
  const digital = isDigitalResearchView();
  const han = !digital && isHanView() && activeModule !== "papers";
  const papers = [...(digital ? digitalHumanitiesPapers() : han ? hanPapers() : classicPaperCatalog.papers)].sort(comparePaperRecommendations);
  document.querySelector("#papers-title").textContent = digital ? "数字人文研究成果" : han ? "汉简相关学术论文" : "学术论文";
  document.querySelector("#papersSection .section-kicker").textContent = digital ? "DIGITAL HUMANITIES · RESEARCH PAPERS" : han ? "HAN SLIPS · RESEARCH PAPERS" : "ACADEMIC PAPERS";
  const count = Math.min(papersVisibleCount, papers.length);
  papersGrid.innerHTML = papers.slice(0, count).map(classicPaperCardTemplate).join("");
  renderPagedControls(papersMore, papersCollapse, papersStatus, count, papers.length, paperListStep(), "论文", "篇", "查看更多论文");
}
// 同一套分批展示与焦点处理供论文、门类资源和完整目录复用。
function renderPagedControls(more, collapse, status, count, total, step, label, unit = "项", verb = "查看更多资源") {
  status.textContent = `已显示 ${count} / ${total} ${unit}`;
  status.hidden = count >= total;
  more.hidden = count >= total;
  more.textContent = `${verb}（${Math.min(step, Math.max(0, total - count))}${unit}）`;
  more.setAttribute("aria-expanded", String(count > step));
  collapse.hidden = count <= step;
  collapse.textContent = `收起${label}`;
  collapse.setAttribute("aria-expanded", String(count > step));
}
function bindPagedList(more, collapse, section, getCount, setCount, getStep, render) {
  more.addEventListener("click", () => {
    const scroll = window.scrollY;
    setCount(getCount() + getStep());
    render();
    (more.hidden ? collapse : more).focus({ preventScroll:true });
    window.scrollTo({ top:scroll, behavior:"instant" });
  });
  collapse.addEventListener("click", () => {
    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    setCount(getStep());
    render();
    more.focus({ preventScroll:true });
    if (window.scrollY > sectionTop) window.scrollTo({ top:Math.max(0, sectionTop - 16), behavior:"instant" });
  });
}
bindPagedList(papersMore, papersCollapse, papersSection, () => papersVisibleCount, value => { papersVisibleCount = value; }, paperListStep, renderClassicPapers);
bindPagedList(coreResourcesMore, coreResourcesCollapse, coreSection, () => resourceVisibleCounts[disciplineResourceKey()], value => { resourceVisibleCounts[disciplineResourceKey()] = value; }, () => 4, renderSites);
bindPagedList(literatureMore, literatureCollapse, literatureSection, () => literatureVisibleCount, value => { literatureVisibleCount = value; }, () => 4, renderDisciplineLiterature);
bindPagedList(directoryResourcesMore, directoryResourcesCollapse, resourcesSection, () => resourceVisibleCounts.directory, value => { resourceVisibleCounts.directory = value; }, () => 12, renderSites);
bibliographyToggle.addEventListener("click", () => {
  const sectionTop = bibliographySection.getBoundingClientRect().top + window.scrollY;
  bibliographyExpanded = !bibliographyExpanded;
  renderBibliography();
  bibliographyToggle.focus({ preventScroll:true });
  if (!bibliographyExpanded && window.scrollY > sectionTop) window.scrollTo({ top:Math.max(0, sectionTop - 16), behavior:"instant" });
});
// 控件重绘时保留键盘位置，不触发滚动；数据与筛选逻辑保持独立。
function replaceControls(container, markup, attribute) {
  const active = document.activeElement;
  const value = container.contains?.(active) ? active?.getAttribute(attribute) : null;
  container.innerHTML = markup;
  if (value !== null) {
    [...container.querySelectorAll('[' + attribute + ']')].find(button => button.getAttribute(attribute) === value)?.focus({ preventScroll:true });
  }
}
function renderFilters() {
  replaceControls(filters, categories.map(category => `<button class="filter-button ${category === activeResourceType ? "is-active" : ""}" type="button" data-category="${category}" aria-current="${category === activeResourceType ? "true" : "false"}" aria-pressed="${category === activeResourceType}">${resourceTypeLabels[category]}</button>`).join(""), "data-category");
  document.querySelectorAll("[data-genre]").forEach(button => {
    const active = button.dataset.genre === activeCategory;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  returnHomeButton.hidden = !heroGenreViews.has(activeCategory);
}
function renderDirectionTags() {
  replaceControls(tagsContainer, ["", ...directionTags].map(tag => `<button class="research-tag ${tag === activeDirectionTag ? "is-active" : ""}" type="button" data-direction="${tag}" aria-pressed="${tag === activeDirectionTag}">${tag || "全部"}</button>`).join(""), "data-direction");
  researchTagsToggle.hidden = true;
}

function renderUpdateFilters() { replaceControls(updateFilters, updateTypes.map(type => `<button class="update-filter ${type === activeUpdateType ? "is-active" : ""}" type="button" data-update-type="${type}" aria-pressed="${type === activeUpdateType}">${type}</button>`).join(""), "data-update-type"); }
function renderUpdateView() {
  latestUpdatesView.hidden = false;
  renderUpdateContext();
}
function updateMatchesGenre(update, definition) {
  const explicitCategories = [
    ...(Array.isArray(update.categories) ? update.categories : update.categories ? [update.categories] : []),
    ...(update.category ? [update.category] : [])
  ].map(value => String(value));
  if (explicitCategories.some(value => [definition.code, definition.label, ...definition.matches].includes(value))) return true;
  // 只接受明确门类和研究对象，不以来源网站、宽泛关键词或子串推断学科。
  const objects = new Set(definition.matches);
  researchHubsData.filter(hub => hubCategories(hub).includes(definition.code)).forEach(hub => {
    searchStrings(hub.updateTags).forEach(tag => objects.add(tag));
  });
  return [...searchStrings(update.tags), ...searchStrings(update.topics)].some(value => objects.has(value));
}
function renderUpdateContext() {
  searchTitle.textContent = searchTitles[activeCategory] || searchTitles["全部"];
  const definition = updateGenreDefinitions[activeCategory];
  if (definition) {
    updatesKicker.textContent = `${definition.code.toUpperCase()} · LATEST RESEARCH`;
    updatesTitle.textContent = isDisciplineView() ? "最新学术动态" : `${definition.label} · 最新学术动态`;
    latestUpdateDateElement.hidden = true;
    return;
  }
  updatesKicker.textContent = isHanView() ? "HAN SLIPS · LATEST RESEARCH" : "ACADEMIC UPDATES";
  updatesTitle.textContent = "最新学术动态";
  latestUpdateDateElement.hidden = false;
}
function renderResearchTopics() {
  const items = hubsForCategory(activeCategory);
  document.querySelector("#research-topics-title").textContent = "研究专题";
  document.querySelector("#topicsSection .section-kicker").textContent = isHanView() ? "HAN SLIPS · RESEARCH HUBS" : "RESEARCH HUBS";
  researchTopicsContainer.innerHTML = items.length ? items.map(hub => `<article class="research-topic-card portal-topic"><button class="topic-button" type="button" data-research-topic="${escapeHtml(hub.id)}" aria-label="查看${escapeHtml(hub.title)}"><span>${escapeHtml(hub.title)}</span><span aria-hidden="true">→</span></button></article>`).join("") : `<p class="research-topics-empty">当前暂无已整理的${escapeHtml(hubCategoryLabels[bibliographyCategoryCodes[activeCategory]] || "")}研究专题。</p>`;
}
function parseUpdateDate(dateText) {
  const match = String(dateText || "").match(/\d{4}-\d{2}(?:-\d{2})?/);
  return match ? match[0] : "";
}

function validateAcademicUpdates() {
  const warnings = [];
  const seenIds = new Set();
  const seenPairs = new Set();
  const allowedTypes = new Set(["新论文","新书","新资料","学术会议","学术讲座","研究动态","数据库更新"]);

  academicUpdatesData.forEach((update, index) => {
    const prefix = `Academic update #${index + 1}`;
    if (!update || typeof update !== "object") {
      warnings.push(`${prefix}: 数据不是对象`);
      return;
    }

    const id = String(update.id || "").trim();
    const title = String(update.title || "").trim();
    const type = String(update.type || "").trim();
    const date = String(update.date || "").trim();
    const source = String(update.source || "").trim();
    const sourceUrl = String(update.sourceUrl || "").trim();
    const tags = update.tags;

    if (!id) warnings.push(`${prefix}: id 为空`);
    else if (seenIds.has(id)) warnings.push(`${prefix}: id 重复 - ${id}`);
    else seenIds.add(id);

    if (!title) warnings.push(`${prefix}: title 为空`);
    if (!allowedTypes.has(type)) warnings.push(`${prefix}: type 不在允许范围 - ${type || "空值"}`);
    if (!date) warnings.push(`${prefix}: date 为空`);
    else if (!/\d{4}-\d{2}(?:-\d{2})?/.test(date)) warnings.push(`${prefix}: date 格式可能异常 - ${date}`);
    if (!source) warnings.push(`${prefix}: source 为空`);
    if (!sourceUrl) warnings.push(`${prefix}: sourceUrl 为空`);
    else if (!/^https:\/\//i.test(sourceUrl)) warnings.push(`${prefix}: sourceUrl 不是 HTTPS - ${sourceUrl}`);
    if (!Array.isArray(tags)) warnings.push(`${prefix}: tags 不是数组`);

    const pairKey = `${title}@@${source}`;
    if (title && source) {
      if (seenPairs.has(pairKey)) warnings.push(`${prefix}: 疑似重复动态 - ${title} / ${source}`);
      else seenPairs.add(pairKey);
    }
  });

  warnings.forEach(message => console.warn(message));
  console.info(`Academic updates loaded: ${academicUpdatesData.length} items, ${warnings.length} warnings`);
  return warnings;
}

function renderLatestUpdateDate() {
  const eventDates = academicUpdatesData
    .map(update => parseUpdateDate(update?.date))
    .filter(Boolean)
    .sort();
  const lastUpdated = academicUpdatesLastUpdatedValue || "暂无记录";
  const latestEvent = eventDates.length ? eventDates[eventDates.length - 1] : "暂无记录";
  latestUpdateDateElement.textContent = `数据更新：${lastUpdated} · 最近事件：${latestEvent}`;
}
function renderWechatPanel() {
  wechatPanel.querySelectorAll(".wechat-card").forEach(card => { card.hidden = false; });
}
function updateCardTemplate(update) {
  const label = update.type === "新论文" ? "查看论文信息" : update.type === "新书" ? "查看出版信息" : "阅读原文";
  const link = update.sourceUrl ? `<a class="update-link" href="${escapeHtml(update.sourceUrl)}" target="_blank" rel="noopener noreferrer">${label} ↗</a>` : "";
  const objects = searchStrings(update.tags).filter(tag => updateObjectLabels.includes(tag));
  const objectTags = objects.length ? `<div class="update-object-list">${objects.map(object => `<span>${escapeHtml(object)}</span>`).join("")}</div>` : "";
  const historyLabel = update.historical === true ? `<span class="historical-label">历史补录</span>` : "";
  return `<article class="update-card"><div class="update-top"><span class="update-type">${escapeHtml(update.type)}</span><span class="update-labels">${historyLabel}${update.example ? `<span class="example-label">示例数据</span>` : ""}</span></div><h3>${escapeHtml(update.title)}</h3><p class="update-meta">来源：${escapeHtml(update.source)}<br>时间：${escapeHtml(update.date)}</p>${objectTags}<p class="update-summary">${escapeHtml(update.summary)}</p>${link}</article>`;
}
function renderUpdates() {
  renderUpdateContext();
  const query = updateSearchIgnored ? "" : searchInput.value.trim().toLowerCase();
  const definition = updateGenreDefinitions[activeCategory];
  const validUpdates = academicUpdatesData.filter(update => update && typeof update === "object");
  const genreUpdates = definition ? validUpdates.filter(update => updateMatchesGenre(update, definition)) : isHanView() ? validUpdates.filter(isHanUpdate) : validUpdates;
  const filteredUpdates = genreUpdates.filter(update => {
    const typeMatches = activeUpdateType === "全部" || update.type === activeUpdateType;
    const searchable = [update.title, update.type, update.source, update.summary, ...searchStrings(update.tags), ...searchStrings(update.topics)].join(" ").toLowerCase();
    return typeMatches && searchable.includes(query);
  });
  const hasExplicitFilter = activeUpdateType !== "全部";
  const updates = (updatesExpanded || hasExplicitFilter || query)
    ? filteredUpdates
    : filteredUpdates.slice().sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || parseUpdateDate(b.date).localeCompare(parseUpdateDate(a.date))).slice(0, 6);
  updatesGrid.innerHTML = updates.map(updateCardTemplate).join("");
  updateEmpty.hidden = filteredUpdates.length !== 0;
  updateEmpty.textContent = definition && genreUpdates.length === 0
    ? `当前暂无已收录的${definition.label}最新学术动态。`
    : "当前筛选条件下暂无已核验的学术动态。";
  updatesToggle.hidden = filteredUpdates.length <= 6 || hasExplicitFilter || Boolean(query);
  updatesToggle.textContent = updatesExpanded ? "收起动态" : `查看更多动态（${filteredUpdates.length}）`;
  document.querySelector("#updateSearchNote").hidden = !updateSearchIgnored || !searchInput.value.trim();
  updatesToggle.setAttribute("aria-expanded", String(updatesExpanded));
  updateFilterStatus.hidden = !hasExplicitFilter;
  updateFilterSummary.textContent = `${activeUpdateType === "全部" ? "全部类型" : activeUpdateType} · 共 ${filteredUpdates.length} 条`;
  backToTopics.hidden = !topicSelectionActive;
  updatesSection.classList.toggle("has-active-filter", hasExplicitFilter);
}

function siteSearchText(site) {
  return [site.name,site.englishName,site.subtitle,site.institution,site.description,site.category,site.displayCategory,...(site.keywords || []),...(site.researchTags || []),...(site.resourceTags || [])].join(" ").toLowerCase();
}
// 仅以正式记录的主类型、明确材料关联和人工确认的地域标记生成筛选，不复制资源。
const overseasResourceIds = new Set(["xiaoxue","xiaoxue-oracle","xiaoxue-oracle-sources","xiaoxue-bronze","ihp-woodslip","ihp-oracle-rubbings","ihp-bronze","ihp-preqin-vocabulary","ihp-bronze-rubbings","ihp-han-stone-rubbings","ihp-buddhist-stone-rubbings","ihp-liao-jin-yuan-rubbings","ihp-song-rubbings","chant-oracle","ncl-stone-rubbings","shukutoku-stone-rubbings","kyoto-stone-rubbings","google-scholar","jstor","cinii","brill","zotero","openalex","semantic-scholar","imagej-fiji","collatex","epidoc","escriptorium","markus","docusky"]);
const resourceDirectionLinks = {
  "nwnu-jiandu":["简牍","数字人文"], "bsm":["简牍","帛书"], "ihp-woodslip":["简牍"], "guanlian-hanqing":["简牍","帛书"],
  "ihp-preqin-vocabulary":["甲骨","简牍"], "tsinghua-ctwx":["简牍","帛书"], "wuhan-bamboo-silk-center":["简牍","帛书"],
  "chutu-wenxian-journal":["甲骨","金文","简牍","帛书"], "chutu-wenxian-yanjiu":["简牍","帛书"], "chutu-wenxian-falvshi":["甲骨","金文","简牍"]
};
function resourceKind(site) {
  if (site.commonOnly) return "internal";
  if (isPeriodical(site)) return "periodical";
  if (site.resourceKind) return site.resourceKind;
  if (site.category === "🏛️ 学术机构") return "institution";
  if (site.category === "🛠️ 学术工具") return "tool";
  if (["🧱 古文字数据库", "🪨 石刻资源"].includes(site.category) || ["nwnu-jiandu","ihp-woodslip","guanlian-hanqing"].includes(site.id)) return "database";
  return "website";
}
function isWebsiteResource(site) { return ["website", "database", "platform"].includes(resourceKind(site)); }
function isOverseasResource(site) { return overseasResourceIds.has(site.id); }
function resourceDirections(site) {
  const values = new Set(resourceDirectionLinks[site.id] || []);
  const names = { "甲骨文":"甲骨", "金文":"金文", "石刻":"石刻", "帛书":"帛书", "🏺 汉代简牍":"简牍" };
  for (const tag of [site.category, ...(site.resourceCategories || [])]) if (names[tag]) values.add(names[tag]);
  if (site.category === "🪨 石刻资源") values.add("石刻");
  if (site.category === "🤖 AI & 数字人文" || ["数字人文研究","数据库建设成果","数字整理方法","研究项目"].some(tag => (site.researchTags || []).includes(tag))) values.add("数字人文");
  return [...values];
}
function matchesResourceBase(site) {
  if (site.commonOnly) return false;
  if (activeResourceType === "全部") return true;
  if (activeResourceType === "🧱 古文字数据库") return resourceKind(site) === "database";
  if (activeResourceType === "📚 学术期刊") return isPeriodical(site);
  if (activeResourceType === "🏛️ 学术机构") return resourceKind(site) === "institution";
  if (activeResourceType === "🛠️ 学术工具") return resourceKind(site) === "tool";
  if (activeResourceType === "🌏 海外汉学") return isOverseasResource(site);
  return false;
}
function directlyMatchesDirection(site) { return Boolean(activeDirectionTag) && resourceDirections(site).includes(activeDirectionTag); }
function matchesResourceDirection(site) { return !activeDirectionTag || directlyMatchesDirection(site); }
function renderSilkResourceStructure(resourceSites) {
  const notes = {
    "核心材料": "核心材料入口将随经核验的馆藏与出版资料补充。",
    "数据库与检索": "现有跨材料词汇与全文检索入口见下方。",
    "整理与出版": "整理与出版入口将随经核验的正式项目补充。",
    "最新研究动态": "见上方“帛书 · 最新学术动态”。"
  };
  genreStructure.hidden = activeResourceCategory !== "帛书";
  if (genreStructure.hidden) {
    genreStructure.innerHTML = "";
    return;
  }
  genreStructure.innerHTML = silkResourceGroups.map(group => {
    const groupSites = resourceSites.filter(site => site.resourceGroup === group);
    const content = groupSites.length
      ? `<div class="genre-group-cards">${groupSites.map(siteCardTemplate).join("")}</div>`
      : `<p class="genre-group-note">${notes[group]}</p>`;
    return `<section class="genre-resource-group"><h3>${group}</h3>${content}</section>`;
  }).join("");
}
function renderSites() {
  // 折叠只限制当前视图，搜索索引始终使用完整 sites。
  const paged = isDisciplineView();
  const categoryResources = activeCategory === "全部" ? resolveHubReferences(homepageFeaturedIds, hubResourcesById, "resource") : (isHanView() ? hanResources() : sites.filter(site => !site.commonOnly && (site.resourceCategories || []).includes(activeCategory)))
    .filter(isWebsiteResource)
    .sort((a, b) => Number(Boolean(b.priority)) - Number(Boolean(a.priority)) || (isHanView() ? Number(isPeriodical(a)) - Number(isPeriodical(b)) : 0));
  const featured = categoryResources.slice(0, 4);
  const count = Math.min(resourceVisibleCounts[disciplineResourceKey()] || 4, categoryResources.length);
  coreGrid.classList.toggle("featured-grid", true);
  coreGrid.classList.toggle("core-grid", true);
  coreGrid.classList.toggle("site-grid", false);
  coreGrid.innerHTML = (paged ? categoryResources.slice(0, count) : featured).map(coreCardTemplate).join("");
  document.querySelector("#core-title").textContent = activeCategory === "全部" ? "精选学术资源" : "学术资源";
  document.querySelector("#core-kicker").textContent = activeCategory === "全部" ? "FEATURED ACADEMIC RESOURCES" : "ACADEMIC RESOURCES";
  const coreStatus = document.querySelector("#coreResourceStatus");
  renderPagedControls(coreResourcesMore, coreResourcesCollapse, coreStatus, count, categoryResources.length, 4, "资源");
  coreStatus.hidden = !paged || count >= categoryResources.length;
  if (!paged) { coreResourcesMore.hidden = true; coreResourcesCollapse.hidden = true; }
  const matches = sites.filter(matchesResourceBase).filter(matchesResourceDirection);
  const periodicals = activeResourceType === "📚 学术期刊";
  siteGrid.classList.toggle("periodical-grid", periodicals);
  const directoryCount = Math.min(resourceVisibleCounts.directory, matches.length);
  siteGrid.innerHTML = matches.slice(0, directoryCount).map(periodicals ? periodicalCardTemplate : siteCardTemplate).join("");
  renderPagedControls(directoryResourcesMore, directoryResourcesCollapse, document.querySelector("#directoryResourceStatus"), directoryCount, matches.length, 12, "资源");
  genreStructure.hidden = true;
  genreStructure.innerHTML = "";
  resourceFilterStatus.hidden = !activeDirectionTag;
  resourceFilterStatus.classList.toggle("is-empty", Boolean(activeDirectionTag) && matches.length === 0);
  resourceFilterLabel.textContent = activeDirectionTag ? "当前筛选：" + activeDirectionTag : "";
  resourceFilterSummary.textContent = activeDirectionTag ? "· 匹配 " + matches.length + " 条" : "";
  clearResourceFilter.hidden = !activeDirectionTag;
  emptyState.hidden = matches.length !== 0;
  document.querySelector("#genreEmpty").hidden = true;
  document.querySelector("#resources-title").textContent = activeResourceType === "全部" ? (activeDirectionTag === "数字人文" ? "数字人文" : "学术资源") : resourceTypeLabels[activeResourceType];
  document.querySelector("#resourcesSection .section-kicker").textContent = isDigitalResearchView() ? "DIGITAL HUMANITIES · RESEARCH RESOURCES" : periodicals ? "ACADEMIC PERIODICALS" : activeResourceType === "🏛️ 学术机构" ? "ACADEMIC INSTITUTIONS" : activeResourceType === "🛠️ 学术工具" ? "ACADEMIC TOOLS" : "ACADEMIC WEBSITES & DATABASES";
  renderClassicPapers();
  renderDisciplineLiterature();
  applyCategoryVisibility();
}
function applyCategoryVisibility() {
  // 复用已有节点，阅读顺序与键盘顺序一致。
  const main = document.querySelector("main");
  const ordered = [updatesSection, topicsSection, coreSection, literatureSection];
  ordered.forEach(section => main.insertBefore?.(section, navigationOverview));
  searchBrowseSections().forEach(section => { section.hidden = true; });
  if (activeHubId) { hubDetail.hidden = false; return; }
  if (activeModule) {
    moduleHeader.hidden = false;
    ({ resources:resourcesSection, bibliography:bibliographySection, papers:papersSection, wechat:wechatPanel, guide:guideSection })[activeModule].hidden = false;
    if (activeModule === "resources") document.querySelector(".filters").hidden = false;
    if (isDigitalResearchView()) papersSection.hidden = false;
    renderModuleBackLabel();
    return;
  }
  updatesSection.hidden = false;
  topicsSection.hidden = isDisciplineView() && hubsForCategory(activeCategory).length === 0;
  coreSection.hidden = coreGrid.childElementCount === 0;
  navigationOverview.hidden = false;
  literatureSection.hidden = !isDisciplineView() || disciplineLiterature().length === 0;
}
function renderModuleBackLabel() {
  moduleBack.textContent = moduleReturnContext?.fromSearch ? "← 返回搜索结果" : moduleReturnContext?.category && moduleReturnContext.category !== "全部" ? "← 返回当前门类" : "← 返回首页";
}
function activateCategory(category) {
  if (category !== "全部" && !heroGenreViews.has(category)) return;
  if (searchSession) exitUnifiedSearch(false);
  dismissResearchHub();
  activeModule = "";
  moduleReturnContext = null;
  activeCategory = category;
  activeResourceCategory = resourceGenres.includes(category) ? category : "全部";
  activeUpdateType = "全部";
  activeUpdateView = "latest";
  topicSelectionActive = false;
  updatesExpanded = false;
  if (isDisciplineView()) resourceVisibleCounts[disciplineResourceKey()] = 4;
  literatureVisibleCount = 4;
  papersVisibleCount = isHanView() ? 3 : paperPageSize;
  bibliographyExpanded = false;
  renderUpdateFilters(); renderResearchTopics(); renderUpdateView();
  renderUpdates(); renderSites(); renderBibliography(); renderClassicPapers(); renderFilters();
}
function setResourceType(category) {
  if (activeModule !== "resources" || !categories.includes(category)) return;
  activeResourceType = category;
  resourceVisibleCounts.directory = 12;
  papersVisibleCount = paperPageSize;
  renderFilters();
  renderSites();
  categoryFeedback.textContent = "资源类型：" + resourceTypeLabels[category] + "，" + siteGrid.childElementCount + " 项";
}
function openContentModule(name, options = {}) {
  if (!["resources", "bibliography", "papers", "wechat", "guide"].includes(name)) return;
  const requestedResourceType = options.resourceType || "全部";
  const preset = name === "resources" && categories.includes(requestedResourceType);
  moduleReturnContext = { module:activeModule, previous:moduleReturnContext, category:activeCategory, hubId:activeHubId, scrollY:window.scrollY, fromSearch:Boolean(searchSession), trigger:name, triggerSelector:options.triggerSelector, resourceCounts:{...resourceVisibleCounts}, papersVisibleCount, bibliographyExpanded, resourcePreset:preset ? { type:activeResourceType, direction:activeDirectionTag } : null };
  if (preset) { activeResourceType = requestedResourceType; activeDirectionTag = directionTags.includes(options.direction) ? options.direction : ""; renderDirectionTags(); }
  activeModule = name;
  if (name === "resources") { resourceVisibleCounts.directory = 12; papersVisibleCount = paperPageSize; }
  if (name === "papers") papersVisibleCount = paperPageSize;
  activeHubId = "";
  searchResults.hidden = true;
  renderSites(); renderBibliography(); renderClassicPapers(); renderWechatPanel(); renderFilters();
  applyCategoryVisibility();
  requestAnimationFrame(() => {
    moduleBack.focus({ preventScroll:true });
    window.scrollTo({ top:Math.max(0,moduleHeader.getBoundingClientRect().top + window.scrollY - 16), behavior:"instant" });
  });
}
function returnFromContentModule() {
  const context = moduleReturnContext;
  if (!context) return;
  activeModule = context.module;
  activeHubId = context.hubId;
  moduleReturnContext = context.previous;
  resourceVisibleCounts = {...context.resourceCounts};
  papersVisibleCount = context.papersVisibleCount;
  bibliographyExpanded = context.bibliographyExpanded;
  if (context.resourcePreset) { activeResourceType = context.resourcePreset.type; activeDirectionTag = context.resourcePreset.direction; renderFilters(); renderDirectionTags(); }
  if (context.fromSearch && searchSession) {
    searchBrowseSections().forEach(section => { section.hidden = true; });
    renderUnifiedSearch();
  } else {
    renderSites(); renderBibliography(); renderClassicPapers(); renderWechatPanel();
  }
  requestAnimationFrame(() => {
    const trigger = context.fromSearch ? searchResults.querySelector("[data-search-wechat]") : navigationOverview.querySelector(context.triggerSelector || '[data-module="' + context.trigger + '"]');
    trigger?.focus({ preventScroll:true });
    window.scrollTo({ top:context.scrollY, behavior:"instant" });
  });
}
function renderNavigationOverview() {
  // 与完整目录口径一致：commonOnly 为内部操作入口，不作为独立资源展示。
  // 各类记录按稳定 ID 去重；不同类型分别计数，不按名称或 URL 猜测合并。
  const countRecords = records => new Set(Array.from(records, record => record.id).filter(Boolean)).size;
  const displayCount = (selector, count) => { document.querySelector(selector).textContent = `已收录 ${count} 条`; };
  const resources = sites.filter(site => !site.commonOnly);
  displayCount("#resourceModuleCount", countRecords(resources));
  displayCount("#bookModuleCount", countRecords(coreBibliographyData));
  displayCount("#periodicalModuleCount", countRecords(resources.filter(isPeriodical)));
  const digitalItems = resources.filter(site => resourceDirections(site).includes("数字人文"));
  const digitalPapers = digitalHumanitiesPapers();
  const digitalCount = countRecords(digitalItems) + countRecords(digitalPapers);
  displayCount("#digitalHumanitiesModuleCount", digitalCount);
  document.querySelector("[data-open-digital-humanities]").disabled = digitalCount === 0;
  displayCount("#paperModuleCount", countRecords(classicPaperCatalog.papers));
  displayCount("#wechatModuleCount", countRecords(wechatPanel.querySelectorAll(".wechat-card")));
}
// 全站检索：白名单字段建立一次运行时索引，原始内容仍由各数据源维护。
const searchTypeLabels = { hub:"研究专题", resource:"学术资源", bibliography:"研究书目", paper:"学术论文", update:"学术动态" };
const searchGroupLimit = 4;
const searchFields = new WeakMap();
const searchResults = document.querySelector("#unifiedSearchResults");
let searchSession = null;
let searchQuery = "";
let searchExpandedGroups = new Set();
let searchResultScroll = 0;
let searchFrame = 0;
let searchComposing = false;

function searchStrings(value) { return Array.isArray(value) ? value.filter(item => typeof item === "string") : []; }
function normalizeSearch(value) {
  return String(value ?? "").normalize("NFKC").toLowerCase()
    .replace(/./gu, char => window.searchTaxonomy.characters[char] || char)
    .replace(/[\p{P}\p{S}\s]/gu, "");
}
function searchCategoryCode(value) {
  if (typeof value !== "string") return "";
  const term = normalizeSearch(value);
  return Object.keys(window.searchTaxonomy.categories).find(code => code === value ||
    window.searchTaxonomy.categories[code].aliases.some(alias => normalizeSearch(alias) === term)) || "";
}
function buildSearchCatalog(sources = { resource:sites, hub:researchHubsData, bibliography:coreBibliographyData, paper:window.classicPapers || [], update:academicUpdatesData }) {
  const maps = {}, warnings = [], references = new Map(), relatedResources = new Map();
  const warn = message => { if (!warnings.includes(message)) warnings.push(message); };
  for (const type of Object.keys(searchTypeLabels)) {
    maps[type] = new Map();
    if (!Array.isArray(sources[type])) { warn(`${type}: 数据必须为数组`); continue; }
    if (type === "paper" && !arguments.length) {
      // 默认数据已经过原有论文校验：复用有效集合，不重复报告同一问题。
      const validIds = new Set(classicPaperCatalog.papers.map(paper => paper.id));
      for (const item of sources.paper) if (item && validIds.has(item.id) && !maps.paper.has(item.id)) maps.paper.set(item.id, item);
      continue;
    }
    for (const item of sources[type]) {
      if (!item || typeof item.id !== "string" || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(item.id)) { warn(`${type}: 缺少合法稳定 id`); continue; }
      if (maps[type].has(item.id)) { warn(`${type}: 重复 id ${item.id}`); continue; }
      const title = type === "resource" ? item.name : item.title;
      if (typeof title !== "string" || !title.trim()) { warn(`${type}:${item.id}: 标题为空`); continue; }
      maps[type].set(item.id, item);
    }
  }
  // 延用论文原有校验；索引仍引用原始对象，不将内部字段序列化进检索文本。
  const papers = arguments.length ? validateClassicPapers([...maps.paper.values()], maps.hub) : classicPaperCatalog;
  if (arguments.length) papers.warnings.forEach(message => warn(`paper: ${message}`));
  const validPaperIds = new Set(papers.papers.map(item => item.id));
  for (const id of maps.paper.keys()) if (!validPaperIds.has(id)) maps.paper.delete(id);
  const arrayField = (item, field, type, optional = false) => {
    if (optional && item[field] === undefined) return [];
    if (!Array.isArray(item[field]) || item[field].some(value => typeof value !== "string" || !value.trim())) warn(`${type}:${item.id}: ${field} 必须为字符串数组`);
    return searchStrings(item[field]).filter(value => value.trim());
  };
  const resolve = (item, field, target, type) => [...new Set(arrayField(item, field, type))].flatMap(id => {
    if (maps[target].has(id) && !(target === type && id === item.id)) return [maps[target].get(id)];
    warn(`${type}:${item.id}: ${field} 无效引用 ${id}`); return [];
  });
  for (const hub of maps.hub.values()) {
    if (!searchCategoryCode(hub.category)) warn(`hub:${hub.id}: category 不合法`);
    if (hub.categories !== undefined) arrayField(hub, "categories", "hub").forEach(code => { if (!searchCategoryCode(code)) warn(`hub:${hub.id}: categories 不合法 ${code}`); });
    arrayField(hub, "updateTags", "hub");
    references.set(hub.id, {
      resources:resolve(hub, "resourceIds", "resource", "hub"),
      books:resolve(hub, "bibliographyIds", "bibliography", "hub"),
      hubs:resolve(hub, "relatedHubIds", "hub", "hub")
    });
  }
  for (const type of ["bibliography", "paper"]) for (const item of maps[type].values()) {
    const codes = arrayField(item, "categories", type);
    if (!codes.length || codes.some(code => !searchCategoryCode(code))) warn(`${type}:${item.id}: categories 不合法`);
  }
  const names = new Map(), urls = new Map();
  for (const site of maps.resource.values()) {
    const name = normalizeSearch(site.name);
    if (!names.has(name)) names.set(name, []);
    names.get(name).push(site);
    if (site.url && site.url !== "TODO") {
      try {
        const url = new URL(site.url); url.hash = "";
        const key = url.href.replace(/\/$/, "");
        if (!urls.has(key)) urls.set(key, []);
        urls.get(key).push(site);
      } catch { warn(`resource:${site.id}: URL 不合法`); }
    }
  }
  for (const list of names.values()) if (list.length > 1) warn(`resource: 名称疑似重复 ${list.map(item => item.id).join(", ")}`);
  for (const list of urls.values()) if (list.length > 1) warn(`resource: URL shared by ${list.map(item => item.id).join(", ")}`);
  function resolveResource(value) {
    if (maps.resource.has(value)) return maps.resource.get(value);
    // 历史名称精确匹配；同名歧义不猜测、不自动合并。
    const matches = [...maps.resource.values()].filter(site => site.name === value);
    return matches.length === 1 ? matches[0] : null;
  }
  for (const update of maps.update.values()) {
    arrayField(update, "tags", "update");
    arrayField(update, "topics", "update", true);
    const resolved = arrayField(update, "relatedResources", "update", true).flatMap(value => {
      const site = resolveResource(value);
      if (site) return [site];
      warn(`update:${update.id}: relatedResources 无效或歧义 ${value}`); return [];
    });
    relatedResources.set(update.id, [...new Map(resolved.map(site => [site.id, site])).values()]);
  }
  const entries = [];
  for (const type of Object.keys(searchTypeLabels)) for (const source of maps[type].values()) {
    if (type === "hub" && !availableHub(source)) continue;
    if (type === "update" && source.example) continue;
    const title = type === "resource" ? source.name : source.title;
    let titleOther = [], people = [], tags = [], body = [], codes = [];
    if (type === "hub") {
      titleOther = [source.subtitle]; tags = searchStrings(source.updateTags); body = [source.description];
      codes = [source.category, ...searchStrings(source.categories)];
    } else if (type === "resource") {
      titleOther = [source.englishName, source.subtitle]; people = [source.institution];
      tags = [resourceBadge(source), ...resourceDirections(source), isOverseasResource(source) ? "海外资源" : "", ...searchStrings(source.keywords), ...searchStrings(source.researchTags), ...searchStrings(source.resourceTags)];
      body = [source.description, source.fitFor]; codes = [source.category, ...searchStrings(source.resourceCategories)];
      for (const hub of maps.hub.values()) if (references.get(hub.id)?.resources.includes(source)) codes.push(hub.category);
    } else if (type === "bibliography") {
      const volumes = Array.isArray(source.volumes) ? source.volumes : [];
      titleOther = volumes.map(volume => volume.title);
      people = [source.author, ...volumes.map(volume => volume.author)];
      tags = [source.type, source.publisher, source.year, source.isbn, ...searchStrings(source.useFor), ...volumes.flatMap(volume => [volume.publisher, volume.year, volume.isbn])];
      body = [source.note]; codes = searchStrings(source.categories);
    } else if (type === "paper") {
      people = [source.author]; tags = [source.type, source.journal, source.year, source.doi, ...searchStrings(source.researchDirections)]; body = [source.note]; codes = searchStrings(source.categories);
      for (const id of [source.publicationId, ...searchStrings(source.resourceIds)]) {
        const resource = maps.resource.get(id);
        if (resource) tags.push(resource.name);
      }
      for (const id of searchStrings(source.updateIds)) {
        const update = maps.update.get(id);
        if (update) tags.push(update.title);
      }
      for (const id of searchStrings(source.hubIds)) {
        const hub = maps.hub.get(id);
        if (hub) tags.push(hub.title, ...(window.searchTaxonomy.objects[id] || []));
      }
    } else {
      people = [source.source]; tags = [source.type, ...searchStrings(source.tags), ...searchStrings(source.topics)]; body = [source.summary];
      codes = [source.category, ...searchStrings(source.categories)];
      for (const hub of maps.hub.values()) if (searchStrings(hub.updateTags).some(tag => [...searchStrings(source.tags), ...searchStrings(source.topics)].includes(tag))) codes.push(hub.category);
      for (const tag of tags) {
        const code = searchCategoryCode(tag);
        if (code) codes.push(code);
        // 仅使用明确的材料标签，不从标题、摘要或机构名称推断门类。
        if (/汉简|漢簡|简牍|簡牘|清华简|清華簡/.test(tag)) codes.push("slips");
      }
    }
    const categories = [...new Set(codes.map(searchCategoryCode).filter(Boolean))];
    if (!categories.length) categories.push("general");
    const aliases = [...searchStrings(source.aliases)];
    const objectText = [title, ...tags].map(normalizeSearch);
    for (const [hubId, terms] of Object.entries(window.searchTaxonomy.objects)) {
      if ((type === "hub" && source.id === hubId) || objectText.some(text => terms.some(term => text.includes(normalizeSearch(term))))) aliases.push(...terms);
    }
    // 门类别名是完整词匹配，绝不将“简”在查询字符串中全局替换。
    for (const code of categories) aliases.push(...window.searchTaxonomy.categories[code].aliases);
    tags.push(...categories.map(code => hubCategoryLabels[code]));
    const fields = {
      title:normalizeSearch(title), titles:titleOther.filter(Boolean).map(normalizeSearch),
      aliases:[...new Set(aliases.map(normalizeSearch))], people:people.filter(Boolean).map(normalizeSearch),
      tags:tags.filter(Boolean).map(normalizeSearch), body:body.filter(Boolean).map(normalizeSearch)
    };
    const entry = { type, id:source.id, title, searchableText:[fields.title, ...fields.titles, ...fields.aliases, ...fields.people, ...fields.tags, ...fields.body].join(" "), categories, source };
    searchFields.set(entry, fields); entries.push(entry);
  }
  return { entries, maps, warnings, references, relatedResources, resolveResource };
}
const unifiedSearchCatalog = buildSearchCatalog();
unifiedSearchCatalog.warnings.forEach(message => console.warn(`Search data: ${message}`));

function searchUnified(query, catalog = unifiedSearchCatalog) {
  const term = normalizeSearch(query);
  if (!term) return [];
  const hits = new Map();
  catalog.entries.forEach((entry, order) => {
    const fields = searchFields.get(entry);
    let rank = 0;
    if (fields.title === term || fields.titles.includes(term)) rank = 6;
    else if ([fields.title, ...fields.titles].some(text => text.includes(term))) rank = 5;
    else if (fields.aliases.includes(term)) rank = 4;
    else if (fields.people.some(text => text.includes(term))) rank = 3;
    else if (fields.tags.some(text => text.includes(term))) rank = 2;
    else if (fields.body.some(text => text.includes(term))) rank = 1;
    if (!rank) return;
    const key = `${entry.type}:${entry.id}`;
    const previous = hits.get(key);
    if (!previous || rank > previous.rank) hits.set(key, { entry, rank, order });
  });
  return [...hits.values()].sort((a, b) => b.rank - a.rank || a.order - b.order).map(hit => hit.entry);
}
function searchCardTemplate(entry) {
  const item = entry.source;
  const meta = `<div class="search-result-meta"><span>${searchTypeLabels[entry.type]}</span>${entry.categories.map(code => `<span>${hubCategoryLabels[code]}</span>`).join("")}</div>`;
  let card;
  if (entry.type === "hub") card = hubCardTemplate(item);
  else if (entry.type === "bibliography") card = bibliographyCardTemplate(item);
  else if (entry.type === "paper") card = classicPaperCardTemplate(item);
  else if (entry.type === "update") card = updateCardTemplate({ ...item, tags:searchStrings(item.tags) });
  else if (item.commonAction === "wechat") card = `<article class="site-card"><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.description)}</p><button type="button" class="search-action" data-search-wechat>展开学术公众号</button></article>`;
  else card = renderSiteCard(item, "");
  return `<div class="search-result" data-search-type="${entry.type}" data-search-id="${escapeHtml(entry.id)}">${meta}${card}</div>`;
}
function renderUnifiedSearch() {
  const items = searchUnified(searchQuery);
  const groups = Object.entries(searchTypeLabels).map(([type, label]) => {
    const group = items.filter(item => item.type === type);
    if (!group.length) return "";
    const expanded = searchExpandedGroups.has(type);
    return `<section class="search-result-group" aria-labelledby="search-group-${type}"><h3 id="search-group-${type}">${label} <span>（${group.length}）</span></h3><div class="search-result-grid">${(expanded ? group : group.slice(0, searchGroupLimit)).map(searchCardTemplate).join("")}</div>${group.length > searchGroupLimit ? `<button type="button" class="section-toggle" data-search-expand="${type}" aria-expanded="${expanded}">${expanded ? "收起" : `展开更多（${group.length}）`}</button>` : ""}</section>`;
  }).join("");
  searchResults.innerHTML = `<div class="search-results-heading"><div><p class="section-kicker">全站学术检索</p><h2 id="unifiedSearchTitle">搜索：“${escapeHtml(searchQuery)}”</h2><p role="status" aria-live="polite">找到 ${items.length} 项相关内容</p></div><button class="search-action" type="button" data-search-exit>退出搜索 · 返回原位置</button></div>${groups || `<div class="search-empty"><p>未找到与“${escapeHtml(searchQuery)}”相关的内容。</p><p>尝试使用研究对象、材料名称、作者或机构名称搜索。</p></div>`}`;
  searchResults.hidden = false;
}
function searchBrowseSections() { return [updatesSection, topicsSection, coreSection, literatureSection, navigationOverview, wechatPanel, resourcesSection, bibliographySection, papersSection, guideSection, moduleHeader, hubDetail, document.querySelector(".filters")]; }
function captureSearchContext() {
  return {
    activeCategory, activeResourceCategory, activeResourceType, activeModule, moduleReturnContext, activeDirectionTag, activeUpdateType, activeUpdateView,
    updatesExpanded, researchTagsExpanded, sitesExpanded, coreExpanded, topicSelectionActive, updateSearchIgnored, wechatExpanded,
    resourceVisibleCounts:{...resourceVisibleCounts}, papersVisibleCount, literatureVisibleCount,
    bibliographyExpanded, hubsExpanded, activeHubId, hubReturnContext:hubReturnContext ? { ...hubReturnContext } : null,
    hubExpandedSections:new Set(hubExpandedSections), scrollY:window.scrollY,
    hidden:searchBrowseSections().map(section => section.hidden),
    hubHTML:hubDetail.innerHTML, homeHidden:returnHomeButton.hidden
  };
}
function updateUnifiedSearch() {
  const query = searchInput.value.trim();
  if (!query) { exitUnifiedSearch(); return; }
  // 搜索期间改词、进入结果专题及返回均不能覆盖首次浏览快照。
  if (!searchSession) searchSession = captureSearchContext();
  cancelAnimationFrame(hubNavigationFrame);
  cancelAnimationFrame(searchFrame);
  if (query !== searchQuery) searchExpandedGroups.clear();
  searchQuery = query;
  searchBrowseSections().forEach(section => { section.hidden = true; });
  returnHomeButton.hidden = true;
  renderUnifiedSearch();
}
function exitUnifiedSearch(restoreScroll = true) {
  if (!searchSession) { searchInput.value = ""; return; }
  const original = searchSession;
  cancelAnimationFrame(hubNavigationFrame);
  cancelAnimationFrame(searchFrame);
  ({ activeCategory, activeResourceCategory, activeResourceType, activeModule, moduleReturnContext, activeDirectionTag, activeUpdateType, activeUpdateView,
    updatesExpanded, researchTagsExpanded, sitesExpanded, coreExpanded, topicSelectionActive, updateSearchIgnored, wechatExpanded,
    bibliographyExpanded, hubsExpanded, activeHubId, hubReturnContext } = original);
  hubExpandedSections = new Set(original.hubExpandedSections);
  resourceVisibleCounts = {...original.resourceVisibleCounts};
  papersVisibleCount = original.papersVisibleCount;
  literatureVisibleCount = original.literatureVisibleCount;
  hubDetail.innerHTML = original.hubHTML;
  searchBrowseSections().forEach((section, index) => { section.hidden = original.hidden[index]; });
  returnHomeButton.hidden = original.homeHidden;
  renderModuleBackLabel();
  // 内部公众号操作可能临时更新了共用容器。
  renderWechatPanel();
  searchResults.hidden = true;
  searchResults.innerHTML = "";
  searchSession = null; searchQuery = ""; searchExpandedGroups.clear(); searchInput.value = "";
  searchInput.focus({ preventScroll:true });
  if (restoreScroll) searchFrame = requestAnimationFrame(() => window.scrollTo({ top:original.scrollY, behavior:"instant" }));
}
let searchResultHubId = "";
function openSearchHub(id) {
  if (!searchSession) return;
  if (!hubsById.has(id) || !availableHub(hubsById.get(id))) { hubWarning(`hub: 无法打开 ${id}`); return; }
  searchResultScroll = window.scrollY;
  searchResultHubId = id;
  searchResults.hidden = true;
  openResearchHub(id);
}
function returnToSearchResults() {
  if (!searchSession) return;
  cancelAnimationFrame(hubNavigationFrame);
  cancelAnimationFrame(searchFrame);
  searchBrowseSections().forEach(section => { section.hidden = true; });
  renderUnifiedSearch();
  searchFrame = requestAnimationFrame(() => {
    [...searchResults.querySelectorAll('[data-research-topic]')].find(button => button.dataset.researchTopic === searchResultHubId)?.focus({ preventScroll:true });
    window.scrollTo({ top:searchResultScroll, behavior:"instant" });
  });
}
searchResults.addEventListener("click", event => {
  if (event.target.closest("[data-search-exit]")) { exitUnifiedSearch(); return; }
  const hub = event.target.closest("[data-research-topic]");
  if (hub) { openSearchHub(hub.dataset.researchTopic); return; }
  if (event.target.closest("[data-search-wechat]")) {
    openContentModule("wechat");
    return;
  }
  const toggle = event.target.closest("[data-search-expand]");
  if (!toggle) return;
  const type = toggle.dataset.searchExpand;
  const sectionTop = toggle.closest(".search-result-group").getBoundingClientRect().top + window.scrollY;
  if (searchExpandedGroups.has(type)) searchExpandedGroups.delete(type); else searchExpandedGroups.add(type);
  renderUnifiedSearch();
  searchResults.querySelector(`[data-search-expand="${type}"]`)?.focus({ preventScroll:true });
  if (!searchExpandedGroups.has(type) && window.scrollY > sectionTop) window.scrollTo({ top:sectionTop - 16, behavior:"instant" });
});

filters.addEventListener("click", event => { const button = event.target.closest("[data-category]"); if (!button) return; setResourceType(button.dataset.category); });
returnHomeButton.addEventListener("click", () => {
  if (searchSession) exitUnifiedSearch(false);
  searchInput.value = "";
  updateSearchIgnored = false;
  updatesExpanded = false;
  researchTagsExpanded = false;
  sitesExpanded = false;
  activateCategory("全部");
  document.querySelector(".brand")?.focus({ preventScroll:true });
});
document.querySelector(".seal-line").addEventListener("click", event => {
  const button = event.target.closest("[data-genre]");
  if (!button) return;
  // Explicit genre navigation starts from that genre's complete resource view.
  if (searchSession) exitUnifiedSearch(false);
  searchInput.value = "";
  updateSearchIgnored = false;
  activeDirectionTag = "";
  renderDirectionTags();
  activateCategory(button.dataset.genre);
  button.focus({ preventScroll:true });
});
tagsContainer.addEventListener("click", event => { const button = event.target.closest("[data-direction]"); if (!button) return; activeDirectionTag = activeDirectionTag === button.dataset.direction ? "" : button.dataset.direction; resourceVisibleCounts.directory = 12; papersVisibleCount = paperPageSize; renderDirectionTags(); renderSites(); });
clearResourceFilter.addEventListener("click", () => { activeDirectionTag = ""; resourceVisibleCounts.directory = 12; renderDirectionTags(); renderSites(); tagsContainer.querySelector("[data-direction]")?.focus(); });
updateFilters.addEventListener("click", event => { const button = event.target.closest("[data-update-type]"); if (!button) return; activeUpdateType = button.dataset.updateType; topicSelectionActive = false; renderUpdateFilters(); renderUpdates(); });
researchTopicsContainer.addEventListener("click", event => {
  const button = event.target.closest("[data-research-topic]");
  if (!button) return;
  openResearchHub(button.dataset.researchTopic);
});
hubDetail.addEventListener("click", event => {
  if (event.target.closest("[data-hub-back]")) { dismissResearchHub(true); return; }
  const related = event.target.closest("[data-research-topic]");
  if (related) { openResearchHub(related.dataset.researchTopic); return; }
  const toggle = event.target.closest("[data-hub-expand]");
  if (!toggle) return;
  const key = toggle.dataset.hubExpand;
  const sectionTop = toggle.closest(".hub-section").getBoundingClientRect().top + window.scrollY;
  if (hubExpandedSections.has(key)) hubExpandedSections.delete(key); else hubExpandedSections.add(key);
  renderHubDetail();
  hubDetail.querySelector(`[data-hub-expand="${key}"]`)?.focus({ preventScroll: true });
  if (!hubExpandedSections.has(key) && window.scrollY > sectionTop) window.scrollTo({ top: sectionTop - 16, behavior: "instant" });
});
backToTopics.addEventListener("click", () => { topicsSection.scrollIntoView({ block:"start", behavior:"instant" }); });
document.querySelector("#resetUpdateView").addEventListener("click", () => {
  activeUpdateType = "全部";
  topicSelectionActive = false;
  updatesExpanded = false;
  activeUpdateView = "latest";
  updateSearchIgnored = true;
  renderUpdateFilters();
  renderResearchTopics();
  renderUpdateView();
  renderUpdates();
  updateFilters.querySelector("[data-update-type='全部']")?.focus({ preventScroll: true });
});
clearUpdateFilters.addEventListener("click", () => {
  activeUpdateType = "全部";
  updatesExpanded = false;
  topicSelectionActive = false;
  renderUpdateFilters();
  renderResearchTopics();
  renderUpdates();
  if (activeCategory === "🎓 学术会议") {
    activeCategory = "全部";
    categoryFeedback.textContent = "栏目导航：已清除学术会议筛选。";
    renderFilters();
    renderSites();
  }
  updateFilters.querySelector("[data-update-type='全部']")?.focus();
});
updatesToggle.addEventListener("click", () => { updatesExpanded = !updatesExpanded; renderUpdates(); });
researchTagsToggle.addEventListener("click", () => { researchTagsExpanded = !researchTagsExpanded; renderDirectionTags(); });
navigationOverview.addEventListener("click", event => {
  if (event.target.closest("[data-open-digital-humanities]")) { openContentModule("resources", { resourceType:"全部", direction:"数字人文", triggerSelector:"[data-open-digital-humanities]" }); return; }
  if (event.target.closest("[data-open-periodicals]")) { openContentModule("resources", { resourceType:"📚 学术期刊", triggerSelector:"[data-open-periodicals]" }); return; }
  const button = event.target.closest("[data-module]"); if (button) openContentModule(button.dataset.module);
});
moduleBack.addEventListener("click", returnFromContentModule);
searchInput.addEventListener("compositionstart", () => { searchComposing = true; });
searchInput.addEventListener("compositionend", () => { searchComposing = false; updateUnifiedSearch(); });
searchInput.addEventListener("input", () => { if (!searchComposing) updateUnifiedSearch(); });
searchInput.addEventListener("keydown", event => { if (event.key === "Escape" && !searchComposing) { event.preventDefault(); exitUnifiedSearch(); } });
document.querySelector("#clearSearch").addEventListener("click", () => { exitUnifiedSearch(); searchInput.focus({ preventScroll:true }); });
validateAcademicUpdates();
if (linksLastCheckedElement) linksLastCheckedElement.textContent = linksLastChecked;
renderFilters(); renderDirectionTags(); renderUpdateFilters(); renderResearchTopics(); renderUpdateView(); renderLatestUpdateDate(); renderWechatPanel(); renderNavigationOverview(); renderUpdates(); renderSites(); renderBibliography();
