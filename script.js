// 所有资源都集中在这一份数组中。核心资源以 core: true 标记，避免重复创建同一个网站。
const sites = [
  { name:"简牍学术资源数据共享平台", institution:"西北师范大学", category:"🏺 汉代简牍", core:true, priority:true, description:"面向简牍研究的数字资源平台，提供实物、释文、字形、著录、文献与专家等资源，涵盖居延汉简、居延新简、悬泉汉简、敦煌汉简、玉门关汉简、地湾汉简、武威汉简、额济纳汉简等。", fitFor:"实物、释文、字形、著录、文献、专家信息的综合检索。", keywords:["汉代简牍","居延汉简","悬泉汉简","敦煌汉简","释文","字形","著录","实物","图版","检索","学者"], researchTags:["居延汉简","居延新简","悬泉汉简","敦煌汉简","玉门关汉简","武威汉简","张家山汉简","五一广场东汉简","走马楼西汉简","汉代简牍文字","释文","字形","著录","图版","实物","检索","学者","数字人文"], url:"https://jiandu.nwnu.edu.cn/", buttonLabel:"进入资源平台 ↗" },
  { name:"简帛网", institution:"武汉大学简帛研究中心", category:"🏺 汉代简牍", core:true, priority:true, description:"武汉大学简帛研究中心主办的简帛学术网站，适合跟踪简帛研读、研究札记、学术动态以及汉简等出土文献研究成果。", fitFor:"简帛研究动态、研究文章、汉简资料、学术交流和最新研究成果。", keywords:["简帛","汉简","简牍","研读","研究札记","学术动态","论文","检索"], researchTags:["居延汉简","敦煌汉简","肩水金关","张家山汉简","五一广场东汉简","走马楼西汉简","银雀山汉简","汉代简牍文字","论文","检索","数字人文"], url:"https://www.bsm.org.cn/", buttonLabel:"进入简帛网 ↗" },
  { name:"简牍字典", subtitle:"史语所藏居延汉简资料库", institution:"中央研究院历史语言研究所", category:"🏺 汉代简牍", core:true, description:"以居延汉简为核心的数字资料库，可检索简号、释文、时代、遗址等信息，并提供简牍图像与字形相关资料。", fitFor:"居延汉简的简号、释文、字形、图像与遗址信息查询。", keywords:["居延汉简","简牍字典","字形","释文","简号","遗址","图像","图版","检索","出土地"], researchTags:["居延汉简","居延新简","肩水金关","汉代简牍文字","释文","字形","图版","检索","出土地"], url:"https://wcd-ihp.ascdc.sinica.edu.tw/woodslip/", buttonLabel:"查询简牍字典 ↗" },
  { name:"贯联汗青", subtitle:"简牍缀合信息库", institution:"复旦大学出土文献与古文字研究中心", category:"🏺 汉代简牍", core:true, description:"专门整合简牍缀合信息的数据库，目前公布西北汉简缀合信息，适合进行简牍缀合资料查询与研究。", fitFor:"西北汉简缀合记录、释文、缀合者与简号的对照查询。", keywords:["简牍缀合","西北汉简","释文","缀合者","简号","检索","著录"], researchTags:["居延汉简","居延新简","悬泉汉简","敦煌汉简","玉门关汉简","肩水金关","释文","缀合","著录","检索"], url:"https://www.fdgwz.org.cn/guanlianhanqing/Home", buttonLabel:"查询缀合信息 ↗" },
  { name:"小學堂文字學資料庫", institution:"中央研究院历史语言研究所", category:"🧱 古文字数据库", description:"中央研究院历史语言研究所建设的汉字字形与文字学研究资料库。", keywords:["汉字","字形","文字学","资料库"], url:"https://xiaoxue.iis.sinica.edu.tw/" },
  { name:"殷墟甲骨文数据库", institution:"浙江师范大学等", category:"🧱 古文字数据库", description:"汇集殷墟甲骨文字资料与相关研究信息的数据库入口。", keywords:["甲骨文","殷墟","卜辞","商代"], url:"https://obid.ancientbooks.cn/" },
  { name:"清华大学出土文献研究与保护中心", institution:"清华大学", category:"📜 出土文献", description:"清华大学出土文献研究、整理、保护及学术交流的重要平台。", keywords:["清华简","出土文献","战国","简帛"], url:"https://www.ctwx.tsinghua.edu.cn/" },
  { name:"武汉大学简帛研究中心", institution:"武汉大学", category:"🏛️ 学术机构", description:"武汉大学开展简帛、古文字与出土文献研究的重要学术机构。", keywords:["武汉大学","简帛","楚简","古文字"], url:"https://www.bsm.org.cn/" },
  { name:"中国知网", institution:"中国知网", category:"📚 学术期刊", description:"检索中文期刊、学位论文、会议论文等学术文献的综合平台。", keywords:["期刊","论文","学位论文","中文文献"], url:"https://cnki.net/" },
  { name:"中国考古网", institution:"中国社会科学院考古研究所", category:"🏛️ 学术机构", description:"中国社会科学院考古研究所主办的考古资讯与学术资源平台。", keywords:["考古","田野","遗址","出土材料"], url:"https://kaogu.cssn.cn/" },
  { name:"中国社会科学网", institution:"中国社会科学网", category:"📚 学术期刊", description:"社会科学研究动态、学术成果与资讯发布平台。", keywords:["社科","历史","学术资讯","论文"], url:"https://www.cssn.cn/" },
  { name:"Google Scholar", institution:"Google", category:"🌏 海外汉学", description:"覆盖多语种学术文献的通用检索工具，适合追踪引文与海外研究。", keywords:["英文论文","引文","检索","海外"], url:"https://scholar.google.com/" },
  { name:"JSTOR", institution:"ITHAKA", category:"📚 学术期刊", description:"人文社会科学期刊与图书的数字学术档案平台。", keywords:["期刊","人文","考古","海外文献"], url:"https://www.jstor.org/" },
  { name:"CiNii Research", institution:"日本国立信息学研究所", category:"🌏 海外汉学", description:"日本学术信息检索平台，可查找日本汉学与东亚研究成果。", keywords:["日本","汉学","东亚","论文"], url:"https://cir.nii.ac.jp/" },
  { name:"Brill", institution:"Brill", category:"🌏 海外汉学", description:"以人文与亚洲研究见长的国际学术出版平台。", keywords:["出版","汉学","亚洲研究","期刊"], url:"https://brill.com/" },
  { name:"Zotero", institution:"Corporation for Digital Scholarship", category:"🛠️ 学术工具", description:"免费开源的文献管理工具，可整理条目、笔记、引文和参考文献。", keywords:["文献管理","引文","笔记","开源"], url:"https://www.zotero.org/" },
  { name:"中国哲学书电子化计划", englishName:"Chinese Text Project", institution:"Chinese Text Project", category:"🛠️ 学术工具", displayCategory:"古典文献 / 学术工具", description:"开放的中国古典文献电子图书馆，适合查阅先秦两汉传世文献、原典文本与相关资料。", keywords:["CTEXT","Chinese Text Project","先秦","两汉","古籍","传世文献","原典","哲学","历史"], url:"https://ctext.org/pre-qin-and-han/zh" },
  { name:"汉典", institution:"汉典", category:"🛠️ 学术工具", displayCategory:"字典 / 学术工具", description:"综合汉字与词语检索平台，可查询字义、部首、字形以及《说文解字》《康熙字典》等资料。", keywords:["汉字","说文解字","康熙字典","字义","部首","字典"], url:"https://zdic.net/" },
  { name:"字统网", englishName:"zi.tools", institution:"zi.tools", category:"🧱 古文字数据库", displayCategory:"古文字数据库 / 学术工具", description:"面向汉字源、形、音、义和 Unicode 的综合检索网站，支持字形、结构检字与古汉字相关查询。", keywords:["zi.tools","字源","字形","Unicode","古文字","结构检字","汉字"], url:"https://zi.tools/" },
  { name:"OpenAlex", institution:"OurResearch", category:"🤖 AI & 数字人文", description:"开放的全球学术知识图谱，适合发现研究机构、作者与关联文献。", keywords:["开放数据","知识图谱","文献","引文"], url:"https://openalex.org/" },
  { name:"Semantic Scholar", institution:"Allen Institute for AI", category:"🤖 AI & 数字人文", description:"利用人工智能辅助发现论文、作者、引文脉络与研究主题。", keywords:["AI","论文检索","引文","英文文献"], url:"https://www.semanticscholar.org/" },
  { name:"学术公众号", institution:"微信内学术资讯入口", category:"学术资讯", commonOnly:true, commonAction:"wechat", description:"古文字微刊、出土文献、简牍学等学术公众号入口。", keywords:["公众号","古文字","出土文献","简牍"] }
];

const categories = ["全部","🏺 汉代简牍","🧱 古文字数据库","📜 出土文献","📚 学术期刊","🎓 学术会议","🏛️ 学术机构","🌏 海外汉学","🤖 AI & 数字人文","🛠️ 学术工具"];
const directionTags = ["居延汉简","居延新简","悬泉汉简","敦煌汉简","玉门关汉简","肩水金关","武威汉简","尹湾汉简","银雀山汉简","张家山汉简","五一广场东汉简","走马楼西汉简","汉代简牍文字","释文","字形","缀合","著录","图版","实物","检索","学者","论文","出土地","数字人文"];
const updateTypes = ["全部","新论文","新书","新资料","学术会议","学术讲座","研究动态","数据库更新"];
const updateObjects = ["全部简牍","居延汉简","悬泉汉简","敦煌汉简","肩水金关","武威汉简","张家山汉简","五一广场东汉简","走马楼西汉简","秦汉简牍文字","汉代简牍文字"];
const commonNames = ["小學堂文字學資料庫","中国知网","学术公众号","中国哲学书电子化计划","汉典","字统网"];
let activeCategory = "全部";
let activeResourceCategory = "全部";
let activeDirectionTag = "";
let activeUpdateType = "全部";
let activeUpdateObject = "全部简牍";
const siteGrid = document.querySelector("#siteGrid");
const coreGrid = document.querySelector("#coreGrid");
const commonSites = document.querySelector("#commonSites");
const filters = document.querySelector("#categoryFilters");
const tagsContainer = document.querySelector("#researchTags");
const searchInput = document.querySelector("#searchInput");
const emptyState = document.querySelector("#emptyState");
const coreSection = document.querySelector("#coreSection");
const coreEmpty = document.querySelector("#coreEmpty");
const resultCount = document.querySelector("#resultCount");
const resourceFilterStatus = document.querySelector("#resourceFilterStatus");
const resourceFilterLabel = document.querySelector("#resourceFilterLabel");
const resourceFilterSummary = document.querySelector("#resourceFilterSummary");
const clearResourceFilter = document.querySelector("#clearResourceFilter");
const updatesGrid = document.querySelector("#updatesGrid");
const researchTopicsContainer = document.querySelector("#researchTopics");
const updateFilters = document.querySelector("#updateFilters");
const updateObjectFilters = document.querySelector("#updateObjectFilters");
const updateEmpty = document.querySelector("#updateEmpty");
const latestUpdateDateElement = document.querySelector("#latestUpdateDate");
const linksLastCheckedElement = document.querySelector("#linksLastChecked");
const updatesToggle = document.querySelector("#updatesToggle");
const researchTagsToggle = document.querySelector("#researchTagsToggle");
const sitesToggle = document.querySelector("#sitesToggle");
const categoryFeedback = document.querySelector("#categoryFeedback");
const updateFilterStatus = document.querySelector("#updateFilterStatus");
const updateFilterSummary = document.querySelector("#updateFilterSummary");
const clearUpdateFilters = document.querySelector("#clearUpdateFilters");
const backToTopics = document.querySelector("#backToTopics");
const updateViewTabs = document.querySelector("#updateViewTabs");
const latestUpdatesView = document.querySelector("#latestUpdatesView");
const topicsView = document.querySelector("#topicsView");
const updatesSection = document.querySelector(".updates-section");
const commonSection = document.querySelector("#commonSection");
const resourcesSection = document.querySelector("#resourcesSection");
const wechatPanel = document.querySelector("#wechatPanel");
const wechatCollapse = document.querySelector("#wechatCollapse");
let updatesExpanded = false;
let researchTagsExpanded = false;
let sitesExpanded = false;
let activeUpdateView = "latest";
let topicSelectionActive = false;
let wechatExpanded = false;
const defaultResearchTags = ["释文", "字形", "缀合", "著录", "图版", "实物", "检索", "学者", "论文", "数字人文"];
const researchObjectTags = new Set(["居延汉简","居延新简","悬泉汉简","敦煌汉简","玉门关汉简","肩水金关","武威汉简","尹湾汉简","银雀山汉简","张家山汉简","五一广场东汉简","走马楼西汉简","汉代简牍文字"]);
const isTodo = site => site.url === "TODO";
const academicUpdatesData = Array.isArray(window.academicUpdates) ? window.academicUpdates : (typeof academicUpdates !== "undefined" && Array.isArray(academicUpdates) ? academicUpdates : []);
const academicUpdatesLastUpdatedValue = typeof window.academicUpdatesLastUpdated === "string" && window.academicUpdatesLastUpdated.trim() ? window.academicUpdatesLastUpdated.trim() : (typeof academicUpdatesLastUpdated !== "undefined" && String(academicUpdatesLastUpdated).trim() ? String(academicUpdatesLastUpdated).trim() : "");
// 外部资源链接最近一次人工核验日期，与学术动态数据维护日期分开记录。
const linksLastChecked = "2026-08-20";
const researchTopicsData = Array.isArray(window.researchTopics) ? window.researchTopics : [];

// 统一处理文本，保证日后新增资料时特殊字符不会影响卡片结构。
function escapeHtml(text) { return String(text || "").replace(/[&<>'"]/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#039;", '"':"&quot;" })[char]); }
function linkTemplate(site) { return isTodo(site) ? `<span class="visit-button is-todo">网址待补</span>` : `<a class="visit-button" href="${site.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(site.buttonLabel || "访问网站 ↗")}</a>`; }
function keywordsTemplate(site) { return `<div class="keywords" aria-label="关键词">${site.keywords.map(word => `<span class="keyword">${escapeHtml(word)}</span>`).join("")}</div>`; }
function coreCardTemplate(site, matchesDirection = false) { const matchText = researchObjectTags.has(activeDirectionTag) ? "匹配当前研究对象" : "匹配当前用途"; return `<article class="core-card ${site.priority ? "priority-core" : ""} ${matchesDirection ? "matches-direction" : ""}"><div class="core-meta">${matchesDirection ? `<span class="match-label">${matchText}</span>` : site.priority ? `<span class="priority-label">优先入口</span>` : `<span class="core-label">综合核心资源</span>`}<span class="category-badge">${escapeHtml(site.category)}</span></div><p class="institution">${escapeHtml(site.institution)}</p><h3>${escapeHtml(site.name)}</h3>${site.subtitle ? `<p class="core-subtitle">${escapeHtml(site.subtitle)}</p>` : ""}<p class="description">${escapeHtml(site.description)}</p><p class="fit-for"><strong>适合：</strong>${escapeHtml(site.fitFor)}</p>${keywordsTemplate(site)}${linkTemplate(site)}</article>`; }
function siteCardTemplate(site) { return `<article class="site-card"><span class="category-badge">${escapeHtml(site.displayCategory || site.category)}</span><h3>${escapeHtml(site.name)}</h3>${site.englishName ? `<p class="core-subtitle">${escapeHtml(site.englishName)}</p>` : ""}${site.institution ? `<p class="institution">${escapeHtml(site.institution)}</p>` : ""}<p class="description">${escapeHtml(site.description)}</p>${keywordsTemplate(site)}${linkTemplate(site)}</article>`; }
function renderFilters() { filters.innerHTML = categories.map(category => `<button class="filter-button ${category === activeCategory ? "is-active" : ""}" type="button" data-category="${category}" aria-current="${category === activeCategory ? "true" : "false"}">${category}</button>`).join(""); }
function renderDirectionTags() {
  const visibleTags = researchTagsExpanded ? directionTags : defaultResearchTags;
  tagsContainer.innerHTML = visibleTags.map(tag => `<button class="research-tag ${tag === activeDirectionTag ? "is-active" : ""}" type="button" data-direction="${tag}">${tag}</button>`).join("");
  researchTagsToggle.textContent = researchTagsExpanded ? "收起" : "更多研究方向";
  researchTagsToggle.setAttribute("aria-expanded", String(researchTagsExpanded));
}
function renderUpdateFilters() { updateFilters.innerHTML = updateTypes.map(type => `<button class="update-filter ${type === activeUpdateType ? "is-active" : ""}" type="button" data-update-type="${type}">${type}</button>`).join(""); }
function renderUpdateObjectFilters() { updateObjectFilters.innerHTML = updateObjects.map(object => `<button class="update-object-filter ${object === activeUpdateObject ? "is-active" : ""}" type="button" data-update-object="${object}">${object}</button>`).join(""); }
function renderUpdateView() {
  const showingLatest = activeUpdateView === "latest";
  latestUpdatesView.hidden = !showingLatest;
  topicsView.hidden = showingLatest;
  updateViewTabs.querySelectorAll("[data-update-view]").forEach(button => {
    const isActive = button.dataset.updateView === activeUpdateView;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}
function updateMatchesTopic(update, topic) {
  const updateTopics = Array.isArray(update.topics) ? update.topics : [];
  const updateTags = Array.isArray(update.tags) ? update.tags : [];
  return topic.topics.some(item => updateTopics.includes(item) || updateTags.includes(item));
}
function renderResearchTopics() {
  researchTopicsContainer.innerHTML = researchTopicsData.filter(topic => topic.featured !== false).map(topic => {
    const count = academicUpdatesData.filter(update => updateMatchesTopic(update, topic)).length;
    const isActive = topic.topics.includes(activeUpdateObject);
    return `<article class="research-topic-card ${isActive ? "is-active" : ""}"><span class="topic-label">专题</span><h3>${escapeHtml(topic.title)}</h3><p class="topic-subtitle">${escapeHtml(topic.subtitle || "")}</p><p class="topic-description">${escapeHtml(topic.description || "")}</p><p class="topic-count">当前收录 ${count} 条研究动态</p><button class="topic-button" type="button" data-research-topic="${escapeHtml(topic.id)}">查看专题 →</button></article>`;
  }).join("");
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
    .map(update => parseUpdateDate(update.date))
    .filter(Boolean)
    .sort();
  const lastUpdated = academicUpdatesLastUpdatedValue || "暂无记录";
  const latestEvent = eventDates.length ? eventDates[eventDates.length - 1] : "暂无记录";
  latestUpdateDateElement.textContent = `数据更新：${lastUpdated} · 最近事件：${latestEvent}`;
}
function renderCommonSites() { commonSites.innerHTML = sites.filter(site => commonNames.includes(site.name)).map(site => { const isWechat = site.commonAction === "wechat"; const content = `<span>${escapeHtml(site.displayCategory || site.category)}</span><h3>${escapeHtml(site.name)} <small>${isWechat ? (wechatExpanded ? "↑" : "↓") : "↗"}</small></h3>${site.englishName ? `<p>${escapeHtml(site.englishName)}</p>` : ""}`; return isWechat ? `<button class="common-card common-action" type="button" data-common-action="wechat" aria-expanded="${wechatExpanded}">${content}</button>` : isTodo(site) ? `<div class="common-card">${content}</div>` : `<a class="common-card" href="${site.url}" target="_blank" rel="noopener noreferrer">${content}</a>`; }).join(""); }
function renderWechatPanel() {
  wechatPanel.hidden = !wechatExpanded;
  renderCommonSites();
}
function updateCardTemplate(update) {
  const link = update.sourceUrl ? `<a class="update-link" href="${update.sourceUrl}" target="_blank" rel="noopener noreferrer">查看原文 ↗</a>` : `<span class="update-link is-disabled">示例数据 · 暂无原文</span>`;
  const objects = update.tags.filter(tag => updateObjects.includes(tag));
  const objectTags = objects.length ? `<div class="update-object-list">${objects.map(object => `<span>${escapeHtml(object)}</span>`).join("")}</div>` : "";
  const historyLabel = update.historical === true ? `<span class="historical-label">历史补录</span>` : "";
  return `<article class="update-card"><div class="update-top"><span class="update-type">${escapeHtml(update.type)}</span><span class="update-labels">${historyLabel}${update.example ? `<span class="example-label">示例数据</span>` : ""}</span></div><h3>${escapeHtml(update.title)}</h3><p class="update-meta">来源：${escapeHtml(update.source)}<br>时间：${escapeHtml(update.date)}</p>${objectTags}<p class="update-summary">${escapeHtml(update.summary)}</p>${link}</article>`;
}
function renderUpdates() {
  const query = searchInput.value.trim().toLowerCase();
  const filteredUpdates = academicUpdatesData.filter(update => {
    const typeMatches = activeUpdateType === "全部" || update.type === activeUpdateType;
    const objectMatches = activeUpdateObject === "全部简牍" || (Array.isArray(update.tags) && update.tags.includes(activeUpdateObject)) || (Array.isArray(update.topics) && update.topics.includes(activeUpdateObject));
    const searchable = [update.title, update.type, update.source, update.summary, ...(update.tags || []), ...(update.topics || [])].join(" ").toLowerCase();
    return typeMatches && objectMatches && searchable.includes(query);
  });
  const hasExplicitFilter = activeUpdateType !== "全部" || activeUpdateObject !== "全部简牍";
  const updates = (updatesExpanded || hasExplicitFilter || query)
    ? filteredUpdates
    : filteredUpdates.slice().sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || parseUpdateDate(b.date).localeCompare(parseUpdateDate(a.date))).slice(0, 6);
  updatesGrid.innerHTML = updates.map(updateCardTemplate).join("");
  updateEmpty.hidden = filteredUpdates.length !== 0;
  updatesToggle.hidden = filteredUpdates.length <= 6 || hasExplicitFilter || Boolean(query);
  updatesToggle.textContent = updatesExpanded ? "收起动态" : `查看全部动态（${filteredUpdates.length}）`;
  updatesToggle.setAttribute("aria-expanded", String(updatesExpanded));
  updateFilterStatus.hidden = !hasExplicitFilter;
  updateFilterSummary.textContent = `${activeUpdateObject} · ${activeUpdateType === "全部" ? "全部类型" : activeUpdateType} · 共 ${filteredUpdates.length} 条`;
  backToTopics.hidden = !topicSelectionActive;
  updatesSection.classList.toggle("has-active-filter", hasExplicitFilter);
}

function siteSearchText(site) {
  return [site.name,site.englishName,site.subtitle,site.institution,site.description,site.category,site.displayCategory,...(site.keywords || []),...(site.researchTags || [])].join(" ").toLowerCase();
}
function matchesResourceBase(site) {
  const query = searchInput.value.trim().toLowerCase();
  const categoryMatches = activeResourceCategory === "全部" || site.category === activeResourceCategory;
  return !site.commonOnly && categoryMatches && siteSearchText(site).includes(query);
}
function directlyMatchesDirection(site) {
  return Boolean(activeDirectionTag) && Array.isArray(site.researchTags) && site.researchTags.includes(activeDirectionTag);
}
function renderSites() {
  const baseMatching = sites.filter(matchesResourceBase);
  const core = baseMatching.filter(site => site.core).sort((left, right) => Number(directlyMatchesDirection(right)) - Number(directlyMatchesDirection(left)));
  const allOrdinary = baseMatching.filter(site => !site.core && (!activeDirectionTag || siteSearchText(site).includes(activeDirectionTag.toLowerCase())));
  const hasResourceFilter = searchInput.value.trim() || activeResourceCategory !== "全部" || activeDirectionTag;
  const ordinary = (sitesExpanded || hasResourceFilter) ? allOrdinary : allOrdinary.slice(0, 6);
  coreGrid.innerHTML = core.map(site => coreCardTemplate(site, directlyMatchesDirection(site))).join("");
  const hasDirectCoreMatch = core.some(directlyMatchesDirection);
  coreEmpty.hidden = !activeDirectionTag || core.length === 0;
  coreEmpty.textContent = hasDirectCoreMatch
    ? `已优先显示与“${activeDirectionTag}”直接匹配的核心资源，其余综合资源仍保留。`
    : researchObjectTags.has(activeDirectionTag)
      ? `暂未收录“${activeDirectionTag}”的专门核心资源，以下为仍可使用的综合简牍资源。`
      : `暂无与“${activeDirectionTag}”完全对应的核心资源，以下综合资源仍可继续使用。`;
  siteGrid.innerHTML = ordinary.map(siteCardTemplate).join("");
  sitesToggle.hidden = allOrdinary.length <= 6 || Boolean(hasResourceFilter);
  sitesToggle.textContent = sitesExpanded ? "收起资源" : `展开全部资源（${allOrdinary.length}）`;
  sitesToggle.setAttribute("aria-expanded", String(sitesExpanded));
  resourceFilterStatus.hidden = !activeDirectionTag;
  resourceFilterStatus.classList.toggle("is-empty", Boolean(activeDirectionTag) && allOrdinary.length === 0);
  resourceFilterLabel.textContent = activeDirectionTag ? `当前筛选：${activeDirectionTag}` : "";
  resourceFilterSummary.textContent = activeDirectionTag
    ? allOrdinary.length
      ? `· 匹配 ${allOrdinary.length} 条`
      : `暂无符合“${activeDirectionTag}”的其他学术资源。`
    : "";
  clearResourceFilter.hidden = !activeDirectionTag || allOrdinary.length !== 0;
  emptyState.hidden = Boolean(activeDirectionTag) || ordinary.length !== 0 || core.length !== 0;
  // 分别显示普通资源数量与全页匹配数，避免把上方核心卡片误认为底部资源缺失。
  resultCount.textContent = `其他资源 ${ordinary.length} 个 · 当前可见 ${ordinary.length + core.length} 个`;
  applyCategoryVisibility(core.length > 0);
}
function applyCategoryVisibility(hasCoreResources = coreGrid.childElementCount > 0) {
  const resourceCategoryActive = !["全部", "🏺 汉代简牍", "🎓 学术会议"].includes(activeCategory);
  updatesSection.hidden = resourceCategoryActive;
  coreSection.hidden = activeCategory === "🎓 学术会议" || resourceCategoryActive || !hasCoreResources;
  commonSection.hidden = activeCategory !== "全部";
  resourcesSection.hidden = activeCategory === "🏺 汉代简牍" || activeCategory === "🎓 学术会议";
}
function activateCategory(category) {
  activeCategory = category;
  const resourceCategories = new Set(["🧱 古文字数据库","📜 出土文献","📚 学术期刊","🏛️ 学术机构","🌏 海外汉学","🤖 AI & 数字人文","🛠️ 学术工具"]);
  if (resourceCategories.has(category)) {
    activeResourceCategory = category;
    activeDirectionTag = "";
    renderDirectionTags();
    renderSites();
    categoryFeedback.textContent = `当前栏目：${category.replace(/^\S+\s*/, "")} · 内容已在下方原地切换`;
  } else if (category === "🎓 学术会议") {
    activeResourceCategory = "全部";
    activeUpdateType = "学术会议";
    activeUpdateObject = "全部简牍";
    updatesExpanded = true;
    activeUpdateView = "latest";
    topicSelectionActive = false;
    renderUpdateFilters();
    renderUpdateObjectFilters();
    renderResearchTopics();
    renderUpdateView();
    renderUpdates();
    renderSites();
    categoryFeedback.textContent = "当前栏目：学术会议 · 动态内容已在下方原地切换";
  } else if (category === "🏺 汉代简牍") {
    activeResourceCategory = "全部";
    activeUpdateType = "全部";
    activeUpdateObject = "全部简牍";
    updatesExpanded = false;
    activeUpdateView = "latest";
    topicSelectionActive = false;
    renderUpdateFilters();
    renderUpdateObjectFilters();
    renderResearchTopics();
    renderUpdateView();
    renderUpdates();
    renderSites();
    categoryFeedback.textContent = "当前栏目：汉代简牍 · 最新动态与核心资源已在下方显示";
  } else {
    activeResourceCategory = "全部";
    activeDirectionTag = "";
    activeUpdateType = "全部";
    activeUpdateObject = "全部简牍";
    updatesExpanded = false;
    activeUpdateView = "latest";
    topicSelectionActive = false;
    wechatExpanded = false;
    renderDirectionTags();
    renderUpdateFilters();
    renderUpdateObjectFilters();
    renderResearchTopics();
    renderUpdateView();
    renderWechatPanel();
    renderUpdates();
    renderSites();
    categoryFeedback.textContent = "栏目导航：已返回主要资源总览。";
  }
  renderFilters();
}
filters.addEventListener("click", event => { const button = event.target.closest("[data-category]"); if (!button) return; activateCategory(button.dataset.category); });
tagsContainer.addEventListener("click", event => { const button = event.target.closest("[data-direction]"); if (!button) return; activeDirectionTag = activeDirectionTag === button.dataset.direction ? "" : button.dataset.direction; renderDirectionTags(); renderSites(); });
clearResourceFilter.addEventListener("click", () => { activeDirectionTag = ""; renderDirectionTags(); renderSites(); tagsContainer.querySelector("[data-direction]")?.focus(); });
updateViewTabs.addEventListener("click", event => {
  const button = event.target.closest("[data-update-view]");
  if (!button) return;
  activeUpdateView = button.dataset.updateView;
  renderUpdateView();
});
updateFilters.addEventListener("click", event => { const button = event.target.closest("[data-update-type]"); if (!button) return; activeUpdateType = button.dataset.updateType; topicSelectionActive = false; renderUpdateFilters(); renderUpdates(); });
updateObjectFilters.addEventListener("click", event => { const button = event.target.closest("[data-update-object]"); if (!button) return; activeUpdateObject = button.dataset.updateObject; topicSelectionActive = false; updatesExpanded = activeUpdateObject !== "全部简牍" || updatesExpanded; renderUpdateObjectFilters(); renderResearchTopics(); renderUpdates(); });
researchTopicsContainer.addEventListener("click", event => {
  const button = event.target.closest("[data-research-topic]");
  if (!button) return;
  const topic = researchTopicsData.find(item => item.id === button.dataset.researchTopic);
  if (!topic || !topic.topics.length) return;
  activeUpdateType = "全部";
  activeUpdateObject = topic.topics[0];
  updatesExpanded = true;
  topicSelectionActive = true;
  activeUpdateView = "latest";
  renderUpdateFilters();
  renderUpdateObjectFilters();
  renderResearchTopics();
  renderUpdateView();
  renderUpdates();
});
backToTopics.addEventListener("click", () => { activeUpdateView = "topics"; renderUpdateView(); });
clearUpdateFilters.addEventListener("click", () => {
  activeUpdateType = "全部";
  activeUpdateObject = "全部简牍";
  updatesExpanded = false;
  topicSelectionActive = false;
  renderUpdateFilters();
  renderUpdateObjectFilters();
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
sitesToggle.addEventListener("click", () => { sitesExpanded = !sitesExpanded; renderSites(); });
commonSites.addEventListener("click", event => { const button = event.target.closest("[data-common-action='wechat']"); if (!button) return; wechatExpanded = !wechatExpanded; renderWechatPanel(); });
wechatCollapse.addEventListener("click", () => { wechatExpanded = false; renderWechatPanel(); commonSites.querySelector("[data-common-action='wechat']")?.focus(); });
searchInput.addEventListener("input", () => { if (searchInput.value.trim()) { activeCategory = "全部"; activeResourceCategory = "全部"; activeUpdateView = "latest"; topicSelectionActive = false; renderFilters(); renderUpdateView(); } renderSites(); renderUpdates(); });
document.querySelector("#clearSearch").addEventListener("click", () => { searchInput.value = ""; activeDirectionTag = ""; renderDirectionTags(); searchInput.focus(); renderSites(); renderUpdates(); });
validateAcademicUpdates();
if (linksLastCheckedElement) linksLastCheckedElement.textContent = linksLastChecked;
renderFilters(); renderDirectionTags(); renderUpdateFilters(); renderUpdateObjectFilters(); renderResearchTopics(); renderUpdateView(); renderLatestUpdateDate(); renderWechatPanel(); renderUpdates(); renderSites();
