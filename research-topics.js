/* 旧接口兼容层：内容只维护在 data/research-hubs.js。
 * 保留旧专题 ID、topics 字段及旧接口的四个 featured 入口。
 * 新前台使用 researchHubs；此文件不保存第二份专题内容。
 */
window.researchTopics = [
  "xuanquan-hanjian", "zhangjiashan-hanjian",
  "zoumalou-western-han-slips", "wuyi-eastern-han-slips"
].map(id => (window.researchHubs || []).find(hub => hub.id === id))
  .filter(Boolean)
  .map(hub => ({
    id: hub.id, title: hub.title, subtitle: hub.subtitle, description: hub.description,
    topics: [...hub.updateTags], featured: true
  }));
