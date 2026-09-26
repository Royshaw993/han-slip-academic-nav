// Run: node --test tests/test_research_hubs.cjs (no dependencies).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
function load() {
  const nodes = new Map(), warnings = [], frames = new Map();
  let frameId = 0;
  function node(selector) {
    if (!nodes.has(selector)) nodes.set(selector, {
      innerHTML: '', textContent: '', value: '', hidden: false, dataset: {}, listeners: {}, attributes: {},
      classList: { toggle() {} },
      get childElementCount() { return (this.innerHTML.match(/<article/g) || []).length; },
      addEventListener(type, fn) { this.listeners[type] = fn; },
      setAttribute(key, value) { this.attributes[key] = value; },
      querySelector() { return null; }, querySelectorAll() { return []; }, focus() {},
      getBoundingClientRect() { return { top: 500 }; }
    });
    return nodes.get(selector);
  }
  const c = vm.createContext({
    window: { scrollY: 0, scrollTo({top}) { this.scrollY = top; } },
    document: { querySelector: node, querySelectorAll: () => [] },
    console: { warn: message => warnings.push(message), info() {} },
    requestAnimationFrame(fn) { frames.set(++frameId, fn); return frameId; },
    cancelAnimationFrame(id) { frames.delete(id); }
  });
  for (const file of ['academic-updates.js', 'data/research-hubs.js', 'research-topics.js', 'data/core-bibliography.js', 'data/classic-papers.js', 'script.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), c, {filename:file});
  }
  return { c, node, warnings, run: code => vm.runInContext(code, c), flush() { for (const [id, fn] of frames) { frames.delete(id); fn(); } } };
}
const plain = value => JSON.parse(JSON.stringify(value));
test('eight unique hubs, valid schema and categories, reference-only records', () => {
  const {c, warnings} = load(), hubs = c.window.researchHubs;
  assert.equal(hubs.length, 8); assert.equal(new Set(hubs.map(h=>h.id)).size, 8);
  for (const h of hubs) {
    assert.match(h.id, /^[a-z][a-z0-9-]+$/);
    assert.ok(['oracle','bronze','stone','slips','silk'].includes(h.category));
    assert.ok(['active','preparing'].includes(h.status));
    for (const key of ['resourceIds','bibliographyIds','updateTags','relatedHubIds']) assert.ok(h[key].every(v=>typeof v==='string'));
    for (const key of ['url','author','publisher','resources','bibliography','updates']) assert.ok(!(key in h));
  }
  assert.deepEqual(warnings, []);
});
test('41 explicit unique persistent resource IDs', () => {
  const {run} = load(), sites = run('sites');
  assert.equal(sites.length,41); assert.equal(new Set(sites.map(s=>s.id)).size,41);
  sites.forEach(s=>assert.match(s.id,/^[a-z][a-z0-9-]+$/));
  const source = fs.readFileSync(path.join(root,'script.js'),'utf8').split('const categories =')[0];
  assert.equal((source.match(/\{ id:"/g)||[]).length,41);
  // Persistent keys are intentionally pinned independently of names/descriptions/URLs.
  const persistentIds = ['nwnu-jiandu','bsm','ihp-woodslip','guanlian-hanqing','xiaoxue','yinxu-oracle-database','ihp-oracle-rubbings','tsinghua-ctwx','wuhan-bamboo-silk-center','cnki','china-archaeology','cssn','google-scholar','jstor','cinii','brill','zotero','ctext','zdic','zi-tools','openalex','semantic-scholar','bnu-shuowen','bnu-hanzi','ytenx','ccl-corpus','xiaoxue-oracle','xiaoxue-oracle-sources','chant-oracle','xiaoxue-bronze','ihp-bronze','ihp-preqin-vocabulary','shangzhou-bronze-query','ihp-bronze-rubbings','zju-epitaphs','ihp-han-stone-rubbings','ihp-buddhist-stone-rubbings','ihp-liao-jin-yuan-rubbings','ihp-song-rubbings','bnu-inscriptions','academic-wechat'];
  assert.deepEqual(plain(sites.map(s=>s.id).sort()), persistentIds.sort());
});
test('resource identity survives renaming, description and URL edits', () => {
  const {run} = load();
  assert.equal(run(`(() => { const item=hubResourcesById.get('nwnu-jiandu'); item.name='新名称'; item.description='新描述'; item.url='https://example.test/new'; return resolveHubReferences(['nwnu-jiandu'],hubResourcesById,'resource')[0]===item; })()`),true);
});
for (const [field,index] of [['resourceIds','hubResourcesById'],['bibliographyIds','hubBooksById'],['relatedHubIds','hubsById']]) {
  test(`${field}: all references resolve, no duplicate or self references`,()=>{
    const {run,c}=load(), ids=run(index);
    c.window.researchHubs.forEach(h=>{
      assert.equal(new Set(h[field]).size,h[field].length);
      h[field].forEach(id=>{assert.ok(ids.has(id),id); if(field==='relatedHubIds')assert.notEqual(id,h.id);});
    });
  });
}
test('legacy API derives the original four IDs and topics from one source',()=>{
  const {c}=load();
  assert.deepEqual(plain(c.window.researchTopics.map(h=>h.id)),['xuanquan-hanjian','zhangjiashan-hanjian','zoumalou-western-han-slips','wuyi-eastern-han-slips']);
  for(const old of c.window.researchTopics){const hub=c.window.researchHubs.find(h=>h.id===old.id);assert.equal(old.title,hub.title);assert.deepEqual(old.topics,hub.updateTags);}
});
test('default homepage exposes only four slips hubs and expands to all five',()=>{
  const {run,node}=load();
  assert.equal(run(`hubsForCategory('全部').length`),5);
  assert.equal(run(`hubsForCategory('全部').every(h=>h.category==='slips')`),true);
  assert.equal(node('#researchTopics').childElementCount,4);
  assert.match(node('#hubsToggle').textContent,/（5）/);
  run('hubsExpanded=true; renderResearchTopics(); renderResearchTopics();');
  assert.equal(node('#researchTopics').childElementCount,5);
});
test('current category controls every list and the expansion count',()=>{
  const {run,node}=load();
  const cases=[['全部','slips',5],['🏺 汉代简牍','slips',5],['甲骨文','oracle',1],['金文','bronze',1],['帛书','silk',1],['石刻','stone',0]];
  for(const [category,code,expected] of cases) {
    run(`activeCategory=${JSON.stringify(category)};hubsExpanded=false;renderResearchTopics()`);
    const visible=run(`hubsForCategory(activeCategory).map(h=>h.id)`);
    assert.equal(visible.length,expected,category);
    assert.ok(visible.every(id=>run(`hubsById.get(${JSON.stringify(id)}).category===${JSON.stringify(code)}`)),category);
    assert.equal(node('#hubsToggle').hidden,expected<=4,category);
    if(expected>4)assert.match(node('#hubsToggle').textContent,/（5）/);
    if(category==='石刻')assert.match(node('#researchTopics').innerHTML,/当前暂无已整理的石刻研究专题/);
  }
});
test('the default slips list excludes oracle, bronze and silk hubs',()=>{
  const {run}=load();
  const ids=run(`hubsForCategory('全部').map(h=>h.id)`);
  assert.deepEqual(plain(ids),['zhangjiashan-hanjian','qinghua-slips','xuanquan-hanjian','zoumalou-western-han-slips','wuyi-eastern-han-slips']);
});
for(const [id,category] of [['zhangjiashan-hanjian','🏺 汉代简牍'],['qinghua-slips','🏺 汉代简牍'],['mawangdui-silk','帛书'],['yinxu-oracle','甲骨文'],['western-zhou-bronze','金文']]){
  test(`${id} appears only in its intended genre`,()=>{
    const {run}=load();
    for(const genre of ['甲骨文','金文','石刻','🏺 汉代简牍','帛书']) assert.equal(run(`hubsForCategory(${JSON.stringify(genre)}).some(h=>h.id===${JSON.stringify(id)})`),genre===category);
  });
}
test('stone empty state and preparing silk hub remain accessible',()=>{
  const {run,node}=load(); run(`activateCategory('石刻')`); assert.match(node('#researchTopics').innerHTML,/暂无已整理的石刻/);
  run(`activateCategory('帛书'); openResearchHub('mawangdui-silk')`);
  assert.match(node('#hubDetail').innerHTML,/核心资源整理中/);assert.match(node('#hubDetail').innerHTML,/核心书目整理中/);
  assert.doesNotMatch(node('#hubDetail').innerHTML,/楚帛书/);
});
test('precise existing update matches and newest-first ordering',()=>{
  const {run}=load();
  assert.deepEqual(plain(run(`updatesForHub(hubsById.get('zhangjiashan-hanjian')).map(u=>u.id)`)),['zhangjiashan-gushiqi-20250925','ruc-zhangjiashan-daozhi-2025']);
  assert.equal(run(`updatesForHub(hubsById.get('qinghua-slips')).length`),2);
  assert.equal(run(`updatesForHub({updateTags:['汉简','金文']}).some(u=>u.id==='ruc-zhangjiashan-daozhi-2025')`),false);
});
test('topics-only updates supported, substring/category matches excluded, IDs deduplicated',()=>{
  const {run}=load();
  run(`academicUpdatesData.push({id:'exact',topics:['测试专题'],date:'2026-01-01'},{id:'exact',tags:['测试专题'],date:'2026-01-01'},{id:'partial',tags:['测试专题附录'],category:'slips',date:'2026-01-01'},{id:'category',category:'slips',date:'2026-01-01'})`);
  assert.deepEqual(plain(run(`updatesForHub({category:'slips',updateTags:['测试专题']}).map(u=>u.id)`)),['exact']);
});
test('missing, malformed and duplicate reference lists do not crash detail',()=>{
  const {run,node,warnings}=load();
  run(`const bad=hubsById.get('mawangdui-silk');bad.resourceIds=['missing','nwnu-jiandu','nwnu-jiandu'];bad.bibliographyIds=['missing'];bad.relatedHubIds=['missing'];openResearchHub(bad.id);renderHubDetail()`);
  assert.equal((node('#hubDetail').innerHTML.match(/class="site-card"/g)||[]).length,1);
  assert.equal(warnings.length,3);
  run(`bad.resourceIds=null;bad.bibliographyIds={};bad.relatedHubIds=undefined;renderHubDetail()`);
  assert.match(node('#hubDetail').innerHTML,/当前暂无已收录的相关学术动态/);
});
test('related switching retains original context; return restores filters and scroll',()=>{
  const app=load();
  app.run(`activateCategory('🏺 汉代简牍');activeUpdateView='topics';activeUpdateType='新书';hubsExpanded=true;window.scrollY=730;openResearchHub('zhangjiashan-hanjian')`);app.flush();
  app.run(`openResearchHub('zoumalou-western-han-slips')`);app.flush();
  assert.equal(app.run('hubReturnContext.scrollY'),730);
  app.run('dismissResearchHub(true)');app.flush();
  assert.equal(app.run('window.scrollY'),730);assert.equal(app.run('activeUpdateType'),'新书');assert.equal(app.run('hubsExpanded'),true);assert.equal(app.run('activeCategory'),'🏺 汉代简牍');assert.equal(app.run('activeUpdateView'),'topics');
  assert.equal(app.node('#hubDetail').hidden,true);assert.equal(app.node('.updates-section').hidden,false);
});
test('home and top genre navigation exit detail without stale hidden sections',()=>{
  const {run,node}=load();run(`openResearchHub('qinghua-slips')`);assert.match(node('#hubDetail').innerHTML,/返回首页/);
  run(`activateCategory('金文')`);assert.equal(node('#hubDetail').hidden,true);assert.equal(node('#resourcesSection').hidden,false);
  run(`activateCategory('全部')`);assert.equal(node('#commonSection').hidden,false);
});
test('detail independent of list filters, content source updates reflected on render',()=>{
  const {run,node}=load();
  run(`activeUpdateType='新书';activeUpdateObject='悬泉汉简';searchInput.value='不存在';openResearchHub('zhangjiashan-hanjian')`);
  assert.equal((node('#hubDetail').innerHTML.match(/class="update-card"/g)||[]).length,2);
  run(`hubBooksById.get('zhangjiashan-hanmu-zhujian-247').title='书目修订测试';renderHubDetail()`);assert.match(node('#hubDetail').innerHTML,/书目修订测试/);
});
test('expansion caps sections at four; collapse and repeated render remain deterministic',()=>{
  const {run}=load();
  run(`const many=[1,2,3,4,5,6];`);
  assert.equal(run(`(hubSectionTemplate('resources','资源',many,x=>'<article></article>','').match(/<article>/g)||[]).length`),4);
  run(`hubExpandedSections.add('resources')`);
  assert.equal(run(`(hubSectionTemplate('resources','资源',many,x=>'<article></article>','').match(/<article>/g)||[]).length`),6);
});
test('new hub text is escaped and internal status keys never become UI labels',()=>{
  const {run}=load();
  const html=run(`hubCardTemplate({id:'test',title:'<script>bad</script>',category:'slips',status:'active',updateTags:[]})`);
  assert.match(html,/&lt;script&gt;/);assert.match(html,/简牍/);assert.doesNotMatch(html,/>slips</);
});
test('optional cross-category hubs and unavailable status are handled explicitly',()=>{
  const {run}=load();
  run(`hubsById.set('cross',{id:'cross',category:'slips',categories:['silk'],status:'active'});hubsById.set('draft',{id:'draft',category:'slips',status:'draft'})`);
  assert.equal(run(`hubsForCategory('帛书').some(h=>h.id==='cross')`),true);
  assert.equal(run(`hubsForCategory('🏺 汉代简牍').some(h=>h.id==='cross')`),true);
  assert.equal(run(`hubsForCategory('甲骨文').some(h=>h.id==='cross')`),false);
  assert.equal(run(`hubsForCategory('全部').some(h=>h.id==='draft')`),false);
});
test('a hub can link to a different-category related hub without changing list filters',()=>{
  const {run,node}=load();
  run(`hubsById.get('zhangjiashan-hanjian').relatedHubIds=['western-zhou-bronze'];openResearchHub('zhangjiashan-hanjian')`);
  assert.match(node('#hubDetail').innerHTML,/西周金文/);
  assert.equal(run(`hubsForCategory('全部').some(h=>h.id==='western-zhou-bronze')`),false);
  run(`openResearchHub('western-zhou-bronze')`);
  assert.equal(run('activeHubId'),'western-zhou-bronze');assert.equal(run("hubReturnContext.category"),'全部');
});
test('duplicate or missing hub IDs are isolated and invalid navigation leaves current detail intact',()=>{
  const {run,node,warnings}=load();
  assert.equal(run(`hubIndex([null,{id:'same'},{id:'same'}],'hub').size`),1);
  run(`openResearchHub('qinghua-slips');openResearchHub('missing')`);
  assert.match(node('#hubDetail').innerHTML,/清华简/);assert.equal(warnings.length,3);
});
