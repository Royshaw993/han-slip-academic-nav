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
test('81 unique entities from all five sources, original source references and explicit index fields',()=>{
  const app=load();
  assert.deepEqual(plain(app.run('Object.fromEntries(Object.keys(searchTypeLabels).map(t=>[t,unifiedSearchCatalog.entries.filter(e=>e.type===t).length]))')),
    {hub:8,resource:41,bibliography:12,paper:1,update:19});
  assert.equal(app.run('new Set(unifiedSearchCatalog.entries.map(e=>e.type+":"+e.id)).size'),81);
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
  for(const [a,b] of [['帛书','帛書'],['简牍','簡牘'],['汉简','漢簡'],['青铜器铭文','青銅器銘文'],['张家山汉简','張家山漢簡'],['五一广场','五一廣場'],['清华简','清華簡']])
    assert.deepEqual(plain(app.query(a).map(e=>e.type+e.id)),plain(app.query(b).map(e=>e.type+e.id)),a);
  assert.equal(app.run('normalizeSearch("简历")'), '简历');
  assert.equal(app.run('searchCategoryCode("简历")'), '');
  assert.equal(app.run('searchCategoryCode("简帛")'), '');
});
test('sourceNote, IDs and administration fields do not leak into search',()=>{
  const app=load();
  for(const q of ['本轮用户确认','原 PDF','linyun-xianqin-pianpang','zhangjiashan-hanjian'])assert.equal(app.query(q).length,0,q);
  assert.equal(app.run('unifiedSearchCatalog.entries.some(e=>e.searchableText.includes("本轮用户确认"))'),false);
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
