/*
 * 长期研究资料唯一数据源；人工选录，不从 academic-updates 自动迁移。
 * id 是持久引用键：补全年份、调整题名或 URL 时不重建。
 * hubIds 是唯一专题关系；general 不表示自动关联全部专题。
 * 未核验字段留空；volume / issue / pages / url 可选。
 * note 面向读者；sourceNote 仅供维护，不展示、不筛选、不排序。
 */
window.classicPapers = [
  {
    id: "linyun-xianqin-pianpang",
    title: "先秦古文字中待探索的偏旁",
    author: "林澐",
    year: "",
    journal: "",
    categories: ["general"],
    hubIds: [],
    type: "经典论文",
    note: "",
    featured: false,
    url: "",
    sourceNote: "依据本轮用户确认：《古文字读书会》材料中明确提及作者与题名。本轮未读取原 PDF；年份、刊物、卷期、页码、URL 和具体专题归属待核。"
  }
];
