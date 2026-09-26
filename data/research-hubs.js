/*
 * 研究专题唯一内容源。资源与书目只存持久 ID，不复制原始内容。
 * updateTags 只与动态 tags/topics 完整匹配；空数组表示尚无可靠关联。
 * 门类：oracle、bronze、stone、slips、silk。preparing 专题仍可访问。
 */
window.researchHubs = [
  {
    id: "zhangjiashan-hanjian", title: "张家山汉简专题", subtitle: "Zhangjiashan Han Slips",
    category: "slips", description: "聚合张家山汉简的文本、法律、文字与思想研究。",
    resourceIds: ["nwnu-jiandu", "bsm"], bibliographyIds: ["zhangjiashan-hanmu-zhujian-247"],
    updateTags: ["张家山汉简"], relatedHubIds: ["zoumalou-western-han-slips", "wuyi-eastern-han-slips"],
    featured: true, status: "active"
  },
  {
    id: "qinghua-slips", title: "清华简", category: "slips",
    description: "汇集本站已收录的清华简研究入口与相关学术动态。",
    resourceIds: ["tsinghua-ctwx"], bibliographyIds: [], updateTags: ["清华简"], relatedHubIds: [],
    featured: true, status: "active"
  },
  {
    id: "yinxu-oracle", title: "殷墟甲骨", category: "oracle",
    description: "汇集本站已收录的殷墟甲骨数据库与基础资料集。",
    resourceIds: ["yinxu-oracle-database", "xiaoxue-oracle"], bibliographyIds: ["jiaguwen-heji"],
    updateTags: [], relatedHubIds: [], featured: true, status: "active"
  },
  {
    id: "western-zhou-bronze", title: "西周金文", category: "bronze",
    description: "汇集可用于西周金文查考的既有数据库与基础资料集。",
    resourceIds: ["xiaoxue-bronze", "ihp-bronze"],
    bibliographyIds: ["yinzhou-jinwen-jicheng", "shangzhou-qingtongqi-mingwen-tuxiang-jicheng"],
    updateTags: [], relatedHubIds: [], featured: true, status: "active"
  },
  {
    id: "mawangdui-silk", title: "马王堆帛书", category: "silk",
    description: "专题整理中，待补充经核验的资源、书目与相关学术动态。",
    resourceIds: [], bibliographyIds: [], updateTags: [], relatedHubIds: [],
    featured: false, status: "preparing"
  },
  {
    id: "xuanquan-hanjian", title: "悬泉汉简专题", subtitle: "Xuanquan Han Slips",
    category: "slips", description: "聚合悬泉置汉简的释读、字形、行政文书与相关研究。",
    resourceIds: ["nwnu-jiandu", "guanlian-hanqing"], bibliographyIds: ["xuanquan-hanjian-yi"],
    updateTags: ["悬泉汉简"], relatedHubIds: [], featured: false, status: "active"
  },
  {
    id: "zoumalou-western-han-slips", title: "走马楼西汉简专题", subtitle: "Zoumalou Western Han Slips",
    category: "slips", description: "聚合走马楼西汉简的行政、司法、制度与地方治理研究。",
    resourceIds: ["nwnu-jiandu", "bsm"], bibliographyIds: [], updateTags: ["走马楼西汉简"],
    relatedHubIds: ["zhangjiashan-hanjian", "wuyi-eastern-han-slips"], featured: false, status: "active"
  },
  {
    id: "wuyi-eastern-han-slips", title: "五一广场东汉简专题", subtitle: "Wuyi Square Eastern Han Slips",
    category: "slips", description: "聚合五一广场东汉简的整理出版、行政文书与东汉地方治理研究。",
    resourceIds: ["nwnu-jiandu", "bsm"],
    bibliographyIds: ["changsha-wuyi-guangchang-donghan-jiandu", "changsha-wuyi-guangchang-donghan-jiandu-xuanshi"],
    updateTags: ["五一广场东汉简"], relatedHubIds: ["zhangjiashan-hanjian", "zoumalou-western-han-slips"],
    featured: false, status: "active"
  }
];
