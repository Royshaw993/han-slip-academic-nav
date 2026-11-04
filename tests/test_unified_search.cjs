// node --test tests/test_unified_search.cjs — no dependencies or generated files.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const plain = value => JSON.parse(JSON.stringify(value));
function load() {
  const nodes = new Map(), frames = new Map(), warnings = [];
  let frame = 0;
  const node = selector => {
    if (!nodes.has(selector)) nodes.set(selector, {
      innerHTML:'', textContent:'', value:'', hidden:false, listeners:{}, attributes:{},
      classList:{toggle(){}}, get childElementCount(){return (this.innerHTML.match(/<article/g)||[]).length;},
      addEventListener(k,v){this.listeners[k]=v;}, setAttribute(k,v){this.attributes[k]=v;},
      querySelector(){return null;},querySelectorAll(){return [];},focus(){},getBoundingClientRect(){return {top:100};}
    });
    return nodes.get(selector);
  };
  const c = vm.createContext({URL,window:{scrollY:0,scrollTo({top}){this.scrollY=top;}},
    document:{querySelector:node,querySelectorAll:()=>[]},console:{warn:m=>warnings.push(m),info(){}},
    requestAnimationFrame(fn){frames.set(++frame,fn);return frame;},cancelAnimationFrame(id){frames.delete(id);}});
  for(const file of ['academic-updates.js','data/research-hubs.js','research-topics.js','data/core-bibliography.js','data/classic-papers.js','data/search-taxonomy.js','script.js'])
    vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c,{filename:file});
  const run = code => vm.runInContext(code,c);
  return {run,node,c,warnings,flush(){for(const [id,fn] of frames){frames.delete(id);fn();}},query(q){c.query=q;return run('searchUnified(query)');},input(q){node('#searchInput').value=q;node('#searchInput').listeners.input();}};
}
const emptySources = () => ({resource:[],hub:[],bibliography:[],paper:[],update:[]});
const stoneIntakeIds = ['nlc-beitie-jinghua','shl-beitie','zju-epitaphs','ncl-stone-rubbings','pku-rare-books','shukutoku-stone-rubbings','kyoto-stone-rubbings','china-jinshi-zonglu'];
test('the eight reviewed stone resources reuse authoritative records and are searchable once',()=>{
  const app=load();
  for(const id of stoneIntakeIds){
    app.c.resourceId=id;
    const site=app.run('sites.find(s=>s.id===resourceId)');
    assert.ok(site,id);assert.equal(site.accessChecked,'2026-11-03');
    assert.ok(site.resourceCategories.includes('石刻'));
    assert.ok(site.sourceNote&&site.accessNote);
    for(const term of [site.name,...(site.aliases||[])]){
      const hits=app.query(term).filter(e=>e.type==='resource'&&e.id===id);
      assert.equal(hits.length,1,term);assert.equal(hits[0].source,site);
      assert.ok(hits[0].categories.includes('stone'));
    }
    assert.equal(app.query('石刻').filter(e=>e.type==='resource'&&e.id===id).length,1);
  }
  assert.equal(app.run('sites.filter(s=>s.id==="zju-epitaphs").length'),1);
  for(const term of ['原定候选','accessChecked','校园IP内注册','iFrameHeight'])
    assert.equal(app.query(term).filter(e=>e.type==='resource').length,0,term);
});
test('stone directory filter and content tags distinguish specialised and general resources',()=>{
  const app=load();
  app.run('openContentModule("resources");setResourceType("🪨 石刻资源")');
  assert.equal(app.run('sites.filter(matchesResourceBase).length'),13);
  assert.equal((app.node('#siteGrid').innerHTML.match(/<article /g)||[]).length,12);
  app.node('#directoryResourcesMore').listeners.click();
  assert.equal(app.node('#siteGrid').childElementCount,13);
  assert.doesNotMatch(app.node('#siteGrid').innerHTML,/简牍学术资源数据共享平台/);
  assert.equal(app.run('sites.filter(matchesResourceBase).every(s=>s.resourceCategories.includes("石刻"))'),true);
  const general=app.run('sites.find(s=>s.id==="pku-rare-books")');
  assert.equal(general.displayCategory,'综合资源 / 古文献');
  assert.deepEqual(plain(general.resourceTags),['拓片','综合资源']);
  for(const tag of ['碑刻','墓志','拓片','释文','石刻数据库','综合资源'])
    assert.ok(app.query(tag).some(e=>e.type==='resource'&&stoneIntakeIds.includes(e.id)),tag);
  // The existing direction filter must also see verified resource-type tags.
  app.run('activeDirectionTag="石刻数据库";renderSites()');
  assert.ok(app.node('#siteGrid').innerHTML.includes('中国金石总录'));
  assert.ok(!app.node('#siteGrid').innerHTML.includes(general.name));
});
test('stone genre paginates all existing resources from the same source and restores homepage selections',()=>{
  const app=load(),home=app.node('#coreGrid').innerHTML,original=app.run('JSON.stringify(sites)');
  app.run('activateCategory("石刻")');
  const resources=app.run('sites.filter(s=>s.resourceCategories?.includes("石刻"))');
  assert.equal(resources.length,13);
  assert.equal(app.node('#coreGrid').childElementCount,4);
  app.node('#coreResourcesMore').listeners.click();assert.equal(app.node('#coreGrid').childElementCount,8);
  app.node('#coreResourcesMore').listeners.click();assert.equal(app.node('#coreGrid').childElementCount,12);
  app.node('#coreResourcesMore').listeners.click();assert.equal(app.node('#coreGrid').childElementCount,13);
  assert.equal(app.node('#core-title').textContent,'学术网站与数据库');
  for(const site of resources){
    assert.ok(app.node('#coreGrid').innerHTML.includes(`<h3>${site.name}</h3>`),site.id);
    const hit=app.query(site.name).find(e=>e.type==='resource'&&e.id===site.id);
    assert.equal(hit.source,site);
  }
  const genre=app.node('#coreGrid').innerHTML;
  app.run('openContentModule("resources");setResourceType("🪨 石刻资源");returnFromContentModule()');app.flush();
  assert.equal(app.node('#coreGrid').innerHTML,genre);
  assert.equal(app.node('#core-title').textContent,'学术网站与数据库');
  app.run('activateCategory("全部")');
  assert.equal(app.node('#coreGrid').innerHTML,home);
  assert.equal(app.node('#core-title').textContent,'精选学术资源');
  assert.equal(app.run('JSON.stringify(sites)'),original);
});
test('Han page uses precise hub, journal, book, paper and update relations without broad slips matches',()=>{
  const app=load(),original=app.run('JSON.stringify([sites,researchHubsData,coreBibliographyData,classicPaperCatalog.papers,academicUpdatesData])');
  assert.equal(app.node('#coreGrid').childElementCount,4);
  assert.equal(app.node('#coreResourcesMore').hidden,true);
  app.run('activateCategory("🏺 汉代简牍")');
  assert.deepEqual(plain(app.run('hubsForCategory(activeCategory).map(h=>h.id)')),['zhangjiashan-hanjian','xuanquan-hanjian','zoumalou-western-han-slips','wuyi-eastern-han-slips']);
  assert.equal(app.run('hanResources().length'),7);assert.equal(app.node('#coreGrid').childElementCount,4);
  assert.equal(app.node('#core-title').textContent,'学术网站与数据库');
  assert.equal(app.run('hanResources().filter(isPeriodical).length'),3);
  assert.equal(app.run('hanBooks().length'),7);assert.equal(app.node('#bibliographyGrid').childElementCount,3);
  assert.equal(app.run('hanPapers().length'),57);assert.equal(app.node('#papersGrid').childElementCount,3);
  assert.equal(app.node('#navigationOverview').hidden,false);
  assert.equal(app.node('#bibliographySection').hidden,true);assert.equal(app.node('#papersSection').hidden,true);
  assert.equal(app.node('#literatureSection').hidden,false);assert.equal(app.node('#literatureGrid').childElementCount,4);
  assert.equal(app.run('disciplineLiterature().length'),64);
  assert.doesNotMatch(app.node('#researchTopics').innerHTML,/清华简|殷墟|西周|马王堆/);
  assert.equal(app.run('hanPapers().some(p=>p.hubIds.includes("qinghua-slips"))'),false);
  assert.equal(app.run('isHanHub({category:"silk",categories:["slips"],updateTags:["张家山汉简"]})'),false);
  app.node('#coreResourcesMore').listeners.click();assert.equal(app.node('#coreGrid').childElementCount,7);
  const markup=app.node('#coreGrid').innerHTML;
  app.input('中国金石总录');app.input('');app.flush();assert.equal(app.node('#coreGrid').innerHTML,markup);
  assert.equal(app.run('resourceVisibleCounts.han'),8);
  app.node('#coreResourcesCollapse').listeners.click();assert.equal(app.node('#coreGrid').childElementCount,4);
  app.node('#literatureMore').listeners.click();assert.equal(app.node('#literatureGrid').childElementCount,8);
  app.node('#literatureCollapse').listeners.click();assert.equal(app.node('#literatureGrid').childElementCount,4);
  app.run('activateCategory("全部")');assert.equal(app.node('#coreGrid').childElementCount,4);
  assert.equal(app.node('#bibliographySection').hidden,true);assert.equal(app.node('#navigationOverview').hidden,false);
  assert.equal(app.run('JSON.stringify([sites,researchHubsData,coreBibliographyData,classicPaperCatalog.papers,academicUpdatesData])'),original);
});

test('homepage recommendations use the four ordered stable IDs without changing sources or search',()=>{
  const app=load();
  assert.deepEqual(plain(app.run('homepageFeaturedIds')),['bsm','nwnu-jiandu','xiaoxue','ihp-bronze']);
  const cards=app.node('#coreGrid').innerHTML;
  const names=app.run('homepageFeaturedIds.map(id=>hubResourcesById.get(id).name)');
  for(let i=1;i<names.length;i++)assert.ok(cards.indexOf(names[i-1])<cards.indexOf(names[i]));
  assert.equal(app.query('殷周金文暨青銅器資料庫').filter(e=>e.type==='resource'&&e.id==='ihp-bronze').length,1);
  app.run('activateCategory("🏺 汉代简牍")');
  assert.equal(app.run('hanResources().some(s=>s.id==="ihp-bronze")'),false);
});

test('discipline literature refers to formal records once, excludes general books and preserves search expansion',()=>{
  const app=load();
  for(const category of ['甲骨文','金文','石刻','🏺 汉代简牍']){
    app.c.genre=category;app.run('activateCategory(genre)');
    assert.equal(app.run('disciplineLiterature().every(({kind,item})=>kind==="paper" ? classicPaperCatalog.papers.includes(item) : coreBibliographyData.includes(item))'),true);
    assert.equal(app.run('new Set(disciplineLiterature().map(({kind,item})=>kind+":"+item.id)).size===disciplineLiterature().length'),true);
    assert.equal(app.run('disciplineLiterature().some(({kind,item})=>kind==="bibliography"&&item.categories.includes("general"))'),false);
  }
  app.run('activateCategory("🏺 汉代简牍")');app.node('#literatureMore').listeners.click();
  const markup=app.node('#literatureGrid').innerHTML;
  app.input('金文');app.input('');app.flush();
  assert.equal(app.run('literatureVisibleCount'),8);assert.equal(app.node('#literatureGrid').innerHTML,markup);
});

test('discipline updates require explicit object or category, with verified cross-discipline entries retained',()=>{
  const app=load();
  assert.equal(app.run('academicUpdatesData.filter(u=>updateMatchesGenre(u,updateGenreDefinitions["金文"])).length'),4);
  for(const expression of [
    'updateMatchesGenre({tags:["悬泉汉简","古文字"],relatedResources:["ihp-bronze"]},updateGenreDefinitions["金文"])',
    'updateMatchesGenre({tags:["金文字形以外"],categories:["general"]},updateGenreDefinitions["金文"])',
    'updateMatchesGenre({tags:["拓片"]},updateGenreDefinitions["石刻"])',
    'updateMatchesGenre({tags:["出土文献","古文字"]},updateGenreDefinitions["甲骨文"])'
  ])assert.equal(app.run(expression),false,expression);
  assert.equal(app.run('updateMatchesGenre({topics:["金文"]},updateGenreDefinitions["金文"])'),true);
  assert.equal(app.run('updateMatchesGenre({categories:["bronze"]},updateGenreDefinitions["金文"])'),true);
  assert.equal(app.run('updateMatchesGenre(academicUpdatesData.find(u=>u.id==="bsm-20260909-2d6b6d9e"),updateGenreDefinitions["金文"])'),true);
});
test('directory uses twelve-item batches and preserves expansion across unified search',()=>{
  const app=load();app.run('openContentModule("resources")');
  assert.equal(app.node('#siteGrid').childElementCount,12);
  app.run('window.scrollY=500');app.node('#directoryResourcesMore').listeners.click();
  assert.equal(app.node('#siteGrid').childElementCount,24);assert.equal(app.run('window.scrollY'),500);
  const html=app.node('#siteGrid').innerHTML;app.input('碑帖菁华');app.input('');app.flush();
  assert.equal(app.node('#siteGrid').innerHTML,html);assert.equal(app.run('resourceVisibleCounts.directory'),24);
  for(const count of [36,48,50]){app.node('#directoryResourcesMore').listeners.click();assert.equal(app.node('#siteGrid').childElementCount,count);}
  assert.equal(app.node('#directoryResourcesMore').hidden,true);
  app.node('#directoryResourcesCollapse').listeners.click();assert.equal(app.node('#siteGrid').childElementCount,12);
  assert.equal(app.run('sites.every(site=>searchUnified(site.name).some(e=>e.type==="resource"&&e.id===site.id))'),true);
});
test('resource cards show reader notes and descriptions while keeping audit evidence private',()=>{
  const app=load();
  for(const id of stoneIntakeIds){
    app.c.resourceId=id;
    const site=app.run('sites.find(s=>s.id===resourceId)');
    assert.ok(site.sourceNote&&site.accessNote&&site.accessChecked);
    const html=app.run('renderSiteCard(sites.find(s=>s.id===resourceId))');
    assert.ok(html.includes(site.description));
    assert.ok(!html.includes(site.accessNote));assert.ok(!html.includes(site.sourceNote));
    assert.doesNotMatch(html,/核验|超时|未核|待复核|2026-11-03|sourceNote|accessChecked/);
  }
  assert.match(app.run('renderSiteCard(sites.find(s=>s.id==="kyoto-stone-rubbings"))'),/旧格式阅读提示/);
  assert.match(app.run('renderSiteCard(sites.find(s=>s.id==="ihp-bronze"))'),/申请账号/);
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.ok(!html.includes('CORE RESOURCES'));assert.ok(html.includes('ACADEMIC RESOURCES'));
});
test('Jinshi uses the verified new entry and retains its original URL; missing-URL cards still hide links',()=>{
  const app=load(),entry=app.query('中国金石总录').find(e=>e.type==='resource'&&e.id==='china-jinshi-zonglu');
  assert.ok(entry);app.c.entry=entry;
  assert.equal(entry.source.url,'http://121.89.86.151:6722/home');
  assert.equal(entry.source.originalUrl,'http://www.ch5000.com.cn/');
  assert.match(entry.source.sourceNote,/http:\/\/www.ch5000.com.cn\//);
  assert.match(entry.source.sourceNote,/http:\/\/121.89.86.151:6722\/home/);
  assert.match(app.run('searchCardTemplate(entry)'),/class="visit-button"[^>]+href="http:\/\/121.89.86.151:6722\/home"[^>]+>进入数据库<\/a>/);
  app.c.entry={...entry,source:{...entry.source,url:''}};
  for(const expression of ['renderSiteCard(entry.source)','searchCardTemplate(entry)','coreCardTemplate(entry.source)']){
    const html=app.run(expression);
    assert.doesNotMatch(html,/<a\b|href=|is-disabled|undefined|TODO|网址待补/);
    assert.match(html,/中国金石总录/);
  }
  assert.doesNotMatch(app.run('searchCardTemplate(entry)'),/连接超时|核验|权限未核/);
  assert.match(app.run('renderSiteCard(sites.find(s=>s.id==="pku-rare-books"))'),/查看官方资源说明/);
  assert.equal(app.run('sites.find(s=>s.id==="zju-epitaphs").url'),'http://csid.zju.edu.cn/tomb/stone');
});
test('all authoritative entities from five sources, original references and explicit index fields',()=>{
  const app=load();
  const updateCount=app.run('academicUpdatesData.filter(item=>!item.example).length');
  assert.deepEqual(plain(app.run('Object.fromEntries(Object.keys(searchTypeLabels).map(t=>[t,unifiedSearchCatalog.entries.filter(e=>e.type===t).length]))')),
    {hub:8,resource:51,bibliography:17,paper:74,update:updateCount});
  assert.equal(app.run('new Set(unifiedSearchCatalog.entries.map(e=>e.type+":"+e.id)).size'),8+51+17+74+updateCount);
  assert.equal(app.run('unifiedSearchCatalog.entries.every(e=>e.source===unifiedSearchCatalog.maps[e.type].get(e.id))'),true);
  assert.deepEqual(plain(app.run('Object.keys(unifiedSearchCatalog.entries[0])')),['type','id','title','searchableText','categories','source']);
  assert.deepEqual(app.warnings,['Search data: resource: URL shared by bsm, wuhan-bamboo-silk-center']);
});
for(const [q,type,id] of [
  ['张家山','hub','zhangjiashan-hanjian'],['张家山','bibliography','zhangjiashan-hanmu-zhujian-247'],
  ['张家山','update','ruc-zhangjiashan-daozhi-2025'],['张家山','resource','nwnu-jiandu'],
  ['甲骨','hub','yinxu-oracle'],['金文','resource','xiaoxue-bronze'],['马王堆','hub','mawangdui-silk'],
  ['林澐','paper','linyun-xianqin-pianpang'],['西北师范大学','resource','nwnu-jiandu'],
  ['西北师范大学','update','nwnu-deepjiandu'],['长沙五一广场','hub','wuyi-eastern-han-slips'],
  ['小学堂文字学资料库','resource','xiaoxue']
]) test(`${q} finds ${type}:${id}`,()=>{
  assert.ok(load().query(q).some(e=>e.type===type&&e.id===id));
});
test('configured traditional and simplified queries have identical results',()=>{
  const app=load();
  for(const [a,b] of [['帛书','帛書'],['简牍','簡牘'],['汉简','漢簡'],['青铜器铭文','青銅器銘文'],['张家山汉简','張家山漢簡'],['五一广场','五一廣場'],['清华简','清華簡'],['出土文献研究','出土文獻研究']])
    assert.deepEqual(plain(app.query(a).map(e=>e.type+e.id)),plain(app.query(b).map(e=>e.type+e.id)),a);
  assert.equal(app.run('normalizeSearch("简历")'), '简历');
  assert.equal(app.run('searchCategoryCode("简历")'), '');
  assert.equal(app.run('searchCategoryCode("简帛")'), '');
});
test('periodicals, book editions and nested volumes remain searchable as one authoritative parent',()=>{
  const app=load();
  for(const [query,type,id] of [
    ['出土文献','resource','chutu-wenxian-journal'],
    ['出土文献研究','resource','chutu-wenxian-yanjiu'],
    ['出土文献与法律史研究','resource','chutu-wenxian-falvshi'],
    ['简牍帛书格式研究','bibliography','jiandu-boshu-geshi-yanjiu'],
    ['9787511809964','bibliography','handai-susong-zhidu-yanjiu'],
    ['长沙走马楼西汉简牍（贰）','bibliography','changsha-zoumalou-xihan-jiandu'],
    ['长沙五一广场东汉简牍（玖）','bibliography','changsha-wuyi-guangchang-donghan-jiandu']
  ])assert.equal(app.query(query).filter(entry=>entry.type===type&&entry.id===id).length,1,query);
  for(const q of ['版权年及ISBN未核','E08—E10','本轮授权正式转入书目'])assert.equal(app.query(q).length,0,q);
  assert.equal(app.run('coreBibliographyData.filter(b=>b.volumes).length'),2);
  assert.equal(app.run('coreBibliographyData.flatMap(b=>b.volumes||[]).length'),5);
});
test('bibliography cards retain verified fields and hide evidence, missing links and unknown volume metadata',()=>{
  const app=load();
  const html=app.run('coreBibliographyData.map(bibliographyCardTemplate).join("")');
  assert.equal((html.match(/查看馆藏信息/g)||[]).length,1);
  assert.equal((html.match(/<details /g)||[]).length,2);
  assert.match(html,/9787511809964/);
  assert.doesNotMatch(html,/sourceNote|本轮授权|版权年及ISBN未核|网址待补|undefined/);
  assert.doesNotMatch(app.run('bibliographyCardTemplate(coreBibliographyData.find(b=>b.id==="changsha-zoumalou-xihan-jiandu-wenzibian"))'),/<a |ISBN|2025/);
  const journals=app.run('sites.filter(s=>s.id.startsWith("chutu-wenxian")).map(s=>renderSiteCard(s)).join("")');
  assert.equal((journals.match(/查看刊物信息/g)||[]).length,3);
  assert.doesNotMatch(journals,/sourceNote|连接重置|ISBN|ISSN/);
});
test('periodical directory uses the three existing records and exact normalized carrier titles',()=>{
  const app=load();
  assert.deepEqual(plain(app.run('sites.filter(isPeriodical).map(s=>[s.id,papersForPeriodical(s).length])')), [
    ['chutu-wenxian-journal',3],['chutu-wenxian-yanjiu',6],['chutu-wenxian-falvshi',0]
  ]);
  assert.equal(app.run('sites.filter(isPeriodical).every(s=>papersForPeriodical(s).every(p=>classicPaperCatalog.papers.includes(p)))'),true);
  const ids=app.run('papersForPeriodical(sites.find(s=>s.id==="chutu-wenxian-yanjiu")).map(p=>p.id)');
  assert.ok(!ids.includes('zhaopeng-jiagu-zhuihe-yanjiu-huigu'),'a different collected volume must not match by title prefix');
  app.run('activeResourceType="📚 学术期刊"');
  assert.equal(app.run('sites.filter(matchesResourceBase).length'),3);
  assert.equal(app.run('matchesResourceBase(sites.find(s=>s.id==="cnki"))'),false);
  assert.equal(app.run('papersForPeriodical(sites.find(s=>s.id==="cnki")).length'),0);
});
test('periodical preset clears directory restrictions and restores them on return without changing module keys',()=>{
  const app=load();
  app.run('activeResourceType="🛠️ 学术工具";activeDirectionTag="释文";window.scrollY=360;openContentModule("resources",{resourceType:"📚 学术期刊",triggerSelector:"[data-open-periodicals]"})');app.flush();
  assert.equal(app.run('activeModule'),'resources');
  assert.equal(app.run('activeDirectionTag'),'');
  assert.equal(app.run('activeResourceType'),'📚 学术期刊');
  assert.equal(app.node('#resources-title').textContent,'学术期刊与集刊');
  assert.equal((app.node('#siteGrid').innerHTML.match(/data-periodical-id=/g)||[]).length,3);
  assert.match(app.node('#siteGrid').innerHTML,/本站暂未收录该刊论文/);
  app.run('returnFromContentModule()');app.flush();
  assert.equal(app.run('activeResourceType'),'🛠️ 学术工具');assert.equal(app.run('activeDirectionTag'),'释文');
  assert.equal(app.run('activeModule'),'');assert.equal(app.run('window.scrollY'),360);
});
test('external source purposes remain explicit and absent URLs produce no button',()=>{
  const app=load();
  for(const [type,label] of [['新论文','查看论文信息'],['新书','查看出版信息'],['学术会议','阅读原文']]){
    app.c.update={id:'sample',title:'题名',type,source:'机构',sourceUrl:'https://www.tsinghua.edu.cn/',date:'2026-11-03',summary:'公告',tags:[],historical:true};
    const html=app.run('updateCardTemplate(update)');assert.ok(html.includes(label));assert.match(html,/历史补录/);
    assert.match(html,/target="_blank" rel="noopener noreferrer"/);
    app.c.update.sourceUrl='';assert.doesNotMatch(app.run('updateCardTemplate(update)'),/<a |is-disabled|暂无原文/);
  }
  for(const url of ['',undefined,'TODO']){app.c.site={url};assert.equal(app.run('linkTemplate(site)'),'');}
});
test('sourceNote, IDs and administration fields do not leak into search',()=>{
  const app=load();
  for(const q of ['本轮用户确认','原 PDF','linyun-xianqin-pianpang','zhangjiashan-hanjian'])assert.equal(app.query(q).length,0,q);
  assert.equal(app.run('unifiedSearchCatalog.entries.some(e=>e.searchableText.includes("本轮用户确认"))'),false);
});

test('all 74 approved papers are searchable once by title and author, including papers without hubs',()=>{
  const app=load();
  for(const paper of app.c.window.classicPapers){
    for(const q of [paper.title,paper.author]){
      const hits=app.query(q).filter(e=>e.type==='paper'&&e.id===paper.id);
      assert.equal(hits.length,1,`${paper.id}: ${q}`);
      assert.equal(hits[0].source,paper);
    }
    const hub=app.c.window.researchHubs.find(h=>h.id===paper.hubIds[0]);
    if(hub)assert.ok(app.query(hub.title).some(e=>e.type==='paper'&&e.id===paper.id));
  }
  for(const q of ['批准候选','F21','原刊PDF'])assert.equal(app.query(q).length,0,q);
});

test('catalog-only papers remain in search by title, author and associated hub with access limits',()=>{
  const app=load();
  const catalogOnly=app.c.window.classicPapers.filter(p=>p.recommendationStatus==='catalog-only');assert.equal(catalogOnly.length,2);
  for(const paper of catalogOnly){
    const hub=app.c.window.researchHubs.find(h=>h.id===paper.hubIds[0]);
    for(const query of [paper.title,paper.author,hub.title])assert.equal(app.query(query).filter(e=>e.type==='paper'&&e.id===paper.id).length,1);
    app.c.entry=app.query(paper.title).find(e=>e.type==='paper'&&e.id===paper.id);
    const html=app.run('searchCardTemplate(entry)');assert.match(html,/补充题录/);assert.doesNotMatch(html,/classic-paper-access|题录已核|未核实无登录|非期刊PDF/);
    if(!paper.url)assert.doesNotMatch(html,/<a /);
  }
  for(const query of ['catalog-only','scan-pdf','accessChecked','2026-11-02'])assert.equal(app.query(query).filter(e=>e.type==='paper').length,0);
});

test('deterministic field ranking, identity deduplication and entity count',()=>{
  const app=load(), sources=emptySources();
  const base={institution:'',description:'',keywords:[]};
  sources.resource=[
    {...base,id:'body',name:'正文项',description:'检索词'},
    {...base,id:'tag',name:'标签项',keywords:['检索词']},
    {...base,id:'person',name:'机构项',institution:'检索词'},
    {...base,id:'alias',name:'别名项',aliases:['检索词']},
    {...base,id:'contains',name:'标题含检索词'},
    {...base,id:'exact',name:'检索词',description:'检索词',keywords:['检索词'],aliases:['检索词']}
  ];
  app.c.sources=sources;
  assert.deepEqual(plain(app.run('searchUnified("检索词",buildSearchCatalog(sources)).map(e=>e.id)')),['exact','contains','alias','person','tag','body']);
  app.input('张家山');
  const items=app.query('张家山');
  assert.equal(new Set(items.map(e=>e.type+e.id)).size,items.length);
  assert.match(app.node('#unifiedSearchResults').innerHTML,new RegExp(`找到 ${items.length} 项`));
});
test('bad references and malformed tags warn and preserve valid relations without mutating sources',()=>{
  const app=load(), sources=emptySources();
  sources.resource=[{id:'resource',name:'入口',keywords:[]}];
  sources.hub=[{id:'hub',title:'专题',category:'slips',status:'active',resourceIds:['resource','missing','resource'],bibliographyIds:[],relatedHubIds:['hub','missing'],updateTags:[]}];
  sources.paper=[{id:'paper',title:'论文',author:'作者',journal:'',year:'',note:'',featured:false,type:'经典论文',categories:['slips'],hubIds:['hub','missing']}];
  sources.update=[{id:'update',title:'动态',tags:'bad',relatedResources:['resource','入口','missing']}];
  app.c.sources=sources; const before=JSON.stringify(sources);
  const catalog=app.run('buildSearchCatalog(sources)');
  assert.ok(catalog.warnings.some(m=>m.includes('tags')));
  assert.ok(catalog.warnings.some(m=>m.includes('missing')));
  assert.equal(catalog.references.get('hub').resources.length,1);
  assert.equal(catalog.references.get('hub').hubs.length,0);
  assert.equal(catalog.relatedResources.get('update').length,1);
  assert.ok(app.run('searchUnified("专题",buildSearchCatalog(sources)).some(e=>e.type==="paper")'));
  assert.equal(JSON.stringify(sources),before);
});
test('duplicate/missing IDs, category errors and duplicate resource names are diagnosed',()=>{
  const app=load(),sources=emptySources();
  sources.resource=[null,{id:'one',name:'同名'},{id:'one',name:'重复ID'},{id:'two',name:'同名'}];
  sources.bibliography=[{id:'book',title:'书',categories:['invalid']}];
  sources.hub=[{id:'hub',title:'专题',category:'invalid',resourceIds:[],bibliographyIds:[],relatedHubIds:[],updateTags:[]}];
  app.c.sources=sources; const catalog=app.run('buildSearchCatalog(sources)');
  for(const fragment of ['稳定 id','重复 id','名称疑似重复','categories 不合法','category 不合法'])assert.ok(catalog.warnings.some(m=>m.includes(fragment)),fragment);
  assert.equal(catalog.resolveResource('同名'),null);
  assert.equal(catalog.resolveResource('one').id,'one');
});
test('all historical resource names resolve, ID takes priority over a name collision',()=>{
  const app=load();
  assert.equal(app.run('academicUpdatesData.every(u=>unifiedSearchCatalog.relatedResources.get(u.id).length===u.relatedResources.length)'),true);
  const sources=emptySources(); sources.resource=[{id:'key',name:'甲'},{id:'other',name:'key'}];app.c.sources=sources;
  assert.equal(app.run('buildSearchCatalog(sources).resolveResource("key").id'),'key');
});
test('group size limited to four; internal resource has an action and no fabricated link',()=>{
  const app=load();app.input('简牍');
  const html=app.node('#unifiedSearchResults').innerHTML;
  for(const type of ['hub','resource','bibliography','paper','update'])assert.ok((html.match(new RegExp(`data-search-type="${type}"`,'g'))||[]).length<=4);
  assert.match(html,/data-search-expand=/);
  app.input('学术公众号');assert.match(app.node('#unifiedSearchResults').innerHTML,/data-search-wechat/);
  assert.doesNotMatch(app.node('#unifiedSearchResults').innerHTML,/<a\b|undefined/);
});
test('query changes and result hub round trip preserve the original snapshot and scroll',()=>{
  const app=load();
  app.run('activateCategory("金文");activeUpdateView="topics";bibliographyExpanded=true;sitesExpanded=true;window.scrollY=480');
  app.input('张家山'); const snapshot=app.run('searchSession');
  assert.ok(app.query('张家山').some(e=>e.type==='hub'));
  app.input('甲骨');assert.equal(app.run('searchSession'),snapshot);
  app.run('openSearchHub("yinxu-oracle")');app.flush();
  app.run('dismissResearchHub(true)');app.flush();assert.equal(app.run('searchSession'),snapshot);
  app.input('');app.flush();
  assert.equal(app.run('activeCategory'),'金文');assert.equal(app.run('activeUpdateView'),'topics');
  assert.equal(app.run('bibliographyExpanded && sitesExpanded'),true);
  assert.equal(app.run('window.scrollY'),480);assert.equal(app.run('searchSession'),null);
});
test('search from a hub restores original hub, expansion set, return context and exact DOM',()=>{
  const app=load();app.run('activateCategory("🏺 汉代简牍");openResearchHub("zhangjiashan-hanjian");hubExpandedSections.add("updates");renderHubDetail()');app.flush();
  app.run('window.scrollY=630');const html=app.node('#hubDetail').innerHTML;const context=app.run('hubReturnContext');
  app.input('金文');app.run('openSearchHub("western-zhou-bronze")');app.flush();
  app.run('returnToSearchResults()');app.input('清华');app.input('');app.flush();
  assert.equal(app.run('activeHubId'),'zhangjiashan-hanjian');assert.equal(app.node('#hubDetail').innerHTML,html);
  assert.deepEqual(plain(app.run('hubReturnContext')),plain(context));assert.equal(app.run('hubExpandedSections.has("updates")'),true);
  assert.equal(app.run('window.scrollY'),630);assert.equal(app.node('#hubDetail').hidden,false);
});
test('empty query exits, empty results and hostile query render safely',()=>{
  const app=load();app.input('<script>不存在</script>');
  const html=app.node('#unifiedSearchResults').innerHTML;
  assert.match(html,/找到 0 项/);assert.match(html,/尝试使用研究对象/);assert.doesNotMatch(html,/<script>/);
  app.input('   ');assert.equal(app.node('#unifiedSearchResults').hidden,true);
});
test('Chinese category bridge, invalid result navigation and IME composition are safe',()=>{
  const app=load();
  assert.deepEqual(plain(app.run('hubCategories({category:"甲骨文",categories:["簡牘","invalid"]})')),['oracle','slips']);
  app.input('张家山');app.run('openSearchHub("missing")');
  assert.equal(app.node('#unifiedSearchResults').hidden,false);
  const snapshot=app.run('searchSession');
  app.node('#searchInput').listeners.compositionstart();app.input('');
  assert.equal(app.run('searchSession'),snapshot);
  app.node('#searchInput').value='清华';app.node('#searchInput').listeners.compositionend();
  assert.equal(app.run('searchQuery'),'清华');assert.equal(app.run('searchSession'),snapshot);
});
test('index scales to 500 resources and 100 hubs with no duplicate results',()=>{
  const app=load(),sources=emptySources();
  sources.resource=Array.from({length:500},(_,i)=>({id:`resource-${i}`,name:`规模样本 ${i}`,keywords:['规模'],description:'检索性能样本'}));
  sources.hub=Array.from({length:100},(_,i)=>({id:`hub-${i}`,title:`规模专题 ${i}`,category:'slips',status:'active',resourceIds:[`resource-${i}`],bibliographyIds:[],relatedHubIds:[],updateTags:[]}));
  app.c.sources=sources;
  assert.equal(app.run('searchUnified("规模",buildSearchCatalog(sources)).length'),600);
});
